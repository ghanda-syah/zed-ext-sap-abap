# SAP-ABAP Language Support for Zed Editor (`zed-sap-abap`)

[![Zed Extension](https://img.shields.io/badge/Zed-Extension-blue.svg)](https://zed.dev)
[![ABAP](https://img.shields.io/badge/Language-SAP%20ABAP-008fd3.svg)](https://www.sap.com)
[![Protocol](https://img.shields.io/badge/Debug-DAP%20Enabled-success.svg)](https://microsoft.github.io/debug-adapter-protocol/)
[![AI-Ready](https://img.shields.io/badge/AI-MCP%20Ready-purple.svg)](https://modelcontextprotocol.io)

SAP-ABAP language support and debugging toolkit for the **[Zed Editor](https://zed.dev)**.

---

## Features

- **Syntax Highlighting**: Support for ABAP (7.40+, 7.50+, ABAP Cloud, RAP, CDS Views, and Open SQL) powered by [tree-sitter-abap](https://github.com/kennyhml/tree-sitter-abap).
- **Code Outline Navigation**: Jump to Classes, Interfaces, Methods, Form routines, Function Modules, and Event blocks.
- **Bracket Matching**: Highlighting for paired parentheses, control blocks, and logical closures.
- **Auto-Indentation**: Indentation rules for `CLASS`, `METHOD`, `IF`, `LOOP`, `TRY`, `SELECT`, and other block constructs.
- **Comment Support**: Full recognition of line comments (`"`, `*`) and block comments (`/* */`).
- **Interactive DAP Debugger**: Debug Adapter Protocol (DAP) server supporting breakpoints, step execution, and variable inspection.
- **MCP Integration**: Integration with Zed Assistant via Model Context Protocol to inspect and interact with SAP objects.

---

## Installation

### Method 1: Local Development Installation (Dev Extension)

1. Clone this repository:
   ```bash
   git clone git@github-personal:ghanda-syah/zed-ext-sap-abap.git
   ```
2. Open **Zed Editor**.
3. Press `Cmd + Shift + P` (macOS) or `Ctrl + Shift + P` (Linux) and type:
   ```text
   zed: install dev extension
   ```
4. Select the repository directory.

### Method 2: From Zed Extension Registry (Once Published)

1. Open Zed Editor.
2. Press `Cmd + Shift + P` and search for `zed: extensions`.
3. Search for **SAP-ABAP** and click **Install**.

---

## Workflow

```mermaid
flowchart LR
    A["1. Open ABAP Workspace in Zed"] --> B["2. Query SAP Objects via MCP"]
    B --> C["3. Edit Code in Zed"]
    C --> D["4. Run Syntax Checks & Activation"]
    D --> E["5. Git Commit & Versioning (abapGit)"]
```

### Steps:
1. **Open Workspace (`Cmd + O`)**: Open your local ABAP project directory (synchronized with abapGit).
2. **AI Agent Interaction (`Cmd + ?` or `Ctrl + ~`)**:
   Query SAP objects through MCP tools:
   > *"Retrieve the source code for class `ZCL_SALES_CONTROLLER` from the SAP development server."*
3. **Coding & Refactoring**: Edit code with syntax highlighting and outline navigation.
4. **Syntax Check & Activation**: Run syntax verification (ATC checks) and activation through MCP tools.
5. **Version Control**: Commit changes to Git within Zed.

---

## Debugging with DAP (Debug Adapter Protocol)

`zed-sap-abap` includes a DAP server (`dap/abap-dap-server.js`) that connects Zed's debugging interface to SAP ADT Debugger REST APIs (`/sap/bc/adt/debugger/*`).

### Debug Configuration

Configure your debug profile in `.zed/settings.json` or `.zed/tasks.json`:

```json
{
  "debug": {
    "adapter": "sap-abap",
    "request": "launch",
    "sapUrl": "https://your-sap-server.com:44300",
    "client": "100",
    "user": "YOUR_SAP_USER",
    "password": "YOUR_SAP_PASSWORD",
    "stopOnEntry": false
  }
}
```

### Debugging Capabilities:
- **Breakpoints**: Set line breakpoints in `.abap` files from the editor margin.
- **Step Execution**: Step Over (`F6`), Step Into (`F5`), and Step Return (`F7`).
- **Variable Inspection**: Inspect local variables, global tables, and SAP system fields (`SY-SUBRC`, `SY-TABIX`, `SY-UNAME`, `SY-DATUM`, `SY-UZEIT`).

---

## AI MCP Server Integration

To connect Zed AI Assistant to SAP, add the MCP server configuration to your Zed `settings.json` (`~/.config/zed/settings.json` or `Cmd + ,`):

### Option A: Standalone `mcp-abap-adt` (Recommended)

```json
{
  "context_servers": {
    "abap-adt": {
      "command": {
        "path": "npx",
        "args": ["-y", "mcp-abap-adt"],
        "env": {
          "SAP_URL": "https://your-sap-server.com:44300",
          "SAP_CLIENT": "100",
          "SAP_USER": "YOUR_SAP_USER",
          "SAP_PASSWORD": "YOUR_SAP_PASSWORD"
        }
      }
    }
  }
}
```

### Option B: Via ABAP Remote Filesystem (VS Code Bridge)

If using [ABAP Remote Filesystem](https://github.com/marcellourbani/vscode_abap_remote_fs) in VS Code:

1. Enable the MCP toggle in VS Code.
2. Add the following to Zed `settings.json`:
```json
{
  "context_servers": {
    "abapfs": {
      "url": "http://localhost:4847/mcp"
    }
  }
}
```

---

## SAP ABAP Deployment Guide

In SAP, deployment is handled through **Activation** and the **Transport System**:

### Method 1: Transport Request (CTS / TMS)

Deployment flow for On-Premise and S/4HANA Private Cloud:

```mermaid
flowchart TD
    subgraph Local_Dev["Local Machine (Zed)"]
        Z1["1. Edit .abap code in Zed"] --> Z2["2. Save & Activate via MCP"]
    end

    subgraph SAP_DEV["SAP Development (DEV)"]
        S1["Changes recorded in Transport Request\n(e.g., DEVK900123)"]
        S2["Release Task & Transport Request (SE09/SE10)"]
    end

    subgraph Target_Landscape["Target Systems"]
        QAS["SAP Quality (QAS)\nTMS Import"] --> PRD["SAP Production (PRD)\nTMS Import"]
    end

    Z2 --> S1
    S1 --> S2
    S2 --> QAS
```

1. **Develop in Zed**: Write and modify ABAP code locally.
2. **Save & Activate**: Code is sent to SAP DEV and recorded in the assigned **Transport Request (TR)**.
3. **Release TR**: Release the task and transport request in SAP (`SE09` / `SE10`).
4. **Import to QAS/PRD**: Transport Management System (TMS) imports the TR into Quality and Production environments.

---

### Method 2: Git-based CI/CD via abapGit / gCTS

For ABAP Cloud, SAP BTP, and open-source repositories:

```mermaid
flowchart LR
    A["Zed Editor\n(git commit & push)"] --> B["GitHub / GitLab\n(Pull Request & Code Review)"]
    B --> C["CI/CD Pipeline\n(abaplint & Unit Test)"]
    C --> D["SAP BTP / S/4HANA\n(abapGit / gCTS Sync & Activation)"]
```

1. **Git Commit in Zed**: Commit changes locally.
2. **Pull Request**: Open a pull request for review.
3. **Automated CI**: Run `abaplint` static analysis and automated unit tests.
4. **Deploy & Activate**: Merge to `main` triggers **abapGit** or **gCTS** synchronization to the SAP system.

---

## Frequently Asked Questions (FAQ)

### 1. Does ABAP require compilation before deployment?
* **Yes (Activation)**: Unactivated code remains in an *Inactive* state. Activation validates syntax and compiles source code into executable bytecode on the SAP Application Server.

### 2. Can I use Git Versioning (abapGit) and Graphify with Zed?
* **Yes**: [abapGit](https://abapgit.org) exports SAP repository objects into standard files (`.clas.abap`, `.xml`). You can branch, diff, and merge directly in Zed.
* **Graphify**: Analyzes dependencies, class inheritances, method invocations, and CDS data models in the workspace.

### 3. Are custom SAP packages and DDIC components supported on macOS?
* **Yes**: The ABAP runtime and database execute on the remote SAP server. All communication with SAP (BAPIs, classes, DDIC tables/structures) uses standard **SAP ADT REST APIs (`/sap/bc/adt/*`)** over HTTPS.

---

## Project Structure

```text
zed-sap-abap/
├── extension.toml                      # Zed extension manifest
├── debug_adapter_schemas/
│   └── sap-abap.json                   # DAP configuration JSON schema
├── dap/
│   └── abap-dap-server.js              # Standalone Node.js DAP debug server
├── grammars/
│   └── abap.wasm                       # Compiled Tree-sitter WebAssembly parser
├── languages/
│   └── abap/
│       ├── config.toml                 # Language configuration (SAP-ABAP)
│       ├── highlights.scm              # Syntax highlighting rules
│       ├── outline.scm                 # Code structure navigation queries
│       ├── brackets.scm                # Bracket matching definitions
│       ├── indents.scm                 # Auto-indentation patterns
│       └── injections.scm              # Embedded SQL & template support
├── examples/
│   └── z_sample_abap.abap              # Sample ABAP program
└── README.md                           # Documentation
```

## Supported File Extensions

- `.abap`
- `.abap.txt`

---

## Credits & Acknowledgments

- Tree-sitter grammar: [kennyhml/tree-sitter-abap](https://github.com/kennyhml/tree-sitter-abap)
- Standalone MCP server: [mario-andreschak/mcp-abap-adt](https://github.com/mario-andreschak/mcp-abap-adt)
- Architecture Inspiration: [ABAP Remote Filesystem (Marcello Urbani)](https://github.com/marcellourbani/vscode_abap_remote_fs)
