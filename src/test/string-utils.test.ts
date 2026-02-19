import * as assert from "assert";
import { isStringNullOrWhiteSpace, escapeStringAppleScript } from "../utils/string-utils";

suite("String Utils Test Suite", () => {
    test("isStringNullOrWhiteSpace should return true for empty or whitespace strings", () => {
        assert.strictEqual(isStringNullOrWhiteSpace(""), true);
        assert.strictEqual(isStringNullOrWhiteSpace("   "), true);
        assert.strictEqual(isStringNullOrWhiteSpace(null), true);
        assert.strictEqual(isStringNullOrWhiteSpace(undefined), true);
    });

    test("isStringNullOrWhiteSpace should return false for valid strings", () => {
        assert.strictEqual(isStringNullOrWhiteSpace("hello"), false);
        assert.strictEqual(isStringNullOrWhiteSpace("  hello  "), false);
        assert.strictEqual(isStringNullOrWhiteSpace("a"), false);
    });

    test("isStringNullOrWhiteSpace should return true for non-string types", () => {
        assert.strictEqual(isStringNullOrWhiteSpace(123), true);
        assert.strictEqual(isStringNullOrWhiteSpace({}), true);
        assert.strictEqual(isStringNullOrWhiteSpace([]), true);
    });

    test("escapeStringAppleScript should escape quotes and backslashes", () => {
        assert.strictEqual(escapeStringAppleScript('say "hello"'), 'say \\"hello\\"');
        assert.strictEqual(escapeStringAppleScript('C:\\path'), 'C:\\\\path');
        assert.strictEqual(escapeStringAppleScript('mixed "path"\\test'), 'mixed \\"path\\"\\\\test');
    });
});