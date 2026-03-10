/**
 * html2pptx - Convert HTML slide to pptxgenjs slide with positioned elements
 *
 * Ported from slides-grab html2pptx.js (963 LOC) to TypeScript ESM.
 *
 * USAGE:
 *   const pptx = new PptxGenJS();
 *   pptx.layout = 'LAYOUT_16x9';
 *
 *   const { slide, placeholders, errors } = await html2pptx('slide.html', pptx);
 *   await pptx.writeFile('output.pptx');
 *
 * FEATURES:
 *   - Converts HTML to PowerPoint with accurate positioning
 *   - Supports text, images, shapes, and bullet lists
 *   - Extracts placeholder elements (class="placeholder") with positions
 *   - Handles CSS gradients, borders, shadows, rotation, and margins
 */

import { chromium, type Browser, type Page } from 'playwright';
import path from 'path';

// pptxgenjs has complex dual namespace/class export — use any for presentation instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PptxPresentation = any;

// ── Constants ──────────────────────────────────────────────────────────

const PT_PER_PX = 0.75;
const PX_PER_IN = 96;
const EMU_PER_IN = 914400;

// ── Types ──────────────────────────────────────────────────────────────

export interface Position {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlaceholderInfo {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TextRun {
  text: string;
  options: Record<string, any>;
}

export interface ShapeInfo {
  fill: string | null;
  transparency: number | null;
  line: { color: string; width: number } | null;
  rectRadius: number;
  shadow: ShadowInfo | null;
}

export interface ShadowInfo {
  type: string;
  angle: number;
  blur: number;
  color: string;
  offset: number;
  opacity: number;
}

export interface SlideElement {
  type: string;
  position: Position;
  text?: string | TextRun[];
  src?: string;
  style?: Record<string, any>;
  shape?: ShapeInfo;
  items?: TextRun[];
  // Line-specific fields
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  color?: string;
  width?: number;
}

export interface SlideBackground {
  type: 'image' | 'color';
  value?: string;
  path?: string;
}

export interface SlideData {
  background: SlideBackground;
  elements: SlideElement[];
  placeholders: PlaceholderInfo[];
  errors: string[];
}

export interface BodyDimensions {
  width: number;
  height: number;
  scrollWidth: number;
  scrollHeight: number;
  errors: string[];
}

export interface Html2PptxOptions {
  browser?: Browser;
  tmpDir?: string;
  slide?: any;
}

export interface Html2PptxResult {
  slide: any;
  placeholders: PlaceholderInfo[];
  errors: string[];
}

// ── Browser Launch ─────────────────────────────────────────────────────

async function launchBrowser(tmpDir: string): Promise<Browser> {
  const launchOptions = { env: { TMPDIR: tmpDir } };

  if (process.platform !== 'darwin') {
    return chromium.launch(launchOptions);
  }

  try {
    return await chromium.launch({ ...launchOptions, channel: 'chrome' });
  } catch (error: any) {
    if (error?.message?.includes("Chromium distribution 'chrome' is not found")) {
      return chromium.launch(launchOptions);
    }
    throw error;
  }
}

// ── Dynamic Render Waiting ─────────────────────────────────────────────

async function waitForDynamicLibraryRender(page: Page, timeout = 5000): Promise<void> {
  await page.evaluate(async () => {
    if ((document as any).fonts?.ready) {
      await (document as any).fonts.ready;
    }
  });

  const hasCanvas = await page.evaluate(() => document.querySelector('canvas') !== null);
  if (hasCanvas) {
    await page.evaluate(() => {
      if (!(window as any).Chart || !(window as any).Chart.instances) return;
      const instances = Array.isArray((window as any).Chart.instances)
        ? (window as any).Chart.instances
        : Object.values((window as any).Chart.instances);

      for (const chart of instances) {
        if (!chart) continue;
        if ((chart as any).options) (chart as any).options.animation = false;
        if (typeof (chart as any).update === 'function') {
          try {
            (chart as any).update('none');
          } catch (_) {
            // noop
          }
        }
      }
    });

    try {
      await page.waitForFunction(() => {
        const canvases = Array.from(document.querySelectorAll('canvas'));
        if (canvases.length === 0) return true;

        const instances = ((window as any).Chart && (window as any).Chart.instances)
          ? (Array.isArray((window as any).Chart.instances)
            ? (window as any).Chart.instances
            : Object.values((window as any).Chart.instances))
          : [];

        return canvases.every((canvas) => {
          const rect = canvas.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;

          const matchedChart = (instances as any[]).find(
            (instance: any) => instance && instance.canvas === canvas
          );
          if (!matchedChart) return true;
          return matchedChart.animating === false;
        });
      }, null, { timeout });
    } catch (_) {
      // Keep conversion resilient even when chart animation state is unavailable.
    }
  }

  const hasMermaid = await page.evaluate(() => document.querySelector('.mermaid') !== null);
  if (hasMermaid) {
    await page.evaluate(async () => {
      if (!(window as any).mermaid) return;

      try {
        if (typeof (window as any).mermaid.run === 'function') {
          await (window as any).mermaid.run({ querySelector: '.mermaid' });
          return;
        }

        if (typeof (window as any).mermaid.init === 'function') {
          await (window as any).mermaid.init(undefined, document.querySelectorAll('.mermaid'));
        }
      } catch (_) {
        // noop
      }
    });

    try {
      await page.waitForFunction(() => {
        const blocks = Array.from(document.querySelectorAll('.mermaid'));
        if (blocks.length === 0) return true;
        return blocks.every((block) => block.querySelector('svg') !== null);
      }, null, { timeout });
    } catch (_) {
      // Keep conversion resilient when Mermaid CDN/script is unavailable.
    }
  }
}

// ── Rasterize Dynamic Visuals ──────────────────────────────────────────

async function rasterizeDynamicVisuals(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const waitForImageLoad = (img: HTMLImageElement) => new Promise<void>((resolve) => {
      if (img.complete) {
        resolve();
        return;
      }

      const done = () => resolve();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });

    // Replace canvas elements with rasterized images
    const canvasList = Array.from(document.querySelectorAll('canvas'));
    for (const canvas of canvasList) {
      try {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        const dataUrl = canvas.toDataURL('image/png');
        if (!dataUrl || dataUrl === 'data:,') continue;

        const computed = window.getComputedStyle(canvas);
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = canvas.getAttribute('aria-label') || 'chart';
        img.style.width = `${rect.width}px`;
        img.style.height = `${rect.height}px`;
        img.style.display = computed.display === 'inline' ? 'inline-block' : computed.display;
        img.style.objectFit = 'contain';
        if (canvas.className) img.className = canvas.className;
        if (canvas.id) img.id = `${canvas.id}-rendered`;

        canvas.replaceWith(img);
        await waitForImageLoad(img);
      } catch (_) {
        // noop
      }
    }

    // Replace SVG elements with rasterized images
    const svgList = Array.from(document.querySelectorAll('svg'));
    for (const svg of svgList) {
      try {
        const rect = svg.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        const clone = svg.cloneNode(true) as SVGElement;
        if (!clone.getAttribute('xmlns')) {
          clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        }
        if (!clone.getAttribute('xmlns:xlink')) {
          clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        }
        if (!clone.getAttribute('width')) {
          clone.setAttribute('width', `${Math.max(1, Math.round(rect.width))}`);
        }
        if (!clone.getAttribute('height')) {
          clone.setAttribute('height', `${Math.max(1, Math.round(rect.height))}`);
        }

        const serialized = new XMLSerializer().serializeToString(clone);
        const base64Svg = btoa(unescape(encodeURIComponent(serialized)));
        const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

        const computed = window.getComputedStyle(svg);
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = 'diagram';
        img.style.width = `${rect.width}px`;
        img.style.height = `${rect.height}px`;
        img.style.display = computed.display === 'inline' ? 'inline-block' : computed.display;
        img.style.objectFit = 'contain';

        svg.replaceWith(img);
        await waitForImageLoad(img);
      } catch (_) {
        // noop
      }
    }
  });
}

