import { describe, it, expect } from 'vitest';
import { parseSlideMarkdown } from '../parser/markdown-parser.js';

describe('Narrative tag parsing', () => {
  it('should parse <!-- section: --> tag', () => {
    const md = `# Title
---
<!-- section: A. 배경과 문제 (#1-3) -->
## 왜 시작했나
- 이유 1
---
## 현재 상태
- 상태 1
---
<!-- section: B. 해결 방안 (#4-5) -->
## 접근 방법
- 방법 1
`;
    const slides = parseSlideMarkdown(md);
    expect(slides[1].sectionTag).toBe('A. 배경과 문제');
    expect(slides[2].sectionTag).toBe('A. 배경과 문제');
    expect(slides[3].sectionTag).toBe('B. 해결 방안');
  });

  it('should parse <!-- climax --> tag', () => {
    const md = `# Title
---
<!-- climax -->
## 핵심 발견
> "생산성 47% 향상"
`;
    const slides = parseSlideMarkdown(md);
    expect(slides[1].roleOverride).toBe('climax');
  });

  it('should parse <!-- breather --> tag', () => {
    const md = `# Title
---
<!-- breather -->
## 잠시 생각해봅시다
> "좋은 질문이 좋은 답을 만든다"
`;
    const slides = parseSlideMarkdown(md);
    expect(slides[1].roleOverride).toBe('breather');
  });
});
