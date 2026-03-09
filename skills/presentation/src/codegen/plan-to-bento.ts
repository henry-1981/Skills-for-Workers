/**
 * Converts ContentSlide + SlideRenderPlan → Bento SlideLayout
 *
 * This mapper bridges the parser/engine output with the Bento layout system.
 * It analyzes content structure and picks the best layout type.
 */

import { ContentSlide } from '../parser/types.js';
import type { StylePreset } from '../themes/types.js';
import { getPreset, DEFAULT_PRESET } from '../themes/presets.js';
import {
  SlideLayout,
  LayoutType,
  CardDef,
  HeroSubLayout,
  ThreeEqualLayout,
  AsymmetricLayout,
  TwoSplitLayout,
  TableGridLayout,
  FullMessageLayout,
  TimelineLayout,
  KpiHighlightLayout,
  QuoteStatementLayout,
  resolveTokens,
} from './bento-layouts.js';
import { assignCardColors, getCardFill, getCardAccent } from './semantic-colors.js';

/**
 * Determine the best Bento layout type for a slide.
 */
function detectLayoutType(slide: ContentSlide): LayoutType {
  const { contentType, table, bullets, diagram } = slide;
  const role = slide.narrative?.role;

  // Timeline detection: ordered steps with bold prefix or heading hint
  if (bullets && bullets.length >= 3 && bullets.length <= 6) {
    const hasOrderedSteps = bullets.every(b =>
      /^\*\*(?:Phase|Step|단계|STEP|[①-⑥]|[0-9]+)\s*[\d]*\*?\*?[:：]/.test(b)
    );
    const headingHint = /로드맵|타임라인|일정|연혁|프로세스|roadmap|timeline|process/i.test(slide.heading);
    if (hasOrderedSteps || headingHint) return 'timeline';
  }

  // KPI detection: evidence role + numeric bullets
  if (role === 'evidence' && bullets) {
    const numericBullets = bullets.filter(b =>
      /\d+%|\d+\.\d+[x배]|₩[\d,.]+|[0-9]+억|[0-9]+만/.test(b)
    );
    if (numericBullets.length >= 2 && bullets.length <= 5) {
      return 'kpi-highlight';
    }
  }

  // Quote/Statement: breather or climax with quote or single short bullet
  if (role === 'breather' || role === 'climax') {
    if (slide.quote) return 'quote-statement';
    if (bullets && bullets.length === 1 && bullets[0].length < 50) {
      return 'quote-statement';
    }
    // Fallback for climax/breather without specific content
    return 'full-message';
  }

  // Role-based overrides
  if (role === 'section-bridge') return 'full-message';

  // Table/code slides → table-grid
  if (contentType === 'content-table' && table && table.rows.length >= 4) {
    return 'table-grid';
  }
  if (contentType === 'code-block') {
    return 'full-message';
  }

  // Before/after or two-column → asymmetric or two-split
  if (contentType === 'before-after') {
    return 'full-message';
  }
  if (contentType === 'two-column') {
    return 'two-split';
  }

  // Quote → full-message
  if (contentType === 'quote') {
    return 'full-message';
  }

  // Diagram cards → three-equal or asymmetric based on count
  if (contentType === 'diagram-cards' && diagram?.elements) {
    const items = diagram.elements as unknown as unknown[];
    if (Array.isArray(items)) {
      if (items.length === 3) return 'three-equal';
      if (items.length === 2) return 'two-split';
      if (items.length >= 4) return 'table-grid';
    }
  }

  // Table with 2-3 rows → comparison cards
  if (table) {
    if (table.rows.length === 3) return 'three-equal';
    if (table.rows.length === 2) return 'two-split';
    if (table.rows.length >= 4) return 'table-grid';
  }

  // Bullets only — decide by bullet count
  if (bullets && bullets.length > 0) {
    if (bullets.length <= 2) return 'full-message';
    if (bullets.length === 3) return 'hero-sub';
    return 'hero-sub';
  }

  // Fallback
  return 'full-message';
}

/**
 * Extract cards from table rows.
 */
function tableToCards(slide: ContentSlide, preset?: StylePreset): CardDef[] {
  if (!slide.table) return [];
  const rawCards = slide.table.rows.map(row => ({
    title: row[0] || '',
    body: row.slice(1).join('\n'),
  }));
  const colors = assignCardColors(rawCards, preset);
  return rawCards.map((card, i) => ({
    ...card,
    fill: colors[i].fill,
    titleColor: colors[i].titleColor,
    accentColor: colors[i].accent,
  }));
}

/**
 * Split bullets into groups for sub-cards.
 * If bullets contain bold prefixes (e.g., "**문제**: ..."), split by those.
 * Otherwise, split evenly into 2-3 groups.
 */
