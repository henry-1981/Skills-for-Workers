# Human Writing Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** AI 스킬 응답이 교과서적 AI 톤이 아닌, 인간 전문가가 실시간으로 사고하는 것처럼 읽히도록 변환하는 파이프라인 스킬을 만든다.

**Architecture:** 5단계 변환 파이프라인(cognitive_trace -> asymmetry_injection -> connector_prune -> controlled_uncertainty -> domain_voice)과 3단계 검증(ai_smell_lint, fact_integrity_check, redundancy_prune)을 하나의 스킬로 통합한다. 각 단계는 `references/` 내 개별 문서로 분리하여, 다른 스킬에서도 특정 단계만 참조할 수 있게 한다.

**Tech Stack:** Markdown skill definitions, YAML frontmatter, reference documents

---

## Design Decisions

### D1: 단일 스킬 vs 단계별 스킬

**선택: 단일 스킬 (`human-writing`)** with 참조 문서 분리

- 이유: 파이프라인 전체가 하나의 워크플로우로 동작해야 효과적
- 개별 단계는 `references/`에 분리하여 다른 스킬에서 선택적 참조 가능
- 사용자가 전체 파이프라인 또는 개별 단계를 선택할 수 있는 모드 제공

### D2: 도메인 특화 vs 범용

**선택: 범용 기본 + 도메인 플러그인 구조**

- 기본 파이프라인은 도메인 무관하게 동작 (Steps 1-4)
- Step 5(domain_voice)만 도메인별 참조 문서로 교체 가능
- k-sunshine용 도메인 보이스는 예시로 포함

### D3: 검증 단계 위치

**선택: 파이프라인 내부 통합**

- 변환 5단계 후 자동으로 검증 3단계 실행
- 검증 실패 시 구체적 지적과 함께 재변환 가이드 제공

---

## Target Structure

```
skills/human-writing/
├── SKILL.md                           # 메인 스킬: 파이프라인 오케스트레이션
└── references/
    ├── pipeline-overview.md           # 파이프라인 전체 흐름도 + 단계 요약
    ├── step1-cognitive-trace.md       # 사고 흔적 구조 변환 규칙
    ├── step2-asymmetry-injection.md   # 균형 파괴 + 리듬 변환 규칙
    ├── step3-connector-prune.md       # 접속사/교과서 흐름 제거 규칙
    ├── step4-controlled-uncertainty.md # 과단정 제거 규칙
    ├── step5-domain-voice.md          # 도메인 전문가 필체 (범용 기본)
    ├── verify-ai-smell.md             # AI 냄새 검사 체크리스트
    ├── verify-fact-integrity.md       # 수치/고유명사 변형 검사 규칙
    └── verify-redundancy.md           # 중복 문장 제거 규칙
```

---

## Task 1: 스킬 디렉토리 구조 생성

**Files:**
- Create: `skills/human-writing/references/.gitkeep`

**Step 1: 디렉토리 생성**

```bash
mkdir -p skills/human-writing/references
touch skills/human-writing/references/.gitkeep
```

**Step 2: Commit**

```bash
git add skills/human-writing/
git commit -m "chore: human-writing 스킬 디렉토리 구조 생성"
```

---

## Task 2: 파이프라인 개요 참조 문서 작성

**Files:**
- Create: `skills/human-writing/references/pipeline-overview.md`

**Step 1: 파이프라인 개요 작성**

파이프라인 전체 흐름, 각 단계의 목적, 입출력 관계를 정의한다.

