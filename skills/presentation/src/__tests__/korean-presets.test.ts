import { describe, it, expect } from 'vitest';
import { getPreset, listPresets } from '../themes/presets.js';
import { resolveTokens } from '../codegen/bento-layouts.js';

const KOREAN_PRESETS = [
  'kr-corporate-navy',
  'kr-clean-white',
  'kr-blue-gradient',
  'kr-warm-coral',
  'kr-mint-fresh',
  'kr-impact-dark',
  'kr-neon-stage',
  'kr-elegant-serif',
  'kr-gold-premium',
];

describe('Korean premium presets', () => {
  it('should have all 9 Korean presets registered', () => {
    const all = listPresets();
    for (const id of KOREAN_PRESETS) {
      expect(all).toContain(id);
    }
  });

  it('should resolve tokens for each Korean preset', () => {
    for (const id of KOREAN_PRESETS) {
      const preset = getPreset(id);
      const tokens = resolveTokens(preset);
      expect(tokens.bg).toBeDefined();
      expect(tokens.fontFamily.display).toBeDefined();
      expect(tokens.cardFills.neutral).toBeDefined();
    }
  });

  it('should use Pretendard for most Korean presets', () => {
    const pretendardPresets = KOREAN_PRESETS.filter(id => {
      const p = getPreset(id);
      return p.fonts.body.family === 'Pretendard';
    });
    expect(pretendardPresets.length).toBeGreaterThanOrEqual(7);
  });

  it('should use serif font for elegant presets', () => {
    const elegant = getPreset('kr-elegant-serif');
    expect(elegant.fonts.display.family).toBe('Nanum Myeongjo');
    const gold = getPreset('kr-gold-premium');
    expect(gold.fonts.display.family).toBe('Nanum Myeongjo');
  });
});
