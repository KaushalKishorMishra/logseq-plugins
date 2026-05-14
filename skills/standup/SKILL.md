---
name: standup
description: ALWAYS invoke when the user says "standup", "daily standup", "what did I do yesterday", "standup update", or invokes /standup. Reads yesterday's journal, builds a standup summary, writes it to today's journal, and prints it to chat.
---

# Daily Standup

Read yesterday's journal, build a standup, write it to today's journal, and print it for copy-pasting.

---

## Steps

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If empty, tell the user to run `/setup` and stop.

**1. Get dates and time**

```bash
date "+%Y_%m_%d"           # today filename
date "+%H:%M"              # current time
date -v-1d "+%Y_%m_%d"    # yesterday filename (macOS)
```

**2. Read yesterday's journal**

```bash
cat $GRAPH_ROOT/journals/YESTERDAY_YYYY_MM_DD.md
```

Extract from `## Work Log` and `## Learnings`:
- What was shipped / worked on (Work Log bullets)
- Any notable learnings

If yesterday's journal doesn't exist, use the most recent journal file found in `journals/`.

**3. Read today's morning section (if set)**

```bash
cat $GRAPH_ROOT/journals/TODAY_YYYY_MM_DD.md 2>/dev/null
```

Extract `## Morning` priorities for the "Today" section. If morning hasn't been filled yet, leave Today blank.

**4. Write `## Standup` to today's journal**

Find `## Standup` in today's journal. If missing, add it after `## Morning`:
```
- ## Standup
  logged-at:: HH:MM
	- **Yesterday:**
		- [bullet from yesterday's Work Log]
		- [bullet from yesterday's Work Log]
	- **Today:**
		- [priority from morning section, or blank]
	- **Blockers:**
		- None
```

**5. Print standup to chat**

Format for copy-pasting to Slack or a team channel:

```
**Yesterday**
• [item]
• [item]

**Today**
• [item]

**Blockers**
None
```

**6. Confirm in one sentence**

*"Standup written to today's journal and printed above."*

---

## Rules
- Tabs for Logseq indentation
- `logged-at::` uses dashes (`2026-05-14`)
- Pull content verbatim from Work Log bullets — don't rephrase
- If yesterday had no journal, say so and leave Yesterday blank rather than guessing
