---
name: idea
description: ALWAYS invoke when the user says "I have an idea", "idea:", "new idea", "what if we", "we should build", or invokes /idea. Creates a structured idea page and logs it in today's journal. More detailed than /jot — use this when the idea deserves its own page.
---

# Idea Capture

Create a structured idea page under `pages/ideas/` + today's journal entry.

---

## Steps

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If empty, tell the user to run `/setup` and stop.

**1. Extract the content**

Everything after the trigger phrase is the idea. E.g.:
- `"/idea — build a CLI that generates Logseq templates from git history"` → the full idea
- `"I have an idea: offline-first sync using CRDTs"` → after the colon

If nothing follows, ask: *"What's the idea?"*

Generate **page slug**: lowercase, hyphenated (e.g. `logseq-template-generator`).
Generate **short title**: 3–6 words.

**2. Create the idea page**

```bash
date "+%Y-%m-%d"
date "+%H:%M"
```

File: `$GRAPH_ROOT/pages/ideas/[slug].md`

```
# [Short title]
logged:: [[YYYY-MM-DD]]
status:: raw
tags:: #idea [#dx / #frontend / #backend / #product — infer from context]

## The Idea
	- [full idea verbatim]

## Problem It Solves
	-

## Why It Matters
	-

## Rough Next Steps
	- TODO 

## Open Questions
	-
```

Leave all sections except "The Idea" blank — the user fills them in.

**3. Update today's journal under `## Notes`**

```bash
date "+%Y_%m_%d"
```

Append:
```
- ## Notes
	- `HH:MM` Idea: [[ideas/[slug]]] — [short title] #idea
	  logged:: [[YYYY-MM-DD]]
```

**4. Confirm in one sentence**

*"Idea captured at `ideas/[slug]`."*

---

## Rules
- Tabs for block indentation
- `logged::` uses dashes (`2026-05-14`)
- Capture the idea verbatim in "The Idea" section — don't rephrase or expand
- Leave Problem, Why It Matters, Next Steps blank — don't fill from AI inference
- `status:: raw` on creation; user upgrades to `exploring`, `building`, or `parked`
