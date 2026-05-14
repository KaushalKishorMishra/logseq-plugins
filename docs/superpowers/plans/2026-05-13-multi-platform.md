# Multi-Platform Logseq Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Logseq Claude Code plugin into a universal, publishable npm package (`@kaushal/logseq-plugin`) that works with Claude Code, Gemini CLI, OpenCode, Codex, Pi, and any AI tool — with a guided Logseq setup flow for first-time users.

**Architecture:** Static multi-platform files — existing `SKILL.md` files are platform-agnostic; platform entry files (`CLAUDE.md`, `GEMINI.md`, `AGENTS.md`) handle tool-specific invocation. A Node.js `bin/install.mjs` script detects installed AI tools and copies the right entry files. All skills read the Logseq graph root from `~/.logseq-plugin-config` instead of hardcoding `~/Documents/Logseq`.

**Tech Stack:** Node.js ESM (`"type": "module"` already set), Markdown, Bash (inside skill instruction steps)

---

## File Map

| Action | Path |
|--------|------|
| Create | `.gitignore` |
| Modify | `package.json` |
| Create | `skills/setup/SKILL.md` |
| Modify | `skills/morning/SKILL.md` |
| Modify | `skills/eod/SKILL.md` |
| Modify | `skills/jot/SKILL.md` |
| Modify | `skills/learn/SKILL.md` |
| Modify | `skills/kb/SKILL.md` |
| Modify | `skills/log/SKILL.md` |
| Create | `GEMINI.md` |
| Create | `AGENTS.md` |
| Create | `bin/install.mjs` |
| Modify | `CLAUDE.md` |
| Modify | `.claude-plugin/marketplace.json` |

---

### Task 1: Create .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Write .gitignore**

Write `.gitignore`:
```
node_modules/
.DS_Store
.claude-plugin/
```

- [ ] **Step 2: Verify**

```bash
cat .gitignore
```
Expected: 3 lines as above.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore"
```

---

### Task 2: Update package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Rewrite package.json**

Write `package.json`:
```json
{
  "name": "@kaushal/logseq-plugin",
  "version": "1.1.0",
  "description": "Universal Logseq plugin for AI coding tools — daily journaling, session logging, quick capture, and knowledge management",
  "type": "module",
  "bin": {
    "logseq-plugin": "./bin/install.mjs"
  },
  "files": [
    "CLAUDE.md",
    "GEMINI.md",
    "AGENTS.md",
    "skills/",
    "bin/"
  ],
  "keywords": ["logseq", "ai", "journaling", "knowledge-management", "claude", "gemini"],
  "author": "Kaushal Kishor Mishra",
  "license": "MIT"
}
```

- [ ] **Step 2: Verify**

```bash
node -e "import('./package.json', {with:{type:'json'}}).then(m=>console.log(m.default.name, m.default.version))"
```
Expected: `@kaushal/logseq-plugin 1.1.0`

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: configure package.json for npm publish as @kaushal/logseq-plugin"
```

---

### Task 3: Create the setup skill

**Files:**
- Create: `skills/setup/SKILL.md`

- [ ] **Step 1: Write skills/setup/SKILL.md**

Write `skills/setup/SKILL.md`:
```markdown
---
name: setup
description: ALWAYS invoke when the user says "setup logseq", "install logseq", "configure logseq", or invokes /setup. Also invoke at the start of any other skill if ~/.logseq-plugin-config is missing.
---

# Setup

Install and configure Logseq for use with this plugin.

---

## Steps

**0. Check if already configured**

```bash
cat ~/.logseq-plugin-config 2>/dev/null
```
If the file exists and has a `graph_root=` line, show it to the user and ask: "Config already exists (shown above). Re-run setup and overwrite it?" Stop if they say no.

**1. Detect OS and check if Logseq is installed**

```bash
uname -s
```

Based on OS:
- **macOS** (`Darwin`): `test -d "/Applications/Logseq.app" && echo found || echo not-found`
- **Linux**: `ls ~/.local/share/applications/ 2>/dev/null | grep -i logseq | wc -l` (>0 = found) or `test -d "/opt/Logseq" && echo found || echo not-found`
- **Windows**: check `%LOCALAPPDATA%\Logseq` or `%APPDATA%\Logseq`

**2. If Logseq is NOT found**

Reply:
> Logseq isn't installed on this system.
> Download it at: **https://logseq.com/downloads**
>
> Install Logseq, open it, and create your first journal entry. Then run `/setup` again.

Stop here.

**3. If Logseq IS found — confirm graph root**

```bash
echo "$HOME/Documents/Logseq"
```

Ask:
> Logseq detected! Where is your Logseq graph folder?
> Press Enter to use the default: ~/Documents/Logseq

Use the user's answer, or `~/Documents/Logseq` if they provide nothing.

**4. Write config**

Write `~/.logseq-plugin-config`:
```
# Logseq plugin config — written by /setup
graph_root=<the path from step 3>
```

Example with default:
```
# Logseq plugin config — written by /setup
graph_root=~/Documents/Logseq
```

**5. Verify the graph is initialized**

```bash
ls <graph_root>/journals/ 2>/dev/null | head -3
```

- **Files listed** → "All set. Graph root saved to `~/.logseq-plugin-config`."
- **Empty/error** → "Graph root saved, but `journals/` doesn't exist yet. Open Logseq and write a journal entry to initialize the graph, then you're good to go."

---

## Rules
- Always check for an existing config (step 0) before writing — never silently overwrite
- Tilde `~` in the path is fine — no need to resolve to absolute
```

