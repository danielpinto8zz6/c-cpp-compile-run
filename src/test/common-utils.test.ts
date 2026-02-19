import * as assert from "assert";
import { isWindows } from "../utils/common-utils";

suite("Common Utils Test Suite", () => {
    test("isWindows should return a boolean", () => {
        const result = isWindows();
        assert.strictEqual(typeof result, "boolean");
        // Verify it matches the actual platform
        assert.strictEqual(result, process.platform === "win32");
    });
});