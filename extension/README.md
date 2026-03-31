# ☀️ Solana Dev Copilot — VS Code Extension

AI-powered Solana developer assistant with **1000+ glossary terms** directly in your editor.

## Features

- **🧩 Hover Tooltips** — Hover any Solana term (PDA, validator, AMM...) for instant definitions
- **⚡ Term Highlighting** — Glossary terms are subtly underlined in your code
- **🤖 AI Copilot** — Ask any Solana question via command palette
- **📄 Explain File** — Analyze current file for Solana concepts
- **🔍 Explain Selection** — Right-click code to get concept explanations
- **📚 Sidebar Search** — Browse and search 1000+ terms in the sidebar
- **🔗 Web App Integration** — Deep link to the full Solana Dev Copilot web app

## Commands

| Command | Description |
|---------|-------------|
| `Solana Copilot: Ask a Question` | Open AI copilot input |
| `Solana Copilot: Explain Current File` | Analyze file for Solana concepts |
| `Solana Copilot: Explain Selection` | Explain selected code |
| `Solana Copilot: Search Glossary` | Quick glossary search |
| `Solana Copilot: Toggle Term Highlighting` | Enable/disable term underlining |
| `Solana Copilot: Open in Web App` | Open web app for current term |

## Supported Languages

TypeScript, JavaScript, Rust, Markdown, JSON, TOML, Plain Text

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `solanaCopilot.enableHighlighting` | `true` | Highlight glossary terms |
| `solanaCopilot.webAppUrl` | `https://solana-aura-guide.lovable.app` | Web app URL |
| `solanaCopilot.aiEndpoint` | `""` | Custom AI endpoint |
| `solanaCopilot.language` | `en` | Language (en/pt) |

## Data

Powered by the [official Solana Glossary](https://github.com/solanabr/solana-glossary) with 1001 terms across 14 categories.

## Installation

1. Download the `.vsix` file
2. Open VS Code
3. `Ctrl+Shift+P` → "Extensions: Install from VSIX..."
4. Select the downloaded file
5. Reload VS Code
