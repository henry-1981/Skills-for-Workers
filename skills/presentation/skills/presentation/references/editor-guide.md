# slides-grab Editor Guide

slides-grab은 생성된 HTML 슬라이드를 브라우저에서 실시간 프리뷰·편집할 수 있는 에디터입니다.

## 실행

```bash
npm run editor -- --slides-dir slides/generated --port 3456
```

브라우저에서 `http://localhost:3456` 으로 접근합니다.

## 주요 기능

### 직접 편집
- 슬라이드 위 텍스트를 클릭하면 인라인 편집 모드 진입
- 수정 즉시 HTML 파일에 반영

### AI Edit 큐
- 에디터 UI에서 수정 지시를 텍스트로 입력
- 에이전트가 지시를 받아 HTML을 수정하고 에디터에 반영
- AI Edit 출력은 수정된 HTML 조각(마크다운 아님)

### Undo / Redo
- 모든 편집 작업은 히스토리 스택에 기록
- 실수 시 되돌리기 가능

### 드래그 & 리사이즈
- 슬라이드 내 요소를 드래그하여 위치 이동
- 핸들을 잡아 크기 조절

## 선택 모델

| 동작 | 결과 |
|------|------|
| 요소 클릭 | 해당 요소 선택 (편집 모드) |
| 슬라이드 빈 영역 클릭 | 슬라이드 전체 선택 |
| Tab | 다음 요소로 순환 선택 |
| Shift+Tab | 이전 요소로 순환 선택 |
| Escape | 선택 해제 |

## 키보드 단축키

| 기능 | Mac | Windows/Linux |
|------|-----|---------------|
| Undo | Cmd+Z | Ctrl+Z |
| Redo | Cmd+Shift+Z | Ctrl+Shift+Z |
| 전체 선택 | Cmd+A | Ctrl+A |
| 복사 | Cmd+C | Ctrl+C |
| 붙여넣기 | Cmd+V | Ctrl+V |
| 삭제 | Delete / Backspace | Delete / Backspace |
| 저장 (수동) | Cmd+S | Ctrl+S |
| 다음 슬라이드 | Arrow Right | Arrow Right |
| 이전 슬라이드 | Arrow Left | Arrow Left |

## 워크플로우

1. Phase 3에서 HTML 슬라이드 생성 후 에디터 자동 실행
2. 브라우저에서 슬라이드 확인
3. 텍스트 직접 수정 또는 AI Edit으로 지시
4. 만족스러우면 "내보내기" / "완료" 입력
5. Phase 4에서 PPTX로 내보내기
