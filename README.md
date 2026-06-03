# 🎵 Music Curation

> AI가 당신의 감정을 분석해 어울리는 음악을 추천하는 웹 애플리케이션

감정을 자유롭게 입력하면 AI(Gemini)가 감정을 분석하고, 그에 어울리는 음악을
추천해 줍니다. YouTube 인기 차트, 뮤직비디오, 맞춤 믹스, 취향 기반 추천,
나만의 앨범 등 다양한 음악 큐레이션 기능을 제공합니다.

---

## 📖 문서 먼저 읽기

> **개발/유지보수를 이어서 하려면 반드시 [`docs/00_README.md`](docs/00_README.md) 를 먼저 읽으세요.**

`docs/00_README.md` 에 전체 문서 목차, 화면 구조, 컴포넌트 목록, 작업 이력이
정리되어 있습니다. 필요한 세부 문서만 골라 참고하면 됩니다.

| 문서 | 내용 |
|---|---|
| [`docs/00_README.md`](docs/00_README.md) | **문서 목차 (여기부터 시작)** |
| [`docs/17_TODO.md`](docs/17_TODO.md) | 남은 작업 & 발표 준비 |
| [`docs/21_HANDOFF_BACKEND.md`](docs/21_HANDOFF_BACKEND.md) | 백엔드 인수인계 (API 프록시 설계) |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Oracle 배포 방법과 운영 확인 명령 |
| [`docs/ORACLE_NOTES.md`](docs/ORACLE_NOTES.md) | 현재 Oracle 배포 상태 |
| [`docs/RATE_LIMIT_AND_LOGGING.md`](docs/RATE_LIMIT_AND_LOGGING.md) | Rate limit, 운영 로그 정책 |
| [`docs/FIREBASE_BACKEND_AUTH_PLAN.md`](docs/FIREBASE_BACKEND_AUTH_PLAN.md) | Firebase ID Token 백엔드 검증 계획 |
| [`docs/DB_STORAGE_PLAN.md`](docs/DB_STORAGE_PLAN.md) | 추천/검색 기록 DB 저장 계획 |
| [`docs/PORTFOLIO_BACKEND_NOTES.md`](docs/PORTFOLIO_BACKEND_NOTES.md) | 발표/면접용 백엔드 설명 포인트 |
| [`SECURITY.md`](SECURITY.md) | API 키 보호 가이드 |

---

## 🛠 기술 스택

| 구분 | 기술 |
|---|---|
| 프론트엔드 | React 19, Vite |
| 인증 / DB | Firebase (Auth, Firestore) |
| AI | Google Gemini API (감정 분석·추천·믹스) |
| 음악 | YouTube Data API v3 (차트·검색·재생) |

---

## 🚀 실행 방법

```bash
# 1. 프론트 의존성 설치
npm install

# 2. 프론트 환경변수 설정
cp .env.example .env

# 3. 프론트 개발 서버 실행
npm run dev

# 4. 프론트 프로덕션 빌드
npm run build
```

`.env` 에 필요한 키 목록은 [`.env.example`](.env.example) 을 참고하세요.

### 백엔드 실행

```bash
cd backend
cp .env.example .env

# 실제 실행 시 shell 환경변수 또는 .env 로 아래 값을 설정하세요.
# YOUTUBE_API_KEY=...
# GEMINI_API_KEY=...

mvn spring-boot:run
```

또는 스크립트를 사용할 수 있습니다.

```bash
./scripts/dev-backend.sh
./scripts/dev-frontend.sh
```

프론트 개발 서버는 `/api` 요청을 `http://localhost:8080` 백엔드로 프록시합니다.
8080 포트가 이미 사용 중이면 `SERVER_PORT=8081 mvn spring-boot:run`으로 실행하고,
`vite.config.js`의 proxy target도 `http://localhost:8081`로 바꾸세요.

> ⚠️ YouTube/Gemini API 키는 프론트 `VITE_` 환경변수에 두지 않습니다.
> 외부 API 키는 백엔드 환경변수로만 관리하세요.

API 명세는 [`docs/API_SPEC.md`](docs/API_SPEC.md)를 참고하세요.

Swagger UI:

```text
https://juyoung-basechain.duckdns.org/music-curation/swagger-ui/index.html
```

### 운영 배포

현재 Oracle VM에 작은 용량의 단일 JAR 방식으로 배포되어 있습니다.

| 항목 | 값 |
|---|---|
| 운영 URL | `https://juyoung-basechain.duckdns.org/music-curation/` |
| Health | `https://juyoung-basechain.duckdns.org/music-curation/api/health` |
| 서버 서비스 | `music-curation` |
| 서버 앱 경로 | `/opt/music-curation/app.jar` |

운영 배포 명령:

```bash
bash scripts/deploy-oracle-small.sh
```

자세한 내용은 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)를 참고하세요.

---

## ✨ 주요 기능

- **감정 분석 & 추천** — 자유 입력 → AI 감정 분석 → 맞춤 음악 추천
- **인기 차트** — YouTube 인기순 (mostPopular)
- **뮤직비디오 TOP 10** — 카드 클릭 시 MV 팝업 재생
- **맞춤 믹스** — 좋아요·앨범·감정 기반 AI 자동 믹스
- **취향 선택** — 장르/아티스트 선택 (Firestore 저장)
- **통합 검색** — 방송/라이브 필터링된 음원·MV 검색
- **나만의 앨범 / 좋아요** — 곡 저장·관리
- **히스토리** — 분석 기록 + 재생/좋아요/앨범추가/다음에재생
- **미니 플레이어** — 큐 관리, 드래그앤드롭 순서 변경
- **다크/라이트 모드 · 모바일 반응형**

---

## 📁 프로젝트 구조

```
.
├── src/                  메인 소스 (실제 앱)
│   ├── main.jsx          진입점
│   ├── App.jsx           전역 상태 & 라우팅
│   ├── components/       화면·UI 컴포넌트
│   ├── lib/              firebase 설정 등
│   └── styles/           테마
├── public/               정적 자산
├── backend/              Spring Boot API 프록시 서버
├── docs/                 프로젝트 문서 (00_README.md 부터)
├── .env.example          환경변수 템플릿
├── SECURITY.md           보안 가이드
└── package.json
```

> 메인 작업 코드는 모두 `src/` 안에 있습니다.
