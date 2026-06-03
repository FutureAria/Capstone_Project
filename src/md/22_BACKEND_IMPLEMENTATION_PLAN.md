# 22. 백엔드 구현 계획

> 작성일: 2026-06-01
> 목적: 현재 React/Vite 프론트 앱에 맞는 백엔드 서버를 어떻게 만들지 정리

---

## 1. 결론

이 프로젝트의 백엔드는 **외부 API 보호용 프록시 + 추천/검색 비즈니스 로직 서버**로 시작하는 것이 맞다.

현재 프론트는 YouTube Data API와 Gemini API를 브라우저에서 직접 호출한다. 이 구조는 빠르게 MVP를 만들기에는 좋지만, API 키가 브라우저 번들에 노출되고, 사용자별 사용량 제한/캐싱/로그/에러 정책을 중앙에서 관리할 수 없다.

따라서 1차 백엔드는 아래 역할에 집중한다.

1. YouTube/Gemini API 키를 서버 환경변수로 숨긴다.
2. 프론트의 외부 API 직접 호출을 `/api/*` 호출로 바꾼다.
3. 검색 결과, videoId, 차트 데이터를 서버에서 캐싱한다.
4. 감정 분석/추천/믹스 프롬프트를 프론트에서 서버로 옮긴다.
5. 요청 검증, 에러 응답, rate limit, 로그를 서버에서 통제한다.

---

## 2. 추천 기술 스택

### 1순위: Java + Spring Boot

사용자 학습/포트폴리오 목적까지 고려하면 **Spring Boot 백엔드**가 가장 적합하다.

| 영역 | 선택 |
|---|---|
| 언어 | Java |
| 프레임워크 | Spring Boot |
| API 방식 | REST API |
| HTTP 클라이언트 | WebClient |
| 캐시 1차 | Caffeine in-memory cache |
| 캐시 2차 | Redis, 선택 사항 |
| 인증 | 1차는 Firebase ID Token 검증 선택, MVP는 비로그인 API부터 |
| DB | 1차는 없음, 필요 시 PostgreSQL 또는 MySQL |
| 배포 | Render, Railway, Fly.io, Oracle, EC2 등은 추후 결정 |

### 왜 Spring Boot가 맞는가

- 백엔드 포트폴리오에서 Controller, Service, DTO, Validation, ExceptionHandler, 외부 API 연동, 캐싱, 보안 구조를 보여주기 좋다.
- 현재 프로젝트의 약점인 API 키 노출, quota 관리, 비즈니스 로직 노출을 백엔드 설계로 해결할 수 있다.
- 추후 JPA/DB를 붙여 사용자별 추천 기록, 인기 검색어, 서버 캐시, 관리자 통계를 확장하기 좋다.

---

## 3. 목표 아키텍처

```text
현재

[React/Vite]
  ├─ YouTube API 직접 호출
  ├─ Gemini API 직접 호출
  └─ Firebase Auth/Firestore 직접 사용

목표 1차

[React/Vite]
  ├─ /api/chart
  ├─ /api/search
  ├─ /api/video-id
  ├─ /api/emotion
  ├─ /api/recommend
  └─ /api/mix
        ↓
[Spring Boot Backend]
  ├─ YouTubeApiClient
  ├─ GeminiApiClient
  ├─ CacheService
  ├─ RateLimitService
  └─ ErrorHandler
        ↓
[YouTube Data API / Gemini API]

[React/Vite] ── Firebase SDK ── [Firebase Auth/Firestore]
```

Firebase Auth/Firestore는 1차에서는 그대로 둔다. 즉, 백엔드가 모든 데이터를 DB로 가져오는 방식이 아니라, **외부 API 호출만 먼저 서버로 옮기는 단계적 이관**이 현실적이다.

---

## 4. 백엔드 프로젝트 위치

추천 위치:

```text
/Users/juyoung/Desktop/AI음악/
├── backend/              # 새 Spring Boot 서버
├── src/                  # 기존 React 앱
├── public/
├── src/md/
└── README.md
```

루트에 `backend/`를 만들면 프론트와 백엔드를 한 저장소에서 관리할 수 있다.

---

## 5. 필요한 API 목록

### 5.1 차트 API

```http
GET /api/chart?regionCode=KR&maxResults=10
```

역할:

- YouTube `videos?chart=mostPopular` 호출
- 음악 카테고리만 조회
- 방송/라이브/중복 제목 필터링
- 프론트가 바로 렌더링할 수 있는 곡 객체로 변환
- 서버 캐싱 적용

