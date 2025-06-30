import { existsSync } from "fs";
import { File } from "./models/file";
import { Notification } from "./notification";
import path = require("path");
import { debug, DebugConfiguration, Uri, workspace } from "vscode";
import { getOutputLocation } from "./utils/file-utils";

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