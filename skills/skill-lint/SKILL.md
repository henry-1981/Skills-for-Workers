---
name: skill-lint
origin: "Original work"
description: >
  Validate skill directories against Anthropic Agent Skills spec and project conventions.
  Checks frontmatter, body structure, references/ integrity.
  Triggers: lint skill, validate skill, skill review, check skill,
  스킬 검증, 스킬 린트, 스킬 검사, 스킬 리뷰, 스킬 점검
---

# Skill Lint: Prompt-Based Skill Validator

## Overview

AI 에이전트가 스킬 디렉토리를 읽고, Anthropic Agent Skills Spec + 프로젝트 컨벤션에 대해 자동 검증하는 프롬프트 기반 린터이다. 스크립트나 외부 의존성 없이 이 SKILL.md만으로 동작한다.

두 가지 모드를 제공한다:
- **Single Skill Lint** — 지정된 스킬 하나를 검증
- **Batch Lint** — `skills/` 하위 전체를 순회하며 통합 보고서 생성

## Workflow

### Mode 1: Single Skill Lint

하나의 스킬 디렉토리를 대상으로 12개 규칙을 검증한다.

1. 대상 스킬 경로를 확인한다 (예: `skills/nda-triage/`)
2. `SKILL.md`를 읽고 YAML frontmatter를 파싱한다
3. 디렉토리명(basename)을 추출한다
4. `references/` 디렉토리의 파일 목록을 확인한다
5. 아래 **Lint Rules**의 12개 규칙을 순서대로 적용한다
6. **Decision Framework**에 따라 최종 판정(PASS/FAIL)을 결정한다
7. **Response Format**의 Single Skill Report 형식으로 결과를 출력한다

### Mode 2: Batch Lint

`skills/` 하위 모든 스킬을 순회하며 통합 보고서를 생성한다.

1. `skills/` 디렉토리 하위의 모든 서브디렉토리를 나열한다
2. 각 서브디렉토리에 `SKILL.md`가 있는지 확인한다 (없으면 건너뜀)
3. 각 스킬에 대해 Mode 1을 실행한다
4. **Response Format**의 Batch Report 형식으로 통합 결과를 출력한다

## Lint Rules

### FAIL Rules (blocking — 하나라도 실패 시 전체 FAIL)

| ID | Rule | Check |
|----|------|-------|
| F1 | `name` 존재 + 디렉토리명 일치 | frontmatter `name` 값 == 디렉토리 basename |
| F2 | `name` 포맷 준수 | 소문자(a-z), 숫자(0-9), 하이픈(-)만 허용. 연속 하이픈 금지, 시작/끝 하이픈 금지, 64자 이하 |
| F3 | `description` 존재 + 비어있지 않음 | 공백만 있는 경우도 실패 |
| F4 | `description` ≤ 1024자 | YAML multiline 접기(folded/literal) 해제 후 순수 텍스트 길이 측정 |
| F5 | `origin` 존재 | 프로젝트 컨벤션 (Anthropic spec 외 커스텀 필드) |

### WARN Rules (advisory — FAIL 판정에 영향 없음)

| ID | Rule | Check |
|----|------|-------|
| W1 | description에 한국어 키워드 포함 | 한글 문자(U+AC00–U+D7AF) 1개 이상 존재 |
| W2 | description에 영어 키워드 포함 | ASCII 영문자로 구성된 실질적 단어(2자 이상) 1개 이상 존재 |
| W3 | SKILL.md ≤ 500줄 | 총 라인 수. Progressive Disclosure 원칙 준수 |
| W4 | SKILL.md ≥ 50줄 | 총 라인 수. 최소한의 실질 내용 보장 |
| W5 | References 섹션의 파일이 실제 존재 | `## References` 섹션에서 `references/` 경로를 추출하고 파일 존재 여부 확인. References 섹션이 없으면 SKIP |

### INFO Rules (참고용 — 보고만, 판정에 무관)

