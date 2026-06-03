# 09. YouTube 차트 & 신곡 로딩

> 2026-05-29 인기차트를 search → mostPopular 방식으로 전환

---

## 인기 차트 — videos.list (mostPopular)

### 변경 배경
기존 `search?q=kpop official audio&order=viewCount` 방식은 **키워드 매칭**이라
한국 차트와 무관한 해외곡(네팔/인니/러시아/Charlie Puth 등)이 섞였다.

### 현재 방식
```js
youtube/v3/videos
  ?part=snippet,statistics
  &chart=mostPopular
  &videoCategoryId=10   // 음악
  &regionCode=KR        // 한국
  &maxResults=40
```

| 항목 | search 방식 (구) | mostPopular 방식 (현) |
|---|---|---|
| 결과 | 키워드 매칭 (해외곡 섞임) | 한국 YouTube 실제 음악 인기차트 |
| 정렬 | viewCount 키워드 | YouTube 공식 인기순 |
| API 비용 | 100 units | **1 unit** |
| 조회수 | 없음 | statistics 수신 |

### 후처리 필터
```js
// MV는 차트에서 허용 (실제 인기차트엔 MV가 다수)
// 라이브/커버/리액션/티저/쇼츠/연주(inst)만 제거
if (/live|cover|reaction|리액션|라이브|커버|karaoke|노래방|teaser|예고|behind|비하인드|shorts|inst|instrumental/i.test(rawTitle)) return false
// 제목 중복 제거 (slice 14자)
// 아티스트당 최대 1곡 (slice 8자)
// → 10곡 확보, 부족 시 CHART_FALLBACK 큐레이션 보충
```

---

## 이번 달 신곡 — search (한국곡 필터)

### 방식
```js
youtube/v3/search
  ?q="신곡 발매 kpop"
  &order=date
  &publishedAfter=(최근 60일)
  &regionCode=KR
  &relevanceLanguage=ko
  &maxResults=40
```

### 핵심 필터
```js
// 1) 플레이리스트/모음/믹스 제거
isPlaylistTitle: /playlist|플레이리스트|노래 모음|모음집|믹스|mix|메들리|선곡|연속 재생|hour|시간|무광고|틱톡|쇼츠/i

// 2) 라이브/커버/리액션/티저/가사/안무 제거
// 3) 제목 2~40자 (긴 제목 = 모음 영상)
// 4) 한국 곡만: 제목/아티스트에 한글 포함
const hasKorean = /[가-힣]/.test(rawTitle) || /[가-힣]/.test(artist)
// 5) 제목/아티스트 중복 제거
// → 단일 신곡 4곡 미만이면 NEW_FALLBACK 큐레이션 사용
```

---

## parseYouTubeItem 공통 헬퍼

```js
// videos.list(mostPopular) → item.id 는 문자열
// search → item.id.videoId
const videoId = typeof item.id === 'string' ? item.id : item.id?.videoId

// 채널명에서 레이블/유통사 제거 (HYBE/SM/JYP/YG/VEVO 등)
// 레이블 채널이라 아티스트가 비면 → 제목 앞부분에서 추출
// 언어 필드: item.snippet.defaultAudioLanguage
```

---

## UI

- 인기차트: 2열 그리드, 곡별 재생버튼(흰 배경 + 호버 그라데이션), 헤더에 "모두 재생" 버튼
- 신곡: 가로 스크롤 카드(width 130 고정, 제목 ellipsis), NEW 뱃지

*업데이트: 2026-05-29*
