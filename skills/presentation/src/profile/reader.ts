import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { parseFrontmatter } from './frontmatter.js';
import { PROFILE_PATHS } from './paths.js';
import type { ProfileDefaults, ProfileVisual, ProfileStructure, VisualOverride } from './types.js';

/**
 * Check if profile is empty (defaults file doesn't exist).
 * Pass custom path for testing; defaults to PROFILE_PATHS.defaults.
 */
export async function isProfileEmpty(path?: string): Promise<boolean> {
  return !existsSync(path ?? PROFILE_PATHS.defaults);
}

/**
 * Read profile defaults. Returns null if file doesn't exist.
 */
export async function readDefaults(path?: string): Promise<ProfileDefaults | null> {
  const filePath = path ?? PROFILE_PATHS.defaults;
  if (!existsSync(filePath)) return null;
  const content = await readFile(filePath, 'utf-8');
  const { data } = parseFrontmatter<Partial<ProfileDefaults>>(content);
  return {
    defaultPreset: data.defaultPreset ?? 'kr-corporate-navy',
    pptxMode: data.pptxMode ?? 'hybrid',
    outputDir: data.outputDir ?? '~/Desktop',
    updatedAt: data.updatedAt ?? '',
    purposeMappings: data.purposeMappings ?? [],
    archetypeUsage: data.archetypeUsage ?? [],
  };
}

/**
 * Read visual overrides for a specific preset. Returns null if no override found.
 */
export async function readVisualOverrides(
  presetId: string,
  path?: string,
): Promise<VisualOverride | null> {
  const filePath = path ?? PROFILE_PATHS.visual;
  if (!existsSync(filePath)) return null;
  const content = await readFile(filePath, 'utf-8');
  const { data } = parseFrontmatter<ProfileVisual>(content);
  return data.overrides?.[presetId] ?? null;
}

/**
 * Read layout preferences for a purpose. Returns null if no preference found.
 */
export async function readLayoutPrefs(
  purpose: string,
  path?: string,
): Promise<string[] | null> {
  const filePath = path ?? PROFILE_PATHS.structure;
  if (!existsSync(filePath)) return null;
  const content = await readFile(filePath, 'utf-8');
  const { data } = parseFrontmatter<ProfileStructure>(content);
  return data.preferredLayouts?.[purpose] ?? null;
}
