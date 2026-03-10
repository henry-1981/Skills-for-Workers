/**
 * Geometry Engine — Pure coordinate calculation for Bento layouts
 *
 * Extracts spatial computation from BentoGenerator into a standalone,
 * renderer-agnostic module. Produces ResolvedSlideGeometry with absolute
 * pixel coordinates (1920×1080 canvas). Each Renderer converts to its
 * own unit system (e.g., canvas px, PPTX inches).
 *
 * Decorative elements (quotation marks, accent bars, number circles)
 * are NOT included — each Renderer implements those independently.
 */

import type { RGB } from '../themes/types.js';
import type { NarrativeContext } from '../parser/types.js';
import type { ResolvedTokens } from './bento-layouts.js';
import type {
  SlideLayout,
  HeroSubLayout,
  ThreeEqualLayout,
  AsymmetricLayout,
  TwoSplitLayout,
  TableGridLayout,
  FullMessageLayout,
  TimelineLayout,
  KpiHighlightLayout,
  QuoteStatementLayout,
  CardDef,
} from './bento-layouts.js';
import { getContrastText } from './bento-layouts.js';

// ── Public Types ──

export interface ResolvedElement {
  type: 'card' | 'text' | 'ellipse';
  // Absolute coordinates in px (1920×1080 canvas)
  x: number;
  y: number;
  w: number;
  h: number;
  // Style (card/ellipse)
  fill?: RGB;
  radius?: number;
  shadow?: { color: RGB; offset: { x: number; y: number }; blur: number; opacity: number };
  border?: { color: RGB; width: number };
  // Text properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  fontType?: 'display' | 'body';
  color?: RGB;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  lineHeight?: number; // ratio (1.4 = 140%)
  // Parent card reference (for nested text elements)
  parentId?: string;
  // Element id for grouping
  id?: string;
}

export interface ResolvedSlideGeometry {
  background: { color: RGB; gradientEnd?: RGB };
  title: ResolvedElement;
  elements: ResolvedElement[];
  decorations?: ResolvedElement[];
}

// ── Static Helpers (extracted from BentoGenerator) ──

export function estimateTextHeight(text: string, fontSize: number, containerWidth: number): number {
  const charsPerLine = Math.floor(containerWidth / (fontSize * 0.55));
  const lineCount = text.split('\n').reduce((sum, line) => {
    return sum + Math.max(1, Math.ceil(line.length / charsPerLine));
  }, 0);
  return lineCount * fontSize * 1.4;
}

export function dynamicFontSize(
  text: string,
  containerW: number,
  containerH: number,
  minSize: number,
  maxSize: number,
  targetFillRatio = 0.6,
): number {
  const targetH = containerH * targetFillRatio;
  for (let size = maxSize; size >= minSize; size -= 2) {
    const h = estimateTextHeight(text, size, containerW - 120);
    if (h <= targetH) return size;
  }
  return minSize;
}

export function verticalCenter(
  cardH: number,
  contentH: number,
  bias: 'center' | 'upper-third' = 'center',
): number {
  if (bias === 'upper-third') return Math.max(Math.floor(cardH * 0.2), 40);
  return Math.max(Math.floor((cardH - contentH) / 2), 40);
}

function estimateLineCount(text: string, fontSize: number, containerWidth: number): number {
  const charsPerLine = Math.floor(containerWidth / (fontSize * 0.55));
  return text.split('\n').reduce((sum, line) => {
    return sum + Math.max(1, Math.ceil(line.length / charsPerLine));
  }, 0);
}

const GRID_Y = 155;

// ── Main Entry Point ──

/**
 * Compute absolute-pixel geometry for a Bento layout.
 * Pure function: same input always produces same output.
 */
export function resolveGeometry(
  layout: SlideLayout,
  tokens: ResolvedTokens,
  narrative?: NarrativeContext,
): ResolvedSlideGeometry {
  let geometry: ResolvedSlideGeometry;

  switch (layout.type) {
    case 'hero-sub':
      geometry = resolveHeroSub(layout, tokens); break;
    case 'three-equal':
      geometry = resolveThreeEqual(layout, tokens); break;
    case 'asymmetric':
      geometry = resolveAsymmetric(layout, tokens); break;
    case 'two-split':
      geometry = resolveTwoSplit(layout, tokens); break;
    case 'table-grid':
      geometry = resolveTableGrid(layout, tokens); break;
    case 'full-message':
      geometry = resolveFullMessage(layout, tokens); break;
    case 'timeline':
      geometry = resolveTimeline(layout, tokens); break;
    case 'kpi-highlight':
      geometry = resolveKpiHighlight(layout, tokens); break;
    case 'quote-statement':
      geometry = resolveQuoteStatement(layout, tokens); break;
    default:
      geometry = resolveFullMessage({ type: 'full-message', title: '', hero: { mainText: '' } }, tokens); break;
  }

  // Add progress bar if narrative context has section info
  if (narrative?.sectionSlideCount && narrative.sectionSlideCount > 1 && narrative.positionInSection !== undefined) {
    addProgressBar(geometry, narrative, tokens);
  }

  // Add shadows to cards in light mode
  if (tokens.mode === 'light') {
    addLightModeShadows(geometry);
  }

  return geometry;
}

// ── Title Element (shared across all layouts) ──

function makeTitle(title: string, T: ResolvedTokens): ResolvedElement {
  // Title sits on slide background — pick color with contrast against bg
  const titleColor = getContrastText(T.bg, { r: 1, g: 1, b: 1 }, T.colors.offWhite);
  return {
    type: 'text',
    id: 'title',
    x: T.margin.left,
    y: T.margin.top,
    w: T.contentWidth,
    h: 80,
    text: title,
    fontSize: T.font.title.size,
    fontFamily: T.fontFamily.display,
    fontStyle: T.font.title.style,
    fontType: 'display',
    color: titleColor,
    bold: false,
    align: 'left',
    valign: 'top',
  };
}

// ── Progress Bar ──

