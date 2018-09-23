'use strict';

import * as vscode from 'vscode';
import { VSCodeUI } from "./VSCodeUI";
import { CompileRun } from './compileRun';
import { Constants } from './compileRun';

export function activate(context: vscode.ExtensionContext) {
    const compileRun = new CompileRun();

    let CompileRunCommand = vscode.commands.registerCommand('extension.CompileRun', () => {
        compileRun.compileRun(Constants.Action.CompileRun);
    });

    let CompileCommand = vscode.commands.registerCommand('extension.Compile', () => {
        compileRun.compileRun(Constants.Action.Compile);
    });

    let RunCommand = vscode.commands.registerCommand('extension.Run', () => {
        compileRun.compileRun(Constants.Action.Run);
    });

    context.subscriptions.push(CompileRunCommand);
    context.subscriptions.push(CompileCommand);
    context.subscriptions.push(RunCommand);

    context.subscriptions.push(vscode.window.onDidCloseTerminal((closedTerminal: vscode.Terminal) => {
        VSCodeUI.onDidCloseTerminal(closedTerminal);
    }));
}

export function deactivate() {
}