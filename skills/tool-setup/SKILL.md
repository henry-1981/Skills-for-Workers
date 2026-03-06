---
name: tool-setup
origin: "Original work — Skills for Workers project"
description: >
  Guide MCP server setup for Google Workspace and Notion integration.
  Detects current config, recommends servers, provides step-by-step setup
  with IT-managed and self-managed paths.
  Triggers: tool setup, MCP 설정, 도구 설정, 도구 연결, Google 연결,
  Notion 연결, workspace 연결, 워크스페이스 설정, connect tools,
  Google Drive MCP, 구글 연결, 노션 연결
---

# Tool Setup

비개발자용 — Google Workspace·Notion MCP 서버를 Claude에 연결하는 가이드.

## Supported Tools

| Tool | Server | Maintainer | Status |
|------|--------|-----------|--------|
| Google Workspace | `gws` (googleworkspace/cli) | Google Workspace org | 비공식, pre-v1.0 |
| Notion | Official hosted MCP | Notion Inc. | 공식 |

> **주의**: `gws`는 Google이 공식 지원하지 않는 커뮤니티 프로젝트입니다 (pre-v1.0).

## Workflow

### Phase 1: Detect
1. Run `node --version` — Node.js 18+ required
2. Run `claude mcp list` — check currently connected MCP servers
3. Report connected vs missing tools
4. Show estimated time: Notion ~5min, Google Path A ~15min, Path B ~45min

### Phase 2: Select
- AskUserQuestion: Which tools to set up? (multiSelect)
  - [ ] Google Workspace (Drive, Gmail, Calendar, Docs, Sheets)
  - [ ] Notion

### Phase 3: Setup

#### 3A. Google Workspace (gws)

1. AskUserQuestion — Authentication path (single question, show only selected path after):
   - "IT에서 Service Account 키를 받았다" → **Path A** (IT-Managed, ~15min)
   - "직접 설정해야 한다" → **Path B** (Self-Managed, ~45min)
   - "모르겠다" → Provide message for IT: "Google Workspace MCP Service Account 키가 필요합니다"

2. Read `references/google-workspace-setup.md` — follow selected path only

3. AskUserQuestion — Service selection (multiSelect):
   - Drive, Gmail, Calendar, Docs, Sheets, Chat
   - Default recommended set: `drive,gmail,calendar,docs,sheets`
   - ⚠️ Tool limit warning: each service exposes 10-80 tools, total should stay under 100

4. Execute setup:
   ```bash
   npm install -g @googleworkspace/cli
   # Path A: set env var for SA key
   # Path B: manual OAuth flow
   claude mcp add google-workspace --transport stdio -- gws mcp -s <selected-services>
   ```

5. Verify: "Google Drive에서 최근 파일 목록을 보여줘"

#### 3B. Notion

1. AskUserQuestion — Setup method:
   - **Hosted MCP** (권장): Zero-install, OAuth only
   - **Plugin**: Local install

2. Read `references/notion-setup.md` — follow selected method

3. Execute setup:
   ```bash
   # Hosted MCP (recommended)
   claude mcp add notion --transport http --url https://mcp.notion.com/mcp
   # Then complete OAuth in browser
   ```

4. Verify: "Notion에서 페이지 검색해줘"

### Phase 4: Verify & Report

Output connection status table:

| Tool | Status | Server | Notes |
|------|--------|--------|-------|
| Google Workspace | ✅ Connected | gws -s drive,gmail | Path A |
| Notion | ✅ Connected | hosted MCP | OAuth complete |

## Decision Framework

### Authentication Path Selection
| Situation | Path | Time |
|-----------|------|------|
| IT에서 Service Account 키 수령 | Path A (권장) | ~15min |
| IT 지원 없음 / 자가 설정 | Path B | ~45min |
| 이미 설정됨 | Skip | - |

### Fallback
- gws 동작 불가 시: IT팀에 문의 안내
- 대안 서버 상세 가이드는 YAGNI — 필요 시 추가

### Conflict Handling
- Google Drive MCP already exists → ask: replace or keep?
- Notion MCP already exists → skip with notice

## Response Format

Each phase outputs:
1. **Phase header** with progress indicator
2. **Action items** with exact commands
3. **Verification result** with pass/fail

Final output: connection status table (Phase 4)

## Key Principles

1. **Non-destructive** — 기존 MCP 설정을 확인 없이 수정하지 않는다
2. **Platform-aware** — Cowork/CLI 모두 동작하는 명령 제공
3. **Two paths** — IT 관리형과 자가 설정 모두 지원
4. **Progressive** — 선택한 도구만 설정 (불필요한 도구 강제하지 않음)
5. **Transparent** — 비공식/커뮤니티 도구는 명확히 표시

## References

- `references/google-workspace-setup.md` — Google Workspace 상세 설정 가이드
- `references/notion-setup.md` — Notion 상세 설정 가이드
- `references/admin-guide.md` — IT Admin용 사전 설정 가이드
