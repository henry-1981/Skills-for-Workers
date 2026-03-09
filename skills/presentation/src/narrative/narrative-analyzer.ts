import type { ContentSlide, SlideRole, NarrativeContext, SectionInfo } from '../parser/types.js';

export function analyzeNarrative(slides: ContentSlide[]): ContentSlide[] {
  const sections = buildSections(slides);

  return slides.map((slide, i) => {
    const role = resolveRole(slide, i, slides);
    const section = findSection(i, sections);
    const narrative: NarrativeContext = {
      role,
      section: section ?? undefined,
      positionInSection: section ? i - section.slideRange[0] : undefined,
      sectionSlideCount: section?.slideCount,
      isFirstInSection: section ? i === section.slideRange[0] : undefined,
      isLastInSection: section ? i === section.slideRange[1] : undefined,
    };
    return { ...slide, narrative };
  });
}

function buildSections(slides: ContentSlide[]): SectionInfo[] {
  const sections: SectionInfo[] = [];
  let current: { tag: string; start: number } | null = null;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const tag = slide.sectionTag;

    if (tag && (!current || tag !== current.tag)) {
      if (current) {
        sections.push(parseSectionInfo(current.tag, current.start, i - 1));
      }
      current = { tag, start: i };
    } else if (!tag && slide.contentType === 'section-header' && !current) {
      current = { tag: slide.heading, start: i };
    }
  }
  if (current) {
    sections.push(parseSectionInfo(current.tag, current.start, slides.length - 1));
  }

  return sections;
}

function parseSectionInfo(tag: string, start: number, end: number): SectionInfo {
  // Parse "A. 배경과 문제" → id="A", title="배경과 문제"
  const match = tag.match(/^([A-Z])\.\s*(.+?)$/);
  const id = match ? match[1] : tag.charAt(0);
  const title = match ? match[2].trim() : tag;
  return { id, title, slideRange: [start, end], slideCount: end - start + 1 };
}

function findSection(index: number, sections: SectionInfo[]): SectionInfo | null {
  for (const s of sections) {
    if (index >= s.slideRange[0] && index <= s.slideRange[1]) return s;
  }
  return null;
}

function resolveRole(
  slide: ContentSlide,
  index: number,
  allSlides: ContentSlide[],
): SlideRole {
  // 1. Explicit override from markdown tag
  if (slide.roleOverride) return slide.roleOverride;

  // 2. Structural types
  if (slide.contentType === 'title') return 'opener';
  if (slide.contentType === 'closing') return 'closer';
  if (slide.contentType === 'section-header') return 'section-bridge';

  // 3. Content-based inference
  if (slide.contentType === 'quote') return 'breather';

  // 4. Data-heavy slides → evidence
  if (slide.contentType === 'content-table') return 'evidence';
  if (slide.bullets && slide.bullets.some(b => /\d+%|\d+\.\d+|₩|원|\$/.test(b))) {
    return 'evidence';
  }

  // 5. Default
  return 'build-up';
}
