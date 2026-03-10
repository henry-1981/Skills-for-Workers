// src/profile/index.ts

// Types
export type {
  PurposeMapping,
  ProfileDefaults,
  VisualOverride,
  CustomPreset,
  ProfileVisual,
  ProfileStructure,
  ExtractedStyle,
  ProfileSnapshot,
} from './types.js';

// Paths
export { PROFILE_PATHS, ALL_PROFILE_PATHS } from './paths.js';

// Frontmatter I/O
export { parseFrontmatter, stringifyFrontmatter } from './frontmatter.js';
export type { FrontmatterResult } from './frontmatter.js';

// Reader
export { isProfileEmpty, readDefaults, readVisualOverrides, readLayoutPrefs } from './reader.js';

// Writer
export {
  initDefaults,
  updatePurposeMapping,
  saveVisualOverride,
  saveCustomPreset,
  updateLayoutPrefs,
} from './writer.js';

// Snapshot
export { createSnapshot, restoreSnapshot } from './snapshot.js';

// Bootstrap
export { extractFromPptx, parseThemeXml } from './pptx-extractor.js';
export { matchPreset, colorDistance } from './preset-matcher.js';
