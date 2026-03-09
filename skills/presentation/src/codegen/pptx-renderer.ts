/**
 * PptxRenderer — Renders slides to .pptx using pptxgenjs
 *
 * Implements SlideRenderer interface. Converts ResolvedSlideGeometry
 * (absolute pixel coordinates) to pptxgenjs API calls.
 *
 * Structural slides (title, section-header, closing) are rendered
 * directly without Geometry Engine. Content slides use pre-computed
 * geometry from resolveGeometry().
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
import PptxGenJSDefault from 'pptxgenjs';
import type { SlideRenderer, RendererOutput } from './renderer.js';
import type { ResolvedSlideGeometry, ResolvedElement } from './geometry-engine.js';
import type { StylePreset } from '../themes/types.js';
import { pxToInch, rgbToHex, fontPxToPt, PPTX_SLIDE } from './coordinate-utils.js';
import { resolvePptxFont } from './pptx-font-map.js';
import { getContrastText } from './bento-layouts.js';

// Handle ESM default export quirk (see spike/pptx-spike.ts)
// At runtime PptxGenJSDefault may be the constructor or a module wrapper
const PptxGen: any = (typeof PptxGenJSDefault === 'function'
  ? PptxGenJSDefault
  : (PptxGenJSDefault as any).default) ?? PptxGenJSDefault;

// ── Constants ──

const LAYOUT_NAME = 'FIGMA_1920x1080';

/** Default rectRadius for rounded cards (0.0–1.0 ratio) */
const CARD_RECT_RADIUS = 0.05;

/** Accent bar dimensions for structural slides (in inches) */
const ACCENT_BAR = {
  width: 0.6,
  height: 0.06,
} as const;

// ── PptxRenderer ──

export class PptxRenderer implements SlideRenderer {
  private pptx: any;
  private preset: StylePreset;
  private outputPath: string;
  /** Tracks card element positions for resolving child text offsets */
  private parentMap: Map<string, { x: number; y: number }> = new Map();

  constructor(preset: StylePreset, outputPath: string) {
    this.preset = preset;
    this.outputPath = outputPath;
    this.pptx = new PptxGen();
    this.pptx.defineLayout({
      name: LAYOUT_NAME,
      width: PPTX_SLIDE.width,
      height: PPTX_SLIDE.height,
    });
    this.pptx.layout = LAYOUT_NAME;
  }

  // ── SlideRenderer Interface ──

  renderStructural(slideType: string, data: Record<string, string>): void {
    switch (slideType) {
      case 'title':
        this.renderTitleSlide(data);
        break;
      case 'section-header':
        this.renderSectionHeader(data);
        break;
      case 'closing':
        this.renderClosingSlide(data);
        break;
      default:
        // Unknown structural type — render as title fallback
        this.renderTitleSlide(data);
    }
  }

  renderContent(geometry: ResolvedSlideGeometry): void {
    const slide = this.pptx.addSlide();

    // Background — pptxgenjs doesn't support gradient backgrounds,
    // so always use the primary background color as solid fill.
    slide.background = { color: rgbToHex(geometry.background.color) };

    // Build parent position map for resolving relative coordinates
    this.parentMap.clear();
    for (const el of geometry.elements) {
      if (el.type === 'card' && el.id) {
        this.parentMap.set(el.id, { x: el.x, y: el.y });
      }
    }

    // Slide title
    this.renderElement(slide, geometry.title, true);

    // All elements (cards, text, ellipses)
    for (const el of geometry.elements) {
      this.renderElement(slide, el, false);
    }

    // Decorations (progress bar, etc.)
    if (geometry.decorations) {
      for (const el of geometry.decorations) {
        this.renderElement(slide, el, false);
      }
    }
  }

  async finalize(): Promise<RendererOutput> {
    await this.pptx.writeFile({ fileName: this.outputPath });
    return { type: 'pptx', filePath: this.outputPath };
  }

  // ── Helpers ──

  /** Pick heading color that contrasts against bgPrimary */
  private headingColor(): string {
    const bg = this.preset.colors.bgPrimary;
    const color = getContrastText(bg, { r: 1, g: 1, b: 1 }, this.preset.colors.textPrimary);
    return rgbToHex(color);
  }

  /** Pick subtitle color that contrasts against bgPrimary */
  private subtitleColor(): string {
    const bg = this.preset.colors.bgPrimary;
    const color = getContrastText(bg, { r: 0.7, g: 0.7, b: 0.7 }, this.preset.colors.textSecondary);
    return rgbToHex(color);
  }

