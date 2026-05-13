# Logseq Plugin

Personal Logseq knowledge-graph integration for daily journaling, session logging, quick capture, and knowledge management.

**Graph root:** configured via `/setup` → stored in `~/.logseq-plugin-config`

---

## Commands

These slash commands are available at any time. Run them by typing the command:

| Command | What it does |
|---------|-------------|
| `/setup` | Install Logseq and configure your graph path (run this first) |
| `/morning` | Open today's journal and set your focus + priorities |
| `/eod` | Close the day with a reflection on what shipped |
| `/jot [content]` | Capture a quick thought, idea, or todo |
| `/learn [content]` | Log a learning to today's journal and the permanent learnings page |
| `/kb [content]` | Save reference knowledge to the knowledge base |
| `/log` | Create a detailed engineering log for the current session |

## Auto-Trigger Rules

Also run the matching skill automatically when the user says these phrases (no command needed):

| Phrase | Skill |
|--------|-------|
| "good morning", "morning", "gm", "starting my day", "starting work" | /morning |
| "eod", "end of day", "bye", "signing off", "wrapping up", "goodnight", "done for today" | /eod |
| "jot this", "quick note", "capture this", "idea:", "note:" | /jot |
| "I learned", "I just learned", "log this learning" | /learn |
| "add to kb", "knowledge base:", "kb:", "document this pattern" | /kb |
| "log this session", "log the work", "create an engineering log" | /log |
| "/setup", "setup logseq", "install logseq" | /setup |

---

## Reading the Graph Root (required before every skill)

```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If the output is empty → tell the user to run `/setup` and stop.
Use the output as `$GRAPH_ROOT` for all file paths below.

---

## /setup

**Trigger:** `/setup`, "setup logseq", "install logseq", or when `~/.logseq-plugin-config` is missing.

1. Check for existing config: `cat ~/.logseq-plugin-config 2>/dev/null` — if found, show it and confirm before overwriting.
2. Detect OS: `uname -s`
3. Check Logseq is installed:
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
7. Verify: `ls <graph_root>/journals/ 2>/dev/null | head -3` — if empty, warn user to open Logseq first.
8. Confirm: "All set. Graph root saved to `~/.logseq-plugin-config`."

---

## /morning

**Trigger:** `/morning`, "good morning", "gm", "starting my day", "starting work"

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
   If the file exists and has real morning content (not blank TODOs), skip to step 5.
4. Ask: "Good morning! It's [Day, Date]. 1. Focus — most important thing today? 2. Priorities — top 3 tasks?"
5. Fill in the morning section with their answers. Use `TODO` prefix on each priority.
6. Confirm: "Set. You're focused on [focus] today."

Rules: tabs for indentation. Don't fill Work Log, Notes, Learnings, or Evening.

---

## /eod

**Trigger:** `/eod`, "eod", "end of day", "bye", "signing off", "wrapping up", "done for today", "goodnight"

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

**Trigger:** `/jot [content]`, "jot this", "quick note", "capture this", "idea:", "note:"

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

**Trigger:** `/learn [content]`, "I learned", "I just learned", "log this learning"

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
   Add nested context bullet if the learning has relevant context.
7. Confirm: "Logged in today's learnings and saved to [Category] in the permanent page."

Rules: tabs. `logged::` uses dashes; `ref::` uses underscores. Capture verbatim.

---

## /kb

**Trigger:** `/kb [content]`, "add to kb", "knowledge base:", "kb:", "document this pattern"

1. Read graph root. Stop if missing.
2. Extract content. If nothing, ask: "What do you want to add to the knowledge base?"
3. List existing pages: `ls $GRAPH_ROOT/pages/knowledge-base/ 2>/dev/null`
4. Pick best-fit page or create `Topic-Name.md` (PascalCase with dashes) in `$GRAPH_ROOT/pages/knowledge-base/`.
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

**Trigger:** `/log`, "log this session", "log the work", "create an engineering log"

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