- [ ] **Step 2: Verify file exists**

```bash
ls skills/setup/SKILL.md
```
Expected: file listed.

- [ ] **Step 3: Commit**

```bash
git add skills/setup/SKILL.md
git commit -m "feat: add /setup skill for Logseq installation check and config"
```

---

### Task 4: Update all 6 existing skills to use dynamic graph root

Every skill hardcodes `~/Documents/Logseq`. Each needs: (a) a new step 0 that reads `graph_root` from config and stops if missing, and (b) every path updated to use `$GRAPH_ROOT`.

**Config-reading step pattern (inserted as Step 0 in every skill):**
```markdown
**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If this returns empty, the plugin isn't configured — tell the user to run `/setup` and stop.
Use the returned path as `$GRAPH_ROOT` for all file paths in this skill.
```

**Files:**
- Modify: `skills/morning/SKILL.md`
- Modify: `skills/eod/SKILL.md`
- Modify: `skills/jot/SKILL.md`
- Modify: `skills/learn/SKILL.md`
- Modify: `skills/kb/SKILL.md`
- Modify: `skills/log/SKILL.md`

- [ ] **Step 1: Update skills/morning/SKILL.md**

Write `skills/morning/SKILL.md`:
```markdown
---
name: morning
description: ALWAYS invoke when the user says "good morning", "morning", "gm", "hey good morning", "starting my day", "starting work", or any morning greeting at the start of a session. Trigger immediately — do not wait for the user to ask.
---

# Morning Journal

Set up today's Logseq journal and capture the day's focus.

---

## Steps

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If this returns empty, tell the user to run `/setup` and stop.
Use the returned path as `$GRAPH_ROOT` for all file paths below.

**1. Get today's date**
```bash
date "+%Y_%m_%d"   # filename  →  2026_05_14
date "+%A, %B %d %Y"            # display  →  Thursday, May 14 2026
```

**2. Create journal if it doesn't exist**

Write `$GRAPH_ROOT/journals/YYYY_MM_DD.md`:
```
- ## Morning — "What good shall I do this day?"
  collapsed:: true
	- **Focus:** 
	-
	- **Priorities:**
	- TODO 
	- TODO 
	- TODO 
- ## Work Log
	-
- ## Notes
	-
- ## Learnings
	-
- ## Evening — "What good have I done today?"
  collapsed:: true
	- **Shipped:**
	-
	- **Carried forward:**
	-
	- **Reflection:**
	-
```
If it already exists and the morning section has real content (not blank TODOs), skip to step 4.

**3. Ask two questions**

> Good morning! It's [Day, Date].
> 1. **Focus** — what's the single most important thing to ship today?
> 2. **Priorities** — top 3 tasks (one per line)?

Wait for the response.

**4. Fill in the morning section**
```
- ## Morning — "What good shall I do this day?"
  collapsed:: true
	- **Focus:** [their answer]
	-
	- **Priorities:**
	- TODO [priority 1]
	- TODO [priority 2]
	- TODO [priority 3]
```

**5. Confirm in one sentence**

Mention their focus back. E.g. *"Set. You're focused on [focus] today."*

---

## Rules
- Tabs for indentation (Logseq requires it)
- `TODO` prefix on each priority so Logseq tracks them as tasks
- Don't fill Work Log, Notes, Learnings, or Evening — those are filled during/after the day
```

- [ ] **Step 2: Update skills/eod/SKILL.md**

