import { File } from "../models/file";
import { TextDocument } from "vscode";
import { basename, extname, dirname } from "path";
import { getFileType } from "./file-type-utils";
import * as fse from "fs-extra";
import { Configuration } from "../configuration";
import path = require("path");

export function parseFile(doc: TextDocument): File {
    const file: File = {
        path: doc.fileName,
        name: basename(doc.fileName),
        title: basename(doc.fileName, extname(doc.fileName)),
        directory: dirname(doc.fileName),
        type: getFileType(doc.languageId),
        executable: process.platform === "win32"
            ? basename(doc.fileName, extname(doc.fileName)) + ".exe"
            : basename(doc.fileName, extname(doc.fileName))
    };

    return file;
}

export function getOutputLocation(file: File, createIfNotExists: boolean = false): string {
    let outputLocation = Configuration.outputLocation();
    if (!outputLocation) {
        outputLocation = file.directory;
    } else if (!path.isAbsolute(outputLocation)) {
        outputLocation = path.join(file.directory, outputLocation);
    }

    if (createIfNotExists === true && !fse.existsSync(outputLocation)) {
        fse.mkdirSync(outputLocation);
    }

    return outputLocation;
}
