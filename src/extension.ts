import * as path from 'path';
import * as vscode from 'vscode';

const BAK_FILE_PATTERN = /^(.*)\.([a-zA-Z0-9]+)\.bak\d*$/i;

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
    'py': 'python',
    'cpp': 'cpp',
    'c': 'c',
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'javascriptreact',
    'tsx': 'typescriptreact',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'yml': 'yaml',
    'yaml': 'yaml',
    'md': 'markdown',
    'sh': 'shellscript',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'rb': 'ruby',
    'php': 'php',
    'xml': 'xml',
    'toml': 'toml',
    'ini': 'ini',
    'lua': 'lua',
    'swift': 'swift',
    'kt': 'kotlin',
    'dart': 'dart',
    'pl': 'perl',
    'r': 'r',
    'sql': 'sql',
    'make': 'makefile',
    'txt': 'plaintext'
};

interface BakFileInfo {
    bakFileName: string;
    bakUri: vscode.Uri;
    originalExt: string;
    originalFileName: string;
    originalUri: vscode.Uri;
}

const warnedBakEditors = new Set<string>();

function getBakFileInfo(document: vscode.TextDocument): BakFileInfo | undefined {
    const bakMatch = document.fileName.match(BAK_FILE_PATTERN);
    if (!bakMatch) {
        return undefined;
    }

    const originalFileName = `${bakMatch[1]}.${bakMatch[2]}`;

    return {
        bakFileName: document.fileName,
        bakUri: document.uri,
        originalExt: bakMatch[2].toLowerCase(),
        originalFileName,
        originalUri: vscode.Uri.file(originalFileName),
    };
}

function handleBakFile(document: vscode.TextDocument) {
    const bakFileInfo = getBakFileInfo(document);
    if (!bakFileInfo) {
        return;
    }

    const langId = EXTENSION_TO_LANGUAGE[bakFileInfo.originalExt];
    if (!langId) {
        console.warn(`No mapping found for extension: .${bakFileInfo.originalExt}`);
        return;
    }

    if (document.languageId === langId) {
        return;
    }

    void vscode.languages.setTextDocumentLanguage(document, langId).then(() => {
        console.log(`Set language mode to '${langId}' for: ${bakFileInfo.bakFileName}`);
    }, (error) => {
        console.error('Failed to set backup file language mode:', error);
    });
}

function getNavigationSettings() {
    const configuration = vscode.workspace.getConfiguration('bakSyntaxHighlighter');

    return {
        autoOpenOriginal: configuration.get<boolean>('navigation.autoOpenOriginal', false),
        showBakWarning: configuration.get<boolean>('navigation.showBakWarning', true),
    };
}

async function fileExists(uri: vscode.Uri): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch {
        return false;
    }
}

function clampPosition(document: vscode.TextDocument, position: vscode.Position): vscode.Position {
    if (document.lineCount === 0) {
        return new vscode.Position(0, 0);
    }

    const lineNumber = Math.min(position.line, document.lineCount - 1);
    const line = document.lineAt(lineNumber);
    const character = Math.min(position.character, line.range.end.character);

    return new vscode.Position(lineNumber, character);
}

async function openOriginalFile(
    bakDocument: vscode.TextDocument,
    position: vscode.Position,
    viewColumn: vscode.ViewColumn | undefined
): Promise<boolean> {
    const bakFileInfo = getBakFileInfo(bakDocument);
    if (!bakFileInfo) {
        return false;
    }

    if (!(await fileExists(bakFileInfo.originalUri))) {
        void vscode.window.showWarningMessage(
            `The current file is a backup file ${path.basename(bakFileInfo.bakFileName)}, and the original file ${path.basename(bakFileInfo.originalFileName)} was not found.`
        );
        return false;
    }

    const originalDocument = await vscode.workspace.openTextDocument(bakFileInfo.originalUri);
    const safePosition = clampPosition(originalDocument, position);
    const selection = new vscode.Range(safePosition, safePosition);

    const editor = await vscode.window.showTextDocument(originalDocument, {
        preserveFocus: false,
        preview: false,
        selection,
        viewColumn,
    });

    editor.selection = new vscode.Selection(safePosition, safePosition);
    editor.revealRange(selection, vscode.TextEditorRevealType.InCenterIfOutsideViewport);

    return true;
}

async function maybeWarnAboutBakFile(editor: vscode.TextEditor | undefined): Promise<void> {
    if (!editor) {
        return;
    }

    const bakFileInfo = getBakFileInfo(editor.document);
    if (!bakFileInfo) {
        return;
    }

    const settings = getNavigationSettings();
    if (!settings.showBakWarning && !settings.autoOpenOriginal) {
        return;
    }

    const editorKey = editor.document.uri.toString();
    if (warnedBakEditors.has(editorKey)) {
        return;
    }

    warnedBakEditors.add(editorKey);
    const originalExists = await fileExists(bakFileInfo.originalUri);

    if (settings.autoOpenOriginal && originalExists) {
        const opened = await openOriginalFile(editor.document, editor.selection.active, editor.viewColumn);
        if (opened) {
            void vscode.window.showInformationMessage(
                `Detected backup file ${path.basename(bakFileInfo.bakFileName)}. Switched back to ${path.basename(bakFileInfo.originalFileName)}.`
            );
        }
        return;
    }

    if (!settings.showBakWarning) {
        return;
    }

    const message = originalExists
        ? `The active file is a backup file ${path.basename(bakFileInfo.bakFileName)}. Code navigation may have landed in a .bak version.`
        : `The active file is a backup file ${path.basename(bakFileInfo.bakFileName)}. Code navigation may have landed in a .bak version, and the original file ${path.basename(bakFileInfo.originalFileName)} was not found.`;
    const actions = originalExists ? ['Open Original File', 'Disable Warning'] : ['Disable Warning'];
    const selection = await vscode.window.showWarningMessage(message, ...actions);

    if (selection === 'Open Original File') {
        await openOriginalFile(editor.document, editor.selection.active, editor.viewColumn);
        return;
    }

    if (selection === 'Disable Warning') {
        await vscode.workspace.getConfiguration('bakSyntaxHighlighter').update(
            'navigation.showBakWarning',
            false,
            vscode.ConfigurationTarget.Global
        );
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('bak-extension-mode activated');

    context.subscriptions.push(
        vscode.commands.registerCommand('bakSyntaxHighlighter.openOriginalFile', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || !getBakFileInfo(editor.document)) {
                void vscode.window.showInformationMessage('The active editor is not a .bak backup file.');
                return;
            }

            await openOriginalFile(editor.document, editor.selection.active, editor.viewColumn);
        }),
        vscode.workspace.onDidOpenTextDocument(handleBakFile),
        vscode.workspace.onDidCloseTextDocument((document) => {
            warnedBakEditors.delete(document.uri.toString());
        }),
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            void maybeWarnAboutBakFile(editor);
        })
    );

    for (const document of vscode.workspace.textDocuments) {
        handleBakFile(document);
    }

    void maybeWarnAboutBakFile(vscode.window.activeTextEditor);
}

export function deactivate() {
    console.log('bak-extension-mode deactivated');
}