// ── Body Dimensions ────────────────────────────────────────────────────

async function getBodyDimensions(page: Page): Promise<BodyDimensions> {
  const bodyDimensions = await page.evaluate(() => {
    const body = document.body;
    const style = window.getComputedStyle(body);

    return {
      width: parseFloat(style.width),
      height: parseFloat(style.height),
      scrollWidth: body.scrollWidth,
      scrollHeight: body.scrollHeight,
    };
  });

  const errors: string[] = [];
  const widthOverflowPx = Math.max(0, bodyDimensions.scrollWidth - bodyDimensions.width - 1);
  const heightOverflowPx = Math.max(0, bodyDimensions.scrollHeight - bodyDimensions.height - 1);

  const widthOverflowPt = widthOverflowPx * PT_PER_PX;
  const heightOverflowPt = heightOverflowPx * PT_PER_PX;

  if (widthOverflowPt > 0 || heightOverflowPt > 0) {
    const directions: string[] = [];
    if (widthOverflowPt > 0) directions.push(`${widthOverflowPt.toFixed(1)}pt horizontally`);
    if (heightOverflowPt > 0) directions.push(`${heightOverflowPt.toFixed(1)}pt vertically`);
    const reminder = heightOverflowPt > 0 ? ' (Remember: leave 0.5" margin at bottom of slide)' : '';
    errors.push(`HTML content overflows body by ${directions.join(' and ')}${reminder}`);
  }

  return { ...bodyDimensions, errors };
}

// ── Dimension Validation ───────────────────────────────────────────────

