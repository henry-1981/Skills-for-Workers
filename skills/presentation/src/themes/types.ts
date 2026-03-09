// Theme definition — separates colors/typography from template structure
export interface ThemeColors {
  primary: string;     // Main brand color
  accent: string;      // Highlight/accent color
  success: string;     // Green
  warning: string;     // Yellow
  danger: string;      // Red
  background: string;  // Slide background
  surface: string;     // Card/container background
  text: string;        // Primary text color
  textSecondary: string; // Secondary/muted text
  textOnDark: string;  // Text on dark backgrounds
}

export interface ThemeTypography {
  headingFamily: string;
  headingStyle: string;
  bodyFamily: string;
  bodyStyle: string;
  codeFamily: string;
  codeStyle: string;
  headingSize: number;
  subtitleSize: number;
  bodySize: number;
  codeSize: number;
}

export interface ThemeSpacing {
  margin: number;          // Slide edge margin (px)
  gutter: number;          // Space between columns
  paragraphSpacing: number; // Space between text blocks
  bulletIndent: number;    // Bullet point indentation
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
}

// ── StylePreset (Bento layout system) ──

export type RGB = { r: number; g: number; b: number };

export function hexToRgb(h: string): RGB {
  const n = parseInt(h.replace('#', ''), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

export type ThemeMode = 'dark' | 'light';

export interface StylePreset {
  name: string;
  id: string;
  vibe: string;
  mode: ThemeMode;
  colors: {
    bgPrimary: RGB;
    bgGradientEnd?: RGB;
    cardBg: RGB;
    accent: RGB;
    accentAlt?: RGB;
    textPrimary: RGB;
    textSecondary: RGB;
    textOnCard: RGB;
  };
  cardFills: RGB[];
  cardAccents: RGB[];
  fonts: {
    display: { family: string; weight: string; figmaStyle: string };
    body: { family: string; weight: string; figmaStyle: string };
  };
  signature: string[];
}
