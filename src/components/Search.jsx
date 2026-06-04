import { useState, useEffect, useRef } from 'react'
import { glass, glassDark, getTheme, getDarkTheme, GLOBAL_CSS } from '../styles/theme'
import { api, apiErrorMessage } from '../lib/api'

const SEARCH_TABS = [
  { key: 'all',     label: '전체',    icon: '🔍' },
  { key: 'song',    label: '노래',    icon: '🎵' },
  { key: 'artist',  label: '아티스트', icon: '🎤' },
  { key: 'mood',    label: '분위기',  icon: '💫' },
]

const MOOD_TAGS = [
  { label: '신나는',  query: 'kpop upbeat dance 2024' },
  { label: '잔잔한',  query: 'korean ballad calm acoustic' },
  { label: '설레는',  query: 'kpop romantic love song' },
  { label: '슬픈',    query: 'korean sad ballad emotional' },
  { label: '힘나는',  query: 'kpop powerful energetic' },
  { label: '집중되는', query: 'korean lofi study music' },
  { label: '새벽감성', query: 'korean late night chill' },
  { label: '드라이브', query: 'kpop drive playlist' },
]

const RECENT_LIMIT = 8

export default function Search({ isDark = false, emotion = 'default', onBack, onPlaySong, likedSongs = [], onToggleLike }) {
  const [activeTab, setActiveTab]         = useState('all')
  const [query, setQuery]                 = useState('')
  const [results, setResults]             = useState([])
  const [loading, setLoading]             = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mc_recent_searches') || '[]') } catch { return [] }
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hasSearched, setHasSearched]     = useState(false)
  const [error, setError]                 = useState('')
  const inputRef = useRef(null)

  const theme = isDark ? getDarkTheme(emotion) : getTheme(emotion)
  const G     = isDark ? glassDark : glass
  const tc    = isDark ? '#c0c8f0' : '#1a2a4a'
  const sc    = isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.50)'
  const trow  = isDark ? 'trow trow-dark' : 'trow trow-light'
  const gbtn  = isDark ? 'gbtn gbtn-dark' : 'gbtn gbtn-light'

  const saveRecent = (q) => {
    const updated = [q, ...recentSearches.filter(r => r !== q)].slice(0, RECENT_LIMIT)
    setRecentSearches(updated)
    try { localStorage.setItem('mc_recent_searches', JSON.stringify(updated)) } catch {}
  }

  const removeRecent = (q) => {
    const updated = recentSearches.filter(r => r !== q)
    setRecentSearches(updated)
    try { localStorage.setItem('mc_recent_searches', JSON.stringify(updated)) } catch {}
  }

  const clearRecent = () => {
    setRecentSearches([])
    try { localStorage.removeItem('mc_recent_searches') } catch {}
  }

  const buildQuery = (q, tab) => {
    switch (tab) {
      case 'artist': return `${q} official audio playlist`
      case 'mood':   return q  // mood 탭은 미리 조합된 쿼리 사용
      default:       return `${q} kpop korean`
    }
  }

  const handleSearch = async (customQuery = null, customTab = null) => {
    const q   = customQuery ?? query
    const tab = customTab   ?? activeTab
    if (!q.trim()) return
    setLoading(true)
    setResults([])
    setError('')
    setHasSearched(true)
    setShowSuggestions(false)
    if (!customQuery) saveRecent(q.trim())

    try {
      const finalQuery  = buildQuery(q.trim(), tab)
      const data = await api.search(finalQuery, 15)
      setResults(data.songs || [])
    } catch (e) {
      console.error('검색 실패:', e)
      setResults([])
      setError(apiErrorMessage(e, '검색에 실패했어요.'))
    } finally {
      setLoading(false)
    }
  }

  const handleMoodClick = (mood) => {
    setQuery(mood.label)
    handleSearch(mood.query, 'mood')
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <style>{`
        .search-input::placeholder { color: ${sc}; }
        .search-input:focus { outline: none; }
      `}</style>
      <div style={{
        minHeight: '100vh', background: 'transparent',
        fontFamily: "'Noto Sans KR',-apple-system,sans-serif",
        color: tc,
      }}>
        <div style={{ position: 'relative', zIndex: 1, padding: '24px 28px 100px' }}>

          {/* 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <button onClick={onBack} style={{
              background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(100,120,200,0.25)'}`,
              borderRadius: 12, padding: '8px 16px', color: sc, cursor: 'pointer', fontSize: 13,
            }}>← 돌아가기</button>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: tc, margin: 0 }}>🔍 통합 검색</h2>
              <p style={{ fontSize: 13, color: sc, margin: '4px 0 0' }}>
                노래, 아티스트, 분위기로 검색해보세요
              </p>
            </div>
          </div>

          {/* 탭 */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {SEARCH_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: activeTab === tab.key
                    ? `linear-gradient(135deg,${theme.from},${theme.to})`
                    : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)'),
                  color: activeTab === tab.key ? '#fff' : sc,
                  fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 400,
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: activeTab === tab.key ? `0 4px 12px ${theme.to}33` : 'none',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 검색창 */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{
              ...G(0.62), borderRadius: 20, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              border: showSuggestions
                ? `2px solid ${isDark ? 'rgba(140,160,255,0.50)' : 'rgba(100,120,200,0.40)'}`
                : undefined,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🔍</span>
              <input
                ref={inputRef}
                className="search-input"
                value={query}
                onChange={e => { setQuery(e.target.value); setShowSuggestions(true) }}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); if (e.key === 'Escape') setShowSuggestions(false) }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder={
                  activeTab === 'artist' ? '아티스트 이름 (예: IU, BTS...)' :
                  activeTab === 'mood'   ? '분위기 태그 클릭 또는 직접 입력...' :
                  '노래 제목, 아티스트, 가사 일부...'
                }
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  color: tc, fontSize: 15, fontFamily: 'inherit',
                }}
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setResults([]); setHasSearched(false); inputRef.current?.focus() }}
                  style={{ background: 'none', border: 'none', color: sc, cursor: 'pointer', fontSize: 18, padding: '0 4px', lineHeight: 1 }}
                >✕</button>
              )}
              <button
                onClick={() => handleSearch()}
                disabled={!query.trim() || loading}
                style={{
                  padding: '10px 22px', borderRadius: 12, border: 'none',
                  background: query.trim() ? `linear-gradient(135deg,${theme.from},${theme.to})` : 'rgba(100,120,200,0.15)',
                  color: query.trim() ? '#fff' : sc,
                  fontSize: 13, fontWeight: 700, cursor: query.trim() ? 'pointer' : 'not-allowed',
                  whiteSpace: 'nowrap', transition: 'all 0.2s',
                  boxShadow: query.trim() ? `0 4px 12px ${theme.to}33` : 'none',
                }}
              >{loading ? '...' : '검색'}</button>
            </div>

            {/* 자동완성 / 최근 검색어 드롭다운 */}
            {showSuggestions && recentSearches.length > 0 && !query && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                marginTop: 6, borderRadius: 16, padding: '10px',
                ...G(0.90),
                boxShadow: isDark ? '0 8px 30px rgba(0,0,20,0.5)' : '0 8px 30px rgba(100,120,200,0.20)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 10px' }}>
                  <span style={{ fontSize: 11, color: sc, letterSpacing: '1px', textTransform: 'uppercase' }}>최근 검색</span>
                  <button onClick={clearRecent} style={{ background: 'none', border: 'none', color: sc, cursor: 'pointer', fontSize: 11 }}>전체 삭제</button>
                </div>
                {recentSearches.map((r, i) => (
                  <div
                    key={i}
                    className={trow}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, cursor: 'pointer' }}
                    onClick={() => { setQuery(r); handleSearch(r) }}
                  >
                    <span style={{ fontSize: 14, opacity: 0.5 }}>🕐</span>
                    <span style={{ flex: 1, fontSize: 13, color: tc }}>{r}</span>
                    <button
                      onClick={e => { e.stopPropagation(); removeRecent(r) }}
                      style={{ background: 'none', border: 'none', color: sc, cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 분위기 태그 (분위기 탭이거나 처음 화면일 때) */}
          {(activeTab === 'mood' || !hasSearched) && (
            <div style={{ ...G(0.62), borderRadius: 20, padding: '18px 20px', marginBottom: 16, animation: 'fadeInUp 0.4s both' }}>
              <p style={{ fontSize: 12, color: sc, marginBottom: 12, letterSpacing: '1px', textTransform: 'uppercase' }}>
                💫 분위기로 찾기
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {MOOD_TAGS.map(m => (
                  <button
                    key={m.label}
                    onClick={() => handleMoodClick(m)}
                    style={{
                      padding: '9px 18px', borderRadius: 20,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(100,120,200,0.20)'}`,
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.60)',
                      color: sc, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = isDark ? 'rgba(140,160,255,0.15)' : `${theme.to}15`
                      e.currentTarget.style.borderColor = isDark ? 'rgba(140,160,255,0.40)' : theme.to
                      e.currentTarget.style.color = isDark ? '#c0c8f0' : theme.to
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.60)'
                      e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(100,120,200,0.20)'
                      e.currentTarget.style.color = sc
                    }}
                  >{m.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* 검색 결과 */}
          {error && !loading && (
            <div style={{ ...G(0.62), borderRadius: 16, padding: '16px 18px', marginBottom: 16, color: tc, fontSize: 13 }}>
              {error}
            </div>
          )}
          {(loading || hasSearched) && (
            <div style={{ ...G(0.62), borderRadius: 22, padding: '22px 24px', animation: 'fadeInUp 0.4s both' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: tc, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {loading ? '검색 중...' : `검색 결과`}
                  {!loading && results.length > 0 && (
                    <span style={{ fontSize: 11, color: sc, fontWeight: 400 }}>{results.length}곡</span>
                  )}
                </p>
                {!loading && results.length > 0 && (
                  <button
                    onClick={() => onPlaySong?.(results[0], results)}
                    style={{
                      padding: '7px 16px', borderRadius: 10, border: 'none',
                      background: `linear-gradient(135deg,${theme.from},${theme.to})`,
                      color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    전체 재생
                  </button>
                )}
              </div>

              {/* 로딩 스켈레톤 */}
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', borderRadius: 10,
                      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(100,120,200,0.05)',
                    }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 13, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)', width: '60%', marginBottom: 6 }} />
                        <div style={{ height: 10, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(100,120,200,0.07)', width: '40%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 결과 없음 */}
              {!loading && results.length === 0 && (
                <div style={{ textAlign: 'center', padding: '36px 0', color: sc }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🎵</div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: tc, marginBottom: 6 }}>검색 결과가 없어요</p>
                  <p style={{ fontSize: 13 }}>다른 검색어나 분위기 태그를 사용해보세요</p>
                </div>
              )}

              {/* 결과 목록 */}
              {!loading && results.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {results.map((song, i) => {
                    const isLiked = likedSongs?.some(s => s.title === song.title && s.artist === song.artist)
                    return (
                      <div
                        key={i}
                        className={trow}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                          animation: `fadeInUp 0.35s ${i * 0.04}s both`,
                        }}
                        onClick={() => onPlaySong?.(song, results)}
                      >
                        {/* 순번 */}
                        <span style={{
                          fontSize: 11, fontWeight: 700, minWidth: 22, textAlign: 'center',
                          color: sc, fontFamily: "'Space Mono',monospace", flexShrink: 0,
                        }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>

                        {/* 커버 이미지 */}
                        {song.cover
                          ? <img src={song.cover} alt={song.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }} />
                          : <div style={{ width: 48, height: 48, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg,${theme.from}55,${theme.to}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎵</div>
                        }

                        {/* 정보 */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: tc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {song.title}
                          </p>
                          <p style={{ fontSize: 11, color: sc, marginTop: 3 }}>{song.artist}</p>
                        </div>

                        {/* 좋아요 */}
                        {onToggleLike && (
                          <button
                            onClick={e => { e.stopPropagation(); onToggleLike(song) }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '4px', lineHeight: 1, flexShrink: 0, transition: 'transform 0.2s', transform: isLiked ? 'scale(1.2)' : 'scale(1)' }}
                          >
                            {isLiked ? '❤️' : '🤍'}
                          </button>
                        )}

                        {/* 재생 버튼 */}
                        <button
                          onClick={e => { e.stopPropagation(); onPlaySong?.(song, results) }}
                          style={{
                            width: 32, height: 32, borderRadius: '50%', border: 'none',
                            background: 'rgba(255,0,51,0.75)', cursor: 'pointer', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,0,51,1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,0,51,0.75)'}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* 빈 상태 — 검색 전 */}
          {!hasSearched && !loading && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: sc, animation: 'fadeInUp 0.5s 0.1s both' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: tc, marginBottom: 8 }}>
                어떤 노래를 찾고 있나요?
              </p>
              <p style={{ fontSize: 13 }}>
                위 검색창에서 노래 제목, 아티스트, 분위기로 검색해보세요
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
