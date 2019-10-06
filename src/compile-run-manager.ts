import { File } from './models/file';
import { Compile } from './compile';
import { Run } from './run';

export class CompileRunManager {
    private file: File;

    constructor(file: File) {
        this.file = file;
    }

    public compile(shouldAskForInputFlags = false) {
        const compile = new Compile(this.file, shouldAskForInputFlags);
        compile.run()
            .catch(error => console.error(error));
    }

    public run(shouldAskForArgs = false) {
        const run = new Run(this.file, shouldAskForArgs);
        run.run()
            .catch(error => console.error(error));
    }

    public compileRun(shouldAskForInputFlags = false, shouldAskForArgs = false) {
        const compile = new Compile(this.file, shouldAskForInputFlags);
        const run = new Run(this.file, shouldAskForArgs);

        compile.run()
            .then(() => {
                run.run()
                    .catch(error => console.error(error));
            }).catch(error => console.error(error));
    }
}
