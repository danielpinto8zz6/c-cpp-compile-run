'use strict';

import { workspace } from "vscode";

export namespace Settings {
    function getSetting<T>(name: string): T | undefined {
        return workspace.getConfiguration("c-cpp-compile-run", null).get<T>(name);
    }

    export function cCompiler() {
        return getSetting<string>("c-compiler").trim();
    }

    export function cFlags() {
        return getSetting<string>("c-flags").trim();
    }

    export function cppCompiler() {
        return getSetting<string>("cpp-compiler").trim();
    }

    export function cppFlags() {
        return getSetting<string>("cpp-flags").trim();
    }

    export function saveBeforeCompile() {
        return getSetting<boolean>("save-before-compile");
    }

    export function runArgs() {
        return getSetting<string>("run-args").trim();
    }

    export function runInExternalTerminal() {
        return getSetting<boolean>("run-in-external-terminal");
    }

    export namespace External {
        export function defaultWindowsShell(): string {
            return workspace.getConfiguration("terminal").get<string>("integrated.shell.windows").trim();
        }
    }
}