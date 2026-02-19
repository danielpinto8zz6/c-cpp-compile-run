import { File } from "../models/file";
import { TextDocument, workspace } from "vscode";
import { basename, extname, dirname, isAbsolute, join } from "path";
import { getFileType } from "./file-type-utils";
import * as fse from "fs-extra";
import { Configuration } from "../configuration";

/**
 * Parses a VS Code TextDocument into a File object used by the extension.
 */
export function parseFile(doc: TextDocument): File {
    const fileName = doc.fileName;
    const fileTitle = basename(fileName, extname(fileName));
    const fileType = getFileType(doc.languageId);

    return {
        path: fileName,
        name: basename(fileName),
        title: fileTitle,
        directory: dirname(fileName),
        type: fileType,
        executable: process.platform === "win32" ? `${fileTitle}.exe` : fileTitle
    };
}

/**
 * Returns the output directory for the compiled file.
 * If createIfNotExists is true, ensures the directory exists.
 */
export function getOutputLocation(createIfNotExists: boolean = false, baseDir?: string): string {
    let outputLocation = Configuration.outputLocation();

    const workspaceFolder = workspace.workspaceFolders?.[0]?.uri.fsPath;
    const root = workspaceFolder ?? baseDir ?? process.cwd();

    if (!outputLocation) {
        return root;
    }

    outputLocation = outputLocation
        .replace("${workspaceFolder}", root)
        .replace("${pwd}", process.cwd());

    if (!isAbsolute(outputLocation)) {
        outputLocation = join(root, outputLocation);
    }

    if (createIfNotExists && !fse.existsSync(outputLocation)) {
        fse.mkdirpSync(outputLocation);
    }

    return outputLocation;
}