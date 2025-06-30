import { ExtensionContext, StatusBarAlignment, StatusBarItem, window } from "vscode";

export class StatusBar {
    private statusBarItems: StatusBarItem[];

    constructor(context: ExtensionContext) {
        this.statusBarItems = [
            this.createStatusBarItem("$(play) Compile & Run", "extension.CompileRun", 0),
            this.createStatusBarItem("$(gear) Compile", "extension.Compile", 1),
            this.createStatusBarItem("$(bug) Debug", "extension.Debug", 2)
        ];
        this.statusBarItems.forEach(item => context.subscriptions.push(item));
    }

    private createStatusBarItem(text: string, command: string, priority: number): StatusBarItem {
        const item = window.createStatusBarItem(StatusBarAlignment.Left, priority);
        item.text = text;
        item.command = command;
        return item;
    }

    public showAll(): void {
        this.statusBarItems.forEach(item => item.show());
    }

    public hideAll(): void {
        this.statusBarItems.forEach(item => item.hide());
    }
}