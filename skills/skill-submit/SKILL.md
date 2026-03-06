---
name: skill-submit
origin: "Original work — Skills for Workers project"
description: >
  Route users to the right tool for creating or submitting skills.
  Determines intent (create new vs package existing) and guides to
  skill-creator, skill-lint, or skill-package accordingly.
  Triggers: skill submit, 스킬 제출, 스킬 만들기, 새 스킬, submit skill,
  create skill, 스킬 등록, 스킬 생성
---

# Skill Submit

스킬 생성·제출 라우터. 사용자 의도를 파악하여 적절한 도구로 안내한다.

## Workflow

### Step 1: Intent Classification

사용자에게 질문한다: **"스킬을 새로 만드시려는 건가요, 이미 만든 스킬을 제출하시려는 건가요?"**

| 의도 | 라우팅 |
|------|--------|
| 새 스킬을 만들고 싶다 | → **Create Path** |
| 이미 있는 스킬을 제출하고 싶다 | → **Package Path** |
| 잘 모르겠다 | "SKILL.md 파일이 있으신가요?" → 있으면 Package, 없으면 Create |

### Step 2a: Create Path

1. **Anthropic `/skill-creator` 실행을 안내한다** — 인터뷰 → SKILL.md 생성은 공식 도구가 담당
2. 생성 완료 후: **`/skill-lint`로 검증**하라고 안내한다 (사내 컨벤션 확인)
3. 검증 통과 후: **`/skill-package`로 패키징**하라고 안내한다

```
스킬 생성 → 검증 → 패키징 흐름:

  /skill-creator  →  /skill-lint  →  /skill-package
  (공식 도구)        (컨벤션 검증)     (zip 패키징)
```

### Step 2b: Package Path

**`/skill-package`를 안내한다** — 발견 → 검증 → zip 패키징을 한번에 처리한다.

## Decision Framework

### 라우팅 기준

```
SKILL.md가 있는가?
  ├─ Yes → /skill-package (Full 모드: 검증 + 패키징)
  └─ No  → /skill-creator → /skill-lint → /skill-package
```

### 도구 역할 정리

| 도구 | 역할 | 소유 |
|------|------|------|
| `/skill-creator` | 인터뷰 → SKILL.md 생성 | Anthropic 공식 |
| `/skill-lint` | 13개 규칙 검증 | 사내 |
| `/skill-package` | 검증 + zip 패키징 + 제출 안내 | 사내 |
| `/skill-submit` | 위 도구들로의 라우팅 (이 스킬) | 사내 |

## Key Principles

1. **환경 > 도구** — 스킬 생성은 공식 skill-creator에 위임. 자체 인터뷰/생성 로직을 두지 않는다
2. **최단 경로** — 사용자 의도에 맞는 도구로 즉시 안내. 불필요한 단계를 거치지 않는다
3. **파이프라인 연결** — create → lint → package 흐름이 자연스럽게 이어지도록 각 단계 완료 시 다음 단계를 안내한다
