# Presentation Agent Pipeline Design

**Goal:** 모놀리식 SKILL.md 워크플로우(Phase 2)를 4-Agent 파이프라인으로 분리하여 자기검증 편향을 해소하고 단계별 품질을 독립 개선 가능하게 한다.

**Architecture:** SKILL.md가 오케스트레이터 역할. 각 에이전트는 별도 프롬프트 파일(`prompts/`)로 정의되고, Claude Code의 `Agent()` 서브에이전트로 dispatch하여 컨텍스트 격리. Phase 1/3/4/5는 불변, Phase 2만 교체.

**Background Research:** PPTAgent/DeepPresenter (3.3k stars, 2-Agent), Auto-Slides (Westlake, 6-Agent 3-Phase), Azure Multi-Agent Builder (Swarm). 업계 공통 패턴: 리서치/콘텐츠 분석과 시각 디자인을 별도 에이전트로 분리.

---

## 1. 전체 아키텍처

```
User → SKILL.md (Orchestrator)
         │
         ├─ Phase 1: 정보 수집 (불변)
         │   프로필, 소스, 목적, 분량, 디자인 모드, 무드 키워드
         │
         ├─ Phase 2: Agent Pipeline (NEW)
         │   ┌─────────────────────┐
         │   │  Research Agent     │ ← source + purpose + audience
         │   │  (prompts/research) │ → research.json
         │   └────────┬────────────┘
         │            ▼
         │   ┌─────────────────────┐
         │   │ Verification Agent  │ ← research.json + original source
         │   │ (prompts/verify)    │ → pass / {issues + fix_instruction}
         │   └────────┬────────────┘
         │            ▼ (fail → Research 재전달, 최대 2회)
         │   ┌─────────────────────┐
         │   │ Message Architect   │ ← verified JSON + slide count + archetype
         │   │ (prompts/message)   │ → outline.md (🔒/💡 마커)
         │   └────────┬────────────┘
         │            ▼
         │   ┌─────────────────────┐
         │   │ Verification Agent  │ ← outline.md + research.json
         │   │ (prompts/verify)    │ → pass / {issues + fix_instruction}
         │   └────────┬────────────┘
         │            ▼ (fail → Message Architect 재전달, 최대 2회)
         │   ┌─────────────────────┐
         │   │  Design Agent       │ ← verified outline + archetype + profile
         │   │ (prompts/designer)  │ → HTML slides (slides/generated/)
         │   └─────────────────────┘
         │
         ├─ Phase 3: 프리뷰/수정 (불변 — 에디터만, 생성은 Phase 2에서 완료)
         ├─ Phase 4: 내보내기 (불변)
         └─ Phase 5: 프로필 축적 (불변)
```

### 변경 범위

| 구분 | 변경 | 불변 |
|------|------|------|
| Phase 1 | — | 프로필, 소스 감지, 디자인 모드, 무드 키워드 |
| Phase 2 | 아웃라인 생성 → 4-Agent 파이프라인으로 교체 | 사용자 선택지 (원샷/단계별/슬라이드별) |
| Phase 3 | HTML "생성" 제거, "편집"만 유지 | slides-grab 에디터 |
| Phase 4-5 | — | 내보내기, 프로필 축적 |

---

## 2. Agent 상세 설계

### 2.1 Research Agent

**역할:** 소스 자료에서 발표 가능한 소재를 구조화하여 추출

**규칙:**
- 금지: 주관적 스토리텔링, 없는 사실 생성
- 허용: 중요도 태깅(priority), 출현빈도 표기(source_emphasis)

**입력:** source(파일/URL/텍스트) + purpose + audience

**출력 (JSON):**
```json
{
  "themes": [
    {
      "name": "string",
      "evidence": ["source excerpt 1", "source excerpt 2"],
      "priority": "high|medium|low"
    }
  ],
  "dataPoints": [
    {
      "value": "string",
      "context": "string",
      "source_ref": "string",
      "must_keep": true
    }
  ],
  "quotes": [
    {
      "text": "string",
      "speaker": "string",
      "relevance": "string"
    }
  ],
  "audience_context": "string",
  "narrative_arc": "string",
  "source_emphasis": [
    {
      "topic": "string",
      "frequency": 3,
      "original_weight": "high|medium|low"
    }
  ]
}
```

### 2.2 Message Architect

**역할:** Message Design 4규칙 적용, 슬라이드별 메시지 설계

**규칙:**
- 금지: CSS/레이아웃 구체 지정, 시각적 판단
- 필수: 4규칙 (One Takeaway, Tension First, Visual = Message Priority, Audience Bridge)
- 필수: 5안티패턴 회피 (토픽 레이블링, 대칭 불릿, 정보 투기, 무표정 제목, 추상적 CTA)

