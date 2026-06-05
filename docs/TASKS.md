# Tasks

## P0

- [ ] 실제 로컬/운영 환경에 API key 설정
  - `YOUTUBE_API_KEY`
  - `ANTHROPIC_API_KEY`
  - 운영 위치: `/etc/music-curation/music-curation.env`
- [x] Oracle 서버 배포
  - URL: `https://juyoung-basechain.duckdns.org/music-curation/`
  - Health: `https://juyoung-basechain.duckdns.org/music-curation/api/health`
- [x] 용량 작은 배포 구조 적용
  - Docker 미사용
  - `node_modules` 서버 업로드 없음
  - 단일 Spring Boot JAR 약 `31M`
- [x] 8080 포트 충돌 회피
  - 운영은 `8090` + `/music-curation` context path 사용
- [ ] 실제 API 키로 아래 API curl 검증
  - `GET /api/chart`
  - `GET /api/search?q=아이유%20밤편지`
  - `GET /api/video-id?q=아이유%20밤편지`
  - `POST /api/emotion`
  - `POST /api/recommend`
  - `POST /api/mixes`
- [ ] Firebase 로그인 후 프론트 전체 플로우 수동 확인
  - 로그인 화면 렌더 확인 완료
  - 빈 로그인/회원가입/비밀번호 재설정 validation 확인 완료
  - Google 로그인은 현재 실패 안내 표시됨
  - 2026-06-03 운영 브라우저 재검증에서도 Google 로그인 실패 안내 표시됨
  - 실제 로그인 이후 추천/재생 플로우는 계정 로그인 성공 후 재검증 필요
- [ ] Firebase Authentication authorized domains에 `juyoung-basechain.duckdns.org` 추가 필요 여부 확인
  - 실제 브라우저 클릭에서 Google 로그인 실패 확인
  - Firebase Console 또는 실제 Chrome 로그인 세션에서 재확인 필요
- [x] Oracle 서버 Firebase backend auth 기본 환경변수 설정
  - `FIREBASE_PROJECT_ID=music-curation-capston`
  - `FIREBASE_AUTH_ENABLED=false`
  - 로그인 성공 전에는 백엔드 auth 강제 활성화 보류
- [x] API 키 누락 시 사용자 안내 메시지 보강
- [x] 공개 운영 페이지 HTML 응답 확인
- [x] 프론트-백엔드 연결 전수 검색
  - 런타임 외부 AI/YouTube Data API 직접 호출 제거 확인
  - 남은 외부 호출: Firebase 공개 SDK 설정, Google Font, YouTube iframe/player
- [x] 백엔드 API 실패 시 프론트 사용자 안내 보강
  - 재생 videoId 조회 실패
  - 비슷한 곡 자동 추천 실패
  - 아티스트 검색 실패
  - 취향 추천 실패

## P1

- [x] YouTube 검색 필터 정교화
- [x] Controller/Service 단위 테스트 추가 확대
- [x] 실제 API 키 없는 상태의 fallback 테스트 추가
- [x] 실제 API 키로 통합 테스트 시나리오 문서화
- [x] README에 배포 URL, 백엔드 구조, 보안 처리 강조
- [x] API 명세 보강
- [x] 발표용 핵심 포인트 문서화
- [x] Claude/YouTube 실패 시 사용자 안내 메시지 보강
- [x] Google 로그인 실패 시 Firebase 설정 확인 안내 보강
- [ ] Firebase SDK 청크 추가 최적화 검토
  - 현재 운영 빌드 전체 dist 약 `944K`
  - Firebase 청크 gzip 약 `128.8K`
  - Vite 원본 크기 warning은 있으나 gzip 전송량 기준으로는 허용 가능

## P2

- [x] Firebase ID Token 백엔드 검증 추가
  - 기본값 `FIREBASE_AUTH_ENABLED=false`
  - 운영에서 켜면 `/api/**` 요청에 Firebase ID Token 필요
  - `GET /api/health`, `GET /api/ops/summary`는 public
- [ ] Redis 캐시 전환
- [x] 추천 기록/검색 통계 DB 저장
- [x] 배포 환경 분리
- [x] Swagger/OpenAPI 문서 추가
- [x] 운영 로그 설정
- [x] Rate limit 정책 문서화
- [x] GitHub Actions에서 Oracle 수동 배포 workflow 추가
- [ ] GitHub Secrets에 Oracle 배포 secret 등록
- [x] Oracle env secret presence check script 추가