function addProgressBar(
  geometry: ResolvedSlideGeometry,
  narrative: NarrativeContext,
  T: ResolvedTokens,
): void {
  const progress = (narrative.positionInSection! + 1) / narrative.sectionSlideCount!;
  const barWidth = T.canvas.width * progress;

  if (!geometry.decorations) geometry.decorations = [];

  // Background bar (full width, dimmed)
  geometry.decorations.push({
    type: 'card',
    id: 'progressBg',
    x: 0, y: 0,
    w: T.canvas.width, h: 4,
    fill: { r: T.colors.dimGray.r * 0.3, g: T.colors.dimGray.g * 0.3, b: T.colors.dimGray.b * 0.3 },
  });

  // Progress bar (partial width, accent color)
  geometry.decorations.push({
    type: 'card',
    id: 'progressFill',
    x: 0, y: 0,
    w: barWidth, h: 4,
    fill: T.colors.cyan,
  });
}

// ── Light Mode Shadows ──

function addLightModeShadows(geometry: ResolvedSlideGeometry): void {
  for (const el of geometry.elements) {
    if (el.type === 'card' && !el.shadow) {
      el.shadow = {
        color: { r: 0, g: 0, b: 0 },
        offset: { x: 0, y: 4 },
        blur: 16,
        opacity: 0.08,
      };
    }
  }
}

// ── Layout Resolvers ──

function resolveHeroSub(layout: HeroSubLayout, T: ResolvedTokens): ResolvedSlideGeometry {
  const elements: ResolvedElement[] = [];
  const subCount = layout.subCards.length;
  const subW = Math.floor((T.contentWidth - T.gutter * (subCount - 1)) / subCount);
  const heroH = 320;
  const subY = GRID_Y + heroH + T.gutter;
  const subH = T.canvas.height - subY - T.margin.bottom;
  const heroPadX = 60;
  const heroTextW = T.contentWidth - heroPadX * 2;

  // Hero card
  elements.push({
    type: 'card',
    id: 'hero',
    x: T.margin.left,
    y: GRID_Y,
    w: T.contentWidth,
    h: heroH,
    fill: T.cardFills.neutral,
    radius: T.radius.hero,
  });

  // Hero text
  const heroTextContent = layout.hero.text;
  const heroFontSize = dynamicFontSize(heroTextContent, T.contentWidth, heroH, 32, 56);
  const heroTextH = estimateTextHeight(heroTextContent, heroFontSize, heroTextW);
  const heroTextY = verticalCenter(heroH, heroTextH, 'upper-third');
  const lh = layout.hero.lineHeight || Math.ceil(heroFontSize * 1.45);
  const heroTextColor = getContrastText(T.cardFills.neutral, T.colors.offWhite, T.colors.textOnCard);

  elements.push({
    type: 'text',
    id: 'heroText',
    parentId: 'hero',
    x: heroPadX,
    y: heroTextY,
    w: heroTextW,
    h: Math.ceil(heroFontSize * 1.3),
    text: heroTextContent,
    fontSize: heroFontSize,
    fontFamily: T.fontFamily.display,
    fontStyle: T.font.title.style,
    fontType: 'display',
    color: heroTextColor,
    bold: true,
    lineHeight: lh / heroFontSize,
  });

  // Sub cards
  const subPadX = 48;
  const subTextW = subW - subPadX * 2;

  layout.subCards.forEach((card, i) => {
    const x = T.margin.left + i * (subW + T.gutter);
    const fill = card.fill || (i === 0 ? T.cardFills.red : T.cardFills.darkGreen);
    const cardId = `sub${i}`;

    elements.push({
      type: 'card',
      id: cardId,
      x,
      y: subY,
      w: subW,
      h: subH,
      fill,
      radius: T.radius.cardSmall,
    });

    const bodyText = card.body || card.bodyLines?.join('\n') || '';
    const hasCap = !!card.caption;
    const hasBody = !!bodyText;

    const titleMaxSize = hasBody ? 38 : 48;
    const titleSize = card.title ? dynamicFontSize(card.title, subW, subH * 0.3, 30, titleMaxSize) : 0;
    const titleH = card.title ? estimateTextHeight(card.title, titleSize, subTextW) : 0;
    const captionH = hasCap ? 36 : 0;
    const bodySize = hasBody ? dynamicFontSize(bodyText, subW, subH * 0.5, 24, 36) : 0;
    const bodyH = hasBody ? estimateTextHeight(bodyText, bodySize, subTextW) : 0;

    const totalContentH = captionH + titleH + bodyH + (hasCap ? 16 : 0) + (hasBody ? 16 : 0);

    let cursorY: number;
    if (totalContentH < subH * 0.5) {
      cursorY = verticalCenter(subH, totalContentH, 'center');
    } else {
      cursorY = 44;
    }

    if (hasCap) {
      elements.push({
        type: 'text',
        id: `${cardId}_cap`,
        parentId: cardId,
        x: subPadX,
        y: cursorY,
        w: subTextW,
        h: Math.ceil(T.font.caption.size * 1.3),
        text: card.caption!,
        fontSize: T.font.caption.size,
        fontFamily: T.fontFamily.body,
        fontStyle: T.font.caption.style,
        fontType: 'body',
        color: T.colors.dimGray,
      });
      cursorY += captionH + 16;
    }

    if (card.title) {
      const txtColor = card.titleColor || getContrastText(fill, T.colors.offWhite, T.colors.textOnCard);
      elements.push({
        type: 'text',
        id: `${cardId}_title`,
        parentId: cardId,
        x: subPadX,
        y: cursorY,
        w: subTextW,
        h: Math.ceil(titleSize * 1.3),
        text: card.title,
        fontSize: titleSize,
        fontFamily: T.fontFamily.display,
        fontStyle: T.font.title.style,
        fontType: 'display',
        color: txtColor,
        bold: true,
        lineHeight: (titleSize * 1.4) / titleSize,
      });
      cursorY += titleH + 16;
    }

    if (hasBody) {
      const bodyColor = getContrastText(fill, T.colors.offWhite, T.colors.textOnCard);
      elements.push({
        type: 'text',
        id: `${cardId}_body`,
        parentId: cardId,
        x: subPadX,
        y: cursorY,
        w: subTextW,
        h: Math.ceil(bodySize * 1.3),
        text: bodyText,
        fontSize: bodySize,
        fontFamily: T.fontFamily.body,
        fontStyle: T.font.body.style,
        fontType: 'body',
        color: bodyColor,
        lineHeight: (bodySize * 1.5) / bodySize,
      });
    }
  });

  return {
    background: { color: T.bg, gradientEnd: T.bgGradientEnd },
    title: makeTitle(layout.title, T),
    elements,
  };
}

