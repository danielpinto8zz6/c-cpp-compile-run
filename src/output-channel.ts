import * as vscode from "vscode";

class OutputChannel implements vscode.Disposable {
    private readonly channel: vscode.OutputChannel = vscode.window.createOutputChannel("C/C++ Compile Run");

    public appendLine(message: string, title?: string): void {
        if (title) {
            const timestamp = new Date().toLocaleString();
            const header = `[${title} - ${timestamp}]`;
            this.channel.appendLine(header);
        }
        this.channel.appendLine(message);
    }

    public append(message: string): void {
        this.channel.append(message);
    }

    public show(preserveFocus: boolean = false): void {
        this.channel.show(preserveFocus);
    }

    public dispose(): void {
        this.channel.dispose();
    }

    public clear(): void {
        this.channel.clear();
    }
}

export const outputChannel = new OutputChannel();