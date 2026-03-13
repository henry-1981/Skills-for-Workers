# Design Specs — 정밀 시각 명세

> visual-archetypes.md가 "방향"을 정의한다면, 이 파일은 "정확한 값"을 명시한다.
> html-designer.md에서 아키타입을 선택한 후 이 파일의 해당 섹션을 참조하여 exact values를 적용한다.

---

## dark-tech

**Primary Style Source**: 01. Glassmorphism (primary) + 08. Aurora Neon Glow (variant)

**Palette**
| Role | HEX | Usage |
|------|-----|-------|
| Background | `#1A1A4E → #6B21A8 → #1E3A5F` | 3-color deep gradient; or single `#0F0F2D` |
| Glass card fill | `#FFFFFF` @ 15–20% opacity | All content containers |
| Glass card border | `#FFFFFF` @ 25% opacity | Card edges |
| Primary text | `#FFFFFF` | Title, key labels |
| Secondary text | `#E0E0F0` | Body copy |
| Accent (cyan) | `#67E8F9` | Highlights, KPI numbers |
| Accent (violet) | `#A78BFA` | Secondary accent, hover states |

**Typography**
- Heading: Segoe UI Light / Calibri Light, weight 700 (bold), 36–44pt
- Body: Segoe UI, weight 400, 14–16pt
- KPI / large numbers: same family, weight 700, 52–64pt
- Google Fonts alternative: Inter (700 / 400) — `https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap`

**Layout**
- Card-based: all content inside frosted-glass rectangles (border-radius 12–20px)
- Layer cards with slight offset and rotation ±5° to create depth
- Place large blurred ellipses (filter: blur 60–100px) behind cards as glow source
- Minimum 40px padding inside each card

**Signature Elements**
- Translucent card (background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25))
- Blurred glow blobs in background corners (absolute positioned, low-opacity)
- All containers share the same glass treatment — no opaque blocks

**Avoid**
- White or light backgrounds (kills the frosted effect)
- Fully opaque card fills
- Bright saturated solid colors outside the accent palette

**Variants**
- **aurora-neon** (08): Background `#050510`; replace glass cards with dark panels; title uses gradient text clip (green `#00FF88` → cyan `#00B4FF` → violet `#7B00FF`); Space Mono body font; blurred neon glow blobs replace glass blur
- **cyberpunk-outline** (14): Background `#0D0D0D`; all title text uses stroke-only (no fill, `#00FFC8` 1.5pt stroke); add dot-grid background overlay at 6% opacity; L-shaped corner bracket markers in all 4 corners (`#00FFC8`)
- **scifi-holographic** (29): Background `#03050D`; strict monochromatic cyan (`#00C8FF`); 3 concentric rings at varying opacity; static horizontal scan line; Space Mono exclusively

---

## swiss-minimal

**Primary Style Source**: 07. Swiss International Style (primary)

**Palette**
| Role | HEX | Usage |
|------|-----|-------|
| Background | `#FFFFFF` | Slide background (or `#FAFAFA`) |
| Primary text | `#111111` | All headings and body |
| Accent bar | `#E8000D` | Vertical left-edge rule, horizontal dividers |
| Secondary text | `#444444` | Supporting copy |
| Divider line | `#DDDDDD` | Grid lines, separators |

**Typography**
- Heading: Helvetica Neue Bold / Arial Bold, weight 700, 32–44pt, tight leading (1.1)
- Body: Helvetica Neue / Arial, weight 400, 12–14pt
- Labels/captions: Space Mono, weight 400, 9–10pt, letter-spacing 3–4px
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Space+Mono&display=swap` (for captions)

**Layout**
- Strict 12-column grid — every element snaps to column boundaries
- 4–8px wide vertical red rule on left edge (full slide height)
- Single 2px horizontal divider rule at mid-slide separating title zone from content zone
- Circle accent (red outline, no fill) in lower-right zone (40–60px diameter)
- Generous outer margins: min 48px top/bottom, min 64px left/right

**Signature Elements**
- Left-edge vertical red bar (position: absolute; left: 0; height: 100%; width: 6px; background: #E8000D)
- Horizontal rule dividing title from content area
- Grid-aligned text blocks — no decorative elements whatsoever

**Avoid**
- Decorative or illustrative elements
- Rounded corners on any element
- More than 2 font families (Helvetica/Arial + Space Mono only)

**Variants**
- **nordic-minimalism** (10): Background `#F4F1EC`; replace red accent with deep brown `#3D3530`; add one organic blob shape at low opacity as texture; DM Serif Display / Inter Light fonts; 3-dot color accent top-left; wide letter-spacing monospace caption
- **monochrome-minimal** (13): Background `#FAFAFA`; no color accent at all — pure greyscale (`#1A1A1A`, `#888888`, `#E0E0E0`, `#CCCCCC`); extreme letter-spacing on display type (8–12px); descending-width bars as visual hierarchy; single thin circle outline as focal point

