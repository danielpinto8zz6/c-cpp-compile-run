import { ExtensionContext, commands, window, Terminal } from 'vscode';
import { terminal } from './terminal';
import { CompileRunManager } from './compile-run-manager';

export function activate(context: ExtensionContext) {
    const compileRunManager = new CompileRunManager();

    const compile = commands.registerCommand('extension.Compile', () => {
        compileRunManager.compile();
    });

    const run = commands.registerCommand('extension.Run', () => {
        compileRunManager.run();
    });

    const compileRun = commands.registerCommand('extension.CompileRun', () => {
        compileRunManager.compileRun();
    });

    const customCompile = commands.registerCommand('extension.CustomCompile', () => {
        compileRunManager.compile(true);
    });

    const customRun = commands.registerCommand('extension.CustomRun', () => {
        compileRunManager.compile(true);
    });

    const customCompileRun = commands.registerCommand('extension.CustomCompileRun', () => {
        compileRunManager.compileRun(true, true);
    });

    context.subscriptions.push(compile);
    context.subscriptions.push(run);
    context.subscriptions.push(compileRun);
    context.subscriptions.push(customCompile);
    context.subscriptions.push(customRun);
    context.subscriptions.push(customCompileRun);

    context.subscriptions.push(window.onDidCloseTerminal((closedTerminal: Terminal) => {
        terminal.onClose(closedTerminal);
    }));
}

export function deactivate() {
}
