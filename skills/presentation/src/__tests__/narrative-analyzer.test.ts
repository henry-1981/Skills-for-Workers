import { describe, it, expect } from 'vitest';
import { analyzeNarrative } from '../narrative/narrative-analyzer.js';
import type { ContentSlide } from '../parser/types.js';

function makeSlide(overrides: Partial<ContentSlide>): ContentSlide {
  return {
    index: 0,
    heading: 'Test',
    contentType: 'content-bullets',
    ...overrides,
  };
}

describe('analyzeNarrative', () => {
  it('should assign opener to first slide (title)', () => {
    const slides: ContentSlide[] = [
      makeSlide({ index: 0, contentType: 'title', heading: 'My Talk' }),
      makeSlide({ index: 1, heading: 'Point 1', bullets: ['a'] }),
    ];
    const result = analyzeNarrative(slides);
    expect(result[0].narrative?.role).toBe('opener');
  });

  it('should assign closer to last slide (closing)', () => {
    const slides: ContentSlide[] = [
      makeSlide({ index: 0, contentType: 'title' }),
      makeSlide({ index: 1, heading: 'Content' }),
      makeSlide({ index: 2, contentType: 'closing', heading: 'Thank You' }),
    ];
    const result = analyzeNarrative(slides);
    expect(result[2].narrative?.role).toBe('closer');
  });

  it('should respect roleOverride from markdown tags', () => {
    const slides: ContentSlide[] = [
      makeSlide({ index: 0, contentType: 'title' }),
      makeSlide({ index: 1, heading: '핵심 발견', roleOverride: 'climax' }),
    ];
    const result = analyzeNarrative(slides);
    expect(result[1].narrative?.role).toBe('climax');
  });

  it('should create sections from sectionTag', () => {
    const slides: ContentSlide[] = [
      makeSlide({ index: 0, contentType: 'title' }),
      makeSlide({ index: 1, heading: 'Intro', sectionTag: 'A. 도입' }),
      makeSlide({ index: 2, heading: 'Detail', sectionTag: 'A. 도입' }),
      makeSlide({ index: 3, heading: 'Solution', sectionTag: 'B. 본론' }),
      makeSlide({ index: 4, heading: 'More', sectionTag: 'B. 본론' }),
    ];
    const result = analyzeNarrative(slides);
    expect(result[1].narrative?.section?.id).toBe('A');
    expect(result[1].narrative?.isFirstInSection).toBe(true);
    expect(result[2].narrative?.isLastInSection).toBe(true);
    expect(result[3].narrative?.section?.id).toBe('B');
  });

  it('should auto-detect section-bridge for section-header slides', () => {
    const slides: ContentSlide[] = [
      makeSlide({ index: 0, contentType: 'title' }),
      makeSlide({ index: 1, contentType: 'section-header', heading: 'Part 1' }),
      makeSlide({ index: 2, heading: 'Content' }),
    ];
    const result = analyzeNarrative(slides);
    expect(result[1].narrative?.role).toBe('section-bridge');
  });

  it('should auto-infer breather for quote slides', () => {
    const slides: ContentSlide[] = [
      makeSlide({ index: 0, contentType: 'title' }),
      makeSlide({ index: 1, contentType: 'quote', heading: 'Quote', quote: { text: 'wisdom' } }),
    ];
    const result = analyzeNarrative(slides);
    expect(result[1].narrative?.role).toBe('breather');
  });

  it('should default to build-up for content slides', () => {
    const slides: ContentSlide[] = [
      makeSlide({ index: 0, contentType: 'title' }),
      makeSlide({ index: 1, heading: 'Point', bullets: ['a', 'b'] }),
    ];
    const result = analyzeNarrative(slides);
    expect(result[1].narrative?.role).toBe('build-up');
  });
});
