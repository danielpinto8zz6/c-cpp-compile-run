import { commands, window, workspace } from "vscode";

export async function ensureWorkspaceIsTrusted(action: string): Promise<boolean> {
    if (workspace.isTrusted) {
        return true;
    }

    const manageTrust = "Manage Workspace Trust";
    const choice = await window.showErrorMessage(
        `Cannot ${action} in an untrusted workspace. Please trust the workspace to enable this feature.`,
        manageTrust
    );

    if (choice === manageTrust) {
        await commands.executeCommand("workbench.trust.manage");
    }

    return false;
}