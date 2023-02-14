import { exec } from "child_process";
import { existsSync } from "fs";
import { lookpath } from "lookpath";
import { File } from "./models/file";
import { terminal, getRunPrefix } from "./terminal";
import { promptRunArguments } from "./utils/prompt-utils";
import { escapeStringAppleScript, isStringNullOrWhiteSpace } from "./utils/string-utils";
import { Configuration } from "./configuration";
import { Notification } from "./notification";
import path = require("path");

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

        let outputLocation = Configuration.outputLocation();
        if (!outputLocation) {
            outputLocation = path.join(this.file.directory, "output");
        }

        let customPrefix = Configuration.customRunPrefix();

        const runCommand = this.buildRunCommand(this.file.executable, args, customPrefix);

        if (shouldRunInExternalTerminal) {
            const command = await this.getExternalCommand(runCommand, outputLocation);
            if (isStringNullOrWhiteSpace(command)) {
                return;
            }

            exec(command, { cwd: outputLocation });
        }
        else {
            await terminal.runInTerminal(runCommand, { name: "C/C++ Compile Run", cwd: outputLocation });
        }
    }

    private async getExternalCommand(runCommand: string, outputLocation: string): Promise<string> {
        switch (process.platform) {
            case "win32":
                const winTerminal: string = Configuration.winTerminal();
                switch (winTerminal) {
                    case "pwsh.exe":
                    case "powershell.exe":
                        return `start ${winTerminal} -Command "Set-Location ${outputLocation};${runCommand};Write-Host;Write-Host -NoNewLine 'Press any key to continue...';$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown');"`;
                    default:
                        return `start cmd /c "cd "${outputLocation}" & ${runCommand} & echo. & pause"`;
                }

            case "darwin":
                const osxTerminal: string = Configuration.osxTerminal();
                switch (osxTerminal) {
                    case "iTerm.app":
                        return "osascript -e 'tell application \"iTerm\"' "
                            + "-e 'set newWindow to (create window with default profile)' "
                            + "-e 'tell current session of newWindow' "
                            + `-e 'write text "cd ${outputLocation}"' `
                            + `-e 'write text "${escapeStringAppleScript(runCommand)}"' `
                            + "-e 'end tell' "
                            + "-e 'end tell' ";
                    default:
                        return `osascript -e 'do shell script "open -a Terminal " & "${outputLocation}"' -e 'delay 0.3' -e `
                            + `'tell application "Terminal" to do script ("${escapeStringAppleScript(runCommand)}") in first window'`;
                }

            case "linux":
                const linuxTerminal: string = Configuration.linuxTerminal();

                if (isStringNullOrWhiteSpace(linuxTerminal)
                    || isStringNullOrWhiteSpace(await lookpath(linuxTerminal))) {
                    Notification.showErrorMessage(`${terminal} not found! Try to enter a valid terminal in 'terminal.external.linuxExec' `
                        + "settings!(gnome - terminal, xterm, konsole)");

                    return null;
                }

                switch (linuxTerminal) {
                    case "xterm":
                        return `${linuxTerminal} -T '${this.file.title}' -e '${runCommand}; echo; read -n1 -p \"Press any key to continue...\"'`;
                    case "gnome-terminal":
                    case "tilix":
                    case "mate-terminal":
                        return `${linuxTerminal} -t '${this.file.title}' -x bash -c '${runCommand}; echo; read -n1 -p \"Press any key to continue...\"'`;
                    case "xfce4-terminal":
                        return `${linuxTerminal} --title '${this.file.title}' -x bash -c '${runCommand}; echo; read -n1 -p \"Press any key to continue...\"'`;
                    case "konsole":
                        return `${linuxTerminal} -p tabtitle='${this.file.title}' --noclose -e bash -c '${runCommand}; echo;'`;
                    case "io.elementary.terminal":
                        return `${linuxTerminal} -n -w '${outputLocation}' -x '${runCommand}'`;
                    default:
                        Notification.showErrorMessage(`${linuxTerminal} isn't supported! Try to enter a supported terminal in `
                            + "'terminal.external.linuxExec' settings! (gnome-terminal, xterm, konsole)");

                        return null;
                }
            default:
                Notification.showErrorMessage("Unsupported platform!");

                return null;
        }
    }

    buildRunCommand(executable: string, args: string, customPrefix: string) {
        const winTerminal: string = Configuration.winTerminal();

        const prefix = process.platform === "win32" && winTerminal !== "powershell.exe" && winTerminal !== "pwsh.exe" ? ".\\": "./";
        
        if (customPrefix) {
            return `${customPrefix} ${prefix}"${executable}" ${args}`.trim();
        }

        return `${prefix}\"${executable}\" ${args}`.trim();
    }
}
