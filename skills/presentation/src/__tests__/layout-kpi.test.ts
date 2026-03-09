import { describe, it, expect } from 'vitest';
import { contentToBentoLayout } from '../codegen/plan-to-bento.js';
import { resolveGeometry } from '../codegen/geometry-engine.js';
import { resolveTokens } from '../codegen/bento-layouts.js';
import { getPreset } from '../themes/presets.js';
import type { ContentSlide } from '../parser/types.js';

function makeSlide(overrides: Partial<ContentSlide>): ContentSlide {
  return { index: 0, heading: 'Test', contentType: 'content-bullets', ...overrides };
}

describe('KPI Highlight layout', () => {
  it('should detect kpi-highlight from evidence role + numeric bullets', () => {
    const slide = makeSlide({
      heading: '핵심 성과',
      bullets: ['매출 47% 증가', '비용 23% 절감', '고객 만족도 4.8점'],
      narrative: { role: 'evidence' },
    });
    const layout = contentToBentoLayout(slide);
    expect(layout.type).toBe('kpi-highlight');
    if (layout.type === 'kpi-highlight') {
      expect(layout.metrics).toHaveLength(3);
      expect(layout.metrics[0].value).toBe('47%');
      expect(layout.metrics[0].trend).toBe('up');
    }
  });

  it('should resolve KPI geometry', () => {
    const slide = makeSlide({
      heading: '성과 요약',
      bullets: ['생산성 35% 향상', '오류율 12% 감소'],
      narrative: { role: 'evidence' },
    });
    const layout = contentToBentoLayout(slide);
    const tokens = resolveTokens(getPreset('bold-signal'));
    const geometry = resolveGeometry(layout, tokens);

    expect(geometry.title.text).toBe('성과 요약');
    // Cards + values + labels
    expect(geometry.elements.length).toBeGreaterThanOrEqual(4);
  });
});
