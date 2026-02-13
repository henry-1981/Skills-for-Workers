# Human Writing Pipeline Overview

## Pipeline Flow

```
원본 텍스트
    ↓
[프리셋 선택]
    ├─ express ──→ [Step 1-5 + Verify 1-3 동시 로드] → 단일 패스 ──→ 최종 텍스트
    ├─ standard ─→ [Step 1-5 통합 변환] → [Verify 1-3 원본 대조] ──→ 최종 텍스트
    └─ deep ─────→ [Step1]→[Step2]→…→[Step5] → [Verify 1-3 통합] → 최종 텍스트
```

프리셋을 지정하지 않으면 **standard** (2패스)가 적용된다.

## Stage Summary

| Step | Name | Purpose | Key Transformation |
|------|------|---------|-------------------|
| 1 | cognitive_trace | 사고 흔적 구조 | 결론선행 → 가정→긴장→수정→잠정결론 |
| 2 | asymmetry_injection | 균형 파괴 | 대칭 구조 → 비대칭 (확장/압축/미해결) |
| 3 | connector_prune | 접속사 제거 | 과도한 연결어 → 직접 진술 |
| 4 | controlled_uncertainty | 과단정 제거 | 절대 표현 → 보정된 확신 |
| 5 | domain_voice | 전문가 필체 | 교과서 톤 → 실무자 톤 |
| V1 | ai_smell_lint | AI 패턴 검사 | 잔존 AI 흔적 탐지 |
| V2 | fact_integrity_check | 사실 무결성 | 수치/명칭/조항 변형 검사 |
| V3 | redundancy_prune | 중복 제거 | 의미 중복 문장 탐지 |

## Invariants (불변 규칙)

모든 단계에서 반드시 지켜야 하는 규칙:
1. 새로운 사실을 추가하지 않는다
2. 숫자, 날짜, 고유명사, 조항 번호를 변경하지 않는다
3. 법적/기술적 의무 표현(shall/must)의 강제성을 약화시키지 않는다
4. 원문의 의미와 사실적 주장을 보존한다
