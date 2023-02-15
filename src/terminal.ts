// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import { ShellType } from "./enums/shell-type";
import { executeCommand } from "./utils/cp-utils";
import { currentWindowsShell, getCDCommand, getCommand } from "./utils/shell-utils";

export interface ITerminalOptions {
    addNewLine?: boolean;
    name: string;
    cwd?: string;
    env?: { [key: string]: string };
    workspaceFolder?: vscode.WorkspaceFolder;
}

class Terminal implements vscode.Disposable {
    private readonly terminals: { [id: string]: vscode.Terminal } = {};

    public async runInTerminal(command: string, options: ITerminalOptions): Promise<vscode.Terminal> {
        const defaultOptions: ITerminalOptions = { addNewLine: true, name: "C/C++ Compile Run" };
        const { addNewLine, name, cwd, workspaceFolder } = Object.assign(defaultOptions, options);
        if (this.terminals[name] === undefined) {
            // Open terminal in workspaceFolder if provided
            // See: https://github.com/microsoft/vscode-maven/issues/467#issuecomment-584544090
            const terminalCwd: vscode.Uri | undefined = workspaceFolder ? workspaceFolder.uri : undefined;
            const env: { [envKey: string]: string } = { ...options.env };
            this.terminals[name] = vscode.window.createTerminal({ name, env, cwd: terminalCwd });
            // Workaround for WSL custom envs.
            // See: https://github.com/Microsoft/vscode/issues/71267
            if (currentWindowsShell() === ShellType.wsl) {
                setupEnvForWSL(this.terminals[name], env);
            }
        }
        this.terminals[name].show();
        if (cwd) {
            this.terminals[name].sendText(await getCDCommand(cwd, currentWindowsShell()), true);
        }
        this.terminals[name].sendText(getCommand(command, currentWindowsShell()), addNewLine);
        return this.terminals[name];
    }

    public dispose(terminalName?: string): void {
        if (terminalName === undefined) {// If the name is not passed, dispose all.
            Object.keys(this.terminals).forEach((id: string) => {
                this.terminals[id].dispose();
                delete this.terminals[id];
            });
        } else if (this.terminals[terminalName] !== undefined) {
            this.terminals[terminalName].dispose();
            delete this.terminals[terminalName];
        }
    }
}

export async function toWinPath(filepath: string): Promise<string> {
    return (await executeCommand("wsl", ["wslpath", "-w", `"${filepath}"`])).trim();
}

export const terminal: Terminal = new Terminal();

function setupEnvForWSL(term: vscode.Terminal, env: { [envKey: string]: string }): void {
    if (term !== undefined) {
        Object.keys(env).forEach(key => {
            term.sendText(`export ${key}="${env[key]}"`, true);
        });
    }
}
