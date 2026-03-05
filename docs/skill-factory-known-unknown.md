# Skill Factory 방향성: Known/Unknown Quadrant Analysis

> Based on: Council 브레인스토밍 (옵션 A vs B) + R1/R2 인터뷰
> Designed under the constraint that "실무자가 직접 스킬을 만들되, HB는 병목이 되지 않아야 한다"
> **최종 방향 (세션 중 확정)**: skill-creator를 내장/포크하지 않고, 공식 스킬을 그대로 활용. 이 레포는 **환경 조성(컨벤션+lint+저장소)**에 집중.

---

## Current State Diagnosis

- **skill-creator = Rollout Phase 2**: 이번 skill-creator 도입 논의가 기존 4-Phase 로드맵의 Phase 2("가이드+템플릿→실무자 자립")를 구체화한 것임이 확인됨
- **복합 병목**: 실무자의 스킬 작성을 가로막는 것은 "도구 접근성"과 "도메인 추출 역량" 두 가지가 동시에 작용
- **Phase 진행 모델**: 배포(Phase 1) → 사용·체험 → 반복 업무 식별 → skill-creator로 자체 제작(Phase 2)
- **품질 모델 확정**: 게이트키핑(HB 리뷰)이 아닌 **자동화 lint**로 품질 관리
- **What to stop doing**: HB의 수동 리뷰 게이트키핑을 기본 모델로 설계하는 것

---

## Quadrant Matrix

```
                    Known                          Unknown
         +---------------------------+---------------------------+
         |                           |                           |
         |   KK: Systematize         |   KU: Design Experiments  |
 Known   |   Resources: 50%          |   Resources: 30%          |
         |                           |                           |
         | 1. Skill-First 전략 확정   | 1. 자동화 lint 설계        |
         | 2. 4스킬 동작, 포크패턴 검증| 2. references/ gap 메우기  |
         | 3. Phase 2 = skill-creator | 3. 추천 메커니즘 가능성    |
         | 4. 배포: Git+symlink       | 4. 공식 spec 정합성        |
         | 5. 품질모델 = 자동 lint     |                           |
         +---------------------------+---------------------------+
         |                           |                           |
         |   UK: Leverage            |   UU: Set Up Antennas     |
 Unknown |   Resources: 15%          |   Resources: 5%           |
         |                           |                           |
         | 1. Anthropic skills spec/ | 1. Anthropic 빠른 진화     |
         | 2. 기존 분석 자산 2건      | 2. 사내 보안정책 변경      |
         | 3. nda-triage 포크 패턴    | 3. 저품질 스킬 신뢰 하락   |
         | 4. Rollout 4-Phase 프레임  |                           |
         +---------------------------+---------------------------+
```

**Resource 조정 근거**: 기본 60/25/10/5 대비 KK→50%, KU→30%로 조정. 아직 Phase 2 구체화 단계이므로 KU(실험)에 더 많은 리소스 배분 필요.

---

## 1. Known Knowns: Systematize (50%)

> 확인된 작동 항목. 반복 가능한 시스템으로 전환.

| # | Item | Evidence | Systemization Target |
|---|------|----------|---------------------|
| 1 | **Skill-First 3-Tier 전략** | Unknown/Vague 분석 + PRD 확정 | _template/에 Tier 0/1/2 분기 가이드 포함 |
| 2 | **4개 스킬 동작 검증** | nda-triage 3건 테스트, council QA 0 blocking | 각 스킬에 evals/ 추가하여 regression 감지 |
| 3 | **Phase 2 = skill-creator** | R1 확인 | skill-creator 래퍼/가이드를 이 레포에 배치 |
| 4 | **Git+symlink 배포** | README Quick Start 동작 확인 | 설치 스크립트 자동화 (선택) |
| 5 | **품질 = 자동 lint** | R2 확인 "자동화 lint 선호" | skill-lint 스크립트 또는 스킬로 구현 |

---

## 2. Known Unknowns: Design Experiments (30%)

> 답이 없는 질문들. 각각 최소 실험을 설계.

### KU1. 자동화 lint는 어떤 형태여야 하는가?

