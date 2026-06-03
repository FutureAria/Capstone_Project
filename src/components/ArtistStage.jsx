import { useState } from 'react'
import { glass, glassDark, getTheme, getDarkTheme, GLOBAL_CSS } from '../styles/theme'
import { api, apiErrorMessage } from '../lib/api'

const QUICK_ARTISTS = [
  { name: 'IU',          icon: '🌙', color: '#6090d0' },
  { name: 'BTS',         icon: '💜', color: '#9060d0' },
  { name: 'aespa',       icon: '🤖', color: '#e06090' },
  { name: 'BLACKPINK',   icon: '🌹', color: '#ff4d8d' },
  { name: 'NewJeans',    icon: '🐰', color: '#4090e0' },
  { name: 'SEVENTEEN',   icon: '💎', color: '#30b070' },
  { name: 'AKMU',        icon: '🌱', color: '#30b070' },
  { name: 'Epik High',   icon: '🦋', color: '#e0a030' },
  { name: 'ROSÉ',        icon: '🌷', color: '#e06090' },
  { name: 'Heize',       icon: '🌊', color: '#4090c0' },
  { name: 'pH-1',        icon: '🎯', color: '#e0a030' },
  { name: '볼빨간사춘기', icon: '🍒', color: '#e05040' },
  { name: 'Zico',        icon: '🔥', color: '#e05040' },
  { name: 'MAMAMOO',     icon: '🌻', color: '#e0a030' },
  { name: '임창정',      icon: '🍺', color: '#a09080' },
]

