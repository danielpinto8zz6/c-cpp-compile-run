import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import { parseFile } from "../utils/file-utils";
import { FileType } from "../enums/file-type";

suite("Extension Test Suite", () => {
	vscode.window.showInformationMessage("Start all tests.");

	test("parseFile should correctly map TextDocument to File model", () => {
		// Mocking a VS Code TextDocument
		const mockDoc = {
			fileName: process.platform === "win32" ? "C:\\project\\main.cpp" : "/project/main.cpp",
			languageId: "cpp"
		} as vscode.TextDocument;

		const file = parseFile(mockDoc);

		assert.strictEqual(file.name, "main.cpp");
		assert.strictEqual(file.title, "main");
		assert.strictEqual(file.type, FileType.cplusplus);
		
		if (process.platform === "win32") {
			assert.strictEqual(file.executable, "main.exe");
		} else {
			assert.strictEqual(file.executable, "main");
		}
	});
});
