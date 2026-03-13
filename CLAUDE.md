# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI 에이전트(Claude Code, Codex, Gemini CLI 등)와 함께 사용하는 도메인 Plugin marketplace. 각 Plugin은 특정 업무 영역의 규정·가이드라인·의사결정 프레임워크를 Plugin 구조(`.claude-plugin/plugin.json` + `skills/` + `references/`)로 패키징한다.

## Project Direction: Plugin Marketplace

이 레포는 사내 workers를 위한 **Plugin 환경 조성** 공간이다. 스킬 생성 도구를 내장하지 않고, Anthropic 공식 skill-creator를 그대로 활용한다.

### 이 레포의 3가지 역할
1. **컨벤션 제시** — `_template/`로 사내 Plugin 구조 표준 제공
2. **품질 자동 검증** — lint 스크립트로 컨벤션 준수 자동 확인
3. **완성 Plugin 저장소** — PR로 중앙 관리, marketplace로 배포

### Plugin Creation Workflow
1. 실무자가 반복 업무를 인식
2. Anthropic 공식 **skill-creator** 스킬로 스킬 생성
3. lint가 사내 컨벤션 준수 확인
4. 이 레포에 PR → marketplace에 축적

### 핵심 원칙
- **환경 > 도구**: 생성 도구는 공식 그대로, 우리는 토양(컨벤션·lint·저장소)만 제공
- **자동 lint > 수동 게이트**: HB가 병목이 되는 품질 관리는 설계하지 않는다
- **체험 → 추천 → 자작**: 실무자에게 필요성이 체감된 후에 도구를 제공
- **Tier 0 먼저**: 모든 신규 스킬은 Tier 0(SKILL.md only)로 시작

### Deployment Strategy (2026-03-09 확정)

Claude Code Plugin marketplace 단일 채널:

```
GitHub Enterprise (소스) ──marketplace──▶ Claude Code (전원 접근)
```

- **소스**: GitHub Enterprise private repo. 개발자(기존 계정)만 PR
- **배포**: Plugin marketplace — server-managed settings (Admin 콘솔)로 자동 전달
- **기여**: 개발자 직접 PR + 비개발자 `skill-submit` → 제출
- **퇴사**: 기존 IT 프로세스 그대로 (Enterprise 계정 비활성화)

### Anthropic Agent Skills Spec 호환성
- 공식 스펙(agentskills.io/specification)과 **완전 호환** 확인 (2026-03-05)
- `origin` 필드는 우리 커스텀 (스펙이 추가 필드를 금지하지 않음)
- `license` 필드는 사내 배포 전제이므로 사용하지 않음
- 상세: `docs/skill-factory-known-unknown.md`

## Architecture

### Plugin Anatomy

모든 Plugin은 동일한 구조를 따른다:

```
skills/{plugin-name}/
├── .claude-plugin/
│   └── plugin.json        # name, description, version
├── skills/
│   └── {skill-name}/
│       ├── SKILL.md       # YAML frontmatter + 워크플로우 정의
│       └── references/    # 상세 문서 (규정, 가이드라인 등)
├── commands/              # /슬래시 커맨드 (optional)
├── .mcp.json              # MCP 서버 (optional)
├── scripts/               # 실행 스크립트 (optional)
└── hooks/                 # 훅 (optional)
```

SKILL.md는 반드시 `skills/` 서브디렉토리 안에 위치해야 한다 (plugin root 직접 배치 불가).

### Root Marketplace

`.claude-plugin/marketplace.json`이 전체 Plugin 카탈로그를 정의한다:
- `metadata.pluginRoot`: `./skills` — 각 Plugin의 source 경로 기준
- `plugins[]`: 7개 Plugin 목록 (name, source, description, version, category)

### Frontmatter Rules (agentskills.io spec)
- `name`: 소문자+하이픈만, max 64자, 디렉토리명과 일치 필수
- `description`: max 1024자, 트리거 키워드(한/영) 포함
- `origin`: 출처 명시 (우리 커스텀 필드)

