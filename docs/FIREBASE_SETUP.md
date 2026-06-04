# Firebase Setup

## Current Status

Firebase frontend configuration exists in the local `.env` file and is used by `src/lib/firebase.js`.

Oracle backend environment now has:

```env
FIREBASE_AUTH_ENABLED=false
FIREBASE_PROJECT_ID=music-curation-capston
```

`FIREBASE_AUTH_ENABLED` is intentionally disabled for the current demo deployment. Keep it disabled until real browser login is confirmed, otherwise most `/api/**` calls will require a valid Firebase ID Token.

## Project

| Item | Value |
|---|---|
| Firebase project id | `music-curation-capston` |
| Firebase auth domain | `music-curation-capston.firebaseapp.com` |
| Production app URL | `https://juyoung-basechain.duckdns.org/music-curation/` |
| Required authorized domain | `juyoung-basechain.duckdns.org` |

Do not commit `.env`, Firebase ID tokens, API keys, service account JSON, Oracle keys, or DB passwords.

## Required Console Settings

These settings require a logged-in Google account with Firebase project permission.

1. Open Firebase Console.
2. Select project `music-curation-capston`.
3. Go to `Authentication`.
4. Go to `Sign-in method`.
5. Confirm `Google` provider is enabled.
6. Go to `Settings`.
7. Open `Authorized domains`.
8. Add this domain:

```text
juyoung-basechain.duckdns.org
```

Do not include `https://`, `/music-curation`, or a trailing slash in the authorized domain.

## Verification Steps

After the console setting is complete:

1. Open `https://juyoung-basechain.duckdns.org/music-curation/`.
2. Click `Google로 로그인`.
3. Confirm login returns to the app.
4. Confirm the app shows the main screen instead of the auth form.
5. Test:
   - emotion input
   - recommendation
   - music playback
   - like
   - album add
   - history
   - mix creation

## Backend Auth Enablement

Only after login succeeds:

```env
FIREBASE_AUTH_ENABLED=true
FIREBASE_PROJECT_ID=music-curation-capston
```

Then restart only this service:

```bash
sudo systemctl restart music-curation
```

This does not restart other services. It only restarts the `music-curation` systemd unit.

## Verified In This Session

- Local Firebase Vite environment variables are present.
- Oracle `/etc/music-curation/music-curation.env` has `FIREBASE_PROJECT_ID` set.
- Oracle `music-curation.service` is active.
- Public health endpoint returns `status: ok`.
- Firebase Console opened to Google login screen, so project console changes could not be completed without the user's Google account session.
- Production Google login still fails in the browser with the user-facing Firebase domain settings message.

## Still Blocked

- Firebase Console `Authorized domains` cannot be confirmed from this environment without user Google login.
- Google provider enabled/disabled state cannot be confirmed from this environment without user Google login.
- Full logged-in app flow cannot be verified until Firebase login succeeds.
