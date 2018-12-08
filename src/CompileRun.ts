"use strict";

import { exec, spawn } from "child_process";
import { existsSync } from "fs";
import { commands, ConfigurationTarget, window, workspace } from "vscode";
import { commandExists } from './CommandExists';
import { Constants } from "./Constants";
import { File } from './File';
import { Settings } from "./Settings";
import { VSCodeUI } from "./VSCodeUI";

export class CompileRun {
    private outputChannel: VSCodeUI.CompileRunOutputChannel;
    private terminal: VSCodeUI.CompileRunTerminal;
    readonly Action: Constants.Action;

    constructor() {
        this.outputChannel = new VSCodeUI.CompileRunOutputChannel();
        this.terminal = VSCodeUI.compileRunTerminal;
    }

    private async compile(file: File, inputFlags: boolean, callback: (file: File) => void = null) {
        if (Settings.saveBeforeCompile) {
            await window.activeTextEditor.document.save();
        }

        let exec;

        let compilerArgs = [file.$name, '-o', file.$executable];

        let compilerSetting: { path: string, flags: string };
        let compilerSettingKey: { path: string, flags: string };
        switch (file.$extension) {
            case 'cpp': {
                compilerSetting = {
                    path: Settings.cppCompiler(),
                    flags: Settings.cppFlags()
                };

                compilerSettingKey = {
                    path: Settings.key.cppCompiler,
                    flags: Settings.key.cppFlags
                };
                break;
            }
            case 'c': {
                compilerSetting = {
                    path: Settings.cCompiler(),
                    flags: Settings.cFlags()
                };
                compilerSettingKey = {
                    path: Settings.key.cCompiler,
                    flags: Settings.key.cFlags
                };
                break;
            }
            default: {
                return;
            }
        }

        if (!commandExists(compilerSetting.path)) {
            const CHANGE_PATH: string = "Change path";
            const choiceForDetails: string = await window.showErrorMessage("Compiler not found, try to change path in settings!", CHANGE_PATH);
            if (choiceForDetails === CHANGE_PATH) {
                let path = await this.promptForPath();
                await workspace.getConfiguration("c-cpp-compile-run", null).update(compilerSettingKey.path, path, ConfigurationTarget.Global);
                this.compile(file, inputFlags, callback);
                return;
            }
            return;
        }

        let flags = compilerSetting.flags;
        if (inputFlags) {
            flags = await this.promptForFlags(flags);
            if (flags === undefined) { // cancel.
                return;
            }
        }
        if (flags) {
            compilerArgs = compilerArgs.concat(flags.split(" "));
        }

        console.log(compilerSetting.path, compilerArgs);

        exec = spawn(compilerSetting.path, compilerArgs, { cwd: file.$directory });

        exec.stdout.on('data', (data: any) => {
            this.outputChannel.appendLine(data, file.$name);
            this.outputChannel.show();
        });

        exec.stderr.on('data', (data: any) => {
            this.outputChannel.appendLine(data, file.$name);
            this.outputChannel.show();
        });

        exec.on('close', (data: any) => {
            if (data === 0) {
                // Compiled successfully let's tell the user & execute
                window.showInformationMessage("Compiled successfuly!");
                if (callback !== null) {
                    callback(file);
                }
            } else {
                // Error compiling
                window.showErrorMessage("Error compiling!");
            }
        });
    }

    private async run(file: File, inputArgs: boolean) {
        if (!existsSync(file.$path)) {
            window.showErrorMessage(`"${file.$path}" doesn't exists!`);
            return;
        }

        let args = Settings.runArgs();
        if (inputArgs) {
            args = await this.promptForRunArgs(args);
            if (args === undefined) { // cancel.
                return;
            }
        }

        if (Settings.runInExternalTerminal()) {
            if (this.runExternal(file, args)) {
                return;
            }
        }
        // Otherwise
        commands.executeCommand("workbench.action.terminal.clear");
        this.terminal.runExecutable(file.$executable, args, { cwd: file.$directory });
    }

