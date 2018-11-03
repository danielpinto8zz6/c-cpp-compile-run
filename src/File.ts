import { basename, extname, dirname } from 'path';
import { TextDocument } from 'vscode';

export class File {
    private path: string;
    private name: string;
    private title: string;
    private directory: string;
    private extension: string;
    private executable: string;

    constructor(file: TextDocument) {
        this.path = file.fileName;
        this.name = basename(this.path);
        this.title = basename(this.path, extname(this.path));
        this.directory = dirname(this.path);
        this.extension = file.languageId;
        if (process.platform === 'win32') {
            this.executable = `${this.title}.exe`;
        } else {
            this.executable = `${this.title}`;
        }
    }

    /**
     * Getter $path
     * @return {string}
     */
    public get $path(): string {
        return this.path;
    }

    /**
     * Getter $name
     * @return {string}
     */
    public get $name(): string {
        return this.name;
    }

    /**
     * Getter $directory
     * @return {string}
     */
    public get $directory(): string {
        return this.directory;
    }

    /**
     * Getter $extension
     * @return {string}
     */
    public get $extension(): string {
        return this.extension;
    }

    /**
     * Getter $executable
     * @return {string}
     */
    public get $executable(): string {
        return this.executable;
    }

    /**
     * Getter $title
     * @return {string}
     */
    public get $title(): string {
        return this.title;
    }
}
