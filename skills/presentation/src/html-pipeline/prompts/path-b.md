# Path B: Source → HTML Direct

Single step. Analyze source and generate slide HTML files directly.

## Process

Given source material, directly generate a series of presentation slide HTML files.

### Internal planning (do not output)
1. Analyze source: key points, data, narrative flow
2. Decide slide count (8-15 for 10-minute presentation)
3. Plan visual variety: title, content, KPI, quote, comparison, timeline
4. Design narrative arc: opener → build-up → evidence → climax → closer

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

### Output
Write each slide as a separate HTML file to the specified directory.