    public async compileRun(action: Constants.Action) {
        if (!window.activeTextEditor.document) {
            return;
        }

        let file = new File(window.activeTextEditor.document);

        switch (action) {
            case Constants.Action.Compile:
                this.compile(file, false);
                break;
            case Constants.Action.Run:
                this.run(file, false);
                break;
            case Constants.Action.CompileRun:
                this.compile(file, false, (file) => this.run(file, false));
                break;
            case Constants.Action.CustomCompile:
                this.compile(file, true);
                break;
            case Constants.Action.CustomRun:
                this.run(file, true);
                break;
            case Constants.Action.CustomCompileRun:
                this.compile(file, true, (file) => this.run(file, true));
                break;
            default: return;
        }
    }

    private async promptForFlags(defaultFlags: string): Promise<string | undefined> {
        try {
            return await window.showInputBox({
                prompt: 'Flags',
                placeHolder: '-Wall -Wextra',
                value: defaultFlags
            });
        } catch (e) {
            return null;
        }
    }

    private async promptForRunArgs(defaultArgs: string): Promise<string | undefined> {
        try {
            return await window.showInputBox({
                prompt: 'Arguments',
                value: defaultArgs
            });
        } catch (e) {
            return null;
        }
    }

    private async promptForPath(): Promise<string | undefined> {
        try {
            return await window.showInputBox({
                prompt: 'Path',
                placeHolder: '/usr/bin/gcc'
            });
        } catch (e) {
            return null;
        }
    }

    private runExternal(file: File, args: string): boolean {
        switch (process.platform) {
            case 'win32':
                exec(`start cmd /c "${file.$executable} ${args} & echo. & pause"`, { cwd: file.$directory });
                return true;
            case 'linux':
                let terminal: string = workspace.getConfiguration().get('terminal.external.linuxExec');
                if (!commandExists(terminal)) {
                    window.showErrorMessage(`${terminal} not found! Try to enter a valid terminal in 'terminal.external.linuxExec' settings! (gnome-terminal, xterm, konsole)`);
                    window.showInformationMessage('Running on vscode terminal');
                    return false;
                }

                switch (terminal) {
                    case 'xterm':
                        exec(`${terminal} -T ${file.$title} -e './${file.$executable} ${args}; echo; read -n1 -p "Press any key to continue..."'`, { cwd: file.$directory });
                        return true;
                    case 'gnome-terminal':
                    case 'tilix':
                    case 'mate-terminal':
                        exec(`${terminal} -t ${file.$title} -x bash -c './${file.$executable} ${args}; echo; read -n1 -p "Press any key to continue..."'`, { cwd: file.$directory });
                        return true;
                    case 'xfce4-terminal':
                        exec(`${terminal} --title ${file.$title} -x bash -c './${file.$executable} ${args}; read -n1 -p "Press any key to continue..."'`, { cwd: file.$directory });
                        return true;
                    case 'konsole':
                        exec(`${terminal} -p tabtitle='${file.$title}' --noclose -e bash -c './${file.$executable} ${args}'`, { cwd: file.$directory });
                        return true;
                    case 'io.elementary.terminal':
                        exec(`${terminal} -e './${file.$executable} ${args}'`, { cwd: file.$directory });
                        return true;
                    default:
                        window.showErrorMessage(`${terminal} isn't supported! Try to enter a supported terminal in 'terminal.external.linuxExec' settings! (gnome-terminal, xterm, konsole)`);
                        window.showInformationMessage('Running on vscode terminal');
                        return false;
                }
            case 'darwin':
                exec(`osascript - e 'tell application "Terminal" to do script "./${file.$executable} && read -n1 -p "Press any key to continue...""'`, { cwd: file.$directory });
                return true;
        }
        return false;
    }
}