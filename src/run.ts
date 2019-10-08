import { exec } from 'child_process';
import { existsSync } from 'fs';
import { lookpath } from 'lookpath';
import { window } from 'vscode';
import { Configuration } from './configuration';
import { File } from './models/file';
import { terminal } from './terminal';
import { promptRunArguments } from './utils/prompt-utils';

export class Run {
    private file: File;
    private arguments: string;
    private shouldAskForArgs: boolean;

    constructor(file: File, shouldAskForArgs = false) {
        this.file = file;
        this.shouldAskForArgs = shouldAskForArgs;
    }

    async run() {
        if (!existsSync(this.file.path)) {
            const errorMessage = `"${this.file.path}" doesn't exists!`;
            window.showErrorMessage(errorMessage);
            throw new Error(errorMessage);
        }

        this.arguments = Configuration.runArgs();
        if (this.shouldAskForArgs) {
            this.arguments = await promptRunArguments(this.arguments);
        }

        if (Configuration.runInExternalTerminal()) {
            const command = this.getExternalCommand();

            if (command) {
                exec(command, { cwd: this.file.directory });
                return;
            }
        }

        await terminal.run(`${this.file.executable} ${this.arguments}`, { name: 'C/C++ Compile Run', cwd: this.file.directory });
    }

    private getExternalCommand(): string {
        if (process.platform === 'win32') {
            return `start cmd /c ".\\\"${this.file.executable}\" ${this.arguments} & echo. & pause"`;
        }

        if (process.platform === 'darwin') {
            return `osascript -e 'do shell script "open -a Terminal " & "${this.file.directory}"' -e 'delay 0.3' -e `
                + `'tell application "Terminal" to do script ("./" & "${this.file.executable}") in first window'`;
        }

        if (process.platform === 'linux') {
            const linuxTerminal: string = Configuration.linuxTerminal();

            if (!terminal || lookpath(linuxTerminal) === null) {
                window.showErrorMessage(`${terminal} not found! Try to enter a valid terminal in 'terminal.external.linuxExec' `
                    + `settings!(gnome - terminal, xterm, konsole)`);
                window.showInformationMessage('Running on vscode terminal');
                return null;
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
                    window.showInformationMessage('Running on vscode terminal');
                    return null;
            }
        }
        return null;
    }
}
