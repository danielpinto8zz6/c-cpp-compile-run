'use strict';

import * as vscode from 'vscode';
import * as path from "path";
import { VSCodeUI } from "./VSCodeUI";

export function activate(context: vscode.ExtensionContext) {
    let CompileRunCommand = vscode.commands.registerCommand('extension.CompileRun', () => {
        let currentFile = vscode.window.activeTextEditor.document.fileName;
        let outputFile = path.join(path.parse(currentFile).dir, path.parse(currentFile).name);

        if (!currentFile) {
            return;
        }

        switch (path.parse(currentFile).ext) {
            case '.cpp': {
                VSCodeUI.runInTerminal(`g++ -std=c++17 -Wall -Wextra "${ currentFile }" -o "${ outputFile }"`);
                VSCodeUI.runInTerminal("clear");
                VSCodeUI.runInTerminal(`"${ outputFile }"`);
                break;
            }
            case '.c': {
                VSCodeUI.runInTerminal(`g++ -Wall -Wextra "${ currentFile }" -o "${ outputFile }"`);
                VSCodeUI.runInTerminal("clear");
                VSCodeUI.runInTerminal(`"${ outputFile }"`);
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