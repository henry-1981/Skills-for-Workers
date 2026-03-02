---
name: agent-council
description: Collect and synthesize opinions from multiple AI agents. Use when users say "summon the council", "ask other AIs", or want multiple AI perspectives on a question.
origin: "Forked from henry-1981/plugins-for-claude-natives (MIT License)"
---

# Agent Council

Collect multiple perspectives and synthesize one answer.

## Mode Selection

This skill operates in two modes based on configuration:

- **Basic mode**: No external CLI required. The host agent generates responses for each persona. Works immediately after installation.
- **Extended mode**: External AI CLIs (claude, codex, gemini, etc.) are called in parallel. Each persona is backed by a different AI model.

**How it's determined**: If `council.config.yaml` has members with `command` fields and the CLIs are available, extended mode is used. Otherwise, basic mode.

## Basic Mode Workflow

No scripts or dependencies required. The host agent handles everything.

1. Read `council.config.yaml` (or use default personas if no config exists)
2. For each persona defined in `personas`:
   - Apply the persona's `system_prompt` as your role
   - Generate a response to the user's question from that perspective
   - Label the response with the persona name and emoji
3. After all persona responses are generated, synthesize:
   - Identify points of agreement and disagreement
   - Highlight the strongest arguments from each perspective
   - Provide a balanced final recommendation

### Default Personas

| Persona | Role | Emoji |
|---------|------|-------|
| strategist | Compare alternatives, highlight trade-offs, recommend direction | 💎 |
| critic | Identify flaws, risks, overlooked issues (Critical/Warning/Minor) | 🤖 |
| narrator | Explain in plain language with analogies for non-technical audience | 🧠 |

### Basic Mode Response Format

```
## Council Responses

### 🧠 Narrator
[response from narrator perspective]

### 🤖 Critic
[response from critic perspective]

### 💎 Strategist
[response from strategist perspective]

## Synthesis
[balanced recommendation combining all perspectives]
```

## Extended Mode Workflow

Requires Node.js and at least one external AI CLI. See `references/setup.md` for installation.

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

After collecting results, synthesize the responses as chairman:
- Identify agreement and disagreement across AI models
- Note where different models bring unique insights
- Provide final recommendation

## References

- `references/overview.md` — workflow and background
- `references/examples.md` — usage examples
- `references/config.md` — member configuration
- `references/setup.md` — installation and setup guide
- `references/troubleshooting.md` — common errors and fixes
- `references/requirements.md` — dependencies and CLI checks
- `references/host-ui.md` — host UI checklist guidance
- `references/safety.md` — safety notes
