/**
 * Purpose Profiles — Maps presentation purpose to design decisions.
 *
 * Each profile defines: preset candidates, preferred layouts,
 * text density rules, and design pattern reference.
 *
 * Used by /presentation skill for auto-selection and by
 * plan-to-bento for purpose-aware layout preferences.
 */

// ── Types ──

export interface PurposeProfile {
  /** Unique identifier */
  id: string;
  /** Display name (Korean) */
  name: string;
  /** Design pattern reference (e.g., "Jobs Keynote", "McKinsey") */
  pattern: string;
  /** Brief description */
  description: string;
  /** Trigger keywords for auto-detection (Korean + English) */
  keywords: string[];
  /** Preset candidates in priority order */
  presets: string[];
  /** Preferred layout types in priority order */
  layouts: string[];
  /** Text density rules */
  textRules: {
    /** Max words per slide */
    maxWordsPerSlide: number;
    /** Minimum font size in px (body text) */
    minBodyFontPx: number;
    /** Title style: 'statement' = 1 sentence conclusion, 'topic' = topic label */
    titleStyle: 'statement' | 'topic' | 'question';
  };
  /** Visual emphasis */
  emphasis: 'text' | 'data' | 'visual' | 'balanced';
}

// ── Profiles ──

export const PURPOSE_PROFILES: PurposeProfile[] = [
  {
    id: 'product-launch',
    name: '제품 런칭',
    pattern: 'Jobs Keynote',
    description: '신제품/서비스 발표. 최소 텍스트, 최대 임팩트.',
    keywords: ['제품 발표', '런칭', '출시', 'product launch', 'launch', 'unveil', 'reveal'],
    presets: ['kr-impact-dark', 'kr-neon-stage', 'kr-corporate-navy'],
    layouts: ['full-message', 'hero-sub'],
    textRules: { maxWordsPerSlide: 20, minBodyFontPx: 40, titleStyle: 'statement' },
    emphasis: 'visual',
  },
  {
    id: 'investor-pitch',
    name: '투자자 피칭',
    pattern: 'Sequoia/YC',
    description: '투자 유치용 10슬라이드 공식. 문제→해결→시장→팀.',
    keywords: ['투자', '피칭', '펀딩', 'investor', 'pitch', 'funding', 'VC', 'seed', 'series'],
    presets: ['kr-clean-white', 'kr-corporate-navy', 'kr-elegant-serif'],
    layouts: ['hero-sub', 'two-split', 'three-equal'],
    textRules: { maxWordsPerSlide: 40, minBodyFontPx: 32, titleStyle: 'statement' },
    emphasis: 'balanced',
  },
  {
    id: 'sales-demo',
    name: '세일즈 데모',
    pattern: 'Before→After',
    description: '고객 대상 제품 시연. 고통→솔루션→성과.',
    keywords: ['세일즈', '영업', '데모', '고객', 'sales', 'demo', 'prospect', 'client meeting'],
    presets: ['kr-impact-dark', 'kr-warm-coral', 'kr-corporate-navy'],
    layouts: ['two-split', 'asymmetric', 'hero-sub'],
    textRules: { maxWordsPerSlide: 35, minBodyFontPx: 32, titleStyle: 'statement' },
    emphasis: 'balanced',
  },
  {
    id: 'strategy-report',
    name: '전략 보고',
    pattern: 'McKinsey',
    description: 'Action Title + 근거 데이터. 10초 안에 이해 가능.',
    keywords: ['전략', '보고', '경영', '리뷰', 'strategy', 'report', 'McKinsey', 'consulting', 'executive'],
    presets: ['kr-corporate-navy', 'kr-clean-white', 'kr-blue-gradient'],
    layouts: ['table-grid', 'three-equal', 'two-split', 'kpi-highlight'],
    textRules: { maxWordsPerSlide: 60, minBodyFontPx: 28, titleStyle: 'statement' },
    emphasis: 'data',
  },
  {
    id: 'quarterly-review',
    name: '분기 실적',
    pattern: 'Dashboard',
    description: 'KPI 중심 실적 보고. 숫자 + 추세 + 색상 코딩.',
    keywords: ['분기', '실적', 'QBR', 'KPI', '매출', 'quarterly', 'review', 'revenue', 'metrics', 'OKR'],
    presets: ['kr-corporate-navy', 'kr-clean-white', 'kr-elegant-serif'],
    layouts: ['table-grid', 'two-split', 'three-equal'],
    textRules: { maxWordsPerSlide: 50, minBodyFontPx: 28, titleStyle: 'statement' },
    emphasis: 'data',
  },
  {
    id: 'conference-keynote',
    name: '컨퍼런스 키노트',
    pattern: 'TED/Sinek',
    description: '대규모 청중 대상 키노트. 감정 주도, 핵심 메시지.',
    keywords: ['키노트', '컨퍼런스', 'TED', '강연', 'keynote', 'conference', 'talk', 'stage'],
    presets: ['kr-neon-stage', 'kr-impact-dark', 'kr-gold-premium'],
    layouts: ['full-message', 'hero-sub', 'asymmetric', 'quote-statement'],
    textRules: { maxWordsPerSlide: 15, minBodyFontPx: 44, titleStyle: 'statement' },
    emphasis: 'visual',
  },
  {
    id: 'academic',
    name: '학술 발표',
    pattern: 'Academic',
    description: '연구 결과 발표. 구조화, 가독성, 출처 중심.',
    keywords: ['학술', '논문', '연구', '학회', 'academic', 'research', 'paper', 'thesis', 'conference paper'],
    presets: ['kr-clean-white', 'kr-elegant-serif', 'kr-corporate-navy'],
    layouts: ['three-equal', 'table-grid', 'two-split'],
    textRules: { maxWordsPerSlide: 60, minBodyFontPx: 28, titleStyle: 'topic' },
    emphasis: 'data',
  },
  {
    id: 'workshop',
    name: '워크숍/퍼실리테이션',
    pattern: 'Interactive',
    description: '참여형 워크숍. 질문 중심, 프레임워크 제시.',
    keywords: ['워크숍', '퍼실리테이션', '실습', '활동', 'workshop', 'facilitation', 'hands-on', 'exercise'],
    presets: ['kr-mint-fresh', 'kr-warm-coral', 'kr-clean-white'],
    layouts: ['two-split', 'three-equal', 'hero-sub'],
    textRules: { maxWordsPerSlide: 30, minBodyFontPx: 36, titleStyle: 'question' },
    emphasis: 'balanced',
  },
  {
    id: 'case-study',
    name: '케이스 스터디',
    pattern: 'STAR Framework',
    description: '상황→과제→행동→결과. Before/After 대비.',
    keywords: ['케이스', '사례', '성공', '고객 사례', 'case study', 'success story', 'client story'],
    presets: ['kr-elegant-serif', 'kr-clean-white', 'kr-warm-coral'],
    layouts: ['two-split', 'asymmetric', 'hero-sub'],
    textRules: { maxWordsPerSlide: 45, minBodyFontPx: 32, titleStyle: 'statement' },
    emphasis: 'balanced',
  },
  {
    id: 'company-culture',
    name: '기업 문화/올핸즈',
    pattern: 'Netflix Culture',
    description: '가치 선언 + 스토리텔링. 슬라이드당 1선언문.',
    keywords: ['문화', '올핸즈', '가치', '비전', 'culture', 'all-hands', 'values', 'mission', 'town hall'],
    presets: ['kr-warm-coral', 'kr-elegant-serif', 'kr-gold-premium'],
    layouts: ['full-message', 'hero-sub', 'three-equal', 'quote-statement'],
    textRules: { maxWordsPerSlide: 25, minBodyFontPx: 36, titleStyle: 'statement' },
    emphasis: 'text',
  },
  {
    id: 'roadmap',
    name: '로드맵/계획',
    pattern: 'Timeline',
    description: '시간축 중심 계획. Now→Next→Later, 마일스톤.',
    keywords: ['로드맵', '계획', '마일스톤', '타임라인', 'roadmap', 'plan', 'milestone', 'timeline', 'sprint'],
    presets: ['kr-blue-gradient', 'kr-clean-white', 'kr-mint-fresh'],
    layouts: ['timeline', 'table-grid', 'asymmetric', 'three-equal'],
    textRules: { maxWordsPerSlide: 40, minBodyFontPx: 28, titleStyle: 'topic' },
    emphasis: 'data',
  },
  {
    id: 'tech-architecture',
    name: '기술 아키텍처',
    pattern: 'C4/Diagram',
    description: '시스템 구조도. 계층 분해, 다이어그램 중심.',
    keywords: ['아키텍처', '설계', '시스템', '기술', 'architecture', 'system design', 'technical', 'engineering', 'infra'],
    presets: ['kr-impact-dark', 'kr-neon-stage', 'kr-blue-gradient'],
    layouts: ['asymmetric', 'two-split', 'hero-sub'],
    textRules: { maxWordsPerSlide: 35, minBodyFontPx: 28, titleStyle: 'topic' },
    emphasis: 'visual',
  },
  {
    id: 'creative-portfolio',
    name: '창의/포트폴리오',
    pattern: 'Lookbook',
    description: '비주얼 쇼케이스. 이미지 중심, 그리드 레이아웃.',
    keywords: ['포트폴리오', '작품', '디자인', '브랜드', 'portfolio', 'showcase', 'lookbook', 'brand', 'creative'],
    presets: ['kr-neon-stage', 'kr-mint-fresh', 'kr-elegant-serif'],
    layouts: ['three-equal', 'asymmetric', 'hero-sub'],
    textRules: { maxWordsPerSlide: 15, minBodyFontPx: 36, titleStyle: 'topic' },
    emphasis: 'visual',
  },
  {
    id: 'policy-briefing',
    name: '정책 브리핑',
    pattern: 'Policy Brief',
    description: '정책/규제 보고. 공식적, 객관적, 출처 명시.',
    keywords: ['정책', '규제', '브리핑', '공공', 'policy', 'briefing', 'regulation', 'government', 'public sector'],
    presets: ['kr-clean-white', 'kr-corporate-navy', 'kr-elegant-serif'],
    layouts: ['hero-sub', 'table-grid', 'two-split'],
    textRules: { maxWordsPerSlide: 55, minBodyFontPx: 28, titleStyle: 'statement' },
    emphasis: 'text',
  },
  {
    id: 'inspirational',
    name: '영감/동기부여',
    pattern: 'Motivational',
    description: '감정 호소. 인용문 + 풀블리드 비주얼.',
    keywords: ['영감', '동기부여', '격려', '모티베이션', 'inspirational', 'motivational', 'inspire', 'empower'],
    presets: ['kr-elegant-serif', 'kr-gold-premium', 'kr-impact-dark'],
    layouts: ['full-message', 'hero-sub', 'quote-statement'],
    textRules: { maxWordsPerSlide: 15, minBodyFontPx: 44, titleStyle: 'statement' },
    emphasis: 'visual',
  },
  {
    id: 'education-onboarding',
    name: '교육/온보딩',
    pattern: 'Step-by-Step',
    description: '단계별 학습. 체크리스트, 실습 가이드.',
    keywords: ['교육', '온보딩', '학습', '튜토리얼', 'education', 'onboarding', 'training', 'tutorial', 'guide'],
    presets: ['kr-mint-fresh', 'kr-clean-white', 'kr-warm-coral'],
    layouts: ['three-equal', 'table-grid', 'two-split'],
    textRules: { maxWordsPerSlide: 45, minBodyFontPx: 32, titleStyle: 'topic' },
    emphasis: 'balanced',
  },
  {
    id: 'competitive-analysis',
    name: '경쟁 분석',
    pattern: 'Comparison',
    description: '2~4개 대상 병렬 비교. 매트릭스 + 판정.',
    keywords: ['경쟁', '비교', '분석', '벤치마크', 'competitive', 'comparison', 'benchmark', 'versus', 'vs'],
    presets: ['kr-clean-white', 'kr-corporate-navy', 'kr-blue-gradient'],
    layouts: ['table-grid', 'two-split', 'three-equal'],
    textRules: { maxWordsPerSlide: 50, minBodyFontPx: 28, titleStyle: 'statement' },
    emphasis: 'data',
  },
  {
    id: 'retrospective',
    name: '프로젝트 회고',
    pattern: 'Retrospective',
    description: '좋았던 점/아쉬운 점/배운 점. 솔직한 톤.',
    keywords: ['회고', '레트로', '리뷰', '반성', 'retrospective', 'retro', 'postmortem', 'lessons learned'],
    presets: ['kr-warm-coral', 'kr-mint-fresh', 'kr-clean-white'],
    layouts: ['three-equal', 'two-split', 'hero-sub'],
    textRules: { maxWordsPerSlide: 35, minBodyFontPx: 32, titleStyle: 'topic' },
    emphasis: 'text',
  },
  {
    id: 'trend-report',
    name: '트렌드 리포트',
    pattern: 'Editorial',
    description: '매거진 스타일. 데이터 + 인사이트 큐레이션.',
    keywords: ['트렌드', '리포트', '전망', '인사이트', 'trend', 'report', 'forecast', 'insight', 'outlook'],
    presets: ['kr-elegant-serif', 'kr-corporate-navy', 'kr-gold-premium'],
    layouts: ['hero-sub', 'asymmetric', 'three-equal'],
    textRules: { maxWordsPerSlide: 40, minBodyFontPx: 32, titleStyle: 'statement' },
    emphasis: 'balanced',
  },
  {
    id: 'client-proposal',
    name: '고객 제안서',
    pattern: 'Proposal',
    description: '고객 맞춤 제안. 전문성 증명 + 다음 단계.',
    keywords: ['제안서', '프로포절', '견적', '제안', 'proposal', 'RFP', 'bid', 'offer', 'engagement'],
    presets: ['kr-gold-premium', 'kr-corporate-navy', 'kr-clean-white'],
    layouts: ['hero-sub', 'three-equal', 'two-split'],
    textRules: { maxWordsPerSlide: 45, minBodyFontPx: 32, titleStyle: 'statement' },
    emphasis: 'balanced',
  },
];

// ── Lookup Functions ──

/**
 * Find the best matching purpose profile from user input.
 * Scores each profile by keyword match count.
 */
export function detectPurpose(input: string): PurposeProfile | null {
  const normalized = input.toLowerCase();
  let bestMatch: PurposeProfile | null = null;
  let bestScore = 0;

  for (const profile of PURPOSE_PROFILES) {
    let score = 0;
    for (const keyword of profile.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        score += keyword.length; // longer matches score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = profile;
    }
  }

  return bestMatch;
}

/**
 * Get a purpose profile by ID.
 */
export function getPurposeProfile(id: string): PurposeProfile | undefined {
  return PURPOSE_PROFILES.find(p => p.id === id);
}

/**
 * List all available purpose profile IDs and names.
 */
export function listPurposes(): Array<{ id: string; name: string; pattern: string }> {
  return PURPOSE_PROFILES.map(p => ({ id: p.id, name: p.name, pattern: p.pattern }));
}
