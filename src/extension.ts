'use strict';

import * as vscode from 'vscode';
import { VSCodeUI } from "./VSCodeUI";
import { CompileRun } from './compilerun';
import { Constants } from './constants';

export function activate(context: vscode.ExtensionContext) {
    let CompileRunCommand = vscode.commands.registerCommand('extension.CompileRun', () => {
        CompileRun.compileRun(Constants.Action.CompileRun);
    });

    let CompileCommand = vscode.commands.registerCommand('extension.Compile', () => {
        CompileRun.compileRun(Constants.Action.Compile);
    });

    let RunCommand = vscode.commands.registerCommand('extension.Run', () => {
        CompileRun.compileRun(Constants.Action.Run);
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