# Worklog

## 2026-06-03 — Firebase Configuration Check

### 완료

- 로컬 프론트 `.env`에 Firebase Vite 환경변수 존재 확인
  - 실제 값은 출력하지 않고 presence만 확인
- Oracle `/etc/music-curation/music-curation.env`에 Firebase backend auth 기본값 확인
  - `FIREBASE_PROJECT_ID` set
  - `FIREBASE_AUTH_ENABLED` set
- 운영 `music-curation.service` active 확인
- Firebase 설정 문서 추가
  - `docs/FIREBASE_SETUP.md`

### 실행한 검증

```bash
cd /Users/juyoung/Desktop/AI음악
bash scripts/check-oracle-env.sh
```

결과:

```text
YOUTUBE_API_KEY              missing
GEMINI_API_KEY               missing
FIREBASE_AUTH_ENABLED        set
FIREBASE_PROJECT_ID          set
music-curation.service       active
```

브라우저 검증:

- Firebase Console URL 접근 시 Google 로그인 화면으로 이동
- 운영 앱 `https://juyoung-basechain.duckdns.org/music-curation/` 로그인 화면 렌더 확인
- `Google로 로그인` 클릭 시 앱 화면에 `Google 로그인에 실패했어요. Firebase 도메인 설정을 확인해주세요.` 표시 확인
- 브라우저 콘솔 로그에서 Firebase Auth `auth/network-request-failed` 확인

### 남은 항목

- Firebase Console에서 `music-curation-capston` 프로젝트 접근 가능한 Google 계정 로그인 필요
- Authentication `Sign-in method`에서 Google provider 활성화 여부 확인 필요
- Authentication `Settings > Authorized domains`에 `juyoung-basechain.duckdns.org` 추가 또는 존재 여부 확인 필요
- Firebase 로그인 성공 후 전체 앱 플로우 재검증 필요
- 실제 YouTube/Gemini API 키 입력 후 추천/검색 API 검증 필요

## 2026-06-01 — Backend Phase 1-5 Implementation

### 완료

- `backend/` Spring Boot 백엔드 생성
- `/api/health` 구현
- CORS 설정
- 공통 에러 응답 구조 구현
- IP 기준 rate limit 인터셉터 구현
- Caffeine 캐시 구현
- YouTube 프록시 구현
  - `GET /api/chart`
  - `GET /api/search`
  - `GET /api/video-id`
- Gemini 프록시 구현
  - `POST /api/emotion`
  - `POST /api/recommend`
  - `POST /api/mix`
  - `POST /api/mixes`
  - `POST /api/taste/recommend`
  - `POST /api/similar-song`
- 프론트 API 호출부를 `src/lib/api.js` 중심으로 변경
- 프론트 `VITE_YOUTUBE_API_KEY`, `VITE_GEMINI_KEY` 직접 호출 제거
- 루트 `package.json`, `vite.config.js`, `index.html`, `eslint.config.js`, `.env.example` 복구
- `backend/.env.example` 추가

### 실행한 검증

```bash
cd /Users/juyoung/Desktop/AI음악/backend
mvn test
```

결과: 성공, tests run 2, failures 0, errors 0

```bash
cd /Users/juyoung/Desktop/AI음악
npm run build
```

결과: 성공

```bash
cd /Users/juyoung/Desktop/AI음악
npm run lint
```

결과: 성공, React Hook dependency warning 7개 남음

```bash
cd /Users/juyoung/Desktop/AI음악/backend
SERVER_PORT=8081 mvn spring-boot:run
curl -s http://localhost:8081/api/health
```

결과:

```json
{"service":"music-curation-backend","timestamp":"2026-06-01T10:12:23.651877Z","status":"ok"}
```

```bash
cd /Users/juyoung/Desktop/AI음악
npm run dev -- --host 127.0.0.1
curl -I -s http://127.0.0.1:5173
```

결과: HTTP 200 OK

### 확인하지 못한 항목

