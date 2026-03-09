import { describe, it, expect } from 'vitest';
import { contentToBentoLayout } from '../codegen/plan-to-bento.js';
import { resolveGeometry } from '../codegen/geometry-engine.js';
import { resolveTokens } from '../codegen/bento-layouts.js';
import { getPreset } from '../themes/presets.js';
import type { ContentSlide } from '../parser/types.js';

function makeSlide(overrides: Partial<ContentSlide>): ContentSlide {
  return { index: 0, heading: 'Test', contentType: 'content-bullets', ...overrides };
}

describe('Quote/Statement layout', () => {
  it('should detect quote-statement from breather + quote', () => {
    const slide = makeSlide({
      contentType: 'quote',
      heading: '영감',
      quote: { text: '좋은 디자인은 보이지 않는다', attribution: 'Dieter Rams' },
      narrative: { role: 'breather' },
    });
    const layout = contentToBentoLayout(slide);
    expect(layout.type).toBe('quote-statement');
    if (layout.type === 'quote-statement') {
      expect(layout.style).toBe('quote');
      expect(layout.attribution).toBe('Dieter Rams');
    }
  });

  it('should detect statement from climax + short bullet', () => {
    const slide = makeSlide({
      heading: '결론',
      bullets: ['속도가 곧 품질이다'],
      narrative: { role: 'climax' },
    });
    const layout = contentToBentoLayout(slide);
    expect(layout.type).toBe('quote-statement');
    if (layout.type === 'quote-statement') {
      expect(layout.style).toBe('statement');
    }
  });

  it('should resolve quote geometry with decorative quote mark', () => {
    const slide = makeSlide({
      contentType: 'quote',
      heading: '인용',
      quote: { text: '단순함이 궁극의 정교함이다', attribution: 'Leonardo da Vinci' },
      narrative: { role: 'breather' },
    });
    const layout = contentToBentoLayout(slide);
    const tokens = resolveTokens(getPreset('bold-signal'));
    const geometry = resolveGeometry(layout, tokens);

    // Should have: quoteCard + quoteOpen + quoteTxt + attrTxt
    const ids = geometry.elements.map(e => e.id);
    expect(ids).toContain('quoteCard');
    expect(ids).toContain('quoteOpen');
    expect(ids).toContain('quoteTxt');
    expect(ids).toContain('attrTxt');
  });
});
