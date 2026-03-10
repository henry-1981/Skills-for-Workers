/**
 * HybridRenderer - Screenshot background + text overlay for editable PPTX
 *
 * Combines Playwright screenshot (preserves CSS gradients, glow, etc.)
 * with DOM text extraction (enables text editing in PowerPoint).
 */

import { type Browser, type Page } from 'playwright';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PptxPresentation = any;

// Constants used inside page.evaluate are redeclared there (no closure access)

// ── Types ──────────────────────────────────────────────────────────────

export interface TextOverlay {
  text: string;
  x: number; // inches
  y: number;
  w: number;
  h: number;
  fontSize: number; // points
  fontFamily: string;
  color: string; // hex without #
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
}

export interface HybridResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slide: any;
  textOverlays: TextOverlay[];
  errors: string[];
}

export interface HybridRendererOptions {
  browser: Browser;
  screenshotOnly?: boolean; // skip text extraction
}

// ── Text Extraction (runs in browser context) ──────────────────────────

async function extractTextOverlays(page: Page): Promise<TextOverlay[]> {
  return await page.evaluate(() => {
    const PX_PER_IN = 96;
    const PT_PER_PX = 0.75;

    const pxToInch = (px: number): number => px / PX_PER_IN;
    const pxToPt = (pxStr: string): number => parseFloat(pxStr) * PT_PER_PX;

    const rgbToHex = (rgbStr: string): string => {
      if (rgbStr === 'rgba(0, 0, 0, 0)' || rgbStr === 'transparent') return 'FFFFFF';
      const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return 'FFFFFF';
      return match.slice(1).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
    };

    const overlays: TextOverlay[] = [];
    const processed = new Set<Element>();

    // Tags to skip entirely during walk
    const SKIP_TAGS = new Set(['HTML', 'HEAD', 'BODY', 'SCRIPT', 'STYLE', 'META', 'LINK', 'HR', 'IMG', 'SVG', 'CANVAS', 'VIDEO', 'AUDIO', 'IFRAME']);
    // Inline formatting tags — treated as part of parent text, not separate elements
    const INLINE_TAGS = new Set(['SPAN', 'STRONG', 'EM', 'B', 'I', 'U', 'A', 'MARK', 'SUB', 'SUP', 'SMALL', 'CODE', 'BR']);

    // Element is a "text block" if it has text and all its text-bearing children are inline
    function isTextBlock(el: Element): boolean {
      if (SKIP_TAGS.has(el.tagName)) return false;

      const text = el.textContent?.trim();
      if (!text) return false;

      // Check non-inline children for text content
      for (const child of el.children) {
        if (SKIP_TAGS.has(child.tagName) || INLINE_TAGS.has(child.tagName)) continue;
        const childText = child.textContent?.trim();
        if (childText && childText.length > 0) return false;
      }

      return true;
    }

    function walk(el: Element) {
      if (SKIP_TAGS.has(el.tagName)) return;
      if (processed.has(el)) return;

      const computed = window.getComputedStyle(el);
      if (computed.display === 'none' || computed.visibility === 'hidden') return;
      if (computed.opacity === '0') return;

      if (isTextBlock(el)) {
        processed.add(el);

        // Skip gradient text — kept in screenshot, not editable in PPTX
        const bgClip = computed.webkitBackgroundClip || (computed as any).backgroundClip;
        if (bgClip === 'text') return;
        for (const child of el.querySelectorAll('*')) {
          const childBgClip = window.getComputedStyle(child).webkitBackgroundClip || (window.getComputedStyle(child) as any).backgroundClip;
          if (childBgClip === 'text') return;
        }

        const text = el.textContent?.trim();
        if (!text) return;

        const rect = el.getBoundingClientRect();
        if (rect.width < 5 || rect.height < 5) return;
        // Skip off-screen elements
        if (rect.right < 0 || rect.bottom < 0 || rect.left > 1920 || rect.top > 1080) return;

        // Extract padding to compute tighter text bounds
        const padTop = parseFloat(computed.paddingTop) || 0;
        const padBottom = parseFloat(computed.paddingBottom) || 0;
        const padLeft = parseFloat(computed.paddingLeft) || 0;
        const padRight = parseFloat(computed.paddingRight) || 0;

        // Resolve line-height (fallback to fontSize * 1.2 for "normal")
        const fontSizePx = parseFloat(computed.fontSize);
        let lineHeight = parseFloat(computed.lineHeight);
        if (isNaN(lineHeight)) lineHeight = fontSizePx * 1.2;

        // Content area excluding CSS padding
        const contentW = Math.max(0, rect.width - padLeft - padRight);
        const contentH = Math.max(0, rect.height - padTop - padBottom);

        // Cap height to actual text lines to avoid extra whitespace
        const lineCount = Math.max(1, Math.ceil(contentH / lineHeight));
        const tightH = Math.min(contentH, lineCount * lineHeight);

        const isBold = computed.fontWeight === 'bold' || parseInt(computed.fontWeight) >= 600;

        let align: 'left' | 'center' | 'right' = 'left';
        if (computed.textAlign === 'center') align = 'center';
        else if (computed.textAlign === 'right' || computed.textAlign === 'end') align = 'right';

        overlays.push({
          text,
          x: pxToInch(rect.left + padLeft),
          y: pxToInch(rect.top + padTop),
          w: pxToInch(contentW),
          h: pxToInch(tightH),
          fontSize: pxToPt(computed.fontSize),
          fontFamily: computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
          color: rgbToHex(computed.color),
          bold: isBold,
          italic: computed.fontStyle === 'italic',
          align,
        });
        return; // leaf — don't descend further
      }

      // Container — recurse into children
      for (const child of el.children) {
        walk(child);
      }
    }

    // Start from body's children (body itself is in LAYOUT_TAGS)
    for (const child of document.body.children) {
      walk(child);
    }
    return overlays;
  });
}

// ── Main Renderer ──────────────────────────────────────────────────────

export async function hybridRender(
  htmlFile: string,
  pres: PptxPresentation,
  options: HybridRendererOptions,
): Promise<HybridResult> {
  const { browser, screenshotOnly = false } = options;
  const errors: string[] = [];

  const filePath = path.isAbsolute(htmlFile) ? htmlFile : path.join(process.cwd(), htmlFile);
  const page = await browser.newPage();

  try {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });

    // Wait for fonts
    await page.evaluate(async () => {
      if ((document as any).fonts?.ready) {
        await (document as any).fonts.ready;
      }
    });

    // Extract text overlays BEFORE screenshot (need visible elements for getBoundingClientRect)
    let textOverlays: TextOverlay[] = [];
    if (!screenshotOnly) {
      textOverlays = await extractTextOverlays(page);

      // Hide text elements so screenshot captures only backgrounds/shapes
      await page.evaluate(() => {
        const SKIP = new Set(['HTML', 'HEAD', 'BODY', 'SCRIPT', 'STYLE', 'META', 'LINK', 'HR', 'IMG', 'SVG', 'CANVAS', 'VIDEO', 'AUDIO', 'IFRAME']);
        const INLINE = new Set(['SPAN', 'STRONG', 'EM', 'B', 'I', 'U', 'A', 'MARK', 'SUB', 'SUP', 'SMALL', 'CODE', 'BR']);

        function isTextBlock(el: Element): boolean {
          if (SKIP.has(el.tagName)) return false;
          const text = el.textContent?.trim();
          if (!text) return false;
          for (const child of el.children) {
            if (SKIP.has(child.tagName) || INLINE.has(child.tagName)) continue;
            if (child.textContent?.trim()) return false;
          }
          return true;
        }

        // Check if element uses gradient text (background-clip: text)
        function hasGradientText(el: Element): boolean {
          const cs = window.getComputedStyle(el);
          if (cs.webkitBackgroundClip === 'text' || (cs as any).backgroundClip === 'text') return true;
          for (const child of el.querySelectorAll('*')) {
            const childCs = window.getComputedStyle(child);
            if (childCs.webkitBackgroundClip === 'text' || (childCs as any).backgroundClip === 'text') return true;
          }
          return false;
        }

        function hideText(el: Element) {
          if (SKIP.has(el.tagName)) return;
          if (isTextBlock(el)) {
            // Keep gradient text visible in screenshot (can't be replicated in PPTX)
            if (hasGradientText(el)) return;
            const htmlEl = el as HTMLElement;
            htmlEl.style.color = 'transparent';
            htmlEl.style.setProperty('-webkit-text-fill-color', 'transparent');
            // Also hide inline children text
            el.querySelectorAll('*').forEach(child => {
              const childHtml = child as HTMLElement;
              childHtml.style.color = 'transparent';
              childHtml.style.setProperty('-webkit-text-fill-color', 'transparent');
            });
            return;
          }
          for (const child of el.children) hideText(child);
        }

        for (const child of document.body.children) hideText(child);
      });
    }

    // Take screenshot (text-free when hybrid mode)
    const screenshotBuffer = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
      scale: 'device',
    });

    const base64 = Buffer.from(screenshotBuffer).toString('base64');
    const slide = pres.addSlide();

    // Add screenshot as full-slide background
    slide.addImage({
      data: `image/png;base64,${base64}`,
      x: 0,
      y: 0,
      w: '100%',
      h: '100%',
    });

    // Add text overlays — these are the ONLY source of text in the slide
    for (const overlay of textOverlays) {
      slide.addText(overlay.text, {
        x: overlay.x,
        y: overlay.y,
        w: overlay.w,
        h: overlay.h,
        fontSize: overlay.fontSize,
        fontFace: overlay.fontFamily,
        color: overlay.color,
        bold: overlay.bold,
        italic: overlay.italic,
        align: overlay.align,
        valign: 'top',
        fill: { type: 'none' },
        line: { type: 'none' },
      });
    }

    return { slide, textOverlays, errors };
  } catch (error: any) {
    throw new Error(`${htmlFile}: ${error.message}`);
  } finally {
    await page.close();
  }
}
