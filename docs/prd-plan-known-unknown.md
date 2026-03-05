# PRD Plan化: Known/Unknown Quadrant Analysis

> Based on PRD.md + 2-Round 질의 (2026-03-04).
> Designed under the constraint that "ChatGPT 수준 사용자가 채택할 수 있는 속도로 첫 도메인 스킬을 완성하고, 라이브 데모로 증명한다".

---

## Current State Diagnosis

- **첫 타겟 도메인은 법무 NDA 검토**: RA(Rule DB)가 아닌 완전히 새로운 도메인. Rule DB의 23 approved rules는 직접 전환 불가, 설계 원칙만 계승
- **Anthropic nda-triage 스킬이 존재**: "만들기"가 아니라 "포크+커스터마이즈"로 전략 전환. KU2(표준 anatomy) 부분 해소
- **NDA 규칙 원문은 혼재 상태**: 표준 NDA 양식은 있으나 판단 기준은 법무팀원의 경험(암묵지). PRD가 해결하려는 문제의 정확한 사례
- **사용자는 ChatGPT 수준**: CLI/Markdown 미경험. "실무자가 직접 SKILL.md 작성"이라는 PRD 전제가 단기적으로 비현실적
- **가장 큰 공포는 품질 붕괴**: 실무자 작성 스킬의 품질이 낮아 신뢰도 하락 → Rule DB와 같은 미사용 상태
- **라이브 데모가 채택의 관문**: NDA 조항 위험도 자동 판단으로 "와우 모먼트" 생성 계획
- **What to stop doing**: 이 단계에서 Rule DB Phase 3 재개 논의, Tier 2 설계, 복수 도메인 동시 진행

---

## Quadrant Matrix

```
                    Known                          Unknown
         +---------------------------+---------------------------+
         |                           |                           |
         |   KK: Systematize         |   KU: Design Experiments  |
 Known   |   Resources: 35%          |   Resources: 35%          |
         |                           |                           |
         +---------------------------+---------------------------+
         |                           |                           |
         |   UK: Leverage            |   UU: Set Up Antennas     |
 Unknown |   Resources: 20%          |   Resources: 10%          |
         |                           |                           |
         +---------------------------+---------------------------+
```

Resource 비율 조정 근거: 탐색+실행 병행 단계. KU가 높은 이유는 NDA 도메인이 완전히 새로운 영역이고 사용자 역량 갭이 존재하기 때문. UK를 20%로 올린 이유는 nda-triage 포크라는 발견이 가장 빠른 수확이므로.

---

## 1. Known Knowns: Systematize (35%)

> R1/R2에서 확인된 사실. 반복 가능한 시스템으로 전환.

| # | Item | Evidence | Systemization Target |
|---|------|----------|---------------------|
| 1 | **nda-triage 스킬 패턴이 검증됨** | Anthropic 공식 knowledge-work-plugins에 GREEN/YELLOW/RED 분류 + 10개 검토 기준 + 라우팅 테이블 구조 존재 | 포크 후 내부 NDA 규칙으로 커스터마이즈 |
| 2 | **라이브 데모 시나리오 확정** | R2에서 "NDA 조항 위험도 자동 판단" 선택 | 데모 스크립트 + 샘플 NDA 문서 준비 |
| 3 | **k-sunshine 판단형 패턴 재사용 가능** | 4-step Decision Framework(주체 분류→활동 매핑→임계값→판정)가 nda-triage의 10-criteria 스크리닝과 구조적으로 동일 | Skill 작성 시 k-sunshine 참조 패턴으로 활용 |
| 4 | **Rule DB 설계 원칙 4개는 형태 불문 필수** | 원문만/요약금지/scope필수/충돌명시 — 기존 분석에서 확인 | NDA 스킬에도 동일 원칙 적용 (references/에 원문 수록) |
| 5 | **"채택 > 완성도" 원칙 재확인** | Rule DB 실패 + R1에서 품질 붕괴 공포 = 동일 패턴 반복 가능성 인지 | 반나절 완성 원칙 유지, 완벽 추구 금지 |

---

## 2. Known Unknowns: Design Experiments (35%)

> 답이 없는 질문. 각각 최소 실험을 설계.

### KU1. NDA 암묵지를 어떻게 references/로 추출하는가?

**Diagnosis**: NDA 판단 기준이 "법무팀원의 경험"에 존재. 문서화된 표준 양식은 있으나, "이 조항은 위험하다"는 판단 기준은 암묵지. nda-triage의 10개 기준은 일반적이고, 내부 맥락(거래 유형, 산업 특성, 과거 분쟁 사례)은 별도 추출 필요.

**Experiment**:
| Item | Detail |
|------|--------|
| Format | 법무팀원과 1회 인터뷰(60분). nda-triage의 10개 기준을 체크리스트로 활용하며, 각 기준에 "우리 회사에서는 어떻게 판단하나?"를 기록. 결과를 references/로 구조화 |
| Success criteria | (1) references/에 10개 기준 중 최소 7개가 내부 맥락으로 커스터마이즈됨 (2) Agent가 references/만 보고 샘플 NDA를 올바르게 분류 |
| Deadline | Week 2 내 |
| Effort | 인터뷰 1시간 + 정리 2시간 |

