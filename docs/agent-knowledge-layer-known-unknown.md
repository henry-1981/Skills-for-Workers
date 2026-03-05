# Agent 지식 레이어 전략: Known/Unknown Quadrant Analysis

> Based on Agent-DB CLAUDE.md + Skills-for-Workers 전체 탐색 + 3-Round 질의.
> Designed under the constraint that "Rule DB의 엄밀함(원문 인용·충돌 해소·상태 관리)은 포기할 수 없되, 다른 직무 도메인으로의 확장 속도가 우선이다".

---

## Current State Diagnosis

- **Rule DB는 기술적으로 완성되었으나 실무 사용이 0이다**: 280 tests, 23 approved rules, 6-state lifecycle, Ingestion Phase 2 — 그러나 실무자도 Agent도 retrieve.py를 호출한 적 없음. 전형적인 "Build it and they will come" 신호.
- **Skill 패턴은 이미 증명되었다**: k-sunshine(규제 판단), human-writing(텍스트 변환), agent-council(다관점 합성) — 3개 모두 production-ready. 즉시 설치·사용 가능.
- **전환 동기는 ROI + 확장**: Rule DB의 RA 도메인 종속성이 병목. Skill 패턴은 도메인 자유로움.
- **핵심 긴장**: DB의 엄밀함 전부를 요구하면서 + Skill의 속도를 원함. "DB vs Skill"이 아니라 **"DB 수준의 엄밀함을 Skill 형태로 패키징하는 방법"**이 진짜 질문.
- **What to stop doing**: Rule DB 신규 기능 개발 (Phase 3 일시 정지)

---

## Quadrant Matrix

```
                    Known                          Unknown
         +---------------------------+---------------------------+
         |                           |                           |
         |   KK: Systematize         |   KU: Design Experiments  |
 Known   |   Resources: 40%          |   Resources: 35%          |
         |                           |                           |
         +---------------------------+---------------------------+
         |                           |                           |
         |   UK: Leverage            |   UU: Set Up Antennas     |
 Unknown |   Resources: 15%          |   Resources: 10%          |
         |                           |                           |
         +---------------------------+---------------------------+
```

Resource 비율 조정 근거: 탐색 단계이므로 KU(실험)에 35% 배분. KK를 40%로 낮추고 UU를 10%로 올림.

---

## 1. Known Knowns: Systematize (40%)

> 확인된 사실. 반복 가능한 시스템으로 전환.

| # | Item | Evidence | Systemization Target |
|---|------|----------|---------------------|
| 1 | **Skill 패턴은 도메인 지식 전달에 충분하다** | k-sunshine: 규약 원문 + 판단 프레임워크를 SKILL.md + references/로 구현. 실제 사용 중 | `_template/` 기반 도메인 규칙 스킬 생성 가이드 |
| 2 | **Rule DB의 3대 원칙은 형태와 무관하게 필수** | R2에서 "전부 중요" 확인: 원문 인용 강제, 규칙 충돌 해소, 상태 라이프사이클 | 어떤 형태(skill/DB/hybrid)든 이 3가지를 충족하는지 검증 체크리스트 |
| 3 | **확장 방향은 RA 밖 다른 직무 도메인** | R2에서 "다른 직무 도메인" 명시 + R3에서 "구체적 타겟 있음" 확인 | 첫 타겟 도메인으로 파일럿 실행 |
| 4 | **Rule DB의 설계 결정들은 그 자체로 재사용 가능한 지식** | 6 필수 필드 선정 근거, 의도적으로 뺀 것(keywords, summary, related_rules)의 이유 | Skill 설계 원칙 문서로 추출 |
| 5 | **Rule DB는 미사용이지만 파괴하면 안 됨** | 23 approved rules + 5 relations = RA 도메인의 검증된 지식 자산 | 동결(freeze), 삭제 아님 |

---

## 2. Known Unknowns: Design Experiments (35%)

> 답이 없는 질문. 각각 실험을 설계.

### KU1. Skill 형태에서 상태 관리(변경 추적, 폐지 감지)를 어떻게 해결하는가?

**Diagnosis**: Rule DB의 6-state lifecycle(draft→verified→approved→suspended→superseded)은 Python 코드로 구현됨. 순수 마크다운 skill에서 이를 대체할 메커니즘이 불명확. R3에서 "아직 모르겠다" 확인 — 가장 큰 미지수.

**Experiment**:
| Item | Detail |
|------|--------|
| Format | 3가지 방식 중 하나를 첫 타겟 도메인에 적용: **(A)** references/ 파일에 frontmatter(version, effective_date, status) + git history로 추적, **(B)** skill 내부 경량 rules.yaml (Rule DB 축소판), **(C)** MCP 서버로 상태 관리 외부화 |
| Success criteria | 규칙 변경 시 skill 사용자(Agent)가 폐지된 규칙을 인용하는 사고가 0건 |
| Deadline | 첫 타겟 도메인 파일럿 완료 후 2주 내 판정 |
| Effort | 각 방식 POC 1-2일 |

