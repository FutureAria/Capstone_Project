# 11. Recommendations.jsx — 추천 결과 화면

## 화면 구조
```
전체 패널 (borderRadius:24px, floating)
├── 헤더 (sticky)
│   ├── ← 뒤로가기
│   ├── 타이틀 + 유저명 + 곡 수
│   ├── 입력 텍스트 미리보기 뱃지
│   └── 📋 히스토리 버튼
└── 2칸 그리드
    ├── 좌: 감정 분석
    │   ├── 그라데이션 진행바 (buildGradient 함수)
    │   ├── 감정별 바 차트
    │   └── 주요 감정 카드
    └── 우: 추천 플레이리스트
        ├── 노래 목록 (번호, 제목, 아티스트, mood 뱃지)
        ├── + 버튼 → AlbumDropdown
        ├── ▶ 재생 버튼
        └── 🔄 다시 추천받기
```

## AI 추천 함수 (`getClaudeRecommendations`)
```
현재: Gemini gemini-2.5-flash-lite
목표: Claude claude-sonnet-4-6 (주석 처리된 코드 있음)

프롬프트 출력 형식:
{
  "emotions": [{ "name", "percent", "color" }],   // 2~4개
  "songs":    [{ "title", "artist", "mood", "youtubeQuery" }]  // 8개
}
```

## 캐싱 로직
```js
// hasFetched ref로 중복 호출 방지
if (cachedSongs?.songs?.length > 0) return  // 캐시 있으면 스킵
if (hasFetched.current) return
hasFetched.current = true
fetchRecommendations()
```

## liquidGlass (isDark 분기)
```js
// 컴포넌트 함수 안에서 선언 (바깥에서 isDark 참조 불가)
const liquidGlass = isDark
  ? { background:'rgba(30,42,120,0.52)', ... }  // 네이비
  : { background:'rgba(255,255,255,0.62)', ... } // 흰색
```

## Props
```js
userInput, user, cachedSongs, onSongsLoaded
onBack, onHistory, albums, onAddToAlbum
onThemeChange, onEmotionChange, onPlaySong, isDark
```
