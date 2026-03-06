#!/bin/bash
#
# Skills for Workers — Install Script (Mac/Linux)
#
# Usage:
#   ./skills-install.sh <skills-zip>
#   ./skills-install.sh <skills-zip> --all        # skip optional prompts, install everything
#   ./skills-install.sh <skills-zip> --required    # install required only
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="${HOME}/.claude/skills"
TEMP_DIR=""

# --- Cleanup ---

cleanup() {
  if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
  fi
}
trap cleanup EXIT INT TERM

# --- Helpers ---

usage() {
  cat <<EOF
Skills for Workers — 설치 스크립트

Usage:
  $(basename "$0") <skills-zip>
  $(basename "$0") <skills-zip> --all        전체 설치 (optional 포함)
  $(basename "$0") <skills-zip> --required   required만 설치

Options:
  --all        optional 스킬을 확인 없이 모두 설치
  --required   required 스킬만 설치 (optional 건너뜀)
  -h, --help   도움말
EOF
}

log_info() {
  echo "[INFO] $*"
}

log_warn() {
  echo "[WARN] $*" >&2
}

log_error() {
  echo "[ERROR] $*" >&2
}

# --- JSON Parsing ---

# Parse manifest.json using python3 (Mac default) or grep/sed fallback
parse_json_field() {
  local file="$1"
  local query="$2"  # python expression to extract value

  if command -v python3 >/dev/null 2>&1; then
    python3 -c "
import json, sys
with open('$file') as f:
    data = json.load(f)
$query
"
  else
    log_warn "python3 not found — using fallback parser (limited)"
    return 1
  fi
}

