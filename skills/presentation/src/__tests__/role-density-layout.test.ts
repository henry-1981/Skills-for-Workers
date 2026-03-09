import { describe, it, expect } from 'vitest';
import { contentToBentoLayout } from '../codegen/plan-to-bento.js';
import type { ContentSlide } from '../parser/types.js';

function makeSlide(overrides: Partial<ContentSlide>): ContentSlide {
  return { index: 0, heading: 'Test', contentType: 'content-bullets', ...overrides };
}

describe('Role×Density layout selection', () => {
  it('should force quote-statement for climax role with short bullet', () => {
    const slide = makeSlide({
      heading: '핵심 발견',
      bullets: ['생산성 47% 향상'],
      narrative: { role: 'climax' },
    });
    const layout = contentToBentoLayout(slide);
    expect(layout.type).toBe('quote-statement');
  });

  it('should prefer quote-statement for breather role with quote', () => {
    const slide = makeSlide({
      contentType: 'quote',
      heading: '인용',
      quote: { text: '지혜로운 말씀' },
      narrative: { role: 'breather' },
    });
    const layout = contentToBentoLayout(slide);
    expect(layout.type).toBe('quote-statement');
  });

  it('should fall back to full-message for climax without quote or short bullet', () => {
    const slide = makeSlide({
      heading: '핵심 발견',
      bullets: ['이것은 매우 긴 텍스트로 50자를 넘겨야 full-message로 폴백됩니다. 그래서 길게 작성합니다.'],
      narrative: { role: 'climax' },
    });
    const layout = contentToBentoLayout(slide);
    expect(layout.type).toBe('full-message');
  });

  it('should keep standard layout for build-up role', () => {
    const slide = makeSlide({
      heading: '3가지 포인트',
      bullets: ['**포인트 1**: 설명', '**포인트 2**: 설명', '**포인트 3**: 설명'],
      narrative: { role: 'build-up' },
    });
    const layout = contentToBentoLayout(slide);
    expect(['hero-sub', 'three-equal', 'asymmetric', 'two-split']).toContain(layout.type);
  });
});
