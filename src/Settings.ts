import { workspace } from "vscode";

export namespace Settings { 
    export function cCompiler(): string {
        return workspace.getConfiguration("").get<string>("c-cpp-compile-run.c-compiler");
    }
    export function cppCompiler(): string {
        return workspace.getConfiguration("").get<string>("c-cpp-compile-run.cpp-compiler");
    }
    export function saveBeforeCompile(): boolean {
        return workspace.getConfiguration("").get<boolean>("c-cpp-compile-run.save-before-compile");
    }
}