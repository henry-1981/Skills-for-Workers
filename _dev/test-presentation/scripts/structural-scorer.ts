import JSZip from 'jszip';
import { readFile } from 'fs/promises';

export interface SlideAnalysis {
  index: number;
  hasImage: boolean;
  hasText: boolean;
  textLength: number;
}

export interface StructuralScore {
  pptxExists: boolean;
  slideCount: number;
  slideCountScore: number;
  slidesAnalysis: SlideAnalysis[];
  contentScore: number;
  integrityScore: number;
  total: number;
  details: string[];
}

export async function scoreStructure(
  pptxPath: string,
  expectedSlideRange: [number, number] = [5, 15],
): Promise<StructuralScore> {
  const details: string[] = [];
  let pptxExistsScore = 0;
  let slideCountScore = 0;
  let contentScore = 0;
  let integrityScore = 0;

  // 1. PPTX existence (30점)
  const buf = await readFile(pptxPath);
  pptxExistsScore = 30;
  details.push('PPTX file readable: +30');

  // 2. Parse PPTX (zip)
  const zip = await JSZip.loadAsync(buf);

  // 3. Count slides
  const slideFiles = Object.keys(zip.files).filter(
    f => f.match(/^ppt\/slides\/slide\d+\.xml$/)
  );
  const slideCount = slideFiles.length;

  // Slide count scoring (20점)
  const [minSlides, maxSlides] = expectedSlideRange;
  if (slideCount >= minSlides && slideCount <= maxSlides) {
    slideCountScore = 20;
    details.push(`Slide count ${slideCount} in range [${minSlides}-${maxSlides}]: +20`);
  } else if (slideCount > 0) {
    slideCountScore = 10;
    details.push(`Slide count ${slideCount} outside range [${minSlides}-${maxSlides}]: +10`);
  } else {
    details.push('No slides found: +0');
  }

  // 4. Analyze each slide for text + image (30점)
  const slidesAnalysis: SlideAnalysis[] = [];
  let slidesWithBoth = 0;

  for (const slideFile of slideFiles.sort()) {
    const xml = await zip.file(slideFile)!.async('text');
    const hasImage = xml.includes('<a:blip') || xml.includes('<p:pic');
    const hasText = xml.includes('<a:t>') || xml.includes('<a:t ');

    const textMatches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
    const textLength = textMatches
      .map(m => m.replace(/<[^>]+>/g, ''))
      .join('')
      .length;

    const index = slidesAnalysis.length + 1;
    slidesAnalysis.push({ index, hasImage, hasText, textLength });

    if (hasImage && hasText) slidesWithBoth++;
  }

  if (slideCount > 0) {
    const ratio = slidesWithBoth / slideCount;
    contentScore = Math.round(ratio * 30);
    details.push(`${slidesWithBoth}/${slideCount} slides have both text+image: +${contentScore}`);
  }

  // 5. Integrity (20점)
  const hasPresXml = zip.files['ppt/presentation.xml'] !== undefined;
  const hasContentTypes = zip.files['[Content_Types].xml'] !== undefined;
  const hasRels = zip.files['_rels/.rels'] !== undefined;

  if (hasPresXml) { integrityScore += 8; details.push('presentation.xml exists: +8'); }
  if (hasContentTypes) { integrityScore += 6; details.push('[Content_Types].xml exists: +6'); }
  if (hasRels) { integrityScore += 6; details.push('_rels/.rels exists: +6'); }

  const total = pptxExistsScore + slideCountScore + contentScore + integrityScore;

  return {
    pptxExists: true,
    slideCount,
    slideCountScore,
    slidesAnalysis,
    contentScore,
    integrityScore,
    total,
    details,
  };
}

// CLI mode
if (process.argv[1]?.endsWith('structural-scorer.ts') || process.argv[1]?.endsWith('structural-scorer.js')) {
  const pptxPath = process.argv[2];
  if (!pptxPath) {
    console.error('Usage: structural-scorer <path-to-pptx>');
    process.exit(1);
  }
  scoreStructure(pptxPath).then(result => {
    console.log(JSON.stringify(result, null, 2));
  }).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
