# 07. Sidebar.jsx — 사이드바

> 2026-05-29 접힘 기능 + 페이지 이동 버튼 추가

---

## 구조 (펼침 상태, width 248px)

```
로고 + 접기(←) 버튼
─────────────
유저 정보 (이름/이메일 + 다크·로그아웃 가로 버튼)
─────────────
메뉴: 🎨 취향 설정 / 🎤 아티스트 스테이지 / 🔍 통합 검색
─────────────
최근 히스토리 (+ 전체보기 → history)
─────────────
❤️ 좋아요 (전체보기 → liked / 전체재생)
─────────────
내 앨범 (전체보기 → album / + 새 앨범)
```

## 접힘 상태 (width 56px)

```
접기(→) 버튼
🏠 홈      → onLogoClick (main)
🎵 음표    → onAlbumPage (album)
❤️ 하트    → onLikedPage (liked)
```

> 접힘 상태에서는 아이콘 3개만. (이전의 중복 음표 placeholder 제거됨)

---

## 접힘 → 메인/플레이어 확장

사이드바 collapsed 상태를 `onCollapseChange` 콜백으로 App.jsx에 전달.

```js
// Sidebar
onClick={() => { const next = !collapsed; setCollapsed(next); onCollapseChange?.(next) }}

// App.jsx
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
<Sidebar onCollapseChange={setSidebarCollapsed} ... />

// 메인 콘텐츠
<div style={{ marginLeft: sidebarCollapsed ? '88px' : '272px',
  transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)' }}>

// MusicPlayer
left: sidebarCollapsed ? 92 : 276
```

---

## 페이지 이동 props

```js
// Sidebar 받는 props
onTasteClick, onArtistClick, onSearchClick   // 메뉴
onAlbumPage, onLikedPage                      // 앨범/좋아요 전체보기
onHistoryClick, onLogoClick                   // 히스토리/홈
onCollapseChange                              // 접힘 알림
activeScreen                                  // 현재 화면 하이라이트
```

## 핸들러

```js
const onAlbumClick = () => onAlbumPage?.()   // 앨범 페이지로 이동
const onLikedClick = () => onLikedPage?.()   // 좋아요 페이지로 이동
```

> 이전엔 펼친 뒤 스크롤(expandAndScroll) 방식이었으나,
> 2026-05-29부터 전용 페이지(`AlbumPage`/`LikedPage`)로 직접 이동.

*업데이트: 2026-05-29*
