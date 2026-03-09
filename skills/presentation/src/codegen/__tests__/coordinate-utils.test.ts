import { describe, it, expect } from 'vitest';
import { pxToInch, rgbToHex, fontPxToPt, PPTX_SLIDE } from '../coordinate-utils.js';

describe('pxToInch', () => {
  it('converts 0 to 0 on both axes', () => {
    expect(pxToInch(0, 'x')).toBe(0);
    expect(pxToInch(0, 'y')).toBe(0);
  });

  it('converts full canvas width (1920) to slide width (13.333)', () => {
    expect(pxToInch(1920, 'x')).toBeCloseTo(13.333, 3);
    expect(pxToInch(1920, 'w')).toBeCloseTo(13.333, 3);
  });

  it('converts full canvas height (1080) to slide height (7.5)', () => {
    expect(pxToInch(1080, 'y')).toBeCloseTo(7.5, 3);
    expect(pxToInch(1080, 'h')).toBeCloseTo(7.5, 3);
  });

  it('converts mid-point values correctly', () => {
    // 960px = half of 1920 → 6.6665"
    expect(pxToInch(960, 'x')).toBeCloseTo(PPTX_SLIDE.width / 2, 3);
    // 540px = half of 1080 → 3.75"
    expect(pxToInch(540, 'y')).toBeCloseTo(PPTX_SLIDE.height / 2, 3);
  });

  it('converts left margin (80px) correctly', () => {
    // 80 / 1920 * 13.333 ≈ 0.5555"
    expect(pxToInch(80, 'x')).toBeCloseTo(80 / 1920 * 13.333, 3);
  });
});

describe('rgbToHex', () => {
  it('converts pure red', () => {
    expect(rgbToHex({ r: 1, g: 0, b: 0 })).toBe('FF0000');
  });

  it('converts pure green', () => {
    expect(rgbToHex({ r: 0, g: 1, b: 0 })).toBe('00FF00');
  });

  it('converts pure blue', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 1 })).toBe('0000FF');
  });

  it('converts black', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('000000');
  });

  it('converts white', () => {
    expect(rgbToHex({ r: 1, g: 1, b: 1 })).toBe('FFFFFF');
  });

  it('rounds fractional values correctly', () => {
    // 0.5 * 255 = 127.5 → rounds to 128 = 0x80
    expect(rgbToHex({ r: 0.5, g: 0.5, b: 0.5 })).toBe('808080');
  });

  it('handles typical Figma RGB values', () => {
    // e.g. {r: 0.2, g: 0.4, b: 0.8} → 33/102/204 → '2166CC'
    expect(rgbToHex({ r: 0.2, g: 0.4, b: 0.8 })).toBe('3366CC');
  });
});

describe('fontPxToPt', () => {
  it('converts standard Figma font sizes (proportional 0.5)', () => {
    // Proportional: 1920px canvas → 13.333" → factor = 13.333/1920*72 ≈ 0.5
    expect(fontPxToPt(60)).toBe(30);
    expect(fontPxToPt(48)).toBe(24);
    expect(fontPxToPt(36)).toBe(18);
    expect(fontPxToPt(24)).toBe(12);
  });

  it('converts small sizes', () => {
    expect(fontPxToPt(16)).toBe(8);
    expect(fontPxToPt(12)).toBe(6);
  });

  it('rounds correctly for odd values', () => {
    // 28 * 0.5 = 14
    expect(fontPxToPt(28)).toBe(14);
    // 13 * 0.5 = 6.5 → rounds to 7 (Math.round)
    expect(fontPxToPt(13)).toBe(7);
  });
});
