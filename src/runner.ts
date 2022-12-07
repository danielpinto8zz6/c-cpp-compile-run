import { exec } from "child_process";
import { existsSync } from "fs";
import { lookpath } from "lookpath";
import { File } from "./models/file";
import { terminal, getRunPrefix } from "./terminal";
import { promptRunArguments } from "./utils/prompt-utils";
import { Result } from "./enums/result";
import { isStringNullOrWhiteSpace } from "./utils/string-utils";
import { Configuration } from "./configuration";
import { Notification } from "./notification";

export class Runner {
    private file: File;
    private arguments: string;
    private shouldAskForArgs: boolean;

    constructor(file: File, shouldAskForArgs = false) {
        this.file = file;
        this.shouldAskForArgs = shouldAskForArgs;
    }

    async run(shouldRunInExternalTerminal = false): Promise<Result> {
        if (!existsSync(this.file.path)) {
            Notification.showErrorMessage(`"${this.file.path}" doesn't exists!`);

            return Result.error;
        }

        this.arguments = Configuration.runArgs();
        if (this.shouldAskForArgs) {
            this.arguments = await promptRunArguments(this.arguments);
        }

        let outputLocation = Configuration.outputLocation();
        if (!outputLocation) {
            outputLocation = this.file.directory;
        }

        if (shouldRunInExternalTerminal) {
            const command = await this.getExternalCommand();
            if (isStringNullOrWhiteSpace(command)) {
                return Result.error;
            }

            exec(command, { cwd: outputLocation });
        }
        else {
            await terminal.runInTerminal(`${getRunPrefix()}"${this.file.executable}" ${this.arguments}`,
                { name: "C/C++ Compile Run", cwd: outputLocation });
        }

        return Result.success;
    }

    private async getExternalCommand(): Promise<string> {
        switch (process.platform) {
            case "win32":
                return `start cmd /c ".\\\"${this.file.executable}\" ${this.arguments} & echo. & pause"`;

            case "darwin":
                const osxTerminal: string = Configuration.osxTerminal();
                switch (osxTerminal){
        
                    case "iTerm.app":
                        return `osascript -e 'tell application "iTerm"' `
                        + `-e 'set newWindow to (create window with default profile)' `
                        + `-e 'tell current session of newWindow' ` 
                        + `-e 'write text "cd ${this.file.directory}"' `
                        + `-e 'write text "./${this.file.executable}"' `
                        + `-e 'end tell' `
                        + `-e 'end tell' `;
                    default:
                        return `osascript -e 'do shell script "open -a Terminal " & "${this.file.directory}"' -e 'delay 0.3' -e `
                         + `'tell application "Terminal" to do script ("./" & "${this.file.executable}") in first window'`;
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
                        return `${linuxTerminal} -T ${this.file.title} -e './"${this.file.executable}" ${this.arguments}; `
                            + "echo; read -n1 -p \"Press any key to continue...\"'";
                    case "gnome-terminal":
                    case "tilix":
                    case "mate-terminal":
                        return `${linuxTerminal} -t ${this.file.title} -x bash -c './"${this.file.executable}" ${this.arguments}; `
                            + "echo; read -n1 -p \"Press any key to continue...\"'";
                    case "xfce4-terminal":
                        return `${linuxTerminal} --title ${this.file.title} -x bash -c './"${this.file.executable}" ${this.arguments}; `
                            + "read -n1 -p \"Press any key to continue...\"'";
                    case "konsole":
                        return `${linuxTerminal} -p tabtitle='${this.file.title}' --noclose -e bash -c './"${this.file.executable}" `
                            + `${this.arguments}'`;
                    case "io.elementary.terminal":
                        return `${linuxTerminal} -e './"${this.file.executable}" ${this.arguments}'`;
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
