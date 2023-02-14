// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as fse from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { outputChannel } from "./output-channel";
import { executeCommand } from "./utils/cp-utils";

export interface ITerminalOptions {
    addNewLine?: boolean;
    name: string;
    cwd?: string;
    env?: { [key: string]: string };
    workspaceFolder?: vscode.WorkspaceFolder;
}

enum ShellType {
    cmd = "Command Prompt",
    powerShell = "PowerShell",
    gitBash = "Git Bash",
    wsl = "WSL Bash",
    others = "Others"
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
            this.terminals[name].sendText(await getCDCommand(cwd), true);
        }
        this.terminals[name].sendText(getCommand(command), addNewLine);
        return this.terminals[name];
    }

    // To Refactor: remove from here.
    public async formattedPathForTerminal(filepath: string): Promise<string> {
        if (process.platform !== "win32") {
            return filepath;
        }

        switch (currentWindowsShell()) {
            case ShellType.wsl:
                return await toWslPath(filepath);
            case ShellType.powerShell: {
                // On Windows, append .cmd for `path/to/mvn` to prevent popup window
                // See: https://github.com/microsoft/vscode-maven/pull/494#issuecomment-633869294
                if (path.extname(filepath) === "") {
                    // try .cmd or .bat (up to maven version)
                    // See: https://github.com/microsoft/vscode-maven/issues/489#issuecomment-917613597
                    const possibleExts = ["cmd", "bat"];
                    for (const ext of possibleExts) {
                        const amended: string = `${filepath}.${ext}`;
                        if (await fse.pathExists(amended)) {
                            return amended;
                        }
                    }
                }
                return filepath;
            }
            default:
                return filepath;
        }
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

function getCommand(cmd: string): string {
    if (currentWindowsShell() === ShellType.powerShell) {
        return `& ${cmd}`;
    } else {
        return cmd;
    }
}

async function getCDCommand(cwd: string): Promise<string> {
    if (process.platform === "win32") {
        switch (currentWindowsShell()) {
            case ShellType.gitBash:
                return `cd "${cwd.replace(/\\+$/, "")}"`; // Git Bash: remove trailing '\'
            case ShellType.powerShell:
                // Escape '[' and ']' in PowerShell
                // See: https://github.com/microsoft/vscode-maven/issues/324
                const escaped: string = cwd.replace(/([\[\]])/g, "``$1");
                return `cd "${escaped}"`; // PowerShell
            case ShellType.cmd:
                return `cd /d "${cwd}"`; // CMD
            case ShellType.wsl:
                return `cd "${await toWslPath(cwd)}"`; // WSL
            default:
                return `cd "${cwd}"`; // Unknown, try using common one.
        }
    } else {
        return `cd "${cwd}"`;
    }
}

// Ref:
// https://github.com/microsoft/vscode/blob/1755a21efc89bcb5ccef3fd908372bf7c8944d3c/src/vs/platform/terminal/node/windowsShellHelper.ts#L144-L164
function currentWindowsShell(): ShellType {
    const currentWindowsShellPath: string = vscode.env.shell;
    const executable: string = path.basename(currentWindowsShellPath);
    switch (executable.toLowerCase()) {
        case "cmd.exe":
            return ShellType.cmd;
        case "pwsh.exe":
        case "powershell.exe":
        case "pwsh": // pwsh on mac/linux
            return ShellType.powerShell;
        case "bash.exe":
        case "git-cmd.exe":
            return ShellType.gitBash;
        case "wsl.exe":
        case "ubuntu.exe":
        case "ubuntu1804.exe":
        case "kali.exe":
        case "debian.exe":
        case "opensuse-42.exe":
        case "sles-12.exe":
            return ShellType.wsl;
        default:
            return ShellType.others;
    }
}

function toDefaultWslPath(p: string): string {
    const arr: string[] = p.split(":\\");
    if (arr.length === 2) {
        const drive: string = arr[0].toLowerCase();
        const dir: string = arr[1].replace(/\\/g, "/");
        return `/mnt/${drive}/${dir}`;
    } else {
        return p.replace(/\\/g, "/");
    }
}

export async function toWslPath(filepath: string): Promise<string> {
    if (path.posix.isAbsolute(filepath)) {
        return filepath;
    }

    try {
        return (await executeCommand("wsl", ["wslpath", "-u", `"${filepath.replace(/\\/g, "/")}"`])).trim();
    } catch (error) {
        outputChannel.appendLine(error, "WSL");
        return toDefaultWslPath(filepath);
    }
}

export async function toWinPath(filepath: string): Promise<string> {
    return (await executeCommand("wsl", ["wslpath", "-w", `"${filepath}"`])).trim();
}

export function getRunPrefix(): string {
    if (process.platform === "win32") {
        const shell = currentWindowsShell();

        if (shell === ShellType.cmd || shell === ShellType.powerShell) {
            return ".\\";
        }
    }

    return "./";
}

export const terminal: Terminal = new Terminal();

function setupEnvForWSL(term: vscode.Terminal, env: { [envKey: string]: string }): void {
    if (term !== undefined) {
        Object.keys(env).forEach(key => {
            term.sendText(`export ${key}="${env[key]}"`, true);
        });
    }
}