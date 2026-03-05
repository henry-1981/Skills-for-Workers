# Lint Rules Detail

Each rule's expected behavior, edge cases, and remediation steps.

## FAIL Rules

### F1: `name` exists and matches directory name

**What it checks**: The YAML frontmatter field `name` must exist and its value must exactly match the directory basename.

**Pass example**:
```
# File: skills/nda-triage/SKILL.md
---
name: nda-triage
---
```
→ basename = `nda-triage`, name = `nda-triage` → PASS

**Fail examples**:
```
# name field missing entirely
---
origin: "Original work"
description: "..."
---
```
→ FAIL: `name` field not found

```
# name does not match directory
# File: skills/nda-triage/SKILL.md
---
name: nda-screening
---
```
→ FAIL: name `nda-screening` != directory `nda-triage`

**Edge cases**:
- Trailing whitespace in name value: strip before comparison
- Quoted vs unquoted YAML: `name: nda-triage` and `name: "nda-triage"` are equivalent
- YAML comments on the name line: `name: nda-triage # comment` — parse value only

**Remediation**: Set `name` to the exact directory basename.

---

### F2: `name` format compliance

**What it checks**: The `name` value must contain only lowercase letters (a-z), digits (0-9), and hyphens (-). No consecutive hyphens, no leading/trailing hyphens, max 64 characters.

**Pass examples**:
- `name: skill-lint` → PASS
- `name: k-sunshine` → PASS
- `name: my-skill-v2` → PASS

**Fail examples**:
- `name: Skill-Lint` → FAIL: uppercase letters
- `name: skill_lint` → FAIL: underscores not allowed
- `name: skill--lint` → FAIL: consecutive hyphens
- `name: -skill-lint` → FAIL: leading hyphen
- `name: skill-lint-` → FAIL: trailing hyphen
- `name: a` repeated 65 times → FAIL: exceeds 64 characters

**Edge cases**:
- Single character names like `a` are valid
- Pure numeric names like `123` are valid (though unusual)
- Names with only hyphens like `-` are invalid (leading/trailing)

**Remediation**: Rename the directory and update the `name` field. Use only `a-z`, `0-9`, `-`.

---

### F3: `description` exists and is non-empty

**What it checks**: The `description` field must exist in the frontmatter and contain at least one non-whitespace character.

**Pass example**:
```yaml
description: >
  Validate skill directories against spec.
```

**Fail examples**:
```yaml
# Missing entirely
---
name: my-skill
origin: "Original work"
---
```

```yaml
# Empty value
description:
```

```yaml
# Whitespace only
description: "   "
```

**Edge cases**:
- YAML `>` (folded) and `|` (literal) block scalars: resolve the scalar first, then check
- Description with only newlines after folding: FAIL

**Remediation**: Add a meaningful description with trigger keywords.

---

### F4: `description` ≤ 1024 characters

**What it checks**: After resolving YAML multiline syntax (`>`, `|`, `>-`, `|-`), the plain text length must not exceed 1024 characters.

**Pass example**:
```yaml
description: >
  Screen incoming NDAs and classify as GREEN/YELLOW/RED.
  Triggers: NDA review, NDA triage
```
→ Resolved text: `Screen incoming NDAs and classify as GREEN/YELLOW/RED. Triggers: NDA review, NDA triage\n` → 91 chars → PASS

**Fail example**:
A description block that resolves to 1025+ characters → FAIL

**Edge cases**:
- YAML folded scalar (`>`): replaces single newlines with spaces, preserves double newlines as `\n`
- YAML literal scalar (`|`): preserves newlines as-is
- Trailing newline from YAML: include in count (spec does not specify trimming)
- Multi-byte characters (Korean): count characters, not bytes. `"한"` = 1 character

**Remediation**: Shorten the description. Move detailed documentation to the SKILL.md body or references/.

---

### F5: `origin` field exists

**What it checks**: The `origin` field must be present in the frontmatter. This is a project convention (not part of the Anthropic spec).

**Pass examples**:
- `origin: "Original work"`
- `origin: "Forked from anthropics/knowledge-work-plugins (Apache 2.0)"`
- `origin: "Derived from internal-project"`

**Fail example**:
```yaml
---
name: my-skill
description: "..."
---
```
→ FAIL: `origin` field not found

**Edge cases**:
- Empty string `origin: ""` is technically present but semantically empty. Current rule: PASS (existence check only). Recommend a WARN for empty origin in future iterations.

**Remediation**: Add `origin` to the frontmatter with the source of the skill.

---

## WARN Rules

### W1: Description contains Korean keywords

**What it checks**: The resolved description text contains at least one Hangul syllable character (Unicode range U+AC00–U+D7AF).

**Pass example**:
```yaml
description: >
  NDA screening. Triggers: NDA 검토, 비밀유지계약
```
→ `검` (U+AC80) found → PASS

**Fail example**:
```yaml
description: "Validate skill directories. Triggers: lint, validate"
```
→ No Hangul found → WARN

