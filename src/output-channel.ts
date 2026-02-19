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

    public dispose(): void {
        this.channel.dispose();
    }
}

export const outputChannel = new OutputChannel();