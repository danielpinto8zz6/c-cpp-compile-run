"use strict";

import * as vscode from 'vscode';
import * as path from "path";
import * as fs from 'fs';
import { VSCodeUI } from "./VSCodeUI";

export namespace Constants {
    export enum Action {
        Compile,
        Run,
        CompileRun
    }
}

export class CompileRun {
    private _outputChannel: vscode.OutputChannel;

    readonly Action: Constants.Action;

    constructor() {
        this._outputChannel = vscode.window.createOutputChannel("C/C++ Compile Run");
    }

    public async compile(currentFile: string, outputFile: string, doRun: boolean = false) {
        const spawn = require('child_process').spawn;
        var commandExistsSync = require('command-exists').sync;

        let exec;

        switch (path.parse(currentFile).ext) {
            case '.cpp': {
                let cppCompiler = this.getCPPCompiler();

                if (!commandExistsSync(cppCompiler)) {
                    vscode.window.showErrorMessage("Invalid compiler path, try to change path in settings! (eg. /usr/bin/gcc)");
                    return;
                }

                let cppArgs = this.getCPPFlags();
                cppArgs.push(currentFile, '-o', outputFile);

                exec = spawn(cppCompiler, cppArgs);
                break;
            }
            case '.c': {
                let cCompiler = this.getCCompiler();

                if (!commandExistsSync(cCompiler)) {
                    vscode.window.showErrorMessage("Compiler not found, try to change path in settings!");
                    return;
                }

                let cArgs = this.getCFlags();
                cArgs.push(currentFile, '-o', outputFile);

                exec = spawn(cCompiler, cArgs);
                break;
            }
            default: {
                return;
            }
        }

        exec.stdout.on('data', (data: any) => {
            this._outputChannel.appendLine(data);
            this._outputChannel.show(true);
        });

        exec.stderr.on('data', (data: any) => {
            this._outputChannel.appendLine(data);
            this._outputChannel.show(true);
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

    public async run(outputFile: string) {
        if (!fs.existsSync(outputFile)) {
            vscode.window.showErrorMessage(`"${outputFile}" doesn't exists`);
            return;
        }

        VSCodeUI.runInTerminal(`"${outputFile}"`);
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
            default: return;
        }
    }

    private getCCompiler(): string {
        const config = this.getConfiguration("c-cpp-compile-run");
        const cCompiler = config.get<string>("c-compiler");

        if (!cCompiler) {
            return "gcc";
        } else {
            return cCompiler;
        }
    }

    private getCPPCompiler(): string {
        const config = this.getConfiguration("c-cpp-compile-run");
        const cppCompiler = config.get<string>("cpp-compiler");

        if (!cppCompiler) {
            return "g++";
        } else {
            return cppCompiler;
        }
    }

    private getCFlags(): string[] {
        return ['-Wall', '-Wextra'];
    }

    private getCPPFlags(): string[] {
        return ['-Wall', '-Wextra'];
    }

    private getConfiguration(section?: string): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration(section, null);
    }
}