import { describe, it, expect } from 'vitest';
import { scoreStructure } from './structural-scorer.js';

describe('structural-scorer', () => {
  it('scoreStructure is importable and callable', () => {
    expect(typeof scoreStructure).toBe('function');
  });

  it('throws on non-existent file', async () => {
    await expect(scoreStructure('/tmp/nonexistent-e2e-test.pptx')).rejects.toThrow();
  });
});
