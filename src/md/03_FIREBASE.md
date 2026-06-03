# 03. Firebase

## 초기화 (`firebase.js`)
```js
const app  = initializeApp(firebaseConfig)  // .env에서 설정값 읽음
export const auth = getAuth(app)             // 인증
export const db   = getFirestore(app)        // Firestore DB
```

## Auth — 지원 로그인 방식

| 방식 | 함수 |
|---|---|
| 이메일/비밀번호 로그인 | `signInWithEmailAndPassword` |
| 이메일/비밀번호 회원가입 | `createUserWithEmailAndPassword` |
| Google OAuth | `signInWithPopup(auth, GoogleAuthProvider)` |
| 비밀번호 재설정 | `sendPasswordResetEmail` |
| 로그아웃 | `signOut` |

### 비밀번호 정규식 (회원가입)
```js
/^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])(.{8,})$/
// 8자 이상, 소문자 + 숫자 + 특수문자(!@#$%^&*) 필수
```

### 에러 코드 매핑
```js
'auth/user-not-found'       → "존재하지 않는 계정이에요"
'auth/wrong-password'       → "비밀번호가 틀렸어요"
'auth/email-already-in-use' → "이미 사용중인 이메일이에요"
'auth/invalid-credential'   → "이메일 또는 비밀번호가 틀렸어요"
```

## Firestore — 데이터 구조

### 컬렉션 경로
```
users/{uid}/history/{docId}
```

### 문서 필드
```js
{
  text:      string,   // freeText 앞 20자 (미리보기용)
  freeText:  string,   // 전체 입력 텍스트
  emotion:   string,   // 주요 감정 이름
  songs:     array,    // 추천 노래 목록
  emotions:  array,    // [{name, percent, color}]
  timestamp: serverTimestamp()
}
```

### 저장 시점
`Recommendations.jsx` → `onSongsLoaded` 콜백 → `App.jsx` `addDoc`

### 불러오기
1. 로그인 시 (`App.jsx` `useEffect`) — 전체 히스토리 fetch
2. `History.jsx` 진입 시 — 전체 히스토리 fetch
3. `Sidebar.jsx` — `historyList` prop으로 받아 최근 4개 표시