function bulletsToSubCards(bullets: string[], count: number, preset?: StylePreset): CardDef[] {
  const rawCards: Array<{ title: string; body: string }> = [];
  const perCard = Math.ceil(bullets.length / count);

  for (let i = 0; i < count; i++) {
    const chunk = bullets.slice(i * perCard, (i + 1) * perCard);
    const firstBullet = chunk[0] || '';
    const boldMatch = firstBullet.match(/^\*\*(.+?)\*\*[：:]?\s*(.*)/);

    if (boldMatch) {
      rawCards.push({
        title: boldMatch[1],
        body: stripBold(boldMatch[2] + (chunk.length > 1 ? '\n' + chunk.slice(1).join('\n') : '')),
      });
    } else {
      rawCards.push({
        title: stripBold(chunk[0]?.slice(0, 50) || ''),
        body: chunk.length > 1 ? chunk.slice(1).map(stripBold).join('\n') : '',
      });
    }
  }

  const colors = assignCardColors(rawCards, preset);
  return rawCards.map((card, i) => ({
    ...card,
    fill: colors[i].fill,
    titleColor: colors[i].titleColor,
    accentColor: colors[i].accent,
  }));
}

/**
 * Strip markdown bold markers from text.
 */
function stripBold(text: string): string {
  return text.replace(/\*\*/g, '');
}

// ── Layout Builders ──

function buildHeroSub(slide: ContentSlide, preset?: StylePreset): HeroSubLayout {
  const T = resolveTokens(preset || getPreset(DEFAULT_PRESET));
  const bullets = slide.bullets || [];

  // First bullet (or first 2) → hero text, rest → sub cards
  const heroText = stripBold(bullets[0] || slide.heading);
  const remaining = bullets.slice(1);
  const subCount = Math.min(remaining.length, 3) || 2;
  const subCards = remaining.length > 0
    ? bulletsToSubCards(remaining, Math.min(subCount, 2), preset)
    : [
      { title: '', body: '', fill: T.cardFills.red },
      { title: '', body: '', fill: T.cardFills.darkGreen },
    ];

  return {
    type: 'hero-sub',
    title: slide.heading,
    hero: {
      text: heroText,
      lineHeight: 64,
    },
    accentBar: true,
    subCards,
  };
}

function buildThreeEqual(slide: ContentSlide, preset?: StylePreset): ThreeEqualLayout {
  const T = resolveTokens(preset || getPreset(DEFAULT_PRESET));
  let cards: CardDef[];

  if (slide.table && slide.table.rows.length >= 3) {
    cards = tableToCards(slide, preset).slice(0, 3);
  } else if (slide.bullets && slide.bullets.length >= 3) {
    cards = bulletsToSubCards(slide.bullets, 3, preset);
  } else {
    cards = [
      { title: '', body: '', fill: T.cardFills.blue },
      { title: '', body: '', fill: T.cardFills.purple },
      { title: '', body: '', fill: T.cardFills.red },
    ];
  }

  // Ensure exactly 3
  while (cards.length < 3) cards.push({ title: '', body: '', fill: T.cardFills.neutral });

  return {
    type: 'three-equal',
    title: slide.heading,
    cards: cards.slice(0, 3) as [CardDef, CardDef, CardDef],
  };
}

function buildAsymmetric(slide: ContentSlide, preset?: StylePreset): AsymmetricLayout {
  const cards = slide.table ? tableToCards(slide, preset) : [];
  const bullets = slide.bullets || [];

  // If we have cards from table, first card becomes hero
  if (cards.length >= 2) {
    const heroCard = cards[0];
    const smallCards = cards.slice(1);
    const heroSemantic = getCardFill(heroCard.title, heroCard.body, preset);
    const smallColors = assignCardColors(smallCards.map(c => ({ title: c.title, body: c.body })), preset);
    return {
      type: 'asymmetric',
      title: slide.heading,
      heroSide: 'right',
      heroCard: {
        title: heroCard.title,
        fill: heroSemantic,
        accentColor: getCardAccent(heroCard.title, heroCard.body, preset),
        items: heroCard.body?.split('\n').filter(Boolean) || [],
      },
      smallCards: smallCards.map((c, i) => ({
        ...c,
        fill: smallColors[i].fill,
        titleColor: smallColors[i].titleColor,
      })),
    };
  }

  // Bullets-based: first bullet = hero, rest = small cards
  const heroBullet = stripBold(bullets[0] || '');
  const smallBullets = bullets.slice(1, 4).map(b => ({ title: stripBold(b).slice(0, 40), body: stripBold(b) }));
  const smallColors = assignCardColors(smallBullets, preset);
  return {
    type: 'asymmetric',
    title: slide.heading,
    heroSide: 'right',
    heroCard: {
      title: heroBullet,
      fill: getCardFill(heroBullet, undefined, preset),
      accentColor: getCardAccent(heroBullet, undefined, preset),
      items: bullets.slice(1).map(stripBold),
    },
    smallCards: smallBullets.map((b, i) => ({
      title: b.title,
      body: b.body,
      fill: smallColors[i].fill,
      titleColor: smallColors[i].titleColor,
    })),
  };
}

