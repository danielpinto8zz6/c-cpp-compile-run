import { FileType } from '../enums/file-type';

export interface File {
    path: string;
    name: string;
    title: string;
    directory: string;
    type: FileType;
    executable: string;
}
