# Presentation Profile System — Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create implementation plan from this design.

**Goal:** 프레젠테이션 스킬 사용 시 사용자의 프리셋/레이아웃/문구 선호를 세션 간 영구 저장하고, 사용할수록 정밀해지는 개인화 시스템.

**Architecture:** 브랜드 가이드라인 4축(Visual, Structure, Voice, Defaults) 기반 `references/my-*.md` 파일에 저장. 정형 데이터는 `src/profile/` TypeScript 모듈이, 비정형 데이터는 SKILL.md 지시로 Claude가 관리. Day 1부터 4파일 구조 존재하되 자연스럽게 채워진다.

**Tech Stack:** TypeScript (YAML frontmatter 파싱), pptxgenjs (PPTX 역공학), SKILL.md (Claude 지시)

---

## 1. 프로필 저장 구조

```
skills/presentation/skills/presentation/references/
├── my-defaults.md      # 코드 전용 — 기본 프리셋, purpose→preset 매핑, 사용 횟수
├── my-visual.md        # 코드 전용 — 프리셋 색상/폰트 오버라이드, 커스텀 프리셋
├── my-structure.md     # 혼합 — 선호 레이아웃 (YAML) + 배치 근거 메모 (본문)
└── my-voice.md         # Claude 전용 — 톤 규칙, 제목 스타일, 금지/선호 표현
```

모든 `my-*.md` 파일은 **gitignored**. 개인 상태이므로 repo에 커밋하지 않는다.

### 파일별 소유권 (Council Critical 대응: 동시성/YAML 파손 방지)

| 파일 | 쓰기 권한 | 읽기 |
|------|-----------|------|
| my-defaults.md | `src/profile/` 코드만 | Claude + 코드 |
| my-visual.md | `src/profile/` 코드만 | Claude + 코드 |
| my-structure.md | YAML frontmatter: 코드 / 본문: Claude | Claude + 코드 |
| my-voice.md | Claude만 | Claude |

**불변 규칙:** Claude는 YAML frontmatter 영역을 절대 직접 수정하지 않는다. 코드는 마크다운 본문 영역을 절대 수정하지 않는다.

## 2. 데이터 모델

### my-defaults.md
```yaml
---
defaultPreset: kr-corporate-navy
pptxMode: hybrid
outputDir: ~/Desktop
updatedAt: 2026-03-10
---

## Purpose → Preset 매핑
| Purpose | Preset | 횟수 | 최근 사용 |
|---------|--------|------|-----------|
| investor-pitch | swiss-modern | 5 | 2026-03-10 |
| quarterly-review | kr-clean-white | 3 | 2026-03-08 |
```

### my-visual.md
```yaml
---
overrides:
  kr-corporate-navy:
    colors:
      accent: "#2E86DE"
    fonts:
      display: { family: "Pretendard", weight: "800" }
customPresets:
  - id: my-navy-v2
    base: kr-corporate-navy
    accent: "#2E86DE"
    cardBg: "#1B2A4A"
    createdAt: 2026-03-10
---
```

### my-structure.md
```yaml
---
preferredLayouts:
  investor-pitch: [hero-sub, asymmetric, table-grid]
  quarterly-review: [table-grid, two-split, kpi-highlight]
---

## 배치 메모
- 투자자 피칭: 첫 슬라이드는 반드시 hero-sub, 숫자는 table-grid로
- 분기 실적: KPI 3개 이상이면 kpi-highlight
```

### my-voice.md
```markdown
## 톤 규칙
- 격식: 반말 금지, 하지만 딱딱하지 않게
- 수치: "약 30%"보다 "30%↑" 선호
- 과장 금지: "혁신적", "획기적" 사용 자제

## 제목 스타일
- 질문형 선호: "왜 지금인가?" > "현재 시점의 필요성"
- 한글 제목 + 영문 부제: "성장의 공식 — Growth Formula"

## 금지 표현
- "패러다임 시프트", "시너지"
```