**Diagnosis**: HB는 게이트키핑을 원하지 않고, eval 인프라는 과하다고 판단. "가벼운 자동 검증"을 원하지만 구체적 형태가 미정.

**Experiment**:
| Item | Detail |
|------|--------|
| Format | skill-reviewer 스킬 제작: SKILL.md를 입력받아 _template 대비 lint (frontmatter 필수 필드, references/ 존재, 트리거 키워드 한/영 포함 등) |
| Success criteria | 기존 4개 스킬에 돌려서 nda-triage(포크 원본)만 경고, 나머지는 통과 |
| Deadline | Week 3 |
| Effort | 1일 (Pure Skill, Tier 0) |

**Promotion condition**: 4개 스킬에서 오탐 0건이면 KK로 승격
**Kill condition**: lint 규칙이 10개 이상으로 복잡해지면 접근 재고

### KU2. skill-creator가 references/ gap을 어떻게 메우는가?

**Diagnosis**: 인터뷰로 SKILL.md 초안은 나오지만 (R2: "부분 해소"), 세부 references/ 구조화는 전문가 개입 필요.

**Experiment**:
| Item | Detail |
|------|--------|
| Format | 실무자 1명과 skill-creator로 실제 스킬 1개 만들어보기. references/ 작성 시점에서 어디서 막히는지 관찰 |
| Success criteria | 실무자가 references/ 없이도 동작하는 Tier 0 스킬을 완성하거나, HB 개입 없이 references/를 작성 |
| Deadline | Week 4 (데모 이후) |
| Effort | 반나절 (페어 세션) |

**Promotion condition**: 실무자 혼자 Tier 0 완성 → "references/는 선택사항" 패턴으로 KK 승격
**Kill condition**: 매번 HB 개입 필요 → "HB 대행 모델"로 전환 검토

### KU3. "반복 업무 → 스킬화 추천" 메커니즘은 실현 가능한가?

**Diagnosis**: R2에서 HB가 제안한 새 아이디어. 실무자가 반복적 task를 수행할 때 "이거 스킬로 만들면 좋겠다"고 감지·추천하는 것. 현재 이런 메커니즘이 존재하지 않음.

**Experiment**:
| Item | Detail |
|------|--------|
| Format | 2주간 HB 본인의 Claude Code 사용 로그에서 "3회 이상 반복된 패턴"을 수동 식별. 그 중 스킬화 가능한 것 목록화 |
| Success criteria | 스킬화 가능 패턴 2개+ 식별 |
| Deadline | Week 5 |
| Effort | Low (관찰 기반) |

**Promotion condition**: 패턴 식별이 쉽고 가치 있으면 → 자동 감지 도구 검토로 진입
**Kill condition**: 패턴이 너무 다양하거나 스킬화 ROI가 낮으면 → 수동 제안으로 충분

### ~~KU4. Anthropic 공식 spec과 우리 _template의 정합성~~ → **KK로 Promote (2026-03-05)**

**결과**: 완전 호환 확인. 우리 _template은 공식 스펙의 **상위집합(superset)**.
- 4개 스킬 모두 name/description/line count 규칙 준수
- `origin` 필드는 공식에 없지만 충돌 아님 (스펙이 추가 필드를 금지하지 않음)
- `license` 필드는 사내 배포 전제이므로 추가하지 않기로 결정
- `_template/SKILL.md`에 name/description 규칙 주석만 추가 완료

---

## 3. Unknown Knowns: Leverage (15%)

> 이미 보유하지만 활용하지 않는 자산. 가장 빠른 승리.

