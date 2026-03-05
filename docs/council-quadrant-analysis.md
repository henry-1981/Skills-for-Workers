# Council 권고 4항목: Known/Unknown Quadrant Analysis

> Based on: Agent Council 평가 (Codex critic + Gemini strategist) + R1/R2 인터뷰
> Constraint: "HB 병목 X, Tier 0 순수 마크다운 우선, 환경 조성에 집중"
> 실행 순서 확정 (R2): W6 → 스크립트 린터 → 보안 규칙 → CLI 도우미

---

## Current State Diagnosis

- **skill-lint 구현 완료**: 12개 규칙, 5/5 PASS 검증. KU1 → KK promote
- **CI 부재**: Codex가 지적한 "자동화 표방 vs 수동 트리거" 괴리는 유효하나, 스킬 5개 + 기여자 1명 규모에서는 과잉 가능
- **보안 위험은 낮음**: references/에는 공개 규정/프레임워크만 투입 예정. 실제 문서는 별도 채널 전달
- **비개발자가 대상 사용자**: CLI 도우미는 향후 필요하나, 현재 사용자가 없으므로 YAGNI 영역
- **스크립트 동기화가 핵심 KU**: "SKILL.md → 스크립트 자동 생성" 완전 동기화 선택. 가장 복잡한 기술 과제
- **What to stop doing**: 사용자가 없는 상태에서 배포 도구 과잉 설계

---

## Quadrant Matrix

```
                    Known                          Unknown
         +---------------------------+---------------------------+
         |                           |                           |
         |   KK: Just Do It          |   KU: Design Experiments  |
 Known   |   Resources: 60%          |   Resources: 25%          |
         |                           |                           |
         | 1. W6 origin empty 규칙   | 1. SKILL.md→스크립트      |
         | 2. 실행순서 확정           |    완전 동기화 방법        |
         | 3. 보안 위험 = 낮음        | 2. 비개발자 CLI 형태      |
         | 4. FAIL 5규칙 검증 완료    |                           |
         +---------------------------+---------------------------+
         |                           |                           |
         |   UK: Leverage            |   UU: Set Up Antennas     |
 Unknown |   Resources: 10%          |   Resources: 5%           |
         |                           |                           |
         | 1. SKILL.md 규칙 테이블이 | 1. Anthropic skill registry|
         |    이미 파싱 가능한 구조   | 2. 비개발자 CLI 수용도    |
         | 2. .gitignore + PR리뷰    |                           |
         |    = 충분한 보안 가드      |                           |
         +---------------------------+---------------------------+
```

---

## 1. Known Knowns: Systematize (60%)

| # | Item | Evidence | Action |
|---|------|----------|--------|
| 1 | **W6 origin empty 규칙** | F5는 존재 체크만, `origin: ""`도 PASS | SKILL.md에 W6 추가 + rules-detail.md 보강 |
| 2 | **실행 순서** | R2에서 확정: W6→스크립트→보안→CLI | 이 순서대로 진행 |
| 3 | **보안 위험 낮음** | R2: references/는 공개 규정만. .gitignore가 secrets 필터링 중 | 보안 규칙은 후순위로 밀림 |
| 4 | **FAIL 5규칙 기반** | 5개 스킬 전부 PASS 검증 완료 | 스크립트화 시 F1-F5부터 구현 |

---

## 2. Known Unknowns: Design Experiments (25%)

### KU1. SKILL.md → lint 스크립트 완전 동기화

**Diagnosis**: HB가 "완전 동기화"를 선택함. SKILL.md가 규칙의 SSOT이고 스크립트는 자동 생성. 가장 높은 복잡도.

**Experiment**:
| Item | Detail |
|------|--------|
| Format | SKILL.md의 Lint Rules 테이블을 파싱해 lint.sh 또는 lint.py를 생성하는 generator 스크립트 제작 |
| 대안 | SKILL.md를 SSOT으로 두되, 스크립트는 수동 동기화 (규칙 변경 시 양쪽 수정) — 복잡도 ↓ but drift 위험 ↑ |
| Success criteria | `generate-lint.py SKILL.md > lint.sh` 실행 → 5개 스킬 결과가 프롬프트 린터와 동일 |
| Deadline | Week 3-4 |
| Effort | High (파서 + 코드 생성기) |

