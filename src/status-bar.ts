import { ExtensionContext, StatusBarAlignment, StatusBarItem, window } from "vscode";

export class StatusBar {
    statusBarItems: StatusBarItem[] = [this.compileRun(), this.compile(), this.debug()];

    constructor(context: ExtensionContext) {
        this.statusBarItems.forEach((item) => {
            context.subscriptions.push(item);
        });
    }

    compileRun(): StatusBarItem {
        const item: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 0);
        item.text = "$(play) Compile & Run";
        item.command = "extension.CompileRun";

        return item;
    }

    compile(): StatusBarItem {
        const item: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 0);
        item.text = "$(gear) Compile";
        item.command = "extension.Compile";

        return item;
    }

    debug(): StatusBarItem {
        const item: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 0);
        item.text = "$(bug) Debug";
        item.command = "extension.Debug";

        return item;
    }

    public showAll() {
        this.statusBarItems.forEach((item) => {
            item.show();
        });
    }

    public hideAll() {
        this.statusBarItems.forEach((item) => {
            item.hide();
        });
    }
}
