'use strict';

import * as vscode from 'vscode';
import * as path from "path";
import { VSCodeUI } from "./VSCodeUI";

export function activate(context: vscode.ExtensionContext) {
    let CompileRunCommand = vscode.commands.registerCommand('extension.CompileRun', () => {
        let fname = vscode.window.activeTextEditor.document.fileName;

        let execSync = require('child_process').execSync;

        if (!fname) {
            return;
        }

        let ext = "";
        if (process.platform === 'win32') {
            ext = ".exe";
        }

        let output = path.join(path.parse(fname).dir, path.parse(fname).name + ext);

        switch (path.parse(fname).ext) {
            case '.cpp': {
                try {
                    execSync('g++ std=c++11 -Wall -Wextra ' + '\"' + fname + '\"' + ' -o ' + '"' + output + '"');
                    vscode.window.showInformationMessage('Compile succeed');
                    VSCodeUI.runInTerminal(output);
                }
                catch (error) {
                    vscode.window.showErrorMessage(error.message.split("/"));
                }
                break;
            }
            case '.c': {
                try {
                    execSync('gcc -Wall -Wextra ' + '\"' + fname + '\"' + ' -o ' + '"' + output + '"');
                    vscode.window.showInformationMessage('Compile succeed');
                    VSCodeUI.runInTerminal(output);
                }
                catch (error) {
                    vscode.window.showErrorMessage(error.message.split("/"));
                }
                break;
            }
            default: {
                break;
            }
        }
    });

    context.subscriptions.push(CompileRunCommand);

    context.subscriptions.push(vscode.window.onDidCloseTerminal((closedTerminal: vscode.Terminal) => {
        VSCodeUI.onDidCloseTerminal(closedTerminal);
    }));
}

export function deactivate() {
}