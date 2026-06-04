# 04. 테마 시스템 (`theme.js`)

## 감정 8가지
`기쁨` `설렘` `평온` `슬픔` `분노` `불안` `집중` `피로` + `default`

## 함수 목록

| 함수 | 반환 | 설명 |
|---|---|---|
| `glass(opacity, blur)` | style 객체 | 라이트 유리 효과 |
| `glassDark(opacity, blur)` | style 객체 | 다크 유리 (네이비 계열) |
| `sidebarGlass()` | style 객체 | 라이트 사이드바 패널 |
| `sidebarGlassDark()` | style 객체 | 다크 사이드바 패널 |
| `appBackground(theme, isDark)` | style 객체 | 전체 앱 배경 래퍼 |
| `pageBackground()` | style 객체 | 콘텐츠 영역 (투명) ⚠️ 아래 주의사항 참고 |
| `getTheme(emotion)` | `{from,mid,to,text}` | 라이트 감정 테마 |
| `getDarkTheme(emotion)` | `{from,mid,to,text}` | 다크 감정 테마 |
| `getComplement(emotion)` | hex string | 라이트 보색 |
| `getDarkComplement(emotion)` | hex string | 다크 보색 |

## 테마 객체 구조
```js
{ from: "#색상", mid: "#색상", to: "#색상", text: "#색상" }
// appBackground에서 linear-gradient(145deg, from, mid, to) 로 사용
// text는 해당 배경 위 기본 텍스트 색상
```

## appBackground vs pageBackground 사용 기준

| 상황 | 사용 함수 | 이유 |
|---|---|---|
| App.jsx 최상위 래퍼 | `appBackground(theme, isDark)` | 감정 테마 배경 그라데이션 적용 |
| MainScreen, Recommendations 등 콘텐츠 화면 | `pageBackground()` | App.jsx 배경이 그대로 비쳐야 함 |
| **Auth처럼 독립된 전체화면** | `appBackground(getTheme('default'), false)` | 자체 배경이 필요 — `pageBackground()` 쓰면 배경 없음 |

> ⚠️ **`pageBackground()` 주의**: 이 함수는 `background: 'transparent'`를 반환한다.
> App.jsx의 배경이 없는 상태에서 단독으로 쓰면 흰 화면 또는 검정 화면으로 보인다.
> Auth처럼 App.jsx 바깥에서 단독 렌더되는 화면에는 반드시 `appBackground()`를 사용할 것.

## glass 함수 상세
```js
// 라이트 — 흰색 반투명
glass(0.60, 24) → {
  background: rgba(255,255,255,0.60),
  backdropFilter: blur(24px) saturate(180%) brightness(1.04),
  border: 1px solid rgba(255,255,255,0.75),
  boxShadow: inset 하이라이트 포함
}

// 다크 — 네이비 계열
glassDark(0.15, 28) → {
  background: rgba(40,55,140, 계산값),
  backdropFilter: blur(28px) saturate(180%) brightness(1.15),
  border: 1px solid rgba(140,160,255,0.28),
  boxShadow: inset 상단 하이라이트 + 하단 굴절
}
```

## glass() 라이트 모드 권장 opacity

| 용도 | 권장값 | 예시 |
|---|---|---|
| 메인 카드, 큰 패널 | `glass(0.62, 24)` | MainScreen 입력창 카드 |
| 탭 wrapper, 작은 패널 | `glass(0.55, 20)` | Auth 탭 토글 |
| 입력창, 버튼 | `glass(0.65, 20)` | Auth 입력창, 구글 버튼 |
| 사이드바 | `sidebarGlass()` | Sidebar 전용 함수 사용 |

> opacity가 너무 낮으면 (0.09 이하) 배경색이 비쳐서 어둡게 보임 — 라이트 모드에서 주의

## 색상 변수 컨벤션 (라이트 모드)

컴포넌트 함수 내에서 아래 패턴으로 통일해서 쓸 것:

```js
const theme = getTheme(emotion)          // 또는 getTheme('default')
const TC  = theme.text                   // 기본 텍스트: "#0a1830" 어두운 네이비
const SC  = 'rgba(20,40,90,0.50)'        // 서브 텍스트 (반투명)
const ACCENT = '#e53935'                 // 포인트 색상 (버튼, 활성 탭 등)
```

> ⚠️ `color: '#fff'` / `rgba(255,255,255,0.x)` 계열은 **다크 배경 전용**
> 라이트 화면에서 쓰면 텍스트가 배경에 묻혀 안 보임

## GLOBAL_CSS 주요 클래스
```css
.gbtn-light:hover  → 라이트 버튼 hover (흰색 배경)
.gbtn-dark:hover   → 다크 버튼 hover (네이비 배경 + inset glow)
.trow-light:hover  → 라이트 목록 행 hover
.trow-dark:hover   → 다크 목록 행 hover
```

## 애니메이션
```css
@keyframes fadeInUp   /* 아래서 위로 fade */
@keyframes slideUp    /* 위로 슬라이드 */
@keyframes noticeIn   /* 공지 배너 전환 */
```

*업데이트: 2026-05-13*