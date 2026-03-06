#!/bin/bash
#
# Skills for Workers — Skill Submit Script (Mac/Linux)
#
# Usage:
#   ./skill-submit.sh <skill-directory>
#
# Packages a skill directory into a zip file for submission.
#

set -e

usage() {
  cat <<EOF
Skills for Workers — 스킬 제출 스크립트

Usage:
  $(basename "$0") <skill-directory>

스킬 디렉토리를 zip으로 패키징하고 제출 방법을 안내합니다.

예시:
  $(basename "$0") skills/my-new-skill
  $(basename "$0") ~/my-skill
EOF
}

log_info() { echo "[INFO] $*"; }
log_error() { echo "[ERROR] $*" >&2; }

# --- Main ---

if [ $# -eq 0 ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  usage
  exit 0
fi

SKILL_DIR="$1"

# Validate directory
if [ ! -d "$SKILL_DIR" ]; then
  log_error "디렉토리를 찾을 수 없습니다: $SKILL_DIR"
  exit 1
fi

# Check SKILL.md
if [ ! -f "${SKILL_DIR}/SKILL.md" ]; then
  log_error "SKILL.md를 찾을 수 없습니다. 올바른 스킬 디렉토리인지 확인하세요."
  exit 1
fi

# Extract skill name from frontmatter
SKILL_NAME=""
if command -v python3 >/dev/null 2>&1; then
  SKILL_NAME=$(python3 -c "
import re, sys
with open('${SKILL_DIR}/SKILL.md') as f:
    content = f.read()
m = re.search(r'^name:\s*(.+)', content, re.MULTILINE)
if m:
    print(m.group(1).strip())
" 2>/dev/null) || true
fi

if [ -z "$SKILL_NAME" ]; then
  # Fallback: grep
  SKILL_NAME=$(grep -m1 '^name:' "${SKILL_DIR}/SKILL.md" | sed 's/^name:\s*//' | tr -d '[:space:]') || true
fi

if [ -z "$SKILL_NAME" ]; then
  log_error "SKILL.md에서 name 필드를 찾을 수 없습니다."
  log_error "frontmatter에 'name: your-skill-name'이 포함되어야 합니다."
  exit 1
fi

# Validate name format
if ! echo "$SKILL_NAME" | grep -qE '^[a-z][a-z0-9-]*$'; then
  log_error "스킬 이름이 규칙에 맞지 않습니다: $SKILL_NAME"
  log_error "소문자 + 하이픈만 사용 가능합니다 (예: my-skill-name)"
  exit 1
fi

log_info "스킬 이름: $SKILL_NAME"

# Build zip
OUTPUT_FILE="${SKILL_NAME}-submit.zip"
log_info "패키징 중..."

(cd "$(dirname "$SKILL_DIR")" && zip -r "$OLDPWD/${OUTPUT_FILE}" "$(basename "$SKILL_DIR")" \
  -x "*/node_modules/*" \
  -x "*/.jobs/*" \
  -x "*/.DS_Store" \
  -x "*/council.config.yaml" \
  -x "*/*.skill" \
  -x "*/*.zip" \
  -x "*/.gitkeep" \
)

log_info "패키징 완료: ${OUTPUT_FILE}"

echo ""
echo "════════════════════════════════════════"
echo "  스킬 제출 방법"
echo "════════════════════════════════════════"
echo ""
echo "  방법 1 (권장): 개발자에게 ${OUTPUT_FILE} 전달"
echo "           → PR로 레포에 추가"
echo ""
echo "  방법 2: Google Drive 'Skills for Workers > submissions'"
echo "           폴더에 ${OUTPUT_FILE} 업로드"
echo ""
echo "════════════════════════════════════════"
echo ""
