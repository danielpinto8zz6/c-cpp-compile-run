import { spawnSync } from 'child_process';
import { window } from 'vscode';
import { Configuration } from './configuration';
import { FileType } from './enums/file-type';
import { File } from './models/file';
import { outputChannel } from './output-channel';
import { promptCompiler, promptFlags } from './utils/prompt-utils';
import { commandExists, isProccessRunning } from './utils/common-utils';

export class Compile {
    private file: File;
    private compiler: string;
    private inputFlags: string;
    private shouldAskForInputFlags: boolean;

    constructor(file: File, shouldAskForInputFlags = false) {
        this.file = file;
        this.shouldAskForInputFlags = shouldAskForInputFlags;
    }

    async run() {
        this.setCompiler().catch(error => { throw new Error(error); });

        if (Configuration.saveBeforeCompile()) {
            await window.activeTextEditor.document.save();
        }

        if (await isProccessRunning(this.file.executable)) {
            const errorMessage = `${this.file.executable} is already runing! Please close it first to compile successfully!`;
            window.showErrorMessage(errorMessage);
            throw new Error(errorMessage);
        }

        if (!this.isCompilerValid()) {
            const CHANGE_PATH = 'Change path';
            const choiceForDetails: string =
                await window.showErrorMessage('Compiler not found, try to change path in settings!', CHANGE_PATH);
            if (choiceForDetails === CHANGE_PATH) {
                this.compiler = await promptCompiler();

                if (this.compiler !== null && commandExists(this.compiler)) {
                    await Configuration.setCompiler(this.compiler, this.file.type);
                } else {
                    const errorMessage = 'Compiler not found';
                    await window.showErrorMessage(errorMessage);
                    throw new Error(errorMessage);
                }
            } else { throw new Error('Compiler not set!'); }
        }

        if (this.shouldAskForInputFlags) {
            this.inputFlags = await promptFlags(this.inputFlags);
            if (this.inputFlags === null) {
                throw new Error('No input flags specified');
            }
        }

        let compilerArgs = [this.file.name, '-o', this.file.executable];
        if (this.inputFlags) {
            compilerArgs = compilerArgs.concat(this.inputFlags.split(' '));
        }

        const proccess = spawnSync(this.compiler, compilerArgs, { cwd: this.file.directory, shell: true, encoding: 'utf-8' });

        if (proccess.output.length > 0) {
            outputChannel.appendLine(proccess.output.toLocaleString(), this.file.name);
        }

        if (proccess.status === 0) {
            window.showInformationMessage('Compiled successfuly!');
        } else {
            window.showErrorMessage('Error compiling!');
            outputChannel.show();
            throw new Error('error');
        }
    }

    async setCompiler() {
        if (this.file.type === null || this.file.type === FileType.unkown) {
            throw new Error('Invalid File!');
        }

        if (this.file.type === FileType.cplusplus) {
            this.compiler = Configuration.cppCompiler();
            this.inputFlags = Configuration.cppFlags();
        }

        if (this.file.type === FileType.c) {
            this.compiler = Configuration.cCompiler();
            this.inputFlags = Configuration.cFlags();
        }
    }

    async isCompilerValid(): Promise<boolean> {
        return this.compiler !== null && await commandExists(this.compiler);
    }
}
