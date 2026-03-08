---
name: council
description: >
  Collect and synthesize opinions from multiple AI agents. 여러 AI 에이전트의 의견을
  수집하고 합성하는 멀티 페르소나 스킬. Use when users say "summon the council",
  "ask other AIs", "council 소환", "다른 AI한테 물어봐", or want multiple AI perspectives
  on a question. Triggers: agent council, 에이전트 카운슬, 멀티 페르소나, 의견 합성,
  council 소환
origin: "Forked from henry-1981/plugins-for-claude-natives (MIT License)"
---

# Agent Council

여러 관점을 수집하고 하나의 답변으로 합성한다.

## 모드 선택

| | Basic | Extended (권장) |
|---|---|---|
| **동작 방식** | 하나의 AI가 여러 역할을 수행 | 서로 다른 AI 모델이 각자의 관점을 제시 |
| **다양성** | 시뮬레이션 — 같은 모델, 다른 프롬프트 | 실제 — 다른 학습 데이터, 다른 추론 방식 |
| **설정** | 없음 | CLI 설치 + 모델별 인증 |
| **적합한 용도** | 빠른 브레인스토밍, 단순 질문 | 중요한 의사결정, 심층 기술 리뷰, 전략 |

**Extended 모드가 중요한 이유**: 단일 AI가 "비평가 역할"을 하면 자기 자신에게 동의하는 경향이 있다. 서로 다른 모델(Claude, GPT, Gemini)은 학습 데이터, 추론 패턴, 사각지대가 실제로 다르므로 더 강한 이견과 풍부한 합성을 만들어낸다.

**모드 결정 방식**: `council.config.yaml`에 `command` 필드가 있는 멤버가 정의되어 있고 해당 CLI가 사용 가능하면 extended 모드를 사용한다. 그렇지 않으면 basic 모드로 동작한다. Extended 모드 설정은 `references/setup.md`를 참조한다.

## Basic 모드 워크플로우

스크립트나 의존성이 필요 없다. 호스트 에이전트가 모든 것을 처리한다.

1. `council.config.yaml`을 읽는다 (config가 없으면 기본 페르소나 사용)
2. `personas`에 정의된 각 페르소나에 대해:
   - 페르소나의 `system_prompt`를 역할로 적용
   - 해당 관점에서 사용자의 질문에 대한 응답 생성
   - 페르소나 이름과 이모지로 응답 라벨링
3. 모든 페르소나 응답이 생성된 후 합성:
   - 합의점과 이견을 식별
   - 각 관점에서 가장 강력한 논거를 강조
   - 균형 잡힌 최종 권고안 제공

### 기본 페르소나

| Persona | 역할 | Emoji |
|---------|------|-------|
| strategist | 대안 비교, 트레이드오프 강조, 방향 제시 | 💎 |
| critic | 결함, 리스크, 간과된 이슈 식별 (Critical/Warning/Minor) | 🤖 |
| narrator | 비기술 청중을 위해 비유를 활용한 평이한 설명 | 🧠 |

### Basic 모드 응답 형식

```
## Council Responses

### 🧠 Narrator
[narrator 관점의 응답]

### 🤖 Critic
[critic 관점의 응답]

### 💎 Strategist
[strategist 관점의 응답]

## Synthesis
**합의**: [관점 간 일치하는 핵심 사항]
**이견**: [관점 간 불일치하는 사항과 각 입장]
**권고**: [균형 잡힌 최종 권고안]
```

## Extended 모드 워크플로우

각 멤버가 실제 AI CLI를 병렬로 실행한다 — 역할극이 아닌 진정으로 독립적인 의견을 얻을 수 있다. Node.js와 최소 하나의 외부 AI CLI가 필요하다. 설치 방법은 `references/setup.md`를 참조한다.

### One-shot

```bash
./skills/agent-council/scripts/council.sh "your question here"
```

### Step-by-step

```bash
JOB_DIR=$(./skills/agent-council/scripts/council.sh start "your question here")
./skills/agent-council/scripts/council.sh wait "$JOB_DIR"
./skills/agent-council/scripts/council.sh results "$JOB_DIR"
./skills/agent-council/scripts/council.sh clean "$JOB_DIR"
```

결과를 수집한 후 chairman으로서 응답을 합성한다:
- AI 모델 간 합의와 이견을 식별
- 각 모델이 제공하는 고유한 인사이트를 기록
- 최종 권고안 제공

## 합성 규칙

모든 모드에서 반드시 지켜야 하는 불변 규칙이다.

1. **전원 대표** — 모든 페르소나/멤버의 관점이 합성에 반영되어야 한다. 어떤 응답도 무시하지 않는다
2. **원문 보존** — 사용자의 원래 질문 프레이밍을 왜곡하지 않는다
3. **이견 표면화** — 의견 불일치를 매끄럽게 다듬지 않는다. 이견은 명시적으로 드러낸다
4. **chairman 중립** — chairman은 어떤 단일 관점도 편향되게 지지하지 않는다
5. **출처 명시** — 합성에서 특정 주장을 인용할 때 어떤 페르소나/모델의 의견인지 표기한다

## Extended 모드 응답 형식

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

- `references/overview.md` — 워크플로우와 배경
- `references/examples.md` — 사용 예시
- `references/config.md` — 멤버 설정
- `references/setup.md` — 설치 및 셋업 가이드
- `references/troubleshooting.md` — 자주 발생하는 오류와 해결법
- `references/requirements.md` — 의존성 및 CLI 확인
- `references/host-ui.md` — 호스트 UI 체크리스트 가이드
- `references/safety.md` — 안전 관련 참고사항
