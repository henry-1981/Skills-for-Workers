// src/profile/types.ts

/** Purpose → Preset mapping entry */
export interface PurposeMapping {
  purpose: string;
  preset: string;
  count: number;
  lastUsed: string; // YYYY-MM-DD
}

/** my-defaults.md frontmatter */
export interface ProfileDefaults {
  defaultPreset: string;
  pptxMode: 'hybrid' | 'dom';
  outputDir: string;
  updatedAt: string; // YYYY-MM-DD
  purposeMappings: PurposeMapping[];
}

/** Preset color/font override */
export interface VisualOverride {
  colors?: {
    accent?: string;    // hex e.g. "#2E86DE"
    cardBg?: string;
    bgPrimary?: string;
  };
  fonts?: {
    display?: { family: string; weight?: string };
    body?: { family: string; weight?: string };
  };
}

/** Custom preset definition */
export interface CustomPreset {
  id: string;
  base: string;        // base preset ID
  accent?: string;     // hex
  cardBg?: string;     // hex
  createdAt: string;   // YYYY-MM-DD
}

/** my-visual.md frontmatter */
export interface ProfileVisual {
  overrides: Record<string, VisualOverride>;
  customPresets: CustomPreset[];
}

/** my-structure.md frontmatter (code-owned portion) */
export interface ProfileStructure {
  preferredLayouts: Record<string, string[]>; // purpose → layout types
}

/** Extracted style from reference PPTX */
export interface ExtractedStyle {
  bgColor?: string;      // hex
  textColor?: string;    // hex
  accentColor?: string;  // hex
  displayFont?: string;
  bodyFont?: string;
}

/** Snapshot for rollback (in-memory, not persisted) */
export interface ProfileSnapshot {
  files: Array<{ path: string; content: string | null }>; // null = file didn't exist
  createdAt: string;
}
