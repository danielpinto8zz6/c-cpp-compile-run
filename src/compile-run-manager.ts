import { File } from './models/file';
import { Compile } from './compile';
import { Run } from './run';
import { window } from 'vscode';
import { Configuration } from './configuration';
import { parseFile } from './utils/file-utils';

export class CompileRunManager {
    constructor() {
    }

    public compile(shouldAskForInputFlags = false) {
        const file = this.getFile();

        const compile = new Compile(file, shouldAskForInputFlags);
        compile.run()
            .catch(error => console.error(error));
    }

    public run(shouldAskForArgs = false) {
        const file = this.getFile();

        const run = new Run(file, shouldAskForArgs);
        run.run()
            .catch(error => console.error(error));
    }

    public compileRun(shouldAskForInputFlags = false, shouldAskForArgs = false) {
        const file = this.getFile();

        const compile = new Compile(file, shouldAskForInputFlags);
        const run = new Run(file, shouldAskForArgs);

        compile.run()
            .then(() => {
                run.run()
                    .catch(error => console.error(error));
            }).catch(error => console.error(error));
    }

    public getFile(): File {
        const doc = window.activeTextEditor.document;
        if (!doc) { return; }

        if (doc.isUntitled && !Configuration.saveBeforeCompile()) {
            window.showErrorMessage(`Please save file first then try again!`);
            return;
        }

        return parseFile(doc);
    }
}
