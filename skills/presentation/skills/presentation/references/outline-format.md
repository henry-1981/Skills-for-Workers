# Outline Format Reference

This document defines the intermediate outline format used between content analysis (Module 2) and slides.md generation (Module 3).

## Purpose

The outline is a structured plan that:
1. Defines the narrative arc of the presentation
2. Maps each slide to a ContentType and content summary
3. Allows the user to review and adjust before full slides.md generation

## Format

```
OUTLINE: [Presentation Title]
STYLE: [preset-name]
SLIDES: [total count]

---

SECTION A: [Section Name] ([slide range], [duration])

  #1. [Slide Title] -> [ContentType]
      -> [1-2 sentence content summary]

  #2. [Slide Title] -> [ContentType]
      -> [content summary]
      -> [additional detail if needed]

SECTION B: [Section Name] ([slide range], [duration])

  #3. [Slide Title] -> [ContentType]
      -> [content summary]

  ...
```

## Example

```
OUTLINE: AI Trends 2026
STYLE: bold-signal
SLIDES: 8

---

SECTION A: Opening (1-2, 2min)

  #1. AI Trends 2026 -> title
      -> Main title with subtitle "The Year Everything Changed"

  #2. Why This Matters -> section-header
      -> Section transition to problem space

SECTION B: Core Trends (3-6, 10min)

  #3. Three Mega-Trends -> content-bullets
      -> **Multimodal AI**: vision + language + action unified
      -> **Agent Economy**: autonomous agents replacing workflows
      -> **Sovereign AI**: nations building their own models

  #4. Market Growth -> content-table
      -> 3-row comparison table: 2024 vs 2025 vs 2026 market size
      -> Categories: Foundation Models, AI Infra, Enterprise Apps

  #5. Key Quote -> quote
      -> "AI is not just a technology, it's a new medium" - Jensen Huang

SECTION C: Closing (7-8, 3min)

  #7. Key Takeaways -> content-bullets
      -> 3 actionable insights from the presentation

  #8. Q&A -> closing
      -> Thank you + contact info
```

## ContentType Labels

Use these labels in the `->` arrow after slide titles:

| Label | Description | Typical Content |
|-------|-------------|-----------------|
| `title` | Opening slide | Main title + subtitle |
| `section-header` | Section divider | Short heading only |
| `content-bullets` | Bullet-based content | 3-6 key points |
| `content-table` | Data comparison | 2-4 row table |
| `two-column` | Split content | Table + bullets |
| `quote` | Featured quote | Quote + attribution |
| `code-block` | Code/diagram | Technical content |
| `diagram-flow` | Process flow | Step-by-step with arrows |
| `before-after` | Comparison | Before vs after states |
| `closing` | Final slide | Q&A / Thank you |

## Content Summary Guidelines

- Each `->` line is a brief content description, NOT the final slide text
- Use `**Bold**:` prefix for items that will become card titles
- Keep summaries to 1-2 sentences per slide
- Include data points, names, or numbers that must appear
- The outline is for planning — slides.md generation expands these into full content

## Section Structure

- Use capital letters: SECTION A, SECTION B, etc.
- Include slide range in parentheses: `(#3-6, 10min)`
- Duration estimates help balance the presentation
- Recommended: 3-5 sections, 5-15 slides total
- Opening (1-2 slides) + Body (3-10 slides) + Closing (1-2 slides)

## Slide Count Guidelines

| Presentation Length | Recommended Slides |
|--------------------|-------------------|
| 5-minute lightning | 5-7 slides |
| 10-minute talk | 8-12 slides |
| 15-minute presentation | 12-18 slides |
| 30-minute keynote | 20-30 slides |

Rule of thumb: ~1 slide per minute, with content slides taking 1-2 minutes each.