Write `skills/eod/SKILL.md`:
```markdown
---
name: eod
description: ALWAYS invoke when the user says "eod", "end of day", "bye", "bye bye", "goodbye", "good evening", "signing off", "wrapping up", "calling it a day", "goodnight", "good night", "done for today", "that's it for today", or any end-of-day signal. Trigger immediately — do not wait for the user to ask.
---

# Evening Journal (EOD)

Close out today's Logseq journal with a reflection on what was shipped.

---

## Steps

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If this returns empty, tell the user to run `/setup` and stop.
Use the returned path as `$GRAPH_ROOT` for all file paths below.

**1. Get today's date**
```bash
date "+%Y_%m_%d"
```

**2. Pull today's commits**
```bash
git log --oneline --since="today 00:00" 2>/dev/null | head -20
```

**3. Read today's journal**
```bash
cat $GRAPH_ROOT/journals/$(date +%Y_%m_%d).md
```
Note any open `TODO` items in the morning priorities — they become "carried forward" unless the user says otherwise.

If the file doesn't exist, create it first (see `morning` skill), then continue.

**4. Ask three questions**

> Wrapping up for today.
> 1. **Shipped** — what did you finish? (say "see commits" to use git log)
> 2. **Carried forward** — anything moving to tomorrow?
> 3. **Reflection** — one sentence on how the day went. (skip with "none")

If they say "see commits", use the git log from step 2.

**5. Fill in the Evening section**
```
- ## Evening — "What good have I done today?"
  collapsed:: true
	- **Shipped:**
		- [item]
		- [item]
	- **Carried forward:**
		- [item]
	- **Reflection:**
		- [reflection or leave blank]
```

If Work Log is empty but commits exist, add a brief summary there too.

**6. Offer an engineering log**

Only ask if the day had substantial work (multiple commits, new features, notable fixes):
> *Want me to create an engineering log for today's session?*

If yes → invoke the `log` skill.

**7. Sign off in one sentence**

Reference the main thing shipped. E.g. *"Good work today — [main thing] is done and committed."*

---

## Rules
- Tabs for indentation
- Don't overwrite the evening section if the user already filled it — append or confirm it's complete
- Unchecked `TODO` items from the morning go into "Carried forward" unless told otherwise
```

- [ ] **Step 3: Update skills/jot/SKILL.md**

Write `skills/jot/SKILL.md`:
```markdown
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
Use the returned path as `$GRAPH_ROOT` for all file paths below.

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

Get date:
```bash
date "+%Y_%m_%d"
```

Find `## Notes` in `$GRAPH_ROOT/journals/YYYY_MM_DD.md`. If missing, add it after `## Work Log`:
```
- ## Notes
	-
```

Append:
```
- ## Notes
	- [content] #jot
	  logged:: [[YYYY-MM-DD]]
```

**4. Write to secondary destination (if Idea or Todo)**

**Idea** → append under `## Backlog` in `$GRAPH_ROOT/pages/dev-ideas.md`:
```
	- ### [short title]
	  tags:: #idea [#pbl / #frontend / #dx / #backend as appropriate]
	  logged:: [[YYYY-MM-DD]]
		- [content]
```

**Todo** → append to the best-fit section in `$GRAPH_ROOT/pages/dev-todos.md`, or create `## Inbox` at the top:
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
```

- [ ] **Step 4: Update skills/learn/SKILL.md**

Write `skills/learn/SKILL.md`:
```markdown
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
Use the returned path as `$GRAPH_ROOT` for all file paths below.

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
| **Backend & API** | API contracts, hooks, REST behaviour, database |
| **Tooling & DX** | git, linters, build tools, AI coding tools |
| **Architecture & Patterns** | design decisions, abstractions, file structure |
| **Debugging** | how a bug was found, non-obvious root cause, debugging technique |
| **Other** | anything else |

**3. Append to today's journal under `## Learnings`**

```bash
date "+%Y_%m_%d"
```

In `$GRAPH_ROOT/journals/YYYY_MM_DD.md`, append:
```
- ## Learnings
	- [learning] #learning #[category-tag]
	  logged:: [[YYYY-MM-DD]]
	  category:: [Category name]
```

Category tags: `#frontend` `#backend` `#tooling` `#architecture` `#debugging`

**4. Append to `$GRAPH_ROOT/pages/learnings.md` under the matching section**

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
```

- [ ] **Step 5: Update skills/kb/SKILL.md**

Write `skills/kb/SKILL.md`:
```markdown
---
name: kb
description: ALWAYS invoke when the user says "add this to the knowledge base", "log this to kb", "save this to kb", "knowledge base:", "kb:", "document this pattern", "add to kb", or invokes /kb. Save reference material to the Logseq knowledge base folder.
---

# Knowledge Base

Save a piece of reference knowledge to `pages/knowledge-base/`.

---

