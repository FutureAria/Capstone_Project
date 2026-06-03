# 01. 프로젝트 개요

## 한 줄 설명
텍스트로 감정을 입력하면 AI가 분석하고 어울리는 음악을 추천해주는 웹앱 (캡스톤 디자인)

## 핵심 플로우
```
텍스트 입력 → Gemini 감정 분석 → 감정별 테마 전환 → Gemini 노래 추천 → YouTube 재생 → Firebase 히스토리 저장
```

## 기술 스택

| 분류 | 기술 | 비고 |
|---|---|---|
| 프론트엔드 | React 18 + Vite | |
| 인증 | Firebase Auth | 이메일/Google OAuth |
| DB | Firebase Firestore | 히스토리 저장 |
| AI (현재) | Gemini `gemini-2.5-flash-lite` | `v1beta` 엔드포인트 |
| AI (목표) | Claude `claude-sonnet-4-6` | 크레딧 충전 후 교체 |
| 차트 | YouTube Data API v3 | K-pop 인기곡 |
| 재생 | YouTube IFrame Player API | 숨겨진 iframe |
| 폰트 | Noto Sans KR | Google Fonts |

## `.env` 예시

현재 런타임 구조에서는 Gemini/YouTube API key를 프론트 Vite 환경변수로 노출하지 않는다.
Gemini/YouTube key는 백엔드 환경변수로만 관리하고, 프론트는 Firebase 공개 Web config와 백엔드 API URL만 사용한다.

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=music-curation-capston.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=music-curation-capston
VITE_FIREBASE_STORAGE_BUCKET=music-curation-capston.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=281919076126
VITE_FIREBASE_APP_ID=...
VITE_API_BASE_URL=/music-curation
```
