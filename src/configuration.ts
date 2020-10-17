import { workspace, ConfigurationTarget } from 'vscode';
import { FileType } from './enums/file-type';

export class Configuration {
    static getSetting<T>(name: string): T | undefined {
        return workspace.getConfiguration('c-cpp-compile-run', null).get<T>(name);
    }

    static cCompiler() {
        return this.getSetting<string>('c-compiler')?.trim();
    }

    static cFlags() {
        return this.getSetting<string>('c-flags')?.trim();
    }

    static cppCompiler() {
        return this.getSetting<string>('cpp-compiler')?.trim();
    }

    static cppFlags() {
        return this.getSetting<string>('cpp-flags')?.trim();
    }

    static saveBeforeCompile() {
        return this.getSetting<boolean>('save-before-compile');
    }

    static runArgs() {
        return this.getSetting<string>('run-args')?.trim();
    }

    static runInExternalTerminal() {
        return this.getSetting<boolean>('run-in-external-terminal');
    }

    static defaultWindowsShell() {
        return workspace.getConfiguration('terminal').get<string>('integrated.shell.windows')?.trim();
    }

    static linuxTerminal() {
        return workspace.getConfiguration().get<string>('terminal.external.linuxExec');
    }

    static async setCompiler(compiler: string, type: FileType) {
        const key = type === FileType.c ? 'c-compiler' : 'cpp-compiler';
        await workspace.getConfiguration('c-cpp-compile-run', null).update(key, compiler, ConfigurationTarget.Global);
    }
}
