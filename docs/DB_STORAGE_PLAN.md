# DB Storage Plan

## Current Status

User-facing history, likes, albums, and taste preferences are stored in Firebase Firestore from the frontend.

The Spring Boot backend now stores minimal analytics in a small H2 file DB.

| Item | Status |
|---|---|
| API request logs | Implemented |
| Recommendation event logs | Implemented |
| Raw prompt/body storage | Not stored |
| Raw IP storage | Not stored |
| Existing Oracle MariaDB usage | Not touched |

Oracle DB files:

```text
/var/lib/music-curation/music-curation.mv.db
```

## Why Not Added Blindly

Adding a backend DB changes ownership of user data. Before implementing it, decide whether Firebase remains the source of truth or Spring Boot becomes the source of truth.

## Recommended Portfolio Architecture

Use two layers:

| Data | Storage | Reason |
|---|---|---|
| User likes/albums/history | Firebase Firestore | Already implemented, tied to Firebase login |
| Backend API audit/analytics | Spring Boot H2 file DB | Useful for portfolio backend architecture |

## Implemented Tables

### `api_request_logs`

| Column | Type | Notes |
|---|---|---|
| `id` | bigint | PK |
| `created_at` | timestamp | indexed |
| `client_ip_hash` | varchar | do not store raw IP |
| `user_id_hash` | varchar nullable | Firebase UID SHA-256 hash only, available after backend auth |
| `endpoint` | varchar | `/api/recommend`, etc. |
| `status` | int | HTTP status |
| `latency_ms` | int | duration |
| `error_code` | varchar nullable | app error code |

### `recommendation_events`

| Column | Type | Notes |
|---|---|---|
| `id` | bigint | PK |
| `created_at` | timestamp | indexed |
| `emotion` | varchar | dominant emotion |
| `song_count` | int | generated song count |
| `provider` | varchar | `gemini` |
| `cached` | boolean | cache hit |

## Remaining Implementation Order

1. Backend Firebase ID token verification. Done, disabled by default.
2. Add `user_id_hash` to API request analytics records after backend auth. Done.
3. Consider recommendation aggregate dashboard.
4. Only then consider saving full prompts or songs, with privacy review.

## Decision Required

Choose DB before implementation:

| Option | Pros | Cons |
|---|---|---|
| H2 file | tiny, easy demo | not production-grade |
| SQLite | small, simple VM deployment | needs extra JDBC dependency |
| MariaDB on existing Oracle VM | already running | touches shared DB, higher risk |
| PostgreSQL external | production-like | cost/ops overhead |

For this Oracle VM, the selected option is H2 file for backend-only analytics. The existing MariaDB was not touched.