- 실제 YouTube/Gemini API 호출은 실제 키를 사용하지 않아 실행하지 않음
- Firebase 로그인 후 전체 사용자 플로우는 브라우저 자동화 패키지 부재로 화면 클릭 검증하지 않음
- 8080 포트가 이미 사용 중이라 백엔드는 검증 시 8081로 실행함

## 2026-06-01 — Backend Follow-up Hardening

### 완료

- `backend/src/main/resources/application.yml`에 `optional:file:.env[.properties]` 추가
  - `backend/.env`를 복사하면 Spring Boot가 로컬 환경변수 파일로 읽을 수 있음
- `vite.config.js` proxy target을 `VITE_BACKEND_PROXY_TARGET`으로 변경 가능하게 보강
- `scripts/dev-backend.sh`, `scripts/dev-frontend.sh` 추가
- `backend/README.md` 추가
- `docs/API_SPEC.md` 추가
- 백엔드 테스트 추가
  - `CacheServiceTest`
  - `YouTubeMapperTest`
  - `EmotionTypeTest`
  - `SearchControllerTest`
- `SearchController`에서 빈 검색어를 명시적으로 방어
- `eslint.config.js`에서 Vite/ESLint config 파일은 Node 전역을 쓰도록 분리

### 실행한 검증

```bash
cd /Users/juyoung/Desktop/AI음악/backend
mvn test
```

결과: 성공, tests run 7, failures 0, errors 0

```bash
cd /Users/juyoung/Desktop/AI음악
npm run lint
```

결과: 성공, errors 0, warnings 7

```bash
cd /Users/juyoung/Desktop/AI음악
npm run build
```

결과: 성공

## 2026-06-01 — Lint Cleanup and AI Fallback

### 완료

- 프론트 React Hook dependency warning 7개 제거
- `MusicPlayer.jsx`의 YouTube player callback이 최신 queue/song/callback 값을 안전하게 참조하도록 ref 최신화 effect 추가
- `Recommendations.jsx`의 theme 계산을 `useMemo`로 안정화
- `TasteSelect.jsx` debounce effect dependency 정리
- `MainScreen.jsx` fallback 상수를 컴포넌트 밖으로 이동
- 백엔드 AI 응답이 빈 곡 목록을 반환할 때 기본 추천곡으로 보충
  - `RecommendationService`
  - `MixService`
  - `TasteRecommendService`

### 실행한 검증

```bash
cd /Users/juyoung/Desktop/AI음악/backend
mvn test
```

결과: 성공, tests run 7, failures 0, errors 0

```bash
cd /Users/juyoung/Desktop/AI음악
npm run lint
```

결과: 성공, warnings 0

```bash
cd /Users/juyoung/Desktop/AI음악
npm run build
```

결과: 성공

## 2026-06-01 — Oracle Deployment and Size Optimization

### 완료

- `.env`를 Git 추적 대상에서 제거하고 `.gitignore`에 환경변수 파일 제외 규칙 추가
- `backend/src/main/resources/static` 생성 산출물을 Git/ESLint 대상에서 제외
- `/api/mixes` 요청/응답을 raw `Map` 대신 DTO로 정리
  - `AlbumSummary`
  - `HistorySummary`
  - `ThemedMixRequest`
  - `ThemedMixResponse`
- AI 추천 결과가 빈 곡 배열일 때 fallback 추천이 채워지는 테스트 추가
- 프론트 화면 컴포넌트 lazy loading 적용
- Vite manual chunks 추가
  - `react`
  - `firebase`
- 운영 경로 배포를 위한 설정 추가
  - `VITE_PUBLIC_BASE_PATH`
  - `VITE_API_BASE_URL`
  - `SERVER_SERVLET_CONTEXT_PATH`
- Oracle VM의 Java 17 런타임에 맞춰 backend Maven target을 Java 17로 조정
- Java 21 전용 `List.getFirst()` 사용을 Java 17 호환 `get(0)`으로 변경
- 단일 JAR 배포 스크립트 추가
  - `scripts/build-production.sh`
  - `scripts/deploy-oracle-small.sh`
- GitHub Actions CI 추가
  - frontend lint/build
  - backend test
