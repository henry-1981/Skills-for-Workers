import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ResultStore } from './result-store.js';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('ResultStore', () => {
  let tempDir: string;
  let store: ResultStore;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'e2e-result-'));
    store = new ResultStore(tempDir);
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('creates a run directory with scenario.json', async () => {
    const runDir = await store.createRun({
      category: '업무 보고',
      topic: '주간 개발팀 실적 보고',
      mode: 'free',
      slideCount: 8,
    });
    expect(runDir).toContain('runs/');

    const { readFile } = await import('fs/promises');
    const scenario = JSON.parse(await readFile(join(runDir, 'scenario.json'), 'utf-8'));
    expect(scenario.category).toBe('업무 보고');
    expect(scenario.mode).toBe('free');
  });

  it('saves and loads structural score', async () => {
    const runDir = await store.createRun({
      category: '제안서',
      topic: '신규 서비스 도입 제안',
      mode: 'preset',
      slideCount: 6,
      preset: 'kr-corporate-navy',
    });
    await store.saveStructuralScore(runDir, { total: 85, details: ['test'] });
    const loaded = await store.loadStructuralScore(runDir);
    expect(loaded.total).toBe(85);
  });

  it('saves and loads quality score', async () => {
    const runDir = await store.createRun({
      category: '교육 자료',
      topic: '신입 온보딩',
      mode: 'free',
      slideCount: 10,
    });
    await store.saveQualityScore(runDir, {
      message_clarity: { score: 22, evidence: ['clear'] },
      total: 80,
      summary: 'Good',
    });
    const loaded = await store.loadQualityScore(runDir);
    expect(loaded.total).toBe(80);
  });

  it('updates summary with complete runs', async () => {
    const run1 = await store.createRun({
      category: '업무 보고',
      topic: 'Test 1',
      mode: 'free',
      slideCount: 8,
    });
    await store.saveStructuralScore(run1, { total: 80 });
    await store.saveQualityScore(run1, { total: 70 });

    const run2 = await store.createRun({
      category: '제안서',
      topic: 'Test 2',
      mode: 'preset',
      slideCount: 6,
    });
    await store.saveStructuralScore(run2, { total: 90 });
    await store.saveQualityScore(run2, { total: 85 });

    await store.updateSummary();

    const { readFile } = await import('fs/promises');
    const summary = JSON.parse(await readFile(join(tempDir, 'summary.json'), 'utf-8'));
    expect(summary.totalRuns).toBe(2);
    expect(summary.avgStructural).toBe(85);
    expect(summary.avgQuality).toBe(78);  // round((70+85)/2) = 78
    expect(summary.byCategory['업무 보고'].count).toBe(1);
  });
});
