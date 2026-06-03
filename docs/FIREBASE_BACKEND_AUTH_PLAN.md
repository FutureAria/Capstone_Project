# Firebase Backend Auth

## Current Status

Backend Firebase ID Token verification is implemented and disabled by default.

This keeps the current portfolio demo working without breaking public API checks. In production, enable it from Oracle environment variables.

## How It Works

- Frontend attaches `Authorization: Bearer <Firebase ID Token>` when a Firebase user is logged in.
- Backend verifies the token with Google SecureToken public certificates.
- Backend checks:
  - JWT format
  - `RS256` signature
  - certificate `kid`
  - `iss = https://securetoken.google.com/<projectId>`
  - `aud = <projectId>`
  - `sub`
  - `exp` / `iat`
- Backend stores only `user_id_hash` in analytics logs, not raw Firebase UID.

No Firebase service account JSON is required for this verification path, so no service account secret needs to be stored on Oracle.

## Oracle Env

File:

```text
/etc/music-curation/music-curation.env
```

Values:

```env
FIREBASE_AUTH_ENABLED=false
FIREBASE_PROJECT_ID=music-curation-capston
FIREBASE_CERT_CACHE_SECONDS=3600
```

Turn on after browser login is confirmed:

```env
FIREBASE_AUTH_ENABLED=true
```

## Protected Endpoints When Enabled

| Endpoint | Auth |
|---|---|
| `GET /api/health` | public |
| `GET /api/ops/summary` | public for portfolio ops check |
| `/api/**` others | Firebase ID Token required |

The frontend already sends the token for logged-in users, so normal app usage should continue after enabling auth.

## Verification

Without auth enabled:

```bash
bash scripts/verify-production-api.sh
```

With auth enabled, provide a real Firebase ID token:

```bash
FIREBASE_ID_TOKEN='...' bash scripts/verify-production-api.sh
```

Check Oracle env presence without printing secrets:

```bash
bash scripts/check-oracle-env.sh
```

## Remaining Manual Checks

- Firebase Console authorized domain must include `juyoung-basechain.duckdns.org`.
- Real browser login must be tested after enabling auth.
- Do not commit Firebase ID tokens, API keys, service account JSON, or Oracle credentials.
