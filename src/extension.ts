'use strict';

import * as vscode from 'vscode';
import * as path from "path";
import { VSCodeUI } from "./VSCodeUI";

export function activate(context: vscode.ExtensionContext) {
    let CompileRunCommand = vscode.commands.registerCommand('extension.CompileRun', () => {
        let document = vscode.window.activeTextEditor.document;
        let outputFile = path.join(path.parse(document.fileName).dir, path.parse(document.fileName).name);

        if (!document)
            return;

        switch (document.languageId) {
            case 'cpp': {
                VSCodeUI.runInTerminal(VSCodeUI.Commands.command(`g++ -std=c++17 -Wall -Wextra "${ document.fileName }" -o "${ outputFile }"`));
                break;
            }
            case 'c': {
                VSCodeUI.runInTerminal(VSCodeUI.Commands.command(`g++ -Wall -Wextra "${ document.fileName }" -o "${ outputFile }"`));
                break;
            }
            default: {
                vscode.window.showErrorMessage("The file to be compiled is not a C/C++ file.");
                return;
            }
        }
        VSCodeUI.runInTerminal(VSCodeUI.Commands.clearscreen());
        VSCodeUI.runInTerminal(`"${ outputFile }"`);
    });

    context.subscriptions.push(CompileRunCommand);

    context.subscriptions.push(vscode.window.onDidCloseTerminal((closedTerminal: vscode.Terminal) => {
        VSCodeUI.onDidCloseTerminal(closedTerminal);
    }));
}

export function deactivate() {
}