| # | Hidden Asset | How to Use | Effort |
|---|-------------|-----------|--------|
| 1 | **Anthropic skills spec/** | 공식 표준을 읽고 _template과 정합 → KU4 실험으로 연결 | Low |
| 2 | **기존 분석 자산 2건** | `docs/agent-knowledge-layer-known-unknown.md`와 `docs/skill-first-strategy-spec.md`의 KU1-3이 아직 미해결. 이번 분석과 병합하여 중복 제거 | Low |
| 3 | **nda-triage 포크 패턴** | "Anthropic 포크 → frontmatter 수정 → 사내 배포"가 검증됨. skill-creator에도 동일 패턴 적용 가능 (포크가 아닌 래퍼라면 더 가벼움) | Low |
| 4 | **Rollout 4-Phase 프레임** | Phase 1(시연) 진행 중, Phase 2를 skill-creator로 구체화 완료. Phase 3(중앙 레포 축적)의 전제조건이 lint임을 이번에 확인 | N/A |

---

## 4. Unknown Unknowns: Set Up Antennas (5%)

> 예측 불가. 감지 속도 + 대응 능력으로 관리.

| # | Risk/Opportunity | Detection Method | Response Principle |
|---|-----------------|-----------------|-------------------|
| 1 | **Anthropic skill-creator 급변** | anthropics/skills 레포 watch + 릴리스 노트 모니터링 | 래퍼 구조면 코어 교체 용이. 포크했다면 cherry-pick |
| 2 | **사내 보안정책이 AI CLI 제한** | 보안팀 정책 업데이트 채널 구독 | claude.ai 웹 전용 워크플로우를 백업으로 준비 (.skill 번들) |
| 3 | **저품질 스킬의 신뢰 하락** | lint 통과율 + 사용자 피드백 채널 | 품질 하한선(lint 필수 통과) + 문제 스킬 빠른 비활성화 |

---

## Strategic Decision: What to Stop

| Item | Reason | Restart Condition |
|------|--------|------------------|
| **HB 수동 리뷰 게이트키핑** | 병목이 되며, 자동 lint로 대체. "모든 PR을 HB가 리뷰" 모델을 기본으로 설계하지 않음 | lint가 잡지 못하는 품질 이슈가 반복 발생하면 선택적 리뷰 재도입 |
| **skill-creator 내장화 (포크/래퍼 모두)** | 공식 스킬을 그대로 활용하면 충분. 내장화는 업스트림 동기화 부채만 생성. 우리 역할은 "생성 도구"가 아니라 "환경 조성" | 공식 skill-creator가 사내 컨벤션을 구조적으로 지원 불가능할 때만 재검토 |
| **Tier 2(DB) 선행 투자** | Phase 3 동결 상태 유지. Tier 0/1에서 충분한 가치 입증 전까지 DB 인프라 투자 없음 | Tier 1 스킬이 5개+ 되고 references/ 관리가 명확히 한계에 도달할 때 |

---

## Execution Roadmap

### Week 2 (현재)
- [x] KU4: Anthropic 공식 spec/ vs 우리 _template/ 비교 분석 → **KK promote** (완전 호환)
- [ ] 사내 법무팀 데모 (nda-triage, Phase 1)
- [x] UK1: Anthropic skills spec/ 읽기 → KU4에서 완료

### Week 3
- [ ] KU1: skill-reviewer lint 스킬 제작 (Tier 0)
- [ ] _template/ 업데이트 (KU4 결과 반영)
- [ ] skill-creator 활용 가이드 작성 (공식 스킬 사용법 + 사내 컨벤션 체크리스트)

### Week 4
- [ ] KU2: 실무자 1명과 skill-creator 페어 세션
- [ ] lint를 기존 4개 스킬에 적용, 검증
- [ ] PR 생성: skill-creator 래퍼 + lint 스킬

### Month 2
- [ ] KU3: 반복 업무 패턴 관찰 (2주)
- [ ] Phase 2 공식 런칭: 실무자 대상 skill-creator 가이드 배포
- [ ] Review: KU1-4 모두 promote or kill 판정

---

## Core Principles

1. **환경 > 도구**: 생성 도구(skill-creator)는 공식 그대로 사용. 우리는 컨벤션·lint·저장소라는 **토양**만 제공한다
2. **자동 lint > 수동 게이트**: HB가 병목이 되는 품질 관리는 설계하지 않는다. 컨벤션 준수는 자동 검증으로, 사람은 예외 판단에만 개입한다
3. **체험 → 추천 → 자작**: 실무자에게 "스킬을 만들어라"가 아니라 "이 반복 업무를 스킬로 만들면 어떨까?"로 접근한다. 필요성이 체감된 후에 도구를 제공한다
4. **Tier 0 먼저**: 모든 신규 스킬은 Tier 0(SKILL.md only)로 시작. references/나 DB는 한계가 확인된 후에 추가한다