# Get list of skills from manifest.json
# Output: name|description|dept|required (one per line)
get_skills_from_manifest() {
  local manifest="$1"
  parse_json_field "$manifest" "
for s in data['skills']:
    print(f\"{s['name']}|{s['description']}|{s.get('dept','all')}|{s.get('required',False)}\")
"
}

# --- SHA256 Verification ---

verify_sha256() {
  local zip_file="$1"
  local version_file="$2"

  if [ ! -f "$version_file" ]; then
    log_warn "version.json을 찾을 수 없습니다. 무결성 검증을 건너뜁니다."
    return 0
  fi

  local expected_hash
  expected_hash=$(parse_json_field "$version_file" "print(data.get('sha256',''))") || {
    log_warn "version.json 파싱 실패. 무결성 검증을 건너뜁니다."
    return 0
  }

  if [ -z "$expected_hash" ]; then
    log_warn "version.json에 sha256 필드가 없습니다. 무결성 검증을 건너뜁니다."
    return 0
  fi

  local actual_hash
  actual_hash=$(shasum -a 256 "$zip_file" | cut -d' ' -f1)

  if [ "$expected_hash" != "$actual_hash" ]; then
    log_error "SHA256 불일치!"
    log_error "  예상: $expected_hash"
    log_error "  실제: $actual_hash"
    log_error "파일이 손상되었거나 변조되었을 수 있습니다. 다시 다운로드해 주세요."
    return 1
  fi

  log_info "SHA256 검증 통과"
}

# --- Diff Detection ---

# Compute composite hash for a skill directory (excludes node_modules, .jobs)
compute_skill_hash() {
  local skill_dir="$1"
  if [ ! -d "$skill_dir" ]; then
    echo ""
    return
  fi
  find "$skill_dir" -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.jobs/*" \
    -not -name ".DS_Store" \
    | sort | xargs cat 2>/dev/null | shasum -a 256 | cut -d' ' -f1
}

# --- Install ---

install_skill() {
  local src_dir="$1"
  local skill_name="$2"
  local dest_dir="${SKILLS_DIR}/${skill_name}"

  # Preserve council.config.yaml if it exists
  local preserved_config=""
  if [ -f "${dest_dir}/council.config.yaml" ]; then
    preserved_config=$(mktemp)
    cp "${dest_dir}/council.config.yaml" "$preserved_config"
  fi

  # Remove existing symlink or directory
  if [ -L "$dest_dir" ]; then
    rm "$dest_dir"
  elif [ -d "$dest_dir" ]; then
    rm -rf "$dest_dir"
  fi

  # Copy skill
  cp -r "$src_dir" "$dest_dir"

  # Restore preserved config
  if [ -n "$preserved_config" ] && [ -f "$preserved_config" ]; then
    cp "$preserved_config" "${dest_dir}/council.config.yaml"
    rm "$preserved_config"
  fi

  # Run npm install if package.json exists
  if [ -f "${dest_dir}/package.json" ]; then
    if command -v npm >/dev/null 2>&1; then
      (cd "$dest_dir" && npm install --production --silent 2>/dev/null) || {
        log_warn "${skill_name}: npm install 실패. extended 모드를 사용하려면 수동으로 npm install을 실행하세요."
      }
    else
      log_warn "${skill_name}: npm이 설치되어 있지 않습니다. extended 모드를 사용하려면 Node.js를 설치하세요."
    fi
  fi
}

# Prompt user for Y/n (default: Y)
confirm_yes() {
  local prompt="$1"
  local response
  printf "%s [Y/n] " "$prompt"
  read -r response
  case "$response" in
    [nN]*) return 1 ;;
    *) return 0 ;;
  esac
}

# Prompt user for y/N (default: N)
confirm_no() {
  local prompt="$1"
  local response
  printf "%s [y/N] " "$prompt"
  read -r response
  case "$response" in
    [yY]*) return 0 ;;
    *) return 1 ;;
  esac
}

# --- Main ---

main() {
  local zip_file=""
  local mode="interactive"  # interactive | all | required

  # Parse arguments
  while [ $# -gt 0 ]; do
    case "$1" in
      -h|--help)
        usage
        exit 0
        ;;
      --all)
        mode="all"
        shift
        ;;
      --required)
        mode="required"
        shift
        ;;
      -*)
        log_error "알 수 없는 옵션: $1"
        usage
        exit 1
        ;;
      *)
        if [ -z "$zip_file" ]; then
          zip_file="$1"
        else
          log_error "인자가 너무 많습니다."
          usage
          exit 1
        fi
        shift
        ;;
    esac
  done

  if [ -z "$zip_file" ]; then
    usage
    exit 1
  fi

  if [ ! -f "$zip_file" ]; then
    log_error "파일을 찾을 수 없습니다: $zip_file"
    exit 1
  fi

  echo ""
  echo "╔══════════════════════════════════════╗"
  echo "║   Skills for Workers — 설치 시작     ║"
  echo "╚══════════════════════════════════════╝"
  echo ""

  # Resolve absolute path
  zip_file="$(cd "$(dirname "$zip_file")" && pwd)/$(basename "$zip_file")"
  local zip_dir
  zip_dir="$(dirname "$zip_file")"

  # SHA256 verification
  local version_file="${zip_dir}/version.json"
  verify_sha256 "$zip_file" "$version_file" || exit 1

  # Unzip to temp directory
  TEMP_DIR=$(mktemp -d)
  log_info "압축 해제 중..."
  unzip -q "$zip_file" -d "$TEMP_DIR"

  # Find manifest.json
  local manifest="${TEMP_DIR}/manifest.json"
  if [ ! -f "$manifest" ]; then
    log_error "manifest.json을 찾을 수 없습니다. 올바른 배포 zip인지 확인하세요."
    exit 1
  fi

  # Find skills directory in extracted content
  local src_skills_dir="${TEMP_DIR}/skills"
  if [ ! -d "$src_skills_dir" ]; then
    log_error "skills/ 디렉토리를 찾을 수 없습니다."
    exit 1
  fi

  # Ensure target directory exists
  mkdir -p "$SKILLS_DIR"

  # Parse manifest and process skills
  local installed=0
  local skipped=0
  local updated=0
  local installed_names=""

  while IFS='|' read -r name description dept required; do
    local src="${src_skills_dir}/${name}"

    # Skip if source doesn't exist in zip
    if [ ! -d "$src" ]; then
      log_warn "${name}: zip에 포함되지 않음, 건너뜀"
      continue
    fi

    local is_required=false
    [ "$required" = "True" ] && is_required=true

    local dest="${SKILLS_DIR}/${name}"

    # Compute hashes for diff detection
    local src_hash
    local dest_hash
    src_hash=$(compute_skill_hash "$src")
    dest_hash=$(compute_skill_hash "$dest")
    local has_diff=true
    [ "$src_hash" = "$dest_hash" ] && has_diff=false

    # Decision logic
    local should_install=false

    if $is_required; then
      if [ ! -d "$dest" ] && [ ! -L "$dest" ]; then
        # New required skill — auto install
        should_install=true
      elif $has_diff; then
        # Existing required skill with changes
        if [ "$mode" = "interactive" ]; then
          echo ""
          log_info "${name} (필수) — 변경 사항이 있습니다."
          confirm_yes "  업데이트할까요?" && should_install=true
        else
          should_install=true
        fi
      else
        skipped=$((skipped + 1))
        continue
      fi
    else
      # Optional skill
      if [ "$mode" = "required" ]; then
        skipped=$((skipped + 1))
        continue
      fi

      if [ ! -d "$dest" ] && [ ! -L "$dest" ]; then
        # New optional skill
        if [ "$mode" = "interactive" ]; then
          local dept_label=""
          [ "$dept" != "all" ] && dept_label=" (${dept})"
          echo ""
          confirm_no "  ${name}${dept_label} — ${description} 설치할까요?" && should_install=true
        elif [ "$mode" = "all" ]; then
          should_install=true
        fi
      elif $has_diff; then
        # Existing optional skill with changes
        if [ "$mode" = "interactive" ]; then
          echo ""
          log_info "${name} (선택) — 변경 사항이 있습니다."
          confirm_yes "  업데이트할까요?" && should_install=true
        elif [ "$mode" = "all" ]; then
          should_install=true
        fi
      else
        skipped=$((skipped + 1))
        continue
      fi
    fi

    if $should_install; then
      local was_existing=false
      ([ -d "$dest" ] || [ -L "$dest" ]) && was_existing=true

      install_skill "$src" "$name"
      if [ -d "$dest" ] || [ -L "$dest" ]; then
        if $was_existing; then
          updated=$((updated + 1))
        else
          installed=$((installed + 1))
        fi
        installed_names="${installed_names}  ✓ ${name}\n"
      fi
    else
      skipped=$((skipped + 1))
    fi
  done < <(get_skills_from_manifest "$manifest")

  # Summary
  echo ""
  echo "════════════════════════════════════════"
  echo "  설치 완료"
  echo "════════════════════════════════════════"
  if [ -n "$installed_names" ]; then
    printf "%b" "$installed_names"
  fi
  echo ""
  echo "  새로 설치: ${installed}개"
  echo "  업데이트:  ${updated}개"
  echo "  건너뜀:    ${skipped}개"
  echo ""
  echo "  설치 경로: ${SKILLS_DIR}"
  echo "════════════════════════════════════════"
  echo ""
}

main "$@"