```markdown
# Human Writing Pipeline Overview

## Pipeline Flow

원본 텍스트 → [Step 1-5 변환] → [Verify 1-3 검증] → 최종 텍스트

## Stage Summary

| Step | Name | Purpose | Key Transformation |
|------|------|---------|-------------------|
| 1 | cognitive_trace | 사고 흔적 구조 | 결론선행 → 가정→긴장→수정→잠정결론 |
| 2 | asymmetry_injection | 균형 파괴 | 대칭 구조 → 비대칭 (확장/압축/미해결) |
| 3 | connector_prune | 접속사 제거 | 과도한 연결어 → 직접 진술 |
| 4 | controlled_uncertainty | 과단정 제거 | 절대 표현 → 보정된 확신 |
| 5 | domain_voice | 전문가 필체 | 교과서 톤 → 실무자 톤 |
| V1 | ai_smell_lint | AI 패턴 검사 | 잔존 AI 흔적 탐지 |
| V2 | fact_integrity_check | 사실 무결성 | 수치/명칭/조항 변형 검사 |
| V3 | redundancy_prune | 중복 제거 | 의미 중복 문장 탐지 |

## Invariants (불변 규칙)

모든 단계에서 반드시 지켜야 하는 규칙:
1. 새로운 사실을 추가하지 않는다
2. 숫자, 날짜, 고유명사, 조항 번호를 변경하지 않는다
3. 법적/기술적 의무 표현(shall/must)의 강제성을 약화시키지 않는다
4. 원문의 의미와 사실적 주장을 보존한다
```

**Step 2: Commit**

```bash
git add skills/human-writing/references/pipeline-overview.md
git commit -m "docs: 파이프라인 개요 참조 문서 작성"
```

---

## Task 3: Step 1 - Cognitive Trace 참조 문서 작성

**Files:**
- Create: `skills/human-writing/references/step1-cognitive-trace.md`

**Step 1: 사고 흔적 구조 변환 규칙 작성**

```markdown
# Step 1: Cognitive Trace (사고 흔적 구조)

## Purpose

교과서적 결론선행 서술을 → 전문가가 실시간으로 사고하는 흐름으로 재구성한다.

## Transformation Pattern

### Input Structure (typical AI)
결론 → 근거1 → 근거2 → 근거3 → 요약

### Output Structure (cognitive trace)
초기 가정 → 의심/긴장 → 수정/보완 → 잠정적 결론

## Rules

1. **구조 재배치**: 결론을 끝으로 옮기고, 사고 과정을 앞에 배치
2. **Thinking Markers 삽입**: 2-4개의 사고 표지를 자연스럽게 삽입
   - "여기서 걸리는 점은..."
   - "그런데 이 지점이..."
   - "실무에서는..."
   - "내 판단은 여기까지다."
   - "이건 좀 더 따져봐야 하는데..."
   - "처음엔 X라고 봤는데..."
3. **깔끔한 결론 금지**: "정리하면", "결론적으로", "요약하면" 으로 끝내지 않는다
4. **열린 마무리**: 잠정적이거나 열린 결말로 끝낸다

## Guardrails

- 의미와 사실적 주장을 유지한다
- 새로운 사실을 도입하지 않는다
- 전문적 어조를 유지한다 (캐주얼하게 변하지 않도록)

## Before/After Example

**Before (AI style):**
> 의료기기 샘플 제공은 규약 제6조에 따라 허용됩니다. 다만 신제품 출시 후 1년 이내,
> 제품당 연 2회 이내로 제한됩니다. 또한 샘플 수량은 1개로 제한되며,
> 사용 후 결과 보고서를 받아야 합니다.

**After (cognitive trace):**
> 샘플 제공이 허용되는지부터 보면, 제6조가 근거다.
> 여기서 걸리는 점은 "허용"이라고 해서 무조건 줘도 된다는 뜻이 아니라는 거다.
> 신제품 출시 후 1년이라는 시간 제한이 있고, 연 2회·1개라는 수량 제한이 붙는다.
> 실무에서는 결과 보고서 회수가 더 문제다—안 받으면 사후 관리 미비로 잡힌다.
```

**Step 2: Commit**

```bash
git add skills/human-writing/references/step1-cognitive-trace.md
git commit -m "docs: Step 1 cognitive trace 변환 규칙 작성"
```

---

## Task 4: Step 2 - Asymmetry Injection 참조 문서 작성

**Files:**
- Create: `skills/human-writing/references/step2-asymmetry-injection.md`

**Step 1: 균형 파괴 변환 규칙 작성**

