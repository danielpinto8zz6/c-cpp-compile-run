import { window } from "vscode";
import { Configuration } from "./configuration";
import { isStringNullOrWhiteSpace } from "./utils/string-utils";

export class Notification {
    private static shouldNotify(message: string): boolean {
        return Configuration.shouldShowNotifications() && !isStringNullOrWhiteSpace(message);
    }

    static showErrorMessage(message: string): void {
        if (this.shouldNotify(message)) {
            window.showErrorMessage(message);
        }
    }

    static showInformationMessage(message: string): void {
        if (this.shouldNotify(message)) {
            window.showInformationMessage(message);
        }
    }

    static showWarningMessage(message: string): void {
        if (this.shouldNotify(message)) {
            window.showWarningMessage(message);
        }
    }
}