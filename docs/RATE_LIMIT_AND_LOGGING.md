# Rate Limit And Logging

## Rate Limit

Current policy:

| Env | Default | Meaning |
|---|---:|---|
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Window size per client IP |
| `RATE_LIMIT_MAX_REQUESTS` | `60` | Max API requests per window |

Applied to:

```text
/api/**
```

Excluded:

```text
/api/health
```

When exceeded:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
    "status": 429
  }
}
```

## Logging

Current backend logging writes to:

```text
logs/music-curation.log
```

Configurable env:

| Env | Default |
|---|---|
| `LOG_FILE` | `logs/music-curation.log` |
| `LOG_MAX_FILE_SIZE` | `10MB` |
| `LOG_MAX_HISTORY` | `7` |

Oracle service currently also keeps system logs through:

```bash
sudo journalctl -u music-curation -n 100 --no-pager
```

## Production Check

```bash
ssh -i /Users/juyoung/workspace/kis-ai-trader/oracle_key ubuntu@132.145.186.82
systemctl is-active music-curation
sudo journalctl -u music-curation -n 80 --no-pager
curl -fsS http://127.0.0.1:8090/music-curation/api/health
```

## Analytics DB

Minimal analytics are stored in H2:

```text
/var/lib/music-curation/music-curation.mv.db
```

Stored:

- endpoint
- method
- status
- latency
- error code
- hashed client IP
- recommendation event aggregate count

Not stored:

- raw prompt text
- request body
- API key
- raw IP
- Firebase token

Public aggregate endpoint:

```bash
curl -s https://juyoung-basechain.duckdns.org/music-curation/api/ops/summary
```
