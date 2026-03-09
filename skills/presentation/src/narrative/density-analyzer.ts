import type { ContentSlide } from '../parser/types.js';

export type TextVolume = 'minimal' | 'moderate' | 'heavy';

export interface DensityProfile {
  textVolume: TextVolume;
  itemCount: number;
  hasData: boolean;
  hasQuote: boolean;
  complexity: number; // 0-1, avg text length per item
}

export function analyzeDensity(slide: ContentSlide): DensityProfile {
  const items = collectTextItems(slide);
  const itemCount = items.length;
  const totalChars = items.reduce((sum, t) => sum + t.length, 0);
  const avgCharsPerItem = itemCount > 0 ? totalChars / itemCount : 0;

  const hasData = items.some(t => /\d+%|\d+\.\d+|₩[\d,]+|\$[\d,]+|\d+억|\d+만/.test(t));
  const hasQuote = slide.contentType === 'quote' || !!slide.quote;

  const textVolume = classifyVolume(itemCount, avgCharsPerItem, hasQuote);
  const complexity = Math.min(1, avgCharsPerItem / 80);

  return { textVolume, itemCount, hasData, hasQuote, complexity };
}

function collectTextItems(slide: ContentSlide): string[] {
  const items: string[] = [];
  if (slide.bullets) items.push(...slide.bullets);
  if (slide.quote?.text) items.push(slide.quote.text);
  if (slide.table) {
    for (const row of slide.table.rows) items.push(...row);
  }
  return items;
}

function classifyVolume(
  itemCount: number,
  avgCharsPerItem: number,
  hasQuote: boolean,
): TextVolume {
  if (hasQuote && itemCount <= 1) return 'minimal';
  if (itemCount <= 1 && avgCharsPerItem < 40) return 'minimal';
  if (itemCount >= 7) return 'heavy';
  if (itemCount >= 5 && avgCharsPerItem > 30) return 'heavy';
  return 'moderate';
}
