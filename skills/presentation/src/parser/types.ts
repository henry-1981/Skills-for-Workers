// Content types that map to template categories
export type ContentType =
  | 'title'
  | 'section-header'
  | 'content-bullets'
  | 'content-table'
  | 'two-column'
  | 'quote'
  | 'code-block'
  | 'diagram-flow'
  | 'diagram-pyramid'
  | 'diagram-cards'
  | 'before-after'
  | 'concentric'
  | 'closing';

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface DiagramSpec {
  type: 'flow' | 'pyramid' | 'cards' | 'concentric' | 'before-after';
  elements: Record<string, unknown>;
}

// Structured representation of a single slide's content
export interface ContentSlide {
  index: number;
  heading: string;
  subtitle?: string;
  bullets?: string[];
  table?: TableData;
  codeBlock?: { language: string; code: string };
  quote?: { text: string; attribution?: string };
  diagram?: DiagramSpec;
  speakerNotes?: string;
  sectionTag?: string;

  // Inferred or overridden content type
  contentType: ContentType;

  // Explicit template override from <!-- template: xxx -->
  templateOverride?: string;

  // Style preset from <!-- style: preset-name --> (document-wide, set on all slides)
  stylePreset?: string;

  // Narrative layer: role override from <!-- climax --> etc.
  roleOverride?: SlideRole;

  // Narrative context assigned by NarrativeAnalyzer
  narrative?: NarrativeContext;

  // Density profile assigned by DensityAnalyzer
  density?: import('../narrative/density-analyzer.js').DensityProfile;
}

// Story Layer: slide role in presentation narrative
export type SlideRole =
  | 'opener'          // Opening slide (title)
  | 'section-bridge'  // Section transition
  | 'build-up'        // Argument building (info delivery)
  | 'evidence'        // Data/evidence presentation
  | 'climax'          // Key message (1 per section)
  | 'breather'        // Breathing slide (quote, full message)
  | 'closer';         // Closing slide

export interface SectionInfo {
  id: string;              // e.g., "A", "B", "C"
  title: string;           // e.g., "배경과 문제"
  slideRange: [number, number]; // [startIndex, endIndex]
  slideCount: number;
}

export interface NarrativeContext {
  role: SlideRole;
  section?: SectionInfo;
  positionInSection?: number;   // 0-based index within section
  sectionSlideCount?: number;   // total slides in this section
  isFirstInSection?: boolean;
  isLastInSection?: boolean;
}
