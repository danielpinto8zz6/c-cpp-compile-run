'use strict';

import { VSCodeUI } from "./VSCodeUI";
import { CompileRun } from './CompileRun';
import { Constants } from "./Constants";
import { ExtensionContext, commands, window, Terminal } from "vscode";

export function activate(context: ExtensionContext) {
    const compileRun = new CompileRun();

    let register = (num: Constants.Action) => {
        context.subscriptions.push(commands.registerCommand('extension.' + Constants.Action[num], () => {
            compileRun.compileRun(num);
        }));
    };

    register(Constants.Action.CompileRun);
    register(Constants.Action.CustomCompileRun);
    register(Constants.Action.Compile);
    register(Constants.Action.Run);
    register(Constants.Action.CustomCompile);
    register(Constants.Action.CustomRun);
    register(Constants.Action.ExternalCompileRun);
    register(Constants.Action.ExternalCustomCompileRun);

    context.subscriptions.push(window.onDidCloseTerminal((closedTerminal: Terminal) => {
        VSCodeUI.compileRunTerminal.onDidCloseTerminal(closedTerminal);
    }));
}

export function deactivate() {
}
