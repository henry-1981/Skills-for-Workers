/**
 * PPTX Font Mapping — preset font → PPTX-compatible font
 *
 * Strategy: Use the original font name by default. pptxgenjs records
 * any fontFace into the PPTX file regardless of system installation.
 * PowerPoint substitutes a fallback when the font isn't available.
 *
 * The FALLBACK_MAP is provided for future use when we add system font
 * detection — the renderer can check availability and apply fallbacks.
 */

/**
 * Fallback mapping table: preset font → safe system font.
 * Used when the original font is known to be unavailable.
 */
export const FALLBACK_MAP: Record<string, string> = {
  // Dark preset display fonts
  'Archivo Black': 'Arial Black',
  'Manrope': 'Arial',
  'Syne': 'Arial',
  'Cormorant': 'Georgia',
  'Rajdhani': 'Arial',
  'JetBrains Mono': 'Courier New',

  // Light preset display fonts
  'Bodoni Moda': 'Georgia',
  'Plus Jakarta Sans': 'Arial',
  'Outfit': 'Arial',
  'Fraunces': 'Georgia',
  'Archivo': 'Arial Black',
  'Cormorant Garamond': 'Georgia',

  // Korean display fonts
  'Pretendard': 'Malgun Gothic',
  'Noto Sans KR': 'Malgun Gothic',
  'Nanum Myeongjo': 'Batang',
  'Spoqa Han Sans Neo': 'Malgun Gothic',
  'KoPubWorld Batang': 'Batang',

  // Body fonts
  'Space Grotesk': 'Arial',
  'Space Mono': 'Courier New',
  'IBM Plex Sans': 'Arial',
  'DM Sans': 'Arial',
  'Work Sans': 'Arial',
  'Inter': 'Arial',
  'Nunito': 'Arial',
  'Source Serif 4': 'Georgia',
};

/**
 * Default safe font for display text when no mapping exists.
 */
export const DEFAULT_DISPLAY_FALLBACK = 'Arial';

/**
 * Default safe font for body text when no mapping exists.
 */
export const DEFAULT_BODY_FALLBACK = 'Arial';

/**
 * Resolve a font family for PPTX output.
 *
 * Currently returns the original font name — pptxgenjs records it
 * in the PPTX file and PowerPoint handles substitution at open time.
 *
 * @param fontFamily - Original font family from preset
 * @param _useFallback - Reserved for future system font detection
 * @returns Font name to use in pptxgenjs addText/addShape calls
 */
export function resolvePptxFont(fontFamily: string, _useFallback = true): string {
  if (_useFallback) {
    return FALLBACK_MAP[fontFamily] ?? DEFAULT_DISPLAY_FALLBACK;
  }
  return fontFamily;
}

/**
 * Get the fallback font for a given font family.
 * Useful for logging/debugging which fallback would be used.
 */
export function getFallbackFont(fontFamily: string): string {
  return FALLBACK_MAP[fontFamily] ?? DEFAULT_DISPLAY_FALLBACK;
}
