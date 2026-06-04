# 18. 해결된 버그 히스토리

| 버그 | 원인 | 해결 |
|---|---|---|
| iTunes corsproxy 403 | corsproxy.io 차단 | YouTube Data API로 차트 교체 |
| Gemini 2.5-flash RPD 20개 초과 | 무료 일일 한도 너무 낮음 | `gemini-2.5-flash-lite`로 교체 |
| gemini-1.5-flash v1 404 | v1 엔드포인트 미지원 | `gemini-2.5-flash-lite` + `v1beta` 사용 |
| 히스토리 뒤로가기 → 추천 실패 | `onBack`이 항상 `recommendations`로 이동 | `cachedSongs.length > 0` 분기 처리 |
| `sidebarBackground` 참조 오류 | 함수명 변경 후 미반영 | `sidebarGlass()` 함수로 교체 |
| `liquidGlass` 스코프 오류 | 파일 상단 상수에서 `isDark` 참조 불가 | `getLiquidGlass(isDark)` 함수로 변경 |
| `tc / sc / G` 변수 미선언 | 이전 버전 파일 덮어쓰기 누락 | 각 컴포넌트 함수 내 변수 블록 추가 |
| 차트 `&#39;` HTML 엔티티 표시 | YouTube API 응답에 HTML 인코딩 | `decodeHTML()` textarea 트릭 적용 |
| 차트 MV 영상 섞임 | MV/뮤직비디오 필터 없음 | `isMV` 플래그 + 제외 로직 추가 |
| 차트 동일 곡 중복 | 리믹스/버전 다른 영상 | 제목 앞 10글자 Set으로 유사 중복 제거 |
| 다크모드 카드 회색 계열 | `glassDark`가 흰색 반투명 기반 | 네이비 `rgba(40,55,140)` 계열로 전환 |
| 사이드바 floating 라운딩 사라짐 | 파일 교체 시 스타일 초기화 | `left:12, top:12, borderRadius:24px` 복원 |
| Recommendations `isDark` 스코프 오류 | `AlbumDropdown`이 함수 밖에서 `isDark` 참조 | `isDark` 변수 선언 위치 재정렬 |
| `EmotionLoadingScreen` / `MusicLoadingScreen` ReferenceError | 두 보조 컴포넌트가 `isDark`를 props 없이 직접 참조 | 두 컴포넌트 props에 `isDark` 추가 + 호출부에서 `isDark={isDark}` 전달 |
| `Recommendations` / `AlbumDropdown` ReferenceError | `AlbumDropdown`이 `isDark`, `tc`, `sc`, `liquidGlass`를 props 없이 참조; `Recommendations`가 `isDark` props 미수신으로 항상 라이트 테마 고정 | `Recommendations` props에 `isDark` 추가 + 다크 테마 분기 처리; `AlbumDropdown` props에 `isDark`, `tc`, `sc`, `liquidGlass` 추가 + 호출부에서 전달 |
| **Auth 배경 투명** | `pageBackground()`가 `background:'transparent'` 반환 → App.jsx 배경이 그대로 비침 | `appBackground(getTheme('default'), false)`로 교체 → 라이트 라벤더 그라데이션 확보 |
| **Auth 입력창 텍스트 안 보임** | `glass(0.09)` + `color:'#fff'` → 라이트 배경에 흰 텍스트 충돌 | `glass(0.65, 20)` + `color: theme.text`(`#0a1830`)으로 교체 |
| **Auth 로고 불일치** | 빨간 유튜브 사각형 SVG 사용 → 사이드바와 전혀 다른 로고 | `Sidebar.jsx` 코드 직접 확인 후 동일 스펙으로 교체 |
| **Auth 탭 버튼 텍스트 안 보임** | 비활성 탭 `color:'#fff'` → 라이트 배경에서 흰 글씨 | 비활성 탭 색상 `SC`(`rgba(20,40,90,0.50)`)로 교체 |
| **Auth 구분선 색 반전** | `rgba(255,255,255,0.2)` → 라이트 배경에서 진하게 표시 | `rgba(20,40,90,0.15)` 라이트 계열로 교체 |

## 주요 패턴 교훈

1. **컴포넌트 밖 상수에서 props/state 참조 불가**
   → `const x = isDark ? A : B` 형태의 상수는 반드시 함수 안에서 선언

2. **파일 교체 시 구버전 참조 오류**
   → 교체 후 콘솔 에러 줄 번호 확인, 해당 변수가 선언됐는지 grep으로 체크

3. **API 모델명/버전 주의**
   → gemini: `v1beta` 사용, `v1`은 일부 모델 미지원
   → Claude: `v1/messages`, `anthropic-dangerous-direct-browser-access: true` 헤더 필요

4. **다크 전용 색상을 라이트 화면에 그대로 쓰지 말 것**
   → `color:'#fff'`, `rgba(255,255,255,0.x)` 계열은 다크 배경 전용
   → 라이트 화면에서는 반드시 `theme.text` / `rgba(20,40,90,0.x)` 계열 사용

5. **로고는 반드시 Sidebar.jsx 원본 코드 직접 확인 후 복사**
   → 추측으로 만들면 크기·색상·SVG 모두 달라짐
   → Sidebar 로고 변경 시 Auth 로고도 반드시 동기화

*업데이트: 2026-05-13*