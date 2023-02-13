import { spawnSync } from "child_process";
import { ProcessExecution, Task, TaskGroup, tasks, TaskScope, window } from "vscode";
import { Configuration } from "./configuration";
import { FileType } from "./enums/file-type";
import { File } from "./models/file";
import { outputChannel } from "./output-channel";
import { promptCompiler, promptFlags } from "./utils/prompt-utils";
import { commandExists, isProccessRunning } from "./utils/common-utils";
import { Result } from "./enums/result";
import { isStringNullOrWhiteSpace } from "./utils/string-utils";
import { Notification } from "./notification";
import * as fse from "fs-extra";
import path = require("path");

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

        let outputLocation = Configuration.outputLocation();
        if (!outputLocation) {
            outputLocation = path.join(this.file.directory, "output");
        }

        if (!fse.existsSync(outputLocation)) {
            fse.mkdirSync(outputLocation);
        }

        let compilerArgs = [this.file.name, "-o", path.join(outputLocation, this.file.executable)];

        if (this.inputFlags) {
            compilerArgs = compilerArgs.concat(this.inputFlags.split(" "));
        }

        let execution = new ProcessExecution(
            this.compiler,
            compilerArgs,
            { cwd: this.file.directory }
        );

        const definition = {
            type: "Compile"
        };

        const problemMatcher = ['$gcc'];

        const task = new Task(
            definition,
            TaskScope.Workspace,
            "C/C++ Compile Run: Compile",
            "C/C++ Compile Run",
            execution,
            problemMatcher
        );

        await tasks.executeTask(task);

        tasks.onDidEndTaskProcess(async e => {
            outputChannel.appendLine(`${e.execution.task.name}: ${e.exitCode}`);

            if (e.exitCode === 0) {
                Notification.showInformationMessage("Compiled successfully!");

                if (runCallback){
                    await runCallback();
                }
            } else {
                outputChannel.show();

                Notification.showErrorMessage("Error compiling!");
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
