---
name: test-presentation
description: >
  Presentation 스킬 e2e 테스트. 랜덤 시나리오 생성 → 스킬 실행 → 구조/품질 채점.
  Triggers: test-presentation, e2e test, 프레젠테이션 테스트
origin: internal — presentation e2e test automation
---

# /test-presentation

Presentation 스킬의 전체 유저 저니를 랜덤 시나리오로 자동 검증한다.

## Trigger

```
/test-presentation [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--count N` | N건 배치 실행 | 1 |
| `--category <name>` | 특정 카테고리만 (업무 보고/제안서/교육 자료/외부 발표) | 랜덤 |
| `--mode free\|preset` | 특정 모드만 | 분포에 따라 랜덤 |
| `--report` | 누적 결과 리포트 출력 (실행 없음) | - |

## References

Load before starting:
- `references/scenario-pool.md` — 시나리오 풀 (카테고리, 변수, 분포)
- `references/rubric.md` — LLM 품질 채점 기준

## Phase 1: 시나리오 생성

1. `references/scenario-pool.md` 로드
2. 옵션에 따라 필터링:
   - `--category`: 해당 카테고리만
   - `--mode`: 해당 모드만
   - 없으면: 카테고리 랜덤, 모드는 자유 70% / 프리셋 30%
3. 선택된 카테고리 내 변수를 랜덤 조합
4. 구체적인 발표 주제 + 맥락 문장 생성 (LLM이 변수 조합으로 자연스러운 시나리오 작성)
5. 슬라이드 장수 결정 (분포: 5-8장 50%, 9-12장 35%, 13-15장 15%)
6. 프리셋 모드일 경우 Available Presets에서 랜덤 선택
7. 결과 디렉토리 생성: `skills/presentation/e2e-results/runs/YYYY-MM-DD-NNN/`
8. `scenario.json` 저장

**시나리오 예시:**
```json
{
  "category": "제안서",
  "topic": "마케팅팀 AI 챗봇 도입 제안 — 경영진 대상, 예산 요청",
  "mode": "free",
  "slideCount": 8,
  "variables": {
    "유형": "시스템 도입",
    "대상": "경영진",
    "규모": "중규모(5-20명)"
  }
}
```

## Phase 2: 스킬 실행

1. `/presentation` 스킬 호출:
   - 입력: Phase 1의 시나리오 (topic + slideCount)
   - 자유 모드: "원샷(A)" 생성 방식 선택 (사람 개입 최소화)
   - 프리셋 모드: 지정된 프리셋으로 실행
   - 프로필 질문은 스킵 ("프로필 없이 진행")
   - 저장 경로: 결과 디렉토리의 slides/ 하위
2. 생성 완료 대기
3. HTML slides를 결과 디렉토리에 복사
4. PPTX 변환 실행:
   ```bash
   cd skills/presentation && npm run html2pptx -- --slidesDir=<slides-dir> --output=<run-dir>/output.pptx --mode=hybrid
   ```
5. 에러 발생 시: 에러 내용을 `error.json`에 저장하고 Phase 3 스킵 → Phase 5로

## Phase 3: 구조 채점

1. 구조 채점 스크립트 실행:
   ```bash
   cd _dev/test-presentation && npx tsx scripts/structural-scorer.ts <run-dir>/output.pptx
   ```
2. JSON 출력을 `structural-score.json`으로 저장
3. 점수 요약 출력:
   ```
   구조 점수: 85/100
   - PPTX 생성: +30
   - 슬라이드 8장 (범위 내): +20
   - 8/8 슬라이드 텍스트+이미지: +30
   - 파일 무결성: +5 (presentation.xml 없음)
   ```

## Phase 4: 품질 채점

1. `references/rubric.md` 로드
2. 결과 디렉토리의 HTML 슬라이드 전체를 읽기
3. `scenario.json`의 시나리오 정보와 함께 rubric에 따라 채점
4. 채점 시 지침:
   - 각 항목별 0-25점 부여
   - 반드시 **관찰 가능한 증거**를 근거로 제시
   - 시나리오의 청중/목적과 대조하여 맞춤도 평가