function validateDimensions(bodyDimensions: BodyDimensions, pres: PptxPresentation): string[] {
  const errors: string[] = [];
  const widthInches = bodyDimensions.width / PX_PER_IN;
  const heightInches = bodyDimensions.height / PX_PER_IN;

  if ((pres as any).presLayout) {
    const layoutWidth = (pres as any).presLayout.width / EMU_PER_IN;
    const layoutHeight = (pres as any).presLayout.height / EMU_PER_IN;

    if (Math.abs(layoutWidth - widthInches) > 0.1 || Math.abs(layoutHeight - heightInches) > 0.1) {
      errors.push(
        `HTML dimensions (${widthInches.toFixed(1)}" × ${heightInches.toFixed(1)}") ` +
        `don't match presentation layout (${layoutWidth.toFixed(1)}" × ${layoutHeight.toFixed(1)}")`
      );
    }
  }
  return errors;
}

// ── Text Box Position Validation ───────────────────────────────────────

function validateTextBoxPosition(slideData: SlideData, bodyDimensions: BodyDimensions): string[] {
  const errors: string[] = [];
  const slideHeightInches = bodyDimensions.height / PX_PER_IN;
  const minBottomMargin = 0.5;

  for (const el of slideData.elements) {
    if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'list'].includes(el.type)) {
      const fontSize = el.style?.fontSize || 0;
      const bottomEdge = el.position.y + el.position.h;
      const distanceFromBottom = slideHeightInches - bottomEdge;

      if (fontSize > 12 && distanceFromBottom < minBottomMargin) {
        const getText = (): string => {
          if (typeof el.text === 'string') return el.text;
          if (Array.isArray(el.text)) return (el.text as TextRun[]).find(t => t.text)?.text || '';
          if (Array.isArray(el.items)) return el.items.find(item => item.text)?.text || '';
          return '';
        };
        const textContent = getText();
        const textPrefix = textContent.substring(0, 50) + (textContent.length > 50 ? '...' : '');

        errors.push(
          `Text box "${textPrefix}" ends too close to bottom edge ` +
          `(${distanceFromBottom.toFixed(2)}" from bottom, minimum ${minBottomMargin}" required)`
        );
      }
    }
  }

  return errors;
}

// ── Background ─────────────────────────────────────────────────────────

async function addBackground(
  slideData: SlideData,
  targetSlide: any,
  _tmpDir: string
): Promise<void> {
  if (slideData.background.type === 'image' && slideData.background.path) {
    let imagePath = slideData.background.path.startsWith('file://')
      ? slideData.background.path.replace('file://', '')
      : slideData.background.path;
    targetSlide.background = { path: imagePath };
  } else if (slideData.background.type === 'color' && slideData.background.value) {
    targetSlide.background = { color: slideData.background.value };
  }
}

// ── Add Elements to Slide ──────────────────────────────────────────────

function addElements(slideData: SlideData, targetSlide: any, pres: PptxPresentation): void {
  for (const el of slideData.elements) {
    if (el.type === 'image') {
      if (el.src!.startsWith('data:')) {
        targetSlide.addImage({
          data: el.src!.replace(/^data:/, ''),
          x: el.position.x,
          y: el.position.y,
          w: el.position.w,
          h: el.position.h,
        });
      } else {
        let imagePath = el.src!.startsWith('file://') ? el.src!.replace('file://', '') : el.src;
        targetSlide.addImage({
          path: imagePath,
          x: el.position.x,
          y: el.position.y,
          w: el.position.w,
          h: el.position.h,
        });
      }
    } else if (el.type === 'line') {
      targetSlide.addShape((pres as any).ShapeType.line, {
        x: el.x1,
        y: el.y1,
        w: el.x2! - el.x1!,
        h: el.y2! - el.y1!,
        line: { color: el.color, width: el.width },
      });
    } else if (el.type === 'shape') {
      const shapeOptions: Record<string, any> = {
        x: el.position.x,
        y: el.position.y,
        w: el.position.w,
        h: el.position.h,
        shape: el.shape!.rectRadius > 0
          ? (pres as any).ShapeType.roundRect
          : (pres as any).ShapeType.rect,
      };

      if (el.shape!.fill) {
        shapeOptions.fill = { color: el.shape!.fill };
        if (el.shape!.transparency != null) shapeOptions.fill.transparency = el.shape!.transparency;
      }
      if (el.shape!.line) shapeOptions.line = el.shape!.line;
      if (el.shape!.rectRadius > 0) shapeOptions.rectRadius = el.shape!.rectRadius;
      if (el.shape!.shadow) shapeOptions.shadow = el.shape!.shadow;

      targetSlide.addText(el.text || '', shapeOptions);
    } else if (el.type === 'list') {
      const listOptions: Record<string, any> = {
        x: el.position.x,
        y: el.position.y,
        w: el.position.w,
        h: el.position.h,
        fontSize: el.style!.fontSize,
        fontFace: el.style!.fontFace,
        color: el.style!.color,
        align: el.style!.align,
        valign: 'top',
        lineSpacing: el.style!.lineSpacing,
        paraSpaceBefore: el.style!.paraSpaceBefore,
        paraSpaceAfter: el.style!.paraSpaceAfter,
        margin: el.style!.margin,
      };
      if (el.style!.margin) listOptions.margin = el.style!.margin;
      targetSlide.addText(el.items, listOptions);
    } else {
      // Text elements (p, h1-h6)
      const lineHeight = el.style!.lineSpacing || el.style!.fontSize * 1.2;
      const isSingleLine = el.position.h <= lineHeight * 1.5;

      let adjustedX = el.position.x;
      let adjustedW = el.position.w;

      // Make single-line text 2% wider to account for underestimate
      if (isSingleLine) {
        const widthIncrease = el.position.w * 0.02;
        const align = el.style!.align;

        if (align === 'center') {
          adjustedX = el.position.x - widthIncrease / 2;
          adjustedW = el.position.w + widthIncrease;
        } else if (align === 'right') {
          adjustedX = el.position.x - widthIncrease;
          adjustedW = el.position.w + widthIncrease;
        } else {
          adjustedW = el.position.w + widthIncrease;
        }
      }

      const textOptions: Record<string, any> = {
        x: adjustedX,
        y: el.position.y,
        w: adjustedW,
        h: el.position.h,
        fontSize: el.style!.fontSize,
        fontFace: el.style!.fontFace,
        color: el.style!.color,
        bold: el.style!.bold,
        italic: el.style!.italic,
        underline: el.style!.underline,
        valign: 'top',
        lineSpacing: el.style!.lineSpacing,
        paraSpaceBefore: el.style!.paraSpaceBefore,
        paraSpaceAfter: el.style!.paraSpaceAfter,
        inset: 0,
      };

      if (el.style!.align) textOptions.align = el.style!.align;
      if (el.style!.margin) textOptions.margin = el.style!.margin;
      if (el.style!.rotate !== undefined) textOptions.rotate = el.style!.rotate;
      if (el.style!.transparency !== null && el.style!.transparency !== undefined) {
        textOptions.transparency = el.style!.transparency;
      }

      targetSlide.addText(el.text, textOptions);
    }
  }
}