  // ── Structural Slide Renderers ──

  private renderTitleSlide(data: Record<string, string>): void {
    const slide = this.pptx.addSlide();
    slide.background = { color: rgbToHex(this.preset.colors.bgPrimary) };

    const heading = data['heading'] || data['title'] || '';
    const subtitle = data['subtitle'] || '';

    // Accent bar at top
    this.addAccentBar(slide, {
      x: pxToInch(80, 'x'),
      y: pxToInch(380, 'y'),
    });

    // Title text
    slide.addText(heading, {
      x: pxToInch(80, 'x'),
      y: pxToInch(420, 'y'),
      w: pxToInch(1760, 'w'),
      h: pxToInch(200, 'h'),
      fontSize: fontPxToPt(72),
      fontFace: resolvePptxFont(this.preset.fonts.display.family),
      color: this.headingColor(),
      bold: true,
      align: 'left',
      valign: 'top',
      fit: 'shrink',
    });

    // Subtitle
    if (subtitle) {
      slide.addText(subtitle, {
        x: pxToInch(80, 'x'),
        y: pxToInch(640, 'y'),
        w: pxToInch(1760, 'w'),
        h: pxToInch(100, 'h'),
        fontSize: Math.max(fontPxToPt(36), 20),
        fontFace: resolvePptxFont(this.preset.fonts.body.family),
        color: this.subtitleColor(),
        align: 'left',
        valign: 'top',
      });
    }
  }

  private renderSectionHeader(data: Record<string, string>): void {
    const slide = this.pptx.addSlide();
    slide.background = { color: rgbToHex(this.preset.colors.bgPrimary) };

    const heading = data['heading'] || data['title'] || '';
    const sectionTag = data['sectionTag'] || '';

    // Section tag (small text above heading)
    if (sectionTag) {
      slide.addText(sectionTag.toUpperCase(), {
        x: pxToInch(80, 'x'),
        y: pxToInch(380, 'y'),
        w: pxToInch(1760, 'w'),
        h: pxToInch(50, 'h'),
        fontSize: Math.max(fontPxToPt(24), 14),
        fontFace: resolvePptxFont(this.preset.fonts.body.family),
        color: rgbToHex(this.preset.colors.accent),
        bold: true,
        align: 'left',
        valign: 'top',
      });
    }

    // Accent bar
    this.addAccentBar(slide, {
      x: pxToInch(80, 'x'),
      y: pxToInch(sectionTag ? 450 : 420, 'y'),
    });

    // Section heading
    slide.addText(heading, {
      x: pxToInch(80, 'x'),
      y: pxToInch(sectionTag ? 480 : 460, 'y'),
      w: pxToInch(1760, 'w'),
      h: pxToInch(200, 'h'),
      fontSize: fontPxToPt(60),
      fontFace: resolvePptxFont(this.preset.fonts.display.family),
      color: this.headingColor(),
      bold: true,
      align: 'left',
      valign: 'top',
      fit: 'shrink',
    });
  }

  private renderClosingSlide(data: Record<string, string>): void {
    const slide = this.pptx.addSlide();
    slide.background = { color: rgbToHex(this.preset.colors.bgPrimary) };

    const heading = data['heading'] || data['title'] || 'Thank You';
    const subtitle = data['subtitle'] || '';

    // Accent bar centered
    this.addAccentBar(slide, {
      x: pxToInch(860, 'x'),
      y: pxToInch(380, 'y'),
    });

    // Closing title (centered)
    slide.addText(heading, {
      x: pxToInch(80, 'x'),
      y: pxToInch(420, 'y'),
      w: pxToInch(1760, 'w'),
      h: pxToInch(200, 'h'),
      fontSize: fontPxToPt(72),
      fontFace: resolvePptxFont(this.preset.fonts.display.family),
      color: this.headingColor(),
      bold: true,
      align: 'center',
      valign: 'middle',
      fit: 'shrink',
    });

    // Subtitle (centered)
    if (subtitle) {
      slide.addText(subtitle, {
        x: pxToInch(80, 'x'),
        y: pxToInch(640, 'y'),
        w: pxToInch(1760, 'w'),
        h: pxToInch(100, 'h'),
        fontSize: Math.max(fontPxToPt(32), 18),
        fontFace: resolvePptxFont(this.preset.fonts.body.family),
        color: this.subtitleColor(),
        align: 'center',
        valign: 'top',
      });
    }
  }

