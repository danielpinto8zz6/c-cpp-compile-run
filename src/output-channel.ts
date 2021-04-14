import * as vscode from "vscode";

class OutputChannel implements vscode.Disposable {
    private readonly channel: vscode.OutputChannel = vscode.window.createOutputChannel("C/C++ Compile Run");

    public appendLine(message: any, title?: string): void {
        if (title) {
            const simplifiedTime: string = (new Date()).toISOString().replace(/z|t/gi, " ").trim(); // YYYY-MM-DD HH:mm:ss.sss
            const hightlightingTitle = `[${title} ${simplifiedTime}]`;
            this.channel.appendLine(hightlightingTitle);
        }
        this.channel.appendLine(message);
    }

    public append(message: any): void {
        this.channel.append(message);
    }

    public show(): void {
        this.channel.show();
    }

    public dispose(): void {
        this.channel.dispose();
    }

    public clear(): void {
        this.channel.clear();
    }
}

export const outputChannel: OutputChannel = new OutputChannel();
