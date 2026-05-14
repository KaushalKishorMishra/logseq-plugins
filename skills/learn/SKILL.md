---
name: learn
description: ALWAYS invoke when the user says "log this learning", "log this as a learning", "I just learned", "I learned that", "remember this learning", "add to learnings", "note this as a learning", "learning:", or invokes /learn. Write to both today's journal and the permanent learnings page.
---

# Log Learning

Capture something learned — goes to today's journal AND the permanent learnings page.

---

## Steps

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If this returns empty, tell the user to run `/setup` and stop.
Use the returned path as `$GRAPH_ROOT` for all file paths in this skill.

**1. Extract the learning**

Everything after the trigger phrase. E.g.:
- `"I just learned that useOne appends id even when empty"` → the full discovery
- `"log this learning — Prettier useTabs adds alignment spaces ESLint rejects"` → after the dash
- `"/learn React strict mode double-invokes effects in dev"` → everything after `/learn`

If nothing follows the trigger, ask: *"What did you learn?"*

**2. Classify into a category**

| Category | When to use |
|----------|-------------|
| **Frontend** | React, TypeScript, Vite, CSS, browser behaviour, component patterns |
| **Backend & API** | API contracts, Refine hooks, REST behaviour, database |
| **Tooling & DX** | git, ESLint, Prettier, Vitest, build tools, Claude Code |
| **Architecture & Patterns** | design decisions, abstractions, file structure |
| **Debugging** | how a bug was found, non-obvious root cause, debugging technique |
| **Other** | anything else |

**3. Append to today's journal under `## Learnings`**

```bash
date "+%Y_%m_%d"
date "+%H:%M"
```

In `$GRAPH_ROOT/journals/YYYY_MM_DD.md`, append:
```
- ## Learnings
	- `HH:MM` [learning] #learning #[category-tag]
	  logged:: [[YYYY-MM-DD]]
	  category:: [Category name]
```

Category tags: `#frontend` `#backend` `#tooling` `#architecture` `#debugging`

**4. Append to `pages/learnings.md` under the matching section**

Find the section header (e.g. `## Frontend`) and append:
```
	- [learning]
	  logged:: [[YYYY-MM-DD]]
	  ref:: [[YYYY_MM_DD]]
```

If there's useful context (file, hook name, API, what the fix was), add it nested:
```
	- [learning]
	  logged:: [[YYYY-MM-DD]]
	  ref:: [[YYYY_MM_DD]]
		- Context: [one sentence — file, hook, API, etc.]
```

Skip the nested context bullet if the learning is self-contained.

**5. Confirm in one sentence**

*"Logged in today's learnings and saved to [Category] in the permanent page."*

---

## Rules
- Tabs for indentation
- `logged::` uses dashes (`2026-05-13`); `ref::` uses underscores in double brackets (`[[2026_05_13]]`)
- Capture the learning verbatim — don't rephrase
- `learnings.md` is the permanent, searchable record; the journal is the dated context
