import { File } from './models/file';
import { Compiler } from './compiler';
import { Runner } from './runner';
import { TextDocument, window } from 'vscode';
import { Configuration } from './configuration';
import { parseFile } from './utils/file-utils';
import { Result } from './enums/result';

export class CompileRunManager {
    public async compile(shouldAskForInputFlags = false) {
        const file = await this.getFile();
        if (file === null) {
            return;
        }

        const compiler = new Compiler(file, shouldAskForInputFlags);
        await compiler.compile();
    }

    public async run(shouldAskForArgs = false) {
        const file = await this.getFile();
        if (file === null) {
            return;
        }

        const runner = new Runner(file, shouldAskForArgs);
        await runner.run();
    }

    public async compileRun(shouldAskForInputFlags = false, shouldAskForArgs = false) {
        const file = await this.getFile();
        if (file === null) {
            return;
        }

        const compiler = new Compiler(file, shouldAskForInputFlags);

        const runner = new Runner(file, shouldAskForArgs);

        const compileResult = await compiler.compile();
        if (compileResult === Result.success) {
            await runner.run();
        }
    }

    public async getFile(): Promise<File | null> {
        if (!window || !window.activeTextEditor || !window.activeTextEditor.document) {
            window.showErrorMessage('Invalid document!');

            return null;
        }

        const doc = window.activeTextEditor?.document;
        if (doc?.isUntitled && !Configuration.saveBeforeCompile()) {
            window.showErrorMessage('Please save file first then try again!');

            return null;
        }

        return parseFile(doc as TextDocument);
    }
}
