# Gap Analysis: pptx-design-styles 30개 → 우리 5개 아키타입

## 판정 기준

- **흡수**: 우리 아키타입과 같은 방향 — 정밀 명세만 가져오면 됨
- **확장**: 우리에 없는 신규 아키타입 후보 — 사내 사용 맥락에 가치 있음
- **변형**: 기존 아키타입의 서브변형으로 추가 가능 — 독립 아키타입까진 불필요
- **제외**: 사내 발표 맥락에 부적합하거나 수요 낮음

## 전체 매핑 테이블

| # | 스타일 | Best For | 우리 아키타입 | 판정 | 우선순위 | 근거 |
|---|--------|----------|------------|------|----------|------|
| 01 | Glassmorphism | SaaS, AI product | dark-tech | 흡수 | HIGH | dark-tech의 대표 서브스타일 |
| 02 | Neo-Brutalism | Startup, marketing | brutalist-typo | 흡수 | HIGH | 벤치마크에서 +6점 입증 |
| 03 | **Bento Grid** | Feature comparison, data | (없음) | **확장** | **HIGH** | 대시보드/KPI 보고에 최적 — 사내 수요 높음 |
| 04 | Dark Academia | Education, university | light-editorial | 변형 | LOW | 교육기관 발표 빈도 낮음 |
| 05 | Gradient Mesh | Brand, creative portfolio | (없음) | 제외 | — | warm-organic과 겹치되 차별 불충분 |
| 06 | Claymorphism | Product, education | warm-organic | 변형 | LOW | 3D 느낌 특화, 사내 수요 불명확 |
| 07 | Swiss International | Consulting, finance | swiss-minimal | 흡수 | HIGH | 벤치마크에서 +7점 입증 |
| 08 | Aurora Neon Glow | AI, cybersecurity | dark-tech | 흡수 | MED | dark-tech 변형 — 네온 강조 |
| 09 | Retro Y2K | Events, fashion | (없음) | 제외 | — | 사내 발표 맥락에 부적합 |
| 10 | Nordic Minimalism | Wellness, non-profit | swiss-minimal | 변형 | MED | swiss-minimal 따뜻한 변형 |
| 11 | Typographic Bold | Brand statements | brutalist-typo | 흡수 | MED | brutalist-typo와 매우 유사 |
| 12 | **Duotone Split** | Strategy, compare/contrast | (없음) | **확장** | **HIGH** | 전략 비교/Before-After에 최적 — 사내 수요 높음 |
| 13 | Monochrome Minimal | Luxury, high-end consulting | swiss-minimal | 변형 | MED | swiss-minimal의 극단적 절제 변형 |
| 14 | Cyberpunk Outline | Gaming, AI infrastructure | dark-tech | 변형 | LOW | 게임/보안 특화 — 일반 사용 제한 |
| 15 | **Editorial Magazine** | Annual reports, brand stories | light-editorial | 흡수 | **HIGH** | light-editorial의 정확한 대응 |
| 16 | Pastel Soft UI | Healthcare, education | warm-organic | 흡수 | MED | warm-organic 서브스타일 |
| 17 | Dark Neon Miami | Entertainment, nightlife | (없음) | 제외 | — | 엔터/이벤트 특화 |
| 18 | Hand-crafted Organic | Eco, wellness, craft | warm-organic | 흡수 | HIGH | warm-organic 정밀 명세 소스 |
| 19 | Isometric 3D Flat | IT architecture, diagrams | (없음) | **확장** | **MED** | 시스템 다이어그램에 유용 |
| 20 | Vaporwave | Creative, subculture | (없음) | 제외 | — | 사내 발표 맥락에 부적합 |
| 21 | Art Deco Luxe | Luxury, gala, premium | (없음) | **확장** | **MED** | VIP/파트너 대상 발표에 유용 |
| 22 | Brutalist Newspaper | Media, research | brutalist-typo | 변형 | MED | brutalist-typo 미디어 변형 |
| 23 | Stained Glass Mosaic | Cultural, museums | (없음) | 제외 | — | 문화기관 특화 |
| 24 | Liquid Blob Morphing | Biotech, innovation | warm-organic | 변형 | LOW | 바이오텍 특화 |
| 25 | Memphis Pop Pattern | Fashion, youth marketing | (없음) | 제외 | — | 패션/리테일 특화 |
| 26 | Dark Forest Nature | Environmental, outdoor | (없음) | 변형 | LOW | dark-tech + organic 혼합 |
| 27 | Architectural Blueprint | Architecture, engineering | (없음) | **확장** | **MED** | 기술/설계 문서 프레젠테이션에 유용 |
| 28 | Maximalist Collage | Advertising, fashion | (없음) | 제외 | — | 광고 에이전시 특화 |
| 29 | SciFi Holographic Data | Defense tech, AI research | dark-tech | 변형 | LOW | dark-tech HUD 변형 |
| 30 | Risograph Print | Independent, art zines | (없음) | 제외 | — | 인디 출판 특화 |

