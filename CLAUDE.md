# Logseq Plugin

Personal Logseq knowledge-graph integration for daily journaling, session logging, quick capture, and knowledge management.

**Graph root:** configured via `/setup` → stored in `~/.logseq-plugin-config`

## Commands

| Command | What it does |
|---------|-------------|
| `/setup` | Install Logseq and configure your graph path (run this first) |
| `/morning` | Open today's journal and set your focus + priorities |
| `/eod` | Close the day with a reflection on what shipped |
| `/jot [content]` | Capture a quick thought, idea, or todo |
| `/learn [content]` | Log a learning to today's journal and the permanent learnings page |
| `/kb [content]` | Save reference knowledge to the knowledge base |
| `/log` | Create a detailed engineering log for the current session. Also auto-captures major decisions and findings silently during any session. |
| `/yt-log [url] [topic]` | Create a blank YouTube study note (embed + template) + link in today's journal |
| `/read [url] [topic]` | Create a blank reading note for an article or doc + link in today's journal |
| `/link [url] [desc]` | Bookmark a URL with description and tags to `pages/bookmarks.md` |
| `/snippet [desc]` | Save a reusable code snippet to `pages/snippets/` |
| `/standup` | Build today's standup from yesterday's journal, write it + print to chat |
| `/meeting [title]` | Create a blank meeting notes page + link in today's Work Log |
| `/idea [content]` | Create a structured idea page under `pages/ideas/` |
| `/weekly` | Read this week's journals and create a weekly review page |

## Skills

| Skill | Command | Auto-triggers on |
|-------|---------|-----------------|
| `logseq:setup` | `/setup` | "setup logseq", "install logseq", when config is missing |
| `logseq:morning` | `/morning` | "good morning", "gm", "starting my day" |
| `logseq:eod` | `/eod` | "eod", "bye", "signing off", "wrapping up" |
| `logseq:jot` | `/jot [content]` | "jot this", "quick note", "capture this" |
| `logseq:learn` | `/learn [content]` | "I learned", "log this learning" |
| `logseq:kb` | `/kb [content]` | "add to kb", "knowledge base:" |
| `logseq:log` | `/log` | "log this session", "log the work" |
| `logseq:yt-log` | `/yt-log [url] [topic]` | "log this video", "study this video", YouTube URL shared to study |
| `logseq:read` | `/read [url] [topic]` | "log this article", "reading notes for", article/doc URL shared to study |
| `logseq:link` | `/link [url] [desc]` | "bookmark this", "save this link", "log this URL" |
| `logseq:snippet` | `/snippet [desc]` | "save this snippet", "log this code", "save this pattern" |
| `logseq:standup` | `/standup` | "standup", "daily standup", "what did I do yesterday" |
| `logseq:meeting` | `/meeting [title]` | "log this meeting", "meeting notes", "new meeting" |
| `logseq:idea` | `/idea [content]` | "I have an idea", "new idea", "we should build" |
| `logseq:weekly` | `/weekly` | "weekly review", "end of week", "week wrap" |

## Logseq Conventions

- **Tabs** for block indentation (never spaces)
- **Journal filenames:** `YYYY_MM_DD` (underscores)
- **Date properties:** `logged:: 2026-05-13` (dashes)
- **Journal links:** `[[YYYY_MM_DD]]` (underscores in brackets)
- **Page links:** `[[page-name]]` or `[[folder/page-name]]`
