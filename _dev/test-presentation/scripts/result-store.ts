import { mkdir, writeFile, readFile, readdir } from 'fs/promises';
import { join } from 'path';

export interface Scenario {
  category: string;
  topic: string;
  mode: 'free' | 'preset';
  slideCount: number;
  preset?: string;
  variables?: Record<string, string>;
}

export class ResultStore {
  constructor(private baseDir: string) {}

  async createRun(scenario: Scenario): Promise<string> {
    const date = new Date().toISOString().slice(0, 10);
    const existing = await this.listRuns();
    const todayRuns = existing.filter(r => r.startsWith(date));
    const seq = String(todayRuns.length + 1).padStart(3, '0');
    const runDir = join(this.baseDir, 'runs', `${date}-${seq}`);

    await mkdir(runDir, { recursive: true });
    await mkdir(join(runDir, 'slides'), { recursive: true });
    await writeFile(
      join(runDir, 'scenario.json'),
      JSON.stringify(scenario, null, 2),
    );
    return runDir;
  }

  async saveStructuralScore(runDir: string, score: any): Promise<void> {
    await writeFile(
      join(runDir, 'structural-score.json'),
      JSON.stringify(score, null, 2),
    );
  }

  async saveQualityScore(runDir: string, score: any): Promise<void> {
    await writeFile(
      join(runDir, 'quality-score.json'),
      JSON.stringify(score, null, 2),
    );
  }

  async loadStructuralScore(runDir: string): Promise<any> {
    const raw = await readFile(join(runDir, 'structural-score.json'), 'utf-8');
    return JSON.parse(raw);
  }

  async loadQualityScore(runDir: string): Promise<any> {
    const raw = await readFile(join(runDir, 'quality-score.json'), 'utf-8');
    return JSON.parse(raw);
  }

  async updateSummary(): Promise<void> {
    const runs = await this.listRuns();
    const results: any[] = [];

    for (const run of runs) {
      const runDir = join(this.baseDir, 'runs', run);
      try {
        const scenario = JSON.parse(await readFile(join(runDir, 'scenario.json'), 'utf-8'));
        const structural = JSON.parse(await readFile(join(runDir, 'structural-score.json'), 'utf-8')).total;
        const quality = JSON.parse(await readFile(join(runDir, 'quality-score.json'), 'utf-8')).total;
        results.push({ run, category: scenario.category, mode: scenario.mode, structural, quality });
      } catch {
        // incomplete run, skip
      }
    }

    const summary = {
      totalRuns: results.length,
      avgStructural: results.length > 0 ? Math.round(results.reduce((s, r) => s + r.structural, 0) / results.length) : 0,
      avgQuality: results.length > 0 ? Math.round(results.reduce((s, r) => s + r.quality, 0) / results.length) : 0,
      byCategory: this.groupBy(results, 'category'),
      byMode: this.groupBy(results, 'mode'),
      runs: results,
    };

    await writeFile(
      join(this.baseDir, 'summary.json'),
      JSON.stringify(summary, null, 2),
    );
  }

  private async listRuns(): Promise<string[]> {
    try {
      return await readdir(join(this.baseDir, 'runs'));
    } catch {
      return [];
    }
  }

  private groupBy(results: any[], key: string): Record<string, { count: number; avgStructural: number; avgQuality: number }> {
    const groups: Record<string, any[]> = {};
    for (const r of results) {
      (groups[r[key]] ??= []).push(r);
    }
    const out: Record<string, any> = {};
    for (const [k, items] of Object.entries(groups)) {
      out[k] = {
        count: items.length,
        avgStructural: Math.round(items.reduce((s: number, r: any) => s + r.structural, 0) / items.length),
        avgQuality: Math.round(items.reduce((s: number, r: any) => s + r.quality, 0) / items.length),
      };
    }
    return out;
  }
}
