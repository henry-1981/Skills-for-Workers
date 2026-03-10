# Editable Mode: Source → Clean, Fully-Editable HTML Slides

Generate presentation slides as standalone HTML files optimized for full editability in PowerPoint.
Every element becomes a native PowerPoint object — text, shapes, images all individually editable by the recipient.

## Process

Given source material, generate a series of presentation slide HTML files.

### Internal planning (do not output)
1. Analyze source: key points, data, narrative flow
2. Decide slide count (8-15 for 10-minute presentation)
3. Plan visual variety: title, content, KPI, quote, comparison
4. Design narrative arc: opener → build-up → evidence → climax → closer

## HTML Specification

- **Canvas: `width: 1920px; height: 1080px`** (Full HD, mandatory)
- Each file is self-contained with inline `<style>` block
- File naming: `slide-01.html`, `slide-02.html`, ...
- Font: Pretendard via Google Fonts `@import` + Inter as fallback
- `overflow: hidden` on body

### Font Import
```html
<style>
  @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
</style>
```

## Design Philosophy — Clean & Structured

You are designing professional business slides. Prioritize clarity and structure over visual effects.
The goal is a polished, corporate-ready look that recipients can freely edit in PowerPoint.

Think: McKinsey report, clean SaaS dashboard, Swiss design.

### ALLOWED (converts to editable PowerPoint objects)
- **Solid background colors**: `background-color: #hex` on body and div elements
- **Text in semantic tags only**: `<h1>`-`<h6>`, `<p>`, `<ul>`, `<ol>`, `<li>`
- **Inline formatting**: `<b>`, `<strong>`, `<i>`, `<em>`, `<u>`, `<span>`
- **Shapes**: `<div>` with `background-color`, `border-radius`, `border`
- **Images**: `<img src="...">` tags only (positioned with CSS)
- **Outer box-shadow**: subtle drop shadows on cards
- **Layout**: `position: absolute` (recommended), `display: flex`, `display: grid` all work
- **Google Fonts + system fonts**: Pretendard, Inter, Arial, etc.

### FORBIDDEN (breaks PowerPoint editability)
- ❌ `background: linear-gradient(...)` or any gradient
- ❌ `background-image: url(...)` on divs (use `<img>` tag instead)
- ❌ `-webkit-background-clip: text` (gradient text)
- ❌ `filter: blur()`, `backdrop-filter`, `filter: drop-shadow()`
- ❌ `box-shadow: inset ...` (PowerPoint doesn't support inset shadows)
- ❌ `<table>`, `<tr>`, `<td>` — use cards, lists, or KPI blocks instead
- ❌ `<canvas>`, `<svg>` inline (use `<img>` with external file)
- ❌ Text directly inside `<div>` without semantic wrapper — always wrap in `<p>`, `<h1>`-`<h6>`, etc.
- ❌ CSS animations or transitions

### Visual Quality Targets
- Clean, solid-color backgrounds with strong color contrast
- Large, bold typography with clear hierarchy (72-96px titles, 28-36px body)
- Card-based layouts with solid backgrounds, subtle borders, rounded corners
- Generous whitespace — structured, not crowded
- Data presented as KPI blocks, bullet lists, or comparison cards (never tables)
- Accent colors from preset for visual interest without effects
- Clear section dividers using accent-colored bars or lines

### Data Presentation (no tables)
Instead of `<table>`, use these patterns:

**KPI Block:**
```html
<div style="background-color: var(--card-bg); border-radius: 16px; padding: 40px;">
  <p style="font-size: 48px; font-weight: 800; color: var(--accent);">+23%</p>
  <p style="font-size: 24px; color: var(--text-secondary);">전년 대비 성장률</p>
</div>
```

**Comparison Cards:**
```html
<div style="display: flex; gap: 24px;">
  <div style="flex: 1; background-color: var(--card-fill-0); border-radius: 16px; padding: 32px;">
    <h3 style="color: var(--text-primary); font-size: 28px;">Plan A</h3>
    <p style="color: var(--text-secondary); font-size: 20px;">Description...</p>
  </div>
  <div style="flex: 1; background-color: var(--card-fill-1); border-radius: 16px; padding: 32px;">
    <h3 style="color: var(--text-primary); font-size: 28px;">Plan B</h3>
    <p style="color: var(--text-secondary); font-size: 20px;">Description...</p>
  </div>
</div>
```

## Preset CSS Variables (injected by orchestrator)
```css
{{PRESET_CSS}}
```

Use these as your color foundation: `var(--bg-primary)`, `var(--text-primary)`, `var(--accent)`, etc.
Derive variations using opacity or preset's card-fill/card-accent variables.

## Output
Write each slide as a separate HTML file to the specified directory.
