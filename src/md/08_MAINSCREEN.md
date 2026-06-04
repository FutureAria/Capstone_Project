# 08. MainScreen.jsx — 메인 화면

> 2026-05-29 차트 버튼 통일, 신곡 필터, 취향 카드, placeholder 가시성 수정

---

## 화면 구성 (위 → 아래)

```
① 공지 배너 (감정 분석 AI 모델 v2.0 업데이트)
② 입력 영역
   - 탭: 😊 감정 분석 / 🔍 노래 검색
   - 감정 분석: textarea (오늘 하루 어땠나요?) + "감정 분석하기 →"
   - 노래 검색: input (노래 제목/아티스트) + "검색"
③ 취향 기반 추천 카드 (접기/펼치기)
④ 오늘의 감정 (도넛 차트) + 인기 감정 TOP 5
⑤ 인기 차트 (2열)
⑥ 이번 달 신곡 (가로 스크롤)
```

---

## ② 입력 영역 — placeholder 가시성 (2026-05-29)

인라인 `style`로는 `::placeholder` 색을 못 바꾼다 → `<style>` 태그 주입.

```jsx
<textarea className="mc-emotion-input" ... />
<style>{`.mc-emotion-input::placeholder{
  color:${isDark?'rgba(200,210,255,0.55)':'rgba(20,40,90,0.40)'};opacity:1}`}</style>

<input className="mc-search-input" ... />
<style>{`.mc-search-input::placeholder{
  color:${isDark?'rgba(200,210,255,0.55)':'rgba(20,40,90,0.45)'};opacity:1}`}</style>
```

> 다크테마에서 안내 문구가 안 보이던 문제 해결.

---

## ③ 취향 기반 추천 카드

- 입력창 바로 아래 독립 블록 (TasteSelect와 동일 기능을 메인에 내장)
- 장르 7개 칩 + 아티스트 입력 → Gemini 추천
- 접기/펼치기 토글

### 라이트테마 버튼 가시성 (2026-05-29)
`theme.from/to`가 라이트테마에서 연해 흰 글씨가 안 보이던 문제 →
"맞춤 추천받기" / "전체 재생" 버튼을 **진한 색 고정**:
```js
background: 'linear-gradient(135deg,#7C5CFF,#FF4D8D)'
```

---

## ⑤ 인기 차트

- API: `videos.list?chart=mostPopular` (상세는 09_YOUTUBE_CHART.md)
- 곡별 재생버튼: 흰 배경 + 호버 시 그라데이션 (사이드바 스타일 통일)
- 헤더 우측 "모두 재생" 버튼 → 차트 10곡 전체 큐 재생

```jsx
onClick={() => onPlaySong?.(
  chartData[0],
  chartData.map(c => ({ title:c.title, artist:c.artist, youtubeQuery:c.youtubeQuery, videoId:c.videoId }))
)}
```

---

## ⑥ 이번 달 신곡

- API: search + 한국곡 필터 (상세는 09_YOUTUBE_CHART.md)
- 카드 너비 `width:130` 고정 → 긴 제목은 ellipsis(...) 처리 + title 툴팁
- 클릭 시 videoId 있으면 바로 재생, 없으면 youtubeQuery 검색 재생

---

## Props

```js
{ emotion, onAnalyzeComplete, onEmotionSelect, onPlaySong, isDark, emotionStats }
```

## 주요 state

```js
inputText, searchMode('emotion'|'search'), searchQuery,
chartData, chartLoading, newSongs, newSongsLoading,
tasteGenres, tasteArtist, tasteResults, tasteLoading, tasteOpen
```

*업데이트: 2026-05-29*
