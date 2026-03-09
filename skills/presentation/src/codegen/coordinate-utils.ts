import type { RGB } from '../themes/types.js';

export const PPTX_SLIDE = { width: 13.333, height: 7.5 } as const;
const CANVAS = { width: 1920, height: 1080 } as const;

export function pxToInch(px: number, axis: 'x' | 'w' | 'y' | 'h'): number {
  if (axis === 'x' || axis === 'w') return px / CANVAS.width * PPTX_SLIDE.width;
  return px / CANVAS.height * PPTX_SLIDE.height;
}

export function rgbToHex(c: RGB): string {
  const r = Math.round(c.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(c.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(c.b * 255).toString(16).padStart(2, '0');
  return `${r}${g}${b}`.toUpperCase();
}

export function fontPxToPt(px: number): number {
  // Proportional: canvas 1920px → 13.333" → 72pt/inch = px * 0.5
  return Math.round(px * 0.5);
}
