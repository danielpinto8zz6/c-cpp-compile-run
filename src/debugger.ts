import { existsSync } from "fs";
import { File } from "./models/file";
import { Notification } from "./notification";
import path = require("path");
import { debug, DebugConfiguration, Uri, workspace, extensions, window, commands } from "vscode";
import { getOutputLocation } from "./utils/file-utils";
import { Configuration } from "./configuration";
import { ensureWorkspaceIsTrusted } from "./utils/workspace-utils";

const CPPTOLS_EXTENSION_ID = "ms-vscode.cpptools";

export class Debugger {
    private file: File;

    constructor(file: File) {
        this.file = file;
    }

    async debug(): Promise<void> {
        if (!await ensureWorkspaceIsTrusted("debug")) { return; }

        if (!existsSync(this.file.path)) {
            Notification.showErrorMessage(`Source file "${this.file.path}" does not exist.`);
            return;
        }

        const outputLocation = getOutputLocation(false, this.file.directory);
        const executablePath = path.join(outputLocation, this.file.executable);

        if (!existsSync(executablePath)) {
            Notification.showErrorMessage(`Executable "${executablePath}" not found. Please compile before debugging.`);
            return;
        }

        // Check if cpptools extension is installed
        if (!extensions.getExtension(CPPTOLS_EXTENSION_ID)) {
            const install = "Install C/C++ Extension";
            const choice = await window.showErrorMessage(
                "C/C++ Debugger (cpptools) extension is not installed. Debugging is not available.",
                install
            );
            if (choice === install) {
                await commands.executeCommand("workbench.extensions.installExtension", CPPTOLS_EXTENSION_ID);
            }
            return;
        }

        const debugConfiguration: DebugConfiguration = {
            name: "C/C++ Compile Run: Debug",
            type: "cppdbg",
            request: "launch",
            stopAtEntry: false,
            cwd: this.file.directory,
            externalConsole: false,
            MIMode: Configuration.debuggerMIMode(),
            program: executablePath
        };

        const debuggerPath = Configuration.debuggerPath();
        if (debuggerPath) {
            debugConfiguration.miDebuggerPath = debuggerPath;
        } else if (debugConfiguration.MIMode === "gdb") {
            debugConfiguration.miDebuggerPath = "gdb";
        }

        const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(this.file.directory));

        const started = await debug.startDebugging(workspaceFolder, debugConfiguration);
        if (!started) {
            Notification.showErrorMessage("Failed to start debugging session.");
        }
    }
}