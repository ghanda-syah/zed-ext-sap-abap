# zed-abap

SAP ABAP language support for [Zed Editor](https://zed.dev).

## Features

- ✅ **Syntax Highlighting** — Full ABAP syntax highlighting via [tree-sitter-abap](https://github.com/kennyhml/tree-sitter-abap)
- ✅ **Code Outline** — Navigate classes, methods, forms, function modules in the Outline panel
- ✅ **Bracket Matching** — Parentheses highlighting
- ✅ **Auto-Indentation** — Smart indentation for block structures
- ✅ **Comment Support** — Line comments (`"`, `*`) and block comments (`/* */`)

## Installation

### From Zed Extensions (once published)
1. Open Zed
2. `Cmd+Shift+P` → `zed: extensions`
3. Search for "ABAP"
4. Click Install

### Development / Local Install
1. Clone this repository
2. Open Zed
3. `Cmd+Shift+P` → `zed: install dev extension`
4. Select the `zed-abap` directory

## MCP Integration (AI Agent for SAP)

To connect an AI agent to your SAP system from Zed, add one of these MCP servers to your Zed `settings.json`:

### Option A: Standalone `mcp-abap-adt` (No VS Code needed)

```bash
npm install -g mcp-abap-adt
```

Add to Zed `settings.json` (`Cmd+,`):

```json
{
  "context_servers": {
    "abap-adt": {
      "command": {
        "path": "npx",
        "args": ["-y", "mcp-abap-adt"],
        "env": {
          "SAP_URL": "https://your-sap-system.com",
          "SAP_CLIENT": "100",
          "SAP_USER": "your-username",
          "SAP_PASSWORD": "your-password"
        }
      }
    }
  }
}
```

### Option B: Via ABAP Remote Filesystem (VS Code bridge)

If you use VS Code with the [ABAP Remote Filesystem](https://github.com/marcellourbani/vscode_abap_remote_fs) extension:

1. Connect to your SAP system in VS Code
2. Enable the MCP server (`Cmd+Shift+P` → "ABAP FS MCP")
3. Add to Zed `settings.json`:

```json
{
  "context_servers": {
    "abapfs": {
      "url": "http://localhost:4847/mcp"
    }
  }
}
```

## File Structure

```
zed-abap/
├── extension.toml              # Extension manifest
├── languages/
│   └── abap/
│       ├── config.toml         # Language configuration
│       ├── highlights.scm      # Syntax highlighting (1100+ rules)
│       ├── outline.scm         # Code structure outline
│       ├── brackets.scm        # Bracket matching
│       ├── indents.scm         # Auto-indentation
│       └── injections.scm      # Embedded language support
└── README.md
```

## Supported File Extensions

- `.abap`
- `.abap.txt`

## Credits

- Tree-sitter grammar: [kennyhml/tree-sitter-abap](https://github.com/kennyhml/tree-sitter-abap)
- MCP server: [mario-andreschak/mcp-abap-adt](https://github.com/mario-andreschak/mcp-abap-adt)
- Inspired by: [ABAP Remote Filesystem](https://github.com/marcellourbani/vscode_abap_remote_fs)

## License

MIT
