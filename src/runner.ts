import { existsSync } from "fs";
import { commands, window, workspace } from "vscode";
import { Configuration } from "./configuration";
import { ShellType } from "./enums/shell-type";
import { File } from "./models/file";
import { Notification } from "./notification";
import { terminal } from "./terminal";
import { promptRunArguments } from "./utils/prompt-utils";
import { currentShell, getPath, getRunPrefix, parseShell } from "./utils/shell-utils";
import { basename } from "path";
import { externalTerminal } from "./external-terminal";
import { getOutputLocation } from "./utils/file-utils";
import isWsl from "is-wsl";
import { ensureWorkspaceIsTrusted } from "./utils/workspace-utils";

export class Runner {
    private file: File;
    private shouldAskForArgs: boolean;

    constructor(file: File, shouldAskForArgs = false) {
        this.file = file;
        this.shouldAskForArgs = shouldAskForArgs;
    }

    async run(shouldRunInExternalTerminal = false): Promise<void> {
        if (!await ensureWorkspaceIsTrusted("run")) { return; }

        if (!existsSync(this.file.path)) {
            Notification.showErrorMessage(`Source file "${this.file.path}" does not exist.`);
            return;
        }

        let args = Configuration.runArgs();
        if (this.shouldAskForArgs) {
            args = await promptRunArguments(args);
        }

        const outputLocation = getOutputLocation(false, this.file.directory);
        const customPrefix = Configuration.customRunPrefix();
        const shell = this.getShell(shouldRunInExternalTerminal);
        const parsedExecutable = await getPath(this.file.executable, shell);
        const runCommand = this.getRunCommand(parsedExecutable, args, customPrefix, shell);

        if (shouldRunInExternalTerminal && isWsl) {
            Notification.showWarningMessage("WSL detected. Running in VS Code integrated terminal instead of an external terminal.");
            shouldRunInExternalTerminal = false;
        }

        if (shouldRunInExternalTerminal) {
            await externalTerminal.runInExternalTerminal(runCommand, outputLocation, shell);
        } else {
            await terminal.runInTerminal(runCommand, { name: "C/C++ Compile Run", cwd: outputLocation });
        }
    }

    getRunCommand(executable: string, args: string, customPrefix: string, shell: ShellType) {
        const prefix = getRunPrefix(shell);

        if (customPrefix) {
            return [customPrefix, " ", prefix, executable, " ", args].join("").trim();
        }

        return [prefix, executable, " ", args].join("").trim();
    }

    getShell(runInExternalTerminal: boolean): ShellType {
        if (runInExternalTerminal) {
            if (process.platform === "win32") {
                    const terminal = basename(Configuration.winTerminal());
                    const shell = parseShell(terminal);
                    return shell === ShellType.powerShell ? ShellType.powerShell : ShellType.cmd;
            }
            return ShellType.others;
        }
        return currentShell();
    }
}