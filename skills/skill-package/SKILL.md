---
name: skill-package
origin: "Original work — Skills for Workers project"
description: >
  Package an existing skill directory into a submission-ready zip.
  Validates conventions, excludes non-distributable files, provides submission instructions.
  Triggers: package skill, 스킬 패키징, 스킬 포장, 스킬 압축, bundle skill,
  제출 패키지, zip skill, 기존 스킬 제출
---

# Skill Package

비개발자용 — 기존 스킬을 검증하고 제출용 zip으로 패키징한다.

**skill-submit과의 차이**: skill-submit은 스킬을 _처음부터 만드는_ 가이드이고, skill-package는 _이미 존재하는_ 스킬을 패키징한다.

## Workflow

### Mode Selection

사용자에게 모드를 확인한다:

- **Full** (기본): 검증 + 패키징. 첫 제출이거나 직접 만든 스킬에 적합
- **Quick**: 패키징만. 이미 `/skill-lint`로 검증을 마친 경우에 적합

사용자가 명시하지 않으면 Full 모드로 진행한다.

### Phase 1: Discover

스킬 디렉토리를 찾고 확인한다.

1. 사용자에게 "어떤 스킬을 패키징하시겠습니까?"라고 질문한다
2. 답변을 기반으로 아래 경로를 순서대로 탐색한다:
   - 사용자가 지정한 경로 (절대 경로 또는 상대 경로)
   - `~/.claude/skills/` 하위 디렉토리
   - 현재 디렉토리
   - `skills/` 하위 디렉토리
3. `SKILL.md` 존재 여부를 확인한다
4. frontmatter에서 `name`과 `description`을 추출하여 표시한다
5. 사용자에게 맞는 스킬인지 확인받는다

만약 SKILL.md가 없으면: "이 디렉토리에 SKILL.md가 없습니다. `/skill-submit`으로 새 스킬을 만드시겠습니까?"라고 안내한다.

### Phase 2: Validate (Full mode only)

Quick 모드에서는 이 Phase를 건너뛴다.

5개 FAIL 규칙을 인라인 검사하고, WARN/INFO는 요약만 보고한다.

#### Inline FAIL Checks

| ID | Rule | Check | Fix Hint |
|----|------|-------|----------|
| F1 | name + dir match | frontmatter `name` == 디렉토리 basename | `name: {basename}` 으로 수정 |
| F2 | name format | `[a-z0-9-]`만, 연속 하이픈 금지, 시작/끝 하이픈 금지, <=64자 | 소문자+하이픈만 사용 |
| F3 | description exists | 비어있지 않음 (공백만 있어도 실패) | description 필드 작성 |
| F4 | description <=1024자 | YAML multiline 접기 해제 후 순수 텍스트 측정 | 1024자 이내로 축소 |
| F5 | origin exists | 필드 존재 | `origin: "출처"` 추가 |

#### WARN/INFO 관찰

FAIL 5개 외의 WARN(W1-W6)/INFO(I1-I2) 항목은 관찰 결과만 요약한다. 상세 보고가 필요하면 `/skill-lint`를 권장한다.

#### FAIL 발생 시

1. 실패한 규칙과 수정 방법을 표시한다
2. 사용자에게 직접 수정할지, 도움을 받을지 묻는다
3. 수정 후 해당 규칙만 재검증한다
4. 모든 FAIL 규칙이 통과할 때까지 반복한다

### Phase 3: Package

제출용 zip 파일을 생성한다.

1. **포함/제외 미리보기**: zip에 포함될 파일과 제외될 파일 목록을 표시한다
2. **제외 패턴** (CI deploy.yml과 동일):
   - `node_modules/`
   - `.jobs/`
   - `.DS_Store`
   - `council.config.yaml`
   - `*.skill`
   - `*.zip`
   - `.gitkeep`
3. 사용자 확인 후 zip을 생성한다
4. zip 명명: `{skill-name}-submit.zip` (현재 디렉토리에 생성)
5. 결과를 보고한다: 파일명, 크기, 포함된 파일 수

#### zip 생성 명령

```bash
(cd "$(dirname "$SKILL_DIR")" && zip -r "$OLDPWD/{name}-submit.zip" "$(basename "$SKILL_DIR")" \
  -x "*/node_modules/*" \
  -x "*/.jobs/*" \
  -x "*/.DS_Store" \
  -x "*/council.config.yaml" \
  -x "*/*.skill" \
  -x "*/*.zip" \
  -x "*/.gitkeep" \
)
```

### Phase 4: Submit

제출 방법을 안내한다.

```
======================================
  스킬 제출 방법
======================================

  방법 A (권장): 개발자에게 {name}-submit.zip 전달
           → PR로 레포에 추가

  방법 B: Google Drive "Skills for Workers > submissions"
           폴더에 {name}-submit.zip 업로드

======================================
```

## Decision Framework

### 모드 선택 기준

| 상황 | 권장 모드 |
|------|-----------|
| 첫 제출, 직접 만든 스킬 | Full |
| skill-creator로 방금 만든 스킬 | Full |
| `/skill-lint` 이미 통과 | Quick |
| 재패키징 (내용 변경 없음) | Quick |

### SKILL.md 없는 경우 분기

```
SKILL.md 존재? ──No──▶ "/skill-submit으로 새 스킬을 만드시겠습니까?" → 중단
       │
      Yes
       │
       ▼
  Phase 2/3 진행
```

### 제외 판단 기준

| 파일/패턴 | 제외 이유 |
|-----------|-----------|
| `node_modules/` | 런타임 의존성, 설치 시 재생성 |
| `.jobs/` | agent-council 실행 임시 데이터 |
| `.DS_Store` | macOS 시스템 파일 |
| `council.config.yaml` | 사용자별 설정 (example만 배포) |
| `*.skill` | claude.ai 웹용 바이너리 번들 |
| `*.zip` | 기존 zip 파일 중복 포함 방지 |
| `.gitkeep` | 빈 디렉토리 유지용, 배포 불필요 |

## Response Format

각 Phase 완료 시 진행 보고를 출력한다:

```
## Skill Package — Phase N 완료

**스킬**: {name} — {description 첫 50자}...
**모드**: Full / Quick

### 검증 결과 (Full only)
| ID | Result | Detail |
|----|--------|--------|
| F1 | PASS   | name="nda-triage", dir="nda-triage" |
| ...                                        |

WARN: N개 관찰 (상세: /skill-lint)
INFO: N개 관찰

### 패키지
- 파일: {name}-submit.zip
- 크기: {size}
- 포함: {count}개 파일

### 제출 안내
[Phase 4 안내 표시]
```

## Key Principles

1. **Non-destructive** — 소스 스킬 디렉토리를 절대 수정하지 않는다. 읽기 + zip 생성만 수행
2. **Guided** — 모든 단계에 명확한 안내를 제공한다. 비개발자도 따라할 수 있어야 한다
3. **CI-consistent** — deploy.yml과 동일한 7개 제외 패턴을 사용한다
4. **Transparent** — zip에 포함/제외될 파일을 생성 전에 보여준다
5. **Fail-fast** — SKILL.md가 없으면 즉시 중단하고 대안(/skill-submit)을 안내한다
