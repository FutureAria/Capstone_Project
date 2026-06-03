# 10. 감정 분석 API

## 현재: Gemini API (MainScreen.jsx)

### 엔드포인트
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=VITE_GEMINI_KEY
```

### 프롬프트
```
아래 텍스트의 감정을 분석해줘. JSON만 반환해줘. 마크다운 쓰지 마.
{"emotion": "기쁨/슬픔/분노/불안/평온/설렘/피로/집중 중 하나만"}
텍스트: "${inputText}"
```

### 응답 파싱
```js
const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
```

### 감정 검증
```js
const valid = ['기쁨','슬픔','분노','불안','평온','설렘','피로','집중']
const detectedEmotion = valid.includes(parsed.emotion) ? parsed.emotion : 'default'
```

## 목표: Claude API (교체 예정)

### 교체 방법 (MainScreen.jsx handleAnalyze)
```js
// 1. Claude 코드 주석 해제
const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_CLAUDE_KEY,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 100,
    messages: [{ role: 'user', content: `감정 분석...` }],
  }),
})
// 2. Gemini 코드 주석 처리
```

## 흐름
```
사용자 입력
  → setLoadingType('emotion')  → EmotionLoadingScreen 표시
  → Gemini API 호출
  → 감정 추출
  → setLoadingType('music')    → MusicLoadingScreen 표시 (2.2초)
  → setLoadingType(null)
  → onAnalyzeComplete(text, emotion) → App.jsx에서 'recommendations'로 전환
```
