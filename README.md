# Skills for Workers

조직 내 실무자가 AI 에이전트와 함께 사용할 수 있는 도메인 스킬 모음.

각 스킬은 특정 업무 영역의 규정, 가이드라인, 의사결정 프레임워크를 포함하며 Claude Code, Codex, Gemini CLI 등 다양한 AI 플랫폼에서 활용할 수 있습니다.

## Skill Catalog

| Skill | Description | Category |
|-------|-------------|----------|
| [agent-council](skills/agent-council/) | 멀티 페르소나 의견 합성 (basic: 호스트 에이전트 단독, extended: 멀티 CLI 오케스트레이션) | Productivity |
| [k-sunshine](skills/k-sunshine/) | 의료기기 마케팅 컴플라이언스 어드바이저 (KMDIA 공정경쟁규약) | Healthcare Compliance |
| [human-writing](skills/human-writing/) | AI 텍스트를 인간 전문가 필체로 변환하는 파이프라인 | Writing Style |

## Quick Start

### Claude Code

```bash
# 1. 레포 클론
git clone https://github.com/henry-1981/Skills-for-Workers.git ~/skills

# 2. 스킬 디렉토리 생성 + 심링크 등록
mkdir -p ~/.claude/skills
ln -s ~/skills/skills/agent-council ~/.claude/skills/agent-council
ln -s ~/skills/skills/k-sunshine ~/.claude/skills/k-sunshine
ln -s ~/skills/skills/human-writing ~/.claude/skills/human-writing

# 3. (선택) agent-council extended 모드 사용 시
cd ~/.claude/skills/agent-council && npm install
cp council.config.example.yaml council.config.yaml
# basic 모드는 의존성 불필요 — 상세: references/setup.md
```

### Codex

```bash
codex --system-prompt "$(cat ~/skills/skills/k-sunshine/SKILL.md)"
```

### Gemini CLI

```bash
gemini --context ~/skills/skills/k-sunshine/SKILL.md
```

> **Note**: Codex와 Gemini CLI는 `references/` 디렉토리를 자동으로 로드하지 않습니다. 상세 규정이 필요한 스킬은 references를 함께 전달하세요:
> ```bash
> # 예: k-sunshine의 SKILL.md + 모든 참조 문서를 함께 전달
> codex --system-prompt "$(cat ~/skills/skills/k-sunshine/SKILL.md ~/skills/skills/k-sunshine/references/*.md)"
> ```

### 설치 확인

```bash
ls -la ~/.claude/skills/          # 심링크 확인
# Claude Code에서 "council 소환해줘" 입력 → 스킬 활성화 확인
```

### claude.ai Web

`.skill`/`.zip` 파일은 claude.ai 웹 플랫폼 업로드용 번들입니다. Claude Code나 CLI 환경에서는 사용하지 않습니다.

## Structure

```
Skills-for-Workers/
├── _template/              # 새 스킬 생성 템플릿
│   ├── SKILL.md
│   └── references/
└── skills/
    ├── agent-council/      # 멀티 페르소나 의견 합성 (basic/extended)
    │   ├── SKILL.md
    │   ├── package.json
    │   ├── council.config.example.yaml
    │   ├── scripts/
    │   └── references/
    ├── k-sunshine/         # 의료기기 마케팅 컴플라이언스
    │   ├── SKILL.md
    │   ├── k-sunshine.skill        # claude.ai 웹용 번들
    │   └── references/
    └── human-writing/      # AI→인간 텍스트 변환
        ├── SKILL.md
        ├── human-writing.zip       # claude.ai 웹용 번들
        └── references/
```

## Adding a New Skill

```bash
cp -r _template skills/my-new-skill
```

`SKILL.md`의 frontmatter를 작성하고 `references/`에 참조 문서를 추가합니다. `origin` 필드에 출처를 명시해 주세요.

## Attribution

| Skill | Origin | License |
|-------|--------|---------|
| agent-council | Forked from [plugins-for-claude-natives](https://github.com/henry-1981/plugins-for-claude-natives#agent-council) | MIT |
| k-sunshine | Derived from [Cowork-RA](https://github.com/henry-1981/Cowork-RA) aria/skills/compliance | Internal |
| human-writing | Original work | — |

## License

Apache-2.0
