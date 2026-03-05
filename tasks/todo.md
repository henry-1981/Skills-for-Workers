# Execution Roadmap

> Source: `docs/council-quadrant-analysis.md`
> 실행 순서: W6 → 스크립트 린터 → 보안 규칙 → CLI 도우미

## Week 2 (현재)

- [x] skill-lint 구현 (12 규칙, 5/5 PASS)
- [x] PR #6 생성
- [x] W6 origin empty WARN 규칙 추가 (SKILL.md + rules-detail.md)
- [ ] 사내 법무팀 NDA 데모 준비

## Week 3-4

- [ ] KU1: SKILL.md → lint 스크립트 생성기 설계
  - [ ] F1-F5 FAIL 규칙 스크립트화 (우선)
  - [ ] WARN/INFO는 프롬프트 린터에 위임 (Phase 1에서는 미구현)
  - [ ] GitHub Actions workflow 작성
- [ ] W7 보안 규칙 추가 (references/ 내 패턴 매칭: email, API key, 금액 등)

## Month 2

- [ ] KU2: install.sh 제작 (사용자 확보 후)
- [ ] KU1 promote/kill 판정
- [ ] skill-creator 활용 가이드 작성

## Stopped (재시작 조건 포함)

| Item | Restart Condition |
|------|------------------|
| 보안 규칙 긴급 구현 | 실무자가 내부 문서를 references/에 투입 시도 관측 |
| CLI 도우미 선행 개발 | 비개발 사용자 2명+ symlink 설정 실패 |
