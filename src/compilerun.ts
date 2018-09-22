import * as vscode from 'vscode';
import * as path from "path";
import { Utils } from './utils';
import { VSCodeUI } from "./VSCodeUI";
import * as fs from 'fs';
import { Constants } from './constants';

export namespace CompileRun {
    function compile(currentFile: string, outputFile: string, doRun: boolean = false) {
        const spawn = require('child_process').spawn;

        let args = ['-Wall', '-Wextra'];
        args.push(currentFile, '-o', outputFile);

        let exec;

        switch (path.parse(currentFile).ext) {
            case '.cpp': {
                exec = spawn('g++', args);
                break;
            }
            case '.c': {
                exec = spawn('gcc', args);
                break;
            }
            default: {
                return;
            }
        }

        exec.stderr.on('data', (data: any) => {
            Utils.getOutputChannel().appendLine(data);
            Utils.getOutputChannel().show(true);
        });

        exec.on('close', (data: any) => {
            if (data === 0) {
                // Compiled successfully let's tell the user & execute
                vscode.window.showInformationMessage("Compiled successfuly!");
                if (doRun) {
                    run(outputFile);
                }
            } else {
                // Error compiling
                vscode.window.showErrorMessage("Error compiling!");
            }
        });
    }

    export function run(outputFile: string) {
        if (!fs.existsSync(outputFile)) {
            vscode.window.showErrorMessage(`"${outputFile}" doesn't exists`);
            return;
        }

        VSCodeUI.runInTerminal(`"${outputFile}"`);
    }

    export function compileRun(action: Constants.Action) {
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
                compile(currentFile, outputFile);
                break;
            case Constants.Action.Run:
                run(outputFile);
                break;
            case Constants.Action.CompileRun:
                compile(currentFile, outputFile, true);
                break;
            default: return;
        }
    }
}