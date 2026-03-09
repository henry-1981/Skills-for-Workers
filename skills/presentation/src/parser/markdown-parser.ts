import { ContentSlide, ContentType, TableData, SlideRole } from './types.js';

/**
 * Parse slide markdown into structured ContentSlide[].
 *
 * Expected format:
 * - Slides separated by `---`
 * - Title slide: `# Title` (no number)
 * - Content slides: `## #N. Title`
 * - Bullets: `- text`
 * - Tables: `| col | col |` with header separator `|---|---|`
 * - Code blocks: ``` lang ... ```
 * - Blockquotes: `> text`
 * - Speaker notes: `**Speaker Notes:**` followed by text
 * - Template override: `<!-- template: template-id -->`
 * - Style preset: `<!-- style: preset-name -->`
 * - Section comments: `<!-- A. Section Name (#1-6, 8min) -->`
 */
export function parseSlideMarkdown(markdown: string): ContentSlide[] {
  const rawSlides = splitSlides(markdown);
  const slides = rawSlides.map((raw, index) => parseOneSlide(raw, index));

  // Extract style preset from first slide and propagate to all slides
  const stylePreset = extractStylePreset(markdown);
  if (stylePreset) {
    for (const slide of slides) {
      slide.stylePreset = stylePreset;
    }
  }

  // Propagate sectionTag to subsequent slides until next section tag
  let currentSection: string | undefined;
  for (const slide of slides) {
    if (slide.sectionTag) {
      currentSection = slide.sectionTag;
    } else if (currentSection) {
      slide.sectionTag = currentSection;
    }
  }

  return slides;
}

