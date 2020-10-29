import { window } from 'vscode';
import { Configuration } from './configuration';
import { isStringNullOrWhiteSpace } from './utils/string-utils';

export class Notification {
    static showErrorMessage(message: string) {
        if (!Configuration.shouldShowNotifications()) {
            return;
        }

        if (isStringNullOrWhiteSpace(message)) {
            return;
        }

        window.showErrorMessage(message);
    }

    static showInformationMessage(message: string) {
        if (!Configuration.shouldShowNotifications()) {
            return;
        }

        if (isStringNullOrWhiteSpace(message)) {
            return;
        }

        window.showInformationMessage(message);
    }
}