import { workspace } from "vscode";

export namespace Settings {
    export enum key {
        cCompilerPath = "c-compiler-path",
        cCompilerArgs = "c-compiler-args",
        cppCompilerPath = "cpp-compiler-path",
        cppCompilerArgs = "cpp-compiler-args",
        saveBeforeCompile = "save-before-compile",
        runArgs = "run-args"
    }

    export function getSetting<T>(name: string): T | undefined {
        return workspace.getConfiguration("c-cpp-compile-run", null).get<T>(name);
    }
    export let cCompilerPath = () => getSetting<string>(key.cCompilerPath);
    export let cCompilerArgs = () => getSetting<Array<string>>(key.cCompilerArgs);
    export let cppCompilerPath = () => getSetting<string>(key.cppCompilerPath);
    export let cppCompilerArgs = () => getSetting<Array<string>>(key.cppCompilerArgs);
    export let saveBeforeCompile = () => getSetting<boolean>(key.saveBeforeCompile);
    export let runArgs = () => getSetting<Array<string>>(key.runArgs);
}