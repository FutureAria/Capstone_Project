# Deployment

## Current Production Deployment

| Item | Value |
|---|---|
| Server | Oracle VM `ubuntu@132.145.186.82` |
| Public URL | `https://juyoung-basechain.duckdns.org/music-curation/` |
| Health URL | `https://juyoung-basechain.duckdns.org/music-curation/api/health` |
| Service | `music-curation` |
| App path | `/opt/music-curation/app.jar` |
| Env path | `/etc/music-curation/music-curation.env` |
| Data path | `/var/lib/music-curation` |
| Log path | `/var/log/music-curation` |
| Internal port | `8090` |
| Context path | `/music-curation` |
| Reverse proxy | Caddy path proxy under `juyoung-basechain.duckdns.org` |

## Why This Deployment Is Small

- Docker is not used on the server.
- `node_modules` is not uploaded.
- The Vite frontend is built locally and copied into Spring Boot static resources.
- Oracle receives one executable Spring Boot JAR, currently about `31M`.
- Runtime memory is capped in systemd with `-Xms96m -Xmx256m`.
- Minimal API analytics are stored in a small H2 file DB under `/var/lib/music-curation`.

## Local Production Build

```bash
cd /Users/juyoung/Desktop/AI음악
VITE_PUBLIC_BASE_PATH=/music-curation/ \
VITE_API_BASE_URL=/music-curation \
bash scripts/build-production.sh
```

This runs:

- `npm ci`
- `npm run lint -- --quiet`
- `npm run build`
- frontend `dist/` copy into `backend/src/main/resources/static`
- `mvn clean test`
- `mvn package -DskipTests`

## Oracle Deploy

```bash
cd /Users/juyoung/Desktop/AI음악
bash scripts/deploy-oracle-small.sh
```

The script uses:

```text
ORACLE_SSH_KEY=/Users/juyoung/workspace/kis-ai-trader/oracle_key
ORACLE_HOST=ubuntu@132.145.186.82
APP_DIR=/opt/music-curation
ENV_DIR=/etc/music-curation
DATA_DIR=/var/lib/music-curation
LOG_DIR=/var/log/music-curation
SERVICE_NAME=music-curation
SERVER_PORT=8090
CONTEXT_PATH=/music-curation
```

## Server Verification

```bash
ssh -i /Users/juyoung/workspace/kis-ai-trader/oracle_key ubuntu@132.145.186.82
systemctl is-active music-curation
curl -fsS http://127.0.0.1:8090/music-curation/api/health
du -sh /opt/music-curation /opt/music-curation/app.jar
du -sh /var/lib/music-curation /var/log/music-curation
df -h /
```

Public verification:

```bash
curl -I https://juyoung-basechain.duckdns.org/music-curation/
curl -s https://juyoung-basechain.duckdns.org/music-curation/api/health
```

## Remaining Required Secrets

The service is deployed and health/static page work. External recommendation/search APIs still require real server environment values:

```env
YOUTUBE_API_KEY=
GEMINI_API_KEY=
```

Do not write real values into Git or Markdown. Add them only to:

```text
/etc/music-curation/music-curation.env
```

Then restart:

```bash
sudo systemctl restart music-curation
```

## Firebase Production Note

Firebase login may require adding this domain in Firebase Authentication authorized domains:

```text
juyoung-basechain.duckdns.org
```

This was not changed from Codex because it requires Firebase console/account access.