**Promotion condition**: 인터뷰 1회로 80% 이상의 판단 기준이 명시화되면 → 이 방법을 다른 도메인에도 적용
**Kill condition**: 법무팀원이 "경우에 따라 다르다"를 반복하여 규칙 추출이 불가능하면 → 사례 기반 접근(과거 NDA 검토 이력 분석)으로 전환

### KU2. ChatGPT 수준 사용자가 Skill 생태계에 참여할 수 있는가?

**Diagnosis**: PRD는 "실무자 직접 작성"을 전제하지만, 대상이 ChatGPT 수준. Markdown/CLI 미경험자에게 SKILL.md 작성은 비현실적. 그러나 Skill "사용"과 "작성"은 다른 역량.

**Experiment**:
| Item | Detail |
|------|--------|
| Format | Phase 1에서 사용 경험만 우선. 라이브 데모 후 2주간 "NDA 스킬 사용"만 추적. "작성"은 Phase 2 이후로 지연. 사용 패턴에서 "이 부분이 틀렸다/부족하다" 피드백 수집 |
| Success criteria | 2주 내 NDA 스킬 사용자가 2명 이상 + 실질적 피드백 3개 이상 |
| Deadline | 데모 후 2주 |
| Effort | Low (피드백 수집만) |

**Promotion condition**: 사용자가 자발적으로 "이 규칙 추가해주세요" 요청 → 참여 의지 확인 → Phase 2(가이드) 진행
**Kill condition**: 2주 내 사용 0 또는 "필요 없다" 피드백 → 채택 전략 재설계 (Rule DB 재현)

### KU3. 라이브 데모가 실제로 채택으로 이어지는가?

**Diagnosis**: Rule DB도 기술적으로는 시연 가능했지만 채택 실패. "와우"와 "일상 도구"는 다른 차원. 데모 후 "멋지네요" → 실제 사용 0이 가장 위험한 시나리오.

**Experiment**:
| Item | Detail |
|------|--------|
| Format | 데모 직후 "다음 주에 실제 NDA 들어오면 이 스킬로 검토해보겠다"는 구체적 약속 받기. 약속한 사람 수 기록 |
| Success criteria | 데모 참석자 중 50% 이상이 "다음 NDA에 사용해보겠다" 약속 |
| Deadline | 데모 당일 |
| Effort | Low (질문 하나) |

**Promotion condition**: 약속자 중 50% 이상이 실제로 사용하면 → 데모 전략 유효
**Kill condition**: 약속자 중 80% 이상이 미사용 → 데모가 아닌 "실무자 업무에 직접 투입" 전략으로 전환

---

## 3. Unknown Knowns: Leverage (20%)

> 이미 보유하지만 활용하지 못하는 자산. 가장 빠른 수확.

| # | Hidden Asset | How to Use | Effort |
|---|-------------|-----------|--------|
| 1 | **Anthropic nda-triage 스킬** | 포크하여 내부 NDA 규칙으로 커스터마이즈. 처음부터 만들 필요 없음 — 검증된 구조(10 criteria + GREEN/YELLOW/RED)를 그대로 활용 | **High-priority** |
| 2 | **Anthropic knowledge-work-plugins 전체** | legal/ 디렉토리에 contract-review, compliance, legal-risk-assessment 등 6개 스킬 존재. NDA 이후 확장 시 참조 | Low |
| 3 | **기존 KU 분석 문서** | `docs/agent-knowledge-layer-known-unknown.md`에 전략 수준 분석이 이미 완성. 이 문서와 현재 문서를 함께 참조하면 전략↔실행 갭 최소화 | Low |
| 4 | **agent-council = 스킬 QA 도구** | NDA 스킬 초안 완성 후 council에 "이 스킬이 NDA를 정확히 분류하는가?" 검증 요청. 품질 붕괴 공포에 대한 안전장치 | Med |
| 5 | **k-sunshine의 Decision Framework** | NDA 스킬의 판단 흐름(조항 분류→기준 매칭→위험도 판정)이 k-sunshine(주체 분류→활동 매핑→임계값→판정)과 동형. 패턴 복사 가능 | Low |

---

## 4. Unknown Unknowns: Set Up Antennas (10%)

> 예측 불가. 탐지 속도 + 대응으로 관리.

