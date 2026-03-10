// src/profile/cli.ts
// CLI entry point for profile operations.
// Usage: node dist/profile/cli.js <subcommand> [args...]

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import {
  updatePurposeMapping,
  saveVisualOverride,
  updateLayoutPrefs,
  initDefaults,
} from './writer.js';
import { createSnapshot, restoreSnapshot } from './snapshot.js';
import { readDefaults } from './reader.js';
import { extractFromPptx } from './pptx-extractor.js';
import { matchPreset } from './preset-matcher.js';
import { ALL_PROFILE_PATHS } from './paths.js';
import type { ProfileSnapshot, VisualOverride } from './types.js';

function usage(): never {
  console.error(`Usage: node dist/profile/cli.js <subcommand> [args]

Subcommands:
  update-purpose <purpose> <preset>       Add/increment purpose→preset mapping
  save-visual <presetId> <jsonString>     Save visual override for a preset
  update-layout <purpose> <layout,...>    Record layouts used for a purpose
  snapshot <outputFile>                   Snapshot all profile files to JSON
  restore <snapshotFile>                  Restore profile files from snapshot
  bootstrap-pptx <pptxPath> [preset]     Init defaults from PPTX style
  audit-check                             Check if profile audit is due (10x threshold)
`);
  process.exit(1);
}

async function ensureDir(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

const [,, subcommand, ...args] = process.argv;

if (!subcommand) usage();

try {
  switch (subcommand) {
    case 'update-purpose': {
      const [purpose, preset] = args;
      if (!purpose || !preset) {
        console.error('Error: update-purpose requires <purpose> <preset>');
        process.exit(1);
      }
      await updatePurposeMapping(purpose, preset);
      console.log(`✓ purpose mapping updated: ${purpose} → ${preset}`);
      break;
    }

    case 'save-visual': {
      const [presetId, jsonString] = args;
      if (!presetId || !jsonString) {
        console.error('Error: save-visual requires <presetId> <jsonString>');
        process.exit(1);
      }
      let override: VisualOverride;
      try {
        override = JSON.parse(jsonString) as VisualOverride;
      } catch {
        console.error('Error: <jsonString> is not valid JSON');
        process.exit(1);
      }
      await saveVisualOverride(presetId, override);
      console.log(`✓ visual override saved for preset: ${presetId}`);
      break;
    }

    case 'update-layout': {
      const [purpose, layoutsArg] = args;
      if (!purpose || !layoutsArg) {
        console.error('Error: update-layout requires <purpose> <layout,...>');
        process.exit(1);
      }
      const layouts = layoutsArg.split(',').map(l => l.trim()).filter(Boolean);
      await updateLayoutPrefs(purpose, layouts);
      console.log(`✓ layout prefs updated for ${purpose}: [${layouts.join(', ')}]`);
      break;
    }

    case 'snapshot': {
      const [outputFile] = args;
      if (!outputFile) {
        console.error('Error: snapshot requires <outputFile>');
        process.exit(1);
      }
      const snapshot = await createSnapshot(ALL_PROFILE_PATHS);
      await ensureDir(outputFile);
      await writeFile(outputFile, JSON.stringify(snapshot, null, 2));
      console.log(`✓ snapshot saved: ${outputFile} (${snapshot.files.length} files)`);
      break;
    }

    case 'restore': {
      const [snapshotFile] = args;
      if (!snapshotFile) {
        console.error('Error: restore requires <snapshotFile>');
        process.exit(1);
      }
      const raw = await readFile(snapshotFile, 'utf-8');
      const snapshot = JSON.parse(raw) as ProfileSnapshot;
      await restoreSnapshot(snapshot);
      console.log(`✓ profile restored from snapshot: ${snapshotFile}`);
      break;
    }

    case 'bootstrap-pptx': {
      const [pptxPath, presetOverride] = args;
      if (!pptxPath) {
        console.error('Error: bootstrap-pptx requires <pptxPath>');
        process.exit(1);
      }
      const style = await extractFromPptx(pptxPath);
      const matched = matchPreset(style);
      const presetId = presetOverride ?? matched.id;
      await initDefaults(presetId, 'hybrid', '~/Desktop');
      console.log(JSON.stringify({
        extractedStyle: style,
        matchedPreset: matched.id,
        usedPreset: presetId,
      }, null, 2));
      console.log(`✓ profile bootstrapped from PPTX (preset: ${presetId})`);
      break;
    }

    case 'audit-check': {
      const defaults = await readDefaults();
      if (!defaults) {
        console.log(JSON.stringify({ due: false, totalCount: 0, reason: 'no profile' }));
        break;
      }
      const totalCount = defaults.purposeMappings.reduce((sum, m) => sum + m.count, 0);
      // Audit is due when total crosses a 10-multiple boundary
      const due = totalCount > 0 && totalCount % 10 === 0;
      console.log(JSON.stringify({ due, totalCount, defaultPreset: defaults.defaultPreset }));
      break;
    }

    default:
      console.error(`Unknown subcommand: ${subcommand}`);
      usage();
  }
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Fatal error: ${message}`);
  process.exit(1);
}
