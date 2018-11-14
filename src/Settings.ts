'use strict';

import { workspace } from "vscode";

export namespace Settings {
    export enum key {
        cCompiler = "c-compiler",
        cFlags = "c-flags",
        cppCompiler = "cpp-compiler",
        cppFlags = "cpp-flags",
        saveBeforeCompile = "save-before-compile",
        runArgs = "run-args",
        runInExternalTerminal = "run-in-external-terminal",
    }

    function getSetting<T>(name: string): T | undefined {
        return workspace.getConfiguration("c-cpp-compile-run", null).get<T>(name);
    }
    export let cCompiler = () => getSetting<string>(key.cCompiler).trim();
    export let cFlags = () => getSetting<string>(key.cFlags).trim();
    export let cppCompiler = () => getSetting<string>(key.cppCompiler).trim();
    export let cppFlags = () => getSetting<string>(key.cppFlags).trim();
    export let saveBeforeCompile = () => getSetting<boolean>(key.saveBeforeCompile);
    export let runArgs = () => getSetting<string>(key.runArgs).trim();
    export let runInExternalTerminal = () => getSetting<boolean>(key.runInExternalTerminal);
}