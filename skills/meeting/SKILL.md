---
name: meeting
description: ALWAYS invoke when the user says "log this meeting", "meeting notes", "new meeting", "meeting:", or invokes /meeting. Creates a blank meeting notes page and links it in today's journal.
---

# Meeting Notes

Create a blank meeting notes page under `pages/meetings/` + today's journal entry.

---

## Steps

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If empty, tell the user to run `/setup` and stop.

**1. Parse the input**

Extract:
- **Meeting title** — required. If missing, ask: *"What's the meeting title?"*
- **Attendees** — optional, comma-separated names. Leave blank if not mentioned.

Generate **page slug**: lowercase, hyphenated (e.g. `weekly-sync-design-team`).

**2. Create the meeting notes page**

```bash
date "+%Y-%m-%d"
date "+%H:%M"
```

File: `$GRAPH_ROOT/pages/meetings/YYYY-MM-DD-[slug].md`

```
# [Meeting Title]
date:: [[YYYY-MM-DD]]
time:: HH:MM
attendees:: [names or blank]
type:: [sync / 1:1 / planning / retro / review — infer from title]
tags:: #meeting

## Agenda
	-

## Notes
	-

## Decisions
	-

## Action Items
	- TODO 
```

Leave all sections blank.

**3. Update today's journal under `## Work Log`**

```bash
date "+%Y_%m_%d"
```

Find `## Work Log` in `$GRAPH_ROOT/journals/YYYY_MM_DD.md`. If missing, add it.

Append:
```
- ## Work Log
	- `HH:MM` Meeting: [[meetings/YYYY-MM-DD-[slug]]] — [title]
	  logged:: [[YYYY-MM-DD]]
```

**4. Confirm in one sentence**

*"Meeting note created at `meetings/YYYY-MM-DD-[slug]` and linked in today's Work Log."*

---

## Rules
- Tabs for block indentation
- `date::`, `time::`, `logged::` use dashes (`2026-05-14`)
- Page slug uses the meeting date prefix so meetings sort chronologically
- Leave all sections blank — fill during or after the meeting
- Infer meeting `type::` from title keywords: "sync" → sync, "1:1" → 1:1, "retro" → retro, etc.