### Progressive Disclosure
1. **Metadata** (~100 tokens): name + description — 항상 로드
2. **SKILL.md body** (<500줄 권장): 활성화 시 로드
3. **references/** (필요시): 온디맨드 로드

### Current Plugins

| Plugin | Skills | Type | Dependencies |
|--------|--------|------|-------------|
| `agent-council` | council | Node.js scripts + YAML config | `yaml` npm package, Node.js runtime |
| `clarify` | vague, unknown, metamedium | Pure markdown + `/clarify` command | None |
| `human-writing` | human-writing | Pure markdown pipeline | None |
| `k-sunshine` | k-sunshine | Pure markdown + binary `.skill` archive | None |
| `skill-tools` | skill-lint, skill-submit, skill-package | Pure markdown | None |
| `tool-setup` | tool-setup | Pure markdown guide + references | None |
| `presentation` | presentation | TypeScript pipeline + 4-Agent Pipeline (자유 모드) + hybrid-renderer + slides-grab editor | `pptxgenjs`, `playwright`, `sharp`, Node.js runtime |

### agent-council Specifics

멀티 페르소나 의견 합성 Plugin. **Basic/Extended 이중 모드** 아키텍처:

- **Basic mode**: 호스트 에이전트가 SKILL.md를 읽고 직접 멀티 페르소나 응답 생성. 의존성 없음.
- **Extended mode**: 실제 멀티 CLI 오케스트레이션. `council.config.yaml`로 멤버와 페르소나를 정의.

Config example 패턴: `council.config.example.yaml`(tracked) → `council.config.yaml`(gitignored). 실행 시 config가 없으면 자동 복사.

- Entry point: `scripts/council.sh` (bash wrapper) → `scripts/council-job.js` (Node.js job manager) → `scripts/council-job-worker.js` (개별 멤버 실행)
- Job lifecycle: `start` → `wait`/`status` → `results` → `clean`
- Job data는 `.jobs/` 디렉토리에 저장 (gitignored)
- Host agent 컨텍스트 자동 감지하여 one-shot 또는 pollable 모드 선택

### Advanced Patterns Guide

Skills 외 고급 패턴(Agents, Commands, A/B 실험 방법론)은 `ADVANCED-PATTERNS.md` 참조. Harness 연구 기반 정리.

### human-writing Specifics

5단계 변환(cognitive_trace → asymmetry_injection → connector_prune → controlled_uncertainty → domain_voice) + 3단계 검증(AI smell lint, fact integrity, redundancy prune) 파이프라인. 깊이 프리셋(express/standard/deep)으로 패스 수를 조절한다. 각 단계는 `references/` 내 개별 문서로 분리되어 다른 스킬에서 선택적 참조 가능.

### Presentation Plugin Specifics

HTML 생성 + hybrid-renderer PPTX 배포 파이프라인:

- **HTML 파이프라인**: HTML slides → orchestrator → hybrid-renderer → PPTX
  - hybrid 모드: 스크린샷 배경 + 편집 가능 텍스트 오버레이
  - 자유모드 기본 (1920×1080, LLM 자유 디자인) + 프리셋 opt-in 가드레일
- **4-Agent Pipeline (자유 모드)**: Research → Verify → Message Architect → Verify → Design
  - 프롬프트 파일: `src/html-pipeline/prompts/{research,verify,message-architect,html-designer}.md`
  - 임시 데이터: `/tmp/presentation-pipeline/` (pipeline 완료 후 자동 삭제)
  - `hybrid-free.md` deprecated (폴백용으로만 유지)
- **프리셋 모드**: `prompts/hybrid.md` 단일 프롬프트 (Message Design + 프리셋 CSS 변수)
- **slides-grab 에디터**: 브라우저 기반 시각 편집기 (`npm run editor`)
- **themes/presets.ts**: kr-* 9개 프리셋만 유지
- **Playwright MCP**: `.mcp.json`으로 브라우저 자동화 MCP 서버 설정

## Commands

```bash
# Lint (all plugins)
./scripts/lint-skills.sh

# Lint (single skill)
./scripts/lint-skills.sh skills/clarify/skills/vague

# agent-council 설정 (extended mode)
cd skills/agent-council && npm install
cp council.config.example.yaml council.config.yaml

# agent-council 실행 (one-shot)
./skills/agent-council/scripts/council.sh "your question"

# agent-council 실행 (step-by-step)
JOB_DIR=$(./skills/agent-council/scripts/council.sh start "question")
./skills/agent-council/scripts/council.sh wait "$JOB_DIR"
./skills/agent-council/scripts/council.sh results "$JOB_DIR"
./skills/agent-council/scripts/council.sh clean "$JOB_DIR"

# presentation: HTML→PPTX 변환 (tsc 필수, tsx 불가)
cd skills/presentation && npm install
npm run html2pptx -- --slidesDir=./slides --output=output.pptx --mode=hybrid

# presentation: slides-grab 에디터 (express 미설치 — 추후 추가 필요)
cd skills/presentation && npm run editor

```

빌드, 테스트 시스템은 없다. 대부분의 스킬은 순수 마크다운이며 별도의 빌드 과정이 필요 없다. presentation 플러그인의 HTML 파이프라인은 `tsc && node dist/`로 실행해야 한다 (tsx의 esbuild __name 래핑이 page.evaluate 브라우저 컨텍스트와 충돌).

## Creating a New Plugin

### 방법 1: skill-creator 활용 (권장)
Anthropic 공식 skill-creator 스킬을 사용하여 인터뷰 방식으로 스킬 생성 → lint로 사내 컨벤션 확인 → PR.

### 방법 2: 템플릿 수동 복사
```bash
cp -r _template skills/my-new-plugin
```

**공통 단계**:
1. `.claude-plugin/plugin.json`의 `name`, `description`, `version` 작성
2. `skills/{skill-name}/SKILL.md`의 frontmatter(`name`, `origin`, `description`) 작성
3. `name`은 소문자+하이픈, 디렉토리명과 일치
4. `description`에 한국어·영어 트리거 키워드 포함
5. `references/`에 참조 문서 추가 (Tier 0은 생략 가능)
6. `origin` 필드에 출처 명시
7. `.claude-plugin/marketplace.json`의 `plugins[]`에 등록

## Conventions

- `k-sunshine.skill` 파일은 바이너리(zip) — 일반 텍스트 도구로 읽을 수 없다
- `.jobs/`, `.claude/`, `.moai/`, `node_modules/`는 gitignored
- 새 스킬의 `description`에 한국어·영어 트리거 키워드를 모두 포함시킨다
- `references/` 내 문서는 다른 스킬에서도 개별 참조할 수 있도록 독립적으로 작성한다
- Plugin 내부 `.mcp.json`은 gitignore 예외로 추적한다
