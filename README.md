# BAK Syntax Highlighter

**Enable syntax highlighting for `.py.bak`, `.cpp.bak1`, and other backup files in VS Code.**

This extension automatically detects `.bak`-suffixed files and sets the correct language mode (e.g., Python, C++, JSON) based on the original extension.

---

## ✅ Features

- Supports `.py.bak`, `.cpp.bak`, `.json.bak`, `.ts.bak1`, `.html.bak2`, etc.
- Automatically assigns language mode when such files are opened.
- Warns when a `.bak` file becomes active, so code navigation landing in backup files is easier to notice.
- Offers a one-click action to reopen the matching original file.
- Works on macOS, Linux, and Windows.
- Lightweight and fast (zero config, zero lag).

---

## 🛠 Supported Extensions

| Backup File | Detected As |
|-------------|-------------|
| `main.py.bak` | Python |
| `demo.cpp.bak1` | C++ |
| `data.json.bak2` | JSON |
| `index.html.bak3` | HTML |
| ... and more     | ✔ |

> You can edit the extension to support custom formats if needed.

---

## 🔧 How It Works

This extension listens for opened files that match the pattern `*.ext.bak`, `*.ext.bak1`, etc., and applies language mode based on `.ext`.

When a `.bak` file becomes the active editor, the extension can also warn you that navigation may have landed in a backup file and let you reopen the original file immediately.

## ⚙️ Settings

- `bakSyntaxHighlighter.navigation.showBakWarning`
  Show a warning when a `.bak` file becomes active.
- `bakSyntaxHighlighter.navigation.autoOpenOriginal`
  Automatically reopen the corresponding original file if it exists.

---

## 📦 Installation

- Search for `Backup File Highlighter` in the Extensions Marketplace
- Or install manually with:

```bash
code --install-extension bak-syntax-highlighter-0.0.2.vsix
```


## 🧠 Why?

VS Code treats .py.bak as unknown format (plaintext). This extension makes your backups readable, colorful, and safe!

## 🧩 Contributing

PRs and feedback welcome:
👉 https://github.com/starlitxiling/bak-syntax-highlighter

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).  
Copyright © 2025 [starlitxiling](https://github.com/starlitxiling)
