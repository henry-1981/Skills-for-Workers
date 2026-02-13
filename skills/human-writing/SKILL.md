---
name: human-writing
description: >
  AI-generated text를 인간 전문가의 사고 흐름처럼 변환하는 파이프라인 스킬.
  5단계 변환(cognitive trace, asymmetry injection, connector prune,
  controlled uncertainty, domain voice)과 3단계 검증(AI smell lint,
  fact integrity check, redundancy prune)을 제공한다.
  Triggers: human writing, AI 톤 제거, 인간적 글쓰기, 사고 흔적,
  AI 냄새, 텍스트 변환, 글쓰기 스타일, 휴먼 라이팅, 인간처럼
---

# Human Writing: AI-to-Human Text Transformation Pipeline

## Pipeline Overview

AI가 생성한 텍스트를 인간 전문가가 작성한 것처럼 변환하는 8단계 파이프라인이다. 5단계 변환과 3단계 검증으로 구성된다. 전체 흐름도와 각 단계 요약은 `references/pipeline-overview.md`를 참조한다.

```
원본 → cognitive_trace → asymmetry_injection → connector_prune → controlled_uncertainty → domain_voice → [검증] → 최종
        (사고 흔적)      (균형 파괴)            (접속사 제거)      (과단정 제거)             (전문가 필체)
```

## Assessment Workflow

### Mode 1: Full Pipeline

사용자가 텍스트를 제공하고 전체 변환을 요청하는 경우. 5단계 변환을 순차 적용한 뒤 3단계 검증을 수행한다.

**변환 단계**

1. `references/step1-cognitive-trace.md`를 읽고 규칙을 적용한다
   - 교과서적 결론선행 서술을 전문가의 실시간 사고 흐름으로 재구성한다
   - 가정 → 긴장 → 수정 → 잠정결론 패턴을 도입한다
2. `references/step2-asymmetry-injection.md`를 읽고 규칙을 적용한다
   - AI의 대칭적 나열 구조를 비대칭으로 변환한다
   - 확장, 압축, 미해결 기법을 사용한다
3. `references/step3-connector-prune.md`를 읽고 규칙을 적용한다
   - AI 특유의 과도한 연결어와 매끄러운 흐름을 제거한다
   - 직접 진술로 전환한다
4. `references/step4-controlled-uncertainty.md`를 읽고 규칙을 적용한다
   - 절대적 단정을 보정된 확신으로 교체한다
   - 노련한 전문가의 어조를 만든다
5. `references/step5-domain-voice.md`를 읽고 규칙을 적용한다
   - 교과서/마케팅 톤을 실무 전문가가 동료에게 쓰는 톤으로 전환한다

**검증 단계**

6. `references/verify-ai-smell.md`를 읽고 AI 패턴 잔존 여부를 검사한다
   - 탐지된 패턴이 있으면 해당 변환 단계로 돌아가 수정한다
7. `references/verify-fact-integrity.md`를 읽고 사실 무결성을 확인한다
   - 숫자, 날짜, 고유명사, 조항 번호가 원본과 동일한지 대조한다
8. `references/verify-redundancy.md`를 읽고 중복 문장을 제거한다
   - 변환 과정에서 발생한 의미 중복을 탐지하고 정리한다

### Mode 2: Selective Steps

사용자가 특정 단계만 지정하여 적용하는 경우. 요청된 단계의 레퍼런스만 읽고 적용한다.

1. 사용자가 지정한 단계 번호를 확인한다 (예: "step 1, 3만 적용해줘")
2. 해당 단계의 레퍼런스 파일만 순서대로 읽는다
3. 지정된 단계의 규칙만 순차 적용한다
4. 검증 단계는 기본적으로 3개 모두 실행한다. 사용자가 검증도 선택한 경우 해당 검증만 수행한다

### Mode 3: Lint Only

사용자가 기존 텍스트를 변환 없이 검사만 요청하는 경우. 3개 검증 레퍼런스만 읽고 결과를 보고한다.

1. `references/verify-ai-smell.md`를 읽고 AI 패턴 검사를 실행한다
2. `references/verify-fact-integrity.md`를 읽고 사실 무결성 검사를 실행한다 (원본이 함께 제공된 경우)
3. `references/verify-redundancy.md`를 읽고 중복 검사를 실행한다
4. 각 검사 항목별 PASS/WARN/FAIL 결과를 보고한다

## Invariants (불변 규칙)

모든 단계에서 반드시 지켜야 하는 규칙이다. 어떤 변환 단계에서도 이 규칙을 위반해서는 안 된다.

