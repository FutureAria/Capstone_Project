# 15. 리퀴드 글래스 UI

## 핵심 원리
```
backdrop-filter: blur() saturate() brightness()
  → 뒤 배경을 흐리게 + 채도 높이기 + 밝기 조절
  → 유리가 뒤 배경을 굴절시키는 효과

inset 0 1px 0 rgba(흰색)  → 상단 하이라이트 (볼록한 느낌)
inset 0 -1px 0 rgba(어두운색) → 하단 굴절선
box-shadow rgba(어두운색)  → 떠있는 그림자
```

## 라이트 glass()
```js
glass(opacity=0.60, blur=24) = {
  background: rgba(255,255,255,0.60),
  backdropFilter: blur(24px) saturate(180%) brightness(1.04),
  border: 1px solid rgba(255,255,255,0.75),
  boxShadow: 그림자 + inset 상단 하이라이트
}
```

## 다크 glassDark()
```js
glassDark(opacity=0.15, blur=28) = {
  background: rgba(40,55,140, opacity계산값),  // 네이비
  backdropFilter: blur(28px) saturate(180%) brightness(1.15),  // 더 밝게
  border: 1px solid rgba(140,160,255,0.28),   // 퍼플 테두리
  boxShadow: 깊은그림자 + inset 상단(밝은파랑) + inset 하단(어두운파랑) + 외곽선
}
```

## Sidebar glass
```js
sidebarGlass() = {
  background: rgba(255,255,255,0.52),
  backdropFilter: blur(40px) saturate(200%) brightness(1.08),  // 더 강하게
  border: 1px solid rgba(255,255,255,0.80),
  boxShadow: 외부그림자 + inset 상단하이라이트
}

sidebarGlassDark() = {
  background: rgba(25,35,100,0.62),
  backdropFilter: blur(48px) saturate(200%) brightness(1.12),
  border: 1px solid rgba(140,160,255,0.22),
  boxShadow: 4단계 그림자
}
```

## floating 패널 패턴
```
사이드바: left:12, top:12, bottom:12, borderRadius:24px
Recommendations 패널: borderRadius:24px, margin 12px
MusicPlayer: bottom:16, left:276, right:16, borderRadius:20
```

## glowPulse 애니메이션 (Recommendations)
```css
@keyframes glowPulse {
  0%,100% { opacity:0.35; filter:blur(10px) }
  50%     { opacity:0.65; filter:blur(16px) }
}
/* 감정 바 뒤 글로우 효과 */
```
