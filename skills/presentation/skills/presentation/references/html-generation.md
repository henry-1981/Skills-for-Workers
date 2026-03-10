# HTML Slide Generation Guide

PPTX 경로에서 Claude Code가 HTML 슬라이드를 생성할 때의 규칙.

## 필수 규격
- Canvas: `width: 1920px; height: 1080px`
- body에 `overflow: hidden` 필수
- 각 파일은 self-contained (inline `<style>`)
- 파일명: `slide-01.html`, `slide-02.html`, ...

## 폰트
```css
@import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
```

## 디자인 자유도 — 모드별 분기

### 디자인 우선 모드 (기본)
CSS 제약 없음. gradient, glow, backdrop-filter, 반투명 모두 사용 가능.
컨퍼런스 키노트 수준의 비주얼 품질을 목표로 한다.
상세 규칙: `src/html-pipeline/prompts/hybrid.md`

### 편집 우선 모드
CSS 제약 있음. 단색 배경, 시맨틱 태그, 그라디언트/필터 금지.
받는 사람이 PowerPoint에서 모든 요소를 자유롭게 수정할 수 있도록 한다.
상세 규칙: `src/html-pipeline/prompts/editable.md`

## 프리셋 CSS 변수
`preset-to-css.ts`로 생성된 CSS variables를 `:root`에 주입.
`var(--bg-primary)`, `var(--accent)`, `var(--text-primary)` 등 활용.

## 슬라이드 구조 예시

각 HTML 파일은 다음 구조를 따른다:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920, height=1080">
  <style>
    /* CSS variables from preset */
    :root { ... }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1920px; height: 1080px; overflow: hidden; }
    /* Slide-specific styles */
  </style>
</head>
<body>
  <!-- Slide content -->
</body>
</html>
```

## 콘텐츠 가이드라인
- 슬라이드당 하나의 명확한 메시지
- 글머리 기호 텍스트: 간결하게, 10-15 단어
- 테이블 셀: 짧은 구문
- 슬라이드당 텍스트 50-100 단어 목표
- 콘텐츠 타입 밸런스: 같은 레이아웃 5장 연속 금지
