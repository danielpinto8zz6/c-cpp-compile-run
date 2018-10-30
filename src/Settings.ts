'use strict';

import { workspace } from "vscode";

export namespace Settings {
    export enum key {
        cCompilerPath = "c-compiler-path",
        cCompilerArgs = "c-compiler-flags",
        cppCompilerPath = "cpp-compiler-path",
        cppCompilerArgs = "cpp-compiler-flags",
        saveBeforeCompile = "save-before-compile",
        runArgs = "run-args",
        runNewWindow = "run-new-window"
    }

    function getSetting<T>(name: string): T | undefined {
        return workspace.getConfiguration("c-cpp-compile-run", null).get<T>(name);
    }
    export let cCompilerPath = () => getSetting<string>(key.cCompilerPath);
    export let cCompilerArgs = () => getSetting<string>(key.cCompilerArgs);
    export let cppCompilerPath = () => getSetting<string>(key.cppCompilerPath);
    export let cppCompilerArgs = () => getSetting<string>(key.cppCompilerArgs);
    export let saveBeforeCompile = () => getSetting<boolean>(key.saveBeforeCompile);
    export let runArgs = () => getSetting<string>(key.runArgs);
    export let runNewWindow = () => getSetting<boolean>(key.runNewWindow);
}