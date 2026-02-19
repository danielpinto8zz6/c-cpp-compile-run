import * as assert from "assert";
import { getFileType } from "../utils/file-type-utils";
import { FileType } from "../enums/file-type";

suite("File Type Utils Test Suite", () => {
    test("Should identify C files", () => {
        assert.strictEqual(getFileType("c"), FileType.c);
        assert.strictEqual(getFileType("C"), FileType.c);
        assert.strictEqual(getFileType("h"), FileType.c);
        assert.strictEqual(getFileType("objective-c"), FileType.c);
    });

    test("Should identify C++ files", () => {
        assert.strictEqual(getFileType("cpp"), FileType.cplusplus);
        assert.strictEqual(getFileType("hpp"), FileType.cplusplus);
        assert.strictEqual(getFileType("cc"), FileType.cplusplus);
        assert.strictEqual(getFileType("cxx"), FileType.cplusplus);
        assert.strictEqual(getFileType("objective-cpp"), FileType.cplusplus);
    });

    test("Should return unknown for other types", () => {
        assert.strictEqual(getFileType("java"), FileType.unkown);
        assert.strictEqual(getFileType("txt"), FileType.unkown);
        assert.strictEqual(getFileType(""), FileType.unkown);
    });
});