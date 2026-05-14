---
name: link
description: ALWAYS invoke when the user says "save this link", "bookmark this", "log this URL", "link:", or invokes /link. Saves a URL with description and tags to the bookmarks page and logs it in today's journal.
---

# Bookmark Link

Save a URL to `pages/bookmarks.md` + today's journal entry.

---

## Steps

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If empty, tell the user to run `/setup` and stop.

**1. Extract the content**

From the user message:
- **URL** — required. If missing, ask: *"What's the URL?"*
- **Description** — everything after the URL or after `—`. If missing, ask: *"What's this link for?"*
- **Tags** — infer from context (e.g. `#tool`, `#article`, `#docs`, `#video`, `#resource`)

Derive a short **title** from the description (3–5 words max).

**2. Append to `pages/bookmarks.md`**

If the file doesn't exist, create it:
```
# Bookmarks
tags:: #bookmarks
description:: Curated links, tools, and resources.

```

Append entry:
```
## [Title]
url:: [URL]
added:: [[YYYY-MM-DD]]
tags:: [inferred tags]

[Description]

```

**3. Update today's journal under `## Notes`**

```bash
date "+%Y_%m_%d"
date "+%H:%M"
```

Find `## Notes` in `$GRAPH_ROOT/journals/YYYY_MM_DD.md`. If missing, add it.

Append:
```
- ## Notes
	- `HH:MM` Bookmarked [[bookmarks#[Title]]] — [description] #link
	  logged:: [[YYYY-MM-DD]]
```

**4. Confirm in one sentence**

*"Saved to bookmarks and logged in today's journal."*

---

## Rules
- Tabs for Logseq block indentation
- `added::` and `logged::` use dashes (`2026-05-14`)
- Infer tags from context — don't ask
- Keep descriptions concise — one sentence captures the value