**입력:** verified research.json + slide count + archetype

**출력 (마크다운):**
```markdown
OUTLINE: [Title]
ARCHETYPE: [selected archetype]
SLIDES: [count]

---

## Slide 1: [제목 — 주장형]
- 🔒 **takeaway**: [핵심 메시지 1문장 — 변경 불가]
- **tension**: [왜 이것이 중요한가]
- **bridge**: [청중의 현실과 어떻게 연결되는가]
- 💡 **layout_intent**: [비교 구조 / 단일 임팩트 / 데이터 강조 등 — 디자인 해석 가능]

## Slide 2: [제목]
...
```

**🔒/💡 마커 시스템:**
- `🔒` (Lock): Design Agent가 워딩을 절대 변경할 수 없는 영역
- `💡` (Interpret): Design Agent가 자유롭게 시각적으로 해석할 수 있는 영역

### 2.3 Design Agent

**역할:** 아웃라인을 HTML 슬라이드로 시각화

**규칙:**
- 금지: 🔒 마커 워딩 변경
- 허용: 💡 마커 영역 자유 해석, CSS 전체 자유
- 허용: 레이아웃 부적합 시 조정 요청 반환 (직접 수정하지 않음)
- 참조: html-generation.md 규격 + visual-archetypes.md

**입력:** verified outline.md + archetype definition + profile overrides (my-visual.md, my-structure.md)

**출력:** HTML files (`slide-01.html`, `slide-02.html`, ...)

**포함 규격:**
- Canvas: 1920×1080px, overflow: hidden
- Self-contained inline `<style>`
- Font: Pretendard + Inter (Google Fonts @import)
- Archetype 방향 안에서 최대한 표현

### 2.4 Verification Agent

**역할:** 이전 단계 출력을 비교 기준과 대조하여 검증

**규칙:**
- 금지: 직접 수정/생성
- 필수: 구체적 수정 지시서(fix_instruction) 반환

**입력:**
```json
{
  "artifact": "검증 대상 (research.json 또는 outline.md)",
  "baseline": "비교 기준 (원본 소스 또는 research.json)",
  "criteria": "검증 관점 설명"
}
```

**출력 (JSON):**
```json
{
  "pass": false,
  "issues": [
    {
      "type": "missing|distorted|unsupported",
      "location": "themes[2] / Slide 3 takeaway",
      "description": "원본에서 강조된 비용 절감 데이터가 누락됨",
      "fix_instruction": "themes에 cost_reduction 항목 추가, dataPoints에서 '37% 절감' 수치 포함"
    }
  ]
}
```

**검증 관점 (호출 시점별):**

| 호출 시점 | artifact | baseline | criteria |
|-----------|----------|----------|----------|
| Step 2 (Research 후) | research.json | original source | 소스 대비 커버리지 — 핵심 주제/데이터 누락 여부 |
| Step 4 (Message 후) | outline.md | research.json | 메시지 충실도 — must_keep 보존, 근거 없는 주장 여부 |

---

## 3. 오케스트레이터 흐름 + 실패 복구

### Dispatch 로직

```
Phase 2 시작
│
├─ Step 1: Agent(prompt=research.md, input=source+purpose+audience)
│   → research.json 저장 (/tmp/presentation-pipeline/)
│
├─ Step 2: Agent(prompt=verify.md, input={artifact:research.json, baseline:source, criteria:"소스 커버리지"})
│   ├─ pass=true → Step 3
│   └─ pass=false → fix_instruction을 Research Agent에 재전달
│        재시도 횟수 < 2 → Step 1로 (fix_instruction 포함)
│        재시도 횟수 >= 2 → 사용자에게 이슈 목록 제시, 수동 판단 요청
│
├─ Step 3: Agent(prompt=message-architect.md, input=research.json+count+archetype)
│   → outline.md 저장
│
├─ Step 4: Agent(prompt=verify.md, input={artifact:outline.md, baseline:research.json, criteria:"메시지 충실도"})
│   ├─ pass=true → Step 5
│   └─ pass=false → fix_instruction을 Message Architect에 재전달
│        재시도 횟수 < 2 → Step 3로
│        재시도 횟수 >= 2 → 사용자에게 제시
│
├─ Step 5: [Mode B/C] outline.md를 사용자에게 제시 → 승인 대기
│
├─ Step 6: Agent(prompt=html-designer.md, input=outline.md+archetype+profile)
│   → HTML files (slides/generated/)
│
└─ Phase 3으로 이동
```

### 실패 복구 규칙

