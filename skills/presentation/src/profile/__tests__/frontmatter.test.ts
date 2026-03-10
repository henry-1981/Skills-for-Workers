import { describe, it, expect } from 'vitest';
import { parseFrontmatter, stringifyFrontmatter } from '../frontmatter.js';

describe('parseFrontmatter', () => {
  it('should parse YAML frontmatter and body', () => {
    const content = '---\nfoo: bar\ncount: 3\n---\n## Body\nSome text';
    const result = parseFrontmatter<{ foo: string; count: number }>(content);
    expect(result.data.foo).toBe('bar');
    expect(result.data.count).toBe(3);
    expect(result.body).toBe('## Body\nSome text');
  });

  it('should return empty data for content without frontmatter', () => {
    const content = '## Just body\nNo frontmatter here';
    const result = parseFrontmatter<{ foo?: string }>(content);
    expect(result.data).toEqual({});
    expect(result.body).toBe(content);
  });

  it('should handle frontmatter with no body', () => {
    const content = '---\nkey: value\n---\n';
    const result = parseFrontmatter<{ key: string }>(content);
    expect(result.data.key).toBe('value');
    expect(result.body).toBe('');
  });

  it('should handle nested YAML objects', () => {
    const content = '---\nouter:\n  inner: deep\n  list:\n    - a\n    - b\n---\n';
    const result = parseFrontmatter<{ outer: { inner: string; list: string[] } }>(content);
    expect(result.data.outer.inner).toBe('deep');
    expect(result.data.outer.list).toEqual(['a', 'b']);
  });
});

describe('stringifyFrontmatter', () => {
  it('should produce valid frontmatter with body', () => {
    const data = { foo: 'bar', count: 3 };
    const body = '## Body\nSome text';
    const result = stringifyFrontmatter(data, body);
    expect(result).toContain('---\n');
    expect(result).toContain('foo: bar');
    expect(result).toContain('count: 3');
    expect(result).toContain('---\n## Body\nSome text');
  });

  it('should produce frontmatter without body', () => {
    const data = { key: 'value' };
    const result = stringifyFrontmatter(data);
    expect(result).toMatch(/^---\n/);
    expect(result).toMatch(/\n---\n$/);
    expect(result).toContain('key: value');
  });

  it('should round-trip: parse then stringify preserves data', () => {
    const original = '---\nname: test\nitems:\n  - one\n  - two\n---\n## Notes\nKeep this';
    const parsed = parseFrontmatter<{ name: string; items: string[] }>(original);
    const result = stringifyFrontmatter(parsed.data, parsed.body);
    const reparsed = parseFrontmatter<{ name: string; items: string[] }>(result);
    expect(reparsed.data).toEqual(parsed.data);
    expect(reparsed.body).toBe(parsed.body);
  });
});
