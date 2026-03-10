import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import type { ExtractedStyle } from './types.js';

/**
 * Extract color from a clrScheme element tag.
 * Handles both srgbClr and sysClr (using lastClr attribute).
 */
function extractColor(xml: string, tag: string): string | undefined {
  // Extract the content of <a:TAG>...</a:TAG> first to avoid cross-tag matches
  const tagRe = new RegExp(`<a:${tag}[^>]*>([\\s\\S]*?)</a:${tag}>`, 's');
  const tagMatch = xml.match(tagRe);
  if (!tagMatch) return undefined;

  const inner = tagMatch[1];

  // Try srgbClr: <a:srgbClr val="RRGGBB"/>
  const srgbMatch = inner.match(/srgbClr val="([A-Fa-f0-9]{6})"/);
  if (srgbMatch) return `#${srgbMatch[1]}`;

  // Try sysClr: <a:sysClr val="..." lastClr="RRGGBB"/>
  const sysMatch = inner.match(/sysClr[^>]*lastClr="([A-Fa-f0-9]{6})"/);
  if (sysMatch) return `#${sysMatch[1]}`;

  return undefined;
}

/**
 * Parse theme XML to extract colors and fonts.
 * Pure function — exported for direct testing without a PPTX file.
 */
export function parseThemeXml(xml: string): ExtractedStyle {
  const bgColor = extractColor(xml, 'dk1');
  const textColor = extractColor(xml, 'lt1');
  const accentColor = extractColor(xml, 'accent1');

  const majorFontMatch = xml.match(/<a:majorFont>[\s\S]*?<a:latin typeface="([^"]+)"/s);
  const minorFontMatch = xml.match(/<a:minorFont>[\s\S]*?<a:latin typeface="([^"]+)"/s);

  return {
    bgColor,
    textColor,
    accentColor,
    displayFont: majorFontMatch?.[1],
    bodyFont: minorFontMatch?.[1],
  };
}

/**
 * Extract style information from a PPTX file.
 * Reads the theme XML from the PPTX ZIP archive.
 */
export async function extractFromPptx(pptxPath: string): Promise<ExtractedStyle> {
  const data = await readFile(pptxPath);
  const zip = await JSZip.loadAsync(data);

  const themeFile = Object.keys(zip.files).find(name =>
    /ppt\/theme\/theme\d*\.xml$/.test(name),
  );

  if (!themeFile) {
    return {};
  }

  const themeXml = await zip.files[themeFile].async('text');
  return parseThemeXml(themeXml);
}
