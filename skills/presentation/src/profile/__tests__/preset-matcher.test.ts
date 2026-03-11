import { describe, it, expect } from 'vitest';
import { colorDistance, matchPreset } from '../preset-matcher.js';
import type { ExtractedStyle } from '../types.js';

describe('colorDistance', () => {
  it('should return 0 for identical colors', () => {
    expect(colorDistance('#FF5722', '#FF5722')).toBe(0);
  });

  it('should return large distance for black vs white', () => {
    const d = colorDistance('#000000', '#FFFFFF');
    expect(d).toBeGreaterThan(400);
  });

  it('should be symmetric', () => {
    const d1 = colorDistance('#FF0000', '#00FF00');
    const d2 = colorDistance('#00FF00', '#FF0000');
    expect(d1).toBe(d2);
  });

  it('should return 0 for same color regardless of case', () => {
    expect(colorDistance('#ff5722', '#FF5722')).toBe(0);
  });
});

describe('matchPreset', () => {
  it('should match a dark kr-* preset for dark bg + warm accent', () => {
    const style: ExtractedStyle = {
      bgColor: '#1a1a1a',
      accentColor: '#FF5722',
    };
    const result = matchPreset(style);
    expect(result.id).toMatch(/^kr-/);
    expect(result.mode).toBe('dark');
  });

  it('should match kr-clean-white for white bg + blue accent', () => {
    // kr-clean-white: bgPrimary=#FFFFFF, accent=#2563EB
    const style: ExtractedStyle = {
      bgColor: '#FFFFFF',
      accentColor: '#2563EB',
    };
    const result = matchPreset(style);
    expect(result.id).toBe('kr-clean-white');
  });

  it('should return a valid preset even with empty style', () => {
    const result = matchPreset({});
    expect(result).toBeDefined();
    expect(result.id).toBeTruthy();
  });

  it('should return a valid preset with only bgColor', () => {
    const result = matchPreset({ bgColor: '#000000' });
    expect(result).toBeDefined();
    expect(result.mode).toBe('dark'); // black bg should match dark theme
  });
});
