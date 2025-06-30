import { window } from "vscode";

/**
 * Prompts the user to input a compiler path.
 */
export async function promptCompiler(): Promise<string> {
    return await window.showInputBox({
        prompt: "Enter the path to the compiler executable",
        placeHolder: "/usr/bin/gcc or C:\\TDM-GCC-64\\bin\\gcc.exe"
    }) ?? "";
}

/**
 * Prompts the user to input compiler flags.
 */
export async function promptFlags(defaultFlags: string): Promise<string> {
    return await window.showInputBox({
        prompt: "Enter compiler flags",
        placeHolder: "-Wall -Wextra -g3",
        value: defaultFlags
    }) ?? defaultFlags;
}

/**
 * Prompts the user to input program arguments.
 */
export async function promptRunArguments(defaultArgs: string): Promise<string> {
    return await window.showInputBox({
        prompt: "Enter program arguments",
        value: defaultArgs
    }) ?? defaultArgs;
}