```markdown
# Step 2: Asymmetry Injection (균형 파괴 + 리듬)

## Purpose

AI의 대칭적 나열 구조를 의도적으로 비대칭으로 만들어 인간적 리듬을 부여한다.

## Transformation Pattern

### Input Structure (typical AI)
- 포인트 A (2문장)
- 포인트 B (2문장)
- 포인트 C (2문장)

### Output Structure (asymmetric)
- 포인트 A: 확장 (2-4문장, 구체적 디테일)
- 포인트 B: 압축 (1문장)
- 포인트 C: 미해결 (1-2문장, 불확실성 포함)

## Rules

1. **3항 비대칭**: 3개 항목이 있으면 반드시 비대칭으로 재구성
   - (a) 하나를 크게 확장 (2-4문장)
   - (b) 하나를 극도로 압축 (1문장)
   - (c) 하나를 부분적 미해결로 남김 (불확실성 표현 포함)
2. **반복 패턴 제거**: "첫째/둘째/셋째", "A, B, C 모두..." 같은 기계적 나열 제거
3. **수사 질문**: 자연스러운 경우에 한해 최대 1개 수사적 질문 허용
4. **문장 길이 변주**: 최소 2개의 독립된 짧은 문장(10자 이내) 포함

## Guardrails

- 새로운 사실 추가 금지
- 숫자, 날짜, 고유명사, 규정 참조 변경 금지
- 전문적 어조 유지 (캐주얼 전환 금지)
```

**Step 2: Commit**

```bash
git add skills/human-writing/references/step2-asymmetry-injection.md
git commit -m "docs: Step 2 asymmetry injection 변환 규칙 작성"
```

---

## Task 5: Step 3 - Connector Prune 참조 문서 작성

**Files:**
- Create: `skills/human-writing/references/step3-connector-prune.md`

**Step 1: 접속사 제거 규칙 작성**

```markdown
# Step 3: Connector Prune (접속사/교과서 흐름 제거)

## Purpose

AI 특유의 과도한 연결어와 매끄러운 흐름을 제거하여 직접적인 서술로 전환한다.

## Target Connectors (제거/대체 대상)

### 삭제 우선
| 연결어 | 대체 전략 |
|--------|----------|
| 따라서 | 삭제하고 문단 분리 |
| 또한 | 삭제하고 새 문장 시작 |
| 뿐만 아니라 | 삭제하고 독립 문장으로 |
| 한편 | 삭제하고 문단 분리 |
| 즉 | 삭제, 필요시 대시(—)로 대체 |
| 결론적으로 | 삭제 |
| 정리하면 | 삭제 |
| 종합하면 | 삭제 |
| 이러한 관점에서 | 삭제 |

### 조건부 유지
| 연결어 | 유지 조건 |
|--------|----------|
| 그러나/하지만 | 실질적 대조가 있을 때만 |
| 다만 | 법적/기술적 단서일 때만 |
| 만약 | 조건문이 필수적일 때만 |

## Rules

1. **직접 진술 선호**: 연결어 대신 문단 분리와 직접 진술 사용
2. **인과 관계 보존**: 논리적 인과관계 자체는 유지, 표지(signposting)만 제거
3. **문단 분리 활용**: 연결어 삭제 후 자연스러운 문단 분리로 흐름 유지

## Guardrails

- 새로운 내용 추가 금지
- 기술적 의미 변경 금지
- 필수적 인과관계까지 삭제하지 않도록 주의
```

**Step 2: Commit**

```bash
git add skills/human-writing/references/step3-connector-prune.md
git commit -m "docs: Step 3 connector prune 변환 규칙 작성"
```

---

## Task 6: Step 4 - Controlled Uncertainty 참조 문서 작성

**Files:**
- Create: `skills/human-writing/references/step4-controlled-uncertainty.md`

**Step 1: 과단정 제거 규칙 작성**

