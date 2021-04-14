import { File } from "./models/file";
import { Compiler } from "./compiler";
import { Runner } from "./runner";
import { window } from "vscode";
import { Configuration } from "./configuration";
import { parseFile } from "./utils/file-utils";
import { Result } from "./enums/result";
import { Notification } from "./notification";

export class CompileRunManager {
    public async compile(shouldAskForInputFlags = false) {
        const file = await this.getFile();
        if (file === null) {
            return;
        }

        const compiler = new Compiler(file, shouldAskForInputFlags);
        await compiler.compile();
    }

    public async run(shouldAskForArgs = false, shouldRunInExternalTerminal = false) {
        const file = await this.getFile();
        if (file === null) {
            return;
        }

        const runner = new Runner(file, shouldAskForArgs);
        await runner.run(shouldRunInExternalTerminal);
    }

    public async compileRun(shouldAskForInputFlags = false, shouldAskForArgs = false, shouldRunInExternalTerminal = false) {
        const file = await this.getFile();
        if (file === null) {
            return;
        }

        const compiler = new Compiler(file, shouldAskForInputFlags);

        const runner = new Runner(file, shouldAskForArgs);

        const compileResult = await compiler.compile();
        if (compileResult === Result.success) {
            await runner.run(shouldRunInExternalTerminal);
        }
    }

    public async getFile(): Promise<File> {
        if (!window || !window.activeTextEditor || !window.activeTextEditor.document) {
           Notification.showErrorMessage("Invalid document!");

            return null;
        }

        const doc = window.activeTextEditor?.document;
        if (doc?.isUntitled && !Configuration.saveBeforeCompile()) {
            Notification.showErrorMessage("Please save file first then try again!");

            return null;
        }

        return parseFile(doc);
    }
}
