# DotAgent

**Unified configuration hub for AI coding agents.**

Write your rules once, sync everywhere. DotAgent manages `.claude/`, `.codex/`, `.trae/` and other agent config directories from a single source — keeping all your AI tools aligned with your coding standards.

## Why DotAgent?

- **One source, all tools** — Edit instructions, rules, hooks, and skills in one place; sync to Claude Code, Codex, Trae, Cursor, and more
- **Path-scoped Rules** — Load Python rules only when editing `*.py` files, React rules for `*.tsx` — no context bloat
- **Hooks made easy** — Visual hook editor with templates: auto-format on save, block dangerous commands, notify on task completion
- **API key management** — Configure API endpoints once, auto-sync to all tools (keys stored securely in system keychain)
- **Project inheritance** — Global → Project → Local (gitignored) three-layer config inheritance
- **Snippet library** — Reusable templates for Python, React, Rust, WeChat Mini Programs, and more

## Tech Stack

- **Backend**: Rust (Tauri 2.x)
- **Frontend**: React + TypeScript + TailwindCSS
- **CLI**: `dotagent init/sync/rule/hook/skill`
- **Storage**: SQLite + System Keychain

## Quick Start

```bash
# Initialize a project
dotagent init

# Sync configs to all tools
dotagent sync

# Add a path-scoped rule
dotagent rule add --globs "**/*.py" --name python-style

# Add a hook (auto-format on file write)
dotagent hook template apply auto-format
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run tauri dev

# Build for production
npm run tauri build
```

## Status

🚧 In development — Specification and UI prototype complete, implementation starting soon.

## License

MIT
