/**
 * Logseq plugin for OpenCode.ai
 *
 * Injects AGENTS.md bootstrap context via message transform.
 * AGENTS.md is self-contained with all skill instructions inline.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(__dirname, '../..');

// Cache bootstrap content — AGENTS.md does not change during a session
let _bootstrapCache = undefined; // undefined = not yet loaded, null = file missing

const getBootstrapContent = () => {
  if (_bootstrapCache !== undefined) return _bootstrapCache;

  const agentsPath = path.join(pluginRoot, 'AGENTS.md');
  if (!fs.existsSync(agentsPath)) {
    _bootstrapCache = null;
    return null;
  }

  const content = fs.readFileSync(agentsPath, 'utf8');

  _bootstrapCache = `<EXTREMELY_IMPORTANT>
You have the Logseq plugin installed.

${content}
</EXTREMELY_IMPORTANT>`;

  return _bootstrapCache;
};

export const LogseqPlugin = async ({ client, directory }) => {
  return {
    // Inject AGENTS.md into the first user message of each session.
    // Using a user message instead of a system message avoids token bloat
    // from system messages repeated every turn.
    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages.length) return;

      const firstUser = output.messages.find(m => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;

      // Guard: skip if already injected
      if (firstUser.parts.some(p => p.type === 'text' && p.text.includes('EXTREMELY_IMPORTANT'))) return;

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    }
  };
};