| 규칙 | 내용 |
|------|------|
| 재시도 상한 | 각 검증 지점에서 최대 2회. 무한 루프 방지. |
| 실패 시 사용자 개입 | 2회 실패 → issues 목록을 사용자에게 제시. 사용자가 수정 방향 결정. |
| Design → Verify 루프 | MVP에서 없음. Phase 3 에디터에서 사람이 검수. 향후 Playwright 스크린샷 기반 확장 가능. |
| Verification 재사용 | 같은 verify.md 프롬프트, criteria만 다르게 전달. |
| 임시 파일 정리 | Phase 2 완료 후 /tmp/presentation-pipeline/ 정리. |

---

## 4. 프롬프트 파일 구조

### 파일 배치

```
skills/presentation/
├── src/html-pipeline/prompts/
│   ├── hybrid.md              (기존 유지 — 프리셋 모드)
│   ├── hybrid-free.md         (deprecated — 폴백용 유지)
│   ├── research.md            ← NEW
│   ├── message-architect.md   ← NEW
│   ├── html-designer.md       ← NEW
│   └── verify.md              ← NEW
```

### hybrid-free.md 분해 매핑

| hybrid-free.md 섹션 | 이동 목적지 |
|---------------------|-----------|
| Internal planning steps 1-3 (Analyze, Decide count, Narrative arc) | research.md |
| Internal planning step 4 (Select archetype) | message-architect.md (archetype는 입력으로 받음) |
| Internal planning step 5 (Plan each slide) | message-architect.md |
| Message Design 4규칙 + 5안티패턴 | message-architect.md |
| Visual Archetype Interpretation | html-designer.md |
| CSS Full Freedom + HTML Spec | html-designer.md |

hybrid-free.md는 삭제하지 않고 deprecated 표시. 멀티 에이전트 파이프라인 안정화 후 제거.

---

## 5. SKILL.md 변경 범위

### Phase 2 교체

기존 Phase 2 ("생성 모드 선택 + 아웃라인 생성")를 에이전트 파이프라인 dispatch 로직으로 교체.

**사용자 선택지는 동일 유지:**
- A) 원샷 — 전체 한 번에
- B) 단계별 — 아웃라인 승인 후 생성 (기본값)
- C) 슬라이드별 — 한 장씩 + 피드백

**내부 변경:** 아웃라인 생성 로직이 Research → Verify → Message → Verify → Design 파이프라인으로 대체.

### Phase 3 접점 변경

기존 Phase 3에서 "HTML 생성 + 에디터"였던 것이 "에디터만"으로 변경. HTML 생성은 Phase 2의 Design Agent가 담당.

### 사용자 경험 변화

| 항목 | 현재 (모놀리식) | 변경 후 (멀티 에이전트) |
|------|----------------|----------------------|
| 사용자 대화 흐름 | 동일 | 동일 — 내부 파이프라인은 비노출 |
| 상태 표시 | 없음 | "분석 중..." → "메시지 설계 중..." → "디자인 중..." |
| 아웃라인 승인 | 1회 | 동일 1회 (Verification 통과 후 제시) |
| 실패 시 | 전체 재생성 | 해당 단계만 재시도 → 2회 실패 시 구체적 이슈 제시 |

---

## 6. Council 검토 결과 + 반영 사항

### 검토 (2026-03-13, Extended 3-model)

| Member | Model | Score | Key Insight |
|--------|-------|-------|-------------|
| 💎 Gemini | strategist | 23/25 | Go. Thinker-Doer-Critic 분리 견고. 프롬프트 부패 방지 효과 큼. |
| 👤 Codex | GPT-5.4 | 17/25 | 조건부 승인. Research 무해석·Verification pass-only가 사용자 가치와 충돌. |
| 🤖 GLM | GLM-4.7 | 11/25 | 경고. 컨텍스트 단절이 자기검증보다 더 해로울 수 있음. |

### 3자 합의 → 설계 반영

| 원래 설계 | 수정안 | 근거 |
|----------|--------|------|
| Research: 해석 안 함 | 주관적 스토리텔링 금지 + 중요도 태깅 허용 | 3자 합의 |
| Verification: pass/fail만 | pass/fail + 구체적 수정 지시서(fix_instruction) | Codex·GLM 합의 |
| Design: 메시지 수정 금지 | 워딩 변경 금지 + 레이아웃 부적합 시 조정 요청 허용 | GLM 경고 반영 |
| 핸드오프 계약: 포맷만 정의 | JSON에 priority/must_keep + 마크다운에 🔒/💡 마커 | Codex·GLM 합의 |

### 향후 확장 (MVP 이후)

- Design → Verification 루프: Playwright 스크린샷 기반 시각 검증
- 프리셋 모드 멀티 에이전트 확장: hybrid.md 분해
- 에이전트 간 조율 프로토콜: 실패율 데이터 축적 후 판단
- Phase 2 Unit Test: 특정 입력에 대한 기대 출력 자동 검증
