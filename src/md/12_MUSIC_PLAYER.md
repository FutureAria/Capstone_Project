# 12. MusicPlayer.jsx — 전역 미니 플레이어

## 위치
```js
position: 'fixed'
bottom: 16
left: 276   // 사이드바(248) + left(12) + gap(16)
right: 16
borderRadius: 20
```

## YouTube IFrame Player API

### 초기화
```js
// videoId 변경될 때마다 실행
useEffect(() => {
  playerRef.current?.destroy()
  new window.YT.Player('yt-player', {
    videoId,
    playerVars: { autoplay:1, controls:0, rel:0 },
    events: { onReady, onStateChange }
  })
}, [videoId])
```

### 숨겨진 iframe
```jsx
// 영상은 opacity:0, 1x1px으로 숨기고 소리만 재생
<div id="yt-player" style={{ opacity:0, pointerEvents:'none', width:1, height:1 }} />
```

### 진행 상태 업데이트
```js
// 500ms 인터벌로 currentTime, duration 갱신
setInterval(() => {
  setCurrentTime(playerRef.current.getCurrentTime())
  setDuration(playerRef.current.getDuration())
}, 500)
```

## 컨트롤 구성
```
진행바 (range input → seekTo)
앨범 썸네일 (YouTube img.youtube.com/vi/{videoId}/mqdefault.jpg)
노래 제목 / 아티스트
시간 (현재 / 전체)
이전 / 재생·일시정지 / 다음
볼륨 (팝업 슬라이더)
닫기
```

## 이전/다음 로직
```js
// songs 배열 인덱스 기반
const currentIndex = songs?.findIndex(s => s.title === song?.title)
handlePrev → songs[currentIndex - 1]
handleNext → songs[currentIndex + 1]
// 마지막 곡 끝나면 자동으로 다음 곡
```

## Props
```js
song, videoId, onClose, songs, onSongChange, isDark
```