## Steps

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If this returns empty, tell the user to run `/setup` and stop.
Use the returned path as `$GRAPH_ROOT` for all file paths below.

**1. Extract the content**

Everything after the trigger phrase is the knowledge to save.

If nothing follows the trigger, ask: *"What do you want to add to the knowledge base?"*

**2. Decide: existing page or new page?**

List existing KB pages:
```bash
ls $GRAPH_ROOT/pages/knowledge-base/ 2>/dev/null
```

Pick the best-fit page, or create a new one named `Topic-Name.md` (PascalCase with dashes).

**3. Append to the chosen page**

Read the existing page first to find the right section or append at the end.

Format for a new entry:
```markdown
## [Topic or Pattern Name]

added:: [[YYYY-MM-DD]]

[Content — reference docs, patterns, examples, gotchas]
```

For a code example:
```markdown
## [Topic or Pattern Name]

added:: [[YYYY-MM-DD]]

[Explanation]

```tsx
// example code
```

> **Gotcha:** [any non-obvious caveat]
```

For a gotcha without a full pattern:
```markdown
### [Brief title]
added:: [[YYYY-MM-DD]]
[Content]
```

**4. If creating a new page**

```markdown
# [Page Title]
tags:: #knowledge-base #[domain: frontend / backend / testing / etc.]
description:: [One sentence about what this page covers]

## [First section]
added:: [[YYYY-MM-DD]]

[Content]
```

**5. Confirm in one sentence**

*"Added to [page name] in the knowledge base."*  
or  
*"Created [page name].md in the knowledge base."*

---

## Rules
- Tabs for Logseq block indentation; normal markdown indentation inside content
- `added::` uses dashes (`2026-05-13`)
- KB pages are **reference docs**, not logs — write for future-you reading cold, not as a diary entry
- If the content is better suited for `learnings.md`, suggest `/learn` instead
```

- [ ] **Step 6: Update skills/log/SKILL.md**

Write `skills/log/SKILL.md`:
```markdown
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
Use the returned path as `$GRAPH_ROOT` for all file paths below.

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
Slug = short hyphenated name, e.g. `multi-platform-plugin`

```markdown
- # [Title]
  tags:: #fix #feat   ← pick from: #fix #feat #refactor #types #test #chore #backend
  created:: [[YYYY-MM-DD]]
  branch:: `branch-name`
  commits:: `first-sha` → `last-sha` (N commits)
  journal:: [[YYYY_MM_DD]]
- **Goal:** One sentence describing what this session achieved.
- ## Context
  - Background: why this work was needed
- ## [Fix/Feat 1 — descriptive name]
  commit:: `sha`
  file:: `src/path/to/file`
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
- `created::` uses dashes; `journal::` uses underscores in `[[brackets]]`
- Capture actual commit SHAs from git log — don't guess
- Engineering log is a permanent record — write for future-you reading cold
```

- [ ] **Step 7: Verify no hardcoded paths remain**

```bash
grep -l '~/Documents/Logseq' skills/morning/SKILL.md skills/eod/SKILL.md skills/jot/SKILL.md skills/learn/SKILL.md skills/kb/SKILL.md skills/log/SKILL.md 2>/dev/null
```
Expected: no output.

```bash
grep -c 'GRAPH_ROOT' skills/morning/SKILL.md skills/eod/SKILL.md skills/jot/SKILL.md skills/learn/SKILL.md skills/kb/SKILL.md skills/log/SKILL.md
```
Expected: each file shows a count > 0.

- [ ] **Step 8: Commit**

```bash
git add skills/morning/SKILL.md skills/eod/SKILL.md skills/jot/SKILL.md skills/learn/SKILL.md skills/kb/SKILL.md skills/log/SKILL.md
git commit -m "feat: update all skills to read graph root from ~/.logseq-plugin-config"
```

---

### Task 5: Create GEMINI.md

**Files:**
- Create: `GEMINI.md`

- [ ] **Step 1: Write GEMINI.md**

