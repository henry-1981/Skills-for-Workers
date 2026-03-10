// src/profile/paths.ts
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Root of the presentation plugin (e.g. .../skills/presentation) */
const PLUGIN_ROOT = resolve(__dirname, '../..');

/** Directory for profile files */
const REFS_DIR = resolve(PLUGIN_ROOT, 'skills/presentation/references');

export const PROFILE_PATHS = {
  defaults:  resolve(REFS_DIR, 'my-defaults.md'),
  visual:    resolve(REFS_DIR, 'my-visual.md'),
  structure: resolve(REFS_DIR, 'my-structure.md'),
  voice:     resolve(REFS_DIR, 'my-voice.md'),
} as const;

/** All profile file paths as array (for snapshot) */
export const ALL_PROFILE_PATHS = Object.values(PROFILE_PATHS);
