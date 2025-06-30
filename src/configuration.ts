import { workspace, ConfigurationTarget } from "vscode";
import { FileType } from "./enums/file-type";

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

    static defaultWindowsShell(): string {
        return workspace.getConfiguration("terminal").get<string>("integrated.shell.windows")?.trim() ?? "";
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

    static async setCompiler(compiler: string, type: FileType): Promise<void> {
        const key = type === FileType.c ? "c-compiler" : "cpp-compiler";
        await workspace.getConfiguration("c-cpp-compile-run", null).update(key, compiler, ConfigurationTarget.Global);
    }
}