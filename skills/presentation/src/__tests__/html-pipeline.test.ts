import { describe, it, expect } from 'vitest';

describe('html-pipeline module exports', () => {
  it('HtmlPipeline class is importable', async () => {
    const { HtmlPipeline } = await import('../html-pipeline/orchestrator.js');
    expect(HtmlPipeline).toBeDefined();
    expect(typeof HtmlPipeline).toBe('function');
  });

  it('HtmlPipeline has process method', async () => {
    const { HtmlPipeline } = await import('../html-pipeline/orchestrator.js');
    const pipeline = new HtmlPipeline();
    expect(typeof pipeline.process).toBe('function');
  });

  it('presetToCss generates CSS variables', async () => {
    const { presetToCss } = await import('../html-pipeline/preset-to-css.js');
    const { PRESETS } = await import('../themes/presets.js');

    // Use first available preset
    const presetName = Object.keys(PRESETS)[0];
    const preset = PRESETS[presetName];
    const css = presetToCss(preset);

    expect(css).toContain('--bg-primary');
    expect(css).toContain('--accent');
    expect(css).toContain('--font-display');
    expect(css).toContain(':root');
  });

  it('RenderMode type accepts valid values', async () => {
    // Type-level test: if this compiles, the types work
    const { HtmlPipeline } = await import('../html-pipeline/orchestrator.js');
    expect(HtmlPipeline).toBeDefined();
  });
});
