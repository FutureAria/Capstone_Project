# 02. 파일 구조 & 화면 전환

## 파일 구조
```
src/
├── App.jsx                  전역 state, 화면 전환, 배경 통합
├── lib/
│   └── firebase.js          Firebase 초기화 (auth, db)
├── styles/
│   └── theme.js             라이트/다크 테마 전체
└── components/
    ├── Auth.jsx             로그인/회원가입
    ├── MainScreen.jsx       메인 화면
    ├── Recommendations.jsx  추천 결과 화면
    ├── History.jsx          히스토리 화면
    ├── Sidebar.jsx          사이드바 (floating)
    └── MusicPlayer.jsx      하단 미니 플레이어
```

## 화면 전환 흐름
```
[main]
  ↓ 감정 입력 후 분석 완료
[recommendations]
  ↓ 히스토리 버튼
[history]
  ↓ 뒤로가기
  cachedSongs 있으면 → [recommendations]
  없으면            → [main]
```

## App.jsx 레이아웃 구조
```
<div style={appBackground}>         ← 전체 배경 (감정별 그라데이션)
  <Sidebar />                        ← fixed, floating 패널 (left:12, top:12)
  <div style={{ marginLeft:272px }}> ← 콘텐츠 영역
    {screen === 'main' && <MainScreen />}
    {screen === 'recommendations' && <Recommendations />}
    {screen === 'history' && <History />}
  </div>
  {videoId && <MusicPlayer />}       ← fixed, 하단 floating
</div>
```

## prop 전달 구조

```
App.jsx
├── isDark, onToggleDark  →  Sidebar
├── isDark                →  MainScreen
├── isDark                →  Recommendations
├── isDark                →  History
└── isDark                →  MusicPlayer
```
