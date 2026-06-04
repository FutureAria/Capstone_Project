# API Spec

> 기준일: 2026-06-01
> 로컬 서버 기본 주소: `http://localhost:8080`
> 운영 서버 기본 주소: `https://juyoung-basechain.duckdns.org/music-curation`

## OpenAPI / Swagger

운영 배포 후 아래 문서 엔드포인트를 사용할 수 있다.

| 문서 | 경로 |
|---|---|
| OpenAPI JSON | `/v3/api-docs` |
| Swagger UI | `/swagger-ui/index.html` |

운영 URL:

```text
https://juyoung-basechain.duckdns.org/music-curation/swagger-ui/index.html
```

## 공통

### 에러 응답

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "요청값이 올바르지 않습니다.",
    "status": 400
  }
}
```

### 주요 에러 코드

| 코드 | 의미 |
|---|---|
| `INVALID_REQUEST` | 요청값 누락 또는 검증 실패 |
| `UNAUTHORIZED` | Firebase ID Token 누락, 만료, 검증 실패 |
| `MISSING_API_KEY` | 백엔드 환경변수 API 키 없음 |
| `YOUTUBE_API_ERROR` | YouTube API 오류 |
| `YOUTUBE_QUOTA_EXCEEDED` | YouTube quota 초과 |
| `GEMINI_API_ERROR` | Gemini API 오류 |
| `AI_RESPONSE_PARSE_FAILED` | AI 응답 JSON 파싱 실패 |
| `RATE_LIMIT_EXCEEDED` | 요청 제한 초과 |
| `UPSTREAM_TIMEOUT` | 외부 API 응답 지연 |
| `INTERNAL_ERROR` | 서버 내부 오류 |

### 운영 API 검증 스크립트

```bash
cd /Users/juyoung/Desktop/AI음악
bash scripts/verify-production-api.sh
```

현재 운영 서버에 `YOUTUBE_API_KEY`, `GEMINI_API_KEY`가 없으면 `chart`, `search`, `emotion`, `recommend`, `mixes`는 `MISSING_API_KEY`로 실패하는 것이 정상이다. 키 입력 후 다시 검증한다.

백엔드 Firebase 인증을 켠 경우 실제 Firebase ID Token을 같이 전달한다.

```bash
FIREBASE_ID_TOKEN='...' bash scripts/verify-production-api.sh
```

수동 curl 예시:

```bash
curl -H "Authorization: Bearer $FIREBASE_ID_TOKEN" \
  https://juyoung-basechain.duckdns.org/music-curation/api/chart
```

---

## Health

```http
GET /api/health
```

응답:

```json
{
  "status": "ok",
  "service": "music-curation-backend",
  "timestamp": "2026-06-01T10:12:23.651877Z"
}
```

---

## Ops Summary

```http
GET /api/ops/summary
```

설명:

- 민감정보 없이 API 요청 수, 상태 코드, 추천 이벤트 집계를 확인한다.
- 원본 IP, 사용자 프롬프트, API key, 요청 body는 저장하지 않는다.
- `client_ip`는 SHA-256 hash로만 저장한다.

응답:

```json
{
  "totalRequests": 2,
  "totalRecommendationEvents": 0,
  "topEndpoints": [
    { "endpoint": "/music-curation/api/chart", "count": 1 }
  ],
  "statusCounts": [
    { "status": 200, "count": 1 },
    { "status": 500, "count": 1 }
  ],
  "emotionCounts": []
}
```

---

## Chart

```http
GET /api/chart?regionCode=KR&maxResults=10
```

설명:

- YouTube 인기 음악 차트 조회
- 서버에서 중복/노이즈 필터링
- Caffeine cache 30분 적용

응답:

```json
{
  "songs": [
    {
      "rank": 1,
      "title": "노래 제목",
      "artist": "아티스트",
      "youtubeQuery": "노래 제목 아티스트 official audio",
      "videoId": "youtubeVideoId",
      "cover": "thumbnailUrl",
      "mood": null,
      "durationSeconds": null
    }
  ],
  "source": "youtube",
  "cached": false
}
```

---

## Search

```http
GET /api/search?q=아이유%20밤편지&maxResults=20
```

설명:

- YouTube 검색
- 라이브/방송/커버/쇼츠 등 노이즈 필터링
- Caffeine cache 6시간 적용

응답:

```json
{
  "query": "아이유 밤편지",
  "songs": [
    {
      "rank": null,
      "title": "밤편지",
      "artist": "IU",
      "youtubeQuery": "밤편지 IU official audio",
      "videoId": "youtubeVideoId",
      "cover": "thumbnailUrl",
      "mood": null,
      "durationSeconds": null
    }
  ],
  "cached": true
}
```

---

## Video ID

```http
GET /api/video-id?q=아이유%20밤편지
```

설명:

- 재생 직전 `youtubeQuery`로 videoId 조회
- Caffeine cache 24시간 적용

응답:

```json
{
  "query": "아이유 밤편지",
  "videoId": "youtubeVideoId",
  "cached": true
}
```

---

## Emotion

```http
POST /api/emotion
Content-Type: application/json

{
  "text": "오늘 발표가 잘 끝나서 너무 기뻐"
}
```

응답:

```json
{
  "emotion": "기쁨",
  "confidence": null,
  "provider": "gemini",
  "cached": false
}
```

허용 감정:

```text
기쁨, 슬픔, 분노, 불안, 평온, 설렘, 피로, 집중
```

---

## Recommendation

```http
POST /api/recommend
Content-Type: application/json

{
  "text": "오늘 발표가 잘 끝나서 너무 기뻐",
  "emotion": "기쁨",
  "limit": 8
}
```

응답:

```json
{
  "emotions": [
    { "name": "기쁨", "percent": 80, "color": "#FFD700" }
  ],
  "songs": [
    {
      "title": "노래 제목",
      "artist": "아티스트",
      "mood": "밝고 경쾌함",
      "youtubeQuery": "노래 제목 아티스트"
    }
  ],
  "provider": "gemini",
  "cached": false
}
```

---

## Mix

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

응답:

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
  "provider": "gemini",
  "cached": false
}
```

---

## Mixes

```http
POST /api/mixes
Content-Type: application/json

{
  "likedSongs": [],
  "albums": [],
  "historyList": []
}
```

설명:

- `MixPage.jsx`용 테마 믹스 4개 생성

응답:

```json
{
  "mixes": [
    {
      "title": "출근길 믹스",
      "description": "가볍게 기분을 올리는 곡",
      "emoji": "🚗",
      "songs": []
    }
  ],
  "provider": "gemini",
  "cached": false
}
```

---

## Taste Recommendation

```http
POST /api/taste/recommend
Content-Type: application/json

{
  "genres": ["K-POP", "발라드"],
  "artists": ["IU"],
  "limit": 10
}
```

응답:

```json
{
  "songs": [
    {
      "title": "노래 제목",
      "artist": "아티스트",
      "mood": "잔잔함",
      "youtubeQuery": "노래 제목 아티스트"
    }
  ],
  "provider": "gemini",
  "cached": false
}
```

---

## Similar Song

```http
POST /api/similar-song
Content-Type: application/json

{
  "title": "밤편지",
  "artist": "IU",
  "youtubeQuery": "밤편지 IU"
}
```

응답:

```json
{
  "title": "추천곡",
  "artist": "아티스트",
  "youtubeQuery": "추천곡 아티스트"
}
```