function resolveThreeEqual(layout: ThreeEqualLayout, T: ResolvedTokens): ResolvedSlideGeometry {
  const elements: ResolvedElement[] = [];
  const cardW = Math.floor((T.contentWidth - T.gutter * 2) / 3);
  const cardH = 740;
  const cardPadX = 44;
  const cardTextW = cardW - cardPadX * 2;

  layout.cards.forEach((card, i) => {
    const x = T.margin.left + i * (cardW + T.gutter);
    const fill = card.fill || [T.cardFills.purple, T.cardFills.blue, T.cardFills.red][i];
    const cardId = `card${i}`;

    elements.push({
      type: 'card',
      id: cardId,
      x,
      y: GRID_Y,
      w: cardW,
      h: cardH,
      fill,
      radius: T.radius.card,
    });

    // Number circle (decorative — but included as it's structural positioning)
    const numCircleY = 36;
    const numCircleSize = 56;
    elements.push({
      type: 'ellipse',
      id: `${cardId}_numBg`,
      parentId: cardId,
      x: cardPadX,
      y: numCircleY,
      w: numCircleSize,
      h: numCircleSize,
      fill: T.colors.cyan,
    });

    const numLabel = `${i + 1}`;
    const numTextColor = getContrastText(T.colors.cyan, T.colors.offWhite, { r: 0, g: 0, b: 0 });
    elements.push({
      type: 'text',
      id: `${cardId}_numTxt`,
      parentId: cardId,
      x: cardPadX,
      y: numCircleY,
      w: numCircleSize,
      h: numCircleSize,
      text: numLabel,
      fontSize: 28,
      fontFamily: T.fontFamily.display,
      fontStyle: T.font.title.style,
      fontType: 'display',
      color: numTextColor,
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    const bodyText = card.body || card.bodyLines?.join('\n') || '';
    const hasBody = !!bodyText;

    const titleMaxSize = hasBody ? 44 : 56;
    const titleSize = dynamicFontSize(card.title, cardW, cardH * 0.2, 32, titleMaxSize);
    const titleH = estimateTextHeight(card.title, titleSize, cardTextW);

    const bodyAvailH = cardH - 112 - titleH - 40 - 80;
    const bodySize = hasBody ? dynamicFontSize(bodyText, cardW, bodyAvailH, 28, 40) : 0;

    const contentAreaTop = 112;
    const contentAreaH = cardH - contentAreaTop - 40;
    let titleY: number;
    if (!hasBody && titleH < contentAreaH * 0.4) {
      titleY = contentAreaTop + verticalCenter(contentAreaH, titleH, 'center') - 40;
    } else {
      titleY = 112;
    }

    const titleColor = card.titleColor || getContrastText(fill, T.colors.offWhite, T.colors.textOnCard);
    elements.push({
      type: 'text',
      id: `${cardId}_title`,
      parentId: cardId,
      x: cardPadX,
      y: titleY,
      w: cardTextW,
      h: Math.ceil(titleSize * 1.3),
      text: card.title,
      fontSize: titleSize,
      fontFamily: T.fontFamily.display,
      fontStyle: T.font.title.style,
      fontType: 'display',
      color: titleColor,
      bold: true,
    });

    if (hasBody) {
      const accentY = titleY + titleH + 12;
      const bodyY = accentY + 20;
      const bodyColor = getContrastText(fill, T.colors.offWhite, T.colors.textOnCard);
      elements.push({
        type: 'text',
        id: `${cardId}_body`,
        parentId: cardId,
        x: cardPadX,
        y: bodyY,
        w: cardTextW,
        h: Math.ceil(bodySize * 1.3),
        text: bodyText,
        fontSize: bodySize,
        fontFamily: T.fontFamily.body,
        fontStyle: T.font.body.style,
        fontType: 'body',
        color: bodyColor,
        lineHeight: (bodySize * 1.5) / bodySize,
      });
    }
  });

  return {
    background: { color: T.bg, gradientEnd: T.bgGradientEnd },
    title: makeTitle(layout.title, T),
    elements,
  };
}

function resolveAsymmetric(layout: AsymmetricLayout, T: ResolvedTokens): ResolvedSlideGeometry {
  const elements: ResolvedElement[] = [];
  const ratio = layout.heroRatio || 0.67;
  const heroW = Math.floor(T.contentWidth * ratio - T.gutter / 2);
  const smallW = T.contentWidth - heroW - T.gutter;
  const gridH = 820;
  const heroPadX = 60;
  const heroTextW = heroW - heroPadX * 2;

  const heroX = layout.heroSide === 'left' ? T.margin.left : T.margin.left + smallW + T.gutter;
  const smallX = layout.heroSide === 'left' ? T.margin.left + heroW + T.gutter : T.margin.left;

  // Hero card
  const hc = layout.heroCard;
  const heroFill = hc.fill || T.cardFills.darkRed;

  elements.push({
    type: 'card',
    id: 'heroCard',
    x: heroX,
    y: GRID_Y,
    w: heroW,
    h: gridH,
    fill: heroFill,
    radius: T.radius.card,
  });

  // Hero title
  const heroTitleSize = dynamicFontSize(hc.title, heroW, gridH * 0.15, 36, T.font.cardHeader.size);
  const heroTitleH = estimateTextHeight(hc.title, heroTitleSize, heroTextW);
  const heroTitleColor = hc.titleColor || getContrastText(heroFill, T.colors.offWhite, T.colors.textOnCard);

  elements.push({
    type: 'text',
    id: 'hTitle',
    parentId: 'heroCard',
    x: heroPadX,
    y: 60,
    w: heroTextW,
    h: Math.ceil(heroTitleSize * 1.3),
    text: hc.title,
    fontSize: heroTitleSize,
    fontFamily: T.fontFamily.display,
    fontStyle: T.font.title.style,
    fontType: 'display',
    color: heroTitleColor,
    bold: true,
  });

  let heroContentY = 60 + heroTitleH + 20;

  if (hc.subtitle) {
    elements.push({
      type: 'text',
      id: 'hSub',
      parentId: 'heroCard',
      x: heroPadX,
      y: heroContentY,
      w: heroTextW,
      h: Math.ceil(T.font.detail.size * 1.3),
      text: hc.subtitle,
      fontSize: T.font.detail.size,
      fontFamily: T.fontFamily.body,
      fontStyle: T.font.detail.style,
      fontType: 'body',
      color: T.colors.dimGray,
    });
    heroContentY += 50;
  }

  // Hero items
  const itemsAvailH = gridH - heroContentY - 40;
  const totalItemText = hc.items.join('\n');
  const itemSize = hc.itemSize || dynamicFontSize(totalItemText, heroW, itemsAvailH, 28, 44);
  const itemLineH = estimateTextHeight('X', itemSize, heroTextW);
  const totalItemsH = hc.items.length * (itemLineH + 16);

  let itemY: number;
  let itemSpacing: number;
  if (totalItemsH < itemsAvailH * 0.5 && hc.items.length <= 3) {
    itemY = heroContentY + verticalCenter(itemsAvailH, totalItemsH, 'center') - 20;
    itemSpacing = itemLineH + 24;
  } else {
    itemY = heroContentY + 20;
    itemSpacing = Math.floor((itemsAvailH - 20) / Math.max(hc.items.length, 1));
  }

  const heroBodyColor = getContrastText(heroFill, T.colors.offWhite, T.colors.textOnCard);
  hc.items.forEach((item, i) => {
    elements.push({
      type: 'text',
      id: `hItem${i}`,
      parentId: 'heroCard',
      x: heroPadX,
      y: itemY,
      w: heroTextW,
      h: Math.ceil(itemSize * 1.3),
      text: item,
      fontSize: itemSize,
      fontFamily: T.fontFamily.display,
      fontStyle: T.font.title.style,
      fontType: 'display',
      color: heroBodyColor,
      bold: true,
    });
    itemY += itemSpacing;
  });

  // Small cards
  const smallCardH = Math.floor((gridH - T.gutter * (layout.smallCards.length - 1)) / layout.smallCards.length);
  const smPadX = 44;
  const smTextW = smallW - smPadX * 2;

  layout.smallCards.forEach((card, i) => {
    const y = GRID_Y + i * (smallCardH + T.gutter);
    const fill = card.fill || T.cardFills.blue;
    const cardId = `sm${i}`;

    elements.push({
      type: 'card',
      id: cardId,
      x: smallX,
      y,
      w: smallW,
      h: smallCardH,
      fill,
      radius: T.radius.cardSmall,
    });

    const bodyText = card.body || card.bodyLines?.join('\n') || card.title;
    const hasCap = i === 0 && !!card.caption;
    const capH = hasCap ? 36 : 0;

    const bodySize = dynamicFontSize(bodyText, smallW, smallCardH - capH - 80, 26, T.font.body.size);
    const bodyH = estimateTextHeight(bodyText, bodySize, smTextW);
    const totalH = capH + bodyH;

    let cursorY: number;
    if (totalH < smallCardH * 0.4) {
      cursorY = verticalCenter(smallCardH, totalH, 'center');
    } else {
      cursorY = 40;
    }

    if (hasCap) {
      elements.push({
        type: 'text',
        id: `${cardId}_cap`,
        parentId: cardId,
        x: smPadX,
        y: cursorY,
        w: smTextW,
        h: Math.ceil(T.font.caption.size * 1.3),
        text: card.caption!,
        fontSize: T.font.caption.size,
        fontFamily: T.fontFamily.body,
        fontStyle: T.font.caption.style,
        fontType: 'body',
        color: T.colors.dimGray,
      });
      cursorY += capH + 12;
    }

    const smTextColor = card.titleColor || getContrastText(fill, T.colors.offWhite, T.colors.textOnCard);
    elements.push({
      type: 'text',
      id: `${cardId}_body`,
      parentId: cardId,
      x: smPadX,
      y: cursorY,
      w: smTextW,
      h: Math.ceil(bodySize * 1.3),
      text: bodyText,
      fontSize: bodySize,
      fontFamily: T.fontFamily.display,
      fontStyle: T.font.title.style,
      fontType: 'display',
      color: smTextColor,
      bold: true,
    });
  });

  return {
    background: { color: T.bg, gradientEnd: T.bgGradientEnd },
    title: makeTitle(layout.title, T),
    elements,
  };
}

function resolveTwoSplit(layout: TwoSplitLayout, T: ResolvedTokens): ResolvedSlideGeometry {
  const elements: ResolvedElement[] = [];
  const maxGridH = 820;
  const minGridH = 400;

  if (layout.mode === 'equal') {
    const halfW = Math.floor((T.contentWidth - T.gutter) / 2);
    const textW = halfW - 120;
    const sides = [layout.left, layout.right as CardDef];

    // Compute dynamic grid height
    let maxContentH = 0;
    sides.forEach((card) => {
      const bodyText = card.body || card.bodyLines?.join('\n') || '';
      const titleH = estimateTextHeight(card.title, T.font.cardHeader.size, textW);
      const captionH = card.caption ? 50 : 0;
      const bodyH = bodyText ? estimateTextHeight(bodyText, T.font.body.size, textW) : 0;
      const totalH = titleH + captionH + bodyH + 160;
      maxContentH = Math.max(maxContentH, totalH);
    });
    const gridH = Math.max(minGridH, Math.min(maxGridH, maxContentH));

    sides.forEach((card, i) => {
      const x = T.margin.left + i * (halfW + T.gutter);
      const fill = card.fill || (i === 0 ? T.cardFills.green : T.cardFills.red);
      const cardId = `col${i}`;

      elements.push({
        type: 'card',
        id: cardId,
        x,
        y: GRID_Y,
        w: halfW,
        h: gridH,
        fill,
        radius: T.radius.card,
      });

      const titleSize = dynamicFontSize(card.title, halfW, gridH * 0.25, 36, T.font.cardHeader.size);
      const titleH = estimateTextHeight(card.title, titleSize, textW);

      const bodyText = card.body || card.bodyLines?.join('\n') || '';
      const captionH = card.caption ? 50 : 0;
      const bodySize = bodyText ? dynamicFontSize(bodyText, halfW, gridH * 0.5, 28, 40) : 0;
      const bodyH = bodyText ? estimateTextHeight(bodyText, bodySize, textW) : 0;
      const totalContentH = titleH + captionH + bodyH + 40;

      const startY = bodyText
        ? (totalContentH < gridH * 0.5 ? verticalCenter(gridH, totalContentH, 'center') : 60)
        : verticalCenter(gridH, titleH + captionH, 'center');

      const titleColor = card.titleColor || getContrastText(fill, T.colors.offWhite, T.colors.textOnCard);
      elements.push({
        type: 'text',
        id: `${cardId}_title`,
        parentId: cardId,
        x: 60,
        y: startY,
        w: textW,
        h: Math.ceil(titleSize * 1.3),
        text: card.title,
        fontSize: titleSize,
        fontFamily: T.fontFamily.display,
        fontStyle: T.font.title.style,
        fontType: 'display',
        color: titleColor,
        bold: true,
      });

      let cursorY = startY + titleH + 20;
      if (card.caption) {
        elements.push({
          type: 'text',
          id: `${cardId}_cap`,
          parentId: cardId,
          x: 60,
          y: cursorY,
          w: textW,
          h: Math.ceil(T.font.detail.size * 1.3),
          text: card.caption,
          fontSize: T.font.detail.size,
          fontFamily: T.fontFamily.body,
          fontStyle: T.font.detail.style,
          fontType: 'body',
          color: T.colors.dimGray,
        });
        cursorY += captionH + 16;
      }

      if (bodyText) {
        const bodyColor = getContrastText(fill, T.colors.offWhite, T.colors.textOnCard);
        elements.push({
          type: 'text',
          id: `${cardId}_body`,
          parentId: cardId,
          x: 60,
          y: cursorY,
          w: textW,
          h: Math.ceil(bodySize * 1.3),
          text: bodyText,
          fontSize: bodySize,
          fontFamily: T.fontFamily.body,
          fontStyle: T.font.body.style,
          fontType: 'body',
          color: bodyColor,
          bold: true,
          lineHeight: (bodySize * 1.55) / bodySize,
        });
      }
    });
  } else {
    // stacked: left big + right 2-stack
    const halfW = Math.floor((T.contentWidth - T.gutter) / 2);
    const textW = halfW - 120;
    const rightCards = layout.right as [CardDef, CardDef];
    const gridH = maxGridH;
    const stackH = Math.floor((gridH - T.gutter) / 2);

    // Left big card
    const lc = layout.left;
    const lcFill = lc.fill || T.cardFills.green;
    const lBody = lc.body || lc.bodyLines?.join('\n') || '';
    const lTitleSize = dynamicFontSize(lc.title, halfW, gridH * 0.25, 48, 72);
    const lTitleH = estimateTextHeight(lc.title, lTitleSize, textW);
    const lCaptionH = lc.caption ? 50 : 0;
    const lBodySize = lBody ? dynamicFontSize(lBody, halfW, gridH * 0.5, 28, T.font.body.size) : 0;
    const lBodyH = lBody ? estimateTextHeight(lBody, lBodySize, textW) : 0;
    const lTotalH = lTitleH + lCaptionH + lBodyH + 60;

    elements.push({
      type: 'card',
      id: 'leftCard',
      x: T.margin.left,
      y: GRID_Y,
      w: halfW,
      h: gridH,
      fill: lcFill,
      radius: T.radius.card,
    });

    const lStartY = lBody
      ? (lTotalH < gridH * 0.5 ? verticalCenter(gridH, lTotalH, 'upper-third') : 60)
      : verticalCenter(gridH, lTitleH + lCaptionH, 'center');

    const lTitleColor = lc.titleColor || getContrastText(lcFill, T.colors.cyan, T.colors.textOnCard);
    elements.push({
      type: 'text',
      id: 'l_title',
      parentId: 'leftCard',
      x: 60,
      y: lStartY,
      w: textW,
      h: Math.ceil(lTitleSize * 1.3),
      text: lc.title,
      fontSize: lTitleSize,
      fontFamily: T.fontFamily.display,
      fontStyle: T.font.title.style,
      fontType: 'display',
      color: lTitleColor,
      bold: true,
    });

    let lCursor = lStartY + lTitleH + 24;
    if (lc.caption) {
      elements.push({
        type: 'text',
        id: 'l_cap',
        parentId: 'leftCard',
        x: 60,
        y: lCursor,
        w: textW,
        h: Math.ceil(T.font.detail.size * 1.3),
        text: lc.caption,
        fontSize: T.font.detail.size,
        fontFamily: T.fontFamily.body,
        fontStyle: T.font.detail.style,
        fontType: 'body',
        color: T.colors.dimGray,
      });
      lCursor += lCaptionH + 16;
    }

    if (lBody) {
      const lBodyColor = getContrastText(lcFill, T.colors.offWhite, T.colors.textOnCard);
      elements.push({
        type: 'text',
        id: 'l_body',
        parentId: 'leftCard',
        x: 60,
        y: lCursor,
        w: textW,
        h: Math.ceil(lBodySize * 1.3),
        text: lBody,
        fontSize: lBodySize,
        fontFamily: T.fontFamily.body,
        fontStyle: T.font.body.style,
        fontType: 'body',
        color: lBodyColor,
        bold: true,
        lineHeight: (lBodySize * 1.55) / lBodySize,
      });
    }

    // Right stacked cards
    const rightX = T.margin.left + halfW + T.gutter;
    const rTextW = halfW - 104;

    rightCards.forEach((card, i) => {
      const y = GRID_Y + i * (stackH + T.gutter);
      const rFill = card.fill || (i === 0 ? T.cardFills.yellow : T.cardFills.darkRed);
      const cardId = `r${i}`;

      elements.push({
        type: 'card',
        id: cardId,
        x: rightX,
        y,
        w: halfW,
        h: stackH,
        fill: rFill,
        radius: T.radius.cardSmall,
      });

      const rTitleSize = dynamicFontSize(card.title, halfW, stackH * 0.3, 34, T.font.cardHeader.size);
      const rTitleH = estimateTextHeight(card.title, rTitleSize, rTextW);
      const body = card.body || card.bodyLines?.join('\n') || '';
      const rBodySize = body ? dynamicFontSize(body, halfW, stackH * 0.5, 26, 34) : 0;
      const rBodyH = body ? estimateTextHeight(body, rBodySize, rTextW) : 0;
      const rTotalH = rTitleH + rBodyH + 30;

      const rStartY = body
        ? (rTotalH < stackH * 0.5 ? verticalCenter(stackH, rTotalH, 'center') : 48)
        : verticalCenter(stackH, rTitleH, 'center');

      const rTitleColor = card.titleColor || getContrastText(rFill, T.colors.offWhite, T.colors.textOnCard);
      elements.push({
        type: 'text',
        id: `${cardId}_title`,
        parentId: cardId,
        x: 52,
        y: rStartY,
        w: rTextW,
        h: Math.ceil(rTitleSize * 1.3),
        text: card.title,
        fontSize: rTitleSize,
        fontFamily: T.fontFamily.display,
        fontStyle: T.font.title.style,
        fontType: 'display',
        color: rTitleColor,
        bold: true,
      });

      if (body) {
        const rBodyColor = getContrastText(rFill, T.colors.offWhite, T.colors.textOnCard);
        elements.push({
          type: 'text',
          id: `${cardId}_body`,
          parentId: cardId,
          x: 52,
          y: rStartY + rTitleH + 20,
          w: rTextW,
          h: Math.ceil(rBodySize * 1.3),
          text: body,
          fontSize: rBodySize,
          fontFamily: T.fontFamily.body,
          fontStyle: T.font.body.style,
          fontType: 'body',
          color: rBodyColor,
          bold: true,
          lineHeight: (rBodySize * 1.5) / rBodySize,
        });
      }
    });
  }

  return {
    background: { color: T.bg, gradientEnd: T.bgGradientEnd },
    title: makeTitle(layout.title, T),
    elements,
  };
}

function resolveTableGrid(layout: TableGridLayout, T: ResolvedTokens): ResolvedSlideGeometry {
  const elements: ResolvedElement[] = [];
  const cols = layout.columns;
  const colW = Math.floor((T.contentWidth - T.gutter * (cols - 1)) / cols);
  const rowsPerCol = Math.ceil(layout.items.length / cols);

  const availH = T.canvas.height - GRID_Y - T.margin.bottom;
  const rowGap = 12;
  const maxRowH = 200;
  const minRowH = 100;
  const dynamicRowH = Math.floor((availH - rowGap * (rowsPerCol - 1)) / rowsPerCol);
  const rowH = Math.max(minRowH, Math.min(maxRowH, dynamicRowH));

  layout.items.forEach((item, i) => {
    const col = Math.floor(i / rowsPerCol);
    const row = i % rowsPerCol;
    const x = T.margin.left + col * (colW + T.gutter);
    const y = GRID_Y + row * (rowH + rowGap);
    const cardId = `cell${i}`;

    elements.push({
      type: 'card',
      id: cardId,
      x,
      y,
      w: colW,
      h: rowH,
      fill: T.cardFills.neutral,
      radius: 16,
    });

    const numCircleSize = rowH >= 150 ? 56 : 48;
    if (item.num) {
      elements.push({
        type: 'ellipse',
        id: `${cardId}_numBg`,
        parentId: cardId,
        x: 28,
        y: Math.floor((rowH - numCircleSize) / 2),
        w: numCircleSize,
        h: numCircleSize,
        fill: T.colors.cyan,
      });

      const numFontSize = numCircleSize >= 56 ? 28 : 24;
      const numColor = getContrastText(T.colors.cyan, T.colors.offWhite, { r: 0, g: 0, b: 0 });
      const numCircleY = Math.floor((rowH - numCircleSize) / 2);
      elements.push({
        type: 'text',
        id: `${cardId}_num`,
        parentId: cardId,
        x: 28,
        y: numCircleY,
        w: numCircleSize,
        h: numCircleSize,
        text: item.num,
        fontSize: numFontSize,
        fontFamily: T.fontFamily.display,
        fontStyle: T.font.title.style,
        fontType: 'display',
        color: numColor,
        bold: true,
        align: 'center',
        valign: 'middle',
      });
    }

    const textX = item.num ? 92 : 36;
    const textW = colW - textX - 36;

    const nameSize = dynamicFontSize(item.name, colW, rowH * 0.35, 24, 32);
    const descSize = dynamicFontSize(item.description, colW, rowH * 0.35, 18, 24);
    const nameH = estimateTextHeight(item.name, nameSize, textW);

    const totalTextH = nameH + descSize * 1.4 + 8;
    const textStartY = totalTextH < rowH * 0.6
      ? verticalCenter(rowH, totalTextH, 'center')
      : Math.max(20, Math.floor(rowH * 0.15));

    const cellTextColor = getContrastText(T.cardFills.neutral, T.colors.offWhite, T.colors.textOnCard);
    elements.push({
      type: 'text',
      id: `${cardId}_name`,
      parentId: cardId,
      x: textX,
      y: textStartY,
      w: textW,
      h: Math.ceil(nameSize * 1.3),
      text: item.name,
      fontSize: nameSize,
      fontFamily: T.fontFamily.display,
      fontStyle: T.font.title.style,
      fontType: 'display',
      color: cellTextColor,
      bold: true,
    });

    elements.push({
      type: 'text',
      id: `${cardId}_desc`,
      parentId: cardId,
      x: textX,
      y: textStartY + nameH + 8,
      w: textW,
      h: Math.ceil(descSize * 1.3),
      text: item.description,
      fontSize: descSize,
      fontFamily: T.fontFamily.body,
      fontStyle: 'Regular',
      fontType: 'body',
      color: T.colors.dimGray,
    });
  });

  return {
    background: { color: T.bg, gradientEnd: T.bgGradientEnd },
    title: makeTitle(layout.title, T),
    elements,
  };
}

function resolveFullMessage(layout: FullMessageLayout, T: ResolvedTokens): ResolvedSlideGeometry {
  const elements: ResolvedElement[] = [];
  const heroH = 820;
  const cardPadX = 60;
  const textW = T.contentWidth - cardPadX * 2;
  const heroFill = T.cardFills.neutral;

  elements.push({
    type: 'card',
    id: 'hero',
    x: T.margin.left,
    y: GRID_Y,
    w: T.contentWidth,
    h: heroH,
    fill: heroFill,
    radius: T.radius.hero,
  });

  const h = layout.hero;

  let mainAreaTop = 0;
  if (h.beforeText) {
    const beforeSize = dynamicFontSize(h.beforeText, T.contentWidth, 120, 40, 64);
    elements.push({
      type: 'text',
      id: 'beforeTxt',
      parentId: 'hero',
      x: cardPadX,
      y: 80,
      w: textW,
      h: Math.ceil(beforeSize * 1.3),
      text: h.beforeText,
      fontSize: beforeSize,
      fontFamily: T.fontFamily.display,
      fontStyle: T.font.title.style,
      fontType: 'display',
      color: getContrastText(heroFill, T.colors.dimGray, T.colors.dimGray),
      bold: true,
    });
    mainAreaTop = 280;
  }

  const detailReserve = h.detail ? 120 : 0;
  const mainAreaH = heroH - mainAreaTop - detailReserve;

  const mainSize = h.mainSize || dynamicFontSize(h.mainText, T.contentWidth, mainAreaH, 36, 72);
  const mainTextH = estimateTextHeight(h.mainText, mainSize, textW);

  let mainY: number;
  if (h.beforeText) {
    mainY = 280;
  } else {
    const mainLines = estimateLineCount(h.mainText, mainSize, textW);
    if (mainLines <= 2) {
      mainY = verticalCenter(heroH, mainTextH + detailReserve, 'center');
    } else if (mainLines <= 5) {
      mainY = verticalCenter(heroH, mainTextH + detailReserve, 'upper-third');
    } else {
      mainY = 80;
    }
  }

  const mainColor = getContrastText(heroFill, T.colors.offWhite, T.colors.textOnCard);
  elements.push({
    type: 'text',
    id: 'mainTxt',
    parentId: 'hero',
    x: cardPadX,
    y: mainY,
    w: textW,
    h: Math.ceil(mainSize * 1.3),
    text: h.mainText,
    fontSize: mainSize,
    fontFamily: T.fontFamily.display,
    fontStyle: T.font.title.style,
    fontType: 'display',
    color: mainColor,
    bold: true,
  });

  if (h.detail) {
    const detailSize = dynamicFontSize(h.detail, T.contentWidth, heroH - mainY - mainTextH - 20, 24, 34);
    const detailY = mainY + mainTextH + 30;
    elements.push({
      type: 'text',
      id: 'detailTxt',
      parentId: 'hero',
      x: cardPadX,
      y: detailY,
      w: textW,
      h: Math.ceil(detailSize * 1.3),
      text: h.detail,
      fontSize: detailSize,
      fontFamily: T.fontFamily.body,
      fontStyle: T.font.detail.style,
      fontType: 'body',
      color: T.colors.dimGray,
      lineHeight: (detailSize * 1.5) / detailSize,
    });
  }

  return {
    background: { color: T.bg, gradientEnd: T.bgGradientEnd },
    title: makeTitle(layout.title, T),
    elements,
  };
}

// ── L7: Timeline ──

function resolveTimeline(layout: TimelineLayout, T: ResolvedTokens): ResolvedSlideGeometry {
  const elements: ResolvedElement[] = [];
  const stepCount = layout.steps.length;
  const contentY = GRID_Y + 40;
  const stepW = Math.floor(T.contentWidth / stepCount);
  const nodeY = contentY + 60;
  const lineY = nodeY + 16;
  const descY = nodeY + 80;

  // Horizontal connector line
  elements.push({
    type: 'card',
    id: 'connector',
    x: T.margin.left + Math.floor(stepW * 0.3),
    y: lineY,
    w: Math.floor(stepW * (stepCount - 1) + stepW * 0.4),
    h: 4,
    fill: T.colors.dimGray,
  });

  for (let i = 0; i < stepCount; i++) {
    const step = layout.steps[i];
    const centerX = T.margin.left + stepW * i + Math.floor(stepW / 2);
    const fillColor = step.highlight ? T.colors.cyan : T.cardFills.neutral;

    elements.push({
      type: 'ellipse',
      id: `node${i}`,
      x: centerX - 20,
      y: nodeY,
      w: 40, h: 40,
      fill: fillColor,
    });

    const labelW = Math.floor(stepW * 0.8);
    elements.push({
      type: 'text',
      id: `label${i}`,
      x: centerX - Math.floor(labelW / 2),
      y: descY,
      w: labelW, h: 40,
      text: step.label,
      fontSize: Math.floor(T.font.cardHeader.size * 0.75),
      fontFamily: T.fontFamily.display,
      fontType: 'display',
      fontStyle: T.font.cardHeader.style,
      color: T.colors.offWhite,
      bold: true,
      align: 'center',
    });

    elements.push({
      type: 'text',
      id: `desc${i}`,
      x: centerX - Math.floor(labelW / 2),
      y: descY + 50,
      w: labelW, h: 100,
      text: step.description,
      fontSize: Math.floor(T.font.body.size * 0.85),
      fontFamily: T.fontFamily.body,
      fontType: 'body',
      fontStyle: T.font.body.style,
      color: T.colors.dimGray,
      align: 'center',
    });
  }

  return {
    background: { color: T.bg, gradientEnd: T.bgGradientEnd },
    title: makeTitle(layout.title, T),
    elements,
  };
}

// ── L8: KPI Highlight ──

function resolveKpiHighlight(layout: KpiHighlightLayout, T: ResolvedTokens): ResolvedSlideGeometry {
  const elements: ResolvedElement[] = [];
  const count = layout.metrics.length;
  const metricW = Math.floor((T.contentWidth - T.gutter * (count - 1)) / count);
  const cardH = 500;
  const cardY = GRID_Y + 80;

  layout.metrics.forEach((metric, i) => {
    const x = T.margin.left + i * (metricW + T.gutter);
    const cardId = `kpi${i}`;
    const fill = T.cardFills.neutral;

    elements.push({
      type: 'card', id: cardId,
      x, y: cardY, w: metricW, h: cardH,
      fill, radius: T.radius.card,
    });

    const valueSize = dynamicFontSize(metric.value, metricW, cardH * 0.4, 64, 120);
    const valueColor = metric.trend === 'up' ? T.colors.green
      : metric.trend === 'down' ? T.colors.red
      : T.colors.cyan;

    elements.push({
      type: 'text', id: `${cardId}_val`,
      parentId: cardId,
      x: 40, y: Math.floor(cardH * 0.25),
      w: metricW - 80, h: Math.ceil(valueSize * 1.3),
      text: metric.value,
      fontSize: valueSize,
      fontFamily: T.fontFamily.display, fontType: 'display',
      fontStyle: T.font.title.style,
      color: valueColor, bold: true, align: 'center', valign: 'middle',
    });

    const labelSize = Math.floor(T.font.body.size * 0.85);
    elements.push({
      type: 'text', id: `${cardId}_lbl`,
      parentId: cardId,
      x: 40, y: Math.floor(cardH * 0.65),
      w: metricW - 80, h: Math.ceil(labelSize * 1.5),
      text: metric.label,
      fontSize: labelSize,
      fontFamily: T.fontFamily.body, fontType: 'body',
      fontStyle: T.font.body.style,
      color: getContrastText(fill, T.colors.offWhite, T.colors.textOnCard),
      align: 'center',
    });
  });

  return {
    background: { color: T.bg, gradientEnd: T.bgGradientEnd },
    title: makeTitle(layout.title, T),
    elements,
  };
}

// ── L9: Quote/Statement ──

function resolveQuoteStatement(layout: QuoteStatementLayout, T: ResolvedTokens): ResolvedSlideGeometry {
  const elements: ResolvedElement[] = [];
  const heroH = 820;
  const cardPadX = 100;
  const textW = T.contentWidth - cardPadX * 2;
  const heroFill = T.cardFills.neutral;

  elements.push({
    type: 'card', id: 'quoteCard',
    x: T.margin.left, y: GRID_Y,
    w: T.contentWidth, h: heroH,
    fill: heroFill, radius: T.radius.hero,
  });

  // Decorative opening quotation mark
  if (layout.style === 'quote') {
    elements.push({
      type: 'text', id: 'quoteOpen',
      parentId: 'quoteCard',
      x: cardPadX - 20, y: 60,
      w: 120, h: 120,
      text: '\u201C',
      fontSize: 160,
      fontFamily: T.fontFamily.display, fontType: 'display',
      fontStyle: T.font.title.style,
      color: T.colors.cyan, bold: true, align: 'left',
    });
  }

  const quoteSize = dynamicFontSize(layout.quote, T.contentWidth - cardPadX * 2, heroH * 0.5, 40, 72);
  const quoteH = estimateTextHeight(layout.quote, quoteSize, textW);
  const quoteY = verticalCenter(heroH, quoteH + (layout.attribution ? 80 : 0), 'center');

  const quoteColor = getContrastText(heroFill, T.colors.offWhite, T.colors.textOnCard);
  elements.push({
    type: 'text', id: 'quoteTxt',
    parentId: 'quoteCard',
    x: cardPadX, y: quoteY,
    w: textW, h: Math.ceil(quoteSize * 1.3),
    text: layout.quote,
    fontSize: quoteSize,
    fontFamily: T.fontFamily.display, fontType: 'display',
    fontStyle: T.font.title.style,
    color: quoteColor, bold: true, align: 'center', valign: 'middle',
  });

  if (layout.attribution) {
    const attrSize = T.font.detail.size;
    elements.push({
      type: 'text', id: 'attrTxt',
      parentId: 'quoteCard',
      x: cardPadX, y: quoteY + quoteH + 30,
      w: textW, h: Math.ceil(attrSize * 1.5),
      text: `\u2014 ${layout.attribution}`,
      fontSize: attrSize,
      fontFamily: T.fontFamily.body, fontType: 'body',
      fontStyle: T.font.detail.style,
      color: T.colors.dimGray, align: 'center',
    });
  }

  return {
    background: { color: T.bg, gradientEnd: T.bgGradientEnd },
    title: makeTitle(layout.title || '', T),
    elements,
  };
}
