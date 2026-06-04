#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://juyoung-basechain.duckdns.org/music-curation}"
request() {
  local name="$1"
  shift
  local tmp
  tmp="$(mktemp)"
  local status
  status="$(curl -sS -o "$tmp" -w "%{http_code}" "$@" || true)"
  printf '%-18s %s\n' "$name" "$status"
  if [[ "$status" -ge 400 || "$status" == "000" ]]; then
    sed -n '1,12p' "$tmp"
    rm -f "$tmp"
    return 1
  fi
  rm -f "$tmp"
}

api_request() {
  local name="$1"
  shift
  if [[ -n "${FIREBASE_ID_TOKEN:-}" ]]; then
    request "$name" -H "Authorization: Bearer ${FIREBASE_ID_TOKEN}" "$@"
  else
    request "$name" "$@"
  fi
}

request "health" "$BASE_URL/api/health"
api_request "chart" "$BASE_URL/api/chart?regionCode=KR&maxResults=3"
api_request "search" "$BASE_URL/api/search?q=%EC%95%84%EC%9D%B4%EC%9C%A0%20%EB%B0%A4%ED%8E%B8%EC%A7%80&maxResults=3"
api_request "video-id" "$BASE_URL/api/video-id?q=%EC%95%84%EC%9D%B4%EC%9C%A0%20%EB%B0%A4%ED%8E%B8%EC%A7%80"
api_request "emotion" -H 'Content-Type: application/json' -d '{"text":"오늘 발표가 잘 끝나서 너무 기뻐"}' "$BASE_URL/api/emotion"
api_request "recommend" -H 'Content-Type: application/json' -d '{"text":"오늘 발표가 잘 끝나서 너무 기뻐","emotion":"기쁨","limit":3}' "$BASE_URL/api/recommend"
api_request "mixes" -H 'Content-Type: application/json' -d '{"likedSongs":[],"albums":[],"historyList":[]}' "$BASE_URL/api/mixes"
