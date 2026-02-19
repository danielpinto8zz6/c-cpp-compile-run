import * as assert from "assert";
import * as vscode from "vscode";
import { parseFile } from "../utils/file-utils";
import { FileType } from "../enums/file-type";

suite("File Utils Test Suite", () => {
    test("parseFile should correctly identify C files", () => {
        const mockDoc = {
            fileName: "test.c",
            languageId: "c"
        } as vscode.TextDocument;

        const file = parseFile(mockDoc);
        assert.strictEqual(file.type, FileType.c);
        assert.strictEqual(file.name, "test.c");
        assert.strictEqual(file.title, "test");
    });

    test("parseFile should correctly identify C++ files", () => {
        const mockDoc = {
            fileName: "main.cpp",
            languageId: "cpp"
        } as vscode.TextDocument;

        const file = parseFile(mockDoc);
        assert.strictEqual(file.type, FileType.cplusplus);
    });

    test("parseFile should handle files without extensions", () => {
        const mockDoc = { fileName: "Makefile", languageId: "makefile" } as vscode.TextDocument;
        const file = parseFile(mockDoc);
        assert.strictEqual(file.type, FileType.unknown);
    });
});