1. **사실 추가 금지** - 새로운 사실을 추가하지 않는다
2. **수치/명칭 보존** - 숫자, 날짜, 고유명사, 조항 번호를 변경하지 않는다
3. **강제성 보존** - 법적/기술적 의무 표현(shall/must)의 강제성을 약화시키지 않는다
4. **의미 보존** - 원문의 의미와 사실적 주장을 보존한다

## Response Format

### Full Pipeline 응답

```
## 변환 결과

[최종 변환된 텍스트]

## 검증 결과

| 검증 항목 | 결과 | 비고 |
|-----------|------|------|
| AI Smell Lint | PASS/WARN/FAIL | [탐지된 패턴 수] |
| Fact Integrity | PASS/WARN/FAIL | [변형 발견 항목] |
| Redundancy Prune | PASS/WARN/FAIL | [제거된 중복 수] |

## 적용된 변환 요약
- Step 1 (cognitive_trace): [주요 변경 사항]
- Step 2 (asymmetry_injection): [주요 변경 사항]
- Step 3 (connector_prune): [주요 변경 사항]
- Step 4 (controlled_uncertainty): [주요 변경 사항]
- Step 5 (domain_voice): [주요 변경 사항]
```

### Selective Steps 응답

```
## 변환 결과

[변환된 텍스트]

## 적용 단계
- [적용된 단계 목록과 각 단계의 주요 변경 사항]

## 검증 결과

| 검증 항목 | 결과 | 비고 |
|-----------|------|------|
| AI Smell Lint | PASS/WARN/FAIL | [탐지된 패턴 수] |
| Fact Integrity | PASS/WARN/FAIL | [변형 발견 항목] |
| Redundancy Prune | PASS/WARN/FAIL | [제거된 중복 수] |
```

### Lint Only 응답

```
## AI 텍스트 검사 결과

### AI Smell Lint
- 결과: PASS/WARN/FAIL
- 탐지된 패턴: [패턴 목록과 출현 위치]

### Fact Integrity Check
- 결과: PASS/WARN/FAIL
- 변형 발견: [변형 항목 목록, 원본 대조 불가 시 SKIP]

### Redundancy Prune
- 결과: PASS/WARN/FAIL
- 중복 문장: [중복 쌍 목록]

### 종합 점수
- PASS: [n]개 / WARN: [n]개 / FAIL: [n]개
```

## Integration Guide

다른 스킬에서 이 파이프라인을 활용하는 방법이다.

### 전체 통합

전체 파이프라인을 참조하여 텍스트 변환을 수행한다. 이 SKILL.md의 Mode 1 워크플로우를 그대로 따른다.

### 부분 통합

특정 단계만 선택적으로 참조한다. 예를 들어 접속사 제거와 과단정 제거만 필요한 경우:
- `references/step3-connector-prune.md`만 읽고 적용
- `references/step4-controlled-uncertainty.md`만 읽고 적용
- 검증은 `references/verify-ai-smell.md`로 결과 확인

### 도메인 커스터마이징

Step 5 (domain_voice)를 도메인에 맞게 확장한다:
- `references/step5-domain-voice.md`의 기본 규칙을 적용하되, 도메인 특화 어휘와 톤 규칙을 추가로 정의한다
- 의료, 법률, 기술 등 도메인별로 전문가 필체의 특성이 다르므로 도메인별 보충 레퍼런스를 작성하여 Step 5에 병합 적용할 수 있다

## References

- `references/pipeline-overview.md` - 파이프라인 전체 흐름도, 각 단계 요약, 불변 규칙 정의
- `references/step1-cognitive-trace.md` - Step 1: 사고 흔적 구조. 결론선행 서술을 가정-긴장-수정-잠정결론 패턴으로 재구성하는 규칙
- `references/step2-asymmetry-injection.md` - Step 2: 균형 파괴. AI의 대칭 나열 구조를 확장/압축/미해결 기법으로 비대칭화하는 규칙
- `references/step3-connector-prune.md` - Step 3: 접속사 제거. 과도한 연결어와 교과서적 흐름을 직접 진술로 전환하는 규칙
- `references/step4-controlled-uncertainty.md` - Step 4: 과단정 제거. 절대 표현을 보정된 확신으로 교체하여 전문가 어조를 만드는 규칙
- `references/step5-domain-voice.md` - Step 5: 도메인 전문가 필체. 교과서/마케팅 톤을 실무 전문가 톤으로 전환하는 규칙
- `references/verify-ai-smell.md` - Verify 1: AI 냄새 검사. 변환 후 잔존하는 AI 특유 패턴을 탐지하는 체크리스트
- `references/verify-fact-integrity.md` - Verify 2: 사실 무결성 검사. 변환 과정에서 사실적 내용의 변형 여부를 검증하는 규칙
- `references/verify-redundancy.md` - Verify 3: 중복 문장 제거. 변환 과정에서 발생한 의미 중복을 탐지하고 제거하는 규칙
