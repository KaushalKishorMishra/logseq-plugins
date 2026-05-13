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
Use the returned path as `$GRAPH_ROOT` for all file paths in this skill.

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

Mention their focus back to them. E.g. *"Set. You're focused on [focus] today."*

---

## Rules
- Tabs for indentation (Logseq requires it)
- `TODO` prefix on each priority so Logseq tracks them as tasks
- Don't fill Work Log, Notes, Learnings, or Evening — those are filled during/after the day
