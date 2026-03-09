# /presentation Skill

Generate professional PPTX presentations from topics, documents, or URLs.

## Trigger

```
/presentation <source> [slide count] [style override]
```

Examples:
- `/presentation "AI 트렌드 2026" 8장`
- `/presentation ./report.md 10장 --style=notebook-tabs`
- `/presentation https://notion.so/page-id 5장 우아한 느낌으로`
- `/presentation "분기 실적 보고" 6장`
- `/presentation ./deck.md --style=swiss-modern`

## References

Load these before starting:
- `references/slides-md-format.md` — Parser format specification
- `references/outline-format.md` — Intermediate outline format
- `references/style-presets.md` — 12 style presets with category mapping

---

## Module 1: Source Collection

Gather raw content from the provided source.

### Input Types

| Type | Detection | Action |
|------|-----------|--------|
| Topic string | No file path or URL | Use your knowledge to generate content |
| Local file | Starts with `./ ` or `/` | Read file with Read tool |
| Notion URL | Contains `notion.so` | Fetch via `notion-fetch` MCP tool |
| Other URL | Starts with `https://` | Fetch via `WebFetch` tool |

### Process

1. **Detect source type** from user input
2. **For Notion URLs**: Use `notion-fetch` BEFORE attempting generic `WebFetch`
3. **Collect content**: Extract key points, data, quotes, structure
4. **Assess volume**: Estimate how many slides the content supports
5. **If topic-only**: Generate structured content using your knowledge (research current facts if needed)

### Output

Raw content notes organized by theme, ready for structuring.

---

## Module 2: Analysis + Structuring + Preset Selection

Analyze content and create a structured outline with style recommendation.

### Step 1: Content Analysis

- Identify 3-5 major themes or sections
- Extract key messages, data points, quotes
- Determine narrative arc: Problem -> Analysis -> Solution -> Action
- Match content volume to requested slide count

### Step 2: Outline Generation

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

Assign ContentType to each slide based on content:
- Key message with supporting points -> `content-bullets`
- Comparison or data -> `content-table`
- Impactful quote -> `quote`
- Process or flow -> `diagram-flow`
- Opening -> `title`, Closing -> `closing`

### Step 3: Purpose Detection + Preset Auto-Selection

After outline is ready, detect presentation purpose and recommend matching preset.

1. **Detect purpose** from topic, audience, and user keywords.
   Reference: `src/themes/purpose-profiles.ts` — 20 purpose profiles with keyword matching.

| Purpose | Pattern | Preset Candidates | Layout Preference |
|---------|---------|-------------------|-------------------|
| 제품 런칭 | Jobs Keynote | bold-signal, electric-studio, neon-cyber | full-message, hero-sub |
| 투자자 피칭 | Sequoia/YC | swiss-modern, paper-ink, electric-studio | hero-sub, two-split |
| 세일즈 데모 | Before→After | bold-signal, notebook-tabs, electric-studio | two-split, asymmetric |
| 전략 보고 | McKinsey | swiss-modern, paper-ink, notebook-tabs | table-grid, three-equal |
| 분기 실적 | Dashboard | notebook-tabs, swiss-modern, paper-ink | table-grid, two-split |
| 컨퍼런스 키노트 | TED/Sinek | neon-cyber, creative-voltage, bold-signal | full-message, hero-sub |
| 학술 발표 | Academic | paper-ink, swiss-modern, notebook-tabs | three-equal, table-grid |
| 워크숍 | Interactive | pastel-geometry, split-pastel, notebook-tabs | two-split, three-equal |
| 케이스 스터디 | STAR | vintage-editorial, notebook-tabs, paper-ink | two-split, asymmetric |
| 기업 문화/올핸즈 | Netflix Culture | dark-botanical, vintage-editorial, split-pastel | full-message, hero-sub |
| 로드맵/계획 | Timeline | notebook-tabs, pastel-geometry, swiss-modern | table-grid, asymmetric |
| 기술 아키텍처 | C4/Diagram | terminal-green, neon-cyber, swiss-modern | asymmetric, two-split |
| 창의/포트폴리오 | Lookbook | creative-voltage, split-pastel, dark-botanical | three-equal, asymmetric |
| 정책 브리핑 | Policy Brief | paper-ink, swiss-modern, notebook-tabs | hero-sub, table-grid |
| 영감/동기부여 | Motivational | dark-botanical, bold-signal, creative-voltage | full-message, hero-sub |
| 교육/온보딩 | Step-by-Step | pastel-geometry, notebook-tabs, split-pastel | three-equal, table-grid |
| 경쟁 분석 | Comparison | swiss-modern, notebook-tabs, paper-ink | table-grid, two-split |
| 프로젝트 회고 | Retrospective | vintage-editorial, split-pastel, notebook-tabs | three-equal, two-split |
| 트렌드 리포트 | Editorial | vintage-editorial, electric-studio, dark-botanical | hero-sub, asymmetric |
| 고객 제안서 | Proposal | swiss-modern, paper-ink, electric-studio | hero-sub, three-equal |