| # | Risk/Opportunity | Detection Method | Response Principle |
|---|-----------------|-----------------|-------------------|
| 1 | **법무팀의 저항** — "AI가 법적 판단을 하면 안 된다"는 반발 | 데모 시 표정/반응 관찰. "보조 도구"로 프레이밍했는데도 불편해하는지 | "판단"이 아닌 "초기 분류(triage)"로 프레이밍. 최종 판단은 항상 사람 |
| 2 | **NDA 유형의 다양성** — 내부 NDA 유형이 10개 기준으로 커버되지 않는 특수 케이스 존재 | 첫 5건 사용 후 "이 NDA는 분류가 안 됐다" 사례 수 확인 | 특수 케이스는 즉시 references/에 추가. 스킬이 점진적으로 성장하는 패턴 확립 |
| 3 | **보안/컴플라이언스 이슈** — NDA 원문을 Claude Code에 넣는 것에 대한 보안 우려 | IT/보안팀 사전 확인 필요. 데모 전에 클리어런스 받기 | 민감 정보 마스킹 옵션 또는 로컬 전용 모드 확인. 데이터 처리 정책 사전 정리 |
| 4 | **"Markdown만으로 충분한가?" 조기 도달** — NDA 규칙이 예상보다 복잡하여 KU3(충돌 해소) 한계에 빨리 도달 | 첫 10건 처리 후 Agent 오분류율 측정 | 오분류율 10% 초과 시 → 규칙 구조화 방식 재검토 (rules.yaml 도입 고려) |

---

## Strategic Decision: What to Stop

| Item | Reason | Restart Condition |
|------|--------|------------------|
| **"실무자 직접 작성" 단기 목표** | ChatGPT 수준 사용자에게 SKILL.md 작성은 비현실적. 사용 경험이 먼저 | KU2 실험에서 자발적 피드백/수정 요청이 발생할 때 |
| **복수 도메인 동시 진행** | NDA 하나에 집중하여 패턴을 검증한 뒤 확장 | NDA 스킬이 2주 이상 실사용되고 패턴이 확인될 때 |
| **Tier 2 설계 논의** | 현재는 Tier 0 (NDA 스킬 + references/) 검증이 우선 | KU1에서 상태 관리가 Skill만으로 불가능하다고 판정될 때 |
| **완벽한 스킬 작성 가이드** | 사용자가 없는데 가이드를 만드는 것은 Rule DB 재현 | NDA 스킬 사용자 3명+ 달성 후 |

---

## Execution Roadmap

### Week 1: NDA 스킬 포크 + 커스터마이즈
- [ ] Anthropic nda-triage 스킬 포크 → `skills/nda-triage/`
- [ ] 법무팀원 인터뷰 1회 (60분): 10개 기준별 내부 판단 규칙 추출
- [ ] 인터뷰 결과 → `references/` 구조화 (내부 NDA 맥락 반영)
- [ ] IT/보안팀에 NDA 원문 AI 처리 가능 여부 사전 확인
- [ ] 샘플 NDA 3건으로 GREEN/YELLOW/RED 분류 테스트

### Week 2: 데모 준비 + 리허설
- [ ] 라이브 데모 스크립트 작성 (NDA 위험도 자동 판단 시나리오)
- [ ] agent-council로 NDA 스킬 QA 검증
- [ ] 데모 리허설 1회 (edge case 확인)
- [ ] 팀 미팅 라이브 데모 실행
- [ ] 데모 후 "다음 NDA에 사용해보겠다" 약속 수집

### Week 3-4: 실사용 추적 + KU 판정 시작
- [ ] NDA 스킬 실사용 추적 (사용자 수, 사용 빈도, 피드백)
- [ ] 첫 5건 처리 후 오분류율 측정 (KU3 실험)
- [ ] 사용자 피드백 기반 references/ 업데이트 (암묵지 추가 추출)
- [ ] KU1 실험: references/ 파일 변경 시 Agent 인용 갱신 속도 측정

### Month 2: 판정 + 확장 여부 결정
- [ ] KU1 판정: 상태 관리 방식 promote/kill
- [ ] KU2 판정: ChatGPT 사용자 참여 가능성 promote/kill
- [ ] KU3 판정: 데모→채택 전환율 promote/kill
- [ ] NDA 스킬 사용자 3명+ 달성 여부 확인
- [ ] 달성 시 → 두 번째 도메인 선정 (knowledge-work-plugins 참조)
- [ ] 미달성 시 → 채택 실패 원인 분석 + 전략 재설계

---

## Core Principles

1. **포크 > 창조**: 처음부터 만들지 않는다. 검증된 구조(nda-triage)를 포크하고 내부 맥락만 커스터마이즈한다. 이것이 "채택 > 완성도"의 실천적 형태.
2. **사용 먼저, 작성은 나중**: ChatGPT 수준 사용자에게 작성을 요구하기 전에, 사용 경험으로 가치를 증명한다. 피드백이 자발적으로 나오면 그때 작성 참여를 유도.
3. **데모 ≠ 채택**: 라이브 데모의 "와우"가 일상 사용으로 이어지려면, 데모 직후 구체적 약속(commitment)을 받아야 한다. "멋지네요"는 채택이 아니다.
4. **암묵지는 인터뷰로 추출, 문서로 고정**: 법무팀원의 경험을 references/로 구조화하는 것이 이 프로젝트의 핵심 활동. 1회 인터뷰로 80%를 추출하고, 나머지는 사용 중 점진적으로 축적.
5. **1도메인 1스킬 집중**: NDA 하나를 끝까지 검증한 뒤에야 다음 도메인으로 이동. 동시 진행은 과잉 설계의 시작.
