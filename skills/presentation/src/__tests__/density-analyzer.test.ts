import { describe, it, expect } from 'vitest';
import { analyzeDensity } from '../narrative/density-analyzer.js';
import type { ContentSlide } from '../parser/types.js';

function makeSlide(overrides: Partial<ContentSlide>): ContentSlide {
  return { index: 0, heading: 'Test', contentType: 'content-bullets', ...overrides };
}

describe('analyzeDensity', () => {
  it('should classify single quote as minimal', () => {
    const slide = makeSlide({
      contentType: 'quote',
      quote: { text: '짧은 인용문' },
    });
    const density = analyzeDensity(slide);
    expect(density.textVolume).toBe('minimal');
  });

  it('should classify 3 short bullets as moderate', () => {
    const slide = makeSlide({
      bullets: ['포인트 1', '포인트 2', '포인트 3'],
    });
    const density = analyzeDensity(slide);
    expect(density.textVolume).toBe('moderate');
  });

  it('should classify 8 long bullets as heavy', () => {
    const slide = makeSlide({
      bullets: Array(8).fill('이것은 긴 텍스트입니다. 카드 안에 넣으면 여러 줄이 됩니다.'),
    });
    const density = analyzeDensity(slide);
    expect(density.textVolume).toBe('heavy');
  });

  it('should detect data presence from numbers', () => {
    const slide = makeSlide({
      bullets: ['매출 47% 증가', '비용 23% 절감'],
    });
    const density = analyzeDensity(slide);
    expect(density.hasData).toBe(true);
  });

  it('should detect quote presence', () => {
    const slide = makeSlide({
      contentType: 'quote',
      quote: { text: '인용문', attribution: '출처' },
    });
    const density = analyzeDensity(slide);
    expect(density.hasQuote).toBe(true);
  });
});