```markdown
# Step 4: Controlled Uncertainty (과단정 제거)

## Purpose

절대적 단정을 보정된 확신으로 교체하여 노련한 전문가의 어조를 만든다.

## Replacement Table

### 절대 표현 → 보정 표현
| 원문 | 대체 | 적용 조건 |
|------|------|----------|
| 반드시 | 대체로 / 통상 | 법적 의무가 아닌 경우 |
| 항상 | 현 시점에선 / 대부분의 경우 | 통계적 진술인 경우 |
| 명확히 | 합리적으로는 / 현행 기준으로 | 해석의 여지가 있는 경우 |
| 절대 ~않다 | ~하기 어렵다 / ~한 사례는 드물다 | 경험적 진술인 경우 |
| 확실히 | 현재까지는 / 실무상으로는 | 변경 가능성이 있는 경우 |

### 유지 대상 (변환 금지)
| 표현 | 유지 이유 |
|------|----------|
| ~해야 한다 (shall/must) | 법적/규정상 의무 |
| ~금지된다 | 명시적 금지 조항 |
| ~위반이다 | 법적 판단 |

## Rules

1. **보정 대체**: 위 테이블에 따라 절대 표현을 보정 표현으로 교체
2. **범위 표시**: 최대 2문장의 전제/범위 문장 추가 허용
   - 예: "전제: 2024년 12월 기준 규정 해석이다."
   - 예: "범위: 국내 의료기기 유통사에 한정한 판단이다."
3. **의무 표현 보존**: 법적/기술적 강제 표현은 절대 약화시키지 않는다

## Guardrails

- 새로운 사실 추가 금지
- 의무적 준수 사항(mandatory compliance) 약화 금지
- 최대 2문장만 추가 허용 (전제/범위)
```

**Step 2: Commit**

```bash
git add skills/human-writing/references/step4-controlled-uncertainty.md
git commit -m "docs: Step 4 controlled uncertainty 변환 규칙 작성"
```

---

## Task 7: Step 5 - Domain Voice 참조 문서 작성

**Files:**
- Create: `skills/human-writing/references/step5-domain-voice.md`

**Step 1: 도메인 전문가 필체 규칙 작성**

```markdown
# Step 5: Domain Voice (도메인 전문가 필체)

## Purpose

교과서/마케팅 톤을 실무 전문가가 동료에게 쓰는 톤으로 전환한다.

## Default: Regulatory Affairs Professional

기본 도메인은 의료기기/디지털헬스 RA/QA 전문가다.
다른 도메인 스킬에서 이 파일을 참조할 때는 아래 패턴만 유지하고 역할을 교체한다.

## Rules

1. **인용 보존**: 조항 번호, 규정명, 수치를 그대로 유지
2. **이론 vs 실무 대조**: 정확히 1문장의 "이론 vs 실무" 대조 삽입
   - 새로운 사실 없이 진술 가능한 경우에만
   - 예: "이론상은 X지만, 실무에서는 Y가 더 문제다."
   - 삽입할 수 없으면 생략 (강제 아님)
3. **구체 명사 선호**: 추상어 대신 구체 명사 사용
   | 추상 (지양) | 구체 (지향) |
   |------------|-----------|
   | 관련 사항 | 리뷰 포인트 |
   | 해당 프로세스 | 심의 절차 |
   | 적절한 조치 | 시정 보고서 |
   | 다양한 측면 | 비용, 일정, 리스크 |
4. **마케팅/리더십 톤 금지**: "혁신적", "최적의 솔루션", "전략적 파트너십" 등 배제

## Domain Customization Guide

다른 도메인 스킬에서 이 단계를 커스터마이즈하려면:
- ROLE을 해당 도메인 전문가로 변경
- 구체 명사 테이블을 도메인에 맞게 교체
- "이론 vs 실무" 패턴은 유지

### 도메인 예시

| Domain | Role | 구체 명사 예시 |
|--------|------|-------------|
| RA/QA (기본) | Medical device RA professional | 심의, 인증, 시정보고서 |
| Clinical | Clinical research associate | 프로토콜, IRB, AE 보고 |
| Finance | Corporate finance analyst | 현금흐름, 자본비용, 감가상각 |
| Legal | Corporate counsel | 계약 조항, 면책, 소멸시효 |
```

**Step 2: Commit**

```bash
git add skills/human-writing/references/step5-domain-voice.md
git commit -m "docs: Step 5 domain voice 변환 규칙 작성"
```

---

## Task 8: 검증 참조 문서 작성 (3개)

**Files:**
- Create: `skills/human-writing/references/verify-ai-smell.md`
- Create: `skills/human-writing/references/verify-fact-integrity.md`
- Create: `skills/human-writing/references/verify-redundancy.md`

**Step 1: AI 냄새 검사 체크리스트 작성**