5. JSON 결과를 `quality-score.json`으로 저장:
   ```json
   {
     "message_clarity": { "score": 22, "evidence": ["제목 슬라이드에 핵심 문장 존재", "결론에서 핵심 메시지 반복"] },
     "logical_flow": { "score": 20, "evidence": ["도입-현황-제안-기대효과 구조", "3번→4번 전환이 다소 급격"] },
     "visual_design": { "score": 18, "evidence": ["색상 일관성 양호", "슬라이드 6의 텍스트 과밀"] },
     "audience_fit": { "score": 21, "evidence": ["경영진 대상 적절한 용어 수준", "ROI 중심 구조"] },
     "total": 81,
     "summary": "경영진 제안서로서 핵심 메시지와 구조가 명확하나, 일부 슬라이드의 시각 밀도 개선 필요"
   }
   ```

## Phase 5: 리포트

### 단건 모드
```
══════════════════════════════════════════
  E2E Test Result: 2026-03-12-001
══════════════════════════════════════════
  시나리오: 마케팅팀 AI 챗봇 도입 제안
  카테고리: 제안서 | 모드: 자유 | 슬라이드: 8장
──────────────────────────────────────────
  구조 점수:  85 / 100
  품질 점수:  81 / 100
  종합:      83 / 100
──────────────────────────────────────────
  품질 상세:
    메시지 전달력:  22/25
    논리적 흐름:    20/25
    시각 디자인:    18/25
    청중 맞춤도:    21/25
══════════════════════════════════════════
```

### 배치 모드 (--count N)
Phase 1-4를 N번 반복 후 전체 통계:
```
══════════════════════════════════════════
  E2E Batch Report: 5 runs
══════════════════════════════════════════
  평균 구조: 82 | 평균 품질: 78 | 종합: 80
──────────────────────────────────────────
  카테고리별:
    업무 보고 (2건): 구조 85 / 품질 80
    제안서 (1건):    구조 78 / 품질 82
    교육 자료 (1건): 구조 80 / 품질 75
    외부 발표 (1건): 구조 84 / 품질 76
──────────────────────────────────────────
  모드별:
    자유 (4건):   구조 83 / 품질 79
    프리셋 (1건): 구조 78 / 품질 75
══════════════════════════════════════════
```

### --report 모드
`summary.json`을 읽어 누적 통계를 위와 동일한 형식으로 출력.
실행 없이 기존 결과만 조회.

## Phase 6: 이슈 액션 (개선 루프)

단건/배치 모드에서 Phase 5 리포트 출력 후 자동으로 실행한다. `--report` 모드(조회 전용)에서는 스킵한다.

### 판단 기준

| 조건 | 액션 |
|------|------|
| 구조 점수 < 80 | 파이프라인 버그 조사 → `error.json` 확인, PPTX 변환 로그 재검토 |
| 품질 점수 < 75 (NotebookLM 기준선) | 해당 항목별 프롬프트 개선 제안 출력 (아래 매핑 참조) |
| CLI/도구 버그 발견 | 버그 위치 즉시 수정 + 관련 SKILL.md 문서 업데이트 |
| 개선 완료 | 동일 `scenario.json`으로 회귀 테스트 재실행 |

### 품질 항목 → 프롬프트 매핑

| 낮은 항목 | 수정 대상 프롬프트 |
|-----------|-------------------|
| message_clarity | `src/html-pipeline/prompts/message-architect.md` (One Takeaway 규칙 강화) |
| logical_flow | `src/html-pipeline/prompts/message-architect.md` (narrative_arc 구조 강화) |
| visual_design | `src/html-pipeline/prompts/html-designer.md` (밀도/여백 규칙 강화) |
| audience_fit | `src/html-pipeline/prompts/research.md` (audience_context 구체화) |

### 회귀 테스트 실행

이슈를 수정한 후, 동일 시나리오로 재실행하여 개선 여부를 확인한다:

```bash
# 기존 run의 scenario.json을 참조하여 동일 조건 재실행
# Phase 1에서 scenario.json을 직접 로드하는 방식으로 진행
```

새 run 디렉토리(`YYYY-MM-DD-NNN+1`)에 저장하고 점수를 이전 run과 비교 출력:

```
회귀 비교:
  이전 (2026-03-12-001): 구조 100 / 품질 89
  현재 (2026-03-12-002): 구조 100 / 품질 92  ↑ +3
```

### 이슈 없을 때

구조 ≥ 80, 품질 ≥ 75이고 버그 없으면:

```
✓ 이슈 없음. 개선 액션 불필요.
```