**Promotion condition**: 한 방식이 "규칙 변경 → Agent 인용 갱신"까지 24시간 이내 반영 + 수동 개입 최소화
**Kill condition**: 어떤 방식도 규칙 변경 추적을 자동화할 수 없으면 → Rule DB를 skill의 백엔드로 채택 (hybrid 전환)

### KU2. 도메인 규칙 스킬의 올바른 anatomy는 무엇인가?

**Diagnosis**: 현재 3개 스킬은 각각 다른 패턴 — k-sunshine(판단 프레임워크), human-writing(변환 파이프라인), agent-council(오케스트레이션). "도메인 의사결정 규칙"을 skill화하는 표준 패턴은 아직 없음.

**Experiment**:
| Item | Detail |
|------|--------|
| Format | 첫 타겟 도메인으로 SKILL.md 작성. k-sunshine의 구조를 기반으로 하되, Rule DB의 설계 원칙(원문만, 요약 금지, scope 필수, authority 명시)을 skill conventions으로 인코딩 |
| Success criteria | (1) Agent가 SKILL.md만 읽고 도메인 규칙을 정확히 인용할 수 있음 (2) 새 도메인 추가 시 SKILL.md 작성에 반나절 이하 |
| Deadline | 2주 |
| Effort | 3-5일 (도메인 전문가 인터뷰 + 규칙 정리 + SKILL.md 작성) |

**Promotion condition**: 두 번째 도메인에도 같은 패턴 적용 시 작성 시간 50% 이하
**Kill condition**: 도메인마다 구조가 너무 달라서 표준 패턴이 무의미하면 → 패턴 대신 가이드라인 수준으로 후퇴

### KU3. references/ 내 규칙 원문만으로 충돌 해소가 가능한가?

**Diagnosis**: Rule DB에서는 Relation 스키마(overrides, excepts, unresolved)로 규칙 간 우선순위를 명시화. Skill에서는 Decision Framework 섹션이 이 역할을 해야 하는데, 규칙 수가 많아지면 markdown 문서의 한계에 부딪힐 수 있음.

**Experiment**:
| Item | Detail |
|------|--------|
| Format | 첫 타겟 도메인의 규칙 충돌 사례 3개를 식별. SKILL.md Decision Framework 섹션에 overrides/exceptions를 자연어로 기술. Agent에게 충돌 상황 질의 후 정확도 측정 |
| Success criteria | 3개 충돌 사례 중 Agent 정답률 100% (규칙 수 < 30 기준) |
| Deadline | KU2 완료 후 1주 |
| Effort | 2-3일 |

**Promotion condition**: 규칙 50개 이하 도메인에서 markdown Decision Framework가 충분하면 → 이 패턴 표준화
**Kill condition**: 규칙 30개 이상에서 충돌 해소 실패율 > 10% → Rule DB의 Relation 모델을 skill에 내장 (rules.yaml 방식)

---

## 3. Unknown Knowns: Leverage (15%)

> 이미 보유하지만 활용하지 못하는 자산. 가장 빠른 수확.

| # | Hidden Asset | How to Use | Effort |
|---|-------------|-----------|--------|
| 1 | **Rule DB의 설계 결정 문서** | 6 필수 필드 선정 근거, "의도적으로 뺀 것" 목록 → Skill 설계 원칙 문서로 추출. 새 도메인 skill 작성자가 같은 함정을 밟지 않게 함 | Low |
| 2 | **k-sunshine의 Decision Framework 패턴** | 4-step 판단 프레임워크(주체 분류→활동 매핑→임계값 확인→판정)는 다른 규제/규칙 도메인에도 일반화 가능. 템플릿화 | Low |
| 3 | **agent-council의 다관점 검증** | 새 도메인 skill 초안 작성 후 council에 "이 skill이 도메인 규칙을 정확히 전달하는가?" 검증 요청. 자체 QA 도구로 활용 | Low |
| 4 | **Rule DB의 23개 approved rules** | RA 도메인의 첫 번째 skill을 만들 때, 이미 정제된 원문+scope+authority를 그대로 references/로 변환 가능. 원천 정규화 작업이 이미 끝남 | Med |
| 5 | **_template/SKILL.md** | 이미 존재하는 스킬 생성 템플릿. 도메인 규칙 스킬 전용 섹션(Authority Levels, Conflict Resolution, Source References)만 추가하면 됨 | Low |

---

## 4. Unknown Unknowns: Set Up Antennas (10%)

> 예측 불가. 탐지 속도 + 대응 속도로 관리.

