# slides.md Format Specification

This document defines the Markdown format consumed by the Figma Slides pipeline parser.

## File Structure

```markdown
---
(optional YAML frontmatter — currently ignored by parser)
---

# Presentation Title

> Subtitle or tagline

---

## #1. First Slide Title

**Optional Bold Subtitle**

- Bullet point one
- Bullet point two
- Bullet point three

---

## #2. Second Slide Title

| Column A | Column B | Column C |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |

---
```

## Slide Separators

- Slides are separated by `---` (horizontal rule) on its own line
- `---` inside code blocks is ignored
- `---` at the very start of the file begins YAML frontmatter (ended by next `---`)

## Style Tag

Set the visual style preset for the entire presentation:

```markdown
<!-- style: bold-signal -->
```

- Place in the first slide (title slide)
- Applies to ALL slides in the document
- See `style-presets.md` for the 12 available presets
- If omitted, defaults to `bold-signal`

## Heading Levels

| Syntax | Usage |
|--------|-------|
| `# Title` | Title slide (index 0) |
| `## #N. Title` | Content slide with number |
| `## Title` | Content slide without number |

## Content Elements

### Bullets

```markdown
- Plain bullet text
- **Bold prefix**: followed by explanation
- Another bullet
```

Bold-prefixed bullets (`**Key**:`) are parsed as card titles when mapped to Bento layouts.

### Tables

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell     | Cell     | Cell     |
```

- Minimum 3 lines required (header + separator + 1 data row)
- First column of each row becomes card title in Bento layouts
- 2-3 rows -> card layouts; 4+ rows -> table-grid layout

### Code Blocks

````markdown
```python
def hello():
    print("world")
```
````

- Language identifier is preserved
- Rendered as full-message layout with monospace styling
- Diagram patterns in code (`->`, `|`, `--`) trigger diagram detection

### Blockquotes

```markdown
> The only way to do great work is to love what you do.
> -- Steve Jobs
```

- Attribution line starts with `--` or `> --`
- Rendered as full-message layout with large quote typography

### Speaker Notes

```markdown
**Speaker Notes:**
These notes are not rendered on the slide.
They are preserved for presenter reference.
```

- Must start with `**Speaker Notes:**` on its own line
- All text after this marker until the next `---` is captured as notes
- Not rendered in Figma output

## HTML Comment Directives

### Template Override

```markdown
<!-- template: content-bullets -->
```

Forces a specific ContentType instead of auto-detection.

### Section Tag

```markdown
<!-- A. Problem Recognition (#1-6, 8min) -->
```

Groups slides into logical sections for navigation.

## ContentType Auto-Detection

The parser infers ContentType from content structure:

| ContentType | Detection Rule |
|------------|----------------|
| `title` | First slide (index 0) |
| `closing` | Heading contains: Q&A, Thank, Closing, 감사, 마무리, 결론 |
| `code-block` | Has code block, no table |
| `diagram-flow` | Code block with `->` or `--` arrows |
| `diagram-pyramid` | Code block with "Tier" keyword |
| `before-after` | Code block with "Phase" or "Step" |
| `content-table` | Table with 2+ rows, no bullets/quote |
| `two-column` | Table + bullets or quote |
| `quote` | Blockquote with 0-1 bullets |
| `content-bullets` | Has bullets |
| `section-header` | Heading only, no content |

## Bento Layout Mapping

ContentType maps to Bento layout types:

| ContentType | Bento Layout |
|------------|-------------|
| `content-bullets` (3+ bullets) | `hero-sub` |
| `content-bullets` (1-2 bullets) | `full-message` |
| `content-table` (3 rows) | `three-equal` |
| `content-table` (2 rows) | `two-split` |
| `content-table` (4+ rows) | `table-grid` |
| `two-column` | `two-split` |
| `quote` | `full-message` |
| `code-block` | `full-message` |
| `before-after` | `full-message` |

Layout rhythm prevents the same layout from appearing more than 2 times consecutively.