## 3. 프로필 부트스트랩

```
최초 사용 또는 프로필 비어있을 때:

"참고할 PPTX가 있으면 넣어주세요. 없으면 몇 가지 질문으로 시작합니다."

  PPTX 있음 → 색상/폰트/레이아웃 추출 → 가장 유사한 프리셋 매칭 → 프로필 초기화
  PPTX 없음 → 온보딩 3문답:
    1. "주로 어떤 발표를 하시나요?" (purpose 매칭)
    2. "선호하는 톤은?" (격식/캐주얼/간결)
    3. "밝은/어두운 테마 중?" (mode 결정 → 프리셋 추천)
```

### PPTX 역공학 (부트스트랩)
레퍼런스 PPTX에서 추출하는 정보:
- **색상**: 슬라이드 배경색, 텍스트 색상 → 가장 유사한 프리셋 매칭
- **폰트**: display/body 폰트 패밀리
- **레이아웃**: 슬라이드당 요소 수, 배치 비율 → 선호 레이아웃 유형 추론
- **텍스트 밀도**: 슬라이드당 평균 단어 수

"이 PPTX가 평소 스타일인가요?" 확인 후 프로필에 반영.

## 4. 축적 워크플로우

### Phase 5: Profile Accumulation (매 발표 완료 후)

```
발표 완료
  ↓
5a. 코드 자동 기록 (정형)
    - purpose→preset 매핑 횟수 +1
    - 프리셋 오버라이드 변경사항 (있으면)
    - 레이아웃 선호 업데이트
  ↓
5b. Claude 기록 (비정형)
    - 새로운 톤 규칙 발견 시 my-voice.md 추가
    - 배치 근거 메모 (특이 배치 시 my-structure.md 본문)
  ↓
5c. 확인
    "이 스타일을 프로필에 저장할까요?"
    Yes → 유지
    No  → 5a/5b에서 추가한 내용 롤백
```

### 롤백 메커니즘 (Council Critical 대응)

Phase 5 시작 전 `src/profile/` 코드가 변경 대상 파일의 스냅샷을 메모리에 보관. No 시 스냅샷으로 복원. Claude 관리 영역(my-voice.md 본문)은 Claude가 추가한 내용을 직접 제거.

### Temporary Override (Council 권고 반영)

1회성 선택을 장기 선호로 오염시키지 않기 위해:
- 발표 시작 시 평소와 다른 프리셋/스타일을 선택하면: "이번만 예외인가요, 앞으로 기본으로 할까요?"
- "이번만" → 프로필 업데이트 스킵
- "앞으로" → 프로필 업데이트

### Profile Audit (Style Drift 관리)

`my-defaults.md`의 매핑 횟수 합이 10회를 넘으면:
- Claude가 프로필 전체 검토
- "최근에는 A보다 B를 더 선호하시는 것 같은데, 가이드를 정리할까요?"
- 오래되고 사용 빈도 낮은 매핑 정리 제안

## 5. src/profile/ 모듈

| 함수 | 역할 | 대상 파일 |
|------|------|-----------|
| `isProfileEmpty()` | 부트스트랩 필요 여부 | my-defaults.md 존재 확인 |
| `readDefaults()` | YAML frontmatter 파싱 | my-defaults.md |
| `updatePurposeMapping(purpose, preset)` | 매핑 추가/횟수 증가 | my-defaults.md |
| `readVisualOverrides(presetId)` | 프리셋별 오버라이드 로드 | my-visual.md |
| `saveVisualOverride(presetId, overrides)` | 오버라이드 저장 | my-visual.md |
| `saveCustomPreset(preset)` | 커스텀 프리셋 저장 | my-visual.md |
| `readLayoutPrefs(purpose)` | purpose별 선호 레이아웃 | my-structure.md |
| `updateLayoutPrefs(purpose, layouts)` | 레이아웃 선호 업데이트 | my-structure.md |
| `createSnapshot(files)` | 롤백용 스냅샷 생성 | 대상 파일들 |
| `restoreSnapshot(snapshot)` | 스냅샷으로 복원 | 대상 파일들 |
| `extractFromPptx(pptxPath)` | PPTX에서 스타일 추출 | 입력 PPTX |
| `matchPreset(extracted)` | 추출된 스타일과 가장 유사한 프리셋 매칭 | presets.ts |

