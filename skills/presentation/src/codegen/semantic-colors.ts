/**
 * Semantic Color Assignment for Bento Cards
 *
 * Analyzes card text content and assigns contextually appropriate colors.
 * Uses keyword matching to detect content semantics.
 * Colors are resolved from StylePreset cardFills/cardAccents.
 */

import type { RGB, StylePreset } from '../themes/types.js';
import { getPreset, DEFAULT_PRESET } from '../themes/presets.js';

// ── Semantic Categories ──

type Semantic =
  | 'problem'    // risk, danger, issue, failure
  | 'solution'   // fix, answer, approach, method
  | 'positive'   // success, green, pass, done, benefit
  | 'negative'   // fail, red, risk, danger, loss
  | 'warning'    // caution, yellow, review, attention
  | 'neutral'    // info, description, general
  | 'example'    // case study, demo, instance
  | 'process'    // step, flow, stage, tier
  | 'quote';     // quote, citation, saying

interface SemanticProfile {
  fill: RGB;
  /** Optional accent color for bars/highlights */
  accent?: RGB;
  /** Optional override for title text color */
  titleColor?: RGB;
}

// Map semantic categories to preset cardFills indices
const SEMANTIC_FILL_INDEX: Record<Semantic, number> = {
  problem: 4,
  solution: 3,
  positive: 3,
  negative: 4,
  warning: 5,
  neutral: 0,
  example: 1,
  process: 2,
  quote: 0,
};

const SEMANTIC_ACCENT_INDEX: Record<Semantic, number> = {
  problem: 4,
  solution: 1,
  positive: 1,
  negative: 4,
  warning: 3,
  neutral: 0,
  example: 0,
  process: 2,
  quote: 0,
};

// Semantics that get accent/titleColor overrides
const ACCENT_SEMANTICS = new Set<Semantic>(['problem', 'solution', 'example', 'quote']);
const TITLE_COLOR_SEMANTICS = new Set<Semantic>(['positive', 'negative', 'warning']);

function resolveSemanticProfile(sem: Semantic, preset: StylePreset): SemanticProfile {
  const fi = SEMANTIC_FILL_INDEX[sem] % preset.cardFills.length;
  const ai = SEMANTIC_ACCENT_INDEX[sem] % preset.cardAccents.length;
  return {
    fill: preset.cardFills[fi],
    accent: ACCENT_SEMANTICS.has(sem) ? preset.cardAccents[ai] : undefined,
    titleColor: TITLE_COLOR_SEMANTICS.has(sem) ? preset.cardAccents[ai] : undefined,
  };
}

// ── Keyword Dictionaries ──

const KEYWORD_MAP: Array<{ semantic: Semantic; keywords: string[] }> = [
  {
    semantic: 'problem',
    keywords: [
      '문제', '한계', '위험', '리스크', '소실', '실패', '방치', '부족',
      '어렵', '불가', '퇴사', '사라', '잃', '없',
      'problem', 'risk', 'danger', 'fail', 'loss', 'issue', 'limit',
    ],
  },
  {
    semantic: 'solution',
    keywords: [
      '해법', '해결', '방법', '접근', '전략', '보조', '지원', '도입',
      '만든', '구현', '제안', '설계',
      'solution', 'approach', 'method', 'fix', 'resolve', 'strategy',
    ],
  },
  {
    semantic: 'positive',
    keywords: [
      '성공', '완료', '통과', '달성', 'Done', 'PASS', 'GREEN',
      '안전', '표준', '일치', '승인', '이점', '장점',
      'success', 'pass', 'done', 'complete', 'benefit', 'safe',
    ],
  },
  {
    semantic: 'negative',
    keywords: [
      'FAIL', 'RED', '위험', '금지', '차단', '거부', '불량',
      '높음', '매우 높음', '필수', '법무',
      'fail', 'red', 'block', 'deny', 'reject',
    ],
  },
  {
    semantic: 'warning',
    keywords: [
      '주의', '검토', '권장', 'YELLOW', 'WARN',
      '변동', '조건', '필요',
      'warning', 'caution', 'review', 'attention',
    ],
  },
  {
    semantic: 'example',
    keywords: [
      '사례', '예시', '데모', '테스트', '결과', '활용',
      'case', 'example', 'demo', 'test', 'result',
    ],
  },
  {
    semantic: 'process',
    keywords: [
      '단계', '과정', '프로세스', '흐름', '아키텍처', 'Tier', '로드맵',
      '순서', '절차',
      'step', 'flow', 'process', 'stage', 'tier', 'pipeline', 'roadmap',
    ],
  },
  {
    semantic: 'quote',
    keywords: [
      '인용', '명언', '"', '비전', '원칙',
      'quote', 'vision', 'principle',
    ],
  },
];

// ── Classifier ──

/**
 * Detect the semantic category of a text.
 */
export function classifySemantic(text: string): Semantic {
  const lowerText = text.toLowerCase();
  let bestSemantic: Semantic = 'neutral';
  let bestScore = 0;

  for (const { semantic, keywords } of KEYWORD_MAP) {
    let score = 0;
    for (const kw of keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestSemantic = semantic;
    }
  }

  return bestSemantic;
}

/**
 * Get the color profile for a text's semantic category.
 */
export function getSemanticProfile(text: string, preset?: StylePreset): SemanticProfile {
  const p = preset || getPreset(DEFAULT_PRESET);
  const semantic = classifySemantic(text);
  return resolveSemanticProfile(semantic, p);
}

/**
 * Get card fill color based on combined title + body text.
 */
export function getCardFill(title: string, body?: string, preset?: StylePreset): RGB {
  const combined = `${title} ${body || ''}`;
  return getSemanticProfile(combined, preset).fill;
}

/**
 * Get accent color if the content warrants one.
 */
export function getCardAccent(title: string, body?: string, preset?: StylePreset): RGB | undefined {
  const combined = `${title} ${body || ''}`;
  return getSemanticProfile(combined, preset).accent;
}

/**
 * Get title color override if the content has strong semantic signal.
 */
export function getCardTitleColor(title: string, body?: string, preset?: StylePreset): RGB | undefined {
  const combined = `${title} ${body || ''}`;
  return getSemanticProfile(combined, preset).titleColor;
}

/**
 * Assign colors to an array of cards, ensuring visual variety.
 * If two adjacent cards get the same semantic, shifts the second.
 */
export function assignCardColors(
  cards: Array<{ title: string; body?: string }>,
  preset?: StylePreset,
): Array<{ fill: RGB; accent?: RGB; titleColor?: RGB }> {
  const p = preset || getPreset(DEFAULT_PRESET);
  const results = cards.map((card, _i) => {
    const combined = `${card.title} ${card.body || ''}`;
    const semantic = classifySemantic(combined);
    return {
      semantic,
      ...resolveSemanticProfile(semantic, p),
    };
  });

  // Deduplicate adjacent same-semantic cards
  for (let i = 1; i < results.length; i++) {
    if (results[i].semantic === results[i - 1].semantic) {
      const nextIdx = (SEMANTIC_FILL_INDEX[results[i].semantic] + i) % p.cardFills.length;
      results[i] = { ...results[i], fill: p.cardFills[nextIdx] };
    }
  }

  return results.map(({ fill, accent, titleColor }) => ({
    fill,
    accent,
    titleColor,
  }));
}