응답 예시:

```json
{
  "songs": [
    {
      "rank": 1,
      "title": "노래 제목",
      "artist": "아티스트",
      "youtubeQuery": "노래 제목 아티스트 official audio",
      "videoId": "youtubeVideoId",
      "cover": "thumbnailUrl"
    }
  ],
  "source": "youtube",
  "cached": false
}
```

---

### 5.2 검색 API

```http
GET /api/search?q=아이유 밤편지&maxResults=20
```

역할:

- YouTube `search` 호출
- 필요 시 `videos?contentDetails` 추가 호출로 길이 확인
- 라이브/방송/뉴스/직캠 등 노이즈 필터링
- 공식 음원/공식 MV 우선 정렬
- 검색 결과 캐싱

응답 예시:

```json
{
  "query": "아이유 밤편지",
  "songs": [
    {
      "title": "밤편지",
      "artist": "IU",
      "youtubeQuery": "밤편지 IU",
      "videoId": "youtubeVideoId",
      "cover": "thumbnailUrl",
      "durationSeconds": 270
    }
  ],
  "cached": true
}
```

---

### 5.3 videoId 조회 API

```http
GET /api/video-id?q=NewJeans Ditto official audio
```

역할:

- 곡 재생 직전에 `youtubeQuery`로 videoId를 찾는다.
- 같은 곡 검색이 반복되므로 캐싱 효과가 가장 크다.

응답 예시:

```json
{
  "query": "NewJeans Ditto official audio",
  "videoId": "youtubeVideoId",
  "cached": true
}
```

---

### 5.4 감정 분석 API

```http
POST /api/emotion
Content-Type: application/json

{
  "text": "오늘 발표가 잘 끝나서 너무 기뻐"
}
```

역할:

- Gemini API 호출
- 감정 분석 프롬프트를 서버에서 관리
- 허용 감정값 검증
- 잘못된 모델 응답은 서버에서 fallback 처리

응답 예시:

```json
{
  "emotion": "기쁨",
  "confidence": null,
  "provider": "gemini"
}
```

허용 감정:

```text
기쁨, 슬픔, 분노, 불안, 평온, 설렘, 피로, 집중
```

---

### 5.5 추천 API

```http
POST /api/recommend
Content-Type: application/json

{
  "text": "오늘 발표가 잘 끝나서 너무 기뻐",
  "emotion": "기쁨",
  "limit": 8
}
```

역할:

- Gemini API로 감정 기반 추천 곡 생성
- JSON 응답 형식 강제
- 추천 결과 검증
- 프론트 `Recommendations.jsx`가 원하는 구조로 반환

응답 예시:

```json
{
  "emotions": [
    { "name": "기쁨", "percent": 80, "color": "#FFD700" },
    { "name": "설렘", "percent": 20, "color": "#FF6B9D" }
  ],
  "songs": [
    {
      "title": "노래 제목",
      "artist": "아티스트",
      "mood": "밝고 경쾌함",
      "youtubeQuery": "노래 제목 아티스트"
    }
  ],
  "provider": "gemini"
}
```

---

### 5.6 맞춤 믹스 API

```http
POST /api/mix
Content-Type: application/json

{
  "likedSongs": [],
  "albumSongs": [],
  "recentEmotions": ["기쁨", "설렘"],
  "limit": 10
}
```

역할:

- 좋아요, 앨범, 최근 감정 기반으로 믹스 생성
- 서버에서 프롬프트 관리
- 프론트 `MixPage.jsx`의 Gemini 직접 호출을 대체

응답 예시:

```json
{
  "songs": [
    {
      "title": "노래 제목",
      "artist": "아티스트",
      "mood": "드라이브",
      "youtubeQuery": "노래 제목 아티스트"
    }
  ],
  "provider": "gemini"
}
```

---

## 6. Spring Boot 패키지 구조