function buildTwoSplit(slide: ContentSlide, preset?: StylePreset): TwoSplitLayout {
  const T = resolveTokens(preset || getPreset(DEFAULT_PRESET));
  const cards = slide.table ? tableToCards(slide, preset) : [];
  const bullets = slide.bullets || [];

  if (cards.length >= 2) {
    return {
      type: 'two-split',
      title: slide.heading,
      mode: 'equal',
      left: {
        title: cards[0].title,
        body: cards[0].body,
        fill: cards[0].fill ?? T.cardFills.blue,
      },
      right: {
        title: cards[1].title,
        body: cards[1].body,
        fill: cards[1].fill ?? T.cardFills.red,
      },
    };
  }

  // Split bullets in half
  const mid = Math.ceil(bullets.length / 2);
  const leftTitle = stripBold(bullets[0] || '');
  const leftBody = bullets.slice(0, mid).map(stripBold).join('\n');
  const rightTitle = stripBold(bullets[mid] || '');
  const rightBody = bullets.slice(mid).map(stripBold).join('\n');
  const splitColors = assignCardColors([
    { title: leftTitle, body: leftBody },
    { title: rightTitle, body: rightBody },
  ], preset);
  return {
    type: 'two-split',
    title: slide.heading,
    mode: 'equal',
    left: {
      title: leftTitle,
      body: leftBody,
      fill: splitColors[0].fill,
    },
    right: {
      title: rightTitle,
      body: rightBody,
      fill: splitColors[1].fill,
    },
  };
}

function buildTableGrid(slide: ContentSlide): TableGridLayout {
  if (slide.table) {
    return {
      type: 'table-grid',
      title: slide.heading,
      columns: 2,
      items: slide.table.rows.map((row, i) => ({
        num: String(i + 1),
        name: (row[0] || '').replace(/^\d+[.\)]\s*/, ''),
        description: row.slice(1).join(' | '),
      })),
    };
  }

  // Fallback: bullets as grid items
  return {
    type: 'table-grid',
    title: slide.heading,
    columns: 2,
    items: (slide.bullets || []).map((b, i) => {
      const stripped = stripBold(b);
      const parts = stripped.split(/[：:—]\s*/);
      return {
        num: String(i + 1),
        name: (parts[0] || stripped).replace(/^\d+[.\)]\s*/, ''),
        description: parts.slice(1).join(' ') || '',
      };
    }),
  };
}

function buildFullMessage(slide: ContentSlide): FullMessageLayout {
  const bullets = slide.bullets || [];
  const quoteText = slide.quote?.text;
  const codeText = slide.codeBlock?.code;

  // Before-after pattern
  if (slide.contentType === 'before-after' && bullets.length >= 2) {
    return {
      type: 'full-message',
      title: slide.heading,
      hero: {
        beforeText: stripBold(bullets[0]),
        mainText: stripBold(bullets[1]),
        detail: bullets.slice(2).map(stripBold).join('\n') || undefined,
      },
      accentBar: true,
    };
  }

  // Quote
  if (quoteText) {
    return {
      type: 'full-message',
      title: slide.heading,
      hero: {
        mainText: quoteText,
        mainSize: 56,
        detail: slide.quote?.attribution,
      },
    };
  }

  // Code block — let dynamicFontSize auto-calculate based on content length
  if (codeText) {
    return {
      type: 'full-message',
      title: slide.heading,
      hero: {
        mainText: codeText,
      },
    };
  }

  // Simple bullet message
  const mainText = bullets.length > 0
    ? bullets.map(stripBold).join('\n')
    : slide.subtitle || slide.heading;

  return {
    type: 'full-message',
    title: slide.heading,
    hero: {
      mainText,
      detail: slide.subtitle,
    },
    accentBar: true,
  };
}

// ── New Layout Builders (L7/L8/L9) ──

function buildTimeline(slide: ContentSlide): TimelineLayout {
  const steps = (slide.bullets || []).map((b, i) => {
    const match = b.match(/^\*\*(.+?)\*\*[:：]\s*(.+)/);
    return {
      label: match ? match[1] : `Step ${i + 1}`,
      description: match ? match[2] : b.replace(/^\*\*.*?\*\*[:：]\s*/, ''),
      highlight: false,
    };
  });
  return { type: 'timeline', title: slide.heading, steps };
}

