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
```html
<style>
  @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
</style>
```

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