```text
backend/
└── src/main/java/com/musiccuration/backend/
    ├── MusicCurationBackendApplication.java
    ├── chart/
    │   ├── ChartController.java
    │   └── ChartService.java
    ├── search/
    │   ├── SearchController.java
    │   └── SearchService.java
    ├── emotion/
    │   ├── EmotionController.java
    │   ├── EmotionService.java
    │   └── EmotionType.java
    ├── recommendation/
    │   ├── RecommendationController.java
    │   └── RecommendationService.java
    ├── mix/
    │   ├── MixController.java
    │   └── MixService.java
    ├── external/
    │   ├── youtube/
    │   │   ├── YouTubeApiClient.java
    │   │   ├── YouTubeMapper.java
    │   │   └── YouTubeProperties.java
    │   └── gemini/
    │       ├── GeminiApiClient.java
    │       ├── GeminiPromptFactory.java
    │       └── GeminiProperties.java
    ├── common/
    │   ├── ApiResponse.java
    │   ├── ErrorCode.java
    │   ├── GlobalExceptionHandler.java
    │   └── ValidationUtils.java
    ├── config/
    │   ├── CorsConfig.java
    │   ├── CacheConfig.java
    │   └── WebClientConfig.java
    └── rate_limit/
        └── RateLimitFilter.java
```

---

## 7. 환경변수 설계

백엔드 `.env` 또는 로컬 실행 환경에만 둔다.

```text
YOUTUBE_API_KEY=...
GEMINI_API_KEY=...
FRONTEND_ORIGIN=http://localhost:5173
SERVER_PORT=8080
```

프론트에서 제거하거나 사용을 줄일 값:

```text
VITE_YOUTUBE_API_KEY
VITE_GEMINI_KEY
VITE_CLAUDE_KEY
```

Firebase 관련 `VITE_FIREBASE_*`는 프론트 SDK에서 계속 사용할 수 있다. 단, Firebase 보안 규칙은 별도로 점검해야 한다.

---

## 8. 프론트 수정 방향

### 현재

```js
fetch(`https://www.googleapis.com/youtube/v3/search?...&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`)
```

### 변경 후

```js
fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
```

개발 환경에서는 Vite proxy를 둔다.

```js
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:8080',
  },
}
```

수정 대상:

| 파일 | 변경 내용 |
|---|---|
| `src/App.jsx` | 곡 재생용 YouTube search, 감정 기반 추천 호출을 백엔드로 변경 |
| `src/components/MainScreen.jsx` | 차트, 검색, 감정 분석, 취향 추천 호출 변경 |
| `src/components/Recommendations.jsx` | Gemini 추천 호출 변경 |
| `src/components/MixPage.jsx` | Gemini 믹스 호출 변경 |
| `src/components/TasteSelect.jsx` | Gemini 취향 추천 호출 변경 |
| `src/components/ArtistStage.jsx` | YouTube 검색 호출 변경 |
| `src/components/Search.jsx` | YouTube 검색 호출 변경 |

---

## 9. 캐싱 전략

1차는 DB 없이 Caffeine in-memory cache로 시작한다.

| 데이터 | TTL | 이유 |
|---|---:|---|
| 차트 | 30분 | 자주 바뀌지 않고 YouTube quota 절약 효과 큼 |
| 검색 결과 | 6시간 | 같은 곡 검색 반복 가능성 높음 |
| videoId 조회 | 24시간 | 곡 videoId는 비교적 안정적 |
| Gemini 추천 | 10분 | 같은 입력 재시도 비용 절약 |

주의:

- in-memory cache는 서버 재시작 시 사라진다.
- 서버를 여러 대 띄우면 캐시가 공유되지 않는다.
- 배포/확장 단계에서는 Redis로 교체하는 것이 좋다.

---

## 10. 에러 응답 규격

프론트가 안정적으로 처리할 수 있도록 에러 응답을 통일한다.

```json
{
  "error": {
    "code": "YOUTUBE_QUOTA_EXCEEDED",
    "message": "YouTube API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
    "status": 429
  }
}
```

주요 에러 코드:

| 코드 | 상황 |
|---|---|
| `INVALID_REQUEST` | 요청값 누락/검증 실패 |
| `YOUTUBE_API_ERROR` | YouTube API 일반 오류 |
| `YOUTUBE_QUOTA_EXCEEDED` | YouTube quota 초과 |
| `GEMINI_API_ERROR` | Gemini API 일반 오류 |
| `AI_RESPONSE_PARSE_FAILED` | Gemini 응답 JSON 파싱 실패 |
| `RATE_LIMIT_EXCEEDED` | 사용자/IP 요청 제한 초과 |
| `UPSTREAM_TIMEOUT` | 외부 API 응답 지연 |

---

## 11. 보안 정책

P0 보안 원칙:

1. API 키는 백엔드 환경변수에만 둔다.
2. `.env`, API 키, credential은 git에 커밋하지 않는다.
3. 프론트 번들에 YouTube/Gemini 키가 들어가지 않게 한다.
4. CORS는 개발 중 `localhost`, 배포 후 실제 프론트 도메인만 허용한다.
5. 요청 본문 크기 제한을 둔다.
6. IP 또는 사용자 기준 rate limit을 둔다.
7. 외부 API 원문 에러에 credential이나 내부 정보가 섞이지 않게 응답을 정제한다.

---

## 12. 구현 단계

### Phase 0. 정리

- 현재 루트의 git 상태 정리
- 실제 실행 루트 결정: 현재는 루트 `package.json`이 삭제 상태이고 `Demo/package.json`이 존재하므로 구조 정리 필요
- `.env.example`, `SECURITY.md`, README의 문서 위치 불일치 확인

### Phase 1. 백엔드 스캐폴딩

- `backend/` Spring Boot 프로젝트 생성
- `health check` API 구현
- CORS 설정
- 환경변수 바인딩
- 공통 에러 응답 구조 추가

검증:

```bash
cd backend
./gradlew test
./gradlew bootRun
curl http://localhost:8080/api/health
```

### Phase 2. YouTube 프록시

- `/api/chart`
- `/api/search`
- `/api/video-id`
- YouTube 응답 DTO/Mapper 구현
- 검색 필터/차트 후처리 이관
- Caffeine 캐시 적용

검증:

```bash
curl "http://localhost:8080/api/chart?regionCode=KR&maxResults=10"
curl "http://localhost:8080/api/search?q=아이유%20밤편지"
curl "http://localhost:8080/api/video-id?q=아이유%20밤편지"
```

### Phase 3. Gemini 프록시

- `/api/emotion`
- `/api/recommend`
- `/api/mix`
- PromptFactory 구현
- JSON 파싱 실패 fallback
- 모델/응답 에러 처리

검증:

```bash
curl -X POST http://localhost:8080/api/emotion \
  -H "Content-Type: application/json" \
  -d '{"text":"오늘 발표가 잘 끝나서 너무 기뻐"}'
