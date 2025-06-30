import find = require("find-process");
import { lookpath } from "lookpath";
import { isStringNullOrWhiteSpace } from "./string-utils";
import isWsl from "is-wsl";

/**
 * Checks if a command exists in the system PATH.
 */
export async function commandExists(command: string): Promise<boolean> {
    const result = await lookpath(command);
    return !isStringNullOrWhiteSpace(result);
}

/**
 * Checks if a process with the given name is currently running.
 * Returns false on Windows and WSL for performance reasons.
 */
export async function isProcessRunning(processName: string): Promise<boolean> {
    if (isWindows() || isWsl) {
        return false;
    }
    try {
        const list = await find("name", processName, true);
        return list.length > 0;
    } catch (error) {
        return false;
    }
}

/**
 * Returns true if the current platform is Windows.
 */
export function isWindows(): boolean {
    return process.platform === "win32";
}