Write `GEMINI.md`:
```markdown
# Logseq Plugin

Personal Logseq knowledge-graph integration for daily journaling, session logging, quick capture, and knowledge management.

**Graph root:** configured via `/setup` → stored in `~/.logseq-plugin-config`

## Skills

Invoke skills using the `activate_skill` tool. The trigger phrases below also auto-invoke each skill.

| Skill | Invoke | Auto-triggers on |
|-------|--------|-----------------|
| `logseq:setup` | `/setup` | "setup logseq", "install logseq", when `~/.logseq-plugin-config` is missing |
| `logseq:morning` | `/morning` | "good morning", "gm", "starting my day", "starting work" |
| `logseq:eod` | `/eod` | "eod", "bye", "signing off", "wrapping up", "done for today" |
| `logseq:jot` | `/jot [content]` | "jot this", "quick note", "capture this", "idea:", "note:" |
| `logseq:learn` | `/learn [content]` | "I learned", "log this learning", "I just learned" |
| `logseq:kb` | `/kb [content]` | "add to kb", "knowledge base:", "document this pattern" |
| `logseq:log` | `/log` | "log this session", "log the work", "create an engineering log" |

## Logseq Conventions

- **Tabs** for block indentation (never spaces)
- **Journal filenames:** `YYYY_MM_DD` (underscores)
- **Date properties:** `logged:: 2026-05-13` (dashes)
- **Journal links:** `[[YYYY_MM_DD]]` (underscores in brackets)
- **Page links:** `[[page-name]]` or `[[folder/page-name]]`
```

- [ ] **Step 2: Verify**

```bash
grep -c 'logseq:' GEMINI.md
```
Expected: `7` (one per skill).

- [ ] **Step 3: Commit**

```bash
git add GEMINI.md
git commit -m "feat: add GEMINI.md entry file for Gemini CLI"
```

---

### Task 6: Create AGENTS.md

**Files:**
- Create: `AGENTS.md`

This file is entirely self-contained — all skill instructions are inlined — for tools that have no skill runner (OpenCode, Codex, Pi, and any future AI tool).

- [ ] **Step 1: Write AGENTS.md**

Write `AGENTS.md`:
```markdown
# Logseq Plugin

Personal Logseq knowledge-graph integration for daily journaling, session logging, quick capture, and knowledge management.

**Graph root:** configured via `/setup` → stored in `~/.logseq-plugin-config`

---

## Auto-Trigger Rules

Run the matching skill automatically when the user says these phrases — no explicit command needed:

| Phrase | Skill to run |
|--------|-------------|
| "good morning", "morning", "gm", "starting my day", "starting work" | /morning |
| "eod", "end of day", "bye", "signing off", "wrapping up", "goodnight", "done for today" | /eod |
| "jot this", "quick note", "capture this", "idea:", "note:" | /jot |
| "I learned", "I just learned", "log this learning" | /learn |
| "add to kb", "knowledge base:", "kb:", "document this pattern" | /kb |
| "log this session", "log the work", "create an engineering log" | /log |
| "/setup", "setup logseq", "install logseq" | /setup |

---

## Reading the Graph Root

Before every skill, run:
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If the output is empty → tell the user to run `/setup` and stop. Otherwise use the output as `$GRAPH_ROOT` for all file paths.

---

## /setup

**Trigger:** `/setup`, "setup logseq", "install logseq", or when `~/.logseq-plugin-config` is missing before any other skill.

1. Check for existing config: `cat ~/.logseq-plugin-config 2>/dev/null` — if found, show it and ask before overwriting.
2. Detect OS: `uname -s`
3. Check Logseq:
   - macOS: `test -d "/Applications/Logseq.app" && echo found || echo not-found`
   - Linux: `ls ~/.local/share/applications/ 2>/dev/null | grep -i logseq | wc -l` (>0 = found), or `test -d "/opt/Logseq"`
   - Windows: check `%LOCALAPPDATA%\Logseq`
4. **Not found:** Reply: "Logseq isn't installed. Download it at: https://logseq.com/downloads — install it, open it, create a journal entry, then run `/setup` again." Stop.
5. **Found:** Ask: "Where is your Logseq graph folder? (default: ~/Documents/Logseq)"
6. Write `~/.logseq-plugin-config`:
   ```
   # Logseq plugin config — written by /setup
   graph_root=<path>
   ```
7. Verify: `ls <graph_root>/journals/ 2>/dev/null | head -3` — if empty, warn user to open Logseq and initialize the graph.
8. Confirm: "All set. Graph root saved to `~/.logseq-plugin-config`."

---

## /morning

**Trigger:** "good morning", "gm", "morning", "starting my day", "starting work"

1. Read graph root. Stop if missing.
2. `date "+%Y_%m_%d"` (filename) and `date "+%A, %B %d %Y"` (display).
3. Write `$GRAPH_ROOT/journals/YYYY_MM_DD.md` if it doesn't exist:
   ```
   - ## Morning — "What good shall I do this day?"
     collapsed:: true
   	- **Focus:** 
   	-
   	- **Priorities:**
   	- TODO 
   	- TODO 
   	- TODO 
   - ## Work Log
   	-
   - ## Notes
   	-
   - ## Learnings
   	-
   - ## Evening — "What good have I done today?"
     collapsed:: true
   	- **Shipped:**
   	-
   	- **Carried forward:**
   	-
   	- **Reflection:**
   	-
   ```
   If the file exists and morning section has real content, skip to step 5.
4. Ask: "Good morning! It's [Day, Date]. 1. Focus — most important thing today? 2. Priorities — top 3 tasks?"
5. Fill in the morning section with their answers. Use `TODO` prefix on each priority.
6. Confirm: "Set. You're focused on [focus] today."

Rules: tabs for indentation. Don't fill Work Log, Notes, Learnings, or Evening sections.

---

## /eod

**Trigger:** "eod", "end of day", "bye", "signing off", "wrapping up", "done for today", "goodnight"

1. Read graph root. Stop if missing.
2. `date "+%Y_%m_%d"`
3. `git log --oneline --since="today 00:00" 2>/dev/null | head -20`
4. `cat $GRAPH_ROOT/journals/$(date +%Y_%m_%d).md` — note open TODO items.
5. If journal missing, create it (/morning template), then continue.
6. Ask: "Wrapping up. 1. Shipped? 2. Carried forward? 3. Reflection (one sentence, or 'none')?"
7. Fill Evening section:
   ```
   - ## Evening — "What good have I done today?"
     collapsed:: true
   	- **Shipped:**
   		- [item]
   	- **Carried forward:**
   		- [item]
   	- **Reflection:**
   		- [one sentence]
   ```
8. If substantial work (multiple commits): ask "Want an engineering log?" If yes → run /log.
9. Sign off: "Good work today — [main thing] is done."

Rules: tabs. Don't overwrite Evening section if already filled. Open TODOs → Carried forward.

---

## /jot

**Trigger:** "jot this", "quick note", "capture this", "idea:", "note:", or `/jot [content]`

1. Read graph root. Stop if missing.
2. Extract content after trigger. If nothing, ask: "What do you want to capture?"
3. Classify silently — Idea ("we should", "what if", "explore"), Todo ("need to", "fix", "don't forget"), or Observation (anything else).
4. `date "+%Y_%m_%d"`
5. Append to `$GRAPH_ROOT/journals/YYYY_MM_DD.md` under `## Notes` (create section if missing):
   ```
   - ## Notes
   	- [content] #jot
   	  logged:: [[YYYY-MM-DD]]
   ```
