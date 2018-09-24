import { workspace } from "vscode";

export namespace Settings { 
    export function cCompiler(): string {
        return workspace.getConfiguration("").get<string>("c-compiler");
    }
    export function cppCompiler(): string {
        return workspace.getConfiguration("").get<string>("cpp-compiler");
    }
    export function saveBeforeCompile(): boolean {
        return workspace.getConfiguration("").get<boolean>("save-before-compile");
    }
}