---
name: agent-council
description: >
  Collect and synthesize opinions from multiple AI agents. 여러 AI 에이전트의 의견을
  수집하고 합성하는 멀티 페르소나 스킬. Use when users say "summon the council",
  "ask other AIs", "council 소환", "다른 AI한테 물어봐", or want multiple AI perspectives
  on a question. Triggers: agent council, 에이전트 카운슬, 멀티 페르소나, 의견 합성,
  council 소환
origin: "Forked from henry-1981/plugins-for-claude-natives (MIT License)"
---

# Agent Council

여러 관점을 수집하고 chairman으로서 하나의 답변으로 합성한다. Basic 모드는 호스트 에이전트가 직접 여러 페르소나를 수행하고, Extended 모드는 실제 AI CLI(Claude, Codex, Gemini 등)를 병렬 실행하여 독립적인 의견을 얻는다. Extended 모드가 가능할 때는 항상 Extended를 우선한다.

## Mode Detection

스킬이 호출되면 아래 순서로 모드를 결정한다.

### Step 1: Config 확인

`council.config.yaml`을 읽는다. 파일이 없으면 기본 페르소나(strategist, critic, narrator)를 사용한다.

### Step 2: Extended 가능 여부 판단

다음 조건을 **모두** 충족하면 Extended 모드를 사용한다:
- `members`에 `command` 필드가 있는 멤버가 1개 이상 존재
- 해당 CLI가 설치되어 있음
- Node.js >= 18이 설치되어 있음

### Step 3: 모드 결정

- 조건 충족 → **Mode 2: Extended Council**
- 조건 미충족 → **Mode 1: Basic Council**
- Extended 실행 중 전체 멤버 실패 시 → Mode 1로 폴백하고 사용자에게 알림

## Assessment Workflow

### Mode 1: Basic Council

호스트 에이전트가 모든 페르소나를 직접 수행한다. 스크립트나 외부 의존성이 필요 없다.

1. `council.config.yaml`의 `personas`를 읽는다 (config가 없으면 기본 페르소나 사용)
2. 각 페르소나에 대해:
   - 페르소나의 `system_prompt`를 역할로 적용
   - 해당 관점에서 사용자의 질문에 대한 응답을 생성
   - 페르소나 이름과 emoji로 응답을 라벨링
3. Chairman으로서 모든 페르소나 응답을 합성한다:
   - 합의점과 이견을 식별
   - 각 관점에서 가장 강력한 논거를 강조
   - 이견이 있으면 명시적으로 표면화
   - 균형 잡힌 최종 권고안 제공

#### 기본 페르소나

| Persona | 역할 | Emoji |
|---------|------|-------|
| strategist | 대안 비교, 트레이드오프 강조, 방향 제시 | 💎 |
| critic | 결함, 리스크, 간과된 이슈 식별 (Critical/Warning/Minor) | 🤖 |
| narrator | 비기술 청중을 위해 비유를 활용한 평이한 설명 | 🧠 |

### Mode 2: Extended Council

실제 AI CLI를 병렬로 실행하여 독립적인 의견을 수집한다.

1. `references/requirements.md`에 따라 사전 조건을 확인한다
2. 사전 조건 미충족 시 → 사용자에게 알리고 Mode 1로 폴백
3. council.sh를 실행하여 멤버 응답을 수집한다:
   ```bash
   # One-shot
   ./skills/agent-council/scripts/council.sh "질문"
   # Step-by-step
   JOB_DIR=$(./skills/agent-council/scripts/council.sh start "질문")
   ./skills/agent-council/scripts/council.sh wait "$JOB_DIR"
   ./skills/agent-council/scripts/council.sh results "$JOB_DIR"
   ./skills/agent-council/scripts/council.sh clean "$JOB_DIR"
   ```
4. 수집된 결과를 읽고 각 멤버의 응답을 확인한다
5. 오류 멤버(`missing_cli`, `timed_out`, `error`)를 기록한다. 전체 멤버 실패 시 → 사용자에게 알리고 Mode 1로 폴백. 문제 해결은 `references/troubleshooting.md` 참조
6. Chairman으로서 수집된 응답을 합성한다:
   - 각 모델의 응답을 요약하고 고유한 인사이트를 식별
   - 모델 간 합의와 이견을 명시적으로 구분
   - 어떤 단일 모델의 관점도 편향되게 반영하지 않는다
   - 최종 권고안과 그 근거를 제공

설정 방법은 `references/setup.md`, 멤버 구성은 `references/config.md`를 참조한다.

## Invariants (불변 규칙)

모든 모드에서 반드시 지켜야 하는 합성 규칙이다.

1. **전원 대표** — 모든 페르소나/멤버의 관점이 합성에 반영되어야 한다. 어떤 응답도 무시하지 않는다
2. **원문 보존** — 사용자의 원래 질문 프레이밍을 왜곡하지 않는다
3. **이견 표면화** — 의견 불일치를 매끄럽게 다듬지 않는다. 이견은 명시적으로 드러낸다
4. **chairman 중립** — chairman은 어떤 단일 관점도 편향되게 지지하지 않는다
5. **출처 명시** — 합성에서 특정 주장을 인용할 때 어떤 페르소나/모델의 의견인지 표기한다

## Response Format

### Basic Council 응답

```
## Council Responses

### 💎 Strategist
[strategist 관점의 응답]

### 🤖 Critic
[critic 관점의 응답]

### 🧠 Narrator
[narrator 관점의 응답]

## Synthesis
**합의**: [관점 간 일치하는 핵심 사항]
**이견**: [관점 간 불일치하는 사항과 각 입장]
**권고**: [균형 잡힌 최종 권고안]
```

### Extended Council 응답

```
## Council Results

| Member | Model | Status | Key Insight |
|--------|-------|--------|-------------|
| [name] | [CLI] | done/error | [1문장 핵심 인사이트] |

### [emoji] [member-name] ([model])
[해당 멤버의 전체 응답 요약]

(각 멤버별 반복)

## Chairman Synthesis
**합의**: [모델 간 일치하는 핵심 사항]
**이견**: [모델 간 불일치 — 어떤 모델이 어떤 입장인지 명시]
**고유 인사이트**: [특정 모델만 제기한 중요한 관점]
**권고**: [최종 권고안과 근거]
```

## References

- `references/overview.md` — 워크플로우 배경과 3단계 실행 흐름
- `references/config.md` — 멤버/페르소나 설정 방법 (페르소나 추가/변경 시 참조)
- `references/setup.md` — Extended 모드 설치 및 CLI 인증 가이드
- `references/requirements.md` — 모드별 의존성 확인 (Mode Detection Step 2에서 참조)
- `references/examples.md` — 기술 의사결정, 아키텍처 리뷰 등 사용 예시
- `references/troubleshooting.md` — `missing_cli`, timeout, YAML 파싱 오류 해결 (Extended Step 5에서 참조)
- `references/host-ui.md` — 호스트 에이전트 UI 체크리스트 연동 가이드
- `references/safety.md` — 프롬프트 보안, 환경변수, config 보안 관련 주의사항
