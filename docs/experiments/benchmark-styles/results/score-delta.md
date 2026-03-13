# 벤치마킹 점수 델타

## 결과 요약

| Topic | Archetype | Before 품질 | After 품질 | 델타 |
|-------|-----------|-----------|----------|------|
| AI 코딩 도입 (T1) | dark-tech | 89* | — | (After 미실행) |
| 분기 매출 (T2) | swiss-minimal → Swiss International | 83 | 90 | **+7** |
| 브랜드 런칭 (T3) | brutalist-typo → Neo-Brutalism | 84 | 90 | **+6** |

*T1 Before = 2026-03-12 e2e 실행 기준선. After는 Phase 3 통합 후 회귀 테스트에서 실행 예정.

**평균 델타: +6.5점**

## 항목별 점수 비교

| 항목 | T2 Before | T2 After | T3 Before | T3 After |
|------|----------|---------|----------|---------|
| 메시지 명확성 | 22 | 22 | 22 | 22 |
| 논리 흐름 | 23 | 23 | 22 | 22 |
| **시각 디자인** | **17** | **22** | **18** | **23** |
| 청중 맞춤도 | 21 | 23 | 22 | 23 |

## 정성 관찰

### After 버전에서 눈에 띄게 달라진 점

1. **시그니처 요소 일관성**: Before는 슬라이드마다 독립적 해석 → After는 시그니처 3요소가 전 슬라이드에 반복 적용
   - T2 Swiss: red bar + horizontal divider + 5-column grid + Space Mono labels
   - T3 Neo-Brutalism: thick black border + hard drop shadow + oversized number

2. **폰트 페어링 정밀화**: Before는 Pretendard/Inter 범용 조합 → After는 명세 기반 특화 조합
   - T2: Inter + Space Mono (letter-spacing 3px)
   - T3: Impact/Arial Black + Space Mono

3. **색상 의도성**: Before는 #E53E3E (임의 red) → After는 #E8000D (Swiss Signal Red), #FF3B30 (Neo-Brutalism Red) 등 스타일 고유 색상

4. **Avoid 규칙 준수**: After는 명세의 "Avoid" 항목을 명시적으로 회피
   - T2 Swiss: decorative elements, rounded corners 배제
   - T3 Neo-Brutalism: soft shadows, gradients, rounded corners 완전 배제

### Before에서 After로 개선된 핵심 요인

**"디자인 시스템 vs 디자인 인상"**
- Before: 아키타입의 "무드"를 해석하여 슬라이드마다 자유 디자인 → 인상(impression)은 맞으나 시스템(system)이 아님
- After: 정밀 명세의 exact values를 적용하여 전체 덱이 하나의 디자인 시스템으로 작동

### 효과가 작았던 영역

- **메시지 명확성, 논리 흐름**: 동일 아웃라인이므로 차이 없음 → 이 영역은 Message Architect 단계에서 결정됨
- **청중 맞춤도**: +1~2점 소폭 향상 → 스타일이 청중 맥락에 더 정확히 매치되었으나, 이미 Before도 적절한 수준

## 결론

- **스타일 명세 주입 효과: 유의미 (+6.5점 평균)**
- 개선은 주로 **시각 디자인 일관성**에서 발생 (평균 +5점)
- 메시지/흐름은 Design Agent가 아닌 Message Architect 영역이므로 영향 없음 (예상대로)
- **Phase 3 통합 범위**: 시각 디자인 항목의 천장을 올리는 데 집중

## Phase 3 통합 권고

1. `design-specs.md`에 각 아키타입별 HEX/폰트/시그니처/Avoid 정밀 명세 필수
2. html-designer.md에 "정밀 명세 > 철학적 방향" 우선순위 원칙 추가
3. 기존 5개 아키타입 + 갭 분석 결과 신규 아키타입 추가
