# 05. App.jsx — 전역 상태 & 핸들러

> 2026-05-29 sidebarCollapsed, album/liked screen 추가

---

## 전역 state

```js
user, loading, screen, userInput, cachedSongs,
albums, dominantTheme, emotion, historyList, isDark,
likedSongs, emotionStats,
currentSong, currentSongs, videoId,    // 플레이어
sidebarCollapsed                        // 사이드바 접힘 (2026-05-29)
```

## screen 값

`main` / `recommendations` / `history` / `taste` / `artist` / `search` / `album` / `liked`
(상세는 02_FILE_STRUCTURE.md, 20_NEW_PAGES.md)

---

## 주요 핸들러

| 핸들러 | 역할 |
|---|---|
| `handleLogout` | 로그아웃 + state 초기화 |
| `handleToggleLike` | 좋아요 토글 (Firestore 영속화, 낙관적 업데이트) |
| `handleCreateAlbum` | 앨범 생성 (Firestore) |
| `handleDeleteAlbum` | 앨범 삭제 |
| `handleAddToAlbum` | 앨범에 곡 추가 |
| `handleRemoveFromAlbum` | 앨범에서 곡 제거 |
| `handleAnalyzeComplete` | 감정 분석 완료 → recommendations 이동 |
| `handleSongsLoaded` | 히스토리 저장 + 감정 통계(stats/emotionCounts) increment |
| `handlePlaySong` | 전역 재생 (videoId 있으면 바로, 없으면 youtube 검색) |
| `handleSongChange` | 큐 내 곡 전환 |
| `handleQueueEnd` | 큐 끝나면 Gemini 비슷한 곡 자동 추천 |

---

## 사이드바 접힘 연동 (2026-05-29)

```js
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

<Sidebar onCollapseChange={setSidebarCollapsed}
  onAlbumPage={() => setScreen('album')}
  onLikedPage={() => setScreen('liked')} ... />

// 메인 콘텐츠 — 접힘 시 왼쪽으로 확장
<div style={{ marginLeft: sidebarCollapsed ? '88px' : '272px',
  transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)' }}>

// 플레이어 — 접힘 시 같이 확장
<MusicPlayer sidebarCollapsed={sidebarCollapsed} ... />
```

## Firestore 구조

```
users/{uid}/
  ├── history/{docId}   감정 분석 기록
  ├── likes/{songKey}   좋아요 곡
  └── albums/{albumId}  { name, songs[], createdAt }
stats/emotionCounts     전체 유저 감정 집계 (로그인 불필요)
```

*업데이트: 2026-05-29*
