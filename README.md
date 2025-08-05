# BAK Syntax Highlighter

**Enable syntax highlighting for `.py.bak`, `.cpp.bak1`, and other backup files in VS Code.**

This extension automatically detects `.bak`-suffixed files and sets the correct language mode (e.g., Python, C++, JSON) based on the original extension.

---

## ✅ Features

- Supports `.py.bak`, `.cpp.bak`, `.json.bak`, `.ts.bak1`, `.html.bak2`, etc.
- Automatically assigns language mode when such files are opened.
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

---

## 📦 Installation

- Search for `BAK Syntax Highlighter` in the Extensions Marketplace
- Or install manually with:

```bash
code --install-extension bak-syntax-highlighter-0.0.1.vsix
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