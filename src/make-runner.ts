import { ProcessExecution, Task, tasks, TaskScope, window, workspace } from "vscode";
import { Configuration } from "./configuration";
import { File } from "./models/file";
import { Runner } from "./runner";
import { commandExists } from "./utils/common-utils";
import { isStringNullOrWhiteSpace } from "./utils/string-utils";
import { Notification } from "./notification";
import { terminal } from "./terminal";
import { getCommand, currentShell } from "./utils/shell-utils";
import { existsSync } from "fs";
import { join } from "path";

export class MakeRunner {
    private file: File;

    constructor(file: File) {
        this.file = file;
    }

    async build(runCallback: (() => Promise<void>) | null = null): Promise<void> {
        const makePath = Configuration.makePath();

        if (!await this.isMakeValid(makePath)) {
            Notification.showErrorMessage(
                `Make executable not found at "${makePath}". Please check the make-path setting.`
            );
            return;
        }

        if (Configuration.saveBeforeCompile()) {
            await window.activeTextEditor?.document.save();
        }

        const buildTarget = Configuration.makeBuildTarget();
        const makeArgs = buildTarget ? [buildTarget] : [];
        const cwd = this.getMakeDirectory();

        const processExecution = new ProcessExecution(
            makePath,
            makeArgs,
            { cwd }
        );

        const task = new Task(
            { type: "process" },
            TaskScope.Workspace,
            "C/C++ Compile Run: Make Build",
            "C/C++ Compile Run",
            processExecution,
            ["$gcc"]
        );

        const executionPromise = tasks.executeTask(task);

        const endListener = tasks.onDidEndTaskProcess(async e => {
            const execution = await executionPromise;
            if (e.execution === execution) {
                endListener.dispose();
                if (e.exitCode === 0) {
                    Notification.showInformationMessage("Make build successful.");
                    if (runCallback) { await runCallback(); }
                } else {
                    Notification.showErrorMessage("Make build failed. Please check the output for errors.");
                }
            }
        });

        await executionPromise;
    }

    async run(shouldRunInExternalTerminal = false): Promise<void> {
        const runTarget = Configuration.makeRunTarget();

        if (runTarget) {
            const makePath = Configuration.makePath();

            if (!await this.isMakeValid(makePath)) {
                Notification.showErrorMessage(
                    `Make executable not found at "${makePath}". Please check the make-path setting.`
                );
                return;
            }

            const cwd = this.getMakeDirectory();
            const shell = currentShell();
            const makeCommand = getCommand(`${makePath} ${runTarget}`, shell);

            await terminal.runInTerminal(makeCommand, {
                name: "C/C++ Compile Run",
                cwd
            });
        } else {
            const runner = new Runner(this.file);
            await runner.run(shouldRunInExternalTerminal);
        }
    }

    async isMakeValid(makePath: string): Promise<boolean> {
        return !isStringNullOrWhiteSpace(makePath) && await commandExists(makePath);
    }

    private getMakeDirectory(): string {
        // Prefer the file's own directory if it contains a Makefile
        if (existsSync(join(this.file.directory, "Makefile")) ||
            existsSync(join(this.file.directory, "makefile"))) {
            return this.file.directory;
        }
        return workspace.workspaceFolders?.[0]?.uri.fsPath ?? this.file.directory;
    }
}
