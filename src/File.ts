import { basename, extname, dirname } from 'path';
import { TextDocument } from 'vscode';

export class File {
    private _path: string;
    private _name: string;
    private _title: string;
    private _directory: string;
    private _extension: string;
    private _executable: string;

    constructor(file: TextDocument) {
        this._path = file.fileName;
        this._name = basename(this._path);
        this._title = basename(this._path, extname(this._path));
        this._directory = dirname(this._path);
        this._extension = file.languageId;
        this._executable = this._title;

        if (process.platform === 'win32') {
            this._executable = `${this._executable}.exe`;
        }
    }

    /**
     * Getter path
     * @return {string}
     */
    public get path(): string {
        return this._path;
    }

    /**
     * Getter name
     * @return {string}
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Getter directory
     * @return {string}
     */
    public get directory(): string {
        return this._directory;
    }

    /**
     * Getter extension
     * @return {string}
     */
    public get extension(): string {
        return this._extension;
    }

    /**
     * Getter executable
     * @return {string}
     */
    public get executable(): string {
        return this._executable;
    }

    /**
     * Getter title
     * @return {string}
     */
    public get title(): string {
        return this._title;
    }
}
