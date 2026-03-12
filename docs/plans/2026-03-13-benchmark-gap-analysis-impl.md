# Benchmark & Gap Analysis: pptx-design-styles Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** pptx-design-styles의 30개 정밀 디자인 명세를 Before/After 벤치마킹으로 효과 측정 후, Visual Archetype Pool 확장과 독립 Design Spec 레이어를 추가한다.

**Architecture:** Phase 1(벤치마킹) → Phase 2(갭 분석) → Phase 3(통합). html-designer.md에 스타일 명세를 임시 주입해 품질 점수 델타를 측정하고, 효과가 확인된 스타일을 `references/design-specs.md` 독립 레이어로 분리한다.

**Tech Stack:** Markdown, WebFetch(styles.md 수집), 기존 e2e 인프라(LLM-as-Judge + structural-scorer)

---

## Phase 1: 벤치마킹

### Task 1: pptx-design-styles 명세 수집

**Files:**
- Create: `docs/experiments/benchmark-styles/reference-styles.md`
- Create: `docs/experiments/benchmark-styles/README.md`

**Step 1: styles.md 원본 가져오기**

WebFetch로 아래 URL에서 raw 내용을 가져온다:
```
https://raw.githubusercontent.com/corazzon/pptx-design-styles/main/references/styles.md
```

**Step 2: 파일 저장**

가져온 내용을 그대로 `docs/experiments/benchmark-styles/reference-styles.md`에 저장한다.

**Step 3: README 작성**

```markdown
# Benchmark: pptx-design-styles vs Our Pipeline

- **출처**: https://github.com/corazzon/pptx-design-styles
- **수집일**: 2026-03-13
- **목적**: Before/After 품질 델타 측정

## 파일 구조
- `reference-styles.md` — 원본 30개 스타일 명세 (수정 금지)
- `html-designer-with-styles.md` — After 버전 프롬프트
- `results/` — Before/After 실행 결과 및 점수
- `gap-analysis.md` — 갭 분석 결과
```

**Step 4: 커밋**

```bash
git add -f docs/experiments/
git commit -m "chore: pptx-design-styles 원본 명세 수집 (벤치마킹 Phase 1)"
```

---

### Task 2: After 버전 프롬프트 생성

**Files:**
- Read: `skills/presentation/src/html-pipeline/prompts/html-designer.md`
- Create: `docs/experiments/benchmark-styles/html-designer-with-styles.md`

**Step 1: 현재 html-designer.md 확인**

`skills/presentation/src/html-pipeline/prompts/html-designer.md` 전체를 읽는다.

**Step 2: After 버전 생성**

`html-designer-with-styles.md` = html-designer.md 전체 내용 + 아래 블록을 파일 끝에 append:

```markdown

---

## Design Style Reference (Benchmark Injection)

> 이 섹션은 벤치마킹용 임시 주입입니다. 아키타입 선택 후, 해당 스타일의 명세를 아래에서 참조하여
> 색상(HEX), 폰트 페어링, 레이아웃 규칙, 시그니처 요소를 구체적으로 적용하십시오.
> 철학적 방향이 아닌 **정밀 명세(exact values)**를 우선합니다.

[reference-styles.md 전체 내용 삽입]
```

**Step 3: 커밋**

```bash
git add -f docs/experiments/benchmark-styles/html-designer-with-styles.md
git commit -m "chore: After 버전 프롬프트 생성 (styles.md 주입)"
```

---

### Task 3: Before 기준선 실행 (Topics 2, 3)

**Files:**
- Create: `docs/experiments/benchmark-styles/results/before-topic2/`
- Create: `docs/experiments/benchmark-styles/results/before-topic3/`

> Topic 1 기준선(89/100)은 2026-03-12 e2e 실행에서 이미 확보됨.
> Topic 2, 3은 현재 파이프라인(수정 없음)으로 실행한다.

**Step 1: Topic 2 실행 — 현재 파이프라인 그대로**

Claude Code에서 presentation SKILL.md를 호출:
- **소스**: "2분기 매출 실적 보고: 전년 동기 대비 12% 성장, 주요 채널별 실적, 다음 분기 목표"
- **아키타입**: swiss-minimal
- **슬라이드 수**: 6장
- **출력 디렉토리**: `docs/experiments/benchmark-styles/results/before-topic2/slides/`

**Step 2: Topic 2 구조 점수 측정**

