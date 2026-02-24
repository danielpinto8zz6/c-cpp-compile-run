import { commands, window, workspace } from "vscode";

/**
 * Set of file paths the user has already trusted in single-file mode
 * during this session.
 */
const trustedSingleFiles = new Set<string>();

export async function ensureWorkspaceIsTrusted(action: string): Promise<boolean> {
    // When no workspace folder is open (single file mode), VS Code considers
    // the environment trusted by default and never shows the trust prompt.
    // We handle this explicitly by asking the user to confirm trust.
    if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
        const filePath = window.activeTextEditor?.document.uri.fsPath;
        if (filePath && trustedSingleFiles.has(filePath)) {
            return true;
        }

        const trustAction = "Trust and Continue";
        const openFolder = "Open Folder";
        const choice = await window.showWarningMessage(
            `You are about to ${action} a file outside of a workspace folder. ` +
            `For security, please confirm you trust this file, or open its folder for full workspace trust support.`,
            trustAction,
            openFolder
        );

        if (choice === trustAction) {
            if (filePath) {
                trustedSingleFiles.add(filePath);
            }
            return true;
        }

        if (choice === openFolder) {
            await commands.executeCommand("vscode.openFolder");
        }

        return false;
    }

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