import { FileType } from "../enums/file-type";

/**
 * Returns the FileType based on the file extension or languageId.
 * Accepts common C/C++ extensions and language IDs.
 */
export function getFileType(extensionOrLangId: string): FileType {
    const ext = extensionOrLangId?.toLowerCase();

    if (["c", "h", "objective-c"].includes(ext)) {
        return FileType.c;
    }

    if (["cpp", "hpp", "cc", "cxx", "hh", "hxx", "c++", "cppm", "objective-cpp"].includes(ext)) {
        return FileType.cplusplus;
    }

    return FileType.unkown;
}