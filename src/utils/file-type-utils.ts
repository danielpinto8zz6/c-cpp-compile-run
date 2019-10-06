import { FileType } from '../enums/file-type';

export function getFileType(extension: string): FileType {
    if (extension === 'c' || extension === 'h') {
        return FileType.c;
    }

    if (extension === 'cpp' || extension === 'hpp') {
        return FileType.cplusplus;
    }

    return FileType.unkown;
}
