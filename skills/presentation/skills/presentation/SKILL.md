---
name: presentation
description: >
  HTML → hybrid PPTX 발표자료 생성 파이프라인. 자유모드 기본 + 프리셋 opt-in + Message Design 레이어.
  Triggers: presentation, 발표자료, 슬라이드, pptx
origin: internal — figma PPTX pipeline fork + html-pipeline integration
---

# /presentation Skill

Generate professional PPTX presentations from topics, documents, or URLs.

## Trigger

```
/presentation [source] [options]
```

Examples:
- `/presentation "AI 트렌드 2026" 8장`
- `/presentation ./report.md 10장 --preset=kr-corporate-navy`
- `/presentation https://notion.so/page-id 5장 우아한 느낌으로`
- `/presentation "분기 실적 보고" 6장`

대화 인식:
- "프레젠테이션 만들어줘"
- "발표 자료 만들어줘"
- "PPT 만들어줘"
- "슬라이드 만들어줘"

## References

Load these before starting:
- `references/html-generation.md` — HTML slide generation rules
- `references/style-presets.md` — Style presets (kr-* 9종)

Profile files (auto-generated, gitignored — loaded when available):
- `references/my-defaults.md` — 기본 프리셋, purpose 매핑, 사용 횟수
- `references/my-visual.md` — 프리셋 오버라이드, 커스텀 프리셋
- `references/my-structure.md` — 선호 레이아웃 (YAML frontmatter) + 배치 메모 (본문)
- `references/my-voice.md` — 톤 규칙, 제목 스타일, 금지/선호 표현

---

## Phase 1: 정보 수집

### 프로필 확인 (Phase 1 시작 시 가장 먼저)

1. `references/my-defaults.md` 존재 확인:
   - **있으면**: 기본 프리셋/purpose 매핑 로드 → 아래 프리셋 추천에 반영
   - **없으면**: 아래 부트스트랩 실행 후 계속

2. **부트스트랩** (프로필 최초 생성 — my-defaults.md 없을 때만):
   ```
   "참고할 PPTX가 있으면 넣어주세요. 없으면 몇 가지 질문으로 시작합니다."

   PPTX 있음 → `node dist/profile/cli.js bootstrap-pptx <path>` 실행 → 프로필 초기화
     이후: "이 PPTX가 평소 스타일인가요?" 확인 후 반영
   PPTX 없음 → 온보딩 2문답:
     1. "주로 어떤 발표를 하시나요?" → purpose 매칭
     2. "밝은/어두운 테마 중?" → mode 결정 → 프리셋 추천
   ```

3. 프로필 있으면 추가 로드:
   - `references/my-visual.md` — 선택된 프리셋의 오버라이드 적용
   - `references/my-voice.md` — 톤/문구 가이드로 활용 (파일 없으면 스킵, 사용하며 자연 적층)
   - `references/my-structure.md` — 레이아웃 선호 반영

### 소스 자동 감지

| 소스 상태 | 감지 기준 | 동작 |
|----------|----------|------|
| 충분 | 파일/URL/긴 텍스트 제공 | 즉시 분석 시작 |
| 주제만 | 짧은 문자열 (< 100자) | "리서치해서 초안을 만들겠습니다. 진행할까요?" |
| 없음 | /presentation만 입력 | 목적·청중·시간 질문 시작 |

### Input Types

| Type | Detection | Action |
|------|-----------|--------|
| Topic string | No file path or URL | Use your knowledge to generate content |
| Local file | Starts with `./` or `/` | Read file with Read tool |
| Notion URL | Contains `notion.so` | Fetch via `notion-fetch` MCP tool |
| Other URL | Starts with `https://` | Fetch via `WebFetch` tool |

### 수집 항목 (하나씩 질문)

1. **소스 자료** — 이미 있으면 스킵
2. **목적** — purpose-profile 자동 매칭
3. **분량** — "몇 분 발표인가요?" or "몇 장?"
4. **디자인 모드** — 아래 디자인 모드 선택 참조
5. **저장 경로** — 첫 사용 시 질문, CLAUDE.md에 `outputDir: <path>` 저장

### 디자인 모드 선택

```
디자인 모드:
  A) 자유 모드 (기본) — AI가 자유롭게 디자인합니다. 제약 없음.
  B) 프리셋 모드 — 브랜드/규정에 맞는 가드레일을 적용합니다.
```

