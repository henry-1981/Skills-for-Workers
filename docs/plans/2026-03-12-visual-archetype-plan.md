# Visual Archetype Pool Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 자유 모드의 구도 수렴 문제를 해결하기 위해 Visual Archetype Pool을 도입하고, 프로필 시스템과 양방향 연동한다.

**Architecture:** hybrid-free.md에서 수렴 유발 언어를 제거하고 아키타입 참조를 추가. 아키타입 정의는 별도 reference 파일. 프로필 시스템에 archetype usage tracking 추가.

**Tech Stack:** Markdown (prompts/references), TypeScript (profile system)

---

### Task 1: Visual Archetypes Reference 생성

**Files:**
- Create: `skills/presentation/skills/presentation/references/visual-archetypes.md`

**Step 1: 파일 생성**

아키타입 5종 정의. 각 항목: 무드, 색상 철학, 레이아웃 경향, 타이포, 잘 어울리는 콘텐츠.

```markdown
# Visual Archetypes — 자유 모드 디자인 시드

## 사용법

콘텐츠 분석 후 가장 적합한 아키타입을 선택한다.
사용자가 무드 키워드를 제공하면 해당 아키타입으로 매핑한다.
아키타입은 디자인 "방향"이지 "규격"이 아니다 — LLM이 자유롭게 해석한다.

프로필에 아키타입별 오버라이드가 있으면 (`references/my-visual.md`의 `## Archetype Overrides` 섹션) 해당 사용자 선호를 반영한다.

## Archetypes

