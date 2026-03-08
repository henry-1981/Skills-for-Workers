# Skills for Workers

조직 내 실무자가 AI 에이전트와 함께 사용할 수 있는 도메인 Plugin marketplace.

각 Plugin은 특정 업무 영역의 규정, 가이드라인, 의사결정 프레임워크를 포함하며 Claude Code Plugin marketplace를 통해 배포됩니다.

## Plugin Catalog

| Plugin | Skills | Description | Category |
|--------|--------|-------------|----------|
| [agent-council](skills/agent-council/) | council | 멀티 페르소나 의견 합성 (basic/extended 모드) | Productivity |
| [clarify](skills/clarify/) | vague, unknown, metamedium | 요구사항 구체화, 전략 사각지대 분석, 콘텐츠 vs 형식 관점 전환 | Thinking |
| [human-writing](skills/human-writing/) | human-writing | AI 텍스트를 인간 전문가 필체로 변환하는 파이프라인 | Writing Style |
| [k-sunshine](skills/k-sunshine/) | k-sunshine | 의료기기 마케팅 컴플라이언스 어드바이저 (KMDIA 공정경쟁규약) | Healthcare Compliance |
| [skill-tools](skills/skill-tools/) | skill-lint, skill-submit, skill-package | 스킬 검증, 제출 라우팅, 패키징 도구 묶음 | Meta |
| [tool-setup](skills/tool-setup/) | tool-setup | MCP 서버 설정 가이드 (Google Workspace, Notion 연결) | Setup / Onboarding |
| [presentation](skills/presentation/) | presentation | 마크다운 → Figma Slides / PPTX 발표자료 생성 (TODO) | Productivity |

> **NDA Triage**: Cowork 공식 legal plugin으로 이전되었습니다. Claude Code에서 직접 사용 가능합니다.

## Quick Start

### Plugin Marketplace (권장)

Server-managed settings (Team/Enterprise Admin 콘솔)를 통해 자동으로 전달됩니다. 사용자 설정 불필요.

```bash
# 또는 로컬에서 직접 등록
claude plugin marketplace add ./
```

### 단일 Plugin 테스트

```bash
claude --plugin-dir ./skills/human-writing
```

### 개발자용 (소스에서 직접)

```bash
# 1. 레포 클론
git clone https://github.com/henry-1981/Skills-for-Workers.git ~/skills

# 2. marketplace 등록
cd ~/skills
claude plugin marketplace add ./

# 3. (선택) agent-council extended 모드 사용 시
cd skills/agent-council && npm install
cp council.config.example.yaml council.config.yaml
```

### Codex

```bash
codex --system-prompt "$(cat ~/skills/skills/k-sunshine/skills/k-sunshine/SKILL.md)"
```

### Gemini CLI

```bash
gemini --context ~/skills/skills/k-sunshine/skills/k-sunshine/SKILL.md
```

> **Note**: Codex와 Gemini CLI는 `references/` 디렉토리를 자동으로 로드하지 않습니다. 상세 규정이 필요한 스킬은 references를 함께 전달하세요.

## Structure

```
Skills-for-Workers/
├── .claude-plugin/
│   └── marketplace.json       # 전체 Plugin 카탈로그
├── _template/                 # 새 Plugin 생성 템플릿
│   ├── .claude-plugin/plugin.json
│   └── skills/your-skill-name/
│       ├── SKILL.md
│       └── references/
├── scripts/
│   └── lint-skills.sh         # 스킬 검증 스크립트
└── skills/
    ├── agent-council/         # 멀티 페르소나 의견 합성
    │   ├── .claude-plugin/plugin.json
    │   ├── skills/council/
    │   │   ├── SKILL.md
    │   │   └── references/
    │   ├── scripts/
    │   ├── package.json
    │   └── council.config.example.yaml
    ├── clarify/               # 요구사항·전략·관점 명확화
    │   ├── .claude-plugin/plugin.json
    │   ├── commands/clarify.md
    │   └── skills/
    │       ├── vague/SKILL.md
    │       ├── unknown/SKILL.md + references/
    │       └── metamedium/SKILL.md + references/
    ├── human-writing/         # AI→인간 텍스트 변환
    │   ├── .claude-plugin/plugin.json
    │   └── skills/human-writing/
    │       ├── SKILL.md
    │       └── references/
    ├── k-sunshine/            # 의료기기 마케팅 컴플라이언스
    │   ├── .claude-plugin/plugin.json
    │   └── skills/k-sunshine/
    │       ├── SKILL.md
    │       ├── k-sunshine.skill
    │       └── references/
    ├── skill-tools/           # 스킬 검증·제출·패키징
    │   ├── .claude-plugin/plugin.json
    │   └── skills/
    │       ├── skill-lint/SKILL.md + references/
    │       ├── skill-submit/SKILL.md
    │       └── skill-package/SKILL.md
    ├── tool-setup/            # MCP 서버 설정 가이드
    │   ├── .claude-plugin/plugin.json
    │   └── skills/tool-setup/
    │       ├── SKILL.md
    │       └── references/
    └── presentation/          # 발표자료 생성 (TODO)
        ├── .claude-plugin/plugin.json
        ├── .mcp.json
        └── skills/presentation/SKILL.md
```