function splitSlides(markdown: string): string[] {
  // Split on `---` at the start of a line (horizontal rule)
  // But NOT `---` inside code blocks or YAML frontmatter
  const lines = markdown.split('\n');
  const slides: string[][] = [[]];
  let inCodeBlock = false;
  let isFirstLine = true;
  let inFrontmatter = false;

  for (const line of lines) {
    // Track YAML frontmatter (only at very start of file)
    if (isFirstLine && line.trim() === '---') {
      inFrontmatter = true;
      isFirstLine = false;
      continue;
    }
    isFirstLine = false;

    if (inFrontmatter) {
      if (line.trim() === '---') {
        inFrontmatter = false;
      }
      continue;
    }

    // Track code blocks
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    // Horizontal rule = slide separator (only outside code blocks)
    if (!inCodeBlock && /^---\s*$/.test(line)) {
      slides.push([]);
      continue;
    }

    slides[slides.length - 1].push(line);
  }

  // Filter out empty slides and trailing fragments (no heading = not a real slide)
  return slides
    .map(lines => lines.join('\n').trim())
    .filter(s => s.length > 0)
    .filter(s => /^#{1,2}\s/m.test(s) || s.includes('> '));
}

function parseOneSlide(raw: string, index: number): ContentSlide {
  const lines = raw.split('\n');

  // Extract template override
  const templateOverride = extractTemplateOverride(lines);

  // Extract section tag from HTML comments
  const sectionTag = extractSectionTag(lines);

  // Extract role override from HTML comments
  const roleOverride = extractRoleOverride(lines);

  // Remove HTML comments from content lines
  const contentLines = lines.filter(l => !l.trim().startsWith('<!--'));

  // Split into body and speaker notes
  const { body, speakerNotes } = splitSpeakerNotes(contentLines);

  // Parse heading
  const heading = extractHeading(body);

  // Parse content elements
  const bullets = extractBullets(body);
  const table = extractTable(body);
  const codeBlock = extractCodeBlock(body);
  const quote = extractQuote(body);
  const subtitle = extractSubtitle(body, heading);

  // Infer content type
  const contentType = inferContentType(
    { heading, subtitle, bullets, table, codeBlock, quote },
    index,
    templateOverride
  );

  return {
    index,
    heading: heading || `Slide ${index}`,
    subtitle,
    bullets: bullets.length > 0 ? bullets : undefined,
    table: table || undefined,
    codeBlock: codeBlock || undefined,
    quote: quote || undefined,
    speakerNotes: speakerNotes || undefined,
    sectionTag: sectionTag || undefined,
    roleOverride: roleOverride || undefined,
    contentType,
    templateOverride: templateOverride || undefined,
  };
}

function extractTemplateOverride(lines: string[]): string | null {
  for (const line of lines) {
    const match = line.match(/<!--\s*template:\s*(.+?)\s*-->/);
    if (match) return match[1];
  }
  return null;
}

function extractStylePreset(markdown: string): string | null {
  const match = markdown.match(/<!--\s*style:\s*(.+?)\s*-->/);
  return match ? match[1].trim() : null;
}

function extractSectionTag(lines: string[]): string | null {
  for (const line of lines) {
    // Match: <!-- section: A. 배경과 문제 (#1-3) --> (new format)
    const sectionMatch = line.match(/<!--\s*section:\s*(.+?)\s*-->/);
    if (sectionMatch) {
      // Strip (#range) suffix if present
      return sectionMatch[1].replace(/\s*\(#[\d-]+\)\s*$/, '').trim();
    }
    // Match: <!-- A. 문제 인식 (#1-6, 8분) --> (legacy format)
    const legacyMatch = line.match(/<!--\s*([A-Z]\.\s*.+?)\s*(?:\(|-->)/);
    if (legacyMatch) return legacyMatch[1].trim();
  }
  return null;
}

function extractRoleOverride(lines: string[]): SlideRole | null {
  const validRoles: SlideRole[] = ['climax', 'breather', 'evidence', 'section-bridge'];
  for (const line of lines) {
    const match = line.match(/<!--\s*(climax|breather|evidence|section-bridge)\s*-->/);
    if (match && validRoles.includes(match[1] as SlideRole)) return match[1] as SlideRole;
  }
  return null;
}

function splitSpeakerNotes(lines: string[]): { body: string[]; speakerNotes: string | null } {
  const notesIndex = lines.findIndex(l => l.trim().startsWith('**Speaker Notes:**'));
  if (notesIndex === -1) {
    return { body: lines, speakerNotes: null };
  }

  const body = lines.slice(0, notesIndex);
  const notesLines = lines.slice(notesIndex + 1);
  const speakerNotes = notesLines.join('\n').trim();

  return { body, speakerNotes: speakerNotes || null };
}

function extractHeading(lines: string[]): string {
  for (const line of lines) {
    // ## #1. Title or # Title
    const h2Match = line.match(/^##\s+#?\d*\.?\s*(.*)/);
    if (h2Match) return h2Match[1].trim();

    const h1Match = line.match(/^#\s+(.*)/);
    if (h1Match) return h1Match[1].trim();
  }
  return '';
}

function extractSubtitle(lines: string[], heading: string): string | undefined {
  // For title slides: first blockquote that's not a speaker note context
  // For content slides: bold text right after heading
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Bold text like **Skills-for-Workers**
    if (line.trim().startsWith('**') && line.trim().endsWith('**') && !line.includes('Speaker Notes')) {
      const text = line.trim().replace(/^\*\*|\*\*$/g, '');
      if (text !== heading && text.length < 100) return text;
    }
  }

  // Fallback: blockquote as subtitle (common in title/closing slides)
  for (const line of lines) {
    if (line.trim().startsWith('>')) {
      const text = line.trim().replace(/^>\s*/, '').trim();
      // Skip attribution lines (-- Author) and empty lines
      if (text && !text.startsWith('--') && !text.startsWith('—') && text.length < 200) {
        return text;
      }
    }
  }

  return undefined;
}

function extractBullets(lines: string[]): string[] {
  const bullets: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // Match unordered list items: - text
    const match = line.match(/^-\s+(.*)/);
    if (match) {
      bullets.push(match[1].trim());
    }
  }

  return bullets;
}

function extractTable(lines: string[]): TableData | null {
  const tableLines: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      tableLines.push(line.trim());
    }
  }

  if (tableLines.length < 3) return null; // Need header + separator + at least 1 row

  // Parse header
  const headers = parseTableRow(tableLines[0]);

  // Skip separator (line 1)
  // Parse data rows
  const rows = tableLines.slice(2).map(parseTableRow);

  return { headers, rows };
}

function parseTableRow(line: string): string[] {
  return line
    .split('|')
    .slice(1, -1) // Remove leading/trailing empty strings from split
    .map(cell => cell.trim());
}

function extractCodeBlock(lines: string[]): { language: string; code: string } | null {
  let inBlock = false;
  let language = '';
  const codeLines: string[] = [];

  for (const line of lines) {
    if (!inBlock && line.trim().startsWith('```')) {
      inBlock = true;
      language = line.trim().replace('```', '').trim();
      continue;
    }
    if (inBlock && line.trim() === '```') {
      return { language: language || 'text', code: codeLines.join('\n') };
    }
    if (inBlock) {
      codeLines.push(line);
    }
  }

  return null;
}

function extractQuote(lines: string[]): { text: string; attribution?: string } | null {
  const quoteLines: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    if (line.trim().startsWith('>')) {
      quoteLines.push(line.trim().replace(/^>\s*/, ''));
    }
  }

  if (quoteLines.length === 0) return null;

  // Check for attribution line: > — Author, Source
  const lastLine = quoteLines[quoteLines.length - 1];
  const attrMatch = lastLine.match(/^—\s*(.*)/);

  if (attrMatch) {
    const text = quoteLines.slice(0, -1).filter(l => l.length > 0).join('\n');
    return { text, attribution: attrMatch[1] };
  }

  const text = quoteLines.filter(l => l.length > 0).join('\n');
  return { text };
}

function inferContentType(
  content: {
    heading: string;
    subtitle?: string;
    bullets?: string[];
    table?: TableData | null;
    codeBlock?: { language: string; code: string } | null;
    quote?: { text: string; attribution?: string } | null;
  },
  index: number,
  templateOverride: string | null
): ContentType {
  // Explicit override takes precedence
  if (templateOverride) return templateOverride as ContentType;

  // Title slide (first slide, index 0)
  if (index === 0) return 'title';

  // Closing / Q&A slide (detected by heading keywords)
  const headingLower = content.heading.toLowerCase();
  const closingKeywords = [
    'q&a', 'thank', 'closing', 'the end',
    '감사', '마무리', '결론', '끝',
  ];
  if (closingKeywords.some(kw => headingLower.includes(kw))) {
    return 'closing';
  }

  // Code block slide
  if (content.codeBlock && !content.table) {
    const code = content.codeBlock.code;
    // Check for diagram patterns in code
    if (code.includes('↓') || code.includes('→') || code.includes('──')) {
      if (code.includes('Tier') || code.includes('tier')) return 'diagram-pyramid';
      if (code.includes('Phase') || code.includes('Step')) return 'before-after';
      return 'diagram-flow';
    }
    return 'code-block';
  }

  // Table-heavy slide (table is the primary content)
  if (content.table && content.table.rows.length >= 2) {
    const hasBulletsOrQuote = (content.bullets && content.bullets.length > 0) ||
      content.quote;
    if (!hasBulletsOrQuote) return 'content-table';
    // Table + other content = two-column
    return 'two-column';
  }

  // Quote-dominant slide
  if (content.quote && (!content.bullets || content.bullets.length <= 1)) {
    return 'quote';
  }

  // Bullet-heavy slide (most common)
  if (content.bullets && content.bullets.length > 0) {
    return 'content-bullets';
  }

  // Section header (short heading, minimal content)
  if (!content.bullets && !content.table && !content.codeBlock) {
    return 'section-header';
  }

  // Default fallback
  return 'content-bullets';
}
