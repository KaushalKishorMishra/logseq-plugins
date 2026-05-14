---
name: weekly
description: ALWAYS invoke when the user says "weekly review", "end of week", "week wrap", "weekly summary", or invokes /weekly. Reads the past week's journals and creates a weekly review page.
---

# Weekly Review

Read this week's journals and create a `pages/weekly-reviews/YYYY-WNN.md` summary page.

---

## Steps

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If empty, tell the user to run `/setup` and stop.

**1. Get week info and date**

```bash
date "+%Y-W%V"    # ISO week number, e.g. 2026-W20
date "+%Y_%m_%d"  # today
date "+%H:%M"     # current time
```

**2. Find this week's journals**

```bash
ls -1 $GRAPH_ROOT/journals/ | sort | tail -7
```

Read each journal file that exists for this week (Mon through today). For each one, extract:
- `## Work Log` bullets → What Shipped
- `## Learnings` bullets → Learnings
- `## Notes` bullets tagged `#idea` → Ideas Captured
- Unchecked `TODO` items from `## Morning` priorities → Carried Forward

**3. Create the weekly review page**

File: `$GRAPH_ROOT/pages/weekly-reviews/YYYY-WNN.md`

If file already exists, append a new dated section rather than overwriting.

```
# Weekly Review — YYYY-WNN
created:: [[YYYY-MM-DD]]
logged-at:: HH:MM
journals:: [[YYYY_MM_DD]], [[YYYY_MM_DD]], ...  ← link all journals read

## What Shipped
	- [bullet from Work Log]
	- [bullet from Work Log]

## Learnings
	- [learning from ## Learnings sections]
	- ref:: [[YYYY_MM_DD]]

## Ideas Captured
	- [idea bullets tagged #idea]

## Carried Forward
	- TODO [unchecked morning priority]

## Reflection
	-
```

Populate What Shipped, Learnings, Ideas, and Carried Forward from the journals. Leave Reflection blank for the user to fill.

**4. Update today's journal under `## Notes`**

```bash
date "+%Y_%m_%d"
```

Append:
```
- ## Notes
	- `HH:MM` Weekly review → [[weekly-reviews/YYYY-WNN]]
	  logged:: [[YYYY-MM-DD]]
```

**5. Confirm in one sentence**

*"Weekly review created at `weekly-reviews/YYYY-WNN`. Add your reflection and you're done."*

---

## Rules
- Tabs for block indentation
- `created::` and `logged::` use dashes (`2026-05-14`); `journals::` links use underscores in brackets
- Pull Work Log and Learnings verbatim — don't summarize or rephrase
- Leave Reflection blank — only the user fills this
- If a journal for a weekday is missing, skip it silently
