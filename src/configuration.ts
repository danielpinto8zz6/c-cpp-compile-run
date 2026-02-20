import { workspace, ConfigurationTarget } from "vscode";
import { FileType } from "./enums/file-type";
import path = require("path");
import fse = require("fs-extra");

export class Configuration {
    private static getSetting<T>(name: string): T | undefined {
        return workspace.getConfiguration("c-cpp-compile-run", null).get<T>(name);
    }

    private static getStringSetting(name: string): string {
        return this.getSetting<string>(name)?.trim() ?? "";
    }

    static cCompiler(): string {
        return this.getStringSetting("c-compiler");
    }

    static cFlags(): string {
        return this.getStringSetting("c-flags");
    }

    static cLinkerFlags(): string {
        return this.getStringSetting("c-linker-flags");
    }

    static cppCompiler(): string {
        return this.getStringSetting("cpp-compiler");
    }

    static cppFlags(): string {
        return this.getStringSetting("cpp-flags");
    }

    static cppLinkerFlags(): string {
        return this.getStringSetting("cpp-linker-flags");
    }

    static saveBeforeCompile(): boolean {
        return this.getSetting<boolean>("save-before-compile") ?? true;
    }

    static runArgs(): string {
        return this.getStringSetting("run-args");
    }

    static runInExternalTerminal(): boolean {
        return this.getSetting<boolean>("run-in-external-terminal") ?? false;
    }

    static shouldShowNotifications(): boolean {
        return this.getSetting<boolean>("should-show-notifications") ?? true;
    }

    static outputLocation(): string {
        return this.getStringSetting("output-location");
    }

    static linuxTerminal(): string {
        return workspace.getConfiguration().get<string>("terminal.external.linuxExec") ?? "";
    }

    static osxTerminal(): string {
        return workspace.getConfiguration().get<string>("terminal.external.osxExec") ?? "";
    }

    static winTerminal(): string {
        return workspace.getConfiguration().get<string>("terminal.external.windowsExec") ?? "";
    }

    static customRunPrefix(): string {
        return this.getStringSetting("custom-run-prefix");
    }

    static debuggerMIMode(): string {
        return this.getStringSetting("debugger-mimode") || "gdb";
    }

    static debuggerPath(): string {
        return this.getStringSetting("debugger-path");
    }

    static async setCompiler(compiler: string, type: FileType): Promise<void> {
        const key = type === FileType.c ? "c-compiler" : "cpp-compiler";
        await workspace.getConfiguration("c-cpp-compile-run", null).update(key, compiler, ConfigurationTarget.Global);
    }

    static additionalIncludePaths(): string[] {
        const workspaceFolder = workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
        const paths = workspace.getConfiguration("c-cpp-compile-run", null).get<string[]>("additional-include-paths") ?? [];
        // Expand variables like ${workspaceFolder}
        return paths.map(p =>
            p.replace("${workspaceFolder}", workspaceFolder)
             .replace("${pwd}", process.cwd())
        );
    }

    static includePathsFromCppProperties(): string[] {
        const workspaceFolder = workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
        const cppPropsPath = path.join(workspaceFolder, ".vscode", "c_cpp_properties.json");
        if (!fse.existsSync(cppPropsPath)) {return [];}
        try {
            const json = fse.readJsonSync(cppPropsPath);
            const configs = json.configurations ?? [];
            // Use the first configuration or match by name if desired
            const config = configs[0];
            return (config?.includePath ?? [])
                .map((p: string) =>
                    p.replace("${workspaceFolder}", workspaceFolder)
                     .replace("${workspaceRoot}", workspaceFolder)
                )
                // Filter out glob patterns (e.g. "/**", "/**/*") that are valid for
                // IntelliSense but would be shell-expanded when passed as -I flags,
                // causing the compiler to receive all files in the folder as source files.
                .filter((p: string) => !p.includes("*") && !p.includes("?"));
        } catch {
            return [];
        }
    }
}