2. **Present recommendation** to user:

```
발표 목적: 전략 보고 (McKinsey 패턴)
추천 스타일: Swiss Modern (clean, precise)
대안: Paper Ink, Notebook Tabs
다른 느낌을 원하시면 말씀해주세요.
```

3. User can override:
   - Direct: "notebook-tabs로 해줘"
   - Purpose-based: "투자자 피칭용으로" -> Sequoia/YC pattern
   - Vibe-based: "우아한 느낌으로" -> dark-botanical or paper-ink
   - Accept default: proceed with recommendation

4. Style change after generation is lightweight: update `<!-- style: xxx -->` tag + re-run with `--preset=`

### Output

Structured outline shown to user for approval before proceeding.

---

## Module 3: slides.md Generation

Convert the approved outline into a complete slides.md file.

### Process

1. **Set style tag** on the first slide:
   ```markdown
   <!-- style: bold-signal -->
   ```

2. **Generate title slide**:
   ```markdown
   # Presentation Title

   > Subtitle or tagline
   ```

3. **Generate content slides** following the outline:
   - Expand content summaries into full bullet points, tables, or quotes
   - Use `**Bold prefix**:` for bullet items that should become card titles
   - Keep 3-6 bullets per slide (maps well to Bento layouts)
   - Tables: 2-4 rows with clear column headers
   - Quotes: include attribution with `> -- Author`

4. **Generate closing slide**:
   ```markdown
   ## 감사합니다

   > Q&A
   ```

5. **Add section comments** for navigation:
   ```markdown
   <!-- A. Problem Recognition (#1-6, 8min) -->
   ```

### Content Guidelines

- Each slide should have ONE clear message
- Bullet text: concise, 10-15 words per bullet
- Table cells: short phrases, not paragraphs
- Balance content types: don't use 5 bullet slides in a row
- Total text per slide: aim for 50-100 words

### Output

Save to `slides/[topic-slug].md` and show the user a preview.

---

## Module 4: Execution

Build the presentation and render to the selected output target.

### Process

1. **Run the pipeline**:
   ```bash
   cd <plugin-dir> && npx tsx src/index.ts slides/[file].md output/ --preset=[preset-name] --verbose
   ```
   This generates `output/[file].pptx` directly.

2. **Report results** to user:
   ```
   [count]장의 PPTX 슬라이드를 생성했습니다.
   - 파일: output/[file].pptx
   - 스타일: [preset name]

   PowerPoint이나 Google Slides에서 열어 확인해주세요.
   텍스트 편집이 가능합니다. 스타일 변경이 필요하면 말씀해주세요.
   ```

### Style Change (Post-Generation)

If the user wants a different style after seeing the result:

1. Edit `<!-- style: xxx -->` in the slides.md file
2. Re-run pipeline with new `--preset=` flag
3. No need to regenerate content -- only visual style changes

---

## Error Handling

| Error | Recovery |
|-------|----------|
| Font load failure | System font fallback (Arial/Georgia/Courier New) applied automatically |
| Build failure | Run `npm run build` and check TypeScript errors |
| Notion fetch failed | Ask user to paste content directly |
| PPTX write failure | Check disk space and output directory permissions |

## Conversation Flow

```
User: /presentation "AI 트렌드 2026" 8장

[Module 1] Content research...
[Module 2] Outline + style recommendation

  "8장 아웃라인을 만들었습니다.
   스타일: Bold Signal (confident, bold)
   진행할까요? 수정이 필요하면 말씀해주세요."

User: 좋아요, 진행해주세요

[Module 3] slides.md generation
[Module 4] PPTX generation

  "8장 PPTX를 생성했습니다.
   파일: output/ai-트렌드-2026.pptx
   스타일: Bold Signal
   PowerPoint에서 열어 확인해주세요."

User: 좀 더 우아한 느낌으로 바꿔줘

[Style change] dark-botanical preset re-run

  "Dark Botanical 스타일로 변경했습니다."
```