6. Idea → append to `$GRAPH_ROOT/pages/dev-ideas.md` under `## Backlog`:
   ```
   	- ### [short title]
   	  tags:: #idea
   	  logged:: [[YYYY-MM-DD]]
   		- [content]
   ```
7. Todo → append to `$GRAPH_ROOT/pages/dev-todos.md`:
   ```
   - ## Inbox
     found:: [[YYYY-MM-DD]]
   	- TODO [content]
   	  priority:: Medium
   ```
8. Confirm: "Captured." / "Logged in notes and dev-ideas." / "Added to notes and dev-todos."

Rules: tabs. Capture verbatim. No questions unless content is empty.

---

## /learn

**Trigger:** "I learned", "I just learned", "log this learning", or `/learn [content]`

1. Read graph root. Stop if missing.
2. Extract learning after trigger. If nothing, ask: "What did you learn?"
3. Classify: Frontend / Backend & API / Tooling & DX / Architecture & Patterns / Debugging / Other.
4. `date "+%Y_%m_%d"`
5. Append to `$GRAPH_ROOT/journals/YYYY_MM_DD.md` under `## Learnings`:
   ```
   - ## Learnings
   	- [learning] #learning #[category-tag]
   	  logged:: [[YYYY-MM-DD]]
   	  category:: [Category]
   ```
6. Append to `$GRAPH_ROOT/pages/learnings.md` under `## [Category]`:
   ```
   	- [learning]
   	  logged:: [[YYYY-MM-DD]]
   	  ref:: [[YYYY_MM_DD]]
   ```
   Add nested context bullet if the learning has relevant context (file, API, fix).
7. Confirm: "Logged in today's learnings and saved to [Category] in the permanent page."

Rules: tabs. `logged::` uses dashes; `ref::` uses underscores. Capture verbatim.

---

## /kb

**Trigger:** "add to kb", "knowledge base:", "kb:", "document this pattern", or `/kb [content]`

1. Read graph root. Stop if missing.
2. Extract content. If nothing, ask: "What do you want to add to the knowledge base?"
3. List existing pages: `ls $GRAPH_ROOT/pages/knowledge-base/ 2>/dev/null`
4. Pick best-fit page or create `Topic-Name.md` (PascalCase with dashes).
5. Append to chosen page:
   ```markdown
   ## [Topic or Pattern Name]

   added:: [[YYYY-MM-DD]]

   [Content]
   ```
