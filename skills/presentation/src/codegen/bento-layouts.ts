/**
 * Bento Grid Layout System — Types & Design Tokens
 *
 * 9 layout types covering all content slide patterns:
 *   L1: Hero + Sub     — top hero card + bottom 2-3 sub-cards
 *   L2: Three-Equal    — 3 equal cards side by side
 *   L3: Asymmetric     — large card + smaller cards (emphasis via size)
 *   L4: Two-Split      — 2 columns (equal or 1 big + 2 stacked)
 *   L5: Table/Grid     — 2-col x N-row small cards for structured data
 *   L6: Full-Message   — single full-width hero card (impact statement)
 *   L7: Timeline       — horizontal step sequence
 *   L8: KPI Highlight  — metric cards with trend indicators
 *   L9: Quote/Statement — centered quote with attribution
 *
 * Preset-driven design tokens (1920x1080):
 *   - All colors, fonts, fills resolved from StylePreset
 */

import type { RGB, StylePreset } from '../themes/types.js';
import { getPreset, DEFAULT_PRESET } from '../themes/presets.js';

// Re-export RGB for backward compatibility
export type { RGB };

// ── Design Tokens ──

export function resolveTokens(preset: StylePreset) {
  return {
    canvas: { width: 1920, height: 1080 },
    margin: { left: 80, right: 80, top: 55, bottom: 64 },
    contentWidth: 1760,
    gutter: 32,
    radius: { card: 24, cardSmall: 20, hero: 28 },
    bg: preset.colors.bgPrimary,
    bgGradientEnd: preset.colors.bgGradientEnd,
    colors: {
      offWhite: preset.colors.textPrimary,
      dimGray: preset.colors.textSecondary,
      cyan: preset.colors.accent,
      textOnCard: preset.colors.textOnCard,
      green: { r: 0.2, g: 0.85, b: 0.4 } as RGB,
      yellow: { r: 0.9, g: 0.8, b: 0.2 } as RGB,
      red: { r: 1, g: 0.35, b: 0.2 } as RGB,
    },
    cardFills: {
      neutral: preset.cardFills[0],
      blue: preset.cardFills[1],
      purple: preset.cardFills[2],
      green: preset.cardFills[3],
      red: preset.cardFills[4],
      yellow: preset.cardFills[5],
      darkGreen: preset.cardFills[3],
      darkRed: preset.cardFills[4],
    },
    font: {
      title: { size: 60, style: preset.fonts.display.style },
      cardHeader: { size: 48, style: preset.fonts.display.style },
      body: { size: 36, style: preset.fonts.body.style },
      caption: { size: 24, style: 'Medium' },
      detail: { size: 28, style: 'Medium' },
    },
    fontFamily: {
      display: preset.fonts.display.family,
      body: preset.fonts.body.family,
    },
    mode: preset.mode,
  };
}

export type ResolvedTokens = ReturnType<typeof resolveTokens>;

// Backward-compatible TOKENS constant using default preset
export const TOKENS = resolveTokens(getPreset(DEFAULT_PRESET));

// Contrast guard: auto-select text color based on background luminance
export function getContrastText(bg: RGB, lightColor: RGB, darkColor: RGB): RGB {
  const luminance = 0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b;
  return luminance > 0.5 ? darkColor : lightColor;
}

// ── Types ──

export type LayoutType = 'hero-sub' | 'three-equal' | 'asymmetric' | 'two-split' | 'table-grid' | 'full-message' | 'timeline' | 'kpi-highlight' | 'quote-statement';

export interface CardDef {
  title: string;
  titleColor?: RGB;
  body?: string;
  bodyLines?: string[];
  caption?: string;
  fill?: RGB;
  accentColor?: RGB;
}

export interface HeroSubLayout {
  type: 'hero-sub';
  title: string;
  hero: {
    text: string;
    lineHeight?: number;
  };
  accentBar?: boolean;
  subCards: CardDef[];
}

export interface ThreeEqualLayout {
  type: 'three-equal';
  title: string;
  cards: [CardDef, CardDef, CardDef];
}

export interface AsymmetricLayout {
  type: 'asymmetric';
  title: string;
  /** Which side gets the large card */
  heroSide: 'left' | 'right';
  heroCard: CardDef & {
    subtitle?: string;
    items: string[];
    itemSize?: number;
  };
  smallCards: CardDef[];
  /** Width ratio of hero card (0.0 - 1.0), default 0.67 */
  heroRatio?: number;
}

export interface TwoSplitLayout {
  type: 'two-split';
  title: string;
  /** 'equal' = 2 equal columns, 'stacked' = left big + right 2-stack */
  mode: 'equal' | 'stacked';
  left: CardDef;
  right: CardDef | [CardDef, CardDef];
}

export interface TableGridLayout {
  type: 'table-grid';
  title: string;
  columns: 2 | 3;
  items: Array<{
    num?: string;
    name: string;
    description: string;
  }>;
}

export interface FullMessageLayout {
  type: 'full-message';
  title: string;
  hero: {
    beforeText?: string;
    mainText: string;
    mainSize?: number;
    detail?: string;
  };
  accentBar?: boolean;
}

export interface TimelineLayout {
  type: 'timeline';
  title: string;
  steps: Array<{
    label: string;
    description: string;
    highlight?: boolean;
  }>;
}

export interface KpiHighlightLayout {
  type: 'kpi-highlight';
  title: string;
  metrics: Array<{
    value: string;
    label: string;
    trend?: 'up' | 'down' | 'neutral';
  }>;
}

export interface QuoteStatementLayout {
  type: 'quote-statement';
  title?: string;
  quote: string;
  attribution?: string;
  style: 'quote' | 'statement';
}

export type SlideLayout =
  | HeroSubLayout
  | ThreeEqualLayout
  | AsymmetricLayout
  | TwoSplitLayout
  | TableGridLayout
  | FullMessageLayout
  | TimelineLayout
  | KpiHighlightLayout
  | QuoteStatementLayout;