```

### Phase 4. 프론트 연결

- Vite proxy 추가
- 프론트의 직접 외부 API 호출 제거
- 프론트 `.env`에서 YouTube/Gemini 키 제거
- Firebase 설정은 유지
- API 에러 UI 정리

검증:

```bash
npm run dev
cd backend && ./gradlew bootRun
```

화면에서 확인:

- 감정 분석
- 추천 결과
- 인기 차트
- 검색
- 곡 재생
- 맞춤 믹스
- 취향 기반 추천

### Phase 5. 포트폴리오 품질 보강

- Controller/Service 테스트 추가
- 외부 API Client Mock 테스트
- README에 백엔드 실행법 추가
- API 명세 문서 추가
- 보안 설명 추가
- 배포 구조 문서화

---

## 13. P0 / P1 / P2

### P0

- API 키 서버 이전
- `/api/chart`, `/api/search`, `/api/video-id`, `/api/emotion`, `/api/recommend`, `/api/mix`
- 프론트 외부 API 직접 호출 제거
- CORS, rate limit, 에러 응답
- `.env.example` 정리

### P1

- Caffeine 캐시
- YouTube 필터 로직 서버 이관
- Gemini 응답 JSON 검증 강화
- API 문서
- 단위 테스트

### P2

- Redis 캐시
- DB 저장
- 관리자 통계
- Firebase ID Token 검증
- 추천 기록 서버 저장
- 배포 자동화

---

## 14. Decision Required

아래는 구현 전에 결정이 필요하다.

| 항목 | 선택지 | 권장 |
|---|---|---|
| 백엔드 언어 | Spring Boot / Express | Spring Boot |
| 캐시 | Caffeine / Redis | 1차 Caffeine |
| DB | 없음 / PostgreSQL / MySQL | 1차 없음 |
| 인증 검증 | 없음 / Firebase ID Token 검증 | 1차 선택, 2차 도입 |
| 배포 | 로컬만 / Render / Railway / Oracle 등 | 구현 후 결정 |
| Gemini 유지 여부 | Gemini 유지 / Claude 교체 | 1차 Gemini 유지 |

---

## 15. Codex 구현 진입 조건

Codex가 바로 구현하려면 사용자가 아래 중 하나를 승인하면 된다.

1. "Spring Boot로 backend 만들어줘"
2. "1차는 API 프록시만 만들어줘"
3. "Firebase는 그대로 두고 YouTube/Gemini만 백엔드로 옮겨줘"

보안/비용/배포가 걸리는 실제 운영 배포, Oracle 리소스 생성, 외부 API 과금 활성화, credential 사용은 별도 승인 후 진행한다.
