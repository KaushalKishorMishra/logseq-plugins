# Logseq Plugin

Personal Logseq knowledge-graph integration for daily journaling, session logging, quick capture, and knowledge management.

**Graph root:** configured via `/setup` → stored in `~/.logseq-plugin-config`

## Commands

| Command | What it does |
|---------|-------------|
| `/setup` | Install Logseq and configure your graph path (run this first) |
| `/morning` | Open today's journal and set your focus + priorities |
| `/eod` | Close the day with a reflection on what shipped |
| `/jot [content]` | Capture a quick thought, idea, or todo |
| `/learn [content]` | Log a learning to today's journal and the permanent learnings page |
| `/kb [content]` | Save reference knowledge to the knowledge base |
| `/log` | Create a detailed engineering log for the current session |

## Skills

| Skill | Command | Auto-triggers on |
|-------|---------|-----------------|
| `logseq:setup` | `/setup` | "setup logseq", "install logseq", when config is missing |
| `logseq:morning` | `/morning` | "good morning", "gm", "starting my day" |
| `logseq:eod` | `/eod` | "eod", "bye", "signing off", "wrapping up" |
| `logseq:jot` | `/jot [content]` | "jot this", "quick note", "capture this" |
| `logseq:learn` | `/learn [content]` | "I learned", "log this learning" |
| `logseq:kb` | `/kb [content]` | "add to kb", "knowledge base:" |
| `logseq:log` | `/log` | "log this session", "log the work" |

## Logseq Conventions

- **Tabs** for block indentation (never spaces)
- **Journal filenames:** `YYYY_MM_DD` (underscores)
- **Date properties:** `logged:: 2026-05-13` (dashes)
- **Journal links:** `[[YYYY_MM_DD]]` (underscores in brackets)
- **Page links:** `[[page-name]]` or `[[folder/page-name]]`
