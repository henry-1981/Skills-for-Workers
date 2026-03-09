import { describe, it, expect } from 'vitest';
import { existsSync, unlinkSync } from 'fs';
import { PptxRenderer } from '../codegen/pptx-renderer.js';
import { resolveGeometry } from '../codegen/geometry-engine.js';
import { resolveTokens } from '../codegen/bento-layouts.js';
import { getPreset } from '../themes/presets.js';
import { contentToBentoLayout } from '../codegen/plan-to-bento.js';
import type { ContentSlide } from '../parser/types.js';
import * as os from 'os';
import * as path from 'path';

function makeSlide(overrides: Partial<ContentSlide>): ContentSlide {
  return { index: 0, heading: 'Test', contentType: 'content-bullets', ...overrides };
}

describe('PptxRenderer with new layouts', () => {
  const preset = getPreset('bold-signal');
  const tokens = resolveTokens(preset);

  it('should render timeline layout to PPTX', async () => {
    const outPath = path.join(os.tmpdir(), `test-timeline-${Date.now()}.pptx`);
    const renderer = new PptxRenderer(preset, outPath);
    const slide = makeSlide({
      heading: '로드맵',
      bullets: ['**Phase 1**: 기획', '**Phase 2**: 개발', '**Phase 3**: 출시'],
    });
    const layout = contentToBentoLayout(slide);
    const geometry = resolveGeometry(layout, tokens);
    renderer.renderContent(geometry);
    await renderer.finalize();
    expect(existsSync(outPath)).toBe(true);
    unlinkSync(outPath);
  });

  it('should render KPI layout to PPTX', async () => {
    const outPath = path.join(os.tmpdir(), `test-kpi-${Date.now()}.pptx`);
    const renderer = new PptxRenderer(preset, outPath);
    const slide = makeSlide({
      heading: '성과',
      bullets: ['매출 47% 증가', '비용 23% 절감'],
      narrative: { role: 'evidence' },
    });
    const layout = contentToBentoLayout(slide);
    const geometry = resolveGeometry(layout, tokens);
    renderer.renderContent(geometry);
    await renderer.finalize();
    expect(existsSync(outPath)).toBe(true);
    unlinkSync(outPath);
  });

  it('should render quote layout to PPTX', async () => {
    const outPath = path.join(os.tmpdir(), `test-quote-${Date.now()}.pptx`);
    const renderer = new PptxRenderer(preset, outPath);
    const slide = makeSlide({
      contentType: 'quote',
      heading: '인용',
      quote: { text: '단순함이 궁극의 정교함이다', attribution: 'Leonardo' },
      narrative: { role: 'breather' },
    });
    const layout = contentToBentoLayout(slide);
    const geometry = resolveGeometry(layout, tokens);
    renderer.renderContent(geometry);
    await renderer.finalize();
    expect(existsSync(outPath)).toBe(true);
    unlinkSync(outPath);
  });
});
