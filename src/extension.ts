import { ExtensionContext, commands, window, Terminal } from 'vscode';
import { terminal } from './terminal';
import { CompileRunManager } from './compile-run-manager';

export function activate(context: ExtensionContext) {
    const compileRunManager = new CompileRunManager();

    const compile = commands.registerCommand('extension.Compile', async () => {
        await compileRunManager.compile();
    });

    const run = commands.registerCommand('extension.Run', async () => {
        await compileRunManager.run();
    });

    const compileRun = commands.registerCommand('extension.CompileRun', async () => {
        await compileRunManager.compileRun();
    });

    const customCompile = commands.registerCommand('extension.CustomCompile', async () => {
        await compileRunManager.compile(true);
    });

    const customRun = commands.registerCommand('extension.CustomRun', async () => {
        await compileRunManager.compile(true);
    });

    const customCompileRun = commands.registerCommand('extension.CustomCompileRun', async () => {
        await compileRunManager.compileRun(true, true);
    });

    context.subscriptions.push(compile);
    context.subscriptions.push(run);
    context.subscriptions.push(compileRun);
    context.subscriptions.push(customCompile);
    context.subscriptions.push(customRun);
    context.subscriptions.push(customCompileRun);

    // Free resources when manually closing a terminal
    context.subscriptions.push(
        window.onDidCloseTerminal((closedTerminal: Terminal) => {
            terminal.dispose(closedTerminal.name);
        })
    );
}

export function deactivate() {
}
