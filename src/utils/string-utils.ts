export function isStringNullOrWhiteSpace(str: any): boolean {
    return str === undefined || str === null
        || typeof str !== "string"
        || str.match(/^ *$/) !== null;
}

export function escapeStringAppleScript(str: string) {
    return str.replace(/[\\"]/g, '\\$&');
}
