# Advanced Claude Code Patterns

Skills 외에 Claude Code 품질을 높이는 고급 패턴 가이드.
Harness 연구([revfactory/claude-code-harness](https://github.com/revfactory/claude-code-harness))의 실험 결과와 패턴을 참고하여 정리했다.

> **핵심 발견**: "병목은 LLM의 능력이 아니라 구조다." 동일 프롬프트에 구조화된 사전 구성(`.claude/`)을 추가하면 산출물 품질이 평균 60% 향상된다.
> — Hwang, M. (2026). *Harness: Structured Pre-Configuration for Enhancing LLM Code Agent Output Quality*

---

## 목차

1. [`.claude/` 디렉토리 전체 구조](#1-claude-디렉토리-전체-구조)
2. [Agents 패턴](#2-agents-패턴)
3. [Commands 패턴](#3-commands-패턴)
4. [A/B 실험 방법론 — 스킬 효과 측정](#4-ab-실험-방법론--스킬-효과-측정)

---

## 1. `.claude/` 디렉토리 전체 구조

Claude Code는 `.claude/` 디렉토리에서 네 가지 유형의 구조화된 지침을 읽는다:

```
.claude/
├── CLAUDE.md           # 아키텍처 블루프린트 — 파일 구조, 패턴, 규칙
├── skills/             # 도메인 지식 — SKILL.md + references/
│   └── skill-name/
│       ├── SKILL.md
│       └── references/
├── agents/             # 역할 기반 에이전트 — 작업 분해 + 품질 계약
│   └── agent-name.md
└── commands/           # 워크플로우 오케스트레이션 — /슬래시 커맨드
    └── command-name.md
```

| 구성 요소 | 역할 | 언제 사용하나 |
|-----------|------|--------------|
| **CLAUDE.md** | 프로젝트 아키텍처, 컨벤션, 규칙 정의 | 모든 프로젝트에 기본 |
| **Skills** | 도메인 전문 지식, 알고리즘, 규정 | 반복되는 업무 패턴이 있을 때 |
| **Agents** | 서브에이전트 역할 분담 + 산출물 명세 | 복잡한 작업을 분할할 때 |
| **Commands** | 다단계 워크플로우를 `/명령어`로 실행 | 정형화된 프로세스가 있을 때 |

---

## 2. Agents 패턴

### 개념

`.claude/agents/` 디렉토리에 마크다운 파일로 **서브에이전트의 역할, 책임, 산출물, 품질 기준**을 정의한다. Claude Code가 Agent 도구로 서브에이전트를 생성할 때 이 정의를 참조하여 일관된 품질을 보장한다.

Skills가 "무엇을 알아야 하는가"라면, Agents는 "누가 무엇을 만들어야 하는가"에 해당한다.

### 디렉토리 구조

```
.claude/agents/
├── api-builder.md          # REST API 엔드포인트 구현 담당
├── test-validator.md       # 테스트 작성 및 검증 담당
└── core-builder.md         # 핵심 비즈니스 로직 구현 담당
```

### 에이전트 정의 파일 포맷

```markdown
# {에이전트 이름}

## 역할
한 줄로 이 에이전트가 무엇을 하는지 정의.

## 책임
- 구체적인 구현 항목 1
- 구체적인 구현 항목 2
- 구체적인 구현 항목 3

## 도구
- Write — 소스 코드 생성
- Read — 참조 코드 읽기
- Bash — 테스트 실행

## 산출물
- `src/module-a.js`
- `src/module-b.js`
- `tests/module-a.test.js`

## 품질 기준
- 모든 테스트 통과
- 에러 핸들링 포함
- JSDoc 주석 작성
```

### 실전 예시: Raft 합의 알고리즘 구현

Harness 실험에서 Raft KV 스토어를 구현할 때 3개 에이전트로 분할한 사례:

| 에이전트 | 역할 | 산출물 |
|----------|------|--------|
| `raft-core-builder` | Raft 상태 머신, 로그, 메시지 | `raft-node.js`, `raft-log.js` |
| `network-simulator-builder` | 네트워크 전송, 파티션 시뮬레이션 | `transport.js`, `cluster.js` |
| `kv-store-builder` | KV 상태 머신, CLI 진입점 | `state-machine.js`, `index.js` |

이 분할 덕분에 Baseline(단일 에이전트) 대비 **구조화 점수 +5.0, 테스트 커버리지 +6.0** 향상.

### 우리 레포에서의 활용

이 레포의 스킬은 업무 도메인용이라 코드 생성 에이전트가 핵심은 아니다. 하지만 프로젝트별 `.claude/agents/`에 다음과 같은 역할 에이전트를 정의하면 유용하다:

```markdown
# 예: 프로젝트 리뷰어 에이전트
# .claude/agents/reviewer.md

## 역할
PR 코드 리뷰 시 보안, 성능, 가독성 관점에서 피드백 제공.

## 책임
- OWASP Top 10 취약점 스캔
- N+1 쿼리 등 성능 이슈 탐지
- 네이밍 컨벤션 준수 확인

## 품질 기준
- False positive 최소화 (확실한 이슈만 지적)
- 수정 제안 코드 포함
```

---

## 3. Commands 패턴

### 개념

`.claude/commands/` 디렉토리에 마크다운 파일을 두면 Claude Code에서 `/파일명`으로 슬래시 커맨드를 실행할 수 있다. 여러 단계의 워크플로우를 하나의 명령어로 묶어 **반복 가능한 프로세스**를 만든다.

Skills가 "지식"이고 Agents가 "역할"이라면, Commands는 "절차"에 해당한다.

### 디렉토리 구조

```
.claude/commands/
├── review.md           # /review → 코드 리뷰 워크플로우
├── deploy-check.md     # /deploy-check → 배포 전 체크리스트
└── onboarding.md       # /onboarding → 신규 팀원 환경 설정
```

### 커맨드 정의 파일 포맷

```markdown
# {커맨드 이름} — 한 줄 설명

{커맨드가 하는 일에 대한 간략한 설명}

## Arguments
$ARGUMENTS — 인자 설명 (예: PR 번호, 파일 경로)

## Instructions

### 1. 첫 번째 단계
구체적인 지시사항.

### 2. 두 번째 단계
다음 단계 지시사항. 필요 시 에이전트를 생성하여 병렬 실행.

### 3. 결과 출력
사용자에게 결과를 어떤 형식으로 보여줄지 정의.
```

핵심 규칙:
- `$ARGUMENTS`는 슬래시 커맨드 뒤에 오는 사용자 입력을 받는 변수
- Instructions의 각 단계는 순서대로 실행
- 단계 안에서 Agent 도구, Skills 참조, Bash 실행 등을 지시할 수 있음

### 실전 예시

#### 간단한 커맨드: 코드 리뷰

```markdown
# Review — 변경된 파일 코드 리뷰

## Arguments
$ARGUMENTS — 리뷰 범위 (예: "staged", "last-commit", 파일 경로)

## Instructions

### 1. 변경 사항 수집
- $ARGUMENTS가 "staged"이면 `git diff --cached`
- "last-commit"이면 `git diff HEAD~1`
- 파일 경로면 해당 파일의 전체 diff

### 2. 리뷰 수행
아래 관점에서 분석:
- 보안 취약점 (injection, XSS 등)
- 성능 이슈 (N+1, 불필요한 루프)
- 가독성 (네이밍, 복잡도)
- 테스트 누락 여부

### 3. 결과 출력
| 파일 | 라인 | 심각도 | 이슈 | 수정 제안 |
형식의 테이블로 출력. 이슈가 없으면 "No issues found." 출력.
```

사용법: `/review staged` 또는 `/review src/api/auth.js`

#### 복합 커맨드: 에이전트 오케스트레이션

```markdown
# Deploy-Check — 배포 전 종합 점검

## Arguments
$ARGUMENTS — 배포 환경 (staging | production)

## Instructions

### 1. 병렬 점검 에이전트 실행
아래 3개 에이전트를 동시에 실행하세요:

**LintAgent**: `npm run lint` 실행 후 에러 수집
**TestAgent**: `npm test` 실행 후 실패 케이스 수집
**SecurityAgent**: `npm audit` 실행 후 취약점 수집

### 2. 결과 종합
3개 에이전트 결과를 종합하여 GO/NO-GO 판정:
- 모두 통과 → GO
- lint 경고만 → GO (경고 목록 첨부)
- 테스트 실패 또는 보안 취약점 → NO-GO (상세 사유)

### 3. 보고
GO/NO-GO 뱃지 + 상세 결과 테이블을 출력하세요.
```

### Skills vs Agents vs Commands 비교

| | Skills | Agents | Commands |
|---|--------|--------|----------|
| **본질** | 지식 (Knowledge) | 역할 (Role) | 절차 (Procedure) |
| **호출** | AI가 자동 매칭 | Agent 도구로 생성 | `/명령어`로 직접 호출 |
| **파일 위치** | `.claude/skills/` 또는 `~/.claude/skills/` | `.claude/agents/` | `.claude/commands/` |
| **트리거** | description 키워드 매칭 | 명시적 지시 | 사용자가 `/` 입력 |
| **적합한 상황** | 도메인 규정, 가이드라인 | 복잡한 작업 분할 | 반복 프로세스 자동화 |
| **예시** | NDA 검토 기준 | 코드 리뷰어 | 배포 전 체크리스트 |

---

## 4. A/B 실험 방법론 — 스킬 효과 측정

### 왜 필요한가

"이 스킬이 정말 효과가 있나?"에 대한 객관적 근거를 만들기 위한 방법론이다. Harness 연구에서 사용한 A/B 실험 설계를 우리 도메인 스킬에 맞게 적용한다.

### Harness 연구 결과 요약

15개 소프트웨어 엔지니어링 작업에서 `.claude/` 사전 구성(Skills + Agents + Commands)을 적용한 결과:

| 지표 | Baseline (구성 없음) | Harness (구성 있음) | 차이 |
|------|---------------------|--------------------|----|
| 평균 점수 (100점 만점) | 49.5 | 79.3 | **+60%** |
| 승률 | — | — | **15/15 (100%)** |
| 표준편차 | 5.3 | 3.6 | **-32%** (더 안정적) |

난이도별 효과:
- Basic: +23.8점
- Advanced: +29.6점
- Expert: **+36.2점** (복잡할수록 효과가 큼)

### 우리 스킬에 적용하는 실험 설계

#### Step 1: 실험 케이스 정의

실험 대상 스킬과 테스트 시나리오를 YAML로 정의한다:

```yaml
id: skill-test-001
skill: nda-triage
category: legal-compliance
description: |
  아래 NDA 문서를 검토하고 주요 리스크를 식별하세요.
  GREEN/YELLOW/RED 중 하나로 분류하고 근거를 제시하세요.
input: "references/test-nda-sample.pdf"
expected_classification: YELLOW
evaluation_criteria:
  accuracy: "올바른 분류 (GREEN/YELLOW/RED)"
  completeness: "10개 평가 기준 모두 언급"
  actionability: "구체적 후속 조치 제안"
  reasoning: "분류 근거의 논리성"
```

#### Step 2: A/B 조건 설정

| 조건 | 설명 |
|------|------|
| **A (Baseline)** | 스킬 없이 동일 프롬프트만으로 작업 |
| **B (With Skill)** | 해당 스킬이 로드된 상태에서 동일 프롬프트로 작업 |

동일 입력, 동일 프롬프트, 유일한 차이는 스킬 로드 여부.

#### Step 3: 평가 루브릭 (각 0-10점)

도메인 스킬용 평가 차원 (Harness의 코드 품질 루브릭을 업무 도메인으로 변환):

| 차원 | 설명 | 0점 기준 | 10점 기준 |
|------|------|---------|----------|
| **정확성** | 결론이 올바른가 | 분류 오류 | 완벽한 분류 + 근거 |
| **완전성** | 모든 관점을 다뤘는가 | 주요 항목 누락 | 체크리스트 전항목 커버 |
| **구조화** | 체계적으로 정리되었는가 | 비구조적 서술 | 표/체크리스트/단계별 |
| **실행가능성** | 바로 행동할 수 있는가 | 추상적 조언 | 구체적 next step |
| **일관성** | 같은 입력에 같은 결과가 나오는가 | 실행마다 다른 결론 | 3회 실행 동일 결과 |

#### Step 4: 실험 실행

```bash
# 1. Baseline 실행 (스킬 없이)
# Claude Code에서 스킬을 비활성화하고 프롬프트만 전달

# 2. With-Skill 실행 (스킬 로드 후)
# 동일 프롬프트를 스킬이 로드된 상태에서 실행

# 3. 각 조건에서 3회 반복하여 일관성 확인
```

#### Step 5: 결과 기록

```json
{
  "case_id": "skill-test-001",
  "skill": "nda-triage",
  "runs": 3,
  "baseline": {
    "accuracy": [6, 5, 7],
    "completeness": [4, 3, 5],
    "structure": [3, 4, 3],
    "actionability": [5, 4, 5],
    "consistency": 4,
    "avg_total": 21.7
  },
  "with_skill": {
    "accuracy": [9, 9, 9],
    "completeness": [8, 9, 8],
    "structure": [9, 9, 9],
    "actionability": [8, 8, 9],
    "consistency": 9,
    "avg_total": 42.3
  },
  "delta": "+95%",
  "winner": "with_skill"
}
```

### 실험 대상 스킬 후보

| 스킬 | 실험 시나리오 | 기대 효과 |
|------|-------------|----------|
| `nda-triage` | 동일 NDA 문서 3건 분류 비교 | 정확성, 완전성에서 큰 차이 예상 |
| `clarify-vague` | 동일한 모호한 요구사항 구체화 비교 | 구조화, 실행가능성에서 차이 예상 |
| `human-writing` | 동일 AI 텍스트를 인간 필체로 변환 비교 | AI 감지율 차이 측정 가능 |
| `k-sunshine` | 동일 마케팅 문구 컴플라이언스 검토 비교 | 정확성 (규정 기반 판단) 차이 예상 |

### 결과 활용

1. **사내 발표**: "스킬 적용 시 업무 품질 N% 향상" 데이터로 도입 근거 제시
2. **스킬 우선순위**: 효과가 큰 스킬부터 전사 배포
3. **품질 기준선**: 스킬별 기대 품질 수준 설정
4. **지속 개선**: 실험 결과를 바탕으로 스킬 내용 보강

---

## 참고 자료

- [claude-code-harness](https://github.com/revfactory/claude-code-harness) — A/B 실험 원본 레포
- Hwang, M. (2026). *Harness: Structured Pre-Configuration for Enhancing LLM Code Agent Output Quality* — [영문 PDF](https://github.com/revfactory/claude-code-harness/blob/main/paper/harness-paper.pdf) / [한글 PDF](https://github.com/revfactory/claude-code-harness/blob/main/paper/harness-paper-ko.pdf)
- [Anthropic Agent Skills Spec](https://agentskills.io/specification) — 공식 스킬 스펙