## Advanced Patterns

Skills 외에 Claude Code 품질을 높이는 고급 패턴 가이드 — [ADVANCED-PATTERNS.md](ADVANCED-PATTERNS.md)

| 패턴 | 역할 | 파일 위치 |
|------|------|----------|
| **Agents** | 서브에이전트 역할 분담 + 품질 계약 | `.claude/agents/*.md` |
| **Commands** | `/슬래시 커맨드`로 다단계 워크플로우 실행 | `.claude/commands/*.md` |
| **A/B 실험** | 스킬 적용 전후 품질 차이를 정량 측정 | 실험 설계 가이드 포함 |

> Harness 연구에 따르면 구조화된 사전 구성으로 LLM 산출물 품질이 평균 60% 향상된다. — [Hwang, 2026](https://github.com/revfactory/claude-code-harness)

## Adding a New Plugin

### 방법 1: skill-submit 스킬 (비개발자 권장)

Claude Code에서 `/skill-submit` 실행 → 의도 파악 → `/skill-creator`(생성) 또는 `/skill-package`(패키징) 안내

### 방법 2: 템플릿 수동 복사 (개발자)

```bash
cp -r _template skills/my-new-plugin
```

`plugin.json`과 `SKILL.md`의 frontmatter를 작성하고 `references/`에 참조 문서를 추가합니다. `origin` 필드에 출처를 명시해 주세요.

## Recommended External Skills

이 레포에 포함되지 않지만, Claude Code/Cowork 사용 시 유용한 외부 스킬입니다.

### Anthropic 공식

| 스킬 | 설명 | 설치 |
|------|------|------|
| skill-creator | 인터뷰 기반 스킬 자동 생성 | `npx skills add anthropic/skill-creator` |
| docx / xlsx / pptx / pdf | Office 문서 생성·편집 | Claude Code 내장 또는 [anthropics/skills](https://github.com/anthropics/skills) |
| code-review | 코드 리뷰 체크리스트 | `npx skills add anthropic/code-review` |

### 커뮤니티

| 리소스 | 설명 |
|--------|------|
| [skills.sh](https://skills.sh/) | 에이전트 스킬 디렉토리 + CLI 설치 |
| [SkillsMP](https://skillsmp.com/) | 350K+ 스킬 마켓플레이스 |
| [awesome-agent-skills](https://github.com/skillmatic-ai/awesome-agent-skills) | 큐레이션된 스킬 목록 |
| [knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | Legal, Sales, Finance 등 11개 도메인 플러그인 |

## Attribution

| Plugin | Origin | License |
|--------|--------|---------|
| agent-council | Forked from [plugins-for-claude-natives](https://github.com/henry-1981/plugins-for-claude-natives#agent-council) | MIT |
| clarify | Forked from [plugins-for-claude-natives](https://github.com/henry-1981/plugins-for-claude-natives) clarify/* | MIT |
| human-writing | Original work | MIT |
| k-sunshine | Derived from [Cowork-RA](https://github.com/henry-1981/Cowork-RA) aria/skills/compliance | MIT |
| skill-tools | Original work | MIT |
| tool-setup | Original work | MIT |
| presentation | Original work | MIT |

## License

MIT
