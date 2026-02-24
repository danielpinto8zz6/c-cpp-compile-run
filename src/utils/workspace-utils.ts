import { commands, window, workspace } from "vscode";
import { Configuration } from "../configuration";

/**
 * Set of file paths the user has already trusted in single-file mode
 * during this session, so they are not prompted repeatedly.
 */
const trustedSingleFiles = new Set<string>();

/**
 * Opens the Workspace Trust manager and waits for the user to grant trust.
 * Returns true if trust was granted, false if the user dismissed without granting.
 */
async function requestAndWaitForTrust(): Promise<boolean> {
    if (workspace.isTrusted) {
        return true;
    }

    // Set up a listener BEFORE opening the trust manager to avoid race conditions
    const trustGranted = new Promise<boolean>((resolve) => {
        // Resolve true when trust is granted
        const trustDisposable = workspace.onDidGrantWorkspaceTrust(() => {
            trustDisposable.dispose();
            resolve(true);
        });

        // Also resolve false if the user closes the trust editor without granting
        // We use a timeout as a fallback since there's no "trust denied" event
        const checkInterval = setInterval(() => {
            if (workspace.isTrusted) {
                clearInterval(checkInterval);
                trustDisposable.dispose();
                resolve(true);
            }
        }, 500);

        // Timeout after 5 minutes to avoid hanging forever
        setTimeout(() => {
            clearInterval(checkInterval);
            trustDisposable.dispose();
            resolve(workspace.isTrusted);
        }, 5 * 60 * 1000);
    });

    await commands.executeCommand("workbench.trust.manage");
    return trustGranted;
}

export async function ensureWorkspaceIsTrusted(action: string): Promise<boolean> {
    // When no workspace folder is open (single file mode), VS Code may still
    // treat the workspace as untrusted, which blocks terminal creation.
    // We must ensure workspace.isTrusted is true before proceeding.
    if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
        if (!workspace.isTrusted) {
            // VS Code blocks terminal access in untrusted workspaces,
            // so we must prompt the user to grant trust first.
            const manageTrust = "Manage Workspace Trust";
            const choice = await window.showErrorMessage(
                `Cannot ${action} in an untrusted workspace. Please trust the workspace to allow terminal access.`,
                manageTrust
            );

            if (choice === manageTrust) {
                return await requestAndWaitForTrust();
            }

            return false;
        }

        if (Configuration.trustSingleFiles()) {
            return true;
        }

        const filePath = window.activeTextEditor?.document.uri.fsPath;
        if (filePath && trustedSingleFiles.has(filePath)) {
            return true;
        }

        const trustAction = "Trust and Continue";
        const openFolder = "Open Folder";
        const choice = await window.showWarningMessage(
            `You are about to ${action} a file outside of a workspace folder. ` +
            `Please confirm you trust this file, or open its folder for full workspace trust support.`,
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
        return await requestAndWaitForTrust();
    }

    return false;
}