"use strict";

import * as vscode from 'vscode';
import * as path from "path";
import * as fs from 'fs';
import { VSCodeUI } from "./VSCodeUI";
import { Constants } from './Constants';
import { Settings } from './Settings';

export class CompileRun {
    private outputChannel: VSCodeUI.CompileRunOutputChannel;
    private terminal: VSCodeUI.CompileRunTerminal;
    readonly Action: Constants.Action;

    constructor() {
        this.outputChannel = new VSCodeUI.CompileRunOutputChannel();
        this.terminal = VSCodeUI.compileRunTerminal;
    }

    private async compile(currentFile: vscode.TextDocument, outputFileName: string, doRun: boolean = false, withFlags: boolean = false) {
        const spawn = require('child_process').spawn;
        let commandExistsSync = require('command-exists').sync;

        let currentFileName = currentFile.fileName;

        if (Settings.saveBeforeCompile) {
            await vscode.window.activeTextEditor.document.save();
        }

        let exec;

        let compilerArgs = [currentFile.fileName, '-o', outputFileName];

        let compilerSetting: { path: string, args: string[] };
        let compilerSettingKey: { path: string, args: string };

        switch (currentFile.languageId) {
            case 'cpp': {
                compilerSetting = {
                    path: Settings.cppCompilerPath(),
                    args: Settings.cppCompilerArgs()
                };

                compilerSettingKey = {
                    path: Settings.key.cppCompilerPath,
                    args: Settings.key.cppCompilerArgs
                };
                break;
            }
            case 'c': {
                compilerSetting = {
                    path: Settings.cCompilerPath(),
                    args: Settings.cCompilerArgs()
                };
                compilerSettingKey = {
                    path: Settings.key.cCompilerPath,
                    args: Settings.key.cCompilerArgs
                };
                break;
            }
            default: {
                return;
            }
        }

        console.log(compilerSetting.path);
        if (!commandExistsSync(compilerSetting.path)) {
            const CHANGE_PATH: string = "Change path";
            const choiceForDetails: string = await vscode.window.showErrorMessage("Compiler not found, try to change path in settings!", CHANGE_PATH);
            if (choiceForDetails === CHANGE_PATH) {
                let path = await this.promptForPath();
                await vscode.workspace.getConfiguration().update(compilerSettingKey.path, path, vscode.ConfigurationTarget.Global);
                this.compile(currentFile, outputFileName, doRun, withFlags);
                return;
            }
            return;
        }
        if (withFlags) {
            let flagsStr = await this.promptForFlags(compilerSetting.args.toString());
            if (flagsStr === undefined) { // cancel.
                return;
            }
            compilerArgs = compilerArgs.concat(flagsStr.split(" "));
        } else {
            compilerArgs = compilerArgs.concat(compilerSetting.args);
        }

        console.log(compilerArgs.toString());
        exec = spawn(compilerSetting.path, compilerArgs);

        exec.stdout.on('data', (data: any) => {
            this.outputChannel.appendLine(data, currentFileName);
            this.outputChannel.show();
        });

        exec.stderr.on('data', (data: any) => {
            this.outputChannel.appendLine(data, currentFileName);
            this.outputChannel.show();
        });

        exec.on('close', (data: any) => {
            if (data === 0) {
                // Compiled successfully let's tell the user & execute
                vscode.window.showInformationMessage("Compiled successfuly!");
                if (doRun) {
                    this.run(outputFileName);
                }
            } else {
                // Error compiling
                vscode.window.showErrorMessage("Error compiling!");
            }
        });
    }

    private async run(outputFile: string, withArgs: boolean = false) {
        if (!fs.existsSync(outputFile)) {
            vscode.window.showErrorMessage(`"${outputFile}" doesn't exists!`);
            return;
        }

        let runArgs = "";
        if (withArgs) {
            let argsStr = await this.promptForRunArgs(Settings.runArgs().toString());
            if (argsStr === undefined) { // cancel.
                return;
            }
            runArgs = argsStr;
        } else {
            runArgs = Settings.runArgs().toString();
        }

        this.terminal.runInTerminal(`"${outputFile}" ${runArgs}`);
    }

    public async compileRun(action: Constants.Action) {
        let currentFile = vscode.window.activeTextEditor.document;

        if (!currentFile) {
            return;
        }

        let outputFile = path.join(path.parse(currentFile.fileName).dir, path.parse(currentFile.fileName).name);
        if (process.platform === 'win32') {
            outputFile = outputFile + '.exe';
        }

        switch (action) {
            case Constants.Action.Compile:
                this.compile(currentFile, outputFile);
                break;
            case Constants.Action.Run:
                this.run(outputFile);
                break;
            case Constants.Action.CompileRun:
                this.compile(currentFile, outputFile, true);
                break;
            case Constants.Action.CompileWithFlags:
                this.compile(currentFile, outputFile, false, true);
                break;
            case Constants.Action.RunWithArguments:
                this.run(outputFile, true);
                break;
            default: return;
        }
    }

    private async promptForFlags(defaultFlags: string): Promise<string | undefined> {
        try {
            return await vscode.window.showInputBox({
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
            return await vscode.window.showInputBox({
                prompt: 'Arguments',
                value: defaultArgs
            });
        } catch (e) {
            return null;
        }
    }

    private async promptForPath(): Promise<string | undefined> {
        try {
            return await vscode.window.showInputBox({
                prompt: 'Path',
                placeHolder: '/usr/bin/gcc'
            });
        } catch (e) {
            return null;
        }
    }
}