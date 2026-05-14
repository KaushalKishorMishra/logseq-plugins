---
name: read
description: ALWAYS invoke when the user shares an article, blog post, documentation URL, or any written content to study, says "log this article", "save this post", "reading notes for", or invokes /read. Creates a blank reading note — do NOT pre-fill content from AI knowledge.
---

# Reading Notes

Create a blank structured note for an article, blog post, or doc — page under `pages/reading/` + today's journal entry.

**Critical:** Write an empty template only. Never pre-fill Key Takeaways, Quotes, or any section from AI knowledge about the content.

---

## Steps

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If empty, tell the user to run `/setup` and stop.

**1. Parse the input**

Extract:
- **URL** — required. If missing, ask: *"What's the URL?"*
- **Topic/title** — optional slug. If not provided, ask: *"What topic or title for this note? (e.g. `react-useeffect-guide`)"*

Generate **page slug**: lowercase, words separated by hyphens.

**2. Create the reading note page**

File: `$GRAPH_ROOT/pages/reading/[slug].md`

```
# [Topic / title]
source:: [full URL]
author:: 
topics:: 
status:: reading
reviewed:: no
read-on:: [[YYYY-MM-DD]]

## Key Takeaways
	-

## Quotes
	-

## Questions
	-

## Action Items
	- TODO 

## Flashcards
	-
```

Use tabs for block indentation. Leave all sections empty.

**3. Update today's journal under `## Reading`**

```bash
date "+%Y_%m_%d"
date "+%H:%M"
```

Find `## Reading` in `$GRAPH_ROOT/journals/YYYY_MM_DD.md`. If missing, add it:
```
- ## Reading
	-
```

Append:
```
- ## Reading
	- `HH:MM` [[reading/[slug]]] — [topic title]
	  source:: [URL]
	  logged:: [[YYYY-MM-DD]]
```

**4. Confirm in one sentence**

*"Reading note created at `reading/[slug]` and linked in today's journal."*

---

## Rules
- Tabs for block indentation
- `read-on::` and `logged::` use dashes (`2026-05-14`)
- Leave all sections blank — this is a capture template, not a summary
- Flashcard bullets tagged with `#card` activate Logseq spaced repetition