| # | Risk/Opportunity | Detection Method | Response Principle |
|---|-----------------|-----------------|-------------------|
| 1 | **플랫폼 생태계 급변** — Claude Code skills, MCP 서버 등의 plugin 아키텍처가 빠르게 진화하면 현재 SKILL.md + references/ 패턴이 구식이 될 수 있음 | Claude Code 릴리스 노트 월 1회 확인. MCP 생태계 동향 모니터 | Skill의 핵심은 "도메인 지식 구조화"이지 "파일 포맷"이 아님. 포맷은 변해도 구조화된 지식은 마이그레이션 가능 |
| 2 | **팀 채택 실패** — Rule DB처럼 skill도 "만들었지만 안 쓰이는" 상태가 될 수 있음 | 첫 타겟 도메인 파일럿 후 2주 내 실사용 여부 확인. 사용 0이면 즉시 원인 분석 | **사용자와 함께 만든다**. HB 혼자 완성한 뒤 전달하는 게 아니라, 도메인 실무자가 작성에 참여 |
| 3 | **규제 변경 속도** — 일부 도메인은 규칙 변경이 빈번해서 markdown 수동 업데이트로 감당 불가 | 파일럿 도메인의 규칙 변경 빈도 측정 (월 N건). 월 5건 이상이면 자동화 필요 신호 | 빈도 높은 도메인 → Rule DB를 백엔드로 채택 (hybrid). 빈도 낮은 도메인 → 순수 skill 유지 |
| 4 | **외부 수요** — 다른 조직/팀에서 skill 패턴을 원하면 Skills-for-Workers의 scope가 확장됨 | GitHub stars, fork 수, issue 요청 모니터 | 수요 발생 시 "도메인 규칙 skill 작성 가이드" 문서를 우선 제공. 코드가 아니라 패턴을 공유 |

---

## Strategic Decision: What to Stop

| Item | Reason | Restart Condition |
|------|--------|------------------|
| **Rule DB Phase 3 (Ingestion Pipeline 고도화)** | 실사용 0인 시스템에 추가 투자는 과잉 설계 가속. Ingestion Phase 2에서 동결 | Skill이 Rule DB를 백엔드로 필요로 하는 도메인이 확인될 때 (KU1 Kill condition 발동 시) |
| **Rule DB 신규 기능 개발** | 현재 기능(gate1/gate2/retrieve/cascade)은 충분. 23 approved rules는 보존 | 첫 skill 파일럿에서 "이 기능이 없으면 안 됨"이 증명될 때 |
| **Rule DB 중심의 아키텍처 사고** | "문서→정규화→DB→API→Agent" 파이프라인은 RA 도메인 최적화. 범용이 아님 | RA 도메인 skill이 Rule DB를 실제로 소비하기 시작할 때 |

---

## Execution Roadmap

### Week 1-2: 기반 정리 + 첫 파일럿 시작
- [ ] Rule DB 설계 원칙을 Skill 설계 원칙 문서로 추출 (UK#1)
- [ ] k-sunshine Decision Framework를 도메인 규칙 스킬 템플릿으로 일반화 (UK#2)
- [ ] `_template/SKILL.md`에 도메인 규칙 전용 섹션 추가 (UK#5)
- [ ] 첫 타겟 도메인 규칙 수집 시작 (KU2 실험)

### Week 3-4: 첫 도메인 스킬 완성 + 충돌 해소 검증
- [ ] 첫 타겟 도메인 SKILL.md + references/ 작성 (KU2)
- [ ] agent-council로 skill 품질 검증 (UK#3)
- [ ] 충돌 사례 3개에 대한 Agent 정답률 측정 (KU3)
- [ ] 상태 관리 방식 (A/B/C) 중 하나 선택하여 POC (KU1)

### Month 2: 검증 + 판정
- [ ] 첫 도메인 skill 실무 투입 — 실사용 여부 2주 내 확인
- [ ] KU1 판정: 상태 관리 방식 promote or kill
- [ ] KU2 판정: 도메인 규칙 skill anatomy 표준화 가능 여부
- [ ] KU3 판정: markdown 충돌 해소의 규칙 수 한계선 확인
- [ ] 판정 결과에 따라 Rule DB 재시작 여부 결정

### Month 3: 확장 또는 Hybrid 전환
- [ ] 두 번째 도메인 적용 (패턴 재사용성 검증)
- [ ] 규칙 변경 빈도 측정 결과에 따른 hybrid 판단
- [ ] Skills-for-Workers README 업데이트 — 도메인 규칙 스킬 카탈로그 반영

---

## Core Principles

1. **Skill is the interface, DB is optional infrastructure**: 모든 도메인 지식의 1차 형태는 skill(SKILL.md + references/)이다. Rule DB는 규칙 수가 많거나 변경이 빈번한 도메인에서만 백엔드로 채택한다.
2. **원문 없는 판단은 없다 (No text, no citation)**: Rule DB에서 배운 가장 중요한 교훈. Skill이든 DB이든, Agent가 인용할 수 있는 원문이 없으면 환각이 시작된다. references/에 반드시 원문을 포함한다.
3. **채택이 완성도를 이긴다 (Adoption > Completeness)**: 280 tests짜리 미사용 시스템보다 반나절 만에 만든 실사용 skill이 더 가치 있다. 과잉 설계의 유혹을 경계한다.
4. **실험하고 판정하라 (Experiment, then judge)**: 불확실한 것(KU)에 대해 설계 논쟁하지 말고, 최소 실험으로 데이터를 만든 뒤 promote/kill 판정한다.
5. **Stop이 Start보다 어렵다**: Rule DB Phase 3 동결은 감정적으로 어렵지만 전략적으로 필수. 재시작 조건을 명확히 걸어두고 멈춘다.
