# Benchmark & Gap Analysis: pptx-design-styles

**Date**: 2026-03-13
**Author**: HB
**Status**: Approved

## Objective

Compare our Presentation Plugin's visual quality against [corazzon/pptx-design-styles](https://github.com/corazzon/pptx-design-styles) (30 curated design style specs), then selectively adopt superior patterns.

## Background

- **pptx-design-styles**: Pure markdown reference system. 30 styles with exact HEX colors, font pairings, layout percentages, signature elements, and anti-patterns. No code generation.
- **Our plugin**: 5 Visual Archetypes with philosophical descriptions → 4-Agent Pipeline → actual PPTX output. Archetypes lack precision specs.
- **Core gap**: Our archetype descriptions are directional (mood/tendency), theirs are prescriptive (exact values).

## Approach

Phase 1 → Phase 2 → Phase 3, data-driven.

---

## Phase 1: Benchmarking

### Setup

| Version | html-designer.md | Change |
|---------|-----------------|--------|
| Before | Current (5 archetypes, philosophical) | None |
| After | + `references/styles.md` from pptx-design-styles as `## Design Style Reference` block | Temporary, removed post-experiment |

### Test Topics (3)

| # | Topic | Archetype | Rationale |
|---|-------|-----------|-----------|
| 1 | AI 코딩 어시스턴트 도입 제안 | dark-tech | Has baseline score from 2026-03-12 e2e run (quality: 89/100) |
| 2 | 분기 매출 실적 보고 | swiss-minimal | Corporate document archetype |
| 3 | 브랜드 런칭 전략 | brutalist-typo | Creative archetype |

### Measurement

- **Primary metric**: LLM-as-Judge quality score delta (Before vs After) using existing `rubric.md`
- **Secondary**: Qualitative diff on visual precision (color choices, typography, layout specificity)
- Structural score expected 100/100 both versions — not the focus

### Output

`docs/experiments/benchmark-styles/` — 3 Before/After run results + score delta table

---

## Phase 2: Gap Analysis

### Mapping: 30 Styles → 5 Archetypes

| Our Archetype | pptx-design-styles Equivalents | Gap |
|--------------|-------------------------------|-----|
| dark-tech | Glassmorphism, Aurora Neon Glow, Cyberpunk Outline, SciFi Holographic | Precision: we have mood, they have HEX+font spec |
| swiss-minimal | Swiss International, Nordic Minimalism, Monochrome Minimal | Same category, they have exact layout % |
| brutalist-typo | Neo-Brutalism, Typographic Bold, Brutalist Newspaper | Same, they add Maximalist Collage variant |
| warm-organic | Hand-crafted Organic, Claymorphism, Pastel Soft UI | Same, they add Stained Glass, Liquid Blob |
| light-editorial | Editorial Magazine, Art Deco Luxe, Dark Academia | Partial overlap — we conflate 3 distinct styles |
| **Not in ours** | Retro Y2K, Vaporwave, Memphis Pop, Bento Grid, Risograph Print, Gradient Mesh, Isometric 3D, Duotone Split, Dark Forest, Architectural Blueprint, + more | ~15 uncovered styles |

### Output

`docs/experiments/benchmark-styles/gap-analysis.md` — full mapping table + adoption recommendations

---

## Phase 3: Integration

### C — Visual Archetype Pool Expansion

- **Target**: 5 archetypes → ~12 (selection based on Phase 1 score delta + Phase 2 gap priority)
- **File**: `references/visual-archetypes.md` — update existing entries with precision specs, add new archetypes
- **Selection criteria**: (1) benchmark showed meaningful quality gain, (2) relevant to internal use cases, (3) distinct from existing archetypes

### D — Design Spec Independent Layer

New file: `references/design-specs.md`

Structure per archetype:
```markdown
## [archetype-name]

**Palette**: Primary #XXXXXX · Accent #XXXXXX · Background #XXXXXX
**Typography**: Heading [font, weight, size] · Body [font, weight, size]
**Layout**: [grid/spacing rules, key proportions]
**Signature elements**: [non-negotiable visual markers]
**Avoid**: [common pitfalls]
```

**Pipeline change**: `html-designer.md` references `design-specs.md` via Read instruction (agent reads file at runtime), keeping the prompt itself lean.

```
Before: html-designer.md (philosophical archetype descriptions inline)
After:  html-designer.md → Read(references/design-specs.md) → precise spec per archetype
```

---

## Success Criteria

| Phase | Done When |
|-------|-----------|
| Phase 1 | 3 Before/After runs complete, score delta table exists |
| Phase 2 | All 30 styles mapped, adoption list finalized |
| Phase 3 | design-specs.md created, visual-archetypes.md updated, html-designer.md updated, regression e2e passes |

## Files Touched

| File | Change |
|------|--------|
| `skills/presentation/src/html-pipeline/prompts/html-designer.md` | Phase 1 temp inject → Phase 3 spec reference |
| `skills/presentation/references/visual-archetypes.md` | Phase 3: expand to ~12 archetypes |
| `skills/presentation/references/design-specs.md` | Phase 3: new file |
| `docs/experiments/benchmark-styles/` | Phase 1+2 results |
