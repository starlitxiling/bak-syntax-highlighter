import * as vscode from 'vscode';

function handleBakFile(document: vscode.TextDocument) {
    const fileName = document.fileName;

    // 匹配形如 xxx.py.bak
    const bakMatch = fileName.match(/\.([a-zA-Z0-9]+)\.bak\d*$/);
    if (!bakMatch) {
        return;
    }

    const originalExt = bakMatch[1].toLowerCase();

    const extToLangMap: { [key: string]: string } = {
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

    const langId = extToLangMap[originalExt];
    if (langId) {
        vscode.languages.setTextDocumentLanguage(document, langId).then(() => {
            console.log(`✔ Set language mode to '${langId}' for: ${fileName}`);
        }, (err) => {
            console.error(`❌ Failed to set language:`, err);
        });
    } else {
        console.warn(`⚠ No mapping found for extension: .${originalExt}`);
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('✅ bak-extension-mode activated');

    // 监听打开新文档
    vscode.workspace.onDidOpenTextDocument(handleBakFile);

    // 处理已经打开的文件
    for (const document of vscode.workspace.textDocuments) {
        handleBakFile(document);
    }
}

export function deactivate() {
    console.log('🔻 bak-extension-mode deactivated');
}