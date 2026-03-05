# Skill-First 전략: 조직 내 암묵지 명시지화

> Clarified from HB's original vision (2026-03-04).
> "Skill이 기본이고, references/+DB는 필요한 도메인에만 추가된다."

---

## Goal

조직 내 각 직무의 암묵지를 Claude Code Skills로 명시지화하여, AI Agent 기반 업무 품질을 표준화한다.

---

## 3-Tier Architecture

```
Tier 0: Pure Skill
  SKILL.md만으로 완결 (예: human-writing, agent-council)
  → 워크플로우/판단 프레임워크만 필요한 도메인

Tier 1: Skill + MCP          ← 대다수 도메인
  SKILL.md (판단 프레임워크)
  + MCP Server (Google Drive/Notion → 실시간 원천 조회)
  → 원천 데이터가 이미 외부 시스템에 존재하는 도메인

Tier 2: Skill + DB            ← 소수 규제 도메인 (RA 등)
  SKILL.md (판단 프레임워크)
  + references/ (정규화된 규칙 원문)
  + Rule DB 백엔드 (버전 관리, 충돌 해소, 상태 라이프사이클)
  → 원문 인용이 법적으로 필요하고, 규칙 수/변경 빈도가 높은 도메인
```

### Tier 전환 트리거

| From | To | Trigger |
|------|----|---------|
| Tier 0 | Tier 1 | 외부 시스템(Drive/Notion)의 데이터를 참조해야 할 때 |
| Tier 1 | Tier 2 | MCP만으로는 원문 정확성·버전 관리·충돌 해소가 불가능할 때 |

---

## Rollout Strategy

### Phase 1: 시연 + 완성 스킬 배포
- HB가 Claude Code 가치를 시연하며 k-sunshine 등 완성 스킬 동시 배포
- 목표: "이런 게 되네?" 체험 생성

### Phase 2: 스킬 작성 가이드 + 템플릿 제공
- `_template/` 기반 도메인 규칙 스킬 작성 가이드
- HB는 가이드만 제공, 작성은 도메인 실무자 본인

### Phase 3: 중앙 레포에서 스킬 축적
- `skills-repo/` (Git) → symlink 설치 → 조직 내 공유
- 각 팀이 자기 도메인 스킬을 PR로 기여

### Phase 4: 한계 도달 시 DB 전환
- Tier 1 스킬이 부족한 도메인 식별 → Tier 2 (Skill+DB) 고려

---

## Key Decisions

| Question | Decision |
|----------|----------|
| Claude Code 보급 전략 | 시연 + 완성 스킬 배포 병행 (bottom-up 체험 주도) |
| 스킬 작성자 | 실무자 본인이 직접. HB는 템플릿 + 가이드 |
| 스킬 배포 방식 | 중앙 Git 레포 + symlink 설치 |
| DB 전환 기준 | references/가 필요한 수준이면 DB, MCP로 충분하면 Skill만 |
| MCP의 역할 | 스킬의 판단 프레임워크 + MCP로 외부 원천 실시간 조회 |

---

## Constraints

- HB가 병목이 되면 안 됨 — 실무자 직접 작성 모델의 핵심
- 품질 편차는 감수 — 템플릿과 가이드로 최소 품질선 확보
- DB는 "필요하면 추가"이지 "기본 인프라"가 아님

---

## Success Criteria

1. Claude Code를 일상 도구로 쓰는 사람이 HB 외에 3명 이상
2. HB가 만들지 않은 스킬이 1개 이상 중앙 레포에 등록
3. Tier 1 (Skill+MCP) 방식으로 동작하는 도메인 스킬이 2개 이상

---

## Related Documents

- [Known/Unknown Quadrant Analysis](./agent-knowledge-layer-known-unknown.md)
