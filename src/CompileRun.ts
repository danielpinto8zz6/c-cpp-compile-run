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

    private async compile(currentFile: string, outputFile: string, doRun: boolean = false, withFlags: boolean = false) {
        const spawn = require('child_process').spawn;
        let commandExistsSync = require('command-exists').sync;

        if (Settings.saveBeforeCompile) {
            await vscode.window.activeTextEditor.document.save();
        }

        let exec;

        switch (path.parse(currentFile).ext) {
            case '.cpp': {
                let cppCompiler = this.getCPPCompiler();

                if (!commandExistsSync(cppCompiler)) {
                    const CHANGE_PATH: string = "Change path";
                    const choiceForDetails: string = await vscode.window.showErrorMessage("Compiler not found, try to change path in settings!", CHANGE_PATH);
                    if (choiceForDetails === CHANGE_PATH) {
                        let path = await this.promptForPath();
                        await vscode.workspace.getConfiguration().update('c-cpp-compile-run.cpp-compiler', path, vscode.ConfigurationTarget.Global);
                        this.compile(currentFile, outputFile, doRun, withFlags);
                        return;
                    }

                    return;
                }

                let cppArgs = [currentFile, '-o', outputFile];

                if (withFlags) {
                    let flagsStr = await this.promptForFlags();
                    if (flagsStr) {
                        let flags = flagsStr.split(" ");
                        cppArgs = cppArgs.concat(flags);
                    }
                }

                cppArgs.push('-lstdc++');

                exec = spawn(cppCompiler, cppArgs);
                break;
            }
            case '.c': {
                let cCompiler = this.getCCompiler();

                if (!commandExistsSync(cCompiler)) {
                    const CHANGE_PATH: string = "Change path";
                    const choiceForDetails: string = await vscode.window.showErrorMessage("Compiler not found, try to change path in settings!", CHANGE_PATH);
                    if (choiceForDetails === CHANGE_PATH) {
                        let path = await this.promptForPath();
                        await vscode.workspace.getConfiguration().update('c-cpp-compile-run.c-compiler', path, vscode.ConfigurationTarget.Global);
                        this.compile(currentFile, outputFile, doRun, withFlags);
                        return;
                    }

                    return;
                }

                let cArgs = [currentFile, '-o', outputFile];

                if (withFlags) {
                    let flagsStr = await this.promptForFlags();
                    if (flagsStr) {
                        let flags = flagsStr.split(" ");
                        cArgs = cArgs.concat(flags);
                    }
                }

                exec = spawn(cCompiler, cArgs);
                break;
            }
            default: {
                return;
            }
        }

        exec.stdout.on('data', (data: any) => {
            this.outputChannel.appendLine(data, currentFile);
            this.outputChannel.show();
        });

        exec.stderr.on('data', (data: any) => {
            this.outputChannel.appendLine(data, currentFile);
            this.outputChannel.show();
        });

        exec.on('close', (data: any) => {
            if (data === 0) {
                // Compiled successfully let's tell the user & execute
                vscode.window.showInformationMessage("Compiled successfuly!");
                if (doRun) {
                    this.run(outputFile);
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

        if (withArgs) {
            let args = await this.promptForRunArgs();
            this.terminal.runInTerminal(`"${outputFile}" ${args}`);
        } else {
            this.terminal.runInTerminal(`"${outputFile}"`);
        }
    }

    public async compileRun(action: Constants.Action) {
        let currentFile = vscode.window.activeTextEditor.document.fileName;

        if (!currentFile) {
            return;
        }

        let outputFile = path.join(path.parse(currentFile).dir, path.parse(currentFile).name);
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

    private getCCompiler(): string {
        const cCompiler = Settings.cCompiler();

        if (!cCompiler) {
            return "gcc";
        } else {
            return cCompiler;
        }
    }

    private getCPPCompiler(): string {
        const cppCompiler = Settings.cppCompiler();

        if (!cppCompiler) {
            return "gcc";
        } else {
            return cppCompiler;
        }
    }

    private async promptForFlags(): Promise<string | undefined> {
        try {
            return await vscode.window.showInputBox({
                prompt: 'Flags',
                placeHolder: '-Wall -Wextra'
            });
        } catch (e) {
            return null;
        }
    }

    private async promptForRunArgs(): Promise<string | undefined> {
        try {
            return await vscode.window.showInputBox({
                prompt: 'Arguments',
                placeHolder: 'arg'
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