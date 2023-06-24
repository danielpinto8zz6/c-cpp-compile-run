import { ProcessExecution, Task, tasks, TaskScope, window } from "vscode";
import { Configuration } from "./configuration";
import { FileType } from "./enums/file-type";
import { File } from "./models/file";
import { promptCompiler, promptFlags } from "./utils/prompt-utils";
import { commandExists, isProccessRunning } from "./utils/common-utils";
import { Result } from "./enums/result";
import { isStringNullOrWhiteSpace } from "./utils/string-utils";
import { Notification } from "./notification";
import path = require("path");
import { getOutputLocation } from "./utils/file-utils";

export class Compiler {
    private file: File;
    private compiler?: string;
    private inputFlags?: string;
    private shouldAskForInputFlags: boolean;

    constructor(file: File, shouldAskForInputFlags: boolean = false) {
        this.file = file;
        this.shouldAskForInputFlags = shouldAskForInputFlags;
    }

    async compile(runCallback: () => Promise<void> = null): Promise<void> {
        const setCompilerResult = this.setCompiler();
        if (setCompilerResult === Result.error) {
            return;
        }

        if (Configuration.saveBeforeCompile()) {
            await window.activeTextEditor?.document.save();
        }

        if (await isProccessRunning(this.file.executable)) {
            Notification.showErrorMessage(`${this.file.executable} is already running! Please close it first to compile successfully!`);

            return;
        }

        if (!this.isCompilerValid(this.compiler)) {
            await this.compilerNotFound();

            return;
        }

        if (this.shouldAskForInputFlags) {
            const flags = await promptFlags(this.inputFlags);
            if (!isStringNullOrWhiteSpace(flags)) {
                this.inputFlags = flags;
            }
        }

        const outputLocation = getOutputLocation(this.file, true);

        let compilerArgs = [this.file.name, "-o", path.join(outputLocation, this.file.executable)];

        if (this.inputFlags) {
            compilerArgs = this.inputFlags.split(" ").concat(compilerArgs);
        }

        let processExecution = new ProcessExecution(
            this.compiler,
            compilerArgs,
            { cwd: this.file.directory }
        );

        const definition = {
            type: "Compile"
        };

        const problemMatcher = ["$gcc"];

        const task = new Task(
            definition,
            TaskScope.Workspace,
            "C/C++ Compile Run: Compile",
            "C/C++ Compile Run",
            processExecution,
            problemMatcher
        );

        var execution = await tasks.executeTask(task);

        tasks.onDidEndTaskProcess(async e => {
            if (e.execution === execution) {
                if (e.exitCode === 0) {
                    Notification.showInformationMessage("Compiled successfully!");

                    if (runCallback) {
                        await runCallback();
                    }
                } else {
                    Notification.showErrorMessage("Error compiling!");
                }
            }
        });
    }

    setCompiler(): Result {
        switch (this.file.type) {
            case FileType.c: {
                this.compiler = Configuration.cCompiler();
                this.inputFlags = Configuration.cFlags();

                return Result.success;
            }
            case FileType.cplusplus: {
                this.compiler = Configuration.cppCompiler();
                this.inputFlags = Configuration.cppFlags();

                return Result.success;
            }
            default: {
                Notification.showErrorMessage("Invalid File!");

                return Result.error;
            }
        }
    }

    async isCompilerValid(compiler?: string): Promise<boolean> {
        return !isStringNullOrWhiteSpace(compiler) && await commandExists(compiler);
    }

    async compilerNotFound() {
        const CHANGE_PATH = "Change path";
        const choiceForDetails = await window.showErrorMessage("Compiler not found, try to change path in settings!", CHANGE_PATH);
        if (choiceForDetails === CHANGE_PATH) {
            this.compiler = await promptCompiler();

            if (await this.isCompilerValid(this.compiler)) {
                await Configuration.setCompiler(this.compiler, this.file.type);
            } else {
                Notification.showErrorMessage("Compiler not found!");
            }
        } else {
            Notification.showErrorMessage("Compiler not set!");
        }
    }
}