- **기본값: A (자유 모드)** — 1920×1080 규격만 지키고 LLM이 자유롭게 디자인
- B 선택 시 → 프리셋 선택 단계로 진입 (아래 참조)
- 사용자가 프리셋 이름을 직접 언급하면 자동으로 B 모드

| 선택 | HTML 프롬프트 | 설명 |
|------|--------------|------|
| 자유 모드 | `prompts/hybrid-free.md` | Message Design + 자유 CSS |
| 프리셋 모드 | `prompts/hybrid.md` | Message Design + 프리셋 CSS 변수 |

### Preset Selection (프리셋 모드일 때만)

1. **프로필 매핑 확인**: my-defaults.md에서 해당 purpose의 기존 preset 매핑 확인
   - 매핑 있으면 → 가장 많이 사용한 프리셋을 1순위로 추천
   - 매핑 없으면 → purpose-profiles.ts 기반 기본 추천 사용

2. **Present top 3 presets** from matched purpose profile's `presets[]` array:

```
추천 프리셋:
  A) [프로필 기반 프리셋] — [vibe] (평소 N회 사용) ← 프로필 기반 (있을 때)
  B) [purpose 기반 2순위] — [vibe]
  C) [purpose 기반 3순위] — [vibe]
  또는 프리셋 이름을 직접 입력하세요.
```

3. **Temporary Override 확인** (평소와 다른 프리셋 선택 시):
   "이번만 예외인가요, 앞으로 기본으로 할까요?"
   - "이번만" → 프로필 업데이트 스킵 (Phase 5에서 확인하지 않음)
   - "앞으로" → Phase 5에서 프로필 업데이트

---

## Phase 2: 생성 모드 선택

정보 수집 완료 후 사용자에게 생성 방식 선택지 제시:

```
생성 방식을 선택해주세요:
A) 원샷 — 전체 슬라이드를 한 번에 생성합니다
B) 단계별 — 아웃라인을 먼저 보여드린 후 승인하시면 생성합니다
C) 슬라이드별 — 한 장씩 만들면서 피드백을 받습니다
```

기본값: 사용자가 선택하지 않으면 **B(단계별)**로 진행.

### Mode B: 아웃라인 생성 (단계별 모드)

```
OUTLINE: [Title]
MODE: free | preset:[preset-name]
SLIDES: [count]

---

SECTION A: [Name] (slide range, duration)

  #1. [Title — 주장형, 목차형 금지]
      -> [핵심 메시지 1문장]
      -> [레이아웃 의도]
```

#### Content Analysis

- Identify 3-5 major themes or sections
- Extract key messages, data points, quotes
- Determine narrative arc: Problem -> Analysis -> Solution -> Action
- Match content volume to requested slide count

#### Content Guidelines

- Each slide should have ONE clear takeaway (Message Design Rule 1)
- Before information, establish tension — why this matters (Rule 2)
- Connect to audience's reality, not abstract tech (Rule 4)
- Balance content types: don't use 5 bullet slides in a row
- Total text per slide: aim for 50-100 words

Show outline to user for approval before proceeding to Phase 3.

---

## Phase 3: HTML 생성 + 프리뷰/수정

1. **HTML 슬라이드 생성**
   - 선택된 모드에 따라 `references/html-generation.md` + 해당 프롬프트 규칙 적용
   - **양쪽 프롬프트 모두 Message Design 레이어 포함** (4규칙 + 5안티패턴)
   - 저장 위치: `slides/generated/`
   - Mode A: 전체 한 번에 생성
   - Mode B: 아웃라인 승인 후 생성
   - Mode C: 한 장씩 생성 + 피드백

2. **slides-grab 에디터 실행**
   ```bash
   npm run editor -- --slides-dir slides/generated --port 3456
   ```
   ```
   "에디터를 열었습니다: http://localhost:3456
   브라우저에서 슬라이드를 확인하고 직접 수정할 수 있습니다.
   수정이 끝나면 말씀해주세요."
   ```

3. **수정 대기**
   - 사용자가 "완료" / "내보내기" / "끝" 등 입력 시 Phase 4로

---

## Phase 4: 내보내기

1. **에디터 서버 중지** (필요 시)

