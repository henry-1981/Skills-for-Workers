# Requirements

## Basic mode

- No external dependencies
- Any AI agent that can read SKILL.md (Claude Code, Codex, Gemini CLI, etc.)

## Extended mode

- Node.js >= 18
- `npm install` in the skill directory (installs `yaml` package)
- At least one AI CLI tool installed and authenticated
- Verify each CLI: `command -v <binary>` or `<binary> --version`

## CLI tools

Install and authenticate the CLIs listed under `council.members` in `council.config.yaml`. Members with missing CLIs show as `missing_cli` in status output but don't block the council.

See `references/setup.md` for detailed installation instructions.