### dark-tech
- **무드**: 깊은 어둠, 네온 악센트, 테크 무대
- **색상 철학**: 거의 검정 배경(#0a-#12) + 1-2 고채도 악센트
- **레이아웃 경향**: 카드 기반, 글로우 장식, 프로그레스 바
- **타이포**: ExtraBold 대형 + 극세 서브텍스트, 그래디언트 텍스트
- **잘 어울리는 콘텐츠**: 기술 트렌드, 제품 런칭, 키노트

### light-editorial
- **무드**: 밝고 정돈된, 잡지/에디토리얼
- **색상 철학**: 밝은 배경(#faf-#fff) + 무채색 + 1 절제된 악센트
- **레이아웃 경향**: 넓은 여백, 비대칭 텍스트 배치, 이미지 공간 확보
- **타이포**: 세리프 or 가벼운 산세리프, 본문 가독성 우선
- **잘 어울리는 콘텐츠**: 전략 보고, 리서치, 교육

### brutalist-typo
- **무드**: 고대비, 파격, 타이포그래피가 주인공
- **색상 철학**: 흑백 베이스 + 1 강렬한 포인트 (빨강, 노랑)
- **레이아웃 경향**: 비대칭, 의도적 밀도 차이, 그리드 파괴
- **타이포**: 극단적 크기 대비 (200px+ 헤드라인 vs 14px 캡션)
- **잘 어울리는 콘텐츠**: 브랜딩, 문화, 도발적 주제

### warm-organic
- **무드**: 따뜻한, 접근 가능한, 인간적
- **색상 철학**: 따뜻한 뉴트럴 (베이지, 테라코타, 올리브) + 부드러운 그라데이션
- **레이아웃 경향**: 둥근 모서리, 부드러운 그림자, 유기적 형태
- **타이포**: Medium 웨이트 중심, 친근한 크기 (60-80px 제목)
- **잘 어울리는 콘텐츠**: 워크숍, 온보딩, HR, 웰빙

### swiss-minimal
- **무드**: 정밀, 절제, 국제주의 스타일
- **색상 철학**: 무채색 + 단 1색 악센트, 색 면적 최소화
- **레이아웃 경향**: 엄격한 그리드, 정렬 강박, 정보 밀도 높음
- **타이포**: 산세리프 단일 패밀리, 웨이트로만 위계 표현
- **잘 어울리는 콘텐츠**: 데이터 보고, 컨설팅, 재무

## 무드 키워드 매핑 가이드

정확한 테이블은 없다. LLM이 사용자의 무드 키워드를 해석하여 가장 적합한 아키타입을 선택한다. 참고용 예시:

| 키워드 예시 | 가능한 아키타입 |
|------------|----------------|
| "어둡고 임팩트있게", "테크 느낌" | dark-tech |
| "밝고 깔끔하게", "잡지같이" | light-editorial |
| "파격적으로", "강렬하게" | brutalist-typo |
| "따뜻하게", "부드럽게" | warm-organic |
| "미니멀하게", "정돈된" | swiss-minimal |
```

**Step 2: Commit**

```bash
git add skills/presentation/skills/presentation/references/visual-archetypes.md
git commit -m "feat(presentation): Visual Archetypes reference 추가 (5종)"
```

---

### Task 2: hybrid-free.md 재작성

**Files:**
- Modify: `skills/presentation/src/html-pipeline/prompts/hybrid-free.md`

**Step 1: 수렴 언어 제거 + 아키타입 연결로 재작성**

```markdown
# Free Mode: Source → HTML Slides

Generate presentation slides as standalone HTML files.
The HTML will be screenshot-captured for PPTX — you have full CSS freedom.

## Process

Given source material, generate a series of presentation slide HTML files.

### Internal planning (do not output)
1. Analyze source: key points, data, narrative flow
2. Decide slide count (8-15 for 10-minute presentation)
3. Design narrative arc: opener → build-up → evidence → climax → closer
4. Select visual archetype: match to content character + user mood keyword (if provided). Load `references/visual-archetypes.md` for archetype definitions.
5. Plan each slide: message first (what to say), then layout (how to arrange) — the message determines the composition, not a template.

## HTML Specification

- **Canvas: `width: 1920px; height: 1080px`** (Full HD, mandatory)
- Each file is self-contained with inline `<style>` block
- File naming: `slide-01.html`, `slide-02.html`, ...
- Font: Pretendard via Google Fonts `@import` + Inter as fallback
- `overflow: hidden` on body

### Font Import
\```html
<style>
  @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
</style>
\```

## Message Design — Before CSS

Every slide exists to change what the audience thinks, feels, or does. Design the message first, then dress it.

### 4 Rules

1. **One Takeaway**: 슬라이드를 보고 3초 안에 한 문장으로 요약할 수 있어야 한다. 요약할 수 없으면 메시지가 없는 것이다.
2. **Tension First**: 정보를 주기 전에 "왜 이것이 중요한가"를 먼저 느끼게 하라. 긴장이 기억을 만든다.
3. **Visual = Message Priority**: CSS 강조(크기, 색상, 위치)는 메시지 우선순위에서 도출하라. 동등 나열은 "중요한 게 없다"는 신호다.
4. **Audience Bridge**: "기술이 이렇다" 대신 "당신의 업무가 이렇게 바뀐다"로 연결하라.

### Slide-ification Damage — Never Do These

LLM은 슬라이드를 쓸 때 무의식적으로 설득력을 버린다. 아래 5가지 패턴을 명시적으로 금지한다:

1. **토픽 레이블링 금지**: 제목은 카테고리 이름("에이전트 AI")이 아니라 주장("에이전트가 일을 대신한다")이어야 한다. 목차가 아니라 헤드라인으로 써라.
2. **대칭 불릿 금지**: 항목이 여러 개면 각각 다른 접근각, 다른 리듬으로 써라. 구문적 동형은 개성을 소거한다.
3. **정보 투기 금지**: 사실만 나열하지 마라. 숫자에는 반드시 해석("1년 만에 37% 성장")과 시사점("이 속도면 2028년에...")을 붙여라.
4. **무표정 제목 금지**: "숫자로 보는 AI 시장"(무엇에 관한 것) 대신 "돈이 몰리는 곳에 미래가 있다"(왜 중요한 것)로 써라.
5. **추상적 CTA 금지**: "시작하세요"가 아니라 "월요일에 하나 위임하라." 시간축과 구체적 행동을 넣어라.

---

## Visual Archetype Interpretation

선택한 아키타입의 무드, 색상 철학, 레이아웃 경향, 타이포를 참고하되 콘텐츠에 맞게 자유롭게 해석하라. 아키타입은 출발점이지 규격이 아니다.

사용자 프로필에 아키타입별 오버라이드가 있으면 우선 반영한다.

## CSS — Full Freedom

모든 CSS 기법을 사용할 수 있다: gradients, glow, backdrop-filter, transparency, rounded corners, grid, flexbox. 아키타입의 방향 안에서 최대한 표현하라.

### What NOT to do
- No cramped layouts — each slide should breathe
- No small text (minimum 16px for any visible text)
- No walls of text — if content is dense, split across slides
- No clip-art or placeholder images

## Output
Write each slide as a separate HTML file to the specified directory.
```

**Step 2: Commit**

```bash
git add skills/presentation/src/html-pipeline/prompts/hybrid-free.md
git commit -m "refactor(presentation): hybrid-free.md 재작성 — 수렴 언어 제거 + 아키타입 연결"
```

---

### Task 3: html-generation.md 정리

**Files:**
- Modify: `skills/presentation/skills/presentation/references/html-generation.md`

**Step 1: 수렴 유발 표현 제거**

변경사항:
- Line 20: "컨퍼런스 키노트 수준의 비주얼 품질을 목표로 한다." → 제거
- Line 64: "같은 레이아웃 5장 연속 금지" → 제거
- 슬라이드 구조 예시: CSS 변수 없는 자유 모드 예시 추가

**Step 2: Commit**

```bash
git add skills/presentation/skills/presentation/references/html-generation.md
git commit -m "refactor(presentation): html-generation.md 수렴 유발 표현 제거"
```

---

### Task 4: SKILL.md Phase 1 + Phase 5 업데이트

**Files:**
- Modify: `skills/presentation/skills/presentation/SKILL.md`

**Step 1: Phase 1에 무드 키워드 수집 추가**

`### 디자인 모드 선택` 뒤에 `### 무드 키워드 수집 (자유 모드일 때)` 섹션 추가:

```markdown
### 무드 키워드 수집 (자유 모드일 때)

디자인 모드에서 A(자유)를 선택한 경우:

1. **프로필 확인**: my-defaults.md에 해당 purpose의 아키타입 사용 이력이 있으면:
   ```
   "지난번 [purpose]에 [archetype]을 쓰셨는데, 이번에도 사용할까요?
    또는 원하는 분위기를 말씀해주세요. 맡겨주셔도 됩니다."
   ```

2. **프로필 없거나 신규 purpose**:
   ```
   "어떤 분위기를 원하세요? (예: 밝고 깔끔하게, 어둡고 임팩트있게, 따뜻하게)
    맡겨주셔도 됩니다."
   ```

3. **매핑**: 사용자 키워드 → `references/visual-archetypes.md`에서 가장 적합한 아키타입 선택 (LLM 판단)
4. **키워드 없음**: LLM이 콘텐츠 분석 후 자동 선택, 선택한 아키타입을 사용자에게 알림
```

**Step 2: Phase 5에 아키타입 기록 추가**

5a 코드 자동 기록에 추가:
```markdown
4. `node dist/profile/cli.js update-archetype "<purpose>" "<archetype>"` — 자유 모드일 때만, purpose→archetype 매핑 횟수 +1
```

5b Claude 기록에 추가:
```markdown
- 아키타입 오버라이드 발견 시 → `references/my-visual.md`의 `## Archetype Overrides` 섹션에 추가
  - 예: "warm-organic인데 그림자는 빼줘" → `### warm-organic` 아래에 기록
```

**Step 3: Commit**

```bash
git add skills/presentation/skills/presentation/SKILL.md
git commit -m "feat(presentation): SKILL.md에 무드 키워드 수집 + 아키타입 프로필 기록 추가"
```

---

### Task 5: Profile System — update-archetype 커맨드 추가

**Files:**
- Modify: `skills/presentation/src/profile/types.ts`
- Modify: `skills/presentation/src/profile/writer.ts`
- Modify: `skills/presentation/src/profile/cli.ts`

**Step 1: types.ts에 ArchetypeMapping 추가**

`ProfileDefaults` 인터페이스에 `archetypeUsage` 필드 추가:

```typescript
/** Purpose → Archetype mapping entry (free mode) */
export interface ArchetypeMapping {
  purpose: string;
  archetype: string;
  count: number;
  lastUsed: string; // YYYY-MM-DD
}

/** my-defaults.md frontmatter */
export interface ProfileDefaults {
  defaultPreset: string;
  pptxMode: 'hybrid';
  outputDir: string;
  updatedAt: string;
  purposeMappings: PurposeMapping[];
  archetypeUsage: ArchetypeMapping[];
}
```

Note: `pptxMode` 타입에서 `'dom'` 제거 — DOM 모드 폐기 반영.

**Step 2: writer.ts에 updateArchetypeMapping 함수 추가**

`updatePurposeMapping`과 동일한 패턴:

```typescript
export async function updateArchetypeMapping(
  purpose: string,
  archetype: string,
  path?: string,
): Promise<void> {
  const filePath = path ?? PROFILE_PATHS.defaults;
  const { data, body } = await readOrInit<ProfileDefaults>(filePath, {
    defaultPreset: '',
    pptxMode: 'hybrid',
    outputDir: '~/Desktop',
    updatedAt: '',
    purposeMappings: [],
    archetypeUsage: [],
  });

  const existing = data.archetypeUsage.find(
    m => m.purpose === purpose && m.archetype === archetype,
  );

  if (existing) {
    existing.count += 1;
    existing.lastUsed = today();
  } else {
    data.archetypeUsage.push({
      purpose,
      archetype,
      count: 1,
      lastUsed: today(),
    });
  }

  data.updatedAt = today();
  await ensureDir(filePath);
  await writeFile(filePath, stringifyFrontmatter(data, body));
}
```

**Step 3: cli.ts에 update-archetype 케이스 추가**

import에 `updateArchetypeMapping` 추가, switch에 케이스 추가:

```typescript
case 'update-archetype': {
  const [purpose, archetype] = args;
  if (!purpose || !archetype) {
    console.error('Error: update-archetype requires <purpose> <archetype>');
    process.exit(1);
  }
  await updateArchetypeMapping(purpose, archetype);
  console.log(`✓ archetype mapping updated: ${purpose} → ${archetype}`);
  break;
}
```

usage 문자열에도 추가:
```
  update-archetype <purpose> <archetype>  Add/increment purpose→archetype mapping (free mode)
```

**Step 4: writer.ts initDefaults DOM 모드 잔재 정리**

`initDefaults` 시그니처에서 `pptxMode: 'hybrid' | 'dom'` → `pptxMode: 'hybrid'` 로 변경.
`ProfileDefaults` 초기화에 `archetypeUsage: []` 추가.

**Step 5: 빌드 확인**

```bash
cd skills/presentation && npm run build
```

Expected: TypeScript 컴파일 성공, `dist/` 갱신

**Step 6: 수동 검증**

```bash
cd skills/presentation
node dist/profile/cli.js update-archetype "trend-report" "warm-organic"
# Expected: ✓ archetype mapping updated: trend-report → warm-organic
```

**Step 7: Commit**

```bash
git add skills/presentation/src/profile/types.ts skills/presentation/src/profile/writer.ts skills/presentation/src/profile/cli.ts
git commit -m "feat(presentation): profile system에 update-archetype 커맨드 추가"
```

---

### Task 6: 통합 검증 + 최종 커밋

**Step 1: lint 확인**

```bash
./scripts/lint-skills.sh skills/presentation/skills/presentation
```

Expected: All PASS

**Step 2: 빌드 확인**

```bash
cd skills/presentation && npm run build
```

Expected: 0 errors

**Step 3: 전체 변경 리뷰**

```bash
git log --oneline -6
```

Expected: Task 1-5의 커밋 5개 확인