```bash
cd _dev/test-presentation
npx tsx scripts/structural-scorer.ts ../../docs/experiments/benchmark-styles/results/before-topic2/output.pptx
```

**Step 3: Topic 2 품질 점수 기록**

LLM-as-Judge로 품질 채점 (rubric.md 기준). 점수를 `results/before-topic2/score.md`에 기록:
```markdown
# Before — Topic 2 (분기 매출)
- 구조 점수: XX/100
- 품질 점수: XX/100
- 아키타입: swiss-minimal
```

**Step 4: Topic 3 동일하게 반복**

- **소스**: "VOKE 브랜드 런칭 전략: 타겟 MZ세대, 채널 전략, 론칭 타임라인"
- **아키타입**: brutalist-typo
- **슬라이드 수**: 7장
- **출력**: `results/before-topic3/`

**Step 5: 커밋**

```bash
git add -f docs/experiments/benchmark-styles/results/
git commit -m "chore: Before 기준선 실행 완료 (Topic 2, 3)"
```

---

### Task 4: After 버전으로 교체 후 3-Run 실행

**Files:**
- Modify (temp): `skills/presentation/src/html-pipeline/prompts/html-designer.md`
- Create: `docs/experiments/benchmark-styles/results/after-topic1/`
- Create: `docs/experiments/benchmark-styles/results/after-topic2/`
- Create: `docs/experiments/benchmark-styles/results/after-topic3/`

**Step 1: 원본 백업 + After 버전으로 교체**

```bash
# 원본 백업
cp skills/presentation/src/html-pipeline/prompts/html-designer.md \
   skills/presentation/src/html-pipeline/prompts/html-designer.md.bak

# After 버전 교체
cp docs/experiments/benchmark-styles/html-designer-with-styles.md \
   skills/presentation/src/html-pipeline/prompts/html-designer.md
```

**Step 2: Topic 1 After 실행**

- **소스**: "경영진 대상 AI 코딩 어시스턴트 도입 제안" (Topic 1 동일)
- **아키타입**: dark-tech
- **슬라이드 수**: 8장
- **출력**: `results/after-topic1/`

**Step 3: Topic 2, 3 After 실행**

동일하게 Topic 2(swiss-minimal), Topic 3(brutalist-typo) After 실행.

**Step 4: 원본 복원**

```bash
mv skills/presentation/src/html-pipeline/prompts/html-designer.md.bak \
   skills/presentation/src/html-pipeline/prompts/html-designer.md
```

**Step 5: 전체 점수 채점 + 커밋**

각 After 실행에 대해 구조 점수 + LLM-as-Judge 품질 점수 기록.

```bash
git add -f docs/experiments/benchmark-styles/results/
git commit -m "chore: After 버전 3-Run 실행 + 원본 복원"
```

---

### Task 5: 점수 델타 문서화

**Files:**
- Create: `docs/experiments/benchmark-styles/results/score-delta.md`

**Step 1: 점수 델타 테이블 작성**

```markdown
# 벤치마킹 점수 델타

| Topic | Archetype | Before 품질 | After 품질 | 델타 |
|-------|-----------|-----------|----------|------|
| AI 코딩 도입 (T1) | dark-tech | 89 | XX | +XX |
| 분기 매출 (T2) | swiss-minimal | XX | XX | +XX |
| 브랜드 런칭 (T3) | brutalist-typo | XX | XX | +XX |

## 정성 관찰
- After 버전에서 눈에 띄게 달라진 점:
- Before에서 After로 개선된 아키타입:
- 효과가 작았던 아키타입:

## 결론
- 스타일 명세 주입 효과: [유의미/미미]
- Phase 3 통합 범위 조정:
```

**Step 2: 커밋**

```bash
git add -f docs/experiments/benchmark-styles/results/score-delta.md
git commit -m "docs: 벤치마킹 점수 델타 + 정성 관찰 기록"
```

---

## Phase 2: 갭 분석

### Task 6: 30개 스타일 → 5 아키타입 매핑

**Files:**
- Read: `docs/experiments/benchmark-styles/reference-styles.md`
- Create: `docs/experiments/benchmark-styles/gap-analysis.md`

**Step 1: 매핑 테이블 작성**

reference-styles.md의 30개 스타일을 우리 5개 아키타입에 매핑. 3가지 판정:
- **흡수**: 우리 아키타입과 같은 방향, 정밀 명세만 가져오면 됨
- **확장**: 우리에 없는 신규 아키타입 후보
- **제외**: 내부 사용 맥락에 부적합

