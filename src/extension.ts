'use strict';

import * as vscode from 'vscode';
import * as path from "path";
import { VSCodeUI } from "./VSCodeUI";

export function activate(context: vscode.ExtensionContext) {
    let CompileRunCommand = vscode.commands.registerCommand('extension.CompileRun', () => {
        let currentFile = vscode.window.activeTextEditor.document.fileName;

        if (!currentFile) {
            return;
        }

        let outputFile = path.join(path.parse(currentFile).dir, path.parse(currentFile).name);
        if (process.platform === 'win32') {
            outputFile = outputFile + '.exe';
        }

        const spawn = require('child_process').spawn;
        let run;

        let args = ['-Wall', '-Wextra'];
        args.push(currentFile, '-o', outputFile);

        switch (path.parse(currentFile).ext) {
            case '.cpp': {
                run = spawn('g++', args);
                break;
            }
            case '.c': {
                run = spawn('gcc', args);
                break;
            }
            default: {
                return;
            }
        }

        run.stderr.on('data', (data: any) => {
            getOutputChannel().appendLine(data);
            getOutputChannel().show(true);
        });

        run.on('close', function (data: any) {
            if (data === 0) {
                // Compiled successfully let's tell the user & execute
                vscode.window.showInformationMessage("Compiled successfuly!");
                VSCodeUI.runInTerminal(`"${outputFile}"`);
            } else {
                // Error compiling
                vscode.window.showErrorMessage("Error compiling!");
            }
        });
    });

    context.subscriptions.push(CompileRunCommand);

    context.subscriptions.push(vscode.window.onDidCloseTerminal((closedTerminal: vscode.Terminal) => {
        VSCodeUI.onDidCloseTerminal(closedTerminal);
    }));

    let _channel: vscode.OutputChannel;
    function getOutputChannel(): vscode.OutputChannel {
        if (!_channel) {
            _channel = vscode.window.createOutputChannel('C/C++ Compile Run');
        }
        return _channel;
    }
}

export function deactivate() {
}