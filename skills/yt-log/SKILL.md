---
name: yt-log
description: ALWAYS invoke when the user shares a YouTube URL to study, says "log this video", "study this video", "take notes on this video", "yt log", or invokes /yt-log. Creates a blank study template — do NOT pre-fill content from AI knowledge.
---

# YouTube Study Log

Create a **blank** structured study note for a YouTube video — page under `pages/yt/` + today's journal entry.

**Critical:** Write an empty template only. Never pre-fill Key Ideas, Timestamp Notes, or any other section from AI knowledge about the video.

---

## Steps

**0. Read graph root**
```bash
grep '^graph_root=' ~/.logseq-plugin-config 2>/dev/null | cut -d= -f2
```
If this returns empty, tell the user to run `/setup` and stop.
Use the returned path as `$GRAPH_ROOT` for all file paths in this skill.

**1. Parse the input**

Extract from the user message:
- **YouTube URL** — required. If missing, ask: *"What's the YouTube URL?"*
- **Topic/title** — optional. If not provided, ask: *"What topic or title for this note? (e.g. `nodejs-event-loop`)"*

Extract the **video ID**:
- `youtube.com/watch?v=VIDEO_ID` → extract value of `v=`
- `youtu.be/VIDEO_ID` → extract the path segment
- Strip any extra query params

Generate a **page slug**: lowercase, words separated by hyphens (e.g. `nodejs-event-loop`).

**2. Create the video note page**

File: `$GRAPH_ROOT/pages/yt/[slug].md`

```
# [Topic / title]
source:: [full YouTube URL]
creator:: 
topics:: 
status:: watching
reviewed:: no
watched-on:: [[YYYY-MM-DD]]

{{youtube [VIDEO_ID]}}

## Key Ideas
	-

## Timestamp Notes
	-

## Action Items
	- TODO 

## Questions
	-

## Flashcards
	-
```

Use tabs for block indentation. Leave all sections empty — the user fills them while watching.

**3. Update today's journal under `## Studying`**

```bash
date "+%Y_%m_%d"
date "+%H:%M"
```

Find `## Studying` in `$GRAPH_ROOT/journals/YYYY_MM_DD.md`. If missing, add the section:
```
- ## Studying
	-
```

Append:
```
- ## Studying
	- `HH:MM` [[yt/[slug]]] — [topic title]
	  source:: [URL]
	  logged:: [[YYYY-MM-DD]]
```

**4. Confirm in one sentence**

*"Video note created at `yt/[slug]` and linked in today's journal."*

---

## Rules
- Tabs for block indentation
- `watched-on::` and `logged::` use dashes (`2026-05-13`)
- `{{youtube VIDEO_ID}}` takes the bare ID only — not the full URL
- All sections (Key Ideas, Timestamp Notes, etc.) must be left blank — this is a capture template, not a summary
- Remind the user: any Flashcards bullet tagged with `#card` activates Logseq spaced repetition
