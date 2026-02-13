---
name: human-writing
description: >
  AI-generated text를 인간 전문가의 사고 흐름처럼 변환하는 파이프라인 스킬. 5단계 변환(cognitive trace,
  asymmetry injection, connector prune, controlled uncertainty, domain voice)과
  3단계 검증(AI smell lint, fact integrity check, redundancy prune)을 제공한다. Triggers:
  human writing, AI 톤 제거, 인간적 글쓰기, 사고 흔적, AI 냄새, 텍스트 변환, 글쓰기 스타일, 휴먼 라이팅, 인간처럼
license: Apache-2.0
compatibility: Designed for Claude Code
metadata:
  version: "1.1.0"
  category: "domain"
  status: "active"
  updated: "2026-02-14"
  tags: "writing, ai-detection, text-transformation, human-writing, korean"
  author: "HB"
  user-invocable: "true"
---

# Human Writing: AI-to-Human Text Transformation Pipeline

## Pipeline Overview

AI가 생성한 텍스트를 인간 전문가가 작성한 것처럼 변환하는 파이프라인이다. 5단계 변환과 3단계 검증으로 구성되며, **깊이 프리셋(depth preset)**으로 실행 속도를 조절한다. 전체 흐름도와 각 단계 요약은 `references/pipeline-overview.md`를 참조한다.

```
원본 → cognitive_trace → asymmetry_injection → connector_prune → controlled_uncertainty → domain_voice → [검증] → 최종
        (사고 흔적)      (균형 파괴)            (접속사 제거)      (과단정 제거)             (전문가 필체)
```

LLM은 여러 규칙을 한 번에 적용할 수 있으므로, 8단계를 반드시 순차 실행할 필요는 없다. 프리셋으로 패스 수를 선택한다.

| Preset | 패스 수 | 방식 | 용도 |
|--------|---------|------|------|
| **express** | 1 | 전체 참조 동시 로드 → 단일 패스 변환+검증 | 짧은 텍스트, 반복 작업 |
| **standard** (기본) | 2 | 패스1: 통합 변환 / 패스2: 원본 대조 검증 | 대부분의 사용 |
| **deep** | 5+1 | 각 step 개별 적용(5패스) → 통합 검증(1패스) | 긴 텍스트, 규제 문서 |

프리셋을 지정하지 않으면 **standard**가 적용된다.

## Assessment Workflow

### Mode 1: Full Pipeline

사용자가 텍스트를 제공하고 전체 변환을 요청하는 경우. 깊이 프리셋에 따라 실행 방식이 달라진다. 프리셋을 지정하지 않으면 **standard**를 사용한다.

#### Express Preset (1패스)

5개 변환 참조와 3개 검증 참조를 모두 로드한 뒤, 단일 패스로 변환과 검증을 동시에 수행한다.

1. 다음 8개 레퍼런스를 모두 읽는다:
   - `references/step1-cognitive-trace.md`
   - `references/step2-asymmetry-injection.md`
   - `references/step3-connector-prune.md`
   - `references/step4-controlled-uncertainty.md`
   - `references/step5-domain-voice.md`
   - `references/verify-ai-smell.md`
   - `references/verify-fact-integrity.md`
   - `references/verify-redundancy.md`
2. 5개 변환 규칙을 한꺼번에 적용하여 텍스트를 변환한다
3. 변환 과정에서 3개 검증 규칙도 함께 적용하여 문제를 인라인으로 수정한다

#### Standard Preset (2패스, 기본)

변환과 검증을 분리하여 사실 무결성을 높인다.

**패스 1 — 통합 변환**

1. 다음 5개 변환 레퍼런스를 읽는다:
   - `references/step1-cognitive-trace.md`
   - `references/step2-asymmetry-injection.md`
   - `references/step3-connector-prune.md`
   - `references/step4-controlled-uncertainty.md`
   - `references/step5-domain-voice.md`
2. 5개 변환 규칙을 한꺼번에 적용하여 텍스트를 변환한다

**패스 2 — 원본 대조 검증**

3. 다음 3개 검증 레퍼런스를 읽는다:
   - `references/verify-ai-smell.md`
   - `references/verify-fact-integrity.md`
   - `references/verify-redundancy.md`
4. 변환된 텍스트를 원본과 대조하며 3개 검증을 수행한다
5. 문제가 탐지되면 해당 부분을 수정한다

#### Deep Preset (5+1패스)

각 변환 단계를 개별 적용하여 미세 조정이 가능하다.

**패스 1-5 — 단계별 변환**

1. `references/step1-cognitive-trace.md`를 읽고 규칙을 적용한다
   - 교과서적 결론선행 서술을 전문가의 실시간 사고 흐름으로 재구성한다
2. `references/step2-asymmetry-injection.md`를 읽고 규칙을 적용한다
   - AI의 대칭적 나열 구조를 비대칭으로 변환한다
3. `references/step3-connector-prune.md`를 읽고 규칙을 적용한다
   - AI 특유의 과도한 연결어와 매끄러운 흐름을 제거한다
4. `references/step4-controlled-uncertainty.md`를 읽고 규칙을 적용한다
   - 절대적 단정을 보정된 확신으로 교체한다
5. `references/step5-domain-voice.md`를 읽고 규칙을 적용한다
   - 교과서/마케팅 톤을 실무 전문가 톤으로 전환한다

**패스 6 — 통합 검증**

6. 3개 검증 레퍼런스를 모두 읽고 검증을 수행한다:
   - `references/verify-ai-smell.md` — AI 패턴 잔존 여부 검사
   - `references/verify-fact-integrity.md` — 사실 무결성 확인
   - `references/verify-redundancy.md` — 중복 문장 제거
7. 문제가 탐지되면 해당 부분을 수정한다

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

프리셋에 따라 응답 형식이 달라진다.

#### Express

```
## 변환 결과

[변환된 텍스트]

> 검증 메모: [인라인 검증 요약 — 수정 항목이 있으면 간략히 기술]
```

#### Standard (기본)

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

#### Deep

```
## 변환 결과

[최종 변환된 텍스트]

## 단계별 변경 로그
- Pass 1 (cognitive_trace): [구체적 변경 내역]
- Pass 2 (asymmetry_injection): [구체적 변경 내역]
- Pass 3 (connector_prune): [구체적 변경 내역]
- Pass 4 (controlled_uncertainty): [구체적 변경 내역]
- Pass 5 (domain_voice): [구체적 변경 내역]

## 검증 결과

| 검증 항목 | 결과 | 비고 |
|-----------|------|------|
| AI Smell Lint | PASS/WARN/FAIL | [탐지된 패턴 수] |
| Fact Integrity | PASS/WARN/FAIL | [변형 발견 항목] |
| Redundancy Prune | PASS/WARN/FAIL | [제거된 중복 수] |
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
