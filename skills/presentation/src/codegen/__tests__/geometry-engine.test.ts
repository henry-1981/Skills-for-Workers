/**
 * Geometry Engine Tests
 *
 * Validates that resolveGeometry() produces correct absolute-pixel
 * coordinates for all 6 Bento layout types.
 *
 * Key invariants:
 *   1. Pure function: same input → same output
 *   2. All coordinates within 1920×1080 canvas
 *   3. Correct element count per layout type
 *   4. Cards have fill and radius; texts have fontSize and color
 */

import { describe, it, expect } from 'vitest';
import { resolveGeometry, ResolvedSlideGeometry, ResolvedElement } from '../geometry-engine.js';
import { resolveTokens } from '../bento-layouts.js';
import { getPreset } from '../../themes/presets.js';
import type {
  HeroSubLayout,
  ThreeEqualLayout,
  AsymmetricLayout,
  TwoSplitLayout,
  TableGridLayout,
  FullMessageLayout,
} from '../bento-layouts.js';

// ── Helpers ──

const tokens = resolveTokens(getPreset('bold-signal'));

function cards(geo: ResolvedSlideGeometry): ResolvedElement[] {
  return geo.elements.filter(e => e.type === 'card');
}

function texts(geo: ResolvedSlideGeometry): ResolvedElement[] {
  return geo.elements.filter(e => e.type === 'text');
}

function allElements(geo: ResolvedSlideGeometry): ResolvedElement[] {
  return [geo.title, ...geo.elements];
}

/** Verify all coordinates are within 1920×1080 canvas bounds */
function assertBounds(geo: ResolvedSlideGeometry) {
  for (const el of allElements(geo)) {
    // Elements inside cards use parent-relative coordinates,
    // so they can be smaller than canvas dimensions
    if (el.parentId) {
      // Parent-relative: just check non-negative and reasonable
      expect(el.x).toBeGreaterThanOrEqual(0);
      expect(el.y).toBeGreaterThanOrEqual(0);
      expect(el.w).toBeGreaterThan(0);
      expect(el.h).toBeGreaterThan(0);
    } else {
      // Absolute: must be within canvas
      expect(el.x).toBeGreaterThanOrEqual(0);
      expect(el.y).toBeGreaterThanOrEqual(0);
      expect(el.x + el.w).toBeLessThanOrEqual(1920);
      expect(el.y + el.h).toBeLessThanOrEqual(1080);
      expect(el.w).toBeGreaterThan(0);
      expect(el.h).toBeGreaterThan(0);
    }
  }
}

// ── Test Data ──

const heroSubLayout: HeroSubLayout = {
  type: 'hero-sub',
  title: 'Test Hero Sub',
  hero: { text: 'This is the hero text for testing' },
  subCards: [
    { title: 'Card 1', body: 'Body 1' },
    { title: 'Card 2', body: 'Body 2' },
  ],
};

const threeEqualLayout: ThreeEqualLayout = {
  type: 'three-equal',
  title: 'Test Three Equal',
  cards: [
    { title: 'First', body: 'Description one' },
    { title: 'Second', body: 'Description two' },
    { title: 'Third', body: 'Description three' },
  ],
};

const asymmetricLayout: AsymmetricLayout = {
  type: 'asymmetric',
  title: 'Test Asymmetric',
  heroSide: 'left',
  heroCard: {
    title: 'Hero Title',
    items: ['Item A', 'Item B', 'Item C'],
  },
  smallCards: [
    { title: 'Small 1', body: 'Detail 1' },
    { title: 'Small 2', body: 'Detail 2' },
  ],
};

const twoSplitEqualLayout: TwoSplitLayout = {
  type: 'two-split',
  title: 'Test Two Split',
  mode: 'equal',
  left: { title: 'Left Side', body: 'Left content' },
  right: { title: 'Right Side', body: 'Right content' },
};

const twoSplitStackedLayout: TwoSplitLayout = {
  type: 'two-split',
  title: 'Test Two Split Stacked',
  mode: 'stacked',
  left: { title: 'Big Left', body: 'Left content here' },
  right: [
    { title: 'Top Right', body: 'Top body' },
    { title: 'Bottom Right', body: 'Bottom body' },
  ],
};

const tableGridLayout: TableGridLayout = {
  type: 'table-grid',
  title: 'Test Table Grid',
  columns: 2,
  items: [
    { num: '1', name: 'Item One', description: 'First description' },
    { num: '2', name: 'Item Two', description: 'Second description' },
    { num: '3', name: 'Item Three', description: 'Third description' },
    { num: '4', name: 'Item Four', description: 'Fourth description' },
  ],
};

const fullMessageLayout: FullMessageLayout = {
  type: 'full-message',
  title: 'Test Full Message',
  hero: {
    mainText: 'This is the main message',
    detail: 'Additional detail text',
  },
};

// ── Tests ──

