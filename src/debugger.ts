import { existsSync } from "fs";
import { File } from "./models/file";
import { Notification } from "./notification";
import path = require("path");
import { debug, DebugConfiguration, Uri, workspace, extensions, window, commands } from "vscode";
import { getOutputLocation } from "./utils/file-utils";

const CPPTOLS_EXTENSION_ID = "ms-vscode.cpptools";

export class Debugger {
    private file: File;

    constructor(file: File) {
        this.file = file;
    }

    async debug(): Promise<void> {
        if (!existsSync(this.file.path)) {
            Notification.showErrorMessage(`Source file "${this.file.path}" does not exist.`);
            return;
        }

        const outputLocation = getOutputLocation(this.file);
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
            MIMode: "gdb",
            miDebuggerPath: "gdb",
            program: executablePath
        };

        const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(this.file.directory));

        const started = await debug.startDebugging(workspaceFolder, debugConfiguration);
        if (!started) {
            Notification.showErrorMessage("Failed to start debugging session.");
        }
    }
}