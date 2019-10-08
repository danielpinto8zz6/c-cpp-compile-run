import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../extension';

suite('Extension Test Suite', () => {
    before(() => {
        vscode.window.showInformationMessage('Start all tests.');
    });

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('danielpinto8zz6.c-cpp-compile-run'));
    });

    test('should activate', () => {
        const ext = vscode.extensions.getExtension('danielpinto8zz6.c-cpp-compile-run');
        assert.notStrictEqual(ext, null);
        return ext.activate().then(() => {
            assert.ok(true);
        });
    });
});