- Oracle VM에 `music-curation` systemd 서비스 배포
- Caddy에 `/music-curation/*` reverse proxy 추가
- 배포 문서 추가
  - `docs/DEPLOYMENT.md`
  - `docs/ORACLE_NOTES.md`

### 실행한 검증

```bash
cd /Users/juyoung/Desktop/AI음악
npm audit
```

결과: 성공, vulnerabilities 0

```bash
cd /Users/juyoung/Desktop/AI음악
VITE_PUBLIC_BASE_PATH=/music-curation/ VITE_API_BASE_URL=/music-curation bash scripts/build-production.sh
```

결과:

- `npm ci` 성공
- `npm run lint -- --quiet` 성공
- `npm run build` 성공
- `mvn clean test` 성공, tests run 8, failures 0, errors 0
- `mvn package -DskipTests` 성공
- `dist` 약 `940K`
- JAR 약 `22M`

```bash
curl -I https://juyoung-basechain.duckdns.org/music-curation/
```

결과: HTTP 200

```bash
curl -s https://juyoung-basechain.duckdns.org/music-curation/api/health
```

결과: `status`가 `ok`

```bash
ssh -i /Users/juyoung/workspace/kis-ai-trader/oracle_key ubuntu@132.145.186.82
systemctl is-active music-curation
du -sh /opt/music-curation /opt/music-curation/app.jar
df -h /
```

결과:

- service active
- `/opt/music-curation` 약 `23M`
- root disk 여유 약 `36G`

### 남은 항목

- 운영 서버 `/etc/music-curation/music-curation.env`에 실제 `YOUTUBE_API_KEY`, `GEMINI_API_KEY` 입력 필요
- 실제 API 키 입력 후 YouTube/Gemini 연동 API curl 검증 필요
- Firebase 로그인은 Firebase authorized domain 설정 여부 확인 필요

## 2026-06-01 — P1/P2 Follow-up Hardening

### 완료

- Swagger/OpenAPI 추가
  - `/v3/api-docs`
  - `/swagger-ui/index.html`
- 운영 로그 파일 설정 추가
  - `LOG_FILE`
  - `LOG_MAX_FILE_SIZE`
  - `LOG_MAX_HISTORY`
- Rate limit 문서화
  - `docs/RATE_LIMIT_AND_LOGGING.md`
- Firebase backend auth 설계 문서 추가
  - `docs/FIREBASE_BACKEND_AUTH_PLAN.md`
- DB 저장 설계 문서 추가
  - `docs/DB_STORAGE_PLAN.md`
- 포트폴리오/면접 설명 문서 추가
  - `docs/PORTFOLIO_BACKEND_NOTES.md`
- 운영 API 검증 스크립트 추가
  - `scripts/verify-production-api.sh`
- YouTube 검색 필터 강화
  - karaoke, instrumental, remix, sped up, slowed, long loop, teaser, trailer 등 제외
- 프론트 공통 API 에러 메시지 처리 추가
  - `MISSING_API_KEY`
  - `YOUTUBE_QUOTA_EXCEEDED`
  - `YOUTUBE_API_ERROR`
  - `GEMINI_API_ERROR`
  - `RATE_LIMIT_EXCEEDED`
- Oracle 재배포 완료

### 실행한 검증

```bash
bash scripts/deploy-oracle-small.sh
```

결과:

- `npm ci` 성공
- `npm run lint -- --quiet` 성공
- `npm run build` 성공
- `mvn clean test` 성공, tests run 8, failures 0, errors 0
- `mvn package -DskipTests` 성공
- Oracle `music-curation` service active
- public page HTTP 200
- Swagger UI HTTP 200
- OpenAPI JSON 응답 확인

```bash
bash scripts/verify-production-api.sh
```

결과:

- `health` 200
- `chart` 500 `MISSING_API_KEY`

설명: 운영 서버의 `YOUTUBE_API_KEY`, `GEMINI_API_KEY`가 아직 비어 있어 실제 외부 API 검증은 여기서 정상적으로 중단됨.

