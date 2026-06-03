# 16. API 한도 & 에러 대응

## Gemini API 한도 (무료 티어)

| 모델 | RPM | RPD |
|---|---|---|
| gemini-2.5-flash | 5 | 20 |
| gemini-2.5-flash-lite | 10 | 넉넉함 |

- **RPM 초과** → 429 에러. 1~2분 기다리면 해제
- **RPD 초과** → UTC 자정(한국 오전 9시)에 초기화
- **503 에러** → 서버 과부하, 잠시 후 재시도

### 에러 처리 (Recommendations.jsx)
```js
if (err.message?.includes('429'))
  setError('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요 (429)')
else
  setError('음악 추천을 불러오는 데 실패했습니다 😢')
```

## YouTube Data API v3 한도

| 단위 | 한도 |
|---|---|
| 일일 쿼터 | 10,000 units |
| 검색 1회 | 100 units |

- 차트 로딩: 100 units (1회)
- 노래 재생 검색: 100 units/곡 (videoId 있으면 스킵)
- **videoId 직접 사용으로 쿼터 절약 중**

## Firebase 한도 (무료 Spark 플랜)

| 항목 | 한도 |
|---|---|
| Firestore 읽기 | 50,000/일 |
| Firestore 쓰기 | 20,000/일 |
| Auth | 제한 없음 (사실상) |

## Claude API (교체 후)
- 무료 tier 없음, 크레딧 차감 방식
- `claude-sonnet-4-6` — 입력 $3/MTok, 출력 $15/MTok
- 감정 분석 1회 ≈ 약 200 tokens → 매우 저렴

## 에러 코드 요약

| 코드 | 의미 | 대응 |
|---|---|---|
| 429 | API 한도 초과 | 잠시 대기 후 재시도 |
| 503 | 서버 과부하 | 재시도 |
| 404 | 모델/엔드포인트 오류 | 모델명/버전 확인 |
| 403 | 인증 실패 | API 키 확인 |
