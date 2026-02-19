import { commands, ExtensionContext, Terminal, window } from "vscode";
import { CompileRunManager } from "./compile-run-manager";
import { Configuration } from "./configuration";
import { FileType } from "./enums/file-type";
import { StatusBar } from "./status-bar";
import { terminal } from "./terminal";
import { getFileType } from "./utils/file-type-utils";

export function activate(context: ExtensionContext) {
    const compileRunManager = new CompileRunManager();

    // Helper to register and push commands
    function register(cmd: string, handler: () => Promise<void>) {
        context.subscriptions.push(commands.registerCommand(cmd, handler));
    }

    register("extension.Compile", () => compileRunManager.compile());
    register("extension.Run", () => compileRunManager.run(false, Configuration.runInExternalTerminal()));
    register("extension.Debug", () => compileRunManager.debug());
    register("extension.CompileRun", () => compileRunManager.compileRun(false, false, Configuration.runInExternalTerminal()));
    register("extension.CustomCompile", () => compileRunManager.compile(true));
    register("extension.CustomRun", () => compileRunManager.run(true, Configuration.runInExternalTerminal()));
    register("extension.CustomCompileRun", () => compileRunManager.compileRun(true, true, Configuration.runInExternalTerminal()));
    register("extension.CompileRunInExternalTerminal", () => compileRunManager.compileRun(false, false, true));

    // Dispose terminal resources when closed
    context.subscriptions.push(
        window.onDidCloseTerminal((closedTerminal: Terminal) => {
            terminal.dispose(closedTerminal.name);
        })
    );

    // Status bar management
    const statusBar = new StatusBar(context);
    statusBar.showAll();

    context.subscriptions.push(
        window.onDidChangeActiveTextEditor(() => {
            const activeFileType = getFileType(window.activeTextEditor?.document?.languageId);
            if (activeFileType === FileType.c || activeFileType === FileType.cplusplus) {
                statusBar.showAll();
            } else {
                statusBar.hideAll();
            }
        })
    );
}

export function deactivate() {}