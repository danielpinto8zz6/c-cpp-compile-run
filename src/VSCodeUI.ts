// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as os from "os";
import { Terminal, window, workspace } from "vscode";

export namespace VSCodeUI{
    export class Commands{
        static cd(cwd: string): string{
            switch(getTerminalType()){
                case TerminalType.GitBash:
                    return `cd "${ cwd.replace(/\\+$/, "") }"`; // Git Bash: remove trailing '\'
                case TerminalType.CMD:
                    return `cd /d "${ cwd }"`; // CMD
                default:
                    return `cd "${ cwd }"`;
            }
        }
        static clearscreen(): string{
            switch(getTerminalType()){
                case TerminalType.CMD:
                    return "cls";
                default:
                    return "clear";
            }
        }
        static command(cmd: string): string {
            switch(getTerminalType()){
                case TerminalType.PowerShell:
                    return `& ${ cmd }`; // '&' is call operator.
                default:
                    return cmd;
            }
        }
    }

    const terminals: { [id: string]: Terminal } = {};

    export function runInTerminal(command: string, options?: ITerminalOptions) {
        const defaultOptions: ITerminalOptions = { addNewLine: true, name: "Compile & Run" };
        const { addNewLine, name, cwd } = Object.assign(defaultOptions, options);
        if (terminals[name] === undefined)
            terminals[name] = window.createTerminal({ name });
        terminals[name].show();
        if (cwd)
            terminals[name].sendText(Commands.cd(cwd), true);
        terminals[name].sendText(Commands.command(command), addNewLine);
    }

    enum TerminalType{
        GitBash, PowerShell, CMD, Unknown
    }

    export function getTerminalType() : TerminalType{
        if(os.platform() === "win32"){
            const windowsShell = workspace.getConfiguration("terminal").get<string>("integrated.shell.windows")
                .toLowerCase(); // The integrated is different from external.
            if(windowsShell)
                if (windowsShell.indexOf("bash.exe") > -1 && windowsShell.indexOf("git") > -1)
                    return TerminalType.GitBash;
                else if (windowsShell.indexOf("powershell.exe") > -1)
                    return TerminalType.PowerShell;
                else if (windowsShell.indexOf("cmd.exe") > -1)
                    return TerminalType.CMD;
        }
        return TerminalType.Unknown;
    }

    export function onDidCloseTerminal(closedTerminal: Terminal): void {
        delete terminals[closedTerminal.name];
    }
}

interface ITerminalOptions {
    addNewLine?: boolean;
    name?: string;
    cwd?: string;
}