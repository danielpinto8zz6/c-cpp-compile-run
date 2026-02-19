import { ProcessExecution, Task, tasks, TaskScope, window } from "vscode";
import { Configuration } from "./configuration";
import { FileType } from "./enums/file-type";
import { File } from "./models/file";
import { promptCompiler, promptFlags } from "./utils/prompt-utils";
import { commandExists, isProcessRunning } from "./utils/common-utils";
import { Result } from "./enums/result";
import { isStringNullOrWhiteSpace, splitArgs } from "./utils/string-utils";
import { Notification } from "./notification";
import path = require("path");
import { getOutputLocation } from "./utils/file-utils";
import { existsSync, statSync } from "fs";
import { ensureWorkspaceIsTrusted } from "./utils/workspace-utils";

export class Compiler {
    private file: File;
    private compiler?: string;
    private inputFlags?: string;
    private linkerFlags?: string;
    private shouldAskForInputFlags: boolean;

    constructor(file: File, shouldAskForInputFlags: boolean = false) {
        this.file = file;
        this.shouldAskForInputFlags = shouldAskForInputFlags;
    }

    async compile(runCallback: (() => Promise<void>) | null = null): Promise<void> {
        if (!await ensureWorkspaceIsTrusted("compile")) { return; }

        if (this.setCompiler() === Result.error) { return; }

        if (Configuration.saveBeforeCompile()) {
            await window.activeTextEditor?.document.save();
        }

        if (await isProcessRunning(this.file.executable)) {
            Notification.showErrorMessage(
                `The program "${this.file.executable}" is already running. Please close it before compiling again.`
            );
            return;
        }

        if (!await this.isCompilerValid(this.compiler)) {
            await this.compilerNotFound();
            return;
        }

        if (this.shouldAskForInputFlags) {
            const flags = await promptFlags(this.inputFlags);
            if (!isStringNullOrWhiteSpace(flags)) {
                this.inputFlags = flags;
            }
        }

        const outputLocation = getOutputLocation(true, this.file.directory);
        const outputPath = path.join(outputLocation, this.file.executable);

        // --- Up-to-date check ---
        if (existsSync(outputPath)) {
            try {
                const exeStat = statSync(outputPath);
                const srcStat = statSync(this.file.path);
                if (exeStat.mtimeMs >= srcStat.mtimeMs) {
                    Notification.showInformationMessage("Executable is up-to-date. Skipping compilation.");
                    if (runCallback) { await runCallback(); }
                    return;
                }
            } catch (err) {
                // If stat fails, fall through to compile
            }
        }

        const includePaths = [
            ...Configuration.additionalIncludePaths(),
            ...Configuration.includePathsFromCppProperties()
        ];
        const includeFlags = includePaths.flatMap(dir => ["-I", dir]);

        let compilerArgs = [
            ...splitArgs(this.inputFlags),
            ...includeFlags,
            this.file.path,
            "-o",
            outputPath,
            ...splitArgs(this.linkerFlags)
        ].filter(Boolean);

        const processExecution = new ProcessExecution(
            this.compiler!,
            compilerArgs,
            { cwd: this.file.directory }
        );

        const task = new Task(
            { type: "process" },
            TaskScope.Workspace,
            "C/C++ Compile Run: Compile",
            "C/C++ Compile Run",
            processExecution,
            ["$gcc"]
        );

        const execution = await tasks.executeTask(task);

        const endListener = tasks.onDidEndTaskProcess(async e => {
            if (e.execution === execution) {
                endListener.dispose();
                if (e.exitCode === 0) {
                    Notification.showInformationMessage("Compilation successful.");
                    if (runCallback) { await runCallback(); }
                } else {
                    Notification.showErrorMessage("Compilation failed. Please check the output for errors.");
                }
            }
        });
    }

    setCompiler(): Result {
        switch (this.file.type) {
            case FileType.c:
                this.compiler = Configuration.cCompiler();
                this.inputFlags = Configuration.cFlags();
                this.linkerFlags = Configuration.cLinkerFlags();
                return Result.success;
            case FileType.cplusplus:
                this.compiler = Configuration.cppCompiler();
                this.inputFlags = Configuration.cppFlags();
                this.linkerFlags = Configuration.cppLinkerFlags();
                return Result.success;
            default:
                Notification.showErrorMessage("Unsupported file type. Only C and C++ files are supported.");
                return Result.error;
        }
    }

    async isCompilerValid(compiler?: string): Promise<boolean> {
        return !isStringNullOrWhiteSpace(compiler) && await commandExists(compiler);
    }

    async compilerNotFound(): Promise<void> {
        const CHANGE_PATH = "Change compiler path";
        const choice = await window.showErrorMessage(
            "Compiler executable not found. Would you like to update the compiler path in settings?",
            CHANGE_PATH
        );
        if (choice === CHANGE_PATH) {
            this.compiler = await promptCompiler();
            if (await this.isCompilerValid(this.compiler)) {
                await Configuration.setCompiler(this.compiler, this.file.type);
            } else {
                Notification.showErrorMessage("The specified compiler was not found. Please check the path and try again.");
            }
        } else {
            Notification.showErrorMessage("Compiler is not set. Compilation aborted.");
        }
    }
}