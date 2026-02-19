import { File } from "../models/file";
import { TextDocument, workspace } from "vscode";
import { basename, extname, dirname, isAbsolute, join, relative } from "path";
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
export function getOutputLocation(file: File, createIfNotExists: boolean = false): string {
    let outputLocation = Configuration.outputLocation();

    // Resolve workspaceFolder or pwd
    const workspaceFolder = workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
    outputLocation = outputLocation
        .replace("${workspaceFolder}", workspaceFolder)
        .replace("${pwd}", process.cwd());

    // Always use the outputLocation as the base directory
    let finalOutputDir = outputLocation;

    if (outputLocation) {
        const relativePath = relative(workspaceFolder, file.directory);
        if (!relativePath.startsWith("..") && !isAbsolute(relativePath)) {
            finalOutputDir = join(outputLocation, relativePath);
        }
    }

    if (createIfNotExists && !fse.existsSync(finalOutputDir)) {
        fse.mkdirpSync(finalOutputDir);
    }

    return finalOutputDir;
}