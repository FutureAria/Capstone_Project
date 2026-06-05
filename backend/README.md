# Music Curation Backend

Spring Boot API proxy server for the Music Curation frontend.

## 역할

- YouTube Data API 키를 프론트에서 숨김
- Claude API 키와 프롬프트를 백엔드에서 관리
- 검색/차트/videoId/AI 응답 캐싱
- CORS, rate limit, 공통 에러 응답 제공

## 실행

```bash
cp .env.example .env
```

`.env`에 실제 키를 입력한다.

```text
YOUTUBE_API_KEY=...
ANTHROPIC_API_KEY=...
FRONTEND_ORIGIN=http://localhost:5173
SERVER_PORT=8080
```

서버 실행:

```bash
mvn spring-boot:run
```

8080 포트가 이미 사용 중이면:

```bash
SERVER_PORT=8081 mvn spring-boot:run
```

프론트도 8081을 바라보게 하려면 루트 `.env`에 아래 값을 둔다.

```text
VITE_BACKEND_PROXY_TARGET=http://localhost:8081
```

## 검증

```bash
mvn test
curl http://localhost:8080/api/health
```

## API 문서

상위 프로젝트의 `docs/API_SPEC.md` 참고.
