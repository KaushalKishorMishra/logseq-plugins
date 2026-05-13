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
Use the returned path as `$GRAPH_ROOT` for all file paths in this skill.

**1. Extract the content**

Everything after the trigger phrase is the knowledge to save.

If nothing follows the trigger, ask: *"What do you want to add to the knowledge base?"*

**2. List existing KB pages**

```bash
ls $GRAPH_ROOT/pages/knowledge-base/ 2>/dev/null
```

Pick the best fit from the list. If nothing fits well, create a new page named `Topic-Name.md` (PascalCase with dashes).

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

For a gotcha or edge case without a full pattern, use a smaller entry:
```markdown
### [Brief title]
added:: [[YYYY-MM-DD]]
[Content]
```

**4. If creating a new page**

```markdown
# [Page Title]
tags:: #knowledge-base #[domain: pbl / frontend / backend / testing / etc.]
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
- If the content is better suited for `learnings.md` (a personal discovery) rather than reference docs, suggest using `/learn` instead