## 판정 요약

| 판정 | 수량 | 스타일 |
|------|------|--------|
| **흡수** | 8 | Glassmorphism, Neo-Brutalism, Swiss International, Aurora Neon, Typographic Bold, Editorial Magazine, Pastel Soft UI, Hand-crafted Organic |
| **확장** (신규 아키타입) | 5 | Bento Grid, Duotone Split, Isometric 3D, Art Deco Luxe, Architectural Blueprint |
| **변형** (서브스타일) | 9 | Dark Academia, Claymorphism, Nordic Minimal, Monochrome Minimal, Cyberpunk Outline, Brutalist Newspaper, Liquid Blob, Dark Forest, SciFi Holographic |
| **제외** | 8 | Gradient Mesh, Retro Y2K, Dark Neon Miami, Vaporwave, Stained Glass Mosaic, Memphis Pop, Maximalist Collage, Risograph Print |

## Phase 3 채용 목록

### 1. 기존 5개 아키타입 정밀화 (흡수)

각 아키타입의 design-specs.md에 아래 스타일의 명세를 통합:

| 아키타입 | 흡수 대상 | 명세 소스 |
|---------|----------|----------|
| dark-tech | Glassmorphism, Aurora Neon Glow | 01, 08 |
| swiss-minimal | Swiss International | 07 |
| brutalist-typo | Neo-Brutalism, Typographic Bold | 02, 11 |
| warm-organic | Hand-crafted Organic, Pastel Soft UI | 18, 16 |
| light-editorial | Editorial Magazine | 15 |

### 2. 신규 아키타입 추가 (확장)

| 신규 아키타입 | 대응 스타일 | 사내 사용 맥락 | 우선순위 |
|-------------|-----------|-------------|----------|
| **bento-grid** | 03 Bento Grid | KPI 대시보드, 기능 비교, 제품 개요 | HIGH |
| **duotone-split** | 12 Duotone Split | 전략 비교, Before/After, A vs B | HIGH |
| **art-deco-luxe** | 21 Art Deco Luxe | VIP/파트너 대상, 프리미엄 연간 보고 | MED |
| **isometric-tech** | 19 Isometric 3D Flat | IT 아키텍처, 시스템 다이어그램 | MED |
| **blueprint** | 27 Architectural Blueprint | 기술 설계 문서, 엔지니어링 발표 | MED |

### 3. 최종 아키타입 풀: 5 → 10

```
기존 5 (정밀화):     dark-tech, swiss-minimal, brutalist-typo, warm-organic, light-editorial
신규 5 (HIGH 2+MED 3): bento-grid, duotone-split, art-deco-luxe, isometric-tech, blueprint
```

> 서브변형(9개)은 Phase 3에서 design-specs.md 내 각 아키타입의 "변형" 섹션으로 언급만 하되 독립 아키타입으로는 추가하지 않는다. 사용자가 키워드로 요청하면 해당 변형으로 해석.

## 제외 근거

| 스타일 | 제외 이유 |
|--------|----------|
| Gradient Mesh | warm-organic과 겹치되 사내 차별화 가치 불충분 |
| Retro Y2K | 레트로/이벤트 특화 — 기업 발표 맥락에 부적합 |
| Dark Neon Miami | 엔터테인먼트/나이트라이프 — 업무 발표와 거리 멂 |
| Vaporwave | 서브컬처 특화 |
| Stained Glass Mosaic | 문화기관/박물관 특화 |
| Memphis Pop | 패션/리테일 마케팅 특화 |
| Maximalist Collage | 광고 에이전시 크리에이티브 특화 |
| Risograph Print | 인디 출판/아트진 특화 |
