import { parse as yamlParse, stringify as yamlStringify } from 'yaml';

export interface FrontmatterResult<T> {
  data: T;
  body: string;
}

const FENCE = '---';

/**
 * Parse YAML frontmatter from markdown content.
 * Returns { data, body } where body is everything after the closing ---.
 */
export function parseFrontmatter<T = Record<string, unknown>>(content: string): FrontmatterResult<T> {
  const lines = content.split('\n');
  if (lines[0]?.trim() !== FENCE) {
    return { data: {} as T, body: content };
  }

  const closingIndex = lines.indexOf(FENCE, 1);
  if (closingIndex === -1) {
    return { data: {} as T, body: content };
  }

  const yamlBlock = lines.slice(1, closingIndex).join('\n');
  const body = lines.slice(closingIndex + 1).join('\n');

  try {
    const data = yamlParse(yamlBlock) as T;
    return { data: data ?? ({} as T), body };
  } catch {
    return { data: {} as T, body: content };
  }
}

/**
 * Stringify data as YAML frontmatter + markdown body.
 * Body is preserved as-is (Claude-owned content safe).
 */
export function stringifyFrontmatter<T = Record<string, unknown>>(data: T, body: string = ''): string {
  const yaml = yamlStringify(data, { lineWidth: 0 }).trimEnd();
  return `${FENCE}\n${yaml}\n${FENCE}\n${body}`;
}
