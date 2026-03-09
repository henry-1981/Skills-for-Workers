/**
 * SlideRenderer Interface — Strategy pattern for output targets
 *
 * Decouples geometry computation from rendering implementation.
 */

import type { ResolvedSlideGeometry } from './geometry-engine.js';

// ── Renderer Output Types ──

export type RendererOutput =
  | { type: 'pptx'; filePath: string };

// ── SlideRenderer Interface ──

export interface SlideRenderer {
  /** Render a structural slide (title, section-header, closing). */
  renderStructural(slideType: string, data: Record<string, string>): void;

  /** Render a content slide from pre-computed geometry. */
  renderContent(geometry: ResolvedSlideGeometry): void;

  /** Finalize and produce output. */
  finalize(): Promise<RendererOutput>;
}
