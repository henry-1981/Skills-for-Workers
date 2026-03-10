import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseFrontmatter, stringifyFrontmatter } from './frontmatter.js';
import { PROFILE_PATHS } from './paths.js';
import type {
  ProfileDefaults,
  ProfileVisual,
  ProfileStructure,
  VisualOverride,
  CustomPreset,
} from './types.js';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function ensureDir(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

async function readOrInit<T>(filePath: string, defaultData: T): Promise<{ data: T; body: string }> {
  if (!existsSync(filePath)) {
    return { data: defaultData, body: '' };
  }
  const content = await readFile(filePath, 'utf-8');
  const result = parseFrontmatter<T>(content);
  // Merge parsed data over defaults so missing fields use defaults
  return { data: { ...defaultData, ...result.data }, body: result.body };
}

/**
 * Initialize defaults profile file. Creates the file fresh.
 */
export async function initDefaults(
  preset: string,
  pptxMode: 'hybrid' | 'dom',
  outputDir: string,
  path?: string,
): Promise<void> {
  const filePath = path ?? PROFILE_PATHS.defaults;
  await ensureDir(filePath);
  const data: ProfileDefaults = {
    defaultPreset: preset,
    pptxMode,
    outputDir,
    updatedAt: today(),
    purposeMappings: [],
  };
  await writeFile(filePath, stringifyFrontmatter(data));
}

/**
 * Add or increment a purpose→preset mapping.
 * Same purpose + same preset → increment count.
 * Same purpose + different preset → add new entry.
 */
export async function updatePurposeMapping(
  purpose: string,
  preset: string,
  path?: string,
): Promise<void> {
  const filePath = path ?? PROFILE_PATHS.defaults;
  const { data, body } = await readOrInit<ProfileDefaults>(filePath, {
    defaultPreset: '',
    pptxMode: 'hybrid',
    outputDir: '~/Desktop',
    updatedAt: '',
    purposeMappings: [],
  });

  const existing = data.purposeMappings.find(
    m => m.purpose === purpose && m.preset === preset,
  );

  if (existing) {
    existing.count += 1;
    existing.lastUsed = today();
  } else {
    data.purposeMappings.push({
      purpose,
      preset,
      count: 1,
      lastUsed: today(),
    });
  }

  data.updatedAt = today();
  await ensureDir(filePath);
  await writeFile(filePath, stringifyFrontmatter(data, body));
}

/**
 * Save visual override for a preset. Merges with existing overrides.
 */
export async function saveVisualOverride(
  presetId: string,
  override: VisualOverride,
  path?: string,
): Promise<void> {
  const filePath = path ?? PROFILE_PATHS.visual;
  const { data, body } = await readOrInit<ProfileVisual>(filePath, {
    overrides: {},
    customPresets: [],
  });

  data.overrides[presetId] = override;

  await ensureDir(filePath);
  await writeFile(filePath, stringifyFrontmatter(data, body));
}

/**
 * Save a custom preset definition. Replaces if same ID exists.
 */
export async function saveCustomPreset(
  preset: CustomPreset,
  path?: string,
): Promise<void> {
  const filePath = path ?? PROFILE_PATHS.visual;
  const { data, body } = await readOrInit<ProfileVisual>(filePath, {
    overrides: {},
    customPresets: [],
  });

  const idx = data.customPresets.findIndex(p => p.id === preset.id);
  if (idx >= 0) {
    data.customPresets[idx] = preset;
  } else {
    data.customPresets.push(preset);
  }

  await ensureDir(filePath);
  await writeFile(filePath, stringifyFrontmatter(data, body));
}

/**
 * Update layout preferences for a purpose.
 * CRITICAL: Preserves body (Claude-owned) when updating frontmatter.
 */
export async function updateLayoutPrefs(
  purpose: string,
  layouts: string[],
  path?: string,
): Promise<void> {
  const filePath = path ?? PROFILE_PATHS.structure;
  const { data, body } = await readOrInit<ProfileStructure>(filePath, {
    preferredLayouts: {},
  });

  data.preferredLayouts[purpose] = layouts;

  await ensureDir(filePath);
  await writeFile(filePath, stringifyFrontmatter(data, body));
}