6. New page header:
   ```markdown
   # [Page Title]
   tags:: #knowledge-base #[domain]
   description:: [One sentence]
   ```
7. Confirm: "Added to [page name]." or "Created [page name].md."

Rules: `added::` uses dashes. Reference docs, not logs.

---

## /log

**Trigger:** "log this session", "log the work", "create an engineering log", or `/log`

1. Read graph root. Stop if missing.
2. `git branch --show-current` + `git log --oneline -10`
3. `date "+%Y_%m_%d"`
4. Append to `$GRAPH_ROOT/journals/YYYY_MM_DD.md` under `## Work Log`:
   ```
   - ## Work Log
   	- **[Short description]** — branch `branch-name`
   	  ref:: [[engineering-logs/YYYY-MM-DD-slug]]
   		- [what was done]
   ```
5. Create `$GRAPH_ROOT/pages/engineering-logs/YYYY-MM-DD-<slug>.md`:
   ```markdown
   - # [Title]
     tags:: #fix #feat
     created:: [[YYYY-MM-DD]]
     branch:: `branch-name`
     commits:: `first-sha` → `last-sha`
     journal:: [[YYYY_MM_DD]]
   - **Goal:** [one sentence]
   - ## Context
     - [background]
   - ## [Fix/Feat 1]
     commit:: `sha`
     - **Bug/Gap:** [what was wrong]
     - **Fix:** [what changed]
     - status:: DONE
   - ## Deferred / Known Gaps
     - [anything left out]
   - ## Key Decisions
     - [decisions with rationale]
   ```
6. Confirm: "Session logged. Journal updated and engineering log created at engineering-logs/YYYY-MM-DD-slug."

Rules: tabs. `created::` dashes; `journal::` underscores in `[[brackets]]`. Real commit SHAs only.

---

## Logseq Conventions

- **Tabs** for block indentation (never spaces — Logseq rejects spaces)
- **Journal filenames:** `YYYY_MM_DD` (underscores, e.g. `2026_05_13.md`)
- **Date properties:** `logged:: 2026-05-13` (dashes)
- **Journal links:** `[[YYYY_MM_DD]]` (underscores in brackets)
- **Page links:** `[[page-name]]` or `[[folder/page-name]]`
```

- [ ] **Step 2: Verify skill count**

```bash
grep -c '^## /' AGENTS.md
```
Expected: `7`.

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "feat: add AGENTS.md universal self-contained entry file"
```

---

### Task 7: Create bin/install.mjs

**Files:**
- Create: `bin/install.mjs`

- [ ] **Step 1: Create bin/ directory**

```bash
mkdir -p bin
```

- [ ] **Step 2: Write bin/install.mjs**

Write `bin/install.mjs`:
```javascript
#!/usr/bin/env node
import { existsSync, cpSync, writeFileSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginRoot = join(__dirname, '..');
const cwd = process.cwd();
const home = homedir();

function commandExists(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function detectTools() {
  const tools = [];
  if (existsSync(join(home, '.claude'))) tools.push('claude');
  if (existsSync(join(home, '.gemini')) || commandExists('gemini')) tools.push('gemini');
  if (commandExists('opencode') || existsSync(join(home, '.config', 'opencode'))) tools.push('opencode');
  if (commandExists('codex')) tools.push('codex');
  return tools;
}

function detectLogseq() {
  const { platform } = process;
  if (platform === 'darwin') {
    return existsSync('/Applications/Logseq.app');
  }
  if (platform === 'linux') {
    try {
      const files = execSync('ls ~/.local/share/applications/ 2>/dev/null', { encoding: 'utf8' });
      return files.toLowerCase().includes('logseq') || existsSync('/opt/Logseq');
    } catch {
      return false;
    }
  }
  if (platform === 'win32') {
    return (
      existsSync(join(process.env.LOCALAPPDATA || '', 'Logseq')) ||
      existsSync(join(process.env.APPDATA || '', 'Logseq'))
    );
  }
  return false;
}

function copyFile(srcName, destPath) {
  if (existsSync(destPath)) {
    console.log(`  ⚠  ${srcName} already exists — skipping (delete to reinstall)`);
    return;
  }
  writeFileSync(destPath, readFileSync(join(pluginRoot, srcName)));
  console.log(`  ✓ Wrote ${srcName}`);
}

const args = process.argv.slice(2);
if (args[0] !== 'install') {
  console.log('Usage: npx @kaushal/logseq-plugin install');
  process.exit(0);
}

const tools = detectTools();
console.log('\n@kaushal/logseq-plugin installer');
console.log(`Detected AI tools: ${tools.length ? tools.join(', ') : 'none'}\n`);

// Entry files — AGENTS.md always written as universal fallback
const entryFiles = ['AGENTS.md'];
if (tools.includes('claude')) entryFiles.push('CLAUDE.md');
if (tools.includes('gemini')) entryFiles.push('GEMINI.md');

for (const file of entryFiles) {
  copyFile(file, join(cwd, file));
}

// Skills directory
const skillsDest = join(cwd, 'skills');
if (existsSync(skillsDest)) {
  console.log('  ⚠  skills/ already exists — skipping (delete to reinstall)');
} else {
  cpSync(join(pluginRoot, 'skills'), skillsDest, { recursive: true });
  console.log('  ✓ Copied skills/');
}

// Logseq detection
const logseqFound = detectLogseq();
if (!logseqFound) {
  console.log(`
