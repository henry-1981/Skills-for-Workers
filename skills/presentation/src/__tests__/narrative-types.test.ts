import { describe, it, expect } from 'vitest';
import type { SlideRole, NarrativeContext, SectionInfo } from '../parser/types.js';

describe('NarrativeContext types', () => {
  it('should accept valid SlideRole values', () => {
    const roles: SlideRole[] = [
      'opener', 'section-bridge', 'build-up',
      'evidence', 'climax', 'breather', 'closer'
    ];
    expect(roles).toHaveLength(7);
  });

  it('should construct valid NarrativeContext', () => {
    const ctx: NarrativeContext = {
      role: 'build-up',
      section: { id: 'A', title: '배경', slideRange: [1, 5], slideCount: 5 },
      positionInSection: 2,
      sectionSlideCount: 5,
      isFirstInSection: false,
      isLastInSection: false,
    };
    expect(ctx.role).toBe('build-up');
    expect(ctx.section?.id).toBe('A');
  });
});
