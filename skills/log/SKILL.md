---
name: log
description: TWO modes. (1) AUTO-CAPTURE — proactively invoke WITHOUT being asked whenever a major decision is made, architectural choice is accepted, root cause is discovered, or a non-obvious pattern is established during a development session. (2) SESSION LOG — invoke when user says "log this session", "log the work", "create an engineering log", or invokes /log for a full end-of-session log.
---

# Session Log

Two modes: **auto-capture** (real-time decisions mid-session) and **session log** (comprehensive end-of-session log).

---

## Which mode am I in?

- **Auto-capture** — I detected a significant decision, root cause, or architectural choice. The user did NOT ask for a log.
- **Session log** — The user said `/log` or asked to log the session.

---

## Mode 1: Auto-Capture (proactive, mid-session)

Trigger on any of these without waiting for the user to ask:
- A major architectural or design decision was just made or accepted
- A root cause was just identified
- A non-obvious pattern, constraint, or tradeoff was established
- A key technical finding emerged from debugging or research

**What to capture:**

```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
date "+%Y_%m_%d"
date "+%H:%M"
```

Append ONE bullet under `## Work Log` in today's journal:

```
- ## Work Log
	- `HH:MM` **Decision:** [one sentence — what was decided and why] #decision
	  logged:: [[YYYY-MM-DD]]
```

Or for a root cause / finding:
```
- ## Work Log
	- `HH:MM` **Finding:** [what was discovered — root cause, constraint, or pattern] #finding
	  logged:: [[YYYY-MM-DD]]
```

Then say nothing to the user — do this silently in the background. Do NOT interrupt the conversation with a confirmation.

**What qualifies:**

| Worth auto-capturing | NOT worth capturing |
|---------------------|---------------------|
| "We'll use X over Y because Z" | Routine code edits |
| Root cause of a non-trivial bug | Typo fixes |
| A surprising API or library behavior | Normal task progress |
| An architectural tradeoff accepted | Things obvious from the code |
| A decision that future-you would need context on | |

---

## Mode 2: Session Log (on `/log`)

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If empty, tell the user to run `/setup` and stop.

**1. Gather context**

```bash
git branch --show-current
git log --oneline -10
```

Also collect from the conversation:
- What problem was solved / what feature was built
- Key decisions made (including any already auto-captured today)
- Known gaps or deferred items

**2. Update today's journal**

```bash
date "+%Y_%m_%d"
date "+%H:%M"
```

File: `$GRAPH_ROOT/journals/YYYY_MM_DD.md`. Create if missing (use `morning` skill template).

Append under `## Work Log`:
```
- ## Work Log
	- `HH:MM` **[Short description]** — branch `branch-name`
	  ref:: [[engineering-logs/YYYY-MM-DD-slug]]
		- [bullet: what was done]
		- [bullet: what was done]
		- [bullet: notable decision or finding]
```

**3. Create the engineering log**

File: `$GRAPH_ROOT/pages/engineering-logs/YYYY-MM-DD-<slug>.md`

```markdown
- # [Title]
  tags:: #fix #feat   ← pick from: #fix #feat #refactor #types #test #chore #backend #dx
  created:: [[YYYY-MM-DD]]
  logged-at:: HH:MM
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
- `created::` and `logged::` use dashes; `journal::` uses underscores in `[[brackets]]`
- Capture actual commit SHAs from git log — don't guess
- Auto-captures are silent — never interrupt the conversation to confirm them
- Engineering log is a permanent record — write for future-you reading cold
