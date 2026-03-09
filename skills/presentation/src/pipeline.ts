/**
 * Pipeline — markdown → parse → layout → geometry → PPTX
 */

import { readFileSync } from 'fs';
import { parseSlideMarkdown } from './parser/markdown-parser.js';
import { PptxRenderer } from './codegen/pptx-renderer.js';
import { resolveGeometry } from './codegen/geometry-engine.js';
import { contentToBentoLayout } from './codegen/plan-to-bento.js';
import { resolveTokens } from './codegen/bento-layouts.js';
import { getPreset } from './themes/presets.js';
import { analyzeNarrative } from './narrative/narrative-analyzer.js';
import { analyzeDensity } from './narrative/density-analyzer.js';
import type { LayoutType } from './codegen/bento-layouts.js';

export interface PipelineOptions {
  preset?: string;
  verbose?: boolean;
  outputPath?: string;
}

export interface PipelineResult {
  totalSlides: number;
  outputFile?: string;
}

export class Pipeline {
  async process(markdownPath: string, options?: PipelineOptions): Promise<PipelineResult> {
    const markdown = readFileSync(markdownPath, 'utf-8');

    // 1. Parse
    let slides = parseSlideMarkdown(markdown);

    // 2. Story Layer: assign narrative roles + density profiles
    slides = analyzeNarrative(slides);
    slides = slides.map(s => ({ ...s, density: analyzeDensity(s) }));

    if (options?.verbose) {
      console.log(`Parsed ${slides.length} slides`);
    }

    // 3. Render to PPTX
    const STRUCTURAL_TYPES = new Set(['title', 'section-header', 'closing']);
    const presetName = options?.preset ?? 'bold-signal';
    const preset = getPreset(presetName);
    const outputPath = options?.outputPath ?? 'output.pptx';
    const tokens = resolveTokens(preset);

    const renderer = new PptxRenderer(preset, outputPath);
    const prevLayouts: LayoutType[] = [];

    for (const slide of slides) {
      if (STRUCTURAL_TYPES.has(slide.contentType)) {
        const data: Record<string, string> = {
          heading: slide.heading,
        };
        if (slide.subtitle) data['subtitle'] = slide.subtitle;
        if (slide.sectionTag) data['sectionTag'] = slide.sectionTag;
        renderer.renderStructural(slide.contentType, data);
      } else {
        const layout = contentToBentoLayout(slide, prevLayouts, preset);
        prevLayouts.push(layout.type);
        const geometry = resolveGeometry(layout, tokens, slide.narrative);
        renderer.renderContent(geometry);
      }
    }

    const result = await renderer.finalize();

    if (options?.verbose) {
      console.log(`PPTX written to: ${outputPath}`);
    }

    return {
      totalSlides: slides.length,
      outputFile: result.type === 'pptx' ? result.filePath : undefined,
    };
  }
}