function buildKpiHighlight(slide: ContentSlide): KpiHighlightLayout {
  const metrics = (slide.bullets || []).map(b => {
    // Extract number and label: "매출 47% 증가" → value="47%", label="매출 증가"
    const numMatch = b.match(/(\d+[%x배]|\d+\.\d+[x배]?|₩[\d,.]+[억만]?|\$[\d,.]+[KMB]?)/);
    const value = numMatch ? numMatch[1] : '';
    const label = b.replace(numMatch?.[0] || '', '').replace(/\*\*/g, '').trim();
    const trend = /증가|향상|성장|up/i.test(b) ? 'up' as const
      : /감소|절감|하락|down/i.test(b) ? 'down' as const
      : 'neutral' as const;
    return { value, label, trend };
  });
  return { type: 'kpi-highlight', title: slide.heading, metrics };
}

function buildQuoteStatement(slide: ContentSlide): QuoteStatementLayout {
  if (slide.quote) {
    return {
      type: 'quote-statement',
      title: slide.heading,
      quote: slide.quote.text,
      attribution: slide.quote.attribution,
      style: 'quote',
    };
  }
  // Single short bullet as statement
  const text = slide.bullets?.[0] || slide.heading;
  return {
    type: 'quote-statement',
    title: slide.heading !== text ? slide.heading : undefined,
    quote: stripBold(text),
    style: 'statement',
  };
}

// ── Layout Rhythm ──

/** Max consecutive slides of the same layout type before forcing a switch. */
const MAX_CONSECUTIVE = 2;

/**
 * Fallback alternatives for each layout type, ordered by visual affinity.
 * When a layout has appeared MAX_CONSECUTIVE times in a row, pick the first
 * alternative that differs from the streak.
 */
const ALTERNATIVES: Record<LayoutType, LayoutType[]> = {
  'two-split':        ['three-equal', 'hero-sub', 'asymmetric'],
  'three-equal':      ['asymmetric', 'two-split', 'hero-sub'],
  'hero-sub':         ['full-message', 'three-equal', 'asymmetric'],
  'full-message':     ['hero-sub', 'two-split', 'three-equal'],
  'table-grid':       ['three-equal', 'two-split', 'asymmetric'],
  'asymmetric':       ['three-equal', 'two-split', 'hero-sub'],
  'timeline':         ['hero-sub', 'three-equal', 'full-message'],
  'kpi-highlight':    ['full-message', 'three-equal', 'two-split'],
  'quote-statement':  ['full-message', 'hero-sub', 'two-split'],
};

/**
 * Apply rhythm rule: if `detected` matches the last MAX_CONSECUTIVE entries
 * in prevLayouts, return a suitable alternative instead.
 */
function applyLayoutRhythm(detected: LayoutType, prevLayouts: LayoutType[]): LayoutType {
  if (prevLayouts.length < MAX_CONSECUTIVE) return detected;

  // Check if the last MAX_CONSECUTIVE layouts are all the same as detected
  const tail = prevLayouts.slice(-MAX_CONSECUTIVE);
  const allSame = tail.every(t => t === detected);
  if (!allSame) return detected;

  // Pick the first alternative that isn't the same as detected
  const alts = ALTERNATIVES[detected] || [];
  for (const alt of alts) {
    if (alt !== detected) return alt;
  }
  return detected; // should never reach here
}

// ── Public API ──

/**
 * Convert a ContentSlide into a Bento SlideLayout.
 * Uses content analysis to pick the best layout type.
 *
 * @param slide       The parsed content slide
 * @param prevLayouts Optional array of previously assigned layout types (for rhythm control).
 *                    When provided, prevents the same layout from appearing more than
 *                    MAX_CONSECUTIVE times in a row.
 */
export function contentToBentoLayout(slide: ContentSlide, prevLayouts?: LayoutType[], preset?: StylePreset): SlideLayout {
  let layoutType = detectLayoutType(slide);

  // Apply rhythm rule if history is provided
  if (prevLayouts && prevLayouts.length > 0) {
    layoutType = applyLayoutRhythm(layoutType, prevLayouts);
  }

  return buildLayout(layoutType, slide, preset);
}

/**
 * Build a SlideLayout of the given type from a ContentSlide.
 */
function buildLayout(layoutType: LayoutType, slide: ContentSlide, preset?: StylePreset): SlideLayout {
  switch (layoutType) {
    case 'hero-sub':
      return buildHeroSub(slide, preset);
    case 'three-equal':
      return buildThreeEqual(slide, preset);
    case 'asymmetric':
      return buildAsymmetric(slide, preset);
    case 'two-split':
      return buildTwoSplit(slide, preset);
    case 'table-grid':
      return buildTableGrid(slide);
    case 'full-message':
      return buildFullMessage(slide);
    case 'timeline':
      return buildTimeline(slide);
    case 'kpi-highlight':
      return buildKpiHighlight(slide);
    case 'quote-statement':
      return buildQuoteStatement(slide);
    default:
      return buildFullMessage(slide);
  }
}

export { detectLayoutType };
