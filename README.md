# Skills for RA

AI 에이전트를 위한 도메인 전문 스킬 저장소.

각 스킬은 특정 도메인의 규정, 가이드라인, 의사결정 프레임워크를 포함하며, 여러 AI 플랫폼에서 활용할 수 있습니다.

## Skill Catalog

| Skill | Description | Domain |
|-------|-------------|--------|
| [k-sunshine](skills/k-sunshine/) | 의료기기 마케팅 컴플라이언스 어드바이저 (KMDIA 공정경쟁규약) | Healthcare Compliance |

## Structure

```
Skills-for-RA/
├── _template/          # 새 스킬 생성 템플릿
│   ├── SKILL.md
│   └── references/
└── skills/             # 스킬 저장소
    └── k-sunshine/
        ├── SKILL.md           # 스킬 정의
        ├── k-sunshine.skill   # 패키지 바이너리
        └── references/        # 참조 문서
```

## Usage

### Claude Code

```bash
# 스킬 디렉토리를 직접 참조
claude --skill ./skills/k-sunshine/SKILL.md
```

### Codex

```bash
# 스킬을 시스템 프롬프트로 로드
codex --system-prompt "$(cat skills/k-sunshine/SKILL.md)"
```

### Gemini CLI

```bash
# 스킬을 컨텍스트로 제공
gemini --context skills/k-sunshine/SKILL.md
```

### Cowork Plugin

Cowork 플러그인의 스킬 매니저에서 `skills/` 경로를 등록하여 사용합니다.

## Adding a New Skill

1. `_template/` 디렉토리를 복사하여 `skills/` 아래에 새 스킬 디렉토리 생성:
   ```bash
   cp -r _template skills/my-new-skill
   ```

2. `SKILL.md`의 frontmatter와 본문을 작성

3. `references/` 디렉토리에 참조 문서 추가

4. 커밋 및 푸시

## License

Apache-2.0