  // ── Content Element Renderer ──

  /**
   * Render a single ResolvedElement onto a slide.
   *
   * For 'card' elements: renders a rounded rectangle shape.
   * For 'text' elements with parentId: coordinates are relative to parent card,
   *   converted to absolute using the parent's position from the elements list.
   * For 'text' elements without parentId (e.g., title): coordinates are absolute.
   * For 'ellipse' elements: renders an ellipse shape.
   */
  private renderElement(slide: any, el: ResolvedElement, _isTitle: boolean): void {
    switch (el.type) {
      case 'card':
        this.renderCard(slide, el);
        break;
      case 'text':
        this.renderText(slide, el);
        break;
      case 'ellipse':
        this.renderEllipse(slide, el);
        break;
    }
  }

  private renderCard(slide: any, el: ResolvedElement): void {
    const radius = el.radius != null
      ? el.radius / (Math.min(el.w, el.h) / 2)
      : CARD_RECT_RADIUS;

    const shapeOpts: any = {
      x: pxToInch(el.x, 'x'),
      y: pxToInch(el.y, 'y'),
      w: pxToInch(el.w, 'w'),
      h: pxToInch(el.h, 'h'),
      fill: el.fill ? { color: rgbToHex(el.fill) } : undefined,
      rectRadius: Math.min(radius, 1),
    };

    // Apply shadow if present
    if (el.shadow) {
      shapeOpts.shadow = {
        type: 'outer',
        color: rgbToHex(el.shadow.color),
        blur: el.shadow.blur * 0.75, // px to pt approximation
        offset: Math.max(el.shadow.offset.x, el.shadow.offset.y) * 0.75,
        opacity: el.shadow.opacity,
        angle: 270,
      };
    }

    slide.addShape((this.pptx as any).ShapeType.roundRect, shapeOpts);
  }

  private renderText(slide: any, el: ResolvedElement): void {
    // Compute absolute position — text elements with parentId have relative coords
    let absX = el.x;
    let absY = el.y;

    if (el.parentId) {
      // parentId means x/y are relative to the parent card
      // We need the parent's absolute position — stored in the current slide's
      // elements. Since renderContent iterates elements in order and cards come
      // before their children, we can look up via the stored parent map.
      const parent = this.parentMap.get(el.parentId);
      if (parent) {
        absX = parent.x + el.x;
        absY = parent.y + el.y;
      }
    }

    const fontFamily = el.fontFamily
      ? resolvePptxFont(el.fontFamily)
      : resolvePptxFont('Inter');

    const opts: Record<string, any> = {
      x: pxToInch(absX, 'x'),
      y: pxToInch(absY, 'y'),
      w: pxToInch(el.w, 'w'),
      h: pxToInch(el.h, 'h'),
      fontSize: el.fontSize ? Math.max(fontPxToPt(el.fontSize), 12) : 14,
      fontFace: fontFamily,
      color: el.color ? rgbToHex(el.color) : rgbToHex(this.preset.colors.textPrimary),
      bold: el.bold ?? false,
      align: el.align ?? 'left',
      valign: el.valign ?? 'top',
      fit: 'shrink',
    };

    if (el.lineHeight) {
      opts.lineSpacingMultiple = el.lineHeight;
    }

    slide.addText(el.text ?? '', opts);
  }

  private renderEllipse(slide: any, el: ResolvedElement): void {
    let absX = el.x;
    let absY = el.y;

    if (el.parentId) {
      const parent = this.parentMap.get(el.parentId);
      if (parent) {
        absX = parent.x + el.x;
        absY = parent.y + el.y;
      }
    }

    slide.addShape((this.pptx as any).ShapeType.ellipse, {
      x: pxToInch(absX, 'x'),
      y: pxToInch(absY, 'y'),
      w: pxToInch(el.w, 'w'),
      h: pxToInch(el.h, 'h'),
      fill: el.fill ? { color: rgbToHex(el.fill) } : undefined,
    });
  }

  // ── Decorative Helpers ──

  private addAccentBar(
    slide: any,
    pos: { x: number; y: number },
  ): void {
    // Small horizontal accent bar using preset accent color
    slide.addShape((this.pptx as any).ShapeType.rect, {
      x: pos.x,
      y: pos.y,
      w: ACCENT_BAR.width,
      h: ACCENT_BAR.height,
      fill: { color: rgbToHex(this.preset.colors.accent) },
    });
  }
}
