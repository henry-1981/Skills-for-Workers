import { Pipeline } from './pipeline.js';
import { resolve, basename } from 'path';

const markdownPath = process.argv[2];
const outputDir = (process.argv[3] && !process.argv[3].startsWith('--')) ? process.argv[3] : '.';
const verbose = process.argv.includes('--verbose');
const presetArg = process.argv.find(a => a.startsWith('--preset='));
const presetName = presetArg?.split('=')[1];

if (!markdownPath) {
  console.error('Usage: npx tsx src/index.ts <slides.md> [output-dir] [--verbose] [--preset=name]');
  console.error('');
  console.error('Generates PPTX presentation slides from markdown.');
  console.error('');
  console.error('Available presets: bold-signal, electric-studio, creative-voltage, dark-botanical,');
  console.error('  notebook-tabs, pastel-geometry, split-pastel, vintage-editorial,');
  console.error('  neon-cyber, terminal-green, swiss-modern, paper-ink,');
  console.error('  kr-corporate-navy, kr-clean-white, kr-blue-gradient, kr-warm-coral,');
  console.error('  kr-mint-fresh, kr-impact-dark, kr-neon-stage, kr-elegant-serif, kr-gold-premium');
  process.exit(1);
}

if (presetName && verbose) {
  console.log(`Using style preset: ${presetName}`);
}

async function main() {
  const pipeline = new Pipeline();
  const pptxPath = resolve(outputDir, basename(markdownPath, '.md') + '.pptx');

  const result = await pipeline.process(markdownPath, {
    verbose,
    preset: presetName,
    outputPath: pptxPath,
  });

  console.log(`\nGenerated ${result.totalSlides} slides → ${result.outputFile}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
