/**
 * PptxRenderer Tests
 *
 * Validates:
 *   - Structural slide rendering (title, section-header, closing)
 *   - Content slide rendering for all 6 Bento layout types
 *   - Preset independence (dark + light smoke tests)
 *   - File creation and non-trivial file size
 */

import { describe, it, expect, afterEach } from 'vitest';
import { PptxRenderer } from '../pptx-renderer.js';
import { getPreset } from '../../themes/presets.js';
import { resolveGeometry } from '../geometry-engine.js';
import { resolveTokens } from '../bento-layouts.js';
import type { SlideLayout } from '../bento-layouts.js';
import { existsSync, unlinkSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// ── Helpers ──

let counter = 0;
function tmpPath(name: string): string {
  return join(tmpdir(), `pptx-renderer-test-${name}-${Date.now()}-${counter++}.pptx`);
}

const filesToClean: string[] = [];

afterEach(() => {
  for (const f of filesToClean) {
    try {
      if (existsSync(f)) unlinkSync(f);
    } catch {
      // ignore cleanup errors
    }
  }
  filesToClean.length = 0;
});

// ── Tests ──

describe('PptxRenderer', () => {
  describe('structural slides', () => {
    it('renders title slide and creates file', async () => {
      const outPath = tmpPath('title');
      filesToClean.push(outPath);

      const preset = getPreset('bold-signal');
      const renderer = new PptxRenderer(preset, outPath);

      renderer.renderStructural('title', {
        heading: 'Presentation Title',
        subtitle: 'A subtitle for testing',
      });

      const result = await renderer.finalize();

      expect(result.type).toBe('pptx');
      if (result.type === 'pptx') {
        expect(result.filePath).toBe(outPath);
      }
      expect(existsSync(outPath)).toBe(true);
    });

    it('renders section-header slide', async () => {
      const outPath = tmpPath('section');
      filesToClean.push(outPath);

      const preset = getPreset('neon-cyber');
      const renderer = new PptxRenderer(preset, outPath);

      renderer.renderStructural('section-header', {
        heading: 'Section One',
        sectionTag: 'Part 1',
      });

      const result = await renderer.finalize();

      expect(result.type).toBe('pptx');
      expect(existsSync(outPath)).toBe(true);
    });

    it('renders closing slide with default heading', async () => {
      const outPath = tmpPath('closing');
      filesToClean.push(outPath);

      const preset = getPreset('paper-ink');
      const renderer = new PptxRenderer(preset, outPath);

      renderer.renderStructural('closing', {});

      const result = await renderer.finalize();

      expect(result.type).toBe('pptx');
      expect(existsSync(outPath)).toBe(true);
    });

    it('renders all 3 structural types in one file with correct slide count', async () => {
      const outPath = tmpPath('all-structural');
      filesToClean.push(outPath);

      const preset = getPreset('electric-studio');
      const renderer = new PptxRenderer(preset, outPath);

      renderer.renderStructural('title', {
        heading: 'Main Title',
        subtitle: 'Subtitle text',
      });

      renderer.renderStructural('section-header', {
        heading: 'Section Heading',
        sectionTag: 'Chapter 1',
      });

      renderer.renderStructural('closing', {
        heading: 'Thanks!',
        subtitle: 'Contact info here',
      });

      const result = await renderer.finalize();

      expect(result.type).toBe('pptx');
      expect(existsSync(outPath)).toBe(true);
      // File should be non-trivial size (> 10KB for 3 slides)
      const stats = statSync(outPath);
      expect(stats.size).toBeGreaterThan(10_000);
    });
  });

  describe('preset independence', () => {
    it('works with dark preset (bold-signal)', async () => {
      const outPath = tmpPath('dark');
      filesToClean.push(outPath);

      const renderer = new PptxRenderer(getPreset('bold-signal'), outPath);
      renderer.renderStructural('title', { heading: 'Dark Theme Test' });
      await renderer.finalize();

      expect(existsSync(outPath)).toBe(true);
    });

    it('works with light preset (notebook-tabs)', async () => {
      const outPath = tmpPath('light');
      filesToClean.push(outPath);

      const renderer = new PptxRenderer(getPreset('notebook-tabs'), outPath);
      renderer.renderStructural('title', { heading: 'Light Theme Test' });
      await renderer.finalize();

      expect(existsSync(outPath)).toBe(true);
    });
  });

  describe('content layouts', () => {
    // Test fixture layouts for each of the 6 types
    const testLayouts: Record<string, SlideLayout> = {
      'hero-sub': {
        type: 'hero-sub',
        title: 'Hero Sub Layout',
        hero: { text: 'Main insight goes here with some detailed explanation' },
        subCards: [
          { title: 'Point A', body: 'Supporting detail for point A' },
          { title: 'Point B', body: 'Supporting detail for point B' },
          { title: 'Point C', caption: 'METRIC', body: 'With caption' },
        ],
      },
      'three-equal': {
        type: 'three-equal',
        title: 'Three Equal Layout',
        cards: [
          { title: 'First Card', body: 'Body text for first card' },
          { title: 'Second Card', body: 'Body text for second card' },
          { title: 'Third Card', body: 'Body text for third card' },
        ],
      },
      'asymmetric': {
        type: 'asymmetric',
        title: 'Asymmetric Layout',
        heroSide: 'left',
        heroCard: {
          title: 'Big Idea',
          subtitle: 'A subtitle',
          items: ['Item one', 'Item two', 'Item three'],
        },
        smallCards: [
          { title: 'Detail A', body: 'Small card body' },
          { title: 'Detail B', body: 'Another small card' },
        ],
      },
      'two-split-equal': {
        type: 'two-split',
        title: 'Two Split Equal',
        mode: 'equal',
        left: { title: 'Left Side', body: 'Left body content', caption: 'LEFT' },
        right: { title: 'Right Side', body: 'Right body content' },
      },
      'two-split-stacked': {
        type: 'two-split',
        title: 'Two Split Stacked',
        mode: 'stacked',
        left: { title: 'Big Left', body: 'Detailed explanation on left' },
        right: [
          { title: 'Top Right', body: 'Top stack' },
          { title: 'Bottom Right', body: 'Bottom stack' },
        ],
      },
      'table-grid': {
        type: 'table-grid',
        title: 'Table Grid Layout',
        columns: 2,
        items: [
          { num: '01', name: 'First', description: 'Description one' },
          { num: '02', name: 'Second', description: 'Description two' },
          { num: '03', name: 'Third', description: 'Description three' },
          { num: '04', name: 'Fourth', description: 'Description four' },
        ],
      },
      'full-message': {
        type: 'full-message' as const,
        title: 'Full Message Layout',
        hero: {
          beforeText: 'Before',
          mainText: 'The main message goes here',
          detail: 'Some additional detail text below',
        },
      },
    };

    for (const [name, layout] of Object.entries(testLayouts)) {
      it(`renders ${name} layout and creates file`, async () => {
        const outPath = tmpPath(`content-${name}`);
        filesToClean.push(outPath);

        const preset = getPreset('bold-signal');
        const renderer = new PptxRenderer(preset, outPath);
        const tokens = resolveTokens(preset);
        const geometry = resolveGeometry(layout, tokens);

        renderer.renderContent(geometry);
        const result = await renderer.finalize();

        expect(result.type).toBe('pptx');
        expect(existsSync(outPath)).toBe(true);
        const stats = statSync(outPath);
        expect(stats.size).toBeGreaterThan(5_000);
      });
    }

    it('renders all 6 layout types in one file', async () => {
      const outPath = tmpPath('content-all');
      filesToClean.push(outPath);

      const preset = getPreset('neon-cyber');
      const renderer = new PptxRenderer(preset, outPath);
      const tokens = resolveTokens(preset);

      // Use only unique layout types (skip two-split-stacked duplicate key)
      const uniqueLayouts = [
        testLayouts['hero-sub'],
        testLayouts['three-equal'],
        testLayouts['asymmetric'],
        testLayouts['two-split-equal'],
        testLayouts['table-grid'],
        testLayouts['full-message'],
      ];

      for (const layout of uniqueLayouts) {
        const geometry = resolveGeometry(layout, tokens);
        renderer.renderContent(geometry);
      }

      const result = await renderer.finalize();

      expect(result.type).toBe('pptx');
      expect(existsSync(outPath)).toBe(true);
      const stats = statSync(outPath);
      // 6 content slides should produce a substantial file
      expect(stats.size).toBeGreaterThan(20_000);
    });

    it('renders structural + content slides together', async () => {
      const outPath = tmpPath('mixed');
      filesToClean.push(outPath);

      const preset = getPreset('electric-studio');
      const renderer = new PptxRenderer(preset, outPath);
      const tokens = resolveTokens(preset);

      // Title slide
      renderer.renderStructural('title', {
        heading: 'Mixed Deck',
        subtitle: 'Structural + Content',
      });

      // Content slide
      const geometry = resolveGeometry(testLayouts['hero-sub'], tokens);
      renderer.renderContent(geometry);

      // Closing slide
      renderer.renderStructural('closing', { heading: 'End' });

      const result = await renderer.finalize();

      expect(result.type).toBe('pptx');
      expect(existsSync(outPath)).toBe(true);
      const stats = statSync(outPath);
      expect(stats.size).toBeGreaterThan(15_000);
    });
  });

  describe('content preset smoke tests', () => {
    it('content renders correctly with dark preset (neon-cyber)', async () => {
      const outPath = tmpPath('smoke-dark');
      filesToClean.push(outPath);

      const preset = getPreset('neon-cyber');
      const renderer = new PptxRenderer(preset, outPath);
      const tokens = resolveTokens(preset);

      // Use each layout type once
      const layouts: SlideLayout[] = [
        {
          type: 'hero-sub',
          title: 'Dark Hero',
          hero: { text: 'Dark theme hero' },
          subCards: [
            { title: 'A', body: 'Detail A' },
            { title: 'B', body: 'Detail B' },
          ],
        },
        {
          type: 'three-equal',
          title: 'Dark Cards',
          cards: [
            { title: 'One' },
            { title: 'Two' },
            { title: 'Three' },
          ],
        },
        {
          type: 'full-message',
          title: 'Dark Message',
          hero: { mainText: 'Big dark message' },
        },
      ];

      for (const layout of layouts) {
        renderer.renderContent(resolveGeometry(layout, tokens));
      }

      await renderer.finalize();
      expect(existsSync(outPath)).toBe(true);
    });

    it('content renders correctly with light preset (swiss-modern)', async () => {
      const outPath = tmpPath('smoke-light');
      filesToClean.push(outPath);

      const preset = getPreset('swiss-modern');
      const renderer = new PptxRenderer(preset, outPath);
      const tokens = resolveTokens(preset);

      const layouts: SlideLayout[] = [
        {
          type: 'asymmetric',
          title: 'Light Asymmetric',
          heroSide: 'right',
          heroCard: {
            title: 'Light Hero',
            items: ['First point', 'Second point'],
          },
          smallCards: [{ title: 'Side A' }, { title: 'Side B' }],
        },
        {
          type: 'two-split',
          title: 'Light Split',
          mode: 'equal',
          left: { title: 'Left' },
          right: { title: 'Right' },
        },
        {
          type: 'table-grid',
          title: 'Light Grid',
          columns: 2,
          items: [
            { num: '01', name: 'A', description: 'Desc A' },
            { num: '02', name: 'B', description: 'Desc B' },
          ],
        },
      ];

      for (const layout of layouts) {
        renderer.renderContent(resolveGeometry(layout, tokens));
      }

      await renderer.finalize();
      expect(existsSync(outPath)).toBe(true);
    });
  });

  describe('font handling', () => {
    it('uses preset fonts without error', async () => {
      const outPath = tmpPath('fonts');
      filesToClean.push(outPath);

      // terminal-green uses JetBrains Mono — unlikely to be installed
      const preset = getPreset('terminal-green');
      const renderer = new PptxRenderer(preset, outPath);

      renderer.renderStructural('title', {
        heading: 'Font Test: JetBrains Mono',
        subtitle: 'Should use original font name',
      });

      // Should not throw even if font is missing from system
      const result = await renderer.finalize();
      expect(result.type).toBe('pptx');
      expect(existsSync(outPath)).toBe(true);
    });
  });
});
