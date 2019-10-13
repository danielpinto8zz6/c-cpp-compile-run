import { lookpath } from 'lookpath';
import find from 'find-process';

export async function commandExists(command: string): Promise < boolean > {
    return await lookpath(command) !== null ? true : false;
}

export async function isProccessRunning(proccess: string): Promise<boolean> {
    const list = await find('name', proccess, true);
    return list.length > 0;
}
