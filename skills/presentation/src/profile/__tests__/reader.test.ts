import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { isProfileEmpty, readDefaults, readVisualOverrides, readLayoutPrefs } from '../reader.js';

let testDir: string;

beforeEach(async () => {
  testDir = join(tmpdir(), `profile-test-${randomUUID()}`);
  await mkdir(testDir, { recursive: true });
});

afterEach(async () => {
  await rm(testDir, { recursive: true, force: true });
});

describe('isProfileEmpty', () => {
  it('should return true when defaults file does not exist', async () => {
    const result = await isProfileEmpty(join(testDir, 'nonexistent.md'));
    expect(result).toBe(true);
  });

  it('should return false when defaults file exists', async () => {
    const path = join(testDir, 'my-defaults.md');
    await writeFile(path, '---\ndefaultPreset: bold-signal\n---\n');
    const result = await isProfileEmpty(path);
    expect(result).toBe(false);
  });
});

describe('readDefaults', () => {
  it('should return null when file does not exist', async () => {
    const result = await readDefaults(join(testDir, 'nonexistent.md'));
    expect(result).toBeNull();
  });

  it('should parse defaults with all fields', async () => {
    const content = `---
defaultPreset: kr-corporate-navy
pptxMode: hybrid
outputDir: ~/Desktop
updatedAt: "2026-03-10"
purposeMappings:
  - purpose: investor-pitch
    preset: swiss-modern
    count: 5
    lastUsed: "2026-03-10"
---
`;
    await writeFile(join(testDir, 'defaults.md'), content);
    const result = await readDefaults(join(testDir, 'defaults.md'));
    expect(result).not.toBeNull();
    expect(result!.defaultPreset).toBe('kr-corporate-navy');
    expect(result!.pptxMode).toBe('hybrid');
    expect(result!.purposeMappings).toHaveLength(1);
    expect(result!.purposeMappings[0].count).toBe(5);
  });

  it('should fill missing fields with defaults', async () => {
    await writeFile(join(testDir, 'defaults.md'), '---\ndefaultPreset: bold-signal\n---\n');
    const result = await readDefaults(join(testDir, 'defaults.md'));
    expect(result!.pptxMode).toBe('hybrid');
    expect(result!.outputDir).toBe('~/Desktop');
    expect(result!.purposeMappings).toEqual([]);
  });
});

describe('readVisualOverrides', () => {
  it('should return null when file does not exist', async () => {
    const result = await readVisualOverrides('bold-signal', join(testDir, 'nonexistent.md'));
    expect(result).toBeNull();
  });

  it('should return override for matching preset', async () => {
    const content = `---
overrides:
  kr-corporate-navy:
    colors:
      accent: "#2E86DE"
    fonts:
      display:
        family: Pretendard
        weight: "800"
customPresets: []
---
`;
    await writeFile(join(testDir, 'visual.md'), content);
    const result = await readVisualOverrides('kr-corporate-navy', join(testDir, 'visual.md'));
    expect(result).not.toBeNull();
    expect(result!.colors!.accent).toBe('#2E86DE');
    expect(result!.fonts!.display!.family).toBe('Pretendard');
  });

  it('should return null for non-matching preset', async () => {
    const content = '---\noverrides:\n  other-preset:\n    colors:\n      accent: "#FFF"\ncustomPresets: []\n---\n';
    await writeFile(join(testDir, 'visual.md'), content);
    const result = await readVisualOverrides('bold-signal', join(testDir, 'visual.md'));
    expect(result).toBeNull();
  });
});

describe('readLayoutPrefs', () => {
  it('should return null when file does not exist', async () => {
    const result = await readLayoutPrefs('investor-pitch', join(testDir, 'nonexistent.md'));
    expect(result).toBeNull();
  });

  it('should return layouts for matching purpose', async () => {
    const content = `---
preferredLayouts:
  investor-pitch:
    - hero-sub
    - asymmetric
    - table-grid
---

## 배치 메모
- 투자자 피칭 관련 메모
`;
    await writeFile(join(testDir, 'structure.md'), content);
    const result = await readLayoutPrefs('investor-pitch', join(testDir, 'structure.md'));
    expect(result).toEqual(['hero-sub', 'asymmetric', 'table-grid']);
  });
});
