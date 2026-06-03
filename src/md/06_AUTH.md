# 06. Auth.jsx — 로그인/회원가입

## 기능
- 이메일/비밀번호 로그인 & 회원가입
- Google OAuth (`signInWithPopup`)
- 비밀번호 재설정 이메일 발송
- 회원가입 시 Firestore `users/{uid}` 문서 생성

## 비밀번호 규칙
```
8자 이상 + 소문자 + 숫자 + 특수문자(!@#$%^&*) 필수
```

## 에러 코드 → 메시지
```
auth/user-not-found       → "존재하지 않는 계정이에요"
auth/wrong-password       → "비밀번호가 틀렸어요"
auth/email-already-in-use → "이미 사용중인 이메일이에요"
auth/invalid-credential   → "이메일 또는 비밀번호가 틀렸어요"
auth/weak-password        → "비밀번호는 6자 이상이어야 해요"
auth/invalid-email        → "이메일 형식이 올바르지 않아요"
```

## UI 구조
```
로고 (Sidebar.jsx와 동일)
탭 (로그인 / 회원가입)
폼 (이름 - 회원가입만, 이메일, 비밀번호)
에러 메시지
로그인/회원가입 버튼
구분선
Google 로그인 버튼
비밀번호 찾기 링크 (로그인 탭만)
```

## 테마 & 스타일 (2026-05-13 개선)

### 배경
```js
// ❌ 이전 — pageBackground()는 background:'transparent' → 배경 없음
pageBackground(theme)

// ✅ 현재 — 라이트 라벤더 그라데이션 직접 확보
appBackground(getTheme('default'), false)
// → linear-gradient(145deg, #e8f4ff, #ede8ff, #f0f8ff)
```

### 글래스 카드
```js
// ❌ 이전 — 불투명도 낮아서 어두운 느낌
glass(0.09)

// ✅ 현재 — 탭 wrapper
glass(0.55, 20)

// ✅ 현재 — 입력창 / 구글 버튼
glass(0.65, 20)
```

### 텍스트 색상
```js
// ❌ 이전 — 라이트 배경에 흰 텍스트 → 안 보임
color: '#fff'

// ✅ 현재
const TC = theme.text   // "#0a1830" 어두운 네이비
const SC = 'rgba(20,40,90,0.50)'  // 서브 텍스트
```

### 에러 메시지
```js
// ❌ 이전
color: '#ff8080'   // 라이트 배경에서 연해서 잘 안 보임

// ✅ 현재
color: '#c62828'   // 어두운 레드 → 라이트 배경에서 가독성 확보
```

## 로고 (Sidebar.jsx와 완전히 동일)

```jsx
// Sidebar.jsx 코드 직접 확인 후 동일 스펙 적용
<div style={{
  width: '32px', height: '32px', borderRadius: '10px',
  background: 'linear-gradient(135deg, #6a1a6a, #3a1060)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  boxShadow: '0 2px 8px rgba(106,26,106,0.4)',
  border: '1px solid rgba(255,255,255,0.15)',
  gap: '2px',
}}>
  {/* ‖▶ — 두 줄(rect×2) + 재생 삼각형(path) */}
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <rect x="6" y="5" width="3" height="14" rx="1"/>
    <rect x="11" y="5" width="3" height="14" rx="1"/>
    <path d="M16 5v14l6-7z"/>
  </svg>
</div>
<span style={{ fontSize: '14px', fontWeight: '600', color: TC, whiteSpace: 'nowrap' }}>
  Music Curation
</span>
```

### 이전 로고와의 차이
| 항목 | 이전 (잘못된 추측) | 현재 (Sidebar.jsx 원본) |
|---|---|---|
| 크기 | 36×36px | **32×32px** |
| 배경 | `#7c4dff → #5c35cc` | **`#6a1a6a → #3a1060`** (다크 퍼플) |
| 그림자 | `rgba(124,77,255,0.45)` | **`rgba(106,26,106,0.4)`** |
| 테두리 | 없음 | **`1px solid rgba(255,255,255,0.15)`** |
| SVG | ▶▶ 더블 삼각형 | **‖▶ (rect×2 + path)** |
| 텍스트 크기 | 22px | **14px** |
| 텍스트 굵기 | 700 | **600** |

## props
```js
Auth({ onLogin })
// onLogin(user) — 로그인/회원가입/Google 성공 시 호출
```

## 주의사항
- `isDark` prop 없음 — **항상 라이트 스타일 고정**
- 로고는 반드시 `Sidebar.jsx`와 동기화 유지
  → Sidebar 로고 변경 시 Auth 로고도 함께 수정할 것
- `appBackground` import 필요: `theme.js`에서 `appBackground`, `getTheme`, `getComplement` 사용

*업데이트: 2026-05-13*
