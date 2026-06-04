# 13. History.jsx — 히스토리 화면

> 2026-05-29 상단 헤더를 투명 스타일로 통일

---

## 목적
사용자의 감정 분석 기록을 Firestore에서 불러와 카드로 표시

## 데이터
```
users/{uid}/history/{docId}
  - freeText / text : 입력 문구
  - emotions : [{ name, percent, color }]
  - songs : [{ title, artist, youtubeQuery, videoId }]
  - timestamp
```
→ timestamp 내림차순 정렬 (최신 먼저)

---

## 헤더 — 투명 스타일 (2026-05-29 변경)

기존: `position:sticky` + 진한 유리 배경 바(`getLiquidGlass`)
변경: **배경 바 없이** 투명 위에 글씨만 (LikedPage와 통일)

```jsx
<div style={{ display:'flex', alignItems:'center', gap:16, padding:'24px 28px 0' }}>
  <button onClick={onBack} style={{ border:'1px solid ...', borderRadius:12,
    padding:'8px 16px' }}>← 돌아가기</button>
  <div>
    <h2 style={{ fontSize:22, fontWeight:700 }}>📜 내 취향 히스토리</h2>
    <p style={{ fontSize:13, color:sc }}>{이름}님의 기록 {n}개</p>
  </div>
</div>
```

> `getLiquidGlass` 함수는 미사용 상태로 남아있음 (삭제 가능).

---

## HistoryItem (개별 카드)

- 감정 그라데이션 바 + 감정별 퍼센트
- 곡 목록 (기본 3곡, "+N곡 더 보기"로 펼침)
- 곡 클릭 → `onPlay(song, item.songs)` 큐 재생
- 본문 padding: `20px 28px 100px` (좌우 통일 + 하단 플레이어 여백)

## Props

```js
{ user, onBack, onPlaySong, emotion, isDark }
```

*업데이트: 2026-05-29*
