# Portfolio Backend Notes

## 핵심 발표 포인트

이 프로젝트는 처음에 프론트엔드 중심 React 앱이었고, YouTube/Gemini 같은 외부 API를 브라우저에서 직접 호출할 위험이 있었다.

백엔드를 추가하면서 다음 문제를 해결했다.

| 문제 | 해결 |
|---|---|
| 브라우저에 외부 API key 노출 위험 | Spring Boot 백엔드 프록시로 이동 |
| YouTube/Gemini 호출 실패 시 화면 붕괴 | 공통 에러 응답 + 프론트 사용자 안내 |
| 반복 검색으로 quota 낭비 | Caffeine cache + localStorage videoId cache |
| 직접 외부 API 호출 분산 | `src/lib/api.js` 단일 API client |
| 운영 배포 용량 증가 | Docker 없이 단일 JAR 배포 |
| API 문서 부족 | Swagger/OpenAPI + `docs/API_SPEC.md` |
| 운영 확인 부족 | health endpoint + 배포 검증 스크립트 |

## 백엔드 구조

```text
Controller
  -> Service
  -> external client
  -> mapper/cache/error handling
```

주요 패키지:

| Package | Role |
|---|---|
| `chart` | YouTube 인기 음악 차트 |
| `search` | YouTube 검색, videoId 조회 |
| `emotion` | Gemini 감정 분석 |
| `recommendation` | 감정 기반 추천 |
| `mix` | 맞춤 믹스 |
| `taste` | 취향 기반 추천 |
| `external.youtube` | YouTube API client/mapper |
| `external.gemini` | Gemini API client/prompt parsing |
| `common` | error/cache/common DTO |
| `rate_limit` | IP 기반 rate limit |

## 운영 URL

```text
https://juyoung-basechain.duckdns.org/music-curation/
```

Health:

```text
https://juyoung-basechain.duckdns.org/music-curation/api/health
```

Swagger:

```text
https://juyoung-basechain.duckdns.org/music-curation/swagger-ui/index.html
```

## 면접에서 말할 수 있는 문장

> 팀원이 만든 React 음악 추천 프론트에 Spring Boot 백엔드를 붙였습니다. 외부 API 키를 프론트에서 제거하고, YouTube/Gemini 호출을 백엔드 프록시로 이동했습니다. 또한 공통 에러 응답, rate limit, cache, Swagger 문서, Oracle VM 배포까지 구성했습니다.

> 운영 배포에서는 Docker 이미지를 올리지 않고 Vite 빌드 결과를 Spring Boot static resource로 포함해 단일 JAR로 배포했습니다. 서버에는 약 27MB JAR만 올라가므로 작은 Oracle VM에서도 부담이 적습니다.

## 남은 개선 포인트

- Firebase ID token을 백엔드에서 검증해 AI 추천 API를 로그인 사용자만 호출하게 하기
- 추천 이벤트와 API 요청 로그를 별도 DB에 저장하기
- 실제 운영 API key 입력 후 통합 테스트 결과를 README에 추가하기
