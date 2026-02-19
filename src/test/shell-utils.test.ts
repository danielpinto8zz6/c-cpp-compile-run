import * as assert from "assert";
import { parseShell, getCommand, getRunPrefix } from "../utils/shell-utils";
import { ShellType } from "../enums/shell-type";

suite("Shell Utils Test Suite", () => {
    test("parseShell should identify common executables", () => {
        assert.strictEqual(parseShell("cmd.exe"), ShellType.cmd);
        assert.strictEqual(parseShell("powershell.exe"), ShellType.powerShell);
        assert.strictEqual(parseShell("pwsh"), ShellType.powerShell);
        assert.strictEqual(parseShell("bash"), ShellType.others);
        assert.strictEqual(parseShell("wsl.exe"), ShellType.wsl);
        assert.strictEqual(parseShell("ubuntu.exe"), ShellType.wsl);
        assert.strictEqual(parseShell("zsh"), ShellType.others);
    });

    test("getCommand should format for PowerShell correctly", () => {
        const cmd = "gcc main.c";
        assert.strictEqual(getCommand(cmd, ShellType.powerShell), `& ${cmd}`);
        assert.strictEqual(getCommand(cmd, ShellType.cmd), cmd);
        assert.strictEqual(getCommand(cmd, ShellType.others), cmd);
    });

    test("getRunPrefix should return correct prefix per shell", () => {
        // Windows shells
        assert.strictEqual(getRunPrefix(ShellType.cmd), ".\\");
        assert.strictEqual(getRunPrefix(ShellType.powerShell), ".\\");
        
        // Unix-like shells
        assert.strictEqual(getRunPrefix(ShellType.gitBash), "./");
        assert.strictEqual(getRunPrefix(ShellType.wsl), "./");
        assert.strictEqual(getRunPrefix(ShellType.others), "./");
    });
});