## 2026-06-01 — P2 Analytics and Deploy Automation

### 완료

- H2 파일 DB 기반 backend analytics 추가
  - `api_request_logs`
  - `recommendation_events`
- 원본 IP 대신 SHA-256 hash만 저장
- request body, prompt, API key, Firebase token은 저장하지 않음
- `/api/ops/summary` 집계 endpoint 추가
- Oracle 데이터/로그 경로 분리
  - `/var/lib/music-curation`
  - `/var/log/music-curation`
- 기존 Oracle MariaDB는 건드리지 않음
- GitHub Actions Oracle 수동 배포 workflow 추가
  - `.github/workflows/deploy-oracle.yml`
- CI Java 버전을 운영 서버와 맞춰 Java 17로 변경
- Oracle 재배포 완료

### 실행한 검증

```bash
cd /Users/juyoung/Desktop/AI음악/backend
mvn test
```

결과: 성공, tests run 8, failures 0, errors 0

```bash
cd /Users/juyoung/Desktop/AI음악
npm run lint -- --quiet
```

결과: 성공

```bash
bash scripts/deploy-oracle-small.sh
```

결과:

- Oracle `music-curation` service active
- health OK
- JAR 약 `31M`
- `/var/lib/music-curation` 약 `28K`
- `/var/log/music-curation` 약 `8K`

```bash
curl -s https://juyoung-basechain.duckdns.org/music-curation/api/ops/summary
```

결과: 집계 JSON 응답 확인. `chart` 호출 실패도 `MISSING_API_KEY` 상태로 로그에 기록됨.

## 2026-06-01 — Frontend Backend Wiring Audit

### 완료

- 프론트 런타임 코드에서 외부 AI/YouTube Data API 직접 호출 흔적 재검색
- `src/components/Recommendations.jsx`의 과거 Claude 직접 호출 주석 제거
- 재생용 `videoId` 조회 실패 시 전역 사용자 안내 추가
- 큐 종료 후 비슷한 곡 자동 추천 실패 시 전역 사용자 안내 추가
- 아티스트 스테이지 검색 실패 시 화면 내 에러 안내 추가
- 취향 추천 화면 실패 시 화면 내 에러 안내 추가
- 메인 화면의 취향 추천 실패도 공통 API 안내 메시지로 연결

### 실행한 검증

```bash
npm run lint -- --quiet
```

결과: 성공

```bash
cd backend && mvn test
```

결과: 성공, tests run 8, failures 0, errors 0

```bash
VITE_PUBLIC_BASE_PATH=/music-curation/ VITE_API_BASE_URL=/music-curation npm run build
```

결과: 성공. `dist` 약 `944K`. Firebase 청크는 gzip 약 `128.8K`.

```bash
bash scripts/deploy-oracle-small.sh
```

결과:

- `npm ci` 성공, 취약점 0개
- `npm run lint -- --quiet` 성공
- `npm run build` 성공
- `mvn clean test` 성공, tests run 8, failures 0, errors 0
- `mvn package -DskipTests` 성공
- Oracle `music-curation` service active
- JAR 약 `31M`
- root filesystem 사용량 약 `23%`

```bash
curl -fsS https://juyoung-basechain.duckdns.org/music-curation/api/health
curl -fsS https://juyoung-basechain.duckdns.org/music-curation/
curl -fsS https://juyoung-basechain.duckdns.org/music-curation/v3/api-docs
bash scripts/verify-production-api.sh
```

결과:

- health 200
- app HTML 200
- OpenAPI JSON 200
- `verify-production-api.sh`는 `chart`에서 500 `MISSING_API_KEY`로 정상 중단

### 남은 차단점

- 운영 서버 `/etc/music-curation/music-curation.env`에 실제 `YOUTUBE_API_KEY`, `GEMINI_API_KEY`가 없어 실제 YouTube/Gemini 통합 API는 아직 성공 검증 불가
- Firebase 로그인 전체 플로우는 운영 도메인 authorized domain 설정과 실제 계정 로그인 확인이 필요