| ID | Rule | Check |
|----|------|-------|
| I1 | 권장 섹션 포함 여부 | Overview, Workflow, Response Format, Key Principles, References 중 누락 보고. 유사 헤딩 인정 (예: "Pipeline Overview" → Overview, "Assessment Workflow" → Workflow, "Invariants" → Key Principles) |
| I2 | references/에 미참조 파일 존재 여부 | `references/` 파일 목록 vs SKILL.md 본문에서 참조된 파일. 차이가 있으면 보고. references/ 디렉토리가 비어있거나 없으면 SKIP |

각 규칙의 상세 예시, 엣지 케이스, 수정 방법은 `references/rules-detail.md`를 참조한다.

## Decision Framework

### 최종 판정 로직

```
IF any FAIL rule (F1–F5) fails → Verdict: FAIL
ELSE → Verdict: PASS
```

WARN과 INFO는 판정에 영향을 주지 않는다. 보고서에 표시만 한다.

### 심각도 우선순위

1. **FAIL** — 반드시 수정해야 배포 가능. Anthropic spec 또는 프로젝트 필수 컨벤션 위반
2. **WARN** — 수정 권장. 프로젝트 권장 컨벤션 미충족
3. **INFO** — 참고 정보. 개선 기회를 알려주지만 무시해도 무방

### 유사 헤딩 판정 기준 (I1)

정확한 헤딩 이름이 아니더라도 의미가 동일하면 인정한다:
- **Overview**: "Overview", "Introduction", "Pipeline Overview", "소개" 등
- **Workflow**: "Workflow", "Assessment Workflow", "Process", "워크플로우" 등
- **Response Format**: "Response Format", "Output Format", "보고서 형식" 등
- **Key Principles**: "Key Principles", "Invariants", "Core Rules", "핵심 원칙", "불변 규칙" 등
- **References**: "References", "참조", "레퍼런스" 등

## Response Format

### Single Skill Report

```
## Skill Lint Report: {skill-name}

**Verdict: PASS** (or **FAIL**)

### FAIL
| ID | Rule | Result | Detail |
|----|------|--------|--------|
| F1 | name + directory match | PASS | name="nda-triage", dir="nda-triage" |
| ... | ... | ... | ... |

### WARN
| ID | Rule | Result | Detail |
|----|------|--------|--------|
| W1 | Korean keywords | PASS | "비밀유지계약, NDA 검토" found |
| ... | ... | ... | ... |

### INFO
| ID | Rule | Detail |
|----|------|--------|
| I1 | Recommended sections | Missing: Overview, Key Principles |
| I2 | Unreferenced files | None |
```

### Batch Report

```
## Batch Skill Lint Report

| Skill | Verdict | FAIL | WARN | INFO |
|-------|---------|------|------|------|
| agent-council | PASS | 0 | 0 | 2 |
| human-writing | PASS | 0 | 0 | 1 |
| ... | ... | ... | ... | ... |

**Summary**: N/N PASS, 0 FAIL

### Detail per Skill
(각 스킬별 FAIL/WARN 항목만 표시. 모든 항목이 PASS인 스킬은 "All clear" 한 줄로 표시.)
```

## Key Principles

1. **Non-destructive** — 린트는 읽기 전용. 대상 파일을 절대 수정하지 않는다
2. **Deterministic** — 같은 입력에 항상 같은 결과. 주관적 판단 없음
3. **Self-validating** — skill-lint 자체가 모든 규칙을 통과해야 한다
4. **Spec-first** — Anthropic Agent Skills Spec이 1순위, 프로젝트 컨벤션은 2순위
5. **Progressive severity** — FAIL은 최소화하고 대부분은 WARN/INFO로 분류하여 채택 허들을 낮춘다

## References

- `references/rules-detail.md` — 12개 규칙별 상세: 판정 예시, 엣지 케이스, 수정 방법
