import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, readFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import {
  initDefaults,
  updatePurposeMapping,
  saveVisualOverride,
  saveCustomPreset,
  updateLayoutPrefs,
} from '../writer.js';
import { parseFrontmatter } from '../frontmatter.js';
import type { ProfileDefaults, ProfileVisual, ProfileStructure } from '../types.js';

let testDir: string;

beforeEach(async () => {
  testDir = join(tmpdir(), `profile-writer-test-${randomUUID()}`);
  await mkdir(testDir, { recursive: true });
});

afterEach(async () => {
  await rm(testDir, { recursive: true, force: true });
});

describe('initDefaults', () => {
  it('should create defaults file with given preset', async () => {
    const path = join(testDir, 'my-defaults.md');
    await initDefaults('bold-signal', 'hybrid', '~/Desktop', path);

    const content = await readFile(path, 'utf-8');
    const { data } = parseFrontmatter<ProfileDefaults>(content);
    expect(data.defaultPreset).toBe('bold-signal');
    expect(data.pptxMode).toBe('hybrid');
    expect(data.purposeMappings).toEqual([]);
  });
});

describe('updatePurposeMapping', () => {
  it('should add new purpose mapping', async () => {
    const path = join(testDir, 'my-defaults.md');
    await initDefaults('bold-signal', 'hybrid', '~/Desktop', path);
    await updatePurposeMapping('investor-pitch', 'swiss-modern', path);

    const content = await readFile(path, 'utf-8');
    const { data } = parseFrontmatter<ProfileDefaults>(content);
    expect(data.purposeMappings).toHaveLength(1);
    expect(data.purposeMappings[0].purpose).toBe('investor-pitch');
    expect(data.purposeMappings[0].preset).toBe('swiss-modern');
    expect(data.purposeMappings[0].count).toBe(1);
  });

  it('should increment count for existing mapping (same purpose + same preset)', async () => {
    const path = join(testDir, 'my-defaults.md');
    await initDefaults('bold-signal', 'hybrid', '~/Desktop', path);
    await updatePurposeMapping('investor-pitch', 'swiss-modern', path);
    await updatePurposeMapping('investor-pitch', 'swiss-modern', path);

    const content = await readFile(path, 'utf-8');
    const { data } = parseFrontmatter<ProfileDefaults>(content);
    expect(data.purposeMappings).toHaveLength(1);
    expect(data.purposeMappings[0].count).toBe(2);
  });

  it('should add separate entry for same purpose with different preset', async () => {
    const path = join(testDir, 'my-defaults.md');
    await initDefaults('bold-signal', 'hybrid', '~/Desktop', path);
    await updatePurposeMapping('investor-pitch', 'swiss-modern', path);
    await updatePurposeMapping('investor-pitch', 'bold-signal', path);

    const content = await readFile(path, 'utf-8');
    const { data } = parseFrontmatter<ProfileDefaults>(content);
    const pitchMappings = data.purposeMappings.filter(m => m.purpose === 'investor-pitch');
    expect(pitchMappings).toHaveLength(2);
  });
});

describe('saveVisualOverride', () => {
  it('should create visual file with override', async () => {
    const path = join(testDir, 'my-visual.md');
    await saveVisualOverride('kr-corporate-navy', {
      colors: { accent: '#2E86DE' },
    }, path);

    const content = await readFile(path, 'utf-8');
    const { data } = parseFrontmatter<ProfileVisual>(content);
    expect(data.overrides['kr-corporate-navy'].colors!.accent).toBe('#2E86DE');
  });

  it('should merge with existing overrides', async () => {
    const path = join(testDir, 'my-visual.md');
    await saveVisualOverride('preset-a', { colors: { accent: '#AAA' } }, path);
    await saveVisualOverride('preset-b', { colors: { accent: '#BBB' } }, path);

    const content = await readFile(path, 'utf-8');
    const { data } = parseFrontmatter<ProfileVisual>(content);
    expect(data.overrides['preset-a'].colors!.accent).toBe('#AAA');
    expect(data.overrides['preset-b'].colors!.accent).toBe('#BBB');
  });
});

describe('saveCustomPreset', () => {
  it('should add custom preset to visual file', async () => {
    const path = join(testDir, 'my-visual.md');
    await saveCustomPreset({
      id: 'my-navy-v2',
      base: 'kr-corporate-navy',
      accent: '#2E86DE',
      createdAt: '2026-03-10',
    }, path);

    const content = await readFile(path, 'utf-8');
    const { data } = parseFrontmatter<ProfileVisual>(content);
    expect(data.customPresets).toHaveLength(1);
    expect(data.customPresets[0].id).toBe('my-navy-v2');
  });
});

describe('updateLayoutPrefs', () => {
  it('should create structure file with layout prefs', async () => {
    const path = join(testDir, 'my-structure.md');
    await updateLayoutPrefs('investor-pitch', ['hero-sub', 'asymmetric'], path);

    const content = await readFile(path, 'utf-8');
    const { data } = parseFrontmatter<ProfileStructure>(content);
    expect(data.preferredLayouts['investor-pitch']).toEqual(['hero-sub', 'asymmetric']);
  });

  it('should preserve body when updating frontmatter', async () => {
    const path = join(testDir, 'my-structure.md');
    const body = '\n## 배치 메모\n- 투자자 피칭 관련 메모\n';
    await writeFile(path, `---\npreferredLayouts:\n  old-purpose:\n    - hero-sub\n---\n${body}`);

    await updateLayoutPrefs('new-purpose', ['table-grid'], path);

    const content = await readFile(path, 'utf-8');
    const { data } = parseFrontmatter<ProfileStructure>(content);
    expect(data.preferredLayouts['new-purpose']).toEqual(['table-grid']);
    expect(data.preferredLayouts['old-purpose']).toEqual(['hero-sub']);
    expect(content).toContain('## 배치 메모');
    expect(content).toContain('투자자 피칭 관련 메모');
  });
});
