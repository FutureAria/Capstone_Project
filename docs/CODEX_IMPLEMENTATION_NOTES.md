# Codex Implementation Notes

## 2026-06-01

### 구현 요약

팀원이 제공한 React/Vite 프론트에 맞춰 Spring Boot 백엔드를 `backend/`에 추가했다. 핵심 목적은 브라우저에 노출되던 YouTube/Claude API 키와 프롬프트 로직을 서버로 이동하는 것이다.

### 백엔드 구성

- Java 17 target
- Spring Boot 3.3.5
- Maven
- RestClient
- Caffeine cache
- Jakarta Validation
- GlobalExceptionHandler
- RateLimitInterceptor

### API

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/health` | 서버 상태 |
| GET | `/api/chart` | YouTube 인기 음악 차트 |
| GET | `/api/search` | YouTube 음악 검색 |
| GET | `/api/video-id` | 재생용 videoId 조회 |
| POST | `/api/emotion` | Claude 감정 분석 |
| POST | `/api/recommend` | Claude 감정 기반 추천 |
| POST | `/api/mix` | 단일 맞춤 믹스 |
| POST | `/api/mixes` | MixPage용 테마 믹스 4개 |
| POST | `/api/taste/recommend` | 취향 기반 추천 |
| POST | `/api/similar-song` | 큐 종료 시 비슷한 곡 추천 |

### 프론트 변경

- `src/lib/api.js` 추가
- `App.jsx`, `MainScreen.jsx`, `Recommendations.jsx`, `MixPage.jsx`, `TasteSelect.jsx`, `Search.jsx`, `ArtistStage.jsx`의 외부 API 직접 호출을 `/api/*`로 교체
- 루트 Vite proxy 추가
- 루트 실행 파일 복구
- Vite 8 rolldown 바이너리 이슈를 피하기 위해 Vite 6.4.2 계열로 조정

### 보안 메모

- 실제 API key는 문서나 git에 저장하지 않는다.
- 프론트 `.env.example`에는 Firebase 공개 설정만 둔다.
- YouTube/Claude key는 `backend/.env` 또는 서버 환경변수에만 둔다.

### 후속 보강

- Spring Boot가 `backend/.env`를 자동으로 읽도록 설정했다.
- 프론트 proxy target은 `VITE_BACKEND_PROXY_TARGET`로 조정할 수 있다.
- 백엔드 테스트는 7개까지 늘렸고, `mvn test` 통과를 확인했다.
- `docs/API_SPEC.md`와 `backend/README.md`를 추가했다.

### 추가 안정화

- 프론트 lint warning을 0개로 정리했다.
- AI 추천 응답이 빈 목록일 때 백엔드에서 기본 추천곡을 보충한다.
- `MusicPlayer`의 큐 종료 callback은 최신 상태를 ref로 참조하도록 정리했다.

### Oracle 배포 안정화

- Oracle VM의 기존 Java 17 런타임에 맞춰 backend Maven target을 Java 17로 낮췄다.
- Java 21 전용 API인 `List.getFirst()`를 Java 17 호환 코드로 바꿨다.
- 프론트 Vite build 결과를 Spring Boot static resources에 넣어 단일 JAR로 배포한다.
- 운영 URL은 `https://juyoung-basechain.duckdns.org/music-curation/`이다.
- 운영 health는 `https://juyoung-basechain.duckdns.org/music-curation/api/health`이다.
- Docker를 쓰지 않아 서버 용량 사용을 줄였다.
- 서버 배포 용량은 `/opt/music-curation` 기준 약 `31M`이다.
- 실제 YouTube/Claude 운영 키는 아직 문서/코드에 저장하지 않았고, 서버의 `/etc/music-curation/music-curation.env`에 직접 입력해야 한다.

### Analytics 저장

- H2 파일 DB로 최소 운영 analytics를 저장한다.
- 저장 위치는 Oracle 기준 `/var/lib/music-curation`이다.
- 저장하는 값은 endpoint, method, status, latency, error code, hashed client IP, 추천 이벤트 집계다.
- 저장하지 않는 값은 request body, prompt 원문, API key, Firebase token, raw IP다.
- 집계 확인 API는 `/api/ops/summary`이다.

### 프론트-백엔드 연결 최종 점검

- 프론트의 외부 AI/YouTube Data API 직접 호출은 `src/lib/api.js` 경유 백엔드 호출로 정리했다.
- Firebase 공개 설정은 프론트에 남아 있다. Firebase web config는 클라이언트 SDK 동작에 필요한 공개 식별자이며, 보안은 Firebase Console 규칙과 authorized domain으로 관리한다.
- YouTube iframe/player와 Google Font 호출은 API key를 쓰는 백엔드 비밀 호출이 아니라 브라우저 렌더링/재생을 위한 외부 리소스다.
- API 실패 시 콘솔에만 남던 재생, 아티스트 검색, 취향 추천 실패를 사용자 안내로 보강했다.
- 운영 서버는 `music-curation` systemd service만 재시작한다. Caddy 설정 reload와 앱 서비스 restart 범위 외 다른 서비스 재시작은 배포 스크립트에서 수행하지 않는다.
- 실제 YouTube/Claude 성공 검증은 운영 환경변수 입력 전까지 불가하며, 현재는 `MISSING_API_KEY` 응답과 프론트 안내가 정상 동작해야 하는 상태다.

### Firebase Backend Auth

- Firebase ID Token 검증을 선택형으로 구현했다.
- 기본값은 `FIREBASE_AUTH_ENABLED=false`라서 기존 포트폴리오 데모와 public API 검증이 깨지지 않는다.
- 운영에서 `FIREBASE_AUTH_ENABLED=true`, `FIREBASE_PROJECT_ID=music-curation-capston`를 설정하면 `/api/**` 요청에 Firebase ID Token이 필요하다.
- 프론트 API wrapper는 Firebase 로그인 사용자가 있으면 `Authorization: Bearer <idToken>`을 자동 첨부한다.
- 백엔드는 Google SecureToken 공개 인증서로 JWT 서명을 검증하므로 Firebase service account JSON을 Oracle에 저장하지 않는다.
- Analytics에는 raw UID를 저장하지 않고 `user_id_hash`만 저장한다.
