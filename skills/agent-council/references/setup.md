# Setup

## Prerequisites

- **Basic mode**: No dependencies. Works with any AI agent that can read SKILL.md.
- **Extended mode**: Node.js >= 18, at least one AI CLI tool installed and authenticated.

## Installation

### Basic Mode (no CLI required)

1. Clone the repository or copy `skills/agent-council/` to your skills directory
2. The host agent reads SKILL.md and generates multi-persona responses directly
3. No `npm install` needed

### Extended Mode (multi-model)

1. Install Node.js (>= 18): `brew install node` or https://nodejs.org/
2. Install dependencies:
   ```bash
   cd skills/agent-council && npm install
   ```
3. Copy and customize config:
   ```bash
   cp council.config.example.yaml council.config.yaml
   ```
4. Install and authenticate AI CLI tools you want to use

## AI CLI Tools

| CLI | Install | Authenticate |
|-----|---------|-------------|
| Claude Code | `npm install -g @anthropic-ai/claude-code` | `claude` (first run) |
| Codex | `npm install -g @openai/codex` | `codex auth` |
| Gemini CLI | `npm install -g @anthropic-ai/gemini-cli` or see Google docs | `gemini auth` |

## Config Customization

Edit `council.config.yaml`:

### Add a member

```yaml
members:
  - name: my-cli
    command: "my-cli -p"
    persona: strategist    # Use a defined persona
    emoji: "🔮"
    color: "YELLOW"
```

### Add a persona

```yaml
personas:
  my-role:
    system_prompt: |
      You are a [role]. [instructions for this perspective].
```

### Remove a member

Delete or comment out the entry. Members with missing CLIs will report `missing_cli` but won't crash the council.

### Adjust timeout

```yaml
settings:
  timeout: 300  # seconds per member (0 to disable)
```