**Promotion condition**: 생성된 lint.sh가 GitHub Actions에서 PR 체크로 동작
**Kill condition**: SKILL.md 파싱이 지나치게 복잡하거나, 규칙 변경 시 생성기 수정 비용이 수동 동기화보다 높음

### KU2. 비개발자용 설치 CLI 형태

**Diagnosis**: 대상은 비개발 실무자. 하지만 현재 사용자가 HB만이므로 니즈가 가설 상태.

**Experiment**:
| Item | Detail |
|------|--------|
| Format | `install.sh` 원라인 스크립트 (`curl ... \| bash` 또는 `bash <(curl ...)`) |
| Success criteria | 비개발자 1명이 README만 보고 5분 내 설치 완료 |
| Deadline | Month 2 (사용자가 생긴 후) |
| Effort | Low (shell script) |

**Promotion condition**: 실무자 2명 이상이 설치 성공
**Kill condition**: 대상 사용자가 CLI 자체를 거부 (웹 UI나 다른 경로 필요)

---

## 3. Unknown Knowns: Leverage (10%)

| # | Hidden Asset | How to Use | Effort |
|---|-------------|-----------|--------|
| 1 | **SKILL.md Lint Rules 테이블** | Markdown 테이블은 이미 정형화된 구조 (`\| ID \| Rule \| Check \|`). 정규식으로 파싱 가능 — 완전 동기화의 기반 | Low |
| 2 | **.gitignore + PR 리뷰** | 이미 `.env`, `*.pem` 등 필터링 중. 보안 규칙의 긴급성을 낮춰주는 기존 방어막 | N/A (이미 활성) |

---

## 4. Unknown Unknowns: Set Up Antennas (5%)

| # | Risk/Opportunity | Detection Method | Response Principle |
|---|-----------------|-----------------|-------------------|
| 1 | **Anthropic 공식 skill registry** | agentskills.io 변경, Anthropic blog 모니터링 | registry 호환 형태로 전환 (Spec 상위집합이라 리스크 낮음) |
| 2 | **비개발자 CLI 완전 거부** | 설치 CLI 제공 후 사용률 0% | 웹 기반 대안 (GitHub Codespaces, .skill 번들) 검토 |

---

## Strategic Decision: What to Stop

| Item | Reason | Restart Condition |
|------|--------|------------------|
| **보안 규칙 긴급 구현** | R2에서 "낮은 위험" 확인. references/에 민감 정보 유입 경로 자체가 없음 | 실무자가 실제 내부 문서를 references/에 넣으려는 시도가 관측될 때 |
| **CLI 도우미 선행 개발** | 사용자 0명 상태에서 배포 도구 제작은 YAGNI | 비개발 사용자가 2명 이상 symlink 설정에 실패할 때 |

---

## Execution Roadmap

### Week 2
- [x] skill-lint 구현 + PR #6 생성
- [ ] W6 origin empty WARN 규칙 추가 (SKILL.md + rules-detail.md)
- [ ] 사내 법무팀 NDA 데모 준비

### Week 3-4
- [ ] KU1 실험: SKILL.md → lint 스크립트 생성기 설계
  - F1-F5 FAIL 규칙 우선 스크립트화 (WARN/INFO는 프롬프트 린터에 위임)
  - GitHub Actions workflow 작성
- [ ] 보안 규칙 W7 추가 (references/ 내 패턴 매칭: email, API key, 금액 등)

### Month 2
- [ ] KU2: 사용자 확보 후 install.sh 제작
- [ ] Review: KU1 promote/kill 판정
- [ ] skill-creator 활용 가이드 작성

---

## Core Principles

1. **SSOT = SKILL.md**: 규칙의 원본은 항상 SKILL.md. 스크립트는 파생물
2. **YAGNI 엄수**: 사용자가 없으면 도구를 만들지 않는다. 니즈가 관측된 후 대응
3. **Progressive automation**: 수동 → 프롬프트 린터 → 스크립트 린터 → CI 순서로 자동화 수준을 올린다
