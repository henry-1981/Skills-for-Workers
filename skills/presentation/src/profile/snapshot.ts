// src/profile/snapshot.ts

import { readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import type { ProfileSnapshot } from './types.js';

/**
 * Create a snapshot of the given files.
 * Non-existing files are recorded with content: null.
 */
export async function createSnapshot(paths: string[]): Promise<ProfileSnapshot> {
  const files = await Promise.all(
    paths.map(async (path) => ({
      path,
      content: existsSync(path) ? await readFile(path, 'utf-8') : null,
    })),
  );

  return { files, createdAt: new Date().toISOString() };
}

/**
 * Restore files to their snapshot state.
 * - If snapshot had content → overwrite file with original content
 * - If snapshot had null → delete file (it was created after snapshot)
 */
export async function restoreSnapshot(snapshot: ProfileSnapshot): Promise<void> {
  for (const entry of snapshot.files) {
    if (entry.content === null) {
      if (existsSync(entry.path)) {
        await unlink(entry.path);
      }
    } else {
      await writeFile(entry.path, entry.content);
    }
  }
}
