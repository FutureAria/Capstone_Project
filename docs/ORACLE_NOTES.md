# Oracle Notes

## 2026-06-01 Deployment Result

| Check | Status | Evidence |
|---|---|---|
| SSH access | Done | `/Users/juyoung/workspace/kis-ai-trader/oracle_key` |
| Java runtime | Done | Oracle VM has Java 17 |
| Build target | Done | Backend Maven target lowered to Java 17 |
| App upload | Done | `/opt/music-curation/app.jar` |
| Service | Done | `music-curation` active |
| Internal health | Done | `http://127.0.0.1:8090/music-curation/api/health` |
| Public page | Done | `https://juyoung-basechain.duckdns.org/music-curation/` returns HTTP 200 |
| Public health | Done | `https://juyoung-basechain.duckdns.org/music-curation/api/health` returns status `ok` |
| Disk impact | Done | `/opt/music-curation` about `31M`; analytics DB/log dirs are small; root disk still about `36G` available |
| H2 analytics DB | Done | `/var/lib/music-curation` |
| App log file | Done | `/var/log/music-curation/music-curation.log` |
| YouTube/Claude production keys | Remaining | `/etc/music-curation/music-curation.env` has placeholders unless manually filled |
| Firebase auth domain | Check needed | Add `juyoung-basechain.duckdns.org` in Firebase console if login is blocked |
| Firebase backend auth | Implemented, default off | `FIREBASE_AUTH_ENABLED=false`; set `true` after browser login/token verification |

## Safety Constraints

- Existing `basechain-api`, MariaDB, Caddy root site, and portfolio services were not replaced.
- Caddy was changed only by adding a `/music-curation/*` reverse proxy under `juyoung-basechain.duckdns.org`.
- No Docker image was installed or pushed.
- No Oracle resource was created, deleted, resized, or migrated.
- No real secret value was written to project docs.
- Existing Oracle MariaDB was not touched.

## Current Server Shape

```text
Public HTTPS
  -> Caddy
  -> /music-curation/*
  -> 127.0.0.1:8090/music-curation/*
  -> Spring Boot JAR
  -> bundled Vite static files + /api endpoints
  -> small H2 analytics DB at /var/lib/music-curation
```

## Commands Used For Verification

```bash
curl -I https://juyoung-basechain.duckdns.org/music-curation/
curl -s https://juyoung-basechain.duckdns.org/music-curation/api/health
```

```bash
ssh -i /Users/juyoung/workspace/kis-ai-trader/oracle_key ubuntu@132.145.186.82
systemctl is-active music-curation
curl -fsS http://127.0.0.1:8090/music-curation/api/health
du -sh /opt/music-curation /opt/music-curation/app.jar
du -sh /var/lib/music-curation /var/log/music-curation
df -h /
```

Secret presence check without printing secret values:

```bash
bash scripts/check-oracle-env.sh
```