describe('resolveGeometry', () => {
  describe('pure function invariant', () => {
    it('produces identical output for identical input', () => {
      const a = resolveGeometry(heroSubLayout, tokens);
      const b = resolveGeometry(heroSubLayout, tokens);
      expect(a).toEqual(b);
    });

    it('produces identical output across all layout types', () => {
      const layouts = [
        heroSubLayout, threeEqualLayout, asymmetricLayout,
        twoSplitEqualLayout, tableGridLayout, fullMessageLayout,
      ];
      for (const layout of layouts) {
        const first = resolveGeometry(layout, tokens);
        const second = resolveGeometry(layout, tokens);
        expect(first).toEqual(second);
      }
    });
  });

  describe('canvas bounds', () => {
    it('hero-sub: all elements within bounds', () => {
      assertBounds(resolveGeometry(heroSubLayout, tokens));
    });

    it('three-equal: all elements within bounds', () => {
      assertBounds(resolveGeometry(threeEqualLayout, tokens));
    });

    it('asymmetric: all elements within bounds', () => {
      assertBounds(resolveGeometry(asymmetricLayout, tokens));
    });

    it('two-split equal: all elements within bounds', () => {
      assertBounds(resolveGeometry(twoSplitEqualLayout, tokens));
    });

    it('two-split stacked: all elements within bounds', () => {
      assertBounds(resolveGeometry(twoSplitStackedLayout, tokens));
    });

    it('table-grid: all elements within bounds', () => {
      assertBounds(resolveGeometry(tableGridLayout, tokens));
    });

    it('full-message: all elements within bounds', () => {
      assertBounds(resolveGeometry(fullMessageLayout, tokens));
    });
  });

  describe('element counts', () => {
    it('hero-sub: 1 hero card + N sub cards + text elements', () => {
      const geo = resolveGeometry(heroSubLayout, tokens);
      const c = cards(geo);
      // 1 hero + 2 sub = 3 cards
      expect(c.length).toBe(3);
      // Title element is separate
      expect(geo.title.type).toBe('text');
      expect(geo.title.text).toBe('Test Hero Sub');
    });

    it('three-equal: 3 cards', () => {
      const geo = resolveGeometry(threeEqualLayout, tokens);
      expect(cards(geo).length).toBe(3);
    });

    it('asymmetric: 1 hero + N small cards', () => {
      const geo = resolveGeometry(asymmetricLayout, tokens);
      // 1 hero + 2 small = 3 cards
      expect(cards(geo).length).toBe(3);
    });

    it('two-split equal: 2 cards', () => {
      const geo = resolveGeometry(twoSplitEqualLayout, tokens);
      expect(cards(geo).length).toBe(2);
    });

    it('two-split stacked: 3 cards (1 left + 2 right)', () => {
      const geo = resolveGeometry(twoSplitStackedLayout, tokens);
      expect(cards(geo).length).toBe(3);
    });

    it('table-grid: 1 card per item', () => {
      const geo = resolveGeometry(tableGridLayout, tokens);
      expect(cards(geo).length).toBe(4);
    });

    it('full-message: 1 hero card', () => {
      const geo = resolveGeometry(fullMessageLayout, tokens);
      expect(cards(geo).length).toBe(1);
    });
  });

  describe('background', () => {
    it('uses preset background color', () => {
      const geo = resolveGeometry(heroSubLayout, tokens);
      expect(geo.background.color).toEqual(tokens.bg);
    });

    it('includes gradient end when preset has one', () => {
      const geo = resolveGeometry(heroSubLayout, tokens);
      expect(geo.background.gradientEnd).toEqual(tokens.bgGradientEnd);
    });
  });

  describe('text elements', () => {
    it('all text elements have fontSize and color', () => {
      const layouts = [
        heroSubLayout, threeEqualLayout, asymmetricLayout,
        twoSplitEqualLayout, tableGridLayout, fullMessageLayout,
      ];
      for (const layout of layouts) {
        const geo = resolveGeometry(layout, tokens);
        for (const el of texts(geo)) {
          expect(el.fontSize).toBeGreaterThan(0);
          expect(el.color).toBeDefined();
          expect(el.text).toBeDefined();
          expect(el.fontFamily).toBeDefined();
        }
      }
    });

    it('title element uses display font', () => {
      const geo = resolveGeometry(heroSubLayout, tokens);
      expect(geo.title.fontFamily).toBe(tokens.fontFamily.display);
      expect(geo.title.fontType).toBe('display');
    });
  });

  describe('card elements', () => {
    it('all cards have fill and radius', () => {
      const layouts = [
        heroSubLayout, threeEqualLayout, asymmetricLayout,
        twoSplitEqualLayout, tableGridLayout, fullMessageLayout,
      ];
      for (const layout of layouts) {
        const geo = resolveGeometry(layout, tokens);
        for (const el of cards(geo)) {
          expect(el.fill).toBeDefined();
          expect(el.radius).toBeDefined();
          expect(el.radius).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('preset independence', () => {
    it('different presets produce different colors but same structure', () => {
      const darkTokens = resolveTokens(getPreset('bold-signal'));
      const lightTokens = resolveTokens(getPreset('notebook-tabs'));

      const darkGeo = resolveGeometry(heroSubLayout, darkTokens);
      const lightGeo = resolveGeometry(heroSubLayout, lightTokens);

      // Same structure
      expect(cards(darkGeo).length).toBe(cards(lightGeo).length);
      expect(texts(darkGeo).length).toBe(texts(lightGeo).length);

      // Different background
      expect(darkGeo.background.color).not.toEqual(lightGeo.background.color);
    });
  });

  describe('full-message with beforeText', () => {
    it('includes beforeText element', () => {
      const layout: FullMessageLayout = {
        type: 'full-message',
        title: 'Before After',
        hero: {
          beforeText: 'Old approach',
          mainText: 'New approach',
        },
        accentBar: true,
      };
      const geo = resolveGeometry(layout, tokens);
      const beforeEl = geo.elements.find(e => e.id === 'beforeTxt');
      expect(beforeEl).toBeDefined();
      expect(beforeEl!.text).toBe('Old approach');
    });
  });
});