---

## brutalist-typo

**Primary Style Source**: 02. Neo-Brutalism (primary) + 11. Typographic Bold (variant)

**Palette**
| Role | HEX | Usage |
|------|-----|-------|
| Background | `#F5F500` or `#CCFF00` | High-saturation yellow/lime; or `#FFFFFF` |
| Card fill | `#FFFFFF` / `#000000` | Content cards |
| Border & shadow | `#000000` | All borders, hard offset shadows |
| Primary accent | `#FF3B30` | Highlight, CTA elements |
| Secondary accent | `#0000FF` | Secondary accent |
| Text | `#000000` | All text on light backgrounds |

**Typography**
- Heading: Arial Black / Impact / Bebas Neue, weight 900, 40–56pt
- Body: Courier New / Space Mono, weight 400, 13–16pt
- Hero numbers: Arial Black, 72–96pt
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono&display=swap`

**Layout**
- Thick black borders on ALL elements (border: 3–4px solid #000000)
- Hard offset drop shadow on every card (box-shadow: 6px 6px 0 #000000 — no blur)
- Intentional slight misalignment: allow shapes to be tilted ±2–5°
- One oversized number or word that visually breaks the grid

**Signature Elements**
- Hard drop shadow (box-shadow with 0px blur, pure black, 5–8px offset)
- Thick black border on every container
- One element at extreme scale (72pt+) dominating the composition

**Avoid**
- Soft/blurred shadows
- Rounded corners (border-radius: 0 strictly)
- Pastel or muted colors

**Variants**
- **typographic-bold** (11): Background `#F0EDE8` or `#0A0A0A`; type fills the slide at 80–120pt; one accent word in signal red `#E63030`; Space Mono footnote bottom-right; no illustrations or icons — type IS the design
- **brutalist-newspaper** (22): Background aged paper `#F2EFE8`; dark masthead bar `#1A1208` full-width at top; double rule below masthead (3px + 1px); two-column layout with vertical divider; Georgia / Playfair Display for headlines; Space Mono for date labels

---

## warm-organic

**Primary Style Source**: 18. Hand-crafted Organic (primary) + 16. Pastel Soft UI (variant)

**Palette**
| Role | HEX | Usage |
|------|-----|-------|
| Background | `#FDF6EE` | Warm craft paper |
| Dashed circle outer | `#C8A882` | Outer decorative ring (dashed) |
| Solid circle inner | `#A87850` | Inner nested circle |
| Title text | `#6B4C2A` | Dark warm brown |
| Accent greens | natural greens via emoji/SVG | Leaf/botanical accents |

**Typography**
- Heading: Playfair Display Italic / Cormorant Garamond Italic, weight 400 italic, 22–34pt
- Body: EB Garamond, weight 400, 13–15pt
- Caption: Courier New, weight 400, 9pt
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&family=EB+Garamond&display=swap`

**Layout**
- Nested circles as primary decorative structure: outer dashed ring + inner solid ring, rotated 5–10° for handmade feel
- Botanical emoji or line-art leaf accents in slide corners
- Dashed horizontal rule spanning full slide width
- Italic serif title centered within the nested circles
- Generous whitespace — aim for 45%+ empty space

**Signature Elements**
- Dashed outer circle (border: 2px dashed #C8A882; slightly rotated)
- Nested solid inner circle (border: 2px solid #A87850)
- Botanical/leaf accent elements (minimum 2 corners)

**Avoid**
- Clean geometric shapes with straight edges
- Bright or synthetic colors
- Sans-serif fonts

**Variants**
- **pastel-soft-ui** (16): Background soft tricolor gradient (`#FCE4F3 → #E8F4FF → #F0FCE4`); floating frosted-white cards (background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.9)); pastel dot accents `#F9C6E8` / `#C6E8F9`; Nunito Bold / DM Sans typography; soft color-matched box-shadows
- **claymorphism** (06): Background warm peach gradient (`#FFECD2 → #FCB69F`); very high border-radius (20–32px); colored drop shadows matching element hue (not grey); inner highlight stripe at top of each element (white 30% opacity); Nunito ExtraBold typography
- **liquid-blob** (24): Background deep ocean (`#0F2027 → #2C5364`); 3 large blurred blob shapes at low opacity (`#00D2BE` 35%, `#0078FF` 30%, `#7800FF` 25%); blobs overlap with mix-blend-mode: screen; white text `#F0FFFE` with teal glow; Bebas Neue + DM Mono

---

## light-editorial

**Primary Style Source**: 15. Editorial Magazine (primary)

