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
Use the returned path as `$GRAPH_ROOT` for all file paths in this skill.

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
