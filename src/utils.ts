import * as vscode from 'vscode';

export namespace Utils {
    let _channel: vscode.OutputChannel;
    export function getOutputChannel(): vscode.OutputChannel {
        if (!_channel) {
            _channel = vscode.window.createOutputChannel('C/C++ Compile Run');
        }
        return _channel;
    }
}