export function isStringNullOrWhiteSpace(str: any): boolean {
    return str === undefined || str === null
        || typeof str !== "string"
        || str.match(/^ *$/) !== null;
}

export function escapeStringAppleScript(str: string) {
    return str.replace(/[\\"]/g, "\\$&");
}

export function splitArgs(input: string | undefined): string[] {
    if (!input) {
        return [];
    }

    const args: string[] = [];
    let current = "";
    let quote: "'" | '"' | null = null;
    let escaped = false;

    for (let i = 0; i < input.length; i += 1) {
        const ch = input[i];

        if (escaped) {
            current += ch;
            escaped = false;
            continue;
        }

        if (ch === "\\") {
            escaped = true;
            continue;
        }

        if (quote) {
            if (ch === quote) {
                quote = null;
            } else {
                current += ch;
            }
            continue;
        }

        if (ch === '"' || ch === "'") {
            quote = ch as "'" | '"';
            continue;
        }

        if (/\s/.test(ch)) {
            if (current.length > 0) {
                args.push(current);
                current = "";
            }
            continue;
        }

        current += ch;
    }

    if (current.length > 0) {
        args.push(current);
    }

    return args;
}
