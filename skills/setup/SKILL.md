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