```markdown
# Verify 1: AI Smell Lint (AI 냄새 검사)

## Purpose

변환 후 텍스트에 잔존하는 AI 특유 패턴을 탐지한다.

## Detection Checklist

### Structure Smells
- [ ] 3항 이상 완벽 대칭 나열이 남아있는가
- [ ] "첫째/둘째/셋째" 또는 "A/B/C" 기계적 번호매김이 있는가
- [ ] 결론이 "정리하면/결론적으로/요약하면"으로 시작하는가
- [ ] 모든 문단 길이가 균일한가 (±1문장 이내)

### Language Smells
- [ ] "따라서/또한/뿐만 아니라/한편/즉" 과잉 사용 (3회 이상)
- [ ] "반드시/항상/명확히" 비법적 맥락에서 절대 표현 사용
- [ ] "다양한/종합적인/체계적인/효과적인" 추상적 수식어 과잉
- [ ] 능동태 부족 (피동 구문 3연속 이상)

### Tone Smells
- [ ] 마케팅 용어 ("혁신적", "최적의", "전략적 파트너십")
- [ ] 과도한 정중함 ("~하시기 바랍니다" 반복)
- [ ] 교과서적 설명체 ("~란 ~를 말한다" 정의 나열)

## Scoring

| 항목 수 | 판정 |
|---------|------|
| 0 | PASS - 인간적 텍스트 |
| 1-2 | WARN - 부분 재변환 권장 |
| 3+ | FAIL - 파이프라인 재실행 권장 |
```

**Step 2: 사실 무결성 검사 규칙 작성**

```markdown
# Verify 2: Fact Integrity Check (사실 무결성 검사)

## Purpose

변환 과정에서 사실적 내용이 변형되지 않았는지 검증한다.

## Check Items

### Hard Facts (변경 시 FAIL)
- [ ] 숫자 (금액, 비율, 횟수, 날짜) 원본과 동일
- [ ] 조항/조 번호 원본과 동일
- [ ] 고유명사 (기관명, 법령명, 제품명) 원본과 동일
- [ ] 인용문 원본과 동일

### Soft Facts (의미 변경 시 WARN)
- [ ] 인과관계 방향이 유지되는가
- [ ] 조건-결과 구조가 보존되는가
- [ ] 의무/허용/금지 강도가 유지되는가
- [ ] 범위 한정(~에 한하여, ~의 경우)이 보존되는가

## Procedure

1. 원본과 변환본을 문장 단위로 대조
2. Hard Facts 항목부터 점검
3. Soft Facts 항목 점검
4. 위반 발견 시 해당 문장과 원본 문장을 병기하여 보고
```

**Step 3: 중복 제거 규칙 작성**

```markdown
# Verify 3: Redundancy Prune (중복 문장 제거)

## Purpose

변환 과정에서 발생할 수 있는 의미 중복 문장을 탐지하고 제거한다.

## Detection Patterns

### 동일 진술 반복
같은 사실을 다른 표현으로 2회 이상 진술하는 경우
- 예: "1년 이내에 제공해야 한다" + "12개월이라는 기간 제한이 있다"

### 요약-재진술 중복
본문에서 설명한 내용을 마지막에 다시 요약하는 경우
- 파이프라인 Step 1에서 결론 재배치 시 흔히 발생

### 조건 중복
동일 조건을 여러 곳에서 반복 명시하는 경우

## Rules

1. 의미적으로 동일한 문장이 2개 이상이면 더 구체적인 것만 유지
2. 요약 문단이 본문 내용과 80% 이상 중복이면 삭제
3. 삭제 시 논리 흐름이 끊기지 않는지 확인
```

**Step 4: Commit**

```bash
git add skills/human-writing/references/verify-ai-smell.md
git add skills/human-writing/references/verify-fact-integrity.md
git add skills/human-writing/references/verify-redundancy.md
git commit -m "docs: 검증 참조 문서 3종 작성 (AI smell, fact integrity, redundancy)"
```

---

## Task 9: 메인 SKILL.md 작성

**Files:**
- Create: `skills/human-writing/SKILL.md`

**Step 1: SKILL.md frontmatter + 본문 작성**

k-sunshine의 SKILL.md 패턴을 따르되, 파이프라인 오케스트레이션에 맞게 구성한다.

