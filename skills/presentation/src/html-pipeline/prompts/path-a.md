# Path A: Source → slides.md → HTML

2-step process. First structure, then design.

## Step 1: Source → slides.md

Given source material, create a structured slide outline in Markdown.

Rules:
- `---` separates slides
- First slide = title slide
- `## Heading` for slide titles
- Bullet points for content
- `<!-- section: Name -->` to group related slides
- 8-15 slides for a 10-minute presentation
- Include speaker notes as `> Note: ...` blocks

Output: a single `slides.md` file.

## Step 2: slides.md → HTML files

For each slide in the outline, generate a standalone HTML file.

### HTML specification
- Body size: `width: 960px; height: 540px`
- Font: Pretendard via CDN or system sans-serif fallback
- Text only in semantic tags: `<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>`, `<li>`
- Never put text directly in `<div>` or `<span>`
- Each file is self-contained with inline `<style>` block
- File naming: `slide-01.html`, `slide-02.html`, ...

### Preset CSS variables (injected by orchestrator)
```css
{{PRESET_CSS}}
```

Use these variables in your styles: `color: var(--text-primary)`, `background: var(--bg-primary)`, etc.

### Design principles
- Less is more — aggressive whitespace, no clutter
- Typography-driven — font size contrast creates visual impact
- Limited palette — 2-3 colors from preset variables
- Professional and polished — ready for executive presentation
- Visual variety — mix layouts: hero, cards, KPI, quote, comparison, timeline

### Pretendard CDN
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
```