**Edge cases**:
- Hangul Jamo (U+1100–U+11FF) and Hangul Compatibility Jamo (U+3130–U+318F): not checked. Only precomposed syllables count
- Korean text in quotation marks still counts

**Remediation**: Add Korean trigger keywords to the description for bilingual discoverability.

---

### W2: Description contains English keywords

**What it checks**: The resolved description contains at least one substantive English word (2+ consecutive ASCII letters a-z/A-Z).

**Pass example**:
```yaml
description: >
  NDA 스크리닝. Triggers: NDA review
```
→ "NDA", "review" found → PASS

**Fail example**:
```yaml
description: "스킬 디렉토리를 검증합니다."
```
→ No English word found → WARN

**Edge cases**:
- Single characters like `a` or `I` do not count (min 2 chars)
- Abbreviations like "NDA" count as English words
- Mixed strings like "SKILL.md" — "SKILL" portion counts

**Remediation**: Add English trigger keywords or at minimum an English description summary.

---

### W3: SKILL.md ≤ 500 lines

**What it checks**: Total line count of the SKILL.md file.

**Pass**: ≤ 500 lines → PASS
**Warn**: > 500 lines → WARN with actual count

**Edge cases**:
- Trailing newline at EOF: counts as a line if present
- Empty lines count

**Remediation**: Move detailed content to `references/` files. Keep SKILL.md as the orchestration layer.

---

### W4: SKILL.md ≥ 50 lines

**What it checks**: Total line count of the SKILL.md file.

**Pass**: ≥ 50 lines → PASS
**Warn**: < 50 lines → WARN with actual count

**Edge cases**:
- A minimal valid SKILL.md (frontmatter + one heading + one paragraph) could be ~15 lines. This is technically valid but indicates minimal content.

**Remediation**: Flesh out the SKILL.md with at least a Workflow section and basic instructions.

---

### W5: Referenced files in References section exist

**What it checks**: Extracts file paths from the `## References` section that match the pattern `references/...` and verifies each file exists on disk.

**Pass example**:
```markdown
## References
- `references/rules-detail.md` — Rule details
```
→ File exists at `skills/skill-lint/references/rules-detail.md` → PASS

**Fail example**:
```markdown
## References
- `references/deleted-file.md` — No longer exists
```
→ File not found → WARN

**Edge cases**:
- No `## References` section at all: SKIP (not WARN). Some skills may not need references
- References section exists but lists no `references/` paths: PASS
- Paths with subdirectories: `references/sub/file.md` — check relative to the skill directory
- Backtick-wrapped paths: extract from inside backticks
- Bare paths without backticks: also match `references/` prefix in the line

**Remediation**: Either create the missing file or remove the reference from the References section.

---

## INFO Rules

### I1: Recommended sections present

**What it checks**: Scans for `## ` level-2 headings in the SKILL.md body (below frontmatter) and checks for the presence of 5 recommended sections: Overview, Workflow, Response Format, Key Principles, References.

**Matching logic**: Case-insensitive substring match with synonyms.

| Recommended | Accepted synonyms (substring match) |
|-------------|--------------------------------------|
| Overview | overview, introduction, 소개 |
| Workflow | workflow, process, 워크플로우 |
| Response Format | response format, output format, 보고서, 응답 형식 |
| Key Principles | key principles, invariants, core rules, 핵심 원칙, 불변 규칙 |
| References | references, 참조, 레퍼런스 |

**Examples**:
- `## Pipeline Overview` → matches Overview (contains "overview")
- `## Assessment Workflow` → matches Workflow (contains "workflow")
- `## Invariants (불변 규칙)` → matches Key Principles (contains "invariants")
- `## NDA Screening Criteria and Checklist` → matches nothing (no synonym hit)

**Edge cases**:
- `### ` level-3 headings do not count as section matches
- A heading matching multiple categories counts for all of them
- Headings inside fenced code blocks (` ``` `) should be ignored

**Remediation**: No action required — INFO only. Consider adding missing sections if they would improve the skill's usability.

---

### I2: Unreferenced files in references/

**What it checks**: Lists files in the `references/` directory and checks if each file is mentioned somewhere in the SKILL.md body text.

**Matching logic**: Search for the filename (e.g., `rules-detail.md`) or the relative path (e.g., `references/rules-detail.md`) anywhere in the SKILL.md body.

**Pass example**:
```
# references/ contains: rules-detail.md
# SKILL.md body contains: `references/rules-detail.md`
```
→ All files referenced → INFO: "All referenced"

**Unreferenced example**:
```
# references/ contains: rules-detail.md, old-draft.md
# SKILL.md body mentions only: references/rules-detail.md
```
→ INFO: "Unreferenced: old-draft.md"

**Edge cases**:
- `references/` directory does not exist: SKIP
- `references/` directory is empty: SKIP
- Hidden files (`.gitkeep`): ignore
- Non-markdown files (images, PDFs): still check for references
- Files referenced only in other reference files (not SKILL.md): report as unreferenced. The check is SKILL.md-only.

**Remediation**: No action required — INFO only. Consider removing unused reference files or adding references to them in SKILL.md.
