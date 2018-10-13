import { commands, OutputChannel, Terminal, window, workspace } from "vscode";
import { setTimeout } from "timers";

export namespace VSCodeUI {
    export class CompileRunOutputChannel {
        private readonly channel: OutputChannel = window.createOutputChannel("C/C++ Compile Run");

        public appendLine(message: any, title?: string): void {
            if (title) {
                const simplifiedTime: string = (new Date()).toISOString().replace(/z|t/gi, " ").trim(); // YYYY-MM-DD HH:mm:ss.sss
                const hightlightingTitle: string = `[${title} ${simplifiedTime}]`;
                this.channel.appendLine(hightlightingTitle);
            }
            this.channel.appendLine(message);
        }

        public append(message: any): void {
            this.channel.append(message);
        }

        public show(): void {
            this.channel.show();
        }
    }

    export class CompileRunTerminal {
        static defaultOptions: ITerminalOptions = { addNewLine: true, name: "Compile Run" };

        static get clearLineChar() {
            return process.platform === "win32" ? '\r' : '\r\0' + '33[k';
        }

        static async runInTerminal(command: string) {
            CodeTerminal.runInTerminal(this.clearLineChar, this.defaultOptions);
            await new Promise(resolve => setTimeout(resolve, 700)); // await for a few time.
            await CodeTerminal.clearTerminal();
            CodeTerminal.runInTerminal(command, this.defaultOptions);
        }
    }

    export class CodeTerminal {
        private static readonly terminals: { [id: string]: Terminal } = {};

        static runInTerminal(command: string, options?: ITerminalOptions): void {
            const { addNewLine, name, cwd } = options;
            if (this.terminals[name] === undefined) {
                this.terminals[name] = window.createTerminal({ name });
            }
            this.terminals[name].show();
            if (cwd) {
                this.terminals[name].sendText(getCDCommand(cwd), true);
            }
            this.terminals[name].sendText(getCommand(command), addNewLine);
        }

        static async clearTerminal() {
            commands.executeCommand('workbench.action.terminal.clear');
        }

        static closeAllTerminals(): void {
            Object.keys(this.terminals).forEach((id: string) => {
                this.terminals[id].dispose();
                delete this.terminals[id];
            });
        }

        static onDidCloseTerminal(closedTerminal: Terminal): void {
            try {
                delete this.terminals[closedTerminal.name];
            } catch (error) {
                // ignore it.
            }
        }
    }

    function getCommand(cmd: string): string {
        if (process.platform === "win32") {
            switch (currentWindowsShell()) {
                case 'PowerShell':
                    return `cmd /c ${cmd}`; // PowerShell
                default:
                    return cmd; // others, try using common one.
            }
        } else {
            return cmd;
        }
    }

    function getCDCommand(cwd: string): string {
        if (process.platform === "win32") {
            switch (currentWindowsShell()) {
                case 'Git Bash':
                    return `cd "${cwd.replace(/\\+$/, "")}"`; // Git Bash: remove trailing '\'
                case 'PowerShell':
                    return `cd "${cwd}"`; // PowerShell
                case 'Command Prompt':
                    return `cd /d "${cwd}"`; // CMD
                case 'WSL Bash':
                    return `cd "${toWSLPath(cwd)}"`; // WSL
                default:
                    return `cd "${cwd}"`; // Unknown, try using common one.
            }
        } else {
            return `cd "${cwd}"`;
        }
    }

    export function currentWindowsShell(): string {
        const is32ProcessOn64Windows: boolean = process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
        const system32Path: string = `${process.env.windir}\\${is32ProcessOn64Windows ? 'Sysnative' : 'System32'}`;
        const expectedLocations: { [shell: string]: string[] } = {
            'Command Prompt': [`${system32Path}\\cmd.exe`],
            PowerShell: [`${system32Path}\\WindowsPowerShell\\v1.0\\powershell.exe`],
            'WSL Bash': [`${system32Path}\\bash.exe`],
            'Git Bash': [
                `${process.env.ProgramW6432}\\Git\\bin\\bash.exe`,
                `${process.env.ProgramW6432}\\Git\\usr\\bin\\bash.exe`,
                `${process.env.ProgramFiles}\\Git\\bin\\bash.exe`,
                `${process.env.ProgramFiles}\\Git\\usr\\bin\\bash.exe`,
                `${process.env.LocalAppData}\\Programs\\Git\\bin\\bash.exe`
            ]
        };
        const currentWindowsShellPath: string = workspace.getConfiguration("terminal").get<string>("integrated.shell.windows");
        for (const key in expectedLocations) {
            if (expectedLocations[key].indexOf(currentWindowsShellPath) >= 0) {
                return key;
            }
        }
        return 'Others';
    }

    export function toWSLPath(p: string): string {
        const arr: string[] = p.split(":\\");
        if (arr.length === 2) {
            const drive: string = arr[0].toLowerCase();
            const dir: string = arr[1].replace(/\\/g, "/");
            return `/mnt/${drive}/${dir}`;
        } else {
            return ".";
        }
    }
}

interface ITerminalOptions {
    addNewLine?: boolean;
    name?: string;
    cwd?: string;
}