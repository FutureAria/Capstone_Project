# 14. 다크/라이트 모드 시스템

## 상태 흐름
```
App.jsx  isDark state (useState)
  ↓ prop
Sidebar → onToggleDark 버튼 (🌙 다크 / ☀️ 라이트)
  ↓ 버튼 클릭
setIsDark(d => !d)
  ↓ App.jsx에서 모든 자식에 isDark prop 전달
MainScreen / Recommendations / History / MusicPlayer
```

## 모든 컴포넌트 공통 분기 패턴
```js
const theme = isDark ? getDarkTheme(emotion) : getTheme(emotion)
const G     = isDark ? glassDark : glass
const tc    = isDark ? '#c0c8f0' : '#1a2a4a'
const sc    = isDark ? 'rgba(180,190,255,0.5)' : 'rgba(20,40,90,0.5)'
const trow  = isDark ? 'trow trow-dark' : 'trow trow-light'
const gbtn  = isDark ? 'gbtn gbtn-dark' : 'gbtn gbtn-light'
```

## 배경 동기화 원리
```
App.jsx → appBackground(currentTheme, isDark) 로 전체 배경 담당
Sidebar → floating 패널이 그 위에 떠있어서 자동으로 배경 공유
각 화면 → pageBackground() = transparent → App.jsx 배경 그대로 보임
```

## 라이트 색상 팔레트
```
배경: 밝은 하늘색/라벤더 계열 (#e8f4ff ~ #f0f8ff)
카드: rgba(255,255,255,0.60)
텍스트: #1a2a4a (네이비)
서브: rgba(20,40,90,0.50)
```

## 다크 색상 팔레트
```
배경: 어두운 네이비/퍼플 계열 (#080818 ~ #0e1030)
카드: rgba(40,55,140, 계산값) — 네이비 계열
텍스트: #c0c8f0 (연한 퍼플화이트)
서브: rgba(180,190,255,0.50)
```

## 주의사항
- `Auth.jsx`는 아직 isDark 미지원 (TODO)
- `liquidGlass` 같이 컴포넌트 바깥에 선언된 스타일 객체는 `isDark` 참조 불가
  → 반드시 `getLiquidGlass(isDark)` 형태의 함수로 처리
