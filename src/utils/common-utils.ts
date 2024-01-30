import find from "find-process";
import { lookpath } from "lookpath";
import { isStringNullOrWhiteSpace } from "./string-utils";

export async function commandExists(command: string): Promise<boolean> {
    const result = await lookpath(command);
    return isStringNullOrWhiteSpace(result) ? true : false;
}

export async function isProccessRunning(proccess: string): Promise<boolean> {
    // Temporary workaround for wsl
    const isWsl = require("is-wsl");
    if (isWsl){
        return false;
    }
    const list = await find("name", proccess, true);
    return list.length > 0;
}
