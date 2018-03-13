'use strict';

import * as vscode from 'vscode';
import * as path from "path";
import { VSCodeUI } from "./VSCodeUI";

export function activate(context: vscode.ExtensionContext) {
    let CompileRunCommand = vscode.commands.registerCommand('extension.CompileRun', () => {
        let currentFile = vscode.window.activeTextEditor.document.uri.path;

        if (!currentFile) {
            return;
        }

        let outputFile = path.join(path.dirname(currentFile), path.parse(currentFile).name);

        switch (path.parse(currentFile).ext) {
            case '.cpp': {
                VSCodeUI.runInTerminal('g++ -std=c++17 -Wall -Wextra ' + '"' + currentFile + '"' + ' -o ' + '"' + outputFile + '"');
                if (process.platform === "win32") {
                    VSCodeUI.runInTerminal('cls');
                } else {
                    VSCodeUI.runInTerminal('clear');
                }
                VSCodeUI.runInTerminal('"' + outputFile + '"');
                break;
            }
            case '.c': {
                VSCodeUI.runInTerminal('gcc -Wall -Wextra ' + '"' + currentFile + '"' + ' -o ' + '"' + outputFile + '"' + ' && ' + '"' + outputFile + '"');
                if (process.platform === "win32") {
                    VSCodeUI.runInTerminal('cls');
                } else {
                    VSCodeUI.runInTerminal('clear');
                }
                VSCodeUI.runInTerminal('"' + outputFile + '"');
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