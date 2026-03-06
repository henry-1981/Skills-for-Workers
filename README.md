# Skills for Workers

조직 내 실무자가 AI 에이전트와 함께 사용할 수 있는 도메인 스킬 모음.

각 스킬은 특정 업무 영역의 규정, 가이드라인, 의사결정 프레임워크를 포함하며 Claude Code, Codex, Gemini CLI 등 다양한 AI 플랫폼에서 활용할 수 있습니다.

## Skill Catalog

| Skill | Description | Category |
|-------|-------------|----------|
| [agent-council](skills/agent-council/) | 멀티 페르소나 의견 합성 (basic: 호스트 에이전트 단독, extended: 멀티 CLI 오케스트레이션) | Productivity |
| [k-sunshine](skills/k-sunshine/) | 의료기기 마케팅 컴플라이언스 어드바이저 (KMDIA 공정경쟁규약) | Healthcare Compliance |
| [human-writing](skills/human-writing/) | AI 텍스트를 인간 전문가 필체로 변환하는 파이프라인 | Writing Style |
| [nda-triage](skills/nda-triage/) | NDA 스크리닝 및 GREEN/YELLOW/RED 분류 (Anthropic 포크) | Legal Compliance |
| [skill-lint](skills/skill-lint/) | 스킬 디렉토리 자동 검증 (frontmatter, 구조, references 무결성) | Quality Assurance |
| [skill-submit](skills/skill-submit/) | 스킬 생성·제출 라우터 (skill-creator → lint → package 안내) | Contribution |
| [skill-package](skills/skill-package/) | 기존 스킬 검증 및 제출용 zip 패키징 | Contribution |
| [clarify-vague](skills/clarify-vague/) | 모호한 요구사항을 가설 기반 질문으로 구체화 | Thinking |
| [clarify-unknown](skills/clarify-unknown/) | 전략 사각지대를 Known/Unknown 4분면으로 분석 | Thinking |
| [clarify-metamedium](skills/clarify-metamedium/) | 콘텐츠(what) vs 형식(how) 관점 전환 | Thinking |

## Quick Start

### 설치 스크립트 (권장)

Google Drive "Skills for Workers" 폴더에서 아래 파일을 다운로드합니다:
- `skills-v*.zip` (스킬 패키지)
- `version.json` (무결성 검증용)
- `skills-install.sh` (Mac) 또는 `skills-install.bat` (Windows)

```bash
# Mac/Linux
chmod +x skills-install.sh
./skills-install.sh skills-v2026.03.06.zip

# Windows — CMD에서 실행 또는 더블클릭
skills-install.bat skills-v2026.03.06.zip
```

설치 스크립트가 자동으로:
1. SHA256 무결성 검증
2. 필수 스킬 설치 (skill-lint, agent-council, human-writing, clarify 3종)
3. 선택 스킬 설치 여부 확인 (k-sunshine, nda-triage 등)

### 개발자용 (심링크 방식)

```bash
# 1. 레포 클론
git clone https://github.com/henry-1981/Skills-for-Workers.git ~/skills

# 2. 스킬 디렉토리 생성 + 심링크 등록
mkdir -p ~/.claude/skills
ln -s ~/skills/skills/agent-council ~/.claude/skills/agent-council
ln -s ~/skills/skills/k-sunshine ~/.claude/skills/k-sunshine
ln -s ~/skills/skills/human-writing ~/.claude/skills/human-writing
ln -s ~/skills/skills/nda-triage ~/.claude/skills/nda-triage
ln -s ~/skills/skills/skill-lint ~/.claude/skills/skill-lint
ln -s ~/skills/skills/skill-package ~/.claude/skills/skill-package
ln -s ~/skills/skills/clarify-vague ~/.claude/skills/clarify-vague
ln -s ~/skills/skills/clarify-unknown ~/.claude/skills/clarify-unknown
ln -s ~/skills/skills/clarify-metamedium ~/.claude/skills/clarify-metamedium

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
├── manifest.json           # 스킬 레지스트리 (required/optional, 부서)
├── scripts/
│   ├── skills-install.sh   # Mac/Linux 설치 스크립트
│   ├── skills-install.bat  # Windows 설치 스크립트
│   ├── skill-submit.sh     # Mac/Linux 제출 스크립트
│   └── skill-submit.bat    # Windows 제출 스크립트
├── .github/workflows/
│   └── deploy.yml          # CI: main push → zip → Google Drive
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
    ├── human-writing/      # AI→인간 텍스트 변환
    │   ├── SKILL.md
    │   ├── human-writing.zip       # claude.ai 웹용 번들
    │   └── references/
    ├── nda-triage/         # NDA 스크리닝 (Anthropic 포크)
    │   ├── SKILL.md
    │   └── references/
    ├── skill-lint/         # 스킬 디렉토리 자동 검증
    │   ├── SKILL.md
    │   └── references/
    ├── skill-submit/       # 스킬 제출 가이드
    │   └── SKILL.md
    ├── skill-package/      # 기존 스킬 패키징
    │   └── SKILL.md
    ├── clarify-vague/      # 요구사항 명확화
    │   └── SKILL.md
    ├── clarify-unknown/    # 전략 사각지대 분석
    │   ├── SKILL.md
    │   └── references/
    └── clarify-metamedium/ # 콘텐츠 vs 형식
        ├── SKILL.md
        └── references/
```

## Adding a New Skill

### 방법 1: skill-submit 스킬 (비개발자 권장)

Claude Code에서 `/skill-submit` 실행 → 의도 파악 → `/skill-creator`(생성) 또는 `/skill-package`(패키징) 안내

### 방법 2: 템플릿 수동 복사 (개발자)

```bash
cp -r _template skills/my-new-skill
```

`SKILL.md`의 frontmatter를 작성하고 `references/`에 참조 문서를 추가합니다. `origin` 필드에 출처를 명시해 주세요.

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

| Skill | Origin | License |
|-------|--------|---------|
| agent-council | Forked from [plugins-for-claude-natives](https://github.com/henry-1981/plugins-for-claude-natives#agent-council) | MIT |
| k-sunshine | Derived from [Cowork-RA](https://github.com/henry-1981/Cowork-RA) aria/skills/compliance | MIT |
| human-writing | Original work | MIT |
| nda-triage | Forked from [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) legal/skills/nda-triage | Apache 2.0 |
| skill-lint | Original work | MIT |
| skill-submit | Original work | MIT |
| skill-package | Original work | MIT |
| clarify-vague | Forked from [plugins-for-claude-natives](https://github.com/henry-1981/plugins-for-claude-natives) clarify/vague | MIT |
| clarify-unknown | Forked from [plugins-for-claude-natives](https://github.com/henry-1981/plugins-for-claude-natives) clarify/unknown | MIT |
| clarify-metamedium | Forked from [plugins-for-claude-natives](https://github.com/henry-1981/plugins-for-claude-natives) clarify/metamedium | MIT |

## License

MIT
