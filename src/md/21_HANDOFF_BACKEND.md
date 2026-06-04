# 21. 백엔드 인수인계 문서

> 작성일: 2026-05-30
> 대상: 이 프로젝트의 API 호출을 백엔드 서버로 이관할 개발자

---

## 1. 현재 아키텍처 (백엔드 없음)

지금은 **프론트엔드(React/Vite)가 외부 API를 직접 호출**하는 구조다.
별도 백엔드 서버는 없고, 데이터 영속화는 Firebase로 처리한다.

```
[React 앱] ──직접 호출──> YouTube Data API v3
          ──직접 호출──> Google Gemini API
          ──SDK───────> Firebase (Auth / Firestore)
```

### 사용 중인 외부 API

| API | 용도 | 호출 위치 |
|---|---|---|
| YouTube Data API v3 | 인기차트, 곡 검색, videoId 조회, 영상 길이 | `App.jsx`, `MainScreen.jsx` |
| Google Gemini API | 감정 분석, 곡 추천, 믹스 생성 | `App.jsx`, `MainScreen.jsx`, `MixPage.jsx`, `Recommendations.jsx`, `TasteSelect.jsx` |
| (보류) Claude API | Gemini 대체 예정 | 주석 처리됨 |
| Firebase | 인증, 히스토리/좋아요/앨범/취향 저장 | 전역 |

---

## 2. 왜 백엔드로 옮겨야 하는가 (핵심 문제)

### 문제 1 — API 키 노출
Vite의 `VITE_` 프리픽스 환경변수는 **빌드 시 번들(JS)에 그대로 포함**되어,
브라우저 개발자도구에서 누구나 키를 볼 수 있다. 현재 노출되는 키:

- `VITE_YOUTUBE_API_KEY`
- `VITE_GEMINI_KEY`
- `VITE_CLAUDE_KEY` (보류)

→ 제3자가 키를 추출해 quota를 소진시키거나 비용을 발생시킬 수 있다.

### 문제 2 — quota 중앙 관리 불가
YouTube `search`는 호출당 **100 unit**, 무료 일 한도 **10,000 unit** (≈ 검색 100회).
지금은 클라이언트마다 같은 키를 쓰므로 사용량 제어·캐싱 공유가 안 된다.
(프론트에 localStorage 캐싱을 넣어 일부 완화했으나, 사용자 간 공유는 안 됨)

### 문제 3 — 비즈니스 로직이 프론트에 노출
감정 분석/추천 프롬프트가 클라이언트에 그대로 있어 모방·악용이 쉽다.

---

## 3. 권장 백엔드 설계

프론트의 외부 API 직접 호출을 **백엔드 프록시 엔드포인트**로 대체한다.
키는 서버 환경변수로만 두고, 프론트는 자체 백엔드만 호출한다.

```
[React 앱] ──> [우리 백엔드(API 프록시)] ──> YouTube / Gemini
                     └ 키 보관, 캐싱, rate limit, 로깅
```

### 만들어야 할 엔드포인트 (프론트 호출 기준 1:1 매핑)

| 메서드 | 엔드포인트 | 대체하는 프론트 호출 | quota |
|---|---|---|---|
| GET | `/api/chart` | `videos?chart=mostPopular` (MainScreen:222) | 1 |
| GET | `/api/search?q=` | `search` + `videos?contentDetails` (MainScreen:381,413) | 101 |
| GET | `/api/video-id?q=` | `search` 단건 (App.jsx:287, 곡 재생용) | 100 |
| POST | `/api/emotion` | Gemini 감정 분석 (MainScreen) | - |
| POST | `/api/recommend` | Gemini 추천 (Recommendations) | - |
| POST | `/api/mix` | Gemini 믹스 생성 (MixPage) | - |

### 백엔드에서 처리하면 좋은 것 (이미 프론트에 로직 있음 → 이관)

- **검색 필터** (방송/라이브/길이/공식채널) — `MainScreen.jsx handleSearch` 참고
- **차트 후처리** (중복 제거, 라이브 제외, fallback) — `MainScreen.jsx fetchChart` 참고
- **videoId 캐싱** — 현재 localStorage(클라이언트별) → 서버 캐시(전역 공유)로 승격하면 quota 대폭 절감
- **rate limiting** — 사용자별 호출 제한으로 quota 보호

### 추천 스택 (사용자 관심사 기준)

- Java + Spring Boot (REST API), 또는 Node.js(Express) — 프론트와 언어 통일 시 Node도 무난
- 캐시: Redis (videoId/검색결과 TTL 캐싱) 또는 DB 테이블
- 키 관리: 서버 환경변수 / Secret Manager

---

## 4. 이관 체크리스트

- [ ] 백엔드 프로젝트 생성 (Spring Boot 권장)
- [ ] `/api/*` 엔드포인트 6종 구현 (위 표)
- [ ] YouTube/Gemini 키를 **서버 환경변수**로 이전, 프론트 `VITE_*` 키 제거
- [ ] 프론트의 `fetch('https://...googleapis.com...')` → `fetch('/api/...')` 로 교체
- [ ] 검색 필터·차트 후처리 로직을 백엔드로 이관
- [ ] videoId 캐싱을 서버(Redis/DB)로 승격
- [ ] CORS 설정 (프론트 도메인 허용)
- [ ] rate limiting 적용
- [ ] Firebase는 그대로 유지 (Auth/Firestore는 클라이언트 SDK가 적절)

---

## 5. 데이터 모델 (Firestore — 현행 유지)

```
users/{uid}/
├── history/{docId}     { freeText, emotion, emotions[], songs[], timestamp }
├── likes/{docId}       { title, artist, youtubeQuery, videoId, ... }
├── albums/{docId}      { name, songs[], createdAt }
└── preferences/taste   { genres[], artists[], updatedAt }

stats/emotionCounts     { 기쁨: n, 슬픔: n, ... }   // 전체 유저 감정 집계
```

곡(song) 객체 공통 구조:
```js
{ title, artist, youtubeQuery, videoId?, cover?, mood?, rank? }
```

---

## 6. 참고 — 현재 프론트 API 호출 코드 위치

| 파일:라인 | 내용 |
|---|---|
| `App.jsx:287` | 곡 재생용 search (videoId 조회) + localStorage 캐싱 |
| `MainScreen.jsx:222` | 인기차트 mostPopular |
| `MainScreen.jsx:381,413` | 곡 검색 + 길이 필터 |
| `MainScreen.jsx` (Gemini) | 감정 분석 |
| `Recommendations.jsx` (Gemini) | 곡 추천 |
| `MixPage.jsx` (Gemini) | 믹스 생성 |
| `TasteSelect.jsx` (Gemini) | 취향 기반 추천 |

> 신곡 검색(`MainScreen.jsx:295`)은 현재 **비활성화**됨 (뮤직비디오 TOP10이 차트 재활용).

*업데이트: 2026-05-30*