**Palette**
| Role | HEX | Usage |
|------|-----|-------|
| Background (main) | `#FFFFFF` | Primary slide area |
| Dark block | `#1A1A1A` | Right-zone 45% panel |
| Title | `#1A1A1A` | Main heading text |
| Rule line | `#E63030` | Short horizontal rule below title |
| Caption | `#BBBBBB` | Metadata, footnotes |

**Typography**
- Heading: Playfair Display Italic, weight 400 italic, 34–48pt
- Subhead: Space Mono, weight 400, 8–9pt, letter-spacing 2–3px
- Body: Georgia, weight 400, 11–13pt
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&family=Space+Mono&display=swap`

**Layout**
- Asymmetric two-zone layout: left 55% white area with text, right 45% dark block (`#1A1A1A`)
- Large italic serif title upper-left zone
- Thin red horizontal rule (2px) below title, approximately 200px wide
- Vertical label text rotated 90° in the dark right zone (white text)
- Column-style body text in lower-left zone

**Signature Elements**
- Asymmetric white/dark split (55/45)
- Short red rule line (2px × ~200px) below title
- Rotated 90° vertical label text in dark zone

**Avoid**
- Symmetric or centered layouts
- Sans-serif display fonts
- Full-bleed colored backgrounds

**Variants**
- **dark-academia** (04): Background deep warm brown `#1A1208`; title in antique gold `#C9A84C`; body in warm parchment `#D4BF9A`; double inset gold border frame 12–20px from slide edge; Playfair Display Italic + EB Garamond; decorative horizontal rule in gold `#3D2E10`; Space Mono footnote in muted gold `#8A7340`

---

## bento-grid

**Primary Style Source**: 03. Bento Grid

**Palette**
| Role | HEX | Usage |
|------|-----|-------|
| Background | `#F8F8F2` | Off-white slide base |
| Dark anchor cell | `#1A1A2E` | Hero/primary info cell |
| Accent cell 1 | `#E8FF3B` | Bright yellow cell |
| Accent cell 2 | `#FF6B6B` | Coral red cell |
| Accent cell 3 | `#4ECDC4` | Teal cell |
| Warm cell | `#FFE66D` | Warm yellow supporting cell |
| Cell gap | `#F8F8F2` | Background visible as gap between cells |

**Typography**
- Cell title: Inter / SF Pro Display, weight 600 (semibold), 18–24pt
- Cell body: Inter, weight 400, 12–14pt
- Large stat in dark cell: Inter / SF Pro, weight 700, 48–64pt (white text)
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap`

**Layout**
- CSS Grid layout with cells of varying sizes: min 2 cells spanning 2 columns, min 1 cell spanning 2 rows
- Gap between cells: 8–12px (background color shows as gap)
- Each cell contains exactly one focused piece of information
- Dark anchor cell carries the headline stat or primary message (white text)
- Color-coded cells use their background as the visual signal — minimal additional decoration

**Signature Elements**
- Asymmetric multi-size grid (at least one 2-column-span and one 2-row-span cell)
- One dark anchor cell with white text as visual anchor
- Maximum 5 colors across all cells (including background)

**Avoid**
- Equal-sized cells (all same width/height)
- More than 5 distinct cell colors
- Dense body text inside cells (one fact per cell)

---

## duotone-split

**Primary Style Source**: 12. Duotone / Color Split

**Palette**
| Role | HEX | Usage |
|------|-----|-------|
| Left panel | `#FF4500` | Orange-red half |
| Right panel | `#1A1A2E` | Deep navy half |
| Divider | `#FFFFFF` | Vertical split line |
| Left panel text | `#FFFFFF` | Text on orange-red side |
| Right panel text | `#FF4500` | Cross-panel echo — right text = left panel color |

**Typography**
- Panel text: Bebas Neue, weight 400, 40–56pt; vertical writing-mode optional for labels
- Caption: Space Mono, weight 400, 9pt
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono&display=swap`

**Layout**
- Strict 50/50 vertical split — each panel exactly 50% of slide width
- White divider line (2–4px) at the split boundary
- Each panel displays one concept, one word, or one data point — no more
- Text in left panel = white; text in right panel = left panel color (`#FF4500`)
- Optional: diagonal split (skew transform) instead of straight vertical

**Signature Elements**
- Exact 50/50 panel split
- White divider line at boundary
- Cross-panel color echo: right side text color = left panel background color

**Avoid**
- Three or more color panels
- Similar hues on both sides (must be high contrast — warm vs. cool)
- Busy multi-element content — maximum one idea per panel

---

## art-deco-luxe

**Primary Style Source**: 21. Art Deco Luxe

