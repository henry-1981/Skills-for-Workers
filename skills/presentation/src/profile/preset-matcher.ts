import { PRESETS } from '../themes/presets.js';
import type { StylePreset, RGB } from '../themes/types.js';
import type { ExtractedStyle } from './types.js';

/** Parse hex color string to 0-255 RGB components */
function hexTo255(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Convert StylePreset RGB (0-1 range) to hex string */
function rgbToHex(rgb: RGB): string {
  const r = Math.round(rgb.r * 255);
  const g = Math.round(rgb.g * 255);
  const b = Math.round(rgb.b * 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}

/**
 * Euclidean distance between two hex color strings.
 * Returns value in range [0, ~441] (max = sqrt(255^2 * 3)).
 */
export function colorDistance(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexTo255(hex1);
  const [r2, g2, b2] = hexTo255(hex2);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/**
 * Match extracted PPTX style to the closest preset.
 * Weights: accent 3x, bgPrimary 2x, textPrimary 1x.
 * Falls back to kr-corporate-navy if no style info provided.
 */
export function matchPreset(style: ExtractedStyle): StylePreset {
  const presets = Object.values(PRESETS);
  const fallback = PRESETS['kr-corporate-navy'] ?? presets[0];

  if (!style.bgColor && !style.accentColor && !style.textColor) {
    return fallback;
  }

  let bestPreset = fallback;
  let bestScore = Infinity;

  for (const preset of presets) {
    let score = 0;

    if (style.bgColor) {
      score += colorDistance(style.bgColor, rgbToHex(preset.colors.bgPrimary)) * 2;
    }

    if (style.accentColor) {
      score += colorDistance(style.accentColor, rgbToHex(preset.colors.accent)) * 3;
    }

    if (style.textColor) {
      score += colorDistance(style.textColor, rgbToHex(preset.colors.textPrimary)) * 1;
    }

    if (score < bestScore) {
      bestScore = score;
      bestPreset = preset;
    }
  }

  return bestPreset;
}
