#!/usr/bin/env bash
set -euo pipefail

ORACLE_SSH_KEY="${ORACLE_SSH_KEY:-/Users/juyoung/workspace/kis-ai-trader/oracle_key}"
ORACLE_HOST="${ORACLE_HOST:-ubuntu@132.145.186.82}"
ENV_FILE="${ENV_FILE:-/etc/music-curation/music-curation.env}"

ssh -i "$ORACLE_SSH_KEY" -o BatchMode=yes "$ORACLE_HOST" bash -s <<'REMOTE' "$ENV_FILE"
set -euo pipefail
ENV_FILE="$1"

check_value() {
  local key="$1"
  if sudo awk -F= -v key="$key" '$1 == key && $2 != "" { found=1 } END { exit found ? 0 : 1 }' "$ENV_FILE"; then
    printf '%-28s set\n' "$key"
  else
    printf '%-28s missing\n' "$key"
  fi
}

printf 'env_file                     %s\n' "$ENV_FILE"
check_value "YOUTUBE_API_KEY"
check_value "GEMINI_API_KEY"
check_value "FIREBASE_AUTH_ENABLED"
check_value "FIREBASE_PROJECT_ID"
systemctl is-active music-curation | awk '{ printf "%-28s %s\n", "music-curation.service", $1 }'
REMOTE
