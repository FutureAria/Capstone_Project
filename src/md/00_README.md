# 🎵 Music Curation — 문서 목차
> **새 채팅 시작 시 이 파일 먼저 읽기. 필요한 문서만 추가로 첨부.**

## 문서 목록

| 번호 | 파일명 | 내용 |
|---|---|---|
| 00 | `00_README.md` | 목차 (현재 파일) |
| 01 | `01_PROJECT_OVERVIEW.md` | 프로젝트 개요, 기술스택, .env |
| 02 | `02_FILE_STRUCTURE.md` | 파일 구조 & 화면 전환 흐름 |
| 03 | `03_FIREBASE.md` | Firebase 설정, Auth, Firestore |
| 04 | `04_THEME_SYSTEM.md` | 라이트/다크 테마 전체 |
| 05 | `05_APP_STATE.md` | App.jsx 전역 상태 & 핸들러 |
| 06 | `06_AUTH.md` | 로그인/회원가입 로직 + UI 스타일 |
| 07 | `07_SIDEBAR.md` | 사이드바 floating 패널 (접힘/펼침, 모바일 슬라이드) |
| 08 | `08_MAINSCREEN.md` | 메인 화면 (입력, 차트, 통계, MV TOP10, 취향) |
| 09 | `09_YOUTUBE_CHART.md` | YouTube 차트 로딩 & 후처리 (mostPopular) |
| 10 | `10_EMOTION_ANALYSIS.md` | 감정 분석 API (Gemini/Claude) |
| 11 | `11_RECOMMENDATIONS.md` | 추천 결과 화면 |
| 12 | `12_MUSIC_PLAYER.md` | 전역 미니 플레이어 (큐 드래그앤드롭) |
| 13 | `13_HISTORY.md` | 히스토리 화면 |
| 14 | `14_DARK_LIGHT_MODE.md` | 다크/라이트 모드 시스템 |
| 15 | `15_LIQUID_GLASS.md` | 리퀴드 글래스 UI 상세 |
| 16 | `16_API_LIMITS.md` | API 한도 & 에러 대응 (quota 캐싱 포함) |
| 17 | `17_TODO.md` | 남은 작업 & 발표 준비 |
| 18 | `18_BUG_HISTORY.md` | 해결된 버그 히스토리 |
| 19 | `19_NEW_FEATURES.md` | 신규 기능 기획서 & 구현 현황 |
| 20 | `20_NEW_PAGES.md` | 신규 페이지 (취향/아티스트/검색/앨범/좋아요) |
| 21 | `21_HANDOFF_BACKEND.md` | **백엔드 인수인계 문서 (신규)** |

## 화면(screen) 목록 — 최신

| screen 값 | 컴포넌트 | 설명 |
|---|---|---|
| `'main'` | `MainScreen.jsx` | 메인 (감정 입력, 차트, MV TOP10, 취향) |
| `'recommendations'` | `Recommendations.jsx` | 감정 분석 결과 & 추천 곡 |
| `'history'` | `History.jsx` | 분석 히스토리 (재생/좋아요/앨범추가/다음에재생) |
| `'taste'` | `TasteSelect.jsx` | 취향 선택 (장르/아티스트, Firestore 저장) |
| `'artist'` | `ArtistStage.jsx` | 아티스트 스테이지 |
| `'search'` | `Search.jsx` | 통합 검색 엔진 |
| `'album'` | `AlbumPage.jsx` | 내 앨범 전체 페이지 |
| `'liked'` | `LikedPage.jsx` | 좋아요한 곡 전체 페이지 |
| `'mix'` | `MixPage.jsx` | **맞춤 믹스 (AI 자동 생성) ← 신규** |

## 컴포넌트 파일 목록 — 최신

```
src/components/
├── Auth.jsx             로그인/회원가입 (다크모드 지원)
├── MainScreen.jsx       메인 (차트, MV TOP10 + MV팝업, 검색 필터, 취향, 반응형)
├── Recommendations.jsx  추천 결과 화면 (로딩화면 다크모드 대응)
├── History.jsx          히스토리 (재생/좋아요/앨범추가/다음에재생)
├── Sidebar.jsx          사이드바 (모바일 슬라이드, 믹스 버튼, 좋아요 헤더 2단)
├── MusicPlayer.jsx      하단 미니 플레이어 (큐 드래그앤드롭, 모바일 위치)
├── TasteSelect.jsx      취향 선택 (Firestore 영속화)
├── ArtistStage.jsx      아티스트 스테이지
├── Search.jsx           통합 검색 엔진
├── AlbumPage.jsx        내 앨범 전체 페이지
├── LikedPage.jsx        좋아요한 곡 전체 페이지 (다음에재생 버튼)
└── MixPage.jsx          맞춤 믹스 페이지            ← 신규 (2026-05-30)
```

## 새 채팅 시작 템플릿

```
이 파일(00_README.md) 먼저 읽고 작업 이어서 해줘.
오늘 할 작업: [내용]
관련 문서: [XX_FILENAME.md 첨부]
수정할 파일: [파일명.jsx 첨부]
```

## ⚠️ 작업 시 주의사항 (중요)

새 채팅에서 코드를 수정할 때는 **반드시 현재 실행 중인 최신 파일**을 첨부할 것.
이전 버전 파일을 올리면 그동안의 수정이 사라진다.
특히 `App.jsx`, `MainScreen.jsx`, `Sidebar.jsx`는 자주 바뀌므로 최신본 확인 필수.

## 작업 이력 요약

| 날짜 | 작업 내용 |
|---|---|
| 2026-05-13 | Auth.jsx UI 전면 개선, 버그 5건 수정 |
| 2026-05-13 | Firebase `persistentLocalCache` 적용 |
| 2026-05-26 | 좋아요 버튼 & 플레이리스트, 재생목록(큐), 다크모드 Auth |
| 2026-05-27 | `TasteSelect`, `ArtistStage`, `Search` 신규 구현 |
| 2026-05-29 | 인기차트 `mostPopular` 전환, 신곡 필터, 사이드바 접힘 |
| 2026-05-29 | `AlbumPage`, `LikedPage` 신규 페이지 |
| 2026-05-30 | **맞춤 믹스(`MixPage`) 신규** (좋아요·앨범·감정 기반 AI 믹스) |
| 2026-05-30 | **모바일 반응형** (사이드바 슬라이드 + 햄버거, 그리드 auto-fit) |
| 2026-05-30 | **큐 드래그앤드롭** (재생목록 순서 변경) |
| 2026-05-30 | **취향 Firestore 저장** (`preferences/taste`) |
| 2026-05-30 | 히스토리 곡 재생/좋아요/앨범추가/다음에재생 버튼 |
| 2026-05-30 | **다음에 재생(큐 추가)** 전역 기능 (히스토리/좋아요/믹스) |
| 2026-05-30 | 신곡 → **뮤직비디오 TOP10** (차트 재활용) + **MV 팝업 모달** |
| 2026-05-30 | 검색 필터 강화 (방송/라이브/길이 필터 + 공식채널 우선) |
| 2026-05-30 | **YouTube videoId localStorage 캐싱** (quota 절약) |
| 2026-05-30 | 다크모드 로딩화면, 라이트모드 재생아이콘 가시성 수정 |

*업데이트: 2026-05-30*