⚠  Logseq not detected on this system.
   Download it at: https://logseq.com/downloads

   After installing Logseq and opening your graph at least once:
   → Run /setup in your AI tool to configure your graph path.
`);
} else {
  console.log('\n✓ Logseq detected.');
  console.log('→ Run /setup in your AI tool to set your graph path.\n');
}
```

- [ ] **Step 3: Make executable**

```bash
chmod +x bin/install.mjs
```

- [ ] **Step 4: Smoke test**

```bash
node bin/install.mjs
```
Expected output includes: `Usage: npx @kaushal/logseq-plugin install`

```bash
node bin/install.mjs install 2>&1 | head -4
```
Expected: includes `@kaushal/logseq-plugin installer` and `Detected AI tools:`.

- [ ] **Step 5: Commit**

```bash
git add bin/install.mjs
git commit -m "feat: add npx installer bin/install.mjs"
```

---

### Task 8: Update CLAUDE.md and marketplace.json

**Files:**
- Modify: `CLAUDE.md`
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Update CLAUDE.md**

Write `CLAUDE.md`:
```markdown
# Logseq Plugin

Personal Logseq knowledge-graph integration for daily journaling, session logging, quick capture, and knowledge management.

**Graph root:** configured via `/setup` → stored in `~/.logseq-plugin-config`

## Skills

| Skill | Invoke | Auto-triggers on |
|-------|--------|-----------------|
| `logseq:setup` | `/setup` | "setup logseq", "install logseq", when config is missing |
| `logseq:morning` | `/morning` | "good morning", "gm", "starting my day" |
| `logseq:eod` | `/eod` | "eod", "bye", "signing off", "wrapping up" |
| `logseq:jot` | `/jot [content]` | "jot this", "quick note", "capture this" |
| `logseq:learn` | `/learn [content]` | "I learned", "log this learning" |
| `logseq:kb` | `/kb [content]` | "add to kb", "knowledge base:" |
| `logseq:log` | `/log` | "log this session", "log the work" |

## Logseq Conventions

- **Tabs** for block indentation (never spaces)
- **Journal filenames:** `YYYY_MM_DD` (underscores)
- **Date properties:** `logged:: 2026-05-13` (dashes)
- **Journal links:** `[[YYYY_MM_DD]]` (underscores in brackets)
- **Page links:** `[[page-name]]` or `[[folder/page-name]]`
```

- [ ] **Step 2: Update .claude-plugin/marketplace.json**

Write `.claude-plugin/marketplace.json`:
```json
{
	"name": "@kaushal/logseq-plugin",
	"description": "Universal Logseq plugin for AI coding tools — daily journaling, session logging, quick capture, and knowledge management",
	"owner": {
		"name": "Kaushal Kishor Mishra",
		"email": "kaushalkmishra.dev@gmail.com"
	},
	"plugins": [
		{
			"name": "logseq",
			"description": "Universal Logseq plugin for AI coding tools — daily journaling, session logging, quick capture, and knowledge management. Works with Claude Code, Gemini CLI, OpenCode, Codex, Pi, and any AI tool.",
			"version": "1.1.0",
			"source": "./",
			"author": {
				"name": "Kaushal Kishor Mishra"
			},
			"category": "productivity"
		}
	]
}
```

- [ ] **Step 3: Verify**

```bash
grep 'setup' CLAUDE.md && grep '1.1.0' .claude-plugin/marketplace.json
```
Expected: both lines found.

- [ ] **Step 4: Final commit**

```bash
git add CLAUDE.md .claude-plugin/marketplace.json
git commit -m "feat: update CLAUDE.md and marketplace.json for v1.1.0 multi-platform release"
```
