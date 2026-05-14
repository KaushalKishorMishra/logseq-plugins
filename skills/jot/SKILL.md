---
name: jot
description: ALWAYS invoke when the user says "jot this", "jot this down", "note this", "quick note", "capture this", "quick thought", "random thought", "idea:", "note:", or invokes /jot. Write immediately — no questions unless content is literally empty.
---

# Jot

Capture a quick thought with zero friction.

---

## Steps

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If this returns empty, tell the user to run `/setup` and stop.
Use the returned path as `$GRAPH_ROOT` for all file paths in this skill.

**1. Extract the content**

Everything after the trigger phrase is the note. E.g.:
- `"jot this — Refine useOne appends id even on empty string"` → content is after the dash
- `"quick note: explore code splitting"` → content is after the colon
- `"/jot useCallback doesn't stabilize across renders in strict mode"` → content is everything after `/jot`

If there's nothing after the trigger, ask: *"What do you want to capture?"*

**2. Classify silently**

| Type | Signals | Extra destination |
|------|---------|-------------------|
| **Idea** | "we should", "what if", "explore", "could", "maybe" | Also → `pages/dev-ideas.md` |
| **Todo** | "need to", "fix", "don't forget", "remember to" | Also → `pages/dev-todos.md` |
| **Observation** | anything else | Journal only |

**3. Append to today's journal under `## Notes`**

Get date and time:
```bash
date "+%Y_%m_%d"
date "+%H:%M"
```

Find `## Notes` in `$GRAPH_ROOT/journals/YYYY_MM_DD.md`. If missing, add it after `## Work Log`:
```
- ## Notes
	-
```

Append:
```
- ## Notes
	- `HH:MM` [content] #jot
	  logged:: [[YYYY-MM-DD]]
```

**4. Write to secondary destination (if Idea or Todo)**

**Idea** → append under `## Backlog` in `pages/dev-ideas.md`:
```
	- ### [short title]
	  tags:: #idea [#pbl / #frontend / #dx / #backend as appropriate]
	  logged:: [[YYYY-MM-DD]]
		- [content]
```

**Todo** → append to the best-fit section in `pages/dev-todos.md`, or create `## Inbox` at the top:
```
- ## Inbox
  found:: [[YYYY-MM-DD]]
	- TODO [content]
	  priority:: Medium
	  tags:: #todo
```

**5. Confirm in one sentence**

- Observation: *"Captured in today's notes."*
- Idea: *"Logged in today's notes and dev-ideas."*
- Todo: *"Added to today's notes and dev-todos."*

---

## Rules
- Tabs for indentation
- `logged::` uses dashes (`2026-05-13`); journal filename uses underscores (`2026_05_13`)
- Capture words verbatim — don't rephrase
- Speed is the whole point: write first, confirm after, never ask questions unless content is missing