2. **PPTX 생성**
   ```bash
   npm run export-pptx -- slides/generated --output=<outputDir>/[topic-slug].pptx --mode=hybrid --verbose
   ```

3. **결과 보고**
   ```
   [count]장의 PPTX를 생성했습니다.
   파일: <outputDir>/[topic-slug].pptx
   PowerPoint에서 열어 확인해주세요.
   ```

### 저장 경로

- 첫 사용 시: "PPTX를 어디에 저장할까요? (예: ~/Desktop, ~/Documents)"
- 응답 후 CLAUDE.md에 `outputDir: <path>` 추가
- 이후: 자동으로 설정된 경로 사용 (config.ts의 `getOutputDir()`)
- 기본값: `~/Desktop`

### Style Change (Post-Generation)

스타일 변경 요청 시:
1. HTML 파일들의 CSS 변수만 교체 (콘텐츠 재생성 불필요)
2. 에디터에서 확인 후 다시 내보내기
3. 전체 재생성보다 훨씬 빠름

---

## Phase 5: 프로필 축적 (발표 완료 후)

PPTX 내보내기 완료 후 자동 실행. **Temporary Override("이번만")로 표시된 경우에는 실행하지 않는다.**

### 5a. 코드 자동 기록 (정형 데이터)

Phase 5 시작 전 스냅샷 생성 (임시 파일로 저장):
```bash
SNAP=$(mktemp /tmp/profile-snap-XXXX.json)
node dist/profile/cli.js snapshot "$SNAP"
```

다음 커맨드를 순서대로 실행 (skills/presentation/ 에서):
1. `node dist/profile/cli.js update-purpose "<purpose>" "<preset>"` — purpose→preset 매핑 횟수 +1
2. `node dist/profile/cli.js save-visual "<presetId>" '<json>'` — 오버라이드 변경사항 (있으면)
3. `node dist/profile/cli.js update-layout "<purpose>" "<layout1,layout2>"` — 레이아웃 기록

### 5b. Claude 기록 (비정형 데이터)

- 새로운 톤 규칙 발견 시 → `references/my-voice.md` 본문에 추가 (파일 없으면 새로 생성)
  - 예: "시너지란 표현 쓰지 마" → 금지 표현 섹션에 추가
  - 예: 제목 질문형 패턴 감지 → 제목 스타일 섹션에 기록
  - 빈 상태에서 시작해 발표마다 자연스럽게 적층되는 것이 정상
- 특이 배치 결정 시 → `references/my-structure.md` 본문에 메모

**⚠️ 소유권 규칙:** Claude는 YAML frontmatter를 절대 직접 수정하지 않는다. 코드(src/profile/)는 마크다운 본문을 절대 수정하지 않는다.

### 5c. 확인

```
"이 스타일을 프로필에 저장할까요?"
  Yes → 유지
  No  → `node dist/profile/cli.js restore "$SNAP"` 으로 5a/5b 변경사항 전체 롤백
```

### Profile Audit (10회 주기)

Phase 5 완료 직후 `node dist/profile/cli.js audit-check` 실행. `due: true`이면:
1. 프로필 전체 검토 제안
2. "최근에는 A보다 B를 더 선호하시는 것 같은데, 가이드를 정리할까요?"
3. 오래되고 사용 빈도 낮은 매핑 정리 제안

---

## Error Handling

| Error | Recovery |
|-------|----------|
| Font load failure | safeLoadFont falls back to Inter -- proceed but warn user |
| Build failure | Run `npm run build` and check TypeScript errors |
| Notion fetch failed | Ask user to paste content directly |
| PPTX write failure | Check disk space and output directory permissions |

## Conversation Flow

```
User: /presentation "AI 트렌드 2026" 8장

[Phase 1] 소스 분석 + 디자인 모드
  "디자인 모드: A) 자유 모드 (기본)  B) 프리셋 모드"
  → A 선택 (기본)

[Phase 2] "생성 방식을 선택해주세요: A/B/C" -> B 선택
  아웃라인 제시 -> 승인

[Phase 3] HTML 생성 -> 에디터 실행
  "에디터를 열었습니다: http://localhost:3456"
  사용자 수정 후 "내보내기"

[Phase 4] PPTX 생성 -> 파일 전달

User: 좀 더 우아한 느낌으로 바꿔줘

[Style change] CSS 변수 교체 -> 에디터 확인 -> 재내보내기
```
