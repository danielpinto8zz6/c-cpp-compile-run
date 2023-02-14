import { ExtensionContext, commands, window, Terminal } from "vscode";
import { terminal } from "./terminal";
import { CompileRunManager } from "./compile-run-manager";
import { Configuration } from "./configuration";

export function activate(context: ExtensionContext) {
    const compileRunManager = new CompileRunManager();

    const compile = commands.registerCommand("extension.Compile", async () => {
        await compileRunManager.compile();
    });

    const run = commands.registerCommand("extension.Run", async () => {
        await compileRunManager.run(false, Configuration.runInExternalTerminal());
    });

    const debug = commands.registerCommand("extension.Debug", async () => {
        await compileRunManager.debug();
    });

    const compileRun = commands.registerCommand("extension.CompileRun", async () => {
        await compileRunManager.compileRun(false, false, Configuration.runInExternalTerminal());
    });

    const customCompile = commands.registerCommand("extension.CustomCompile", async () => {
        await compileRunManager.compile(true);
    });

    const customRun = commands.registerCommand("extension.CustomRun", async () => {
        await compileRunManager.run(true);
    });

    const customCompileRun = commands.registerCommand("extension.CustomCompileRun", async () => {
        await compileRunManager.compileRun(true, true, Configuration.runInExternalTerminal());
    });

    const compileRunInExternalTerminal = commands.registerCommand("extension.CompileRunInExternalTerminal", async () => {
        await compileRunManager.compileRun(false, false, true);
    });

    context.subscriptions.push(compile);
    context.subscriptions.push(run);
    context.subscriptions.push(debug);
    context.subscriptions.push(compileRun);
    context.subscriptions.push(customCompile);
    context.subscriptions.push(customRun);
    context.subscriptions.push(customCompileRun);
    context.subscriptions.push(compileRunInExternalTerminal);

    // Free resources when manually closing a terminal
    context.subscriptions.push(
        window.onDidCloseTerminal((closedTerminal: Terminal) => {
            terminal.dispose(closedTerminal.name);
        })
    );
}

export function deactivate() {
}
