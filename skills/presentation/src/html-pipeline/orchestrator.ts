import { readdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import PptxGenJSDefault from 'pptxgenjs';
import { chromium } from 'playwright';
import { html2pptx } from './html2pptx.js';
import { hybridRender } from './hybrid-renderer.js';

// Handle pptxgenjs dual export
const PptxGen: any = (typeof PptxGenJSDefault === 'function'
  ? PptxGenJSDefault
  : (PptxGenJSDefault as any).default) ?? PptxGenJSDefault;

export type RenderMode = 'hybrid' | 'dom' | 'screenshot';

export interface HtmlPipelineOptions {
  slidesDir: string;
  outputPath: string;
  mode?: RenderMode;
  verbose?: boolean;
}

export interface HtmlPipelineResult {
  totalSlides: number;
  outputFile: string;
  errors: string[];
}

export class HtmlPipeline {
  async process(options: HtmlPipelineOptions): Promise<HtmlPipelineResult> {
    const { slidesDir, outputPath, mode = 'hybrid', verbose } = options;

    if (!existsSync(slidesDir)) {
      throw new Error(`Slides directory not found: ${slidesDir}`);
    }

    const htmlFiles = readdirSync(slidesDir)
      .filter(f => f.endsWith('.html'))
      .sort()
      .map(f => join(slidesDir, f));

    if (htmlFiles.length === 0) {
      throw new Error(`No HTML files found in: ${slidesDir}`);
    }

    if (verbose) console.log(`Converting ${htmlFiles.length} slides (mode: ${mode})...`);

    const pres = new PptxGen();
    // 1920x1080px at 96dpi = 20" x 11.25"
    pres.defineLayout({ name: 'LAYOUT_1080P', width: 20, height: 11.25 });
    pres.layout = 'LAYOUT_1080P';

    const browser = await chromium.launch();
    const allErrors: string[] = [];

    try {
      for (const file of htmlFiles) {
        if (verbose) console.log(`  Processing: ${file}`);

        if (mode === 'dom') {
          const result = await html2pptx(file, pres, { browser });
          if (result.errors.length > 0) {
            allErrors.push(...result.errors.map((e: string) => `${file}: ${e}`));
          }
        } else {
          // hybrid or screenshot
          const result = await hybridRender(file, pres, {
            browser,
            screenshotOnly: mode === 'screenshot',
          });
          if (result.errors.length > 0) {
            allErrors.push(...result.errors.map((e: string) => `${file}: ${e}`));
          }
        }
      }
    } finally {
      await browser.close();
    }

    const resolvedOutput = resolve(outputPath);
    await pres.writeFile({ fileName: resolvedOutput });

    if (verbose) console.log(`Saved: ${resolvedOutput}`);

    return {
      totalSlides: htmlFiles.length,
      outputFile: resolvedOutput,
      errors: allErrors,
    };
  }
}
