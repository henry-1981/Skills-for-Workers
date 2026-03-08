#!/bin/bash
#
# Skills for Workers — Lint Script
#
# Validates skills against F1-F5 FAIL rules + W7 security check.
# Uses Python3 for YAML parsing (with regex fallback).
#
# Usage:
#   ./scripts/lint-skills.sh                    # batch lint all skills
#   ./scripts/lint-skills.sh skills/tool-setup  # single skill lint
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# --- Counters ---

TOTAL_SKILLS=0
TOTAL_PASS=0
TOTAL_FAIL=0
TOTAL_WARN=0

# --- Helpers ---

log_pass() { echo "  $1 PASS  $2"; }
log_fail() { echo "  $1 FAIL  $2"; }
log_warn() { echo "  $1 WARN  $2"; }

# --- Create Python linter as temp file ---

LINT_PY=""
cleanup() {
  [ -n "$LINT_PY" ] && [ -f "$LINT_PY" ] && rm -f "$LINT_PY"
}
trap cleanup EXIT INT TERM

create_linter() {
  LINT_PY=$(mktemp /tmp/lint-skill.XXXXXX.py)
  cat > "$LINT_PY" << 'PYEOF'
import sys, os, re

skill_md_path = sys.argv[1]
skill_name = sys.argv[2]
skill_dir = sys.argv[3]

with open(skill_md_path, 'r', encoding='utf-8') as f:
    content = f.read()

# --- Parse frontmatter ---
fm_match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
fm_data = {}

if fm_match:
    fm_text = fm_match.group(1)
    try:
        import yaml
        parsed = yaml.safe_load(fm_text)
        if isinstance(parsed, dict):
            fm_data = parsed
    except ImportError:
        def extract_field(text, field):
            m = re.search(rf'^{field}\s*:\s*(.*)$', text, re.MULTILINE)
            if not m:
                return None
            val = m.group(1).strip()
            if (val.startswith('"') and val.endswith('"')) or \
               (val.startswith("'") and val.endswith("'")):
                val = val[1:-1]
            if val in ('>', '|', '>-', '|-', '>+', '|+', ''):
                lines_after = text[m.end():]
                block_lines = []
                for line in lines_after.split('\n'):
                    if line and (line[0] == ' ' or line[0] == '\t'):
                        block_lines.append(line.strip())
                    elif not line.strip():
                        block_lines.append('')
                    else:
                        break
                if val.startswith('>'):
                    return ' '.join(l for l in block_lines if l).strip()
                elif val.startswith('|'):
                    return '\n'.join(block_lines).strip()
                else:
                    return ' '.join(l for l in block_lines if l).strip()
            if ' #' in val:
                val = val[:val.index(' #')].strip()
            return val

        for field in ('name', 'description', 'origin'):
            v = extract_field(fm_text, field)
            if v is not None:
                fm_data[field] = v

has_fail = False

# --- F1: name exists + matches directory ---
fm_name = fm_data.get('name')
if fm_name is not None:
    fm_name = str(fm_name).strip()

if not fm_name:
    print('FAIL|F1|name field missing')
    has_fail = True
elif fm_name != skill_name:
    print(f'FAIL|F1|name="{fm_name}", dir="{skill_name}" (mismatch)')
    has_fail = True
else:
    print(f'PASS|F1|name="{fm_name}", dir="{skill_name}"')

# --- F2: name format ---
if fm_name:
    name_pattern = r'^[a-z0-9]([a-z0-9]*(-[a-z0-9]+)*)?$'
    if len(fm_name) > 64:
        print(f'FAIL|F2|too long ({len(fm_name)} chars, max 64)')
        has_fail = True
    elif not re.match(name_pattern, fm_name):
        print(f'FAIL|F2|invalid format: "{fm_name}"')
        has_fail = True
    else:
        print(f'PASS|F2|format ok ({len(fm_name)} chars)')
else:
    print('FAIL|F2|cannot check (name missing)')
    has_fail = True

# --- F3: description exists + non-empty ---
fm_desc = fm_data.get('description')
if fm_desc is not None:
    fm_desc = str(fm_desc).strip()

if not fm_desc:
    print('FAIL|F3|description missing or empty')
    has_fail = True
else:
    desc_len = len(fm_desc)
    print(f'PASS|F3|description present ({desc_len} chars)')

# --- F4: description <= 1024 chars ---
if fm_desc:
    desc_len = len(fm_desc)
    if desc_len <= 1024:
        print(f'PASS|F4|description <= 1024 ({desc_len} chars)')
    else:
        print(f'FAIL|F4|description too long ({desc_len} chars, max 1024)')
        has_fail = True
else:
    print('FAIL|F4|cannot check (description missing)')
    has_fail = True

# --- F5: origin exists ---
if 'origin' in fm_data:
    print('PASS|F5|origin present')
else:
    print('FAIL|F5|origin field missing')
    has_fail = True

# --- W7: Security patterns in references/ ---
refs_dir = os.path.join(skill_dir, 'references')
if os.path.isdir(refs_dir) and os.listdir(refs_dir):
    sec_patterns = [
        ('email', r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'),
        ('api_key', r'(?i)(api[_\-]?key|secret|token|password)\s*[:=]\s*[\'\""]?[a-zA-Z0-9]{16,}'),
        ('amount', r'\u20a9[0-9,]+|[0-9,]+\uc6d0|\$[0-9,]+'),
    ]
    w7_warns = []
    for root, dirs, files in os.walk(refs_dir):
        for fname in files:
            if fname.startswith('.'):
                continue
            fpath = os.path.join(root, fname)
            rel = os.path.relpath(fpath, refs_dir)
            try:
                with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                    file_content = f.read()
            except Exception:
                continue
            for pname, pat in sec_patterns:
                matches = re.findall(pat, file_content)
                if matches:
                    w7_warns.append(f'    {rel}: {pname} pattern ({len(matches)} match)')

    if w7_warns:
        print('WARN|W7|sensitive patterns found:')
        for w in w7_warns:
            print(f'WARNDETAIL|W7|{w}')
    else:
        print('PASS|W7|no sensitive patterns')
else:
    print('PASS|W7|no references/ to scan')

sys.exit(1 if has_fail else 0)
PYEOF
}

# --- Lint Single Skill ---

lint_skill() {
  local skill_dir="$1"
  local skill_name
  skill_name=$(basename "$skill_dir")
  local skill_md="${skill_dir}/SKILL.md"

  # Derive relative path from repo root for display
  local display_path="${skill_dir#${REPO_ROOT}/}"
  echo ""
  echo "Lint: ${display_path}"

  # Check SKILL.md exists
  if [ ! -f "$skill_md" ]; then
    log_fail "F0" "SKILL.md not found"
    TOTAL_SKILLS=$((TOTAL_SKILLS + 1))
    TOTAL_FAIL=$((TOTAL_FAIL + 1))
    return 1
  fi

  # Run all checks via Python
  local result
  local py_exit=0
  result=$(python3 "$LINT_PY" "$skill_md" "$skill_name" "$skill_dir" 2>&1) || py_exit=$?

  # Display results
  while IFS='|' read -r level rule detail; do
    case "$level" in
      PASS) log_pass "$rule" "$detail" ;;
      FAIL) log_fail "$rule" "$detail" ;;
      WARN) log_warn "$rule" "$detail" ;;
      WARNDETAIL) echo "$detail" ;;
    esac
  done <<< "$result"

  # Update counters
  TOTAL_SKILLS=$((TOTAL_SKILLS + 1))
  if [ $py_exit -ne 0 ]; then
    TOTAL_FAIL=$((TOTAL_FAIL + 1))
    return 1
  else
    if echo "$result" | grep -q '^WARN|'; then
      TOTAL_WARN=$((TOTAL_WARN + 1))
    fi
    TOTAL_PASS=$((TOTAL_PASS + 1))
    return 0
  fi
}

