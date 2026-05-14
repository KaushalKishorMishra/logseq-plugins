# Multi-Platform Logseq Plugin Design

**Date:** 2026-05-13  
**Status:** Approved  
**Scope:** Extend the Logseq Claude Code plugin into a universal, publishable plugin that works with any AI coding tool.

---

## Goal

Make the Logseq plugin installable and functional in Claude Code, Gemini CLI, OpenCode, Codex CLI, Pi, and any future AI tool — with a single `npx` command to install and a guided Logseq setup flow for first-time users.

---

## Approach

Approach A — Static multi-platform files. The existing `SKILL.md` files are already platform-agnostic. The only platform-specific pieces are entry files and an installer. No build step required.

---

## Repository Structure

```
logseq-plugin/
├── CLAUDE.md                          # Claude Code entry (exists)
├── GEMINI.md                          # Gemini CLI entry (new)
├── AGENTS.md                          # OpenCode, Codex, Pi, universal fallback (new)
├── package.json                       # extended with bin + publish metadata
├── skills/
│   ├── morning/SKILL.md
│   ├── eod/SKILL.md
│   ├── jot/SKILL.md
│   ├── learn/SKILL.md
│   ├── kb/SKILL.md
│   ├── log/SKILL.md
│   └── setup/SKILL.md                 ← new
├── bin/
│   └── install.mjs                    ← new: npx installer
└── .claude-plugin/
    └── marketplace.json
```

---

## Platform Entry Files

| File | Targets | Strategy |
|------|---------|----------|
| `CLAUDE.md` | Claude Code | References `skills/*/SKILL.md` via Skill tool |
| `GEMINI.md` | Gemini CLI | References `skills/*/SKILL.md` via `activate_skill` tool |
| `AGENTS.md` | OpenCode, Codex, Pi, others | Self-contained: full skill instructions inline, no skill runner required |

`CLAUDE.md` and `GEMINI.md` are lightweight — they list trigger phrases and defer to the SKILL.md files. `AGENTS.md` is self-contained so it works in any tool that simply reads a markdown file for instructions, including conversational AIs with no skill system.

---

## Setup Skill

**Trigger:** `/setup`, `setup logseq`, or automatically invoked by other skills when Logseq is not detected.

### Logseq Detection Paths

| OS | Check |
|----|-------|
| macOS | `/Applications/Logseq.app` |
| Linux | `~/.local/share/applications/logseq*.desktop` or `/opt/Logseq` |
| Windows | `%LOCALAPPDATA%\Logseq\` or `%APPDATA%\Logseq\` |

### Flow

1. Detect OS and check the platform Logseq path.
2. **Not found:** Print message with download link (`https://logseq.com/downloads`) and stop. Tell user to re-run `/setup` after installing.
3. **Found:** Ask for graph root path (default: `~/Documents/Logseq`). Accept the default or let user provide a custom path.
4. Write `~/.logseq-plugin-config` with `graph_root=<path>`.
5. Verify `<graph_root>/journals/` exists; if not, warn and suggest opening Logseq to initialize the graph.

### Config File Format

```
# ~/.logseq-plugin-config
graph_root=~/Documents/Logseq
```

All skills read this file for the graph root instead of hardcoding `~/Documents/Logseq`.

---

## npx Installer (`bin/install.mjs`)

```bash
npx logseq-plugin install
```

### Steps

1. **Detect installed AI tools** by checking known paths and binaries:
   - Claude Code: `~/.claude/` directory exists
   - Gemini CLI: `~/.gemini/` exists or `gemini` in PATH
   - OpenCode: `opencode` in PATH or `~/.config/opencode/`
   - Codex: `codex` in PATH
   - Fallback: always write `AGENTS.md`

2. **Write entry files** to the current working directory:
   - Detected Claude Code → `CLAUDE.md`
   - Detected Gemini CLI → `GEMINI.md`
   - Detected OpenCode / Codex / fallback → `AGENTS.md`
   - Multiple tools detected → write all relevant files

3. **Copy `skills/` directory** to the current working directory (or `~/.logseq-plugin/skills/` if not in a project).

4. **Run Logseq check** — invoke the same detection logic as the setup skill. If Logseq is missing, print the download link and remind the user to run `/setup` after installing.

### npm Metadata

- Package name: `@kaushal/logseq-plugin`
- `package.json` `"bin"` field: `{ "logseq-plugin": "./bin/install.mjs" }`
- `"type": "module"` already set

---

## Skills: Graph Root Change

Every skill currently hardcodes `~/Documents/Logseq`. After this change, each skill reads `~/.logseq-plugin-config` for the `graph_root` at invocation time. If the config file is missing, the skill redirects the user to run `/setup`.

---

## Distribution Channels

| Channel | How |
|---------|-----|
| npm | `npm publish` → `npx @kaushal/logseq-plugin install` |
| Git clone | `git clone` + `node bin/install.mjs` |
| Claude marketplace | `.claude-plugin/marketplace.json` (exists) |
| Gemini / OpenCode stores | Add platform-specific registry files as those ecosystems mature |

---

## Out of Scope

- Per-platform skill variants (all platforms share the same SKILL.md files)
- Windows native path handling beyond basic detection (deferred)
- GUI installer
