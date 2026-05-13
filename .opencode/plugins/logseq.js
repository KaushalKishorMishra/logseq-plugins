/**
 * Logseq plugin for OpenCode.ai
 *
 * Injects AGENTS.md bootstrap context via tui.prompt.append so the AI
 * receives Logseq skill instructions at the start of each session.
 * Falls back to experimental.chat.messages.transform for headless/API usage.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(__dirname, '../..');

// Cache AGENTS.md — does not change during a session
let _bootstrapCache = undefined;

const getBootstrapContent = () => {
  if (_bootstrapCache !== undefined) return _bootstrapCache;

  const agentsPath = path.join(pluginRoot, 'AGENTS.md');
  if (!fs.existsSync(agentsPath)) {
    _bootstrapCache = null;
    return null;
  }

  const content = fs.readFileSync(agentsPath, 'utf8');
  _bootstrapCache = `<EXTREMELY_IMPORTANT>\nYou have the Logseq plugin installed.\n\n${content}\n</EXTREMELY_IMPORTANT>`;
  return _bootstrapCache;
};

export const LogseqPlugin = async ({ client, directory }) => {
  return {
    // Primary: append Logseq instructions to the user's first TUI prompt
    'tui.prompt.append': async () => {
      return getBootstrapContent() ?? '';
    },

    // Fallback: inject via message transform for headless/API sessions
    // (experimental API — kept for compatibility with older OpenCode versions)
    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages?.length) return;

      const firstUser = output.messages.find(m => m.info?.role === 'user');
      if (!firstUser?.parts?.length) return;

      // Guard: skip if already injected
      if (firstUser.parts.some(p => p.type === 'text' && p.text?.includes('EXTREMELY_IMPORTANT'))) return;

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    },
  };
};
