import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, readFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createSnapshot, restoreSnapshot } from '../snapshot.js';

let testDir: string;

beforeEach(async () => {
  testDir = join(tmpdir(), `snapshot-test-${Date.now()}`);
  await mkdir(testDir, { recursive: true });
});

afterEach(async () => {
  await rm(testDir, { recursive: true, force: true });
});

describe('createSnapshot', () => {
  it('should capture content of existing files', async () => {
    const path = join(testDir, 'file.md');
    await writeFile(path, 'original content');

    const snapshot = await createSnapshot([path]);
    expect(snapshot.files).toHaveLength(1);
    expect(snapshot.files[0].content).toBe('original content');
    expect(snapshot.files[0].path).toBe(path);
  });

  it('should record null for non-existing files', async () => {
    const path = join(testDir, 'nonexistent.md');
    const snapshot = await createSnapshot([path]);
    expect(snapshot.files[0].content).toBeNull();
  });

  it('should capture multiple files', async () => {
    const pathA = join(testDir, 'a.md');
    const pathB = join(testDir, 'b.md');
    await writeFile(pathA, 'content-a');
    // pathB does not exist

    const snapshot = await createSnapshot([pathA, pathB]);
    expect(snapshot.files).toHaveLength(2);
    expect(snapshot.files.find(f => f.path === pathA)?.content).toBe('content-a');
    expect(snapshot.files.find(f => f.path === pathB)?.content).toBeNull();
  });
});

describe('restoreSnapshot', () => {
  it('should restore file to snapshot content', async () => {
    const path = join(testDir, 'file.md');
    await writeFile(path, 'original');
    const snapshot = await createSnapshot([path]);

    await writeFile(path, 'modified');
    expect(await readFile(path, 'utf-8')).toBe('modified');

    await restoreSnapshot(snapshot);
    expect(await readFile(path, 'utf-8')).toBe('original');
  });

  it('should delete file if it did not exist in snapshot', async () => {
    const path = join(testDir, 'new-file.md');
    const snapshot = await createSnapshot([path]); // null — didn't exist

    await writeFile(path, 'should be removed');
    expect(existsSync(path)).toBe(true);

    await restoreSnapshot(snapshot);
    expect(existsSync(path)).toBe(false);
  });

  it('should handle mix of restore and delete in one snapshot', async () => {
    const existing = join(testDir, 'existing.md');
    const newFile = join(testDir, 'new.md');
    await writeFile(existing, 'original-content');

    const snapshot = await createSnapshot([existing, newFile]);

    // Modify existing, create new
    await writeFile(existing, 'changed');
    await writeFile(newFile, 'created-after');

    await restoreSnapshot(snapshot);

    expect(await readFile(existing, 'utf-8')).toBe('original-content');
    expect(existsSync(newFile)).toBe(false);
  });
});