# --- Main ---

main() {
  local target="$1"
  local exit_code=0

  # Check python3
  if ! command -v python3 >/dev/null 2>&1; then
    echo "[ERROR] python3 is required for lint-skills.sh" >&2
    exit 1
  fi

  create_linter

  if [ -n "$target" ]; then
    # Single skill lint
    local skill_dir
    skill_dir="$(echo "$target" | sed 's:/*$::')"
    if [[ "$skill_dir" != /* ]]; then
      skill_dir="${REPO_ROOT}/${skill_dir}"
    fi

    if [ ! -d "$skill_dir" ]; then
      echo "[ERROR] Directory not found: $skill_dir" >&2
      exit 1
    fi

    lint_skill "$skill_dir" || exit_code=1
  else
    # Batch lint: discover SKILL.md in plugin structure
    for skill_md in "${REPO_ROOT}"/skills/*/skills/*/SKILL.md; do
      [ ! -f "$skill_md" ] && continue
      skill_dir=$(dirname "$skill_md")
      lint_skill "$skill_dir" || exit_code=1
    done
  fi

  # Summary
  echo ""
  echo "Summary: ${TOTAL_PASS}/${TOTAL_SKILLS} PASS, ${TOTAL_FAIL} FAIL, ${TOTAL_WARN} WARN"

  exit $exit_code
}

main "$@"