핵심 구조:
- **Frontmatter**: name, description (파이프라인 트리거 키워드 포함)
- **Mode 1: Full Pipeline** - 전체 5+3단계 자동 실행
- **Mode 2: Selective Steps** - 특정 단계만 선택 실행
- **Mode 3: Lint Only** - 기존 텍스트에 AI 냄새 검사만 실행
- **Pipeline Execution Flow** - 단계별 실행 순서와 판단 기준
- **Integration Guide** - 다른 스킬에서 참조하는 방법

SKILL.md 내용 (요약):

```markdown
---
name: human-writing
description: >
  AI-generated text를 인간 전문가의 사고 흐름처럼 변환하는 파이프라인 스킬.
  5단계 변환(cognitive trace, asymmetry injection, connector prune,
  controlled uncertainty, domain voice)과 3단계 검증(AI smell lint,
  fact integrity check, redundancy prune)을 제공한다.
  Triggers: human writing, AI 톤 제거, 인간적 글쓰기, 사고 흔적,
  AI 냄새, 텍스트 변환, 글쓰기 스타일
---

# Human Writing: AI-to-Human Text Transformation Pipeline

## Pipeline Overview

[references/pipeline-overview.md 요약 + 흐름도]

## Assessment Workflow

### Mode 1: Full Pipeline
입력 텍스트에 대해 5단계 변환 + 3단계 검증을 순차 실행한다.
1. Read references/step1-cognitive-trace.md, apply
2. Read references/step2-asymmetry-injection.md, apply
3. Read references/step3-connector-prune.md, apply
4. Read references/step4-controlled-uncertainty.md, apply
5. Read references/step5-domain-voice.md, apply
6. Read references/verify-ai-smell.md, check
7. Read references/verify-fact-integrity.md, check
8. Read references/verify-redundancy.md, check

### Mode 2: Selective Steps
사용자가 특정 단계만 지정하면 해당 참조 문서만 읽어 적용한다.

### Mode 3: Lint Only
변환 없이 AI 냄새 검사만 실행한다.

## Integration Guide (다른 스킬에서 사용)
다른 스킬의 최종 응답 생성 시 이 스킬의 참조 문서를 읽어 적용한다.
```

**Step 2: Commit**

```bash
git add skills/human-writing/SKILL.md
git commit -m "feat: human-writing 스킬 SKILL.md 작성"
```

---

## Task 10: .gitkeep 제거 및 README 업데이트

**Files:**
- Delete: `skills/human-writing/references/.gitkeep` (Task 3-8에서 실제 파일이 생기므로)
- Modify: `README.md` - 스킬 카탈로그에 human-writing 추가

**Step 1: .gitkeep 제거**

```bash
git rm skills/human-writing/references/.gitkeep
```

**Step 2: README.md 카탈로그 업데이트**

`README.md`의 Skill Catalog 테이블에 추가:

```markdown
| [human-writing](skills/human-writing/) | AI 텍스트를 인간 전문가 필체로 변환하는 파이프라인 | Writing Style |
```

**Step 3: Commit**

```bash
git add README.md skills/human-writing/references/.gitkeep
git commit -m "docs: README 카탈로그에 human-writing 스킬 추가"
```

---

## Task 11: 최종 검증 및 푸시

**Step 1: 파일 구조 검증**

```bash
find skills/human-writing -type f | sort
```

Expected:
```
skills/human-writing/SKILL.md
skills/human-writing/references/pipeline-overview.md
skills/human-writing/references/step1-cognitive-trace.md
skills/human-writing/references/step2-asymmetry-injection.md
skills/human-writing/references/step3-connector-prune.md
skills/human-writing/references/step4-controlled-uncertainty.md
skills/human-writing/references/step5-domain-voice.md
skills/human-writing/references/verify-ai-smell.md
skills/human-writing/references/verify-fact-integrity.md
skills/human-writing/references/verify-redundancy.md
```

**Step 2: SKILL.md에서 모든 참조 파일 경로가 유효한지 확인**

```bash
grep "references/" skills/human-writing/SKILL.md
```

**Step 3: Git log 확인**

```bash
git log --oneline -10
```

**Step 4: 푸시**

```bash
git push origin main
```
