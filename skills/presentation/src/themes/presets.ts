import { StylePreset, hexToRgb as hex } from './types.js';

export const PRESETS: Record<string, StylePreset> = {

  // ── Dark Themes ──

  'bold-signal': {
    name: 'Bold Signal',
    id: 'bold-signal',
    vibe: 'confident, bold, modern, high-impact',
    mode: 'dark',
    colors: {
      bgPrimary: hex('#1a1a1a'),
      bgGradientEnd: hex('#2d2d2d'),
      cardBg: hex('#FF5722'),
      accent: hex('#FF5722'),
      textPrimary: hex('#ffffff'),
      textSecondary: hex('#999999'),
      textOnCard: hex('#1a1a1a'),
    },
    cardFills: [hex('#FF5722'), hex('#E64A19'), hex('#2d2d2d'), hex('#3d3d3d'), hex('#FF7043'), hex('#1a1a1a')],
    cardAccents: [hex('#FF5722'), hex('#FF7043'), hex('#ffffff'), hex('#E64A19'), hex('#FFAB91'), hex('#FF5722')],
    fonts: {
      display: { family: 'Archivo Black', weight: '400', figmaStyle: 'Regular' },
      body: { family: 'Space Grotesk', weight: '400', figmaStyle: 'Regular' },
    },
    signature: ['bold colored card as focal point', 'large section numbers', 'navigation breadcrumbs'],
  },

  'electric-studio': {
    name: 'Electric Studio',
    id: 'electric-studio',
    vibe: 'bold, clean, professional, high contrast',
    mode: 'dark',
    colors: {
      bgPrimary: hex('#0a0a0a'),
      cardBg: hex('#ffffff'),
      accent: hex('#4361ee'),
      textPrimary: hex('#ffffff'),
      textSecondary: hex('#888888'),
      textOnCard: hex('#0a0a0a'),
    },
    cardFills: [hex('#ffffff'), hex('#4361ee'), hex('#1a1a2e'), hex('#2a2a3e'), hex('#3a3a4e'), hex('#0a0a0a')],
    cardAccents: [hex('#4361ee'), hex('#ffffff'), hex('#4361ee'), hex('#6381ff'), hex('#4361ee'), hex('#ffffff')],
    fonts: {
      display: { family: 'Manrope', weight: '800', figmaStyle: 'ExtraBold' },
      body: { family: 'Manrope', weight: '400', figmaStyle: 'Regular' },
    },
    signature: ['two-panel vertical split', 'accent bar on panel edge', 'quote as hero element'],
  },

  'creative-voltage': {
    name: 'Creative Voltage',
    id: 'creative-voltage',
    vibe: 'bold, creative, energetic, retro-modern',
    mode: 'dark',
    colors: {
      bgPrimary: hex('#0066ff'),
      accent: hex('#d4ff00'),
      cardBg: hex('#1a1a2e'),
      textPrimary: hex('#ffffff'),
      textSecondary: hex('#aaaacc'),
      textOnCard: hex('#ffffff'),
    },
    cardFills: [hex('#0066ff'), hex('#1a1a2e'), hex('#0044cc'), hex('#2a2a4e'), hex('#0055dd'), hex('#3a3a5e')],
    cardAccents: [hex('#d4ff00'), hex('#0066ff'), hex('#d4ff00'), hex('#ffffff'), hex('#d4ff00'), hex('#0066ff')],
    fonts: {
      display: { family: 'Syne', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'Space Mono', weight: '400', figmaStyle: 'Regular' },
    },
    signature: ['electric blue + neon yellow contrast', 'halftone texture patterns', 'neon badges'],
  },

  'dark-botanical': {
    name: 'Dark Botanical',
    id: 'dark-botanical',
    vibe: 'elegant, sophisticated, artistic, premium',
    mode: 'dark',
    colors: {
      bgPrimary: hex('#0f0f0f'),
      accent: hex('#d4a574'),
      accentAlt: hex('#e8b4b8'),
      cardBg: hex('#1a1a1a'),
      textPrimary: hex('#e8e4df'),
      textSecondary: hex('#9a9590'),
      textOnCard: hex('#e8e4df'),
    },
    cardFills: [hex('#1a1a1a'), hex('#1f1a18'), hex('#181a1f'), hex('#1a1818'), hex('#1d1a1f'), hex('#1a1d1a')],
    cardAccents: [hex('#d4a574'), hex('#e8b4b8'), hex('#c9b896'), hex('#d4a574'), hex('#e8b4b8'), hex('#c9b896')],
    fonts: {
      display: { family: 'Cormorant', weight: '600', figmaStyle: 'SemiBold' },
      body: { family: 'IBM Plex Sans', weight: '300', figmaStyle: 'Light' },
    },
    signature: ['abstract soft gradient circles', 'warm accents (pink, gold, terracotta)', 'italic signature typography'],
  },

  // ── Light Themes ──

  'notebook-tabs': {
    name: 'Notebook Tabs',
    id: 'notebook-tabs',
    vibe: 'editorial, organized, elegant, tactile',
    mode: 'light',
    colors: {
      bgPrimary: hex('#2d2d2d'),
      cardBg: hex('#f8f6f1'),
      accent: hex('#98d4bb'),
      accentAlt: hex('#c7b8ea'),
      textPrimary: hex('#1a1a1a'),
      textSecondary: hex('#555555'),
      textOnCard: hex('#1a1a1a'),
    },
    cardFills: [hex('#f8f6f1'), hex('#98d4bb'), hex('#c7b8ea'), hex('#f4b8c5'), hex('#a8d8ea'), hex('#ffe6a7')],
    cardAccents: [hex('#98d4bb'), hex('#c7b8ea'), hex('#f4b8c5'), hex('#a8d8ea'), hex('#ffe6a7'), hex('#98d4bb')],
    fonts: {
      display: { family: 'Bodoni Moda', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'DM Sans', weight: '400', figmaStyle: 'Regular' },
    },
    signature: ['paper container with shadow', 'colorful section tabs', 'binder hole decorations'],
  },

  'pastel-geometry': {
    name: 'Pastel Geometry',
    id: 'pastel-geometry',
    vibe: 'friendly, organized, modern, approachable',
    mode: 'light',
    colors: {
      bgPrimary: hex('#c8d9e6'),
      cardBg: hex('#faf9f7'),
      accent: hex('#5a7c6a'),
      textPrimary: hex('#1a1a1a'),
      textSecondary: hex('#666666'),
      textOnCard: hex('#1a1a1a'),
    },
    cardFills: [hex('#faf9f7'), hex('#f0b4d4'), hex('#a8d4c4'), hex('#9b8dc4'), hex('#7c6aad'), hex('#faf9f7')],
    cardAccents: [hex('#5a7c6a'), hex('#f0b4d4'), hex('#a8d4c4'), hex('#9b8dc4'), hex('#7c6aad'), hex('#5a7c6a')],
    fonts: {
      display: { family: 'Plus Jakarta Sans', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'Plus Jakarta Sans', weight: '400', figmaStyle: 'Regular' },
    },
    signature: ['rounded card with soft shadow', 'vertical pills on right edge'],
  },

  'split-pastel': {
    name: 'Split Pastel',
    id: 'split-pastel',
    vibe: 'playful, modern, friendly, creative',
    mode: 'light',
    colors: {
      bgPrimary: hex('#f5e6dc'),
      accent: hex('#c8f0d8'),
      accentAlt: hex('#e4dff0'),
      cardBg: hex('#e4dff0'),
      textPrimary: hex('#1a1a1a'),
      textSecondary: hex('#555555'),
      textOnCard: hex('#1a1a1a'),
    },
    cardFills: [hex('#eed8cc'), hex('#e4dff0'), hex('#c8f0d8'), hex('#f0f0c8'), hex('#f0d4e0'), hex('#e4dff0')],
    cardAccents: [hex('#c8f0d8'), hex('#f0f0c8'), hex('#f0d4e0'), hex('#c8f0d8'), hex('#f0f0c8'), hex('#f0d4e0')],
    fonts: {
      display: { family: 'Outfit', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'Outfit', weight: '400', figmaStyle: 'Regular' },
    },
    signature: ['split background colors', 'playful badge pills', 'grid pattern overlay'],
  },

  'vintage-editorial': {
    name: 'Vintage Editorial',
    id: 'vintage-editorial',
    vibe: 'witty, confident, editorial, personality-driven',
    mode: 'light',
    colors: {
      bgPrimary: hex('#f5f3ee'),
      accent: hex('#e8d4c0'),
      cardBg: hex('#ffffff'),
      textPrimary: hex('#1a1a1a'),
      textSecondary: hex('#555555'),
      textOnCard: hex('#1a1a1a'),
    },
    cardFills: [hex('#ffffff'), hex('#ebe8e1'), hex('#e8d4c0'), hex('#f0ece6'), hex('#ffffff'), hex('#e8d4c0')],
    cardAccents: [hex('#e8d4c0'), hex('#1a1a1a'), hex('#e8d4c0'), hex('#1a1a1a'), hex('#e8d4c0'), hex('#1a1a1a')],
    fonts: {
      display: { family: 'Fraunces', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'Work Sans', weight: '400', figmaStyle: 'Regular' },
    },
    signature: ['abstract geometric shapes', 'bold bordered CTA boxes', 'witty conversational copy'],
  },

  // ── Specialty Themes ──

  'neon-cyber': {
    name: 'Neon Cyber',
    id: 'neon-cyber',
    vibe: 'futuristic, techy, confident',
    mode: 'dark',
    colors: {
      bgPrimary: hex('#0a0f1c'),
      accent: hex('#00ffcc'),
      accentAlt: hex('#ff00aa'),
      cardBg: hex('#121830'),
      textPrimary: hex('#e0e0ff'),
      textSecondary: hex('#6688aa'),
      textOnCard: hex('#e0e0ff'),
    },
    cardFills: [hex('#121830'), hex('#1a1040'), hex('#0a2030'), hex('#1a0a30'), hex('#102030'), hex('#200a20')],
    cardAccents: [hex('#00ffcc'), hex('#ff00aa'), hex('#00ffcc'), hex('#ff00aa'), hex('#00ffcc'), hex('#ff00aa')],
    fonts: {
      display: { family: 'Rajdhani', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'Inter', weight: '400', figmaStyle: 'Regular' },
    },
    signature: ['neon glow effects', 'grid patterns', 'particle backgrounds'],
  },

  'terminal-green': {
    name: 'Terminal Green',
    id: 'terminal-green',
    vibe: 'developer-focused, hacker aesthetic',
    mode: 'dark',
    colors: {
      bgPrimary: hex('#0d1117'),
      accent: hex('#39d353'),
      cardBg: hex('#161b22'),
      textPrimary: hex('#c9d1d9'),
      textSecondary: hex('#8b949e'),
      textOnCard: hex('#c9d1d9'),
    },
    cardFills: [hex('#161b22'), hex('#1a2233'), hex('#0d1117'), hex('#1c2333'), hex('#131b27'), hex('#1a2030')],
    cardAccents: [hex('#39d353'), hex('#58a6ff'), hex('#39d353'), hex('#58a6ff'), hex('#39d353'), hex('#58a6ff')],
    fonts: {
      display: { family: 'JetBrains Mono', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'JetBrains Mono', weight: '400', figmaStyle: 'Regular' },
    },
    signature: ['scan lines', 'blinking cursor', 'code syntax styling'],
  },

  'swiss-modern': {
    name: 'Swiss Modern',
    id: 'swiss-modern',
    vibe: 'clean, precise, Bauhaus-inspired',
    mode: 'light',
    colors: {
      bgPrimary: hex('#ffffff'),
      accent: hex('#ff3300'),
      cardBg: hex('#f5f5f5'),
      textPrimary: hex('#000000'),
      textSecondary: hex('#666666'),
      textOnCard: hex('#000000'),
    },
    cardFills: [hex('#f5f5f5'), hex('#000000'), hex('#ff3300'), hex('#ffffff'), hex('#e0e0e0'), hex('#f5f5f5')],
    cardAccents: [hex('#ff3300'), hex('#ffffff'), hex('#000000'), hex('#ff3300'), hex('#000000'), hex('#ff3300')],
    fonts: {
      display: { family: 'Archivo', weight: '800', figmaStyle: 'ExtraBold' },
      body: { family: 'Nunito', weight: '400', figmaStyle: 'Regular' },
    },
    signature: ['visible grid', 'asymmetric layouts', 'geometric shapes'],
  },

  'paper-ink': {
    name: 'Paper & Ink',
    id: 'paper-ink',
    vibe: 'editorial, literary, thoughtful',
    mode: 'light',
    colors: {
      bgPrimary: hex('#faf9f7'),
      accent: hex('#c41e3a'),
      cardBg: hex('#ffffff'),
      textPrimary: hex('#1a1a1a'),
      textSecondary: hex('#555555'),
      textOnCard: hex('#1a1a1a'),
    },
    cardFills: [hex('#ffffff'), hex('#f0ede8'), hex('#f0ece6'), hex('#ffffff'), hex('#f5f3ee'), hex('#f0ede8')],
    cardAccents: [hex('#c41e3a'), hex('#1a1a1a'), hex('#c41e3a'), hex('#1a1a1a'), hex('#c41e3a'), hex('#1a1a1a')],
    fonts: {
      display: { family: 'Cormorant Garamond', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'Source Serif 4', weight: '400', figmaStyle: 'Regular' },
    },
    signature: ['drop caps', 'pull quotes', 'elegant horizontal rules'],
  },
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
      display: { family: 'Pretendard', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'Pretendard', weight: '400', figmaStyle: 'Regular' },
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
      display: { family: 'Pretendard', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'Pretendard', weight: '400', figmaStyle: 'Regular' },
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
      display: { family: 'Pretendard', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'Pretendard', weight: '400', figmaStyle: 'Regular' },
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
      display: { family: 'Pretendard', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'Pretendard', weight: '400', figmaStyle: 'Regular' },
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
      display: { family: 'Pretendard', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'Pretendard', weight: '400', figmaStyle: 'Regular' },
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
      display: { family: 'Pretendard', weight: '800', figmaStyle: 'ExtraBold' },
      body: { family: 'Pretendard', weight: '400', figmaStyle: 'Regular' },
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
      display: { family: 'Pretendard', weight: '800', figmaStyle: 'ExtraBold' },
      body: { family: 'Pretendard', weight: '400', figmaStyle: 'Regular' },
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
      display: { family: 'Nanum Myeongjo', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'Pretendard', weight: '400', figmaStyle: 'Regular' },
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
      display: { family: 'Nanum Myeongjo', weight: '700', figmaStyle: 'Bold' },
      body: { family: 'Pretendard', weight: '400', figmaStyle: 'Regular' },
    },
    signature: ['dark luxury', 'gold typography', 'premium depth'],
  },
};

export const DEFAULT_PRESET = 'bold-signal';

export function getPreset(name: string): StylePreset {
  return PRESETS[name] || PRESETS[DEFAULT_PRESET];
}

export function listPresets(): string[] {
  return Object.keys(PRESETS);
}