export default function ArtistStage({ isDark = false, emotion = 'default', onBack, onPlaySong }) {
  const [query, setQuery]             = useState('')
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [songs, setSongs]             = useState([])
  const [loading, setLoading]         = useState(false)
  const [artistInfo, setArtistInfo]   = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const theme = isDark ? getDarkTheme(emotion) : getTheme(emotion)
  const G     = isDark ? glassDark : glass
  const tc    = isDark ? '#c0c8f0' : '#1a2a4a'
  const sc    = isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.50)'
  const trow  = isDark ? 'trow trow-dark' : 'trow trow-light'

  const fetchArtistSongs = async (artistName) => {
    setSelectedArtist(artistName)
    setLoading(true)
    setSongs([])
    setArtistInfo(null)
    setErrorMessage('')

    try {
      const data = await api.search(`${artistName} official audio kpop`, 12)
      const filtered = (data.songs || []).map(song => ({ ...song, artist: song.artist || artistName }))

      setSongs(filtered)
      setArtistInfo({ name: artistName, count: filtered.length })
    } catch (e) {
      console.error('아티스트 곡 로드 실패:', e)
      setSongs([])
      setErrorMessage(apiErrorMessage(e, '아티스트 곡을 불러오지 못했어요. 잠시 후 다시 시도해주세요.'))
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (!query.trim()) return
    fetchArtistSongs(query.trim())
    setQuery('')
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{
        minHeight: '100vh', background: 'transparent',
        fontFamily: "'Noto Sans KR',-apple-system,sans-serif",
        color: tc,
      }}>
        <div style={{ position: 'relative', zIndex: 1, padding: '24px 28px 100px' }}>

          {/* 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <button onClick={onBack} style={{
              background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(100,120,200,0.25)'}`,
              borderRadius: 12, padding: '8px 16px', color: sc, cursor: 'pointer', fontSize: 13,
            }}>← 돌아가기</button>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: tc, margin: 0 }}>🎤 아티스트 스테이지</h2>
              <p style={{ fontSize: 13, color: sc, margin: '4px 0 0' }}>
                좋아하는 아티스트의 곡만 모아서 들어보세요
              </p>
            </div>
          </div>

          {/* 검색창 */}
          <div style={{ ...G(0.62), borderRadius: 20, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 18 }}>🔍</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="아티스트 이름을 입력하세요 (예: IU, BTS, aespa...)"
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: tc, fontSize: 14, fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              style={{
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: query.trim() ? `linear-gradient(135deg,${theme.from},${theme.to})` : 'rgba(100,120,200,0.15)',
                color: query.trim() ? '#fff' : sc,
                fontSize: 13, fontWeight: 700, cursor: query.trim() ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}
            >검색</button>
          </div>

          {/* 빠른 선택 */}
          {!selectedArtist && (
            <div style={{ ...G(0.62), borderRadius: 20, padding: '20px 22px', marginBottom: 20, animation: 'fadeInUp 0.5s both' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: tc, marginBottom: 14 }}>⚡ 빠른 선택</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {QUICK_ARTISTS.map(a => (
                  <button
                    key={a.name}
                    onClick={() => fetchArtistSongs(a.name)}
                    style={{
                      padding: '9px 16px', borderRadius: 20,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(100,120,200,0.20)'}`,
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.60)',
                      color: sc, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = a.color
                      e.currentTarget.style.color = a.color
                      e.currentTarget.style.background = `${a.color}15`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(100,120,200,0.20)'
                      e.currentTarget.style.color = sc
                      e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.60)'
                    }}
                  >
                    <span>{a.icon}</span>
                    <span>{a.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 결과 */}
          {(selectedArtist || loading) && (
            <div style={{ ...G(0.62), borderRadius: 22, padding: '22px 24px', animation: 'fadeInUp 0.4s both' }}>
              {/* 아티스트 정보 헤더 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `linear-gradient(135deg,${theme.from},${theme.to})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                    boxShadow: `0 4px 14px ${theme.to}44`,
                  }}>
                    {QUICK_ARTISTS.find(a => a.name === selectedArtist)?.icon || '🎤'}
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: tc }}>{selectedArtist}</p>
                    {!loading && (
                      <p style={{ fontSize: 12, color: sc, marginTop: 2 }}>{songs.length}곡 로드됨</p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!loading && songs.length > 0 && (
                    <button
                      onClick={() => onPlaySong?.(songs[0], songs)}
                      style={{
                        padding: '9px 18px', borderRadius: 12, border: 'none',
                        background: `linear-gradient(135deg,${theme.from},${theme.to})`,
                        color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                        boxShadow: `0 4px 12px ${theme.to}33`,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                      전체 재생
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedArtist(null); setSongs([]); setArtistInfo(null); setErrorMessage('') }}
                    style={{
                      padding: '9px 14px', borderRadius: 12,
                      border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(100,120,200,0.25)',
                      background: 'transparent', color: sc, fontSize: 12, cursor: 'pointer',
                    }}
                  >✕ 닫기</button>
                </div>
              </div>

              {/* 로딩 스켈레톤 */}
              {loading && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 10,
                      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(100,120,200,0.05)',
                    }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 12, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)', width: '70%', marginBottom: 6 }} />
                        <div style={{ height: 10, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(100,120,200,0.07)', width: '45%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 곡 목록 2열 그리드 */}
              {!loading && errorMessage && (
                <div style={{
                  marginBottom: 14,
                  padding: '11px 13px',
                  borderRadius: 12,
                  background: isDark ? 'rgba(255,110,130,0.12)' : 'rgba(220,60,80,0.08)',
                  border: isDark ? '1px solid rgba(255,120,140,0.22)' : '1px solid rgba(220,60,80,0.16)',
                  color: isDark ? '#ffc8d2' : '#9b2334',
                  fontSize: 12,
                }}>
                  {errorMessage}
                </div>
              )}

              {/* 곡 목록 2열 그리드 */}
              {!loading && songs.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {songs.map((song, i) => (
                    <div
                      key={i}
                      className={trow}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                        animation: `fadeInUp 0.4s ${i * 0.04}s both`,
                      }}
                      onClick={() => onPlaySong?.(song, songs)}
                    >
                      {song.cover
                        ? <img src={song.cover} alt={song.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }} />
                        : <div style={{ width: 48, height: 48, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg,${theme.from}55,${theme.to}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎵</div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: tc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {song.title}
                        </p>
                        <p style={{ fontSize: 11, color: sc, marginTop: 2 }}>{song.artist}</p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); onPlaySong?.(song, songs) }}
                        style={{
                          width: 30, height: 30, borderRadius: '50%', border: 'none',
                          background: 'rgba(255,0,51,0.7)', cursor: 'pointer', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,0,51,1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,0,51,0.7)'}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!loading && songs.length === 0 && selectedArtist && !errorMessage && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: sc }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>😅</div>
                  <p style={{ fontSize: 14 }}>"{selectedArtist}" 곡을 찾지 못했어요.</p>
                  <p style={{ fontSize: 12, marginTop: 6, color: sc }}>다른 아티스트 이름으로 검색해보세요</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
