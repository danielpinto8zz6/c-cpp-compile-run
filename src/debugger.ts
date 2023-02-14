import { existsSync } from "fs";
import { File } from "./models/file";
import { Configuration } from "./configuration";
import { Notification } from "./notification";
import path = require("path");
import { debug, DebugConfiguration, Uri, workspace } from "vscode";

export class Debugger {
    private file: File;

    constructor(file: File) {
        this.file = file;
    }

    async debug(): Promise<void> {
        if (!existsSync(this.file.path)) {
            Notification.showErrorMessage(`"${this.file.path}" doesn't exists!`);

            return;
        }

        let outputLocation = Configuration.outputLocation();
        if (!outputLocation) {
            outputLocation = path.join(this.file.directory, "output");
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
            program: path.join(outputLocation, this.file.executable)
        };

        const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(this.file.directory));

        await debug.startDebugging(
            workspaceFolder,
            debugConfiguration,
        );
    }
}