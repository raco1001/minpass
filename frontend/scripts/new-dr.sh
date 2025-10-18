#!/usr/bin/env sh
set -eu

# --- settings ---
BASE_DIR="docs/architecture/decision-logs"

# --- helpers ---
slugify() {
  # to lower, spaces->-, remove non [a-z0-9-]
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[[:space:]]+/-/g; s/[^a-z0-9-]//g; s/-+/-/g; s/^-+|-+$//g'
}

today_ymd() {
  date +%Y-%m-%d
}

today_compact() {
  date +%Y%m%d
}

# YAML value escaper - adds quotes if special chars detected
yaml_escape() {
  local val="$1"
  
  # Empty value
  if [ -z "$val" ]; then
    echo "''"
    return
  fi
  
  # Check if value needs quoting (YAML special cases):
  # - contains colon ':'
  # - starts with special chars: # @ & * ! | > - ? [ { '
  # - contains: { } [ ] , & * ! | > ' " % @
  # - has leading/trailing whitespace
  # - is a boolean-like value: true, false, yes, no, on, off
  if echo "$val" | grep -qE '(:|^[#@&*!|>?\[{'\''"-]|[\{\}\[\],&*!|>'\''"%@]|^[[:space:]]|[[:space:]]$)' || \
    echo "$val" | grep -qiE '^(true|false|yes|no|on|off|null)$'; then
    # Escape single quotes by doubling them, wrap in single quotes
    echo "'$(echo "$val" | sed "s/'/''/g")'"
  else
    echo "$val"
  fi
}

# Validate status value
validate_status() {
  case "$1" in
    Proposed|Accepted|Deprecated|Superseded) return 0 ;;
    *) return 1 ;;
  esac
}

OWNER="${GIT_AUTHOR_NAME:-$(git config user.name 2>/dev/null || echo '')}"
[ -z "$OWNER" ] && OWNER="fe-lead"

# --- Interactive prompts with validation ---
printf "DR Title (ex: \"Adopt SessionGuard at app/routes\"): "
read -r TITLE

if [ -z "${TITLE:-}" ]; then
  echo "✗ Title cannot be empty."; exit 1
fi

# Trim leading/trailing whitespace from title
TITLE="$(echo "$TITLE" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"

printf "Status [Proposed/Accepted/Deprecated/Superseded] (default: Proposed): "
read -r STATUS
[ -z "${STATUS:-}" ] && STATUS="Proposed"

# Validate status
if ! validate_status "$STATUS"; then
  echo "⚠ Warning: '$STATUS' is not a standard status. Using anyway."
fi

printf "Owner/Author (default: %s): " "$OWNER"
read -r OVERRIDE_OWNER
[ -n "${OVERRIDE_OWNER:-}" ] && OWNER="$OVERRIDE_OWNER"

printf "Notes (optional, leave empty if none): "
read -r NOTES

SLUG="$(slugify "$TITLE")"
DATE_CMP="$(today_compact)"
DATE_YMD="$(today_ymd)"
ID="DR-${DATE_CMP}-${SLUG}"

# Apply YAML escaping to values
TITLE_YAML="$(yaml_escape "$TITLE")"
NOTES_YAML="$(yaml_escape "${NOTES:-}")"

mkdir -p "$BASE_DIR"
FILE_PATH="${BASE_DIR}/${ID}.md"

if [ -e "$FILE_PATH" ]; then
  echo "✗ Already exists: $FILE_PATH"; exit 1
fi

# Generate file with properly escaped YAML
cat > "$FILE_PATH" <<EOF
---
id: ${ID}
title: ${TITLE_YAML}
status: ${STATUS}
owners: [${OWNER}]
created: ${DATE_YMD}
updated: ${DATE_YMD}
notes: ${NOTES_YAML}
---

# ${TITLE}

## 1. Context
- Problem / Trigger:
- Scope:
- Assumptions:
- Background:

## 2. Goals & Non-Goals
- Goals:
- Non-Goals:

## 3. Options Considered
- Option A —
- Option B —
- Option C —

## 4. Decision
- Chosen Option:
- Decision Type: Reversible | Irreversible
- Decision Horizon: short | medium | long

## 5. Rationale
- 

## 6. Consequences
- Positive:
- Negative / Risks:
- Mitigations:

## 7. Implementation Plan
- Owners:
- Milestones:
- Affected Artifacts:

## 8. Rollback / Exit Strategy
- 

## 9. Validation & Metrics
- 

## 10. Notes
- 
EOF

echo "✓ Successfully created: $FILE_PATH"
echo ""
echo "Next steps:"
echo "  1. Edit the file: $FILE_PATH"
echo "  2. Update the index: pnpm adl:index"