```markdown
# Gap Analysis: pptx-design-styles vs Our Archetypes

## 매핑 결과

| 스타일 (저쪽) | 우리 아키타입 | 판정 | 채용 우선순위 |
|-------------|------------|------|------------|
| Swiss International | swiss-minimal | 흡수 | HIGH |
| Nordic Minimalism | swiss-minimal | 흡수 | MED |
| Glassmorphism | dark-tech | 흡수 | HIGH |
| Aurora Neon Glow | dark-tech | 흡수 | MED |
| ... | ... | ... | ... |
| Retro Y2K | (없음) | 확장 | MED |
| Vaporwave | (없음) | 확장 | LOW |
| Bento Grid | (없음) | 확장 | HIGH |
| ... | ... | ... | ... |

## 채용 목록 (Phase 3 대상)

### 흡수 (명세 정밀화)
- dark-tech: [대응 스타일 목록]
- swiss-minimal: [대응 스타일 목록]
- ...

### 신규 아키타입 추가
- 추가 X개: [이름 목록]

## 제외 이유
- [제외 스타일]: [이유]
```

**Step 2: 커밋**

```bash
git add -f docs/experiments/benchmark-styles/gap-analysis.md
git commit -m "docs: 30개 스타일 갭 분석 + 채용 목록 확정"
```

---

## Phase 3: 통합

### Task 7: design-specs.md 생성 (Design Spec 독립 레이어)

**Files:**
- Create: `skills/presentation/skills/presentation/references/design-specs.md`

gap-analysis.md의 "채용 목록" 기준으로, 각 아키타입에 정밀 명세 작성.

**Step 1: 파일 생성 — 기존 5개 아키타입 정밀화부터**

```markdown
# Design Specs — 정밀 시각 명세

> visual-archetypes.md가 "방향"을 정의한다면, 이 파일은 "정확한 값"을 명시한다.
> html-designer.md에서 아키타입을 선택한 후 이 파일을 참조하여 exact values를 적용한다.

## dark-tech

**Palette**
- Background: `#0a0a0f` (거의 검정, 블루 틴트)
- Primary accent: `#00d4ff` (사이안 네온)
- Secondary accent: `#7c3aed` (퍼플)
- Text primary: `#f0f0ff`
- Text muted: `#6b7280`