// ── Extract Slide Data from HTML Page ──────────────────────────────────

async function extractSlideData(page: Page): Promise<SlideData> {
  return await page.evaluate(() => {
    const PT_PER_PX = 0.75;
    const PX_PER_IN = 96;

    // Fonts that are single-weight and should not have bold applied
    const SINGLE_WEIGHT_FONTS = ['impact'];

    const shouldSkipBold = (fontFamily: string): boolean => {
      if (!fontFamily) return false;
      const normalizedFont = fontFamily.toLowerCase().replace(/['"]/g, '').split(',')[0].trim();
      return SINGLE_WEIGHT_FONTS.includes(normalizedFont);
    };

    // Unit conversion helpers
    const pxToInch = (px: number): number => px / PX_PER_IN;
    const pxToPoints = (pxStr: string): number => parseFloat(pxStr) * PT_PER_PX;
    const rgbToHex = (rgbStr: string): string => {
      if (rgbStr === 'rgba(0, 0, 0, 0)' || rgbStr === 'transparent') return 'FFFFFF';
      const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return 'FFFFFF';
      return match.slice(1).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
    };

    const extractAlpha = (rgbStr: string): number | null => {
      const match = rgbStr.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (!match || !match[4]) return null;
      const alpha = parseFloat(match[4]);
      return Math.round((1 - alpha) * 100);
    };

    const applyTextTransform = (text: string, textTransform: string): string => {
      if (textTransform === 'uppercase') return text.toUpperCase();
      if (textTransform === 'lowercase') return text.toLowerCase();
      if (textTransform === 'capitalize') {
        return text.replace(/\b\w/g, c => c.toUpperCase());
      }
      return text;
    };

    // Extract rotation angle from CSS transform and writing-mode
    const getRotation = (transform: string, writingMode: string): number | null => {
      let angle = 0;

      if (writingMode === 'vertical-rl') {
        angle = 90;
      } else if (writingMode === 'vertical-lr') {
        angle = 270;
      }

      if (transform && transform !== 'none') {
        const rotateMatch = transform.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/);
        if (rotateMatch) {
          angle += parseFloat(rotateMatch[1]);
        } else {
          const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
          if (matrixMatch) {
            const values = matrixMatch[1].split(',').map(parseFloat);
            const matrixAngle = Math.atan2(values[1], values[0]) * (180 / Math.PI);
            angle += Math.round(matrixAngle);
          }
        }
      }

      angle = angle % 360;
      if (angle < 0) angle += 360;

      return angle === 0 ? null : angle;
    };

    // Get position/dimensions accounting for rotation
    const getPositionAndSize = (
      el: Element,
      rect: DOMRect,
      rotation: number | null
    ): { x: number; y: number; w: number; h: number } => {
      if (rotation === null) {
        return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
      }

      const isVertical = rotation === 90 || rotation === 270;

      if (isVertical) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        return {
          x: centerX - rect.height / 2,
          y: centerY - rect.width / 2,
          w: rect.height,
          h: rect.width,
        };
      }

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return {
        x: centerX - (el as HTMLElement).offsetWidth / 2,
        y: centerY - (el as HTMLElement).offsetHeight / 2,
        w: (el as HTMLElement).offsetWidth,
        h: (el as HTMLElement).offsetHeight,
      };
    };

    // Parse CSS box-shadow into PptxGenJS shadow properties
    const parseBoxShadow = (boxShadow: string): any | null => {
      if (!boxShadow || boxShadow === 'none') return null;

      const insetMatch = boxShadow.match(/inset/);
      // PptxGenJS/PowerPoint doesn't properly support inset shadows
      if (insetMatch) return null;

      const colorMatch = boxShadow.match(/rgba?\([^)]+\)/);
      const parts = boxShadow.match(/([-\d.]+)(px|pt)/g);

      if (!parts || parts.length < 2) return null;

      const offsetX = parseFloat(parts[0]);
      const offsetY = parseFloat(parts[1]);
      const blur = parts.length > 2 ? parseFloat(parts[2]) : 0;

      let angle = 0;
      if (offsetX !== 0 || offsetY !== 0) {
        angle = Math.atan2(offsetY, offsetX) * (180 / Math.PI);
        if (angle < 0) angle += 360;
      }

      const offset = Math.sqrt(offsetX * offsetX + offsetY * offsetY) * PT_PER_PX;

      let opacity = 0.5;
      if (colorMatch) {
        const opacityMatch = colorMatch[0].match(/[\d.]+\)$/);
        if (opacityMatch) {
          opacity = parseFloat(opacityMatch[0].replace(')', ''));
        }
      }

      return {
        type: 'outer',
        angle: Math.round(angle),
        blur: blur * 0.75,
        color: colorMatch ? rgbToHex(colorMatch[0]) : '000000',
        offset,
        opacity,
      };
    };

    // Parse inline formatting tags into text runs
    const parseInlineFormatting = (
      element: Element,
      baseOptions: Record<string, any> = {},
      runs: any[] = [],
      baseTextTransform: (s: string) => string = (x) => x
    ): any[] => {
      let prevNodeIsText = false;

      element.childNodes.forEach((node) => {
        let textTransform = baseTextTransform;

        const isText = node.nodeType === Node.TEXT_NODE || (node as Element).tagName === 'BR';
        if (isText) {
          const text = (node as Element).tagName === 'BR'
            ? '\n'
            : textTransform(node.textContent!.replace(/\s+/g, ' '));
          const prevRun = runs[runs.length - 1];
          if (prevNodeIsText && prevRun) {
            prevRun.text += text;
          } else {
            runs.push({ text, options: { ...baseOptions } });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.textContent!.trim()) {
          const options = { ...baseOptions };
          const computed = window.getComputedStyle(node as Element);

          if (['SPAN', 'B', 'STRONG', 'I', 'EM', 'U'].includes((node as Element).tagName)) {
            const isBold = computed.fontWeight === 'bold' || parseInt(computed.fontWeight) >= 600;
            if (isBold && !shouldSkipBold(computed.fontFamily)) options.bold = true;
            if (computed.fontStyle === 'italic') options.italic = true;
            if (computed.textDecoration && computed.textDecoration.includes('underline'))
              options.underline = true;
            if (computed.color && computed.color !== 'rgb(0, 0, 0)') {
              options.color = rgbToHex(computed.color);
              const transparency = extractAlpha(computed.color);
              if (transparency !== null) options.transparency = transparency;
            }
            if (computed.fontSize) options.fontSize = pxToPoints(computed.fontSize);

            if (computed.textTransform && computed.textTransform !== 'none') {
              const transformStr = computed.textTransform;
              textTransform = (text: string) => applyTextTransform(text, transformStr);
            }

            // Note: inline element margin warnings removed (too strict for our use case)

            parseInlineFormatting(node as Element, options, runs, textTransform);
          }
        }

        prevNodeIsText = isText;
      });

      // Trim leading/trailing whitespace from runs
      if (runs.length > 0) {
        runs[0].text = runs[0].text.replace(/^\s+/, '');
        runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/\s+$/, '');
      }

      return runs.filter((r: any) => r.text.length > 0);
    };

    // Extract background from body
    const body = document.body;
    const bodyStyle = window.getComputedStyle(body);
    const bgImage = bodyStyle.backgroundImage;
    const bgColor = bodyStyle.backgroundColor;

    // Collect validation errors
    const errors: string[] = [];

    // Check for CSS gradients (warning, not blocking)
    if (bgImage && (bgImage.includes('linear-gradient') || bgImage.includes('radial-gradient'))) {
      errors.push(
        'CSS gradients are not supported. Use Sharp to rasterize gradients as PNG images first, ' +
        "then reference with background-image: url('gradient.png')"
      );
    }

    let background: any;
    if (bgImage && bgImage !== 'none') {
      const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
      if (urlMatch) {
        background = { type: 'image', path: urlMatch[1] };
      } else {
        background = { type: 'color', value: rgbToHex(bgColor) };
      }
    } else {
      background = { type: 'color', value: rgbToHex(bgColor) };
    }

    // Process all elements
    const elements: any[] = [];
    const placeholders: any[] = [];
    const textTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI'];
    const processed = new Set<Element>();

    document.querySelectorAll('*').forEach((el) => {
      if (processed.has(el)) return;

      // Validate text elements don't have backgrounds, borders, or shadows
      if (textTags.includes(el.tagName)) {
        const computed = window.getComputedStyle(el);
        const hasBg = computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)';
        const hasBorder =
          (computed.borderWidth && parseFloat(computed.borderWidth) > 0) ||
          (computed.borderTopWidth && parseFloat(computed.borderTopWidth) > 0) ||
          (computed.borderRightWidth && parseFloat(computed.borderRightWidth) > 0) ||
          (computed.borderBottomWidth && parseFloat(computed.borderBottomWidth) > 0) ||
          (computed.borderLeftWidth && parseFloat(computed.borderLeftWidth) > 0);
        const hasShadow = computed.boxShadow && computed.boxShadow !== 'none';

        if (hasBg || hasBorder || hasShadow) {
          errors.push(
            `Text element <${el.tagName.toLowerCase()}> has ${hasBg ? 'background' : hasBorder ? 'border' : 'shadow'}. ` +
            'Backgrounds, borders, and shadows are only supported on <div> elements, not text elements.'
          );
          return;
        }
      }

      // Extract placeholder elements
      if (el.className && typeof el.className === 'string' && el.className.includes('placeholder')) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          errors.push(
            `Placeholder "${el.id || 'unnamed'}" has ${rect.width === 0 ? 'width: 0' : 'height: 0'}. Check the layout CSS.`
          );
        } else {
          placeholders.push({
            id: el.id || `placeholder-${placeholders.length}`,
            x: pxToInch(rect.left),
            y: pxToInch(rect.top),
            w: pxToInch(rect.width),
            h: pxToInch(rect.height),
          });
        }
        processed.add(el);
        return;
      }

      // Extract images
      if (el.tagName === 'IMG') {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          elements.push({
            type: 'image',
            src: (el as HTMLImageElement).src,
            position: {
              x: pxToInch(rect.left),
              y: pxToInch(rect.top),
              w: pxToInch(rect.width),
              h: pxToInch(rect.height),
            },
          });
          processed.add(el);
          return;
        }
      }

      // Extract DIVs with backgrounds/borders as shapes
      const isContainer = el.tagName === 'DIV' && !textTags.includes(el.tagName);
      if (isContainer) {
        const computed = window.getComputedStyle(el);
        const hasBg = computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)';

        // Check for background images on shapes (warning)
        const elBgImage = computed.backgroundImage;
        if (elBgImage && elBgImage !== 'none') {
          errors.push(
            'Background images on DIV elements are not supported. ' +
            'Use solid colors or borders for shapes, or use slide.addImage() in PptxGenJS to layer images.'
          );
          return;
        }

        // Check for borders - both uniform and partial
        const borderTop = computed.borderTopWidth;
        const borderRight = computed.borderRightWidth;
        const borderBottom = computed.borderBottomWidth;
        const borderLeft = computed.borderLeftWidth;
        const borders = [borderTop, borderRight, borderBottom, borderLeft].map(
          (b) => parseFloat(b) || 0
        );
        const hasBorder = borders.some((b) => b > 0);
        const hasUniformBorder = hasBorder && borders.every((b) => b === borders[0]);
        const borderLines: any[] = [];

        if (hasBorder && !hasUniformBorder) {
          const rect = el.getBoundingClientRect();
          const x = pxToInch(rect.left);
          const y = pxToInch(rect.top);
          const w = pxToInch(rect.width);
          const h = pxToInch(rect.height);

          if (parseFloat(borderTop) > 0) {
            const widthPt = pxToPoints(borderTop);
            const inset = widthPt / 72 / 2;
            borderLines.push({
              type: 'line',
              x1: x, y1: y + inset, x2: x + w, y2: y + inset,
              width: widthPt, color: rgbToHex(computed.borderTopColor),
            });
          }
          if (parseFloat(borderRight) > 0) {
            const widthPt = pxToPoints(borderRight);
            const inset = widthPt / 72 / 2;
            borderLines.push({
              type: 'line',
              x1: x + w - inset, y1: y, x2: x + w - inset, y2: y + h,
              width: widthPt, color: rgbToHex(computed.borderRightColor),
            });
          }
          if (parseFloat(borderBottom) > 0) {
            const widthPt = pxToPoints(borderBottom);
            const inset = widthPt / 72 / 2;
            borderLines.push({
              type: 'line',
              x1: x, y1: y + h - inset, x2: x + w, y2: y + h - inset,
              width: widthPt, color: rgbToHex(computed.borderBottomColor),
            });
          }
          if (parseFloat(borderLeft) > 0) {
            const widthPt = pxToPoints(borderLeft);
            const inset = widthPt / 72 / 2;
            borderLines.push({
              type: 'line',
              x1: x + inset, y1: y, x2: x + inset, y2: y + h,
              width: widthPt, color: rgbToHex(computed.borderLeftColor),
            });
          }
        }

        if (hasBg || hasBorder) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const shadow = parseBoxShadow(computed.boxShadow);

            if (hasBg || hasUniformBorder) {
              elements.push({
                type: 'shape',
                text: '',
                position: {
                  x: pxToInch(rect.left),
                  y: pxToInch(rect.top),
                  w: pxToInch(rect.width),
                  h: pxToInch(rect.height),
                },
                shape: {
                  fill: hasBg ? rgbToHex(computed.backgroundColor) : null,
                  transparency: hasBg ? extractAlpha(computed.backgroundColor) : null,
                  line: hasUniformBorder
                    ? {
                        color: rgbToHex(computed.borderColor),
                        width: pxToPoints(computed.borderWidth),
                      }
                    : null,
                  rectRadius: (() => {
                    const radius = computed.borderRadius;
                    const radiusValue = parseFloat(radius);
                    if (radiusValue === 0) return 0;

                    if (radius.includes('%')) {
                      if (radiusValue >= 50) return 1;
                      const minDim = Math.min(rect.width, rect.height);
                      return (radiusValue / 100) * pxToInch(minDim);
                    }

                    if (radius.includes('pt')) return radiusValue / 72;
                    return radiusValue / PX_PER_IN;
                  })(),
                  shadow,
                },
              });
            }

            elements.push(...borderLines);

            processed.add(el);
            return;
          }
        }
      }

      // Extract bullet lists as single text block
      if (el.tagName === 'UL' || el.tagName === 'OL') {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const liElements = Array.from(el.querySelectorAll('li'));
        const items: any[] = [];
        const ulComputed = window.getComputedStyle(el);
        const ulPaddingLeftPt = pxToPoints(ulComputed.paddingLeft);

        const marginLeft = ulPaddingLeftPt * 0.5;
        const textIndent = ulPaddingLeftPt * 0.5;

        liElements.forEach((li, idx) => {
          const isLast = idx === liElements.length - 1;
          const runs = parseInlineFormatting(li, { breakLine: false });
          if (runs.length > 0) {
            runs[0].text = runs[0].text.replace(/^[•\-*▪▸]\s*/, '');
            runs[0].options.bullet = { indent: textIndent };
          }
          if (runs.length > 0 && !isLast) {
            runs[runs.length - 1].options.breakLine = true;
          }
          items.push(...runs);
        });

        const computed = window.getComputedStyle(liElements[0] || el);

        elements.push({
          type: 'list',
          items,
          position: {
            x: pxToInch(rect.left),
            y: pxToInch(rect.top),
            w: pxToInch(rect.width),
            h: pxToInch(rect.height),
          },
          style: {
            fontSize: pxToPoints(computed.fontSize),
            fontFace: computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
            color: rgbToHex(computed.color),
            transparency: extractAlpha(computed.color),
            align: computed.textAlign === 'start' ? 'left' : computed.textAlign,
            lineSpacing:
              computed.lineHeight && computed.lineHeight !== 'normal'
                ? pxToPoints(computed.lineHeight)
                : null,
            paraSpaceBefore: 0,
            paraSpaceAfter: pxToPoints(computed.marginBottom),
            margin: [marginLeft, 0, 0, 0],
          },
        });

        liElements.forEach((li) => processed.add(li));
        processed.add(el);
        return;
      }

      // Extract text elements (P, H1-H6)
      if (!textTags.includes(el.tagName)) return;

      const rect = el.getBoundingClientRect();
      const text = el.textContent!.trim();
      if (rect.width === 0 || rect.height === 0 || !text) return;

      // Check for manual bullet symbols (warning, not blocking for our use case)
      if (el.tagName !== 'LI' && /^[•\-*▪▸○●◆◇■□]\s/.test(text.trimStart())) {
        errors.push(
          `Text element <${el.tagName.toLowerCase()}> starts with bullet symbol "${text.substring(0, 20)}...". ` +
          'Use <ul> or <ol> lists instead of manual bullet symbols.'
        );
        // Continue processing instead of returning (less strict than original)
      }

      const computed = window.getComputedStyle(el);
      const rotation = getRotation(computed.transform, computed.writingMode);
      const { x, y, w, h } = getPositionAndSize(el, rect, rotation);

      const baseStyle: Record<string, any> = {
        fontSize: pxToPoints(computed.fontSize),
        fontFace: computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
        color: rgbToHex(computed.color),
        align: computed.textAlign === 'start' ? 'left' : computed.textAlign,
        lineSpacing: pxToPoints(computed.lineHeight),
        paraSpaceBefore: pxToPoints(computed.marginTop),
        paraSpaceAfter: pxToPoints(computed.marginBottom),
        margin: [
          pxToPoints(computed.paddingLeft),
          pxToPoints(computed.paddingRight),
          pxToPoints(computed.paddingBottom),
          pxToPoints(computed.paddingTop),
        ],
      };

      const transparency = extractAlpha(computed.color);
      if (transparency !== null) baseStyle.transparency = transparency;

      if (rotation !== null) baseStyle.rotate = rotation;

      const hasFormatting = el.querySelector('b, i, u, strong, em, span, br');

      if (hasFormatting) {
        const transformStr = computed.textTransform;
        const runs = parseInlineFormatting(
          el,
          {},
          [],
          (str: string) => applyTextTransform(str, transformStr)
        );

        const adjustedStyle = { ...baseStyle };
        if (adjustedStyle.lineSpacing) {
          const maxFontSize = Math.max(
            adjustedStyle.fontSize,
            ...runs.map((r: any) => r.options?.fontSize || 0)
          );
          if (maxFontSize > adjustedStyle.fontSize) {
            const lineHeightMultiplier = adjustedStyle.lineSpacing / adjustedStyle.fontSize;
            adjustedStyle.lineSpacing = maxFontSize * lineHeightMultiplier;
          }
        }

        elements.push({
          type: el.tagName.toLowerCase(),
          text: runs,
          position: { x: pxToInch(x), y: pxToInch(y), w: pxToInch(w), h: pxToInch(h) },
          style: adjustedStyle,
        });
      } else {
        const textTransform = computed.textTransform;
        const transformedText = applyTextTransform(text, textTransform);

        const isBold = computed.fontWeight === 'bold' || parseInt(computed.fontWeight) >= 600;

        elements.push({
          type: el.tagName.toLowerCase(),
          text: transformedText,
          position: { x: pxToInch(x), y: pxToInch(y), w: pxToInch(w), h: pxToInch(h) },
          style: {
            ...baseStyle,
            bold: isBold && !shouldSkipBold(computed.fontFamily),
            italic: computed.fontStyle === 'italic',
            underline: computed.textDecoration.includes('underline'),
          },
        });
      }

      processed.add(el);
    });

    return { background, elements, placeholders, errors };
  });
}

