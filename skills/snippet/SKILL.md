---
name: snippet
description: ALWAYS invoke when the user says "save this snippet", "log this code", "snippet:", "save this pattern", or invokes /snippet. Saves a reusable code snippet to pages/snippets/ and logs it in today's journal.
---

# Code Snippet

Save a reusable code snippet to `pages/snippets/[slug].md` + today's journal entry.

---

## Steps

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If empty, tell the user to run `/setup` and stop.

**1. Extract the content**

From the user message:
- **Description** — what this snippet does. If missing, ask: *"What does this snippet do?"*
- **Code** — the actual code block. If not provided in the message, create a blank template and tell the user to paste the code in.
- **Language** — infer from code or description (e.g. `typescript`, `bash`, `python`). Default `typescript` if unclear.

Generate **page slug**: lowercase, hyphenated (e.g. `use-debounce-hook`).

**2. Create the snippet page**

File: `$GRAPH_ROOT/pages/snippets/[slug].md`

With code provided:
```
# [Description]
language:: [language]
tags:: [inferred tags, e.g. #react #hook #typescript]
added:: [[YYYY-MM-DD]]

[description — one sentence on when to use this]

```[language]
[code]
```

## Usage
	- [usage example or leave blank]

## Notes
	-
```

Without code — create blank template:
```
# [Description]
language:: [language]
tags:: 
added:: [[YYYY-MM-DD]]

[description]

```[language]
// paste your snippet here
```

## Usage
	-

## Notes
	-
```

Use tabs for block indentation outside code blocks.

**3. Update today's journal under `## Notes`**

```bash
date "+%Y_%m_%d"
date "+%H:%M"
```

Append:
```
- ## Notes
	- `HH:MM` Saved snippet [[snippets/[slug]]] — [description] #snippet
	  logged:: [[YYYY-MM-DD]]
```

**4. Confirm in one sentence**

*"Snippet saved at `snippets/[slug]`."* If no code was provided: *"Blank template created at `snippets/[slug]` — paste your code there."*

---

## Rules
- Tabs for block indentation; standard indentation inside code blocks
- `added::` and `logged::` use dashes (`2026-05-14`)
- One snippet per page — keep pages focused and searchable
