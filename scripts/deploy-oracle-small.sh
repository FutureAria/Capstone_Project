#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ORACLE_SSH_KEY="${ORACLE_SSH_KEY:-/Users/juyoung/workspace/kis-ai-trader/oracle_key}"
ORACLE_HOST="${ORACLE_HOST:-ubuntu@132.145.186.82}"
APP_NAME="${APP_NAME:-music-curation}"
APP_DIR="${APP_DIR:-/opt/music-curation}"
ENV_DIR="${ENV_DIR:-/etc/music-curation}"
DATA_DIR="${DATA_DIR:-/var/lib/music-curation}"
LOG_DIR="${LOG_DIR:-/var/log/music-curation}"
SERVICE_NAME="${SERVICE_NAME:-music-curation}"
SERVER_PORT="${SERVER_PORT:-8090}"
CONTEXT_PATH="${CONTEXT_PATH:-/music-curation}"
JAR_PATH="$ROOT_DIR/backend/target/backend-0.0.1-SNAPSHOT.jar"

if [[ ! -f "$ORACLE_SSH_KEY" ]]; then
  echo "Missing SSH key: $ORACLE_SSH_KEY" >&2
  exit 1
fi

export VITE_PUBLIC_BASE_PATH="${CONTEXT_PATH}/"
export VITE_API_BASE_URL="$CONTEXT_PATH"

bash "$ROOT_DIR/scripts/build-production.sh"

ssh -i "$ORACLE_SSH_KEY" -o BatchMode=yes "$ORACLE_HOST" "mkdir -p /tmp/$APP_NAME"
rsync -az -e "ssh -i $ORACLE_SSH_KEY -o BatchMode=yes" "$JAR_PATH" "$ORACLE_HOST:/tmp/$APP_NAME/app.jar"

ssh -i "$ORACLE_SSH_KEY" -o BatchMode=yes "$ORACLE_HOST" bash -s <<REMOTE
set -euo pipefail

sudo mkdir -p "$APP_DIR" "$ENV_DIR" "$DATA_DIR" "$LOG_DIR"
sudo cp "/tmp/$APP_NAME/app.jar" "$APP_DIR/app.jar"
sudo chown -R root:root "$APP_DIR"
sudo chown -R ubuntu:ubuntu "$DATA_DIR" "$LOG_DIR"

if [ ! -f "$ENV_DIR/$APP_NAME.env" ]; then
  sudo tee "$ENV_DIR/$APP_NAME.env" >/dev/null <<ENVEOF
SERVER_PORT=$SERVER_PORT
SERVER_SERVLET_CONTEXT_PATH=$CONTEXT_PATH
FRONTEND_ORIGIN=*
YOUTUBE_API_KEY=
ANTHROPIC_API_KEY=
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_BASE_URL=https://api.anthropic.com
CLAUDE_API_VERSION=2023-06-01
CLAUDE_MAX_TOKENS=2048
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=60
FIREBASE_AUTH_ENABLED=false
FIREBASE_PROJECT_ID=
FIREBASE_CERT_CACHE_SECONDS=3600
DB_URL=jdbc:h2:file:$DATA_DIR/music-curation;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE
DB_USERNAME=sa
DB_PASSWORD=
LOG_FILE=$LOG_DIR/music-curation.log
LOG_MAX_FILE_SIZE=10MB
LOG_MAX_HISTORY=7
ENVEOF
  sudo chmod 600 "$ENV_DIR/$APP_NAME.env"
fi

if ! sudo grep -q '^FIREBASE_AUTH_ENABLED=' "$ENV_DIR/$APP_NAME.env"; then
  printf '\nFIREBASE_AUTH_ENABLED=false\nFIREBASE_PROJECT_ID=\nFIREBASE_CERT_CACHE_SECONDS=3600\n' | sudo tee -a "$ENV_DIR/$APP_NAME.env" >/dev/null
fi

sudo tee "/etc/systemd/system/$SERVICE_NAME.service" >/dev/null <<SERVICEEOF
[Unit]
Description=Music Curation Spring Boot App
After=network.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
Environment=DB_URL=jdbc:h2:file:$DATA_DIR/music-curation;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE
Environment=DB_USERNAME=sa
Environment=DB_PASSWORD=
Environment=LOG_FILE=$LOG_DIR/music-curation.log
Environment=LOG_MAX_FILE_SIZE=10MB
Environment=LOG_MAX_HISTORY=7
EnvironmentFile=$ENV_DIR/$APP_NAME.env
ExecStart=/usr/bin/java -Xms96m -Xmx256m -jar $APP_DIR/app.jar
Restart=on-failure
RestartSec=5
User=ubuntu

[Install]
WantedBy=multi-user.target
SERVICEEOF

sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME" >/dev/null
sudo systemctl restart "$SERVICE_NAME"
for i in \$(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$SERVER_PORT$CONTEXT_PATH/api/health"; then
    break
  fi
  sleep 1
done
systemctl is-active "$SERVICE_NAME"
curl -fsS "http://127.0.0.1:$SERVER_PORT$CONTEXT_PATH/api/health"
du -sh "$APP_DIR/app.jar"
df -h /
REMOTE
