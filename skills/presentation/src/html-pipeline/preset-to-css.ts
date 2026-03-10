import type { StylePreset, RGB } from '../themes/types.js';

function rgbToHex(rgb: RGB): string {
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function presetToCss(preset: StylePreset): string {
  const c = preset.colors;
  const lines: string[] = [
    `/* vibe: ${preset.vibe} */`,
    `/* signature: ${preset.signature.join(', ')} */`,
    `/* mode: ${preset.mode} */`,
    ':root {',
    `  --bg-primary: ${rgbToHex(c.bgPrimary)};`,
  ];

  if (c.bgGradientEnd) {
    lines.push(`  --bg-gradient-end: ${rgbToHex(c.bgGradientEnd)};`);
  }

  lines.push(
    `  --card-bg: ${rgbToHex(c.cardBg)};`,
    `  --accent: ${rgbToHex(c.accent)};`,
    `  --text-primary: ${rgbToHex(c.textPrimary)};`,
    `  --text-secondary: ${rgbToHex(c.textSecondary)};`,
    `  --text-on-card: ${rgbToHex(c.textOnCard)};`,
  );

  if (c.accentAlt) {
    lines.push(`  --accent-alt: ${rgbToHex(c.accentAlt)};`);
  }

  preset.cardFills.forEach((fill, i) => {
    lines.push(`  --card-fill-${i}: ${rgbToHex(fill)};`);
  });

  preset.cardAccents.forEach((accent, i) => {
    lines.push(`  --card-accent-${i}: ${rgbToHex(accent)};`);
  });

  lines.push(
    `  --font-display: '${preset.fonts.display.family}';`,
    `  --font-display-weight: ${preset.fonts.display.weight};`,
    `  --font-body: '${preset.fonts.body.family}';`,
    `  --font-body-weight: ${preset.fonts.body.weight};`,
    '}',
  );

  return lines.join('\n');
}
