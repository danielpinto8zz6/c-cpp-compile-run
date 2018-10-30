'use strict';

import { VSCodeUI } from "./VSCodeUI";
import { CompileRun } from './CompileRun';
import { Constants } from "./Constants";
import { ExtensionContext, commands, window, Terminal } from "vscode";

export function activate(context: ExtensionContext) {
    const compileRun = new CompileRun();

    let CompileRunCommand = commands.registerCommand('extension.CompileRun', () => {
        compileRun.compileRun(Constants.Action.CompileRun);
    });

    let CompileCommand = commands.registerCommand('extension.Compile', () => {
        compileRun.compileRun(Constants.Action.Compile);
    });

    let RunCommand = commands.registerCommand('extension.Run', () => {
        compileRun.compileRun(Constants.Action.Run);
    });

    let CompileWithFlagsCommand = commands.registerCommand('extension.CompileWithFlags', () => {
        compileRun.compileRun(Constants.Action.CompileWithFlags);
    });

    let RunWithArgumentsCommand = commands.registerCommand('extension.RunWithArguments', () => {
        compileRun.compileRun(Constants.Action.RunWithArguments);
    });

    context.subscriptions.push(CompileRunCommand);
    context.subscriptions.push(CompileCommand);
    context.subscriptions.push(RunCommand);
    context.subscriptions.push(CompileWithFlagsCommand);
    context.subscriptions.push(RunWithArgumentsCommand);

    context.subscriptions.push(window.onDidCloseTerminal((closedTerminal: Terminal) => {
        VSCodeUI.compileRunTerminal.onDidCloseTerminal(closedTerminal);
    }));
}

export function deactivate() {
}