// ── Main Export ─────────────────────────────────────────────────────────

export async function html2pptx(
  htmlFile: string,
  pres: PptxPresentation,
  options: Html2PptxOptions = {}
): Promise<Html2PptxResult> {
  const {
    tmpDir = process.env.TMPDIR || '/tmp',
    slide = null,
  } = options;

  let browser: Browser | undefined;

  try {
    browser = options.browser ?? await launchBrowser(tmpDir);

    let bodyDimensions: BodyDimensions;
    let slideData: SlideData;

    const filePath = path.isAbsolute(htmlFile) ? htmlFile : path.join(process.cwd(), htmlFile);
    const validationErrors: string[] = [];

    try {
      const page = await browser.newPage();

      await page.goto(`file://${filePath}`);
      await waitForDynamicLibraryRender(page);
      await rasterizeDynamicVisuals(page);

      bodyDimensions = await getBodyDimensions(page);

      await page.setViewportSize({
        width: Math.round(bodyDimensions.width),
        height: Math.round(bodyDimensions.height),
      });

      slideData = await extractSlideData(page);
    } finally {
      // Only close browser if we launched it ourselves
      if (!options.browser && browser) {
        await browser.close();
      }
    }

    // Collect validation warnings (not throwing — returned as errors array)
    if (bodyDimensions.errors && bodyDimensions.errors.length > 0) {
      validationErrors.push(...bodyDimensions.errors);
    }

    const dimensionErrors = validateDimensions(bodyDimensions, pres);
    if (dimensionErrors.length > 0) {
      validationErrors.push(...dimensionErrors);
    }

    const textBoxPositionErrors = validateTextBoxPosition(slideData, bodyDimensions);
    if (textBoxPositionErrors.length > 0) {
      validationErrors.push(...textBoxPositionErrors);
    }

    if (slideData.errors && slideData.errors.length > 0) {
      validationErrors.push(...slideData.errors);
    }

    const targetSlide = slide || pres.addSlide();

    await addBackground(slideData, targetSlide, tmpDir);
    addElements(slideData, targetSlide, pres);

    return {
      slide: targetSlide,
      placeholders: slideData.placeholders,
      errors: validationErrors,
    };
  } catch (error: any) {
    if (!error.message.startsWith(htmlFile)) {
      throw new Error(`${htmlFile}: ${error.message}`);
    }
    throw error;
  }
}

export default html2pptx;