**Typography**
- Heading: Inter ExtraBold 900, 80-120px, gradient text (#00d4ff → #7c3aed)
- Subheading: Inter SemiBold 600, 32-48px
- Body: Inter Regular 400, 18-22px, line-height 1.6
- Caption: JetBrains Mono 400, 13px

**Layout**
- Grid: 12-column, 80px gutter
- Content area: 80% viewport width
- Card radius: 12-16px
- Glow: `box-shadow: 0 0 40px rgba(0,212,255,0.15)`

**Signature elements**
- Translucent card: `background: rgba(255,255,255,0.04); backdrop-filter: blur(12px)`
- Progress bar with gradient fill
- Corner brackets `[ ]` on hero stat

**Avoid**
- White/light backgrounds
- Serif fonts
- More than 2 accent colors simultaneously

---

## swiss-minimal

[동일 구조]

---

## brutalist-typo

[동일 구조]

---

[gap-analysis.md에서 확정된 신규 아키타입 추가]
```

**Step 2: 커밋**

```bash
git add skills/presentation/skills/presentation/references/design-specs.md
git commit -m "feat: design-specs.md 생성 — 아키타입별 정밀 시각 명세 레이어"
```

---

### Task 8: visual-archetypes.md 업데이트

**Files:**
- Modify: `skills/presentation/skills/presentation/references/visual-archetypes.md`

**Step 1: 상단에 design-specs.md 참조 안내 추가**

파일 첫 번째 `## 사용법` 섹션에 아래 문구 추가:

```markdown
## 사용법

이 파일은 아키타입의 **방향과 무드**를 정의한다.
정밀한 HEX 색상, 폰트 포인트, 레이아웃 수치는 `references/design-specs.md`를 참조한다.

> 워크플로: visual-archetypes.md에서 아키타입 선택 → design-specs.md에서 exact values 적용
```

**Step 2: 신규 아키타입 항목 추가**

gap-analysis.md에서 확정된 신규 아키타입을 철학적 설명 형식으로 추가 (exact values는 design-specs.md에 있음).

예시 (Bento Grid):
```markdown
### bento-grid
- **무드**: 구조적, 정보 밀도, 모듈 시스템
- **색상 철학**: 밝은 배경 + 카드별 색상 차별화 + 강한 보더
- **레이아웃 경향**: CSS Grid 기반, 카드 단위 분할, 비균등 그리드
- **타이포**: SemiBold 중심, 카드 크기에 비례한 폰트 스케일
- **잘 어울리는 콘텐츠**: 대시보드, KPI 요약, 포트폴리오
```

**Step 3: 커밋**

```bash
git add skills/presentation/skills/presentation/references/visual-archetypes.md
git commit -m "feat: visual-archetypes.md 확장 — 신규 아키타입 추가 + design-specs 참조 안내"
```

---

### Task 9: html-designer.md 업데이트

**Files:**
- Modify: `skills/presentation/src/html-pipeline/prompts/html-designer.md`

**Step 1: 입력 섹션에 design-specs.md 참조 추가**

`## 입력` 섹션을:

```markdown
## 입력

- **outline**: 검증 통과한 outline.md (🔒/💡 마커 포함)
- **archetype**: visual archetype 정의 (`references/visual-archetypes.md`에서)
- **design_specs**: 선택된 아키타입의 정밀 명세 (`references/design-specs.md`에서)
- **profile_overrides**: 사용자 프로필 (my-visual.md, my-structure.md — 있을 때만)
```

**Step 2: 규칙 섹션에 정밀 명세 우선 원칙 추가**

`## 규칙` → `### 디자인 적용 우선순위`:

```markdown
### 디자인 적용 우선순위

1. `design_specs`의 exact values (HEX, font-size, layout 수치) 최우선
2. `profile_overrides`의 사용자 선호 오버라이드
3. `visual-archetypes.md`의 방향성 (exact values 없는 영역만)
4. LLM 자유 해석 (위 세 가지로 커버 안 되는 세부 사항)
```

**Step 3: 커밋**

```bash
git add skills/presentation/src/html-pipeline/prompts/html-designer.md
git commit -m "feat: html-designer.md — design-specs 참조 입력 + 적용 우선순위 명시"
```

---

### Task 10: SKILL.md 오케스트레이션 업데이트

**Files:**
- Read: `skills/presentation/skills/presentation/SKILL.md`
- Modify: `skills/presentation/skills/presentation/SKILL.md`

**Step 1: Phase 2 (Design Agent 호출) 단계에 design-specs 로드 추가**

Design Agent 호출 직전 단계에:

```markdown
**Phase 2-4: Design Spec 로드**
- `references/design-specs.md`에서 선택된 아키타입 섹션을 읽는다
- 아키타입 이름으로 해당 섹션(`## [archetype-name]`)을 찾아 추출한다
- html-designer.md 호출 시 `design_specs` 입력으로 전달한다
```

**Step 2: 커밋**

```bash
git add skills/presentation/skills/presentation/SKILL.md
git commit -m "feat: SKILL.md — Design Agent 호출 시 design-specs 로드 단계 추가"
```

---

### Task 11: 회귀 테스트

**Step 1: Topic 1 최종 버전 실행**

- **소스**: "경영진 대상 AI 코딩 어시스턴트 도입 제안"
- **아키타입**: dark-tech
- **목표**: Phase 1 After 점수(XX/100) 이상

**Step 2: 구조 점수 확인**

```bash
cd _dev/test-presentation
npx tsx scripts/structural-scorer.ts ../../[output.pptx 경로]
```

Expected: 100/100

**Step 3: 품질 점수 LLM-as-Judge**

rubric.md 기준. Phase 1 After 점수 이상이면 회귀 없음.

**Step 4: 최종 커밋**

```bash
git commit -m "test: 회귀 테스트 통과 — design-specs 통합 최종 확인"
```

---

## 참고 경로

| 파일 | 실제 경로 |
|------|----------|
| html-designer.md | `skills/presentation/src/html-pipeline/prompts/html-designer.md` |
| visual-archetypes.md | `skills/presentation/skills/presentation/references/visual-archetypes.md` |
| SKILL.md | `skills/presentation/skills/presentation/SKILL.md` |
| design-specs.md (신규) | `skills/presentation/skills/presentation/references/design-specs.md` |
| 벤치마킹 실험 결과 | `docs/experiments/benchmark-styles/` |