## 2026-06-02 — Firebase Backend Auth and Remaining Backend Hardening

### 완료

- 선택형 Firebase ID Token 백엔드 검증 구현
  - `FIREBASE_AUTH_ENABLED=false` 기본값
  - 운영에서 `true`로 켜면 `/api/**`에 `Authorization: Bearer <Firebase ID Token>` 필요
  - `/api/health`, `/api/ops/summary`는 운영 확인용 public 유지
- 프론트 `src/lib/api.js`에서 로그인 사용자의 Firebase ID Token을 API 요청에 자동 첨부
- `UNAUTHORIZED` 공통 에러 코드와 프론트 안내 메시지 추가
- Google SecureToken 공개 인증서 기반 JWT 검증 구현
  - service account JSON 불필요
  - Oracle에 Firebase service account secret 저장하지 않음
- `api_request_logs.user_id_hash` 추가
  - raw Firebase UID 저장 안 함
  - SHA-256 hash만 저장
- Oracle env 확인 스크립트 추가
  - `scripts/check-oracle-env.sh`
  - secret 값은 출력하지 않고 set/missing만 표시
- 운영 API 검증 스크립트가 `FIREBASE_ID_TOKEN` 환경변수를 받아 Authorization header를 붙이도록 보강

### 실행한 검증

```bash
cd backend && mvn test
```

결과: 성공, tests run 10, failures 0, errors 0

```bash
npm run lint -- --quiet
```

결과: 성공

### 남은 차단점

- 실제 `YOUTUBE_API_KEY`, `GEMINI_API_KEY`는 여전히 사용자가 Oracle env에 직접 넣어야 함
- Firebase Console authorized domain은 사용자의 Firebase Console에서 직접 확인 필요
- `FIREBASE_AUTH_ENABLED=true` 전환은 실제 브라우저 로그인과 ID Token API 검증 후 권장

## 2026-06-02 — Browser Flow QA

### 완료

- 운영 URL 실제 브라우저 렌더 확인
  - `https://juyoung-basechain.duckdns.org/music-curation/`
- 로그인 화면 시각 확인
- 빈 로그인 제출 validation 확인
  - `이메일과 비밀번호를 입력해주세요`
- 빈 회원가입 제출 validation 확인
  - `이메일과 비밀번호를 입력해주세요`
- 약한 비밀번호 회원가입 validation 확인
  - `비밀번호는 8자 이상, 소문자·숫자·특수문자(!@#$%^&*)를 포함해야 해요`
- 이메일 없이 비밀번호 재설정 클릭 validation 확인
  - `이메일을 입력해주세요`
- Google 로그인 클릭 확인
  - 현재 Google 로그인 실패 안내가 표시됨
  - 안내 문구를 Firebase 도메인 설정 확인 방향으로 보강
- Google popup 실패 시 redirect fallback 코드 추가
- 수정 후 재배포 완료

### 실행한 검증

```bash
npm run lint -- --quiet
```

결과: 성공

```bash
VITE_PUBLIC_BASE_PATH=/music-curation/ VITE_API_BASE_URL=/music-curation npm run build
```

결과: 성공

```bash
bash scripts/deploy-oracle-small.sh
```

결과:

- `npm ci` 성공, 취약점 0개
- `npm run lint -- --quiet` 성공
- `npm run build` 성공
- `mvn clean test` 성공, tests run 10, failures 0, errors 0
- Oracle `music-curation` service active
- health OK
- JAR 약 `31M`

### 남은 차단점

- 실제 Google/Firebase 로그인은 아직 성공하지 못함
- 원인 후보:
  - Firebase Authentication authorized domain에 `juyoung-basechain.duckdns.org` 누락
  - in-app browser popup/redirect 제한
  - Google provider 설정 또는 Firebase Auth 설정 문제
- 로그인 성공 전이라 감정 입력, 추천, 재생, 좋아요, 앨범, 히스토리, 믹스의 브라우저 클릭 QA는 아직 미완료
- 실제 API 키도 아직 Oracle env에 없어 추천/검색 API는 성공 검증 불가
