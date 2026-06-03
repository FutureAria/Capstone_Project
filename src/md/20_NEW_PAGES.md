# 20. 신규 페이지 정리

> 2026-05-27 ~ 05-29 추가된 5개 페이지 컴포넌트 정리
> 관련 파일: `App.jsx`(screen 분기), `Sidebar.jsx`(진입 버튼)

---

## 페이지 진입 경로 한눈에 보기

| 페이지 | screen 값 | 진입 방법 |
|---|---|---|
| 취향 선택 | `taste` | 사이드바 메뉴 "🎨 취향 설정" / 메인 취향 카드 |
| 아티스트 스테이지 | `artist` | 사이드바 메뉴 "🎤 아티스트 스테이지" |
| 통합 검색 | `search` | 사이드바 메뉴 "🔍 통합 검색" |
| 내 앨범 | `album` | 사이드바 "내 앨범 > 전체보기" / 접힘 시 🎵 아이콘 |
| 좋아요 | `liked` | 사이드바 "좋아요 > 전체보기" / 접힘 시 ❤️ 아이콘 |

공통 props: `isDark`, `emotion`, `onBack`, `onPlaySong`

---

## 1. TasteSelect.jsx — 취향 선택

### 목적
장르·아티스트를 선택하면 Gemini AI가 맞춤 곡을 추천

### 동작
1. 장르 10개(K-POP/발라드/힙합/R&B/인디/댄스/트로트/OST/Lo-Fi/클래식) 복수 선택
2. 아티스트 18명 중 선택 (이름 검색 필터 지원)
3. "맞춤 추천받기" → Gemini API → 10곡 결과
4. 전체 재생 / 재선택

### Props
```js
{ isDark, emotion, onBack, onPlaySong }
```

### API
```
gemini-2.5-flash-lite : 선호 장르/아티스트 → 한국 노래 10곡 JSON
```

### 참고
- 메인 화면(`MainScreen`)에도 동일 기능의 "취향 기반 추천" 카드가 별도로 존재 (입력창 아래)
- 취향 정보 Firestore 저장은 미구현 (로컬 state만)

---

## 2. ArtistStage.jsx — 아티스트 스테이지

### 목적
특정 아티스트의 곡만 모아서 재생

### 동작
1. 아티스트 이름 검색 또는 빠른 선택(15명)
2. YouTube Search API로 해당 아티스트 곡 검색
3. 2열 그리드로 곡 목록 표시
4. 전체 재생 지원

### Props
```js
{ isDark, emotion, onBack, onPlaySong }
```

### API
```
youtube/v3/search : q="아티스트명 official audio kpop", maxResults=20
→ MV/중복 제거 후 12곡
```

---

## 3. Search.jsx — 통합 검색

### 목적
노래·아티스트·분위기를 하나의 검색창으로 통합 검색

### 동작
- 탭 4개: 전체 / 노래 / 아티스트 / 분위기
- 분위기 태그 8개 (신나는/잔잔한/설레는/슬픈/힘나는/집중되는/새벽감성/드라이브)
- 최근 검색어 저장 (localStorage, 최대 8개)
- 좋아요 토글 연동
- 전체 재생

### Props
```js
{ isDark, emotion, onBack, onPlaySong, likedSongs, onToggleLike }
```

### API
```
youtube/v3/search : 탭별 쿼리 조합 (artist→"official audio", mood→미리 조합된 쿼리)
```

---

## 4. AlbumPage.jsx — 내 앨범 전체 페이지 (2026-05-29 신규)

### 목적
사이드바의 앨범 목록을 전체 화면에서 관리

### 동작
1. 앨범 목록 카드 표시 (첫 글자 아이콘 + 곡 수)
2. "+ 새 앨범" 버튼으로 앨범 생성
3. 앨범 펼치기 → 곡 목록 표시
4. 앨범 전체 재생 / 곡 개별 재생 / 곡 제거 / 앨범 삭제

### Props
```js
{ albums, isDark, emotion, onBack, onPlaySong,
  onCreateAlbum, onDeleteAlbum, onRemoveFromAlbum }
```

### 진입
- 사이드바 "내 앨범" 헤더 클릭 또는 "전체보기" 버튼
- 사이드바 접힘 상태에서 🎵 음표 아이콘
- App.jsx: `onAlbumPage={() => setScreen('album')}`

---

## 5. LikedPage.jsx — 좋아요한 곡 전체 페이지 (2026-05-29 신규)

### 목적
좋아요한 곡 전체를 한 화면에서 보고 재생

### 동작
1. 좋아요 곡 전체 목록 (순번 + 아이콘 + 제목/아티스트)
2. 전체 재생 버튼
3. 곡 개별 재생 / 좋아요 해제(하트 토글)

### Props
```js
{ likedSongs, isDark, emotion, onBack, onPlaySong, onToggleLike }
```

### 진입
- 사이드바 "좋아요" 헤더 클릭 또는 "전체보기" 버튼
- 사이드바 접힘 상태에서 ❤️ 하트 아이콘
- App.jsx: `onLikedPage={() => setScreen('liked')}`

---

## 페이지 디자인 공통 규칙

모든 신규 페이지는 아래 헤더 패턴을 따른다 (History도 2026-05-29부터 통일):

```jsx
<div style={{ display:'flex', alignItems:'center', gap:16, padding:'24px 28px 0' }}>
  <button onClick={onBack} style={{
    background:'none',
    border:`1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(100,120,200,0.25)'}`,
    borderRadius:12, padding:'8px 16px', color:sc, cursor:'pointer', fontSize:13,
  }}>← 돌아가기</button>
  <div>
    <h2 style={{ fontSize:22, fontWeight:700, color:tc, margin:0 }}>아이콘 제목</h2>
    <p style={{ fontSize:13, color:sc, margin:'4px 0 0' }}>부제목</p>
  </div>
</div>
```

- 헤더는 **배경 바 없이** 투명 위에 글씨만 (sticky 유리 박스 금지)
- 전체 재생 버튼은 `linear-gradient(135deg,#7C5CFF,#FF4D8D)` 고정 (라이트테마 가시성)
- 곡 행 재생 버튼: 흰 배경 + 호버 시 그라데이션 (사이드바 스타일과 통일)

---

## App.jsx 연동 코드

```jsx
// import
import AlbumPage from './components/AlbumPage'
import LikedPage from './components/LikedPage'

// Sidebar props
onAlbumPage={() => setScreen('album')}
onLikedPage={() => setScreen('liked')}

// screen 분기
{screen === 'album' && (
  <AlbumPage albums={albums} isDark={isDark} emotion={emotion}
    onBack={() => setScreen('main')} onPlaySong={handlePlaySong}
    onCreateAlbum={handleCreateAlbum} onDeleteAlbum={handleDeleteAlbum}
    onRemoveFromAlbum={handleRemoveFromAlbum} />
)}
{screen === 'liked' && (
  <LikedPage likedSongs={likedSongs} isDark={isDark} emotion={emotion}
    onBack={() => setScreen('main')} onPlaySong={handlePlaySong}
    onToggleLike={handleToggleLike} />
)}
```

*업데이트: 2026-05-29*
