import { describe, it, expect } from 'vitest';
import { contentToBentoLayout } from '../codegen/plan-to-bento.js';
import { resolveGeometry } from '../codegen/geometry-engine.js';
import { resolveTokens } from '../codegen/bento-layouts.js';
import { getPreset } from '../themes/presets.js';
import type { ContentSlide } from '../parser/types.js';

function makeSlide(overrides: Partial<ContentSlide>): ContentSlide {
  return { index: 0, heading: 'Test', contentType: 'content-bullets', ...overrides };
}

describe('Timeline layout detection', () => {
  it('should detect timeline from process-style bullets', () => {
    const slide = makeSlide({
      heading: '프로젝트 로드맵',
      bullets: [
        '**Phase 1**: 기획 및 설계',
        '**Phase 2**: 개발 및 테스트',
        '**Phase 3**: 출시 및 운영',
      ],
    });
    const layout = contentToBentoLayout(slide);
    expect(layout.type).toBe('timeline');
    if (layout.type === 'timeline') {
      expect(layout.steps).toHaveLength(3);
    }
  });

  it('should detect timeline from heading hint', () => {
    const slide = makeSlide({
      heading: '연혁',
      bullets: ['2020: 설립', '2021: 성장', '2022: 확장'],
    });
    const layout = contentToBentoLayout(slide);
    expect(layout.type).toBe('timeline');
  });
});

describe('Timeline geometry', () => {
  it('should resolve geometry for 3-step timeline', () => {
    const slide = makeSlide({
      heading: '프로젝트 로드맵',
      bullets: [
        '**Phase 1**: 기획',
        '**Phase 2**: 개발',
        '**Phase 3**: 출시',
      ],
    });
    const layout = contentToBentoLayout(slide);
    const tokens = resolveTokens(getPreset('bold-signal'));
    const geometry = resolveGeometry(layout, tokens);

    expect(geometry.title.text).toBe('프로젝트 로드맵');
    expect(geometry.elements.length).toBeGreaterThan(3);
    for (const el of geometry.elements) {
      expect(el.x).toBeGreaterThanOrEqual(0);
      expect(el.x + el.w).toBeLessThanOrEqual(1920);
    }
  });
});
