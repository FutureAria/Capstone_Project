import { auth } from './firebase'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export function apiErrorMessage(error, fallback = '요청 처리에 실패했습니다.') {
  const code = error?.code
  const message = error?.message

  if (code === 'MISSING_API_KEY') {
    return '서버 API 키가 아직 설정되지 않았어요. 관리자에게 운영 환경변수 설정을 요청해주세요.'
  }
  if (code === 'YOUTUBE_QUOTA_EXCEEDED' || message?.includes('429')) {
    return '요청 한도가 잠시 초과됐어요. 조금 뒤에 다시 시도해주세요.'
  }
  if (code === 'YOUTUBE_API_ERROR') {
    return 'YouTube 검색 서버가 잠시 불안정해요. 잠시 후 다시 시도해주세요.'
  }
  if (code === 'GEMINI_API_ERROR' || code === 'AI_RESPONSE_PARSE_FAILED') {
    return 'AI 추천 서버가 잠시 응답하지 않아요. 다시 시도해주세요.'
  }
  if (code === 'RATE_LIMIT_EXCEEDED') {
    return '요청이 너무 많아요. 잠시 쉬었다가 다시 시도해주세요.'
  }
  if (code === 'UNAUTHORIZED') {
    return '로그인 인증이 만료됐어요. 다시 로그인한 뒤 시도해주세요.'
  }
  return message || fallback
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const currentUser = auth.currentUser
  if (currentUser && !headers.Authorization) {
    try {
      headers.Authorization = `Bearer ${await currentUser.getIdToken()}`
    } catch (_) {
      // 로그인 토큰 갱신 실패는 백엔드의 401 응답 안내로 처리한다.
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data?.error?.message || 'API 요청에 실패했습니다.'
    const error = new Error(message)
    error.code = data?.error?.code
    error.status = data?.error?.status || res.status
    throw error
  }
  return data
}

export const api = {
  chart: (maxResults = 10) => request(`/api/chart?regionCode=KR&maxResults=${maxResults}`),
  search: (query, maxResults = 20) => request(`/api/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}`),
  videoId: (query) => request(`/api/video-id?q=${encodeURIComponent(query)}`),
  emotion: (text) => request('/api/emotion', {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),
  recommend: ({ text, emotion, limit = 8 }) => request('/api/recommend', {
    method: 'POST',
    body: JSON.stringify({ text, emotion, limit }),
  }),
  mix: ({ likedSongs, albumSongs, recentEmotions, limit = 10 }) => request('/api/mix', {
    method: 'POST',
    body: JSON.stringify({ likedSongs, albumSongs, recentEmotions, limit }),
  }),
  mixes: ({ likedSongs, albums, historyList }) => request('/api/mixes', {
    method: 'POST',
    body: JSON.stringify({ likedSongs, albums, historyList }),
  }),
  tasteRecommend: ({ genres, artists, limit = 10 }) => request('/api/taste/recommend', {
    method: 'POST',
    body: JSON.stringify({ genres, artists, limit }),
  }),
  similarSong: (song) => request('/api/similar-song', {
    method: 'POST',
    body: JSON.stringify(song),
  }),
}
