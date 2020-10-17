import { exec } from 'child_process';
import { existsSync } from 'fs';
import { lookpath } from 'lookpath';
import { Configuration } from './configuration';
import { File } from './models/file';
import { terminal, getRunPrefix } from './terminal';
import { promptRunArguments } from './utils/prompt-utils';
import { Result } from './enums/result';
import { window } from 'vscode';
import { isStringNullOrWhiteSpace } from './utils/string-utils';

export class Runner {
    private file: File;
    private arguments: string | undefined;
    private shouldAskForArgs: boolean;

    constructor(file: File, shouldAskForArgs = false) {
        this.file = file;
        this.shouldAskForArgs = shouldAskForArgs;
    }

    async run(): Promise<Result> {
        if (!existsSync(this.file.path)) {
            window.showErrorMessage(`"${this.file.path}" doesn't exists!`);

            return Result.error;
        }

        this.arguments = Configuration.runArgs();
        if (this.shouldAskForArgs) {
            this.arguments = await promptRunArguments(this.arguments);
        }

        if (Configuration.runInExternalTerminal()) {
            const command = await this.getExternalCommand() as string;
            if (isStringNullOrWhiteSpace(command)) {
                return Result.error;
            }

            exec(command as string, { cwd: this.file.directory });
        }
        else {
            await terminal.runInTerminal(`${getRunPrefix()}"${this.file.executable}" ${this.arguments}`,
                { name: 'C/C++ Compile Run', cwd: this.file.directory });
        }

        return Result.success;
    }

    private async getExternalCommand(): Promise<string | undefined> {
        switch (process.platform) {
            case 'win32':
                return `start cmd /c ".\\\"${this.file.executable}\" ${this.arguments} & echo. & pause"`;

            case 'darwin':
                return `osascript -e 'do shell script "open -a Terminal " & "${this.file.directory}"' -e 'delay 0.3' -e `
                    + `'tell application "Terminal" to do script ("./" & "${this.file.executable}") in first window'`;

            case 'linux':
                const linuxTerminal: string = Configuration.linuxTerminal() as string;

                if (isStringNullOrWhiteSpace(linuxTerminal)
                    || isStringNullOrWhiteSpace(await lookpath(linuxTerminal))) {
                    window.showErrorMessage(`${terminal} not found! Try to enter a valid terminal in 'terminal.external.linuxExec' `
                        + `settings!(gnome - terminal, xterm, konsole)`);

                    return undefined;
                }

                switch (linuxTerminal) {
                    case 'xterm':
                        return `${linuxTerminal} -T ${this.file.title} -e './"${this.file.executable}" ${this.arguments}; `
                            + `echo; read -n1 -p "Press any key to continue..."'`;
                    case 'gnome-terminal':
                    case 'tilix':
                    case 'mate-terminal':
                        return `${linuxTerminal} -t ${this.file.title} -x bash -c './"${this.file.executable}" ${this.arguments}; `
                            + `echo; read -n1 -p "Press any key to continue..."'`;
                    case 'xfce4-terminal':
                        return `${linuxTerminal} --title ${this.file.title} -x bash -c './"${this.file.executable}" ${this.arguments}; `
                            + `read -n1 -p "Press any key to continue..."'`;
                    case 'konsole':
                        return `${linuxTerminal} -p tabtitle='${this.file.title}' --noclose -e bash -c './"${this.file.executable}" `
                            + `${this.arguments}'`;
                    case 'io.elementary.terminal':
                        return `${linuxTerminal} -e './"${this.file.executable}" ${this.arguments}'`;
                    default:
                        window.showErrorMessage(`${linuxTerminal} isn't supported! Try to enter a supported terminal in `
                            + `'terminal.external.linuxExec' settings! (gnome-terminal, xterm, konsole)`);

                        return undefined;
                }
            default:
                window.showErrorMessage('Unsupported platform!')

                return undefined;
        }
    }
}
