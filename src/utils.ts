import * as vscode from 'vscode';

export namespace Utils {
    let _channel: vscode.OutputChannel;
    export function getOutputChannel(): vscode.OutputChannel {
        if (!_channel) {
            _channel = vscode.window.createOutputChannel('C/C++ Compile Run');
        }
        return _channel;
    }

    export function getCCompiler(): string {
        const cCompiler: string = vscode.workspace.getConfiguration().get('c-cpp-compile-run.c-compiler');

        if (!cCompiler) {
            return "gcc";
        } else {
            return cCompiler;
        }
    }

    export function getCPPCompiler(): string {
        const cppCompiler: string = vscode.workspace.getConfiguration().get('c-cpp-compile-run.cpp-compiler');

        if (!cppCompiler) {
            return "g++";
        } else {
            return cppCompiler;
        }
    }

    export function getCFlags(): string[] {
        return ['-Wall', '-Wextra'];
    }

    export function getCPPFlags(): string[] {
        return ['-Wall', '-Wextra'];
    }
}