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
export function getOutputLocation(createIfNotExists: boolean = false, baseDir?: string): string {
    let outputLocation = Configuration.outputLocation();
    const mirrorOutputLocation = Configuration.mirrorOutputLocation();

    const workspaceFolder = workspace.workspaceFolders?.[0]?.uri.fsPath;

    if (!outputLocation) {
        return baseDir ?? workspaceFolder ?? process.cwd();
    }

    outputLocation = outputLocation
        .replace("${workspaceFolder}", workspaceFolder ?? process.cwd())
        .replace("${pwd}", process.cwd());

    if (mirrorOutputLocation) {
        // Mirror mode: the workspace root is the anchor for relative paths so that
        // the full source-relative folder structure can be replicated under the output dir.
        // Workspace folder takes priority over baseDir here because mirroring only makes
        // sense relative to the workspace root.
        const root = workspaceFolder ?? baseDir ?? process.cwd();
        if (!isAbsolute(outputLocation)) {
            outputLocation = join(root, outputLocation);
        }
        if (baseDir && workspaceFolder) {
            const relativePath = relative(workspaceFolder, baseDir);
            if (relativePath && !relativePath.startsWith("..")) {
                outputLocation = join(outputLocation, relativePath);
            }
        }
    } else {
        // Default (no mirroring): output path is relative to the source file's
        // directory (baseDir), falling back to workspace root.
        const root = baseDir ?? workspaceFolder ?? process.cwd();
        if (!isAbsolute(outputLocation)) {
            outputLocation = join(root, outputLocation);
        }
    }

    if (createIfNotExists && !fse.existsSync(outputLocation)) {
        fse.mkdirpSync(outputLocation);
    }

    return outputLocation;
}