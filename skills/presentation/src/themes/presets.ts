import { StylePreset, hexToRgb as hex } from './types.js';

export const PRESETS: Record<string, StylePreset> = {

  // ── 한국 프리미엄: 깔끔 비즈니스 ──

  'kr-corporate-navy': {
    name: '코퍼레이트 네이비',
    id: 'kr-corporate-navy',
    vibe: '신뢰, 전문, 절제, 대기업',
    mode: 'dark',
    colors: {
      bgPrimary: hex('#1B2838'),
      bgGradientEnd: hex('#0D1B2A'),
      cardBg: hex('#243447'),
      accent: hex('#4A9BD9'),
      textPrimary: hex('#F0F4F8'),
      textSecondary: hex('#8899AA'),
      textOnCard: hex('#F0F4F8'),
    },
    cardFills: [hex('#243447'), hex('#1E3A5F'), hex('#2C4A6E'), hex('#1B3352'), hex('#345882'), hex('#1B2838')],
    cardAccents: [hex('#4A9BD9'), hex('#5AABEA'), hex('#3A8BC9'), hex('#4A9BD9'), hex('#6BBBFA'), hex('#4A9BD9')],
    fonts: {
      display: { family: 'Pretendard', weight: '700', style: 'Bold' },
      body: { family: 'Pretendard', weight: '400', style: 'Regular' },
    },
    signature: ['minimal accent bar', 'structured grid', 'navy depth'],
  },

  'kr-clean-white': {
    name: '클린 화이트',
    id: 'kr-clean-white',
    vibe: '깔끔, 미니멀, 보고서, 공식',
    mode: 'light',
    colors: {
      bgPrimary: hex('#FFFFFF'),
      cardBg: hex('#F8FAFC'),
      accent: hex('#2563EB'),
      textPrimary: hex('#1E293B'),
      textSecondary: hex('#64748B'),
      textOnCard: hex('#1E293B'),
    },
    cardFills: [hex('#F1F5F9'), hex('#E2E8F0'), hex('#F8FAFC'), hex('#EFF6FF'), hex('#F1F5F9'), hex('#E2E8F0')],
    cardAccents: [hex('#2563EB'), hex('#3B82F6'), hex('#1D4ED8'), hex('#2563EB'), hex('#60A5FA'), hex('#2563EB')],
    fonts: {
      display: { family: 'Pretendard', weight: '700', style: 'Bold' },
      body: { family: 'Pretendard', weight: '400', style: 'Regular' },
    },
    signature: ['subtle borders', 'clean white space', 'blue accent'],
  },

  'kr-blue-gradient': {
    name: '블루 그라데이션',
    id: 'kr-blue-gradient',
    vibe: '전문, 세련, 발표, 컨퍼런스',
    mode: 'dark',
    colors: {
      bgPrimary: hex('#0F172A'),
      bgGradientEnd: hex('#1E3A5F'),
      cardBg: hex('#1E293B'),
      accent: hex('#38BDF8'),
      textPrimary: hex('#F0F9FF'),
      textSecondary: hex('#7DD3FC'),
      textOnCard: hex('#F0F9FF'),
    },
    cardFills: [hex('#1E293B'), hex('#0F3460'), hex('#1A365D'), hex('#1E3A5F'), hex('#234876'), hex('#0F172A')],
    cardAccents: [hex('#38BDF8'), hex('#7DD3FC'), hex('#0EA5E9'), hex('#38BDF8'), hex('#BAE6FD'), hex('#38BDF8')],
    fonts: {
      display: { family: 'Pretendard', weight: '700', style: 'Bold' },
      body: { family: 'Pretendard', weight: '400', style: 'Regular' },
    },
    signature: ['blue gradient background', 'tech professional', 'light blue accent'],
  },

  // ── 한국 프리미엄: 감성 스타트업 ──

  'kr-warm-coral': {
    name: '웜 코랄',
    id: 'kr-warm-coral',
    vibe: '따뜻한, 친근한, 스타트업, 문화',
    mode: 'light',
    colors: {
      bgPrimary: hex('#FFF8F0'),
      cardBg: hex('#FFFFFF'),
      accent: hex('#FF6B35'),
      textPrimary: hex('#374151'),
      textSecondary: hex('#6B7280'),
      textOnCard: hex('#374151'),
    },
    cardFills: [hex('#FFFFFF'), hex('#FFF1EC'), hex('#FEF3C7'), hex('#ECFDF5'), hex('#FFF8F0'), hex('#FFFFFF')],
    cardAccents: [hex('#FF6B35'), hex('#F97316'), hex('#FBBF24'), hex('#34D399'), hex('#FF6B35'), hex('#E85D3A')],
    fonts: {
      display: { family: 'Pretendard', weight: '700', style: 'Bold' },
      body: { family: 'Pretendard', weight: '400', style: 'Regular' },
    },
    signature: ['warm tones', 'rounded cards with borders', 'friendly vibe'],
  },

  'kr-mint-fresh': {
    name: '민트 프레시',
    id: 'kr-mint-fresh',
    vibe: '산뜻, 젊은, 테크, 스타트업',
    mode: 'light',
    colors: {
      bgPrimary: hex('#F0FDF4'),
      cardBg: hex('#FFFFFF'),
      accent: hex('#10B981'),
      textPrimary: hex('#1F2937'),
      textSecondary: hex('#6B7280'),
      textOnCard: hex('#1F2937'),
    },
    cardFills: [hex('#FFFFFF'), hex('#ECFDF5'), hex('#E0F2FE'), hex('#FEF3C7'), hex('#F0FDF4'), hex('#FFFFFF')],
    cardAccents: [hex('#10B981'), hex('#34D399'), hex('#06B6D4'), hex('#FBBF24'), hex('#10B981'), hex('#059669')],
    fonts: {
      display: { family: 'Pretendard', weight: '700', style: 'Bold' },
      body: { family: 'Pretendard', weight: '400', style: 'Regular' },
    },
    signature: ['mint green accent', 'light fresh feel', 'modern startup'],
  },

  // ── 한국 프리미엄: 임팩트 키노트 ──

  'kr-impact-dark': {
    name: '임팩트 다크',
    id: 'kr-impact-dark',
    vibe: '강렬, 대담, 키노트, 발표',
    mode: 'dark',
    colors: {
      bgPrimary: hex('#000000'),
      bgGradientEnd: hex('#0A0A0A'),
      cardBg: hex('#1A1A1A'),
      accent: hex('#00D4FF'),
      textPrimary: hex('#FFFFFF'),
      textSecondary: hex('#A0A0A0'),
      textOnCard: hex('#FFFFFF'),
    },
    cardFills: [hex('#1A1A1A'), hex('#1A1A2E'), hex('#262626'), hex('#1A1A1A'), hex('#2D2D2D'), hex('#111111')],
    cardAccents: [hex('#00D4FF'), hex('#00FF87'), hex('#8B5CF6'), hex('#00D4FF'), hex('#FF6B6B'), hex('#00D4FF')],
    fonts: {
      display: { family: 'Pretendard', weight: '800', style: 'ExtraBold' },
      body: { family: 'Pretendard', weight: '400', style: 'Regular' },
    },
    signature: ['pure black background', 'electric accent', 'maximum contrast'],
  },

  'kr-neon-stage': {
    name: '네온 스테이지',
    id: 'kr-neon-stage',
    vibe: '네온, 무대, 컨퍼런스, 테크',
    mode: 'dark',
    colors: {
      bgPrimary: hex('#0A0A1A'),
      bgGradientEnd: hex('#1A0A2E'),
      cardBg: hex('#1A1A2E'),
      accent: hex('#8B5CF6'),
      textPrimary: hex('#FFFFFF'),
      textSecondary: hex('#A78BFA'),
      textOnCard: hex('#FFFFFF'),
    },
    cardFills: [hex('#1A1A2E'), hex('#2D1B69'), hex('#1A2744'), hex('#1A1A2E'), hex('#3B1F8E'), hex('#0A0A1A')],
    cardAccents: [hex('#8B5CF6'), hex('#A78BFA'), hex('#06B6D4'), hex('#F472B6'), hex('#8B5CF6'), hex('#C084FC')],
    fonts: {
      display: { family: 'Pretendard', weight: '800', style: 'ExtraBold' },
      body: { family: 'Pretendard', weight: '400', style: 'Regular' },
    },
    signature: ['purple neon glow', 'stage presence', 'gradient depth'],
  },

  // ── 한국 프리미엄: 우아한 프리미엄 ──

  'kr-elegant-serif': {
    name: '엘레강트 세리프',
    id: 'kr-elegant-serif',
    vibe: '고급, 우아, 브랜드, 프리미엄',
    mode: 'light',
    colors: {
      bgPrimary: hex('#F5F0EB'),
      cardBg: hex('#FAF5EF'),
      accent: hex('#C9A96E'),
      textPrimary: hex('#3C3428'),
      textSecondary: hex('#8C8075'),
      textOnCard: hex('#3C3428'),
    },
    cardFills: [hex('#FAF5EF'), hex('#F0EBE3'), hex('#FFFFFF'), hex('#FAF5EF'), hex('#F5F0EB'), hex('#F0EBE3')],
    cardAccents: [hex('#C9A96E'), hex('#D4A76A'), hex('#B8956A'), hex('#C9A96E'), hex('#DEC89A'), hex('#C9A96E')],
    fonts: {
      display: { family: 'Nanum Myeongjo', weight: '700', style: 'Bold' },
      body: { family: 'Pretendard', weight: '400', style: 'Regular' },
    },
    signature: ['serif display font', 'gold accents', 'elegant spacing'],
  },

  'kr-gold-premium': {
    name: '골드 프리미엄',
    id: 'kr-gold-premium',
    vibe: '프리미엄, 럭셔리, 금융, 부동산',
    mode: 'dark',
    colors: {
      bgPrimary: hex('#1A1814'),
      bgGradientEnd: hex('#2C2820'),
      cardBg: hex('#2C2820'),
      accent: hex('#D4A76A'),
      textPrimary: hex('#F0EDE8'),
      textSecondary: hex('#A09080'),
      textOnCard: hex('#F0EDE8'),
    },
    cardFills: [hex('#2C2820'), hex('#3A3428'), hex('#2C2820'), hex('#342E24'), hex('#3A3428'), hex('#1A1814')],
    cardAccents: [hex('#D4A76A'), hex('#C9A96E'), hex('#E0C090'), hex('#D4A76A'), hex('#DEC89A'), hex('#B8956A')],
    fonts: {
      display: { family: 'Nanum Myeongjo', weight: '700', style: 'Bold' },
      body: { family: 'Pretendard', weight: '400', style: 'Regular' },
    },
    signature: ['dark luxury', 'gold typography', 'premium depth'],
  },
};

export const DEFAULT_PRESET = 'kr-corporate-navy';

export function getPreset(name: string): StylePreset {
  return PRESETS[name] || PRESETS[DEFAULT_PRESET];
}

export function listPresets(): string[] {
  return Object.keys(PRESETS);
}