**Palette**
| Role | HEX | Usage |
|------|-----|-------|
| Background | `#0E0A05` | Deep black-brown base |
| Border / ornament | `#B8960C` | Double inset frame, fan ornaments |
| Title text | `#D4AA2A` | Rich gold heading |
| Subtitle | `#8A7020` | Muted gold supporting text |
| Diamond accent | `#B8960C` | Diamond shape at rule center intersection |

**Typography**
- Heading: Cormorant Garamond, weight 400, 26–36pt; ALL CAPS; letter-spacing 6–10px
- Caption: Space Mono, weight 400, 9pt, letter-spacing 4–5px; ALL CAPS
- No other font families permitted
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&family=Space+Mono&display=swap`

**Layout**
- Double inset gold border frame: outer rectangle (full frame) + inner rectangle (inset ~16px from outer)
- Fan / quarter-circle ornaments on left and right mid-edges (SVG or CSS border-radius)
- Thin horizontal gold rule at vertical center of slide
- Diamond (rotated 45° square, ~12px) at center of horizontal rule
- All text centered, uppercase, wide letter-spacing

**Signature Elements**
- Double concentric border frame in `#B8960C`
- Fan ornaments on both side mid-edges
- Diamond divider at center rule intersection
- ALL CAPS wide-spaced Cormorant Garamond

**Avoid**
- Modern sans-serif fonts
- Colorful or pastel tones (gold and deep black only)
- Asymmetric layouts (Art Deco is strictly symmetrical)

---

## isometric-tech

**Primary Style Source**: 19. Isometric 3D Flat

**Palette**
| Role | HEX | Usage |
|------|-----|-------|
| Background | `#1E1E2E` | Dark navy base |
| Top face | `#7C6FFF` | Lightest face — top of each cube |
| Left face | `#4A3FCC` | Darkest face — left side |
| Right face | `#6254E8` | Mid-tone face — right side |
| Highlight top face | `#A594FF` | Accent top face for secondary blocks |
| Label text | `#FFFFFF` | Space Mono labels on blocks |

**Typography**
- Labels: Space Mono, weight 400, 10–12pt, white
- Title: Bebas Neue / Barlow Condensed, weight 400, 28–40pt, white
- No other font families
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Space+Mono&family=Bebas+Neue&family=Barlow+Condensed:wght@400&display=swap`

**Layout**
- All shapes at strict isometric angle: 30° horizontal, 60° vertical (CSS transform: rotate + skewX/Y)
- Two or three stacked/arranged cube blocks as primary visual, positioned left-center
- Title text upper-right, away from block cluster
- Thin connecting lines or arrows between blocks for diagram relationships (1px white at 60% opacity)
- All blocks share the same 3-face color system (top = `#7C6FFF`, left = `#4A3FCC`, right = `#6254E8`)

**Signature Elements**
- Strict 30°/60° isometric angle on all shapes (no perspective, no vanishing point)
- 3-face shading system applied consistently across every block
- Dark navy background providing maximum contrast

**Avoid**
- Perspective/vanishing-point 3D (isometric only — all lines parallel)
- Rounded shapes or organic curves
- Light or white backgrounds

---

## blueprint

**Primary Style Source**: 27. Architectural Blueprint

**Palette**
| Role | HEX | Usage |
|------|-----|-------|
| Background | `#0D2240` | Blueprint navy |
| Fine grid | `#64B4FF` @ 12% opacity | Minor grid lines (every 20px) |
| Major grid | `#64B4FF` @ 22% opacity | Major grid lines (every 60px) |
| Shape lines | `#64C8FF` @ 60% opacity | Geometric shape outlines, dimension lines |
| Dimension / annotation text | `#64C8FF` @ 60% opacity | All measurement labels |
| Title | `#96DCFF` @ 80% opacity | Main slide title |

**Typography**
- ALL text: Space Mono exclusively — no exceptions
- Dimension annotations: Space Mono, 8pt
- Title: Space Mono, 11–13pt, letter-spacing 4px
- Stamp text: Space Mono, 8pt, multiline
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Space+Mono&display=swap`

**Layout**
- Fine grid (20px interval) layered with major grid (60px interval) across full slide
- One or two geometric shapes (rectangles, circles) drawn in outline only with dimension lines
- Arrow dimension lines between key measurement points (arrowhead at both ends)
- Circular "blueprint stamp" element right side, mid-height (~80px diameter, outline only)
- Title as full-width label at slide bottom (like a title block on a technical drawing)

**Signature Elements**
- Dual-frequency grid overlay (fine 12% + major 22% opacity)
- Dimension lines with arrow endpoints and annotation numbers
- Circular blueprint stamp (right side)
- Space Mono for every single text element without exception

**Avoid**
- Any decorative colors outside the blueprint blue palette
- Non-monospace fonts (Space Mono only, always)
- Photographic or illustrative elements
