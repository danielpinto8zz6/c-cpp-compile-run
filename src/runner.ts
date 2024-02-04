import { existsSync } from "fs";
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
import isWsl = require("is-wsl");

export class Runner {
    private file: File;
    private shouldAskForArgs: boolean;

    constructor(file: File, shouldAskForArgs = false) {
        this.file = file;
        this.shouldAskForArgs = shouldAskForArgs;
    }

    async run(shouldRunInExternalTerminal = false): Promise<void> {
        if (!existsSync(this.file.path)) {
            Notification.showErrorMessage(`"${this.file.path}" doesn't exists!`);

            return;
        }

        let args = Configuration.runArgs();
        if (this.shouldAskForArgs) {
            args = await promptRunArguments(args);
        }

        const outputLocation = getOutputLocation(this.file);

        let customPrefix = Configuration.customRunPrefix();

        const shell = this.getShell(shouldRunInExternalTerminal);

        const parsedExecutable = await getPath(this.file.executable, shell);

        const runCommand = this.getRunCommand(parsedExecutable, args, customPrefix, shell);

        if (shouldRunInExternalTerminal === true && isWsl){
            Notification.showWarningMessage("Wsl detected, running in vscode terminal!");

            shouldRunInExternalTerminal = false;
        }

        if (shouldRunInExternalTerminal) {
            await externalTerminal.runInExternalTerminal(runCommand, outputLocation, shell);
        }
        else {
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
            switch (process.platform) {
                case "win32":
                    const terminal = basename(Configuration.winTerminal());
                    const shell = parseShell(terminal);
                    return shell === ShellType.powerShell ? ShellType.powerShell : ShellType.cmd;
                default:
                    return ShellType.others;
            }
        } else {
            return currentShell();
        }
    }
}


