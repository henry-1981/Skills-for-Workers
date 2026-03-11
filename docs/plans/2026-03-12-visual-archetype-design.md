# Visual Archetype Pool Design

**Date**: 2026-03-12
**Status**: Approved
**Problem**: 자유 모드와 프리셋 모드가 동일한 구도(dark-gradient-card)로 수렴
**Solution**: 자유 모드 전용 Visual Archetype Pool + 프로필 양방향 연동

## Problem Analysis

자유 모드에서 구도가 수렴하는 원인 3곳:

| Layer | Convergence Cause |
|-------|-------------------|
| hybrid-free.md Internal Planning Step 3 | "title, content, KPI, quote, comparison, timeline" — content type vocabulary forces same layout patterns |
| hybrid-free.md Quality Targets | "conference keynote" framing + "80-100px titles" + "No plain white" — biases toward dark-tech aesthetic |
| html-generation.md | Shared constraints ("같은 레이아웃 5장 연속 금지") apply to both modes |

Root cause: LLM training bias toward dark-gradient-card presentations, amplified by prompt language that reinforces this single aesthetic.

## Design

### 1. Visual Archetypes (`references/visual-archetypes.md`)

5 archetypes, each defining mood/color philosophy/layout tendency/typography/content fit:

- **dark-tech**: deep dark + neon accents, card-based, glow, ExtraBold gradient text
- **light-editorial**: bright backgrounds, serif/light sans, asymmetric text, editorial
- **brutalist-typo**: high contrast B&W + 1 accent, extreme size contrast, grid-breaking
- **warm-organic**: warm neutrals (beige/terracotta/olive), rounded, soft shadows
- **swiss-minimal**: strict grid, achromatic + 1 accent, single font family, weight hierarchy

Archetype vs Preset distinction:
- Preset = CSS variable values (deterministic) → preset mode only
- Archetype = design philosophy (LLM interprets freely) → free mode only

### 2. hybrid-free.md Overhaul

Remove convergence language:
- Delete: content type vocabulary (Step 3), "conference keynote", "80-100px", "No plain white"
- Replace: Step 5 → archetype selection, Quality Targets → archetype interpretation guide

New structure:
```
Process (5 steps: analyze → count → narrative arc → select archetype → plan per-slide message+layout)
HTML Specification (unchanged)
Message Design (unchanged — 4 rules + 5 anti-patterns)
Visual Archetype Interpretation (new — "archetype is starting point, not spec")
CSS Freedom (short — "all CSS available, express within archetype direction")
Output
```

### 3. SKILL.md Phase 1 + Phase 5

Phase 1 addition (after design mode selection):
- Free mode → Step 4a: collect mood keyword
  - Profile has preferred archetype → auto-recommend
  - No profile → ask: "어떤 분위기를 원하세요?" or "맡겨주셔도 됩니다"
  - Mood keyword → archetype mapping (LLM natural judgment, no hardcoded table)
  - No keyword → LLM selects based on content analysis

Phase 5 addition:
- 5a: `update-archetype "<purpose>" "<archetype>"` — usage count accumulation
- 5b: my-visual.md `## Archetype Overrides` section — per-archetype customization notes
- 5c: confirmation pattern (same as preset)

### 4. html-generation.md Cleanup

- Remove: "컨퍼런스 키노트 수준" framing, "같은 레이아웃 5장 연속 금지"
- Keep: text density guide (50-100 words), basic HTML spec
- Add: free mode example (no CSS variables)

### 5. profile/cli.ts

Add `update-archetype` command. Stores in my-defaults.md YAML frontmatter:
```yaml
archetype_usage:
  trend-report:
    warm-organic: 2
    dark-tech: 1
  internal-report:
    swiss-minimal: 3
```

## File Changes

| File | Action | Size |
|------|--------|------|
| `references/visual-archetypes.md` | New | ~80 lines |
| `prompts/hybrid-free.md` | Rewrite | ~70 lines (from 94) |
| `references/html-generation.md` | Edit | Minor |
| `skills/presentation/SKILL.md` | Edit | Phase 1 + Phase 5 |
| `src/profile/cli.ts` | Edit | 1 command add |

## YAGNI — Not Implementing

- hybrid.md (preset mode) unchanged — archetypes are free mode only
- Auto-generate/delete archetypes — manual editing sufficient
- Mood→archetype mapping table — LLM natural judgment
- Mid-deck archetype switching — one deck = one archetype

## Verification Plan

1. Same topic ("AI 트렌드 2026" 5 slides) per archetype → visual diff confirmation
2. 3 runs without mood keyword → dark-tech bias resolved?
3. Profile accumulation → auto-recommendation works?
