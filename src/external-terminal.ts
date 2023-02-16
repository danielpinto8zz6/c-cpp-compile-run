import { exec } from "child_process";
import { lookpath } from "lookpath";
import { Configuration } from "./configuration";
import { ShellType } from "./enums/shell-type";
import { Notification } from "./notification";
import { terminal } from "./terminal";
import { getPath } from "./utils/shell-utils";
import { escapeStringAppleScript, isStringNullOrWhiteSpace } from "./utils/string-utils";

class ExternalTerminal {
    public async runInExternalTerminal(command: string, cwd: string, shell: ShellType) {
        const parsedOutputLocation = await getPath(cwd, shell);

        const externalCommand = await this.getExternalCommand(command, parsedOutputLocation, shell);
        if (isStringNullOrWhiteSpace(externalCommand)) {
            return;
        }

        exec(externalCommand, { cwd: cwd });
    }

    private async getExternalCommand(runCommand: string, outputLocation: string, shell: ShellType): Promise<string> {
        switch (process.platform) {
            case "win32":
                switch (shell) {
                    case ShellType.powerShell:
                        const winTerminal: string = Configuration.winTerminal();
                        return `start ${winTerminal} -Command "cd ${outputLocation};${runCommand};Write-Host;Write-Host -NoNewLine 'Press any key to continue...';$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown');"`;
                    default:
                        return `start cmd /c "cd ${outputLocation} & ${runCommand} & echo. & pause"`;
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
                        return `${linuxTerminal} -T 'C/C++ Compile Run' -e '${runCommand}; echo; read -n1 -p \"Press any key to continue...\"'`;
                    case "gnome-terminal":
                    case "tilix":
                    case "mate-terminal":
                        return `${linuxTerminal} -t 'C/C++ Compile Run' -x bash -c '${runCommand}; echo; read -n1 -p \"Press any key to continue...\"'`;
                    case "xfce4-terminal":
                        return `${linuxTerminal} --title 'C/C++ Compile Run' -x bash -c '${runCommand}; echo; read -n1 -p \"Press any key to continue...\"'`;
                    case "konsole":
                        return `${linuxTerminal} -p tabtitle='C/C++ Compile Run' --noclose -e bash -c '${runCommand}; echo;'`;
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
}

export const externalTerminal: ExternalTerminal = new ExternalTerminal();
