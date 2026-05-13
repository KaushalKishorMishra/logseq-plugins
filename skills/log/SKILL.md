---
name: log
description: Use when the user says "log this session", "log the work", "log what we did", "create an engineering log", or invokes /log. Creates a journal entry + detailed engineering log for the current session.
---

# Session Log

Document a work session in Logseq — today's journal + an engineering log page.

---

## Steps

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If this returns empty, tell the user to run `/setup` and stop.
Use the returned path as `$GRAPH_ROOT` for all file paths in this skill.

**1. Gather context**

```bash
git branch --show-current
git log --oneline -10
```

Also collect from the conversation:
- What problem was solved / what feature was built
- Key decisions made
- Known gaps or deferred items

**2. Update today's journal**

Get date:
```bash
date "+%Y_%m_%d"
```

File: `$GRAPH_ROOT/journals/YYYY_MM_DD.md`. Create if missing (use `morning` skill template).

Append under `## Work Log`:
```
- ## Work Log
	- **[Short description]** — branch `branch-name`
	  ref:: [[engineering-logs/YYYY-MM-DD-slug]]
		- [bullet: what was done]
		- [bullet: what was done]
		- [bullet: notable decision or finding]
```

**3. Create the engineering log**

File: `$GRAPH_ROOT/pages/engineering-logs/YYYY-MM-DD-<slug>.md`  
Slug = short hyphenated name, e.g. `course-progress-fixes`

```markdown
- # [Title]
  tags:: #pbl #fix #feat   ← pick from: #pbl #lms #fix #feat #refactor #types #test #chore #backend
  created:: [[YYYY-MM-DD]]
  branch:: `branch-name`
  commits:: `first-sha` → `last-sha` (N commits)
  journal:: [[YYYY_MM_DD]]
- **Goal:** One sentence describing what this session achieved.
- ## Context
  - Background: why this work was needed
  - Any audit findings or external constraints
- ## [Fix/Feat 1 — descriptive name]
  commit:: `sha`
  file:: `src/path/to/file.ts`
  - **Bug/Gap:** What was wrong or missing
  - **Root cause:** Why it happened
  - **Fix:** What changed (include before/after for one-liners)
  - status:: DONE
- ## Deferred / Known Gaps
  - [Anything intentionally left out, with reason]
- ## Key Decisions
  - [Architectural or design choices made, with rationale]
```

Add one `## Fix/Feat N` section per meaningful change. Use `status:: DONE`, `status:: PARTIAL`, or `status:: DEFERRED`.

**4. Confirm**

*"Session logged. Journal updated and engineering log created at `engineering-logs/YYYY-MM-DD-slug`."*

---

## Rules
- Tabs for Logseq indentation
- `created::` and `journal::` dates: created uses dashes, journal uses underscores in `[[brackets]]`
- Capture actual commit SHAs from git log — don't guess
- Engineering log is a permanent record — write for future-you reading cold