### YAML frontmatter 안전 규칙
- 파싱 실패 시 해당 파일을 `.bak`으로 백업 후 기본값으로 재생성 (self-healing)
- Claude에게 frontmatter 영역 수정 지시를 절대 포함하지 않음

## 6. SKILL.md 변경사항

### Phase 1 변경
```
기존:
  1. purpose 감지 → 프리셋 추천 → 선택

변경:
  1. my-defaults.md 확인
     - 있으면: 기본 프리셋/purpose 매핑 로드 → 추천에 반영
     - 없으면: 부트스트랩 (PPTX 레퍼런스 또는 온보딩)
  2. my-visual.md에서 오버라이드 로드 → 프리셋에 적용
  3. my-voice.md 읽고 톤/문구 가이드로 활용
  4. my-structure.md에서 레이아웃 선호 반영
```

### Phase 5 추가
SKILL.md에 Phase 5(Profile Accumulation) 섹션 추가. 위 4절의 워크플로우를 지시형으로 기술.

### 부트스트랩 지시
```
프로필이 비어있으면:
1. "참고할 PPTX가 있으면 넣어주세요" 안내
2. PPTX 있으면 → extractFromPptx() → matchPreset() → 프로필 초기화
3. 없으면 → 온보딩 3문답 → 프로필 초기화
```

## 7. 설계 결정 근거

| 결정 | 근거 |
|------|------|
| 4파일 분리 | 브랜드 가이드 4축 표준, 독립 로드로 토큰 효율, Day 1부터 구조 존재 |
| gitignored | 개인 상태는 repo에 커밋하지 않음 (Council: references/ 정신모델 불일치) |
| 소유권 분리 | Council Critical: 동시성/YAML 파손 방지. 코드↔Claude 영역 격리 |
| 스냅샷 롤백 | Council Critical: 파일 기반 상태 되돌리기에 원본 필요 |
| PPTX 부트스트랩 | 메모리 스캔보다 직접적 증거. 할루시네이션 없음. 사용자가 레퍼런스를 직접 제공 |
| Temporary Override | Council 권고: 1회성 선택의 장기 선호 오염 방지 |
| Profile Audit | Council 권고: Style Drift 장기 관리 |
| 톤 "규칙" 프레이밍 | Council: 문구 "축적"은 자기복제 위험. 규칙/제약으로 프레이밍 |

## 8. Council Review 반영 요약

| 출처 | 지적 | 반영 |
|------|------|------|
| GLM Critical | 동시성 Race Condition | 파일별 소유권 분리 (코드 vs Claude) |
| GLM Critical | YAML 파손 위험 | Claude는 frontmatter 수정 금지 + self-healing |
| GLM Critical | 롤백 비현실성 | 스냅샷 메커니즘 |
| GLM Warning | 발표 완료 시점 모호 | SKILL.md에서 명시적 Phase 전환 |
| GLM Warning | Pruning 없음 | Profile Audit (10회 주기) |
| Gemini | Style Drift | Profile Audit + Temporary Override |
| Gemini | Conflict Resolution | Claude가 my-voice.md 상충 시 최신성 기준 정리 |
| Codex | references/ 정신모델 | gitignored로 해결 (tracked 참조자료와 분리) |
| Codex | voice 자기복제 | 톤 "규칙/제약"으로 프레이밍 변경 |
| Codex 제안 | v1 축소 | 거부 — 4축은 Day 1부터 존재, 빈 상태로 시작 |
