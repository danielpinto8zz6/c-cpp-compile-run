import { workspace, ConfigurationTarget } from "vscode";
import { FileType } from "./enums/file-type";

export class Configuration {
    static getSetting<T>(name: string): T {
        return workspace.getConfiguration("c-cpp-compile-run", null).get<T>(name);
    }

    static cCompiler(): string {
        return this.getSetting<string>("c-compiler")?.trim();
    }

    static cFlags(): string {
        return this.getSetting<string>("c-flags")?.trim();
    }

    static cLinkerFlags(): string {
        return this.getSetting<string>("c-linker-flags")?.trim();
    }

    static cppCompiler(): string {
        return this.getSetting<string>("cpp-compiler")?.trim();
    }

    static cppFlags(): string {
        return this.getSetting<string>("cpp-flags")?.trim();
    }

    static cppLinkerFlags(): string {
        return this.getSetting<string>("cpp-linker-flags")?.trim();
    }

    static saveBeforeCompile(): boolean {
        return this.getSetting<boolean>("save-before-compile");
    }

    static runArgs(): string {
        return this.getSetting<string>("run-args")?.trim();
    }

    static runInExternalTerminal(): boolean {
        return this.getSetting<boolean>("run-in-external-terminal") ?? false;
    }

    static shouldShowNotifications(): boolean {
        return this.getSetting<boolean>("should-show-notifications") ?? true;
    }

    static outputLocation(): string {
        return this.getSetting<string>("output-location")?.trim();
    }

    static defaultWindowsShell(): string {
        return workspace.getConfiguration("terminal").get<string>("integrated.shell.windows")?.trim();
    }

    static linuxTerminal(): string {
        return workspace.getConfiguration().get<string>("terminal.external.linuxExec");
    }

    static osxTerminal(): string {
        return workspace.getConfiguration().get<string>("terminal.external.osxExec");
    }

    static winTerminal(): string {
        return workspace.getConfiguration().get<string>("terminal.external.windowsExec");
    }

    static customRunPrefix(): string {
        return this.getSetting<string>("custom-run-prefix");
    }

    static async setCompiler(compiler: string, type: FileType) {
        const key = type === FileType.c ? "c-compiler" : "cpp-compiler";
        await workspace.getConfiguration("c-cpp-compile-run", null).update(key, compiler, ConfigurationTarget.Global);
    }
}
