# /presentation Skill

Generate professional PPTX presentations from topics, documents, or URLs.

## Trigger

```
/presentation [source] [options]
```

Examples:
- `/presentation "AI 트렌드 2026" 8장`
- `/presentation ./report.md 10장 --style=notebook-tabs`
- `/presentation https://notion.so/page-id 5장 우아한 느낌으로`
- `/presentation "분기 실적 보고" 6장`
- `/presentation ./deck.md --style=swiss-modern`

대화 인식:
- "프레젠테이션 만들어줘"
- "발표 자료 만들어줘"
- "PPT 만들어줘"
- "슬라이드 만들어줘"

## References

Load these before starting:
- `references/slides-md-format.md` — Parser format specification
- `references/outline-format.md` — Intermediate outline format
- `references/style-presets.md` — Style presets
- `references/html-generation.md` — HTML slide generation rules

---

## Phase 1: 정보 수집

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
4. **프리셋** — 목적 기반 상위 3개 자동 추천 (아래 Purpose Detection 참조)
5. **PPTX 스타일** — 디자인 우선 / 편집 우선 (아래 PPTX 스타일 선택 참조)
6. **저장 경로** — 첫 사용 시 질문, CLAUDE.md에 `outputDir: <path>` 저장

### Purpose Detection + Preset Auto-Selection

After analyzing the source, detect presentation purpose and recommend matching preset.

1. **Detect purpose** from topic, audience, and user keywords.
   Reference: `src/themes/purpose-profiles.ts` — 20 purpose profiles with keyword matching.
   Each profile has `presets[]` (preset candidates in priority order) and `layouts[]` (preferred layouts).

2. **Present top 3 presets** from the matched purpose profile's `presets[]` array:

```
추천 프리셋:
  A) kr-impact-dark — 임팩트 있는 한국형 다크 (추천)
  B) bold-signal — 강렬한 시그널, 어두운 배경
  C) electric-studio — 전기적 에너지, 네온 톤
  또는 프리셋 이름을 직접 입력하세요.
```

Each preset description uses its `vibe` field from `src/themes/presets.ts`.
Experienced users can skip by saying the preset name directly (e.g., "bold-signal로").

3. User can override:
   - Direct: "notebook-tabs로 해줘"
   - Purpose-based: "투자자 피칭용으로" -> Sequoia/YC pattern
   - Accept default: proceed with recommendation

### PPTX 스타일 선택

프리셋 확정 직후, PPTX 스타일을 묻는다:

```
PPTX 스타일:
  A) 디자인 우선 — 화려한 비주얼, 받는 사람은 텍스트만 수정 가능
  B) 편집 우선 — 깔끔한 디자인, 받는 사람도 모든 요소 자유롭게 수정 가능
```

- 기본값: A (디자인 우선)
- 선택에 따라 Phase 3 HTML 생성 프롬프트와 Phase 4 내보내기 모드가 분기됨:

| 선택 | HTML 프롬프트 | 내보내기 모드 |
|------|--------------|--------------|
| 디자인 우선 | `prompts/hybrid.md` | `--mode=hybrid` |
| 편집 우선 | `prompts/editable.md` | `--mode=dom` |

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

Create an outline following `references/outline-format.md`:

```
OUTLINE: [Title]
STYLE: [preset-name]
SLIDES: [count]

---

SECTION A: [Name] (slide range, duration)

  #1. [Title] -> [ContentType]
      -> [content summary]
```

#### Content Analysis

- Identify 3-5 major themes or sections
- Extract key messages, data points, quotes
- Determine narrative arc: Problem -> Analysis -> Solution -> Action
- Match content volume to requested slide count

#### ContentType Assignment

Assign ContentType to each slide based on content:
- Key message with supporting points -> `content-bullets`
- Comparison or data -> `content-table`
- Impactful quote -> `quote`
- Process or flow -> `diagram-flow`
- Opening -> `title`, Closing -> `closing`

#### Content Guidelines

- Each slide should have ONE clear message
- Bullet text: concise, 10-15 words per bullet
- Table cells: short phrases, not paragraphs
- Balance content types: don't use 5 bullet slides in a row
- Total text per slide: aim for 50-100 words

Show outline to user for approval before proceeding to Phase 3.

---

## Phase 3: HTML 생성 + 프리뷰/수정

1. **HTML 슬라이드 생성**
   - **디자인 우선**: `references/html-generation.md` + `prompts/hybrid.md` 규칙 적용
   - **편집 우선**: `prompts/editable.md` 규칙 적용 (CSS 제약, 시맨틱 HTML 강제)
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
   # 디자인 우선 (기본)
   npm run export-pptx -- slides/generated --output=<outputDir>/[topic-slug].pptx --mode=hybrid --verbose

   # 편집 우선
   npm run export-pptx -- slides/generated --output=<outputDir>/[topic-slug].pptx --mode=dom --verbose
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

[Phase 1] 소스 분석 + 프리셋 추천
  "발표 목적: 트렌드 리포트 (Editorial 패턴)
   추천 스타일: Vintage Editorial
   대안: Electric Studio, Dark Botanical"

[Phase 2] "생성 방식을 선택해주세요: A/B/C" -> B 선택
  아웃라인 제시 -> 승인

[Phase 3] HTML 생성 -> 에디터 실행
  "에디터를 열었습니다: http://localhost:3456"
  사용자 수정 후 "내보내기"

[Phase 4] PPTX 생성 -> 파일 전달

User: 좀 더 우아한 느낌으로 바꿔줘

[Style change] CSS 변수 교체 -> 에디터 확인 -> 재내보내기
```
