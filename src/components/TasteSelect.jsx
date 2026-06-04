import { useState, useEffect, useRef } from 'react'
import { glass, glassDark, getTheme, getDarkTheme, GLOBAL_CSS } from '../styles/theme'
import { api, apiErrorMessage } from '../lib/api'

const GENRES = [
  { key: 'kpop',    label: 'K-POP',    icon: '🎤', color: '#e06090' },
  { key: 'ballad',  label: '발라드',    icon: '🎵', color: '#6090d0' },
  { key: 'hiphop',  label: '힙합',      icon: '🎧', color: '#e0a030' },
  { key: 'rnb',     label: 'R&B',       icon: '🎶', color: '#9060d0' },
  { key: 'indie',   label: '인디',      icon: '🎸', color: '#30b070' },
  { key: 'dance',   label: '댄스',      icon: '💃', color: '#e05040' },
  { key: 'trot',    label: '트로트',    icon: '🪗', color: '#c07030' },
  { key: 'ost',     label: 'OST',       icon: '🎬', color: '#4090e0' },
  { key: 'lofi',    label: 'Lo-Fi',     icon: '☕', color: '#a09080' },
  { key: 'classic', label: '클래식',    icon: '🎻', color: '#8090a0' },
]

const ARTISTS = [
  { name: 'IU',         genre: 'ballad', icon: '🌙' },
  { name: 'BTS',        genre: 'kpop',   icon: '💜' },
  { name: 'NewJeans',   genre: 'kpop',   icon: '🐰' },
  { name: 'aespa',      genre: 'kpop',   icon: '🤖' },
  { name: 'BLACKPINK',  genre: 'kpop',   icon: '🌹' },
  { name: '비',         genre: 'dance',  icon: '🌧️' },
  { name: 'MAMAMOO',    genre: 'kpop',   icon: '🌻' },
  { name: 'Heize',      genre: 'rnb',    icon: '🌊' },
  { name: 'pH-1',       genre: 'hiphop', icon: '🎯' },
  { name: 'Epik High',  genre: 'hiphop', icon: '🦋' },
  { name: 'AKMU',       genre: 'indie',  icon: '🌱' },
  { name: '볼빨간사춘기', genre: 'indie',  icon: '🍒' },
  { name: 'ROSÉ',       genre: 'kpop',   icon: '🌷' },
  { name: 'SEVENTEEN',  genre: 'kpop',   icon: '💎' },
  { name: '임창정',     genre: 'ballad', icon: '🍺' },
  { name: '이선희',     genre: 'ballad', icon: '🌺' },
  { name: '거미',       genre: 'ballad', icon: '🕷️' },
  { name: 'Zico',       genre: 'hiphop', icon: '🔥' },
]

export default function TasteSelect({ isDark = false, emotion = 'default', onBack, onPlaySong, initialGenres = [], initialArtists = [], onSaveTaste }) {
  const [selectedGenres, setSelectedGenres] = useState(initialGenres)
  const [selectedArtists, setSelectedArtists] = useState(initialArtists)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [step, setStep] = useState('select') // 'select' | 'results'
  const [filterArtist, setFilterArtist] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const theme = isDark ? getDarkTheme(emotion) : getTheme(emotion)
  const G     = isDark ? glassDark : glass
  const tc    = isDark ? '#c0c8f0' : '#1a2a4a'
  const sc    = isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.50)'
  const trow  = isDark ? 'trow trow-dark' : 'trow trow-light'
  const gbtn  = isDark ? 'gbtn gbtn-dark' : 'gbtn gbtn-light'

  const toggleGenre = (key) => {
    setSelectedGenres(prev =>
      prev.includes(key) ? prev.filter(g => g !== key) : [...prev, key]
    )
  }

  const toggleArtist = (name) => {
    setSelectedArtists(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    )
  }

  // ── 취향 변경 시 Firestore 저장 (디바운스 + 첫 마운트 스킵) ──
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    const t = setTimeout(() => {
      onSaveTaste?.(selectedGenres, selectedArtists)
    }, 600)
    return () => clearTimeout(t)
  }, [onSaveTaste, selectedGenres, selectedArtists])

  const handleRecommend = async () => {
    if (selectedGenres.length === 0 && selectedArtists.length === 0) return
    setLoading(true)
    setStep('results')
    setResults([])
    setErrorMessage('')

    try {
      const data = await api.tasteRecommend({
        genres: selectedGenres.map(k => GENRES.find(g => g.key === k)?.label || k),
        artists: selectedArtists,
        limit: 10,
      })
      setResults(data.songs || [])
    } catch (e) {
      console.error('취향 추천 실패:', e)
      setResults([])
      setErrorMessage(apiErrorMessage(e, '취향 추천을 불러오지 못했어요. 잠시 후 다시 시도해주세요.'))
    } finally {
      setLoading(false)
    }
  }

  const filteredArtists = ARTISTS.filter(a =>
    a.name.toLowerCase().includes(filterArtist.toLowerCase())
  )

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{
        minHeight: '100vh', background: 'transparent',
        fontFamily: "'Noto Sans KR',-apple-system,sans-serif",
        color: tc, position: 'relative',
      }}>
        <div style={{ position: 'relative', zIndex: 1, padding: '24px 28px 100px' }}>

          {/* 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <button onClick={onBack} style={{
              background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(100,120,200,0.25)'}`,
              borderRadius: 12, padding: '8px 16px', color: sc, cursor: 'pointer', fontSize: 13,
            }}>← 돌아가기</button>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: tc, margin: 0 }}>🎨 취향 설정</h2>
              <p style={{ fontSize: 13, color: sc, margin: '4px 0 0' }}>
                좋아하는 장르와 아티스트를 선택하면 맞춤 곡을 추천해드려요
              </p>
            </div>
          </div>

          {step === 'select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeInUp 0.5s both' }}>

              {/* 장르 선택 */}
              <div style={{ ...G(0.62), borderRadius: 22, padding: '24px 26px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: tc, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🎵 장르 선택
                  <span style={{ fontSize: 11, color: sc, fontWeight: 400 }}>
                    {selectedGenres.length > 0 ? `${selectedGenres.length}개 선택됨` : '복수 선택 가능'}
                  </span>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {GENRES.map(g => {
                    const selected = selectedGenres.includes(g.key)
                    return (
                      <button
                        key={g.key}
                        onClick={() => toggleGenre(g.key)}
                        style={{
                          padding: '10px 18px', borderRadius: 20,
                          border: selected ? `2px solid ${g.color}` : `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(100,120,200,0.25)'}`,
                          background: selected
                            ? `${g.color}22`
                            : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(100,120,200,0.06)'),
                          color: selected ? g.color : sc,
                          fontSize: 13, fontWeight: selected ? 700 : 400,
                          cursor: 'pointer', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', gap: 6,
                          boxShadow: selected ? `0 4px 12px ${g.color}33` : 'none',
                        }}
                      >
                        <span>{g.icon}</span>
                        <span>{g.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 아티스트 선택 */}
              <div style={{ ...G(0.62), borderRadius: 22, padding: '24px 26px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: tc, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🎤 아티스트 선택
                  <span style={{ fontSize: 11, color: sc, fontWeight: 400 }}>
                    {selectedArtists.length > 0 ? `${selectedArtists.length}명 선택됨` : '복수 선택 가능'}
                  </span>
                </p>

                {/* 아티스트 검색 */}
                <input
                  value={filterArtist}
                  onChange={e => setFilterArtist(e.target.value)}
                  placeholder="아티스트 이름으로 검색..."
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 12, marginBottom: 14,
                    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.08)',
                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(100,120,200,0.20)',
                    color: tc, fontSize: 13, fontFamily: 'inherit', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {filteredArtists.map(a => {
                    const selected = selectedArtists.includes(a.name)
                    const genreColor = GENRES.find(g => g.key === a.genre)?.color || '#8090d8'
                    return (
                      <button
                        key={a.name}
                        onClick={() => toggleArtist(a.name)}
                        style={{
                          padding: '9px 16px', borderRadius: 20,
                          border: selected
                            ? `2px solid ${genreColor}`
                            : `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(100,120,200,0.20)'}`,
                          background: selected
                            ? `${genreColor}20`
                            : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)'),
                          color: selected ? genreColor : sc,
                          fontSize: 13, fontWeight: selected ? 600 : 400,
                          cursor: 'pointer', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', gap: 6,
                          boxShadow: selected ? `0 2px 8px ${genreColor}30` : 'none',
                        }}
                      >
                        <span style={{ fontSize: 14 }}>{a.icon}</span>
                        <span>{a.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 추천받기 버튼 */}
              <button
                onClick={handleRecommend}
                disabled={selectedGenres.length === 0 && selectedArtists.length === 0}
                style={{
                  padding: '16px 32px', borderRadius: 16, border: 'none', cursor: 'pointer',
                  background: (selectedGenres.length > 0 || selectedArtists.length > 0)
                    ? `linear-gradient(135deg,${theme.from},${theme.to})`
                    : 'rgba(100,120,200,0.15)',
                  color: (selectedGenres.length > 0 || selectedArtists.length > 0) ? '#fff' : sc,
                  fontSize: 15, fontWeight: 700,
                  opacity: (selectedGenres.length > 0 || selectedArtists.length > 0) ? 1 : 0.5,
                  boxShadow: (selectedGenres.length > 0 || selectedArtists.length > 0)
                    ? `0 6px 20px ${theme.to}44` : 'none',
                  transition: 'all 0.2s',
                }}
              >
                🎵 맞춤 추천받기 →
              </button>
            </div>
          )}

          {step === 'results' && (
            <div style={{ animation: 'fadeInUp 0.5s both' }}>
              {/* 선택 요약 + 다시하기 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedGenres.map(k => {
                    const g = GENRES.find(x => x.key === k)
                    return (
                      <span key={k} style={{
                        padding: '4px 12px', borderRadius: 12,
                        background: `${g.color}22`, color: g.color,
                        fontSize: 12, fontWeight: 600, border: `1px solid ${g.color}44`,
                      }}>{g.icon} {g.label}</span>
                    )
                  })}
                  {selectedArtists.map(name => (
                    <span key={name} style={{
                      padding: '4px 12px', borderRadius: 12,
                      background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(100,120,200,0.10)',
                      color: tc, fontSize: 12, border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(100,120,200,0.20)'}`,
                    }}>{name}</span>
                  ))}
                </div>
                <button
                  onClick={() => { setStep('select'); setResults([]); setErrorMessage('') }}
                  style={{
                    background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(100,120,200,0.25)'}`,
                    borderRadius: 10, padding: '7px 14px', color: sc, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
                  }}
                >↩ 다시 선택</button>
              </div>

              <div style={{ ...G(0.62), borderRadius: 22, padding: '22px 24px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: tc, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  ✨ 취향 기반 추천 결과
                  {!loading && results.length > 0 && (
                    <span style={{ fontSize: 11, color: sc, fontWeight: 400 }}>{results.length}곡</span>
                  )}
                </p>

                {loading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px', borderRadius: 12,
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(100,120,200,0.05)',
                        animation: `fadeInUp 0.4s ${i * 0.06}s both`,
                      }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 13, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)', width: '65%', marginBottom: 6 }} />
                          <div style={{ height: 10, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(100,120,200,0.07)', width: '40%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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

                {!loading && results.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: sc }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>😅</div>
                    <p style={{ fontSize: 14 }}>추천을 불러오지 못했어요. 다시 시도해 주세요.</p>
                    <button
                      onClick={() => { setStep('select'); setResults([]); setErrorMessage('') }}
                      style={{
                        marginTop: 16, padding: '10px 24px', borderRadius: 12, border: 'none',
                        background: `linear-gradient(135deg,${theme.from},${theme.to})`,
                        color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >다시 선택하기</button>
                  </div>
                )}

                {!loading && results.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {results.map((song, i) => (
                      <div
                        key={i}
                        className={trow}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                          animation: `fadeInUp 0.4s ${i * 0.05}s both`,
                        }}
                        onClick={() => onPlaySong?.(song)}
                      >
                        {/* 순번 */}
                        <div style={{
                          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: sc,
                          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(100,120,200,0.20)',
                        }}>
                          {String(i + 1).padStart(2, '0')}
                        </div>

                        {/* 음악 아이콘 */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                          background: `linear-gradient(135deg,${theme.from}55,${theme.to}88)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20,
                        }}>🎵</div>

                        {/* 정보 */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: tc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {song.title}
                          </p>
                          <p style={{ fontSize: 11, color: sc, marginTop: 3 }}>{song.artist}</p>
                        </div>

                        {/* 분위기 태그 */}
                        {song.mood && (
                          <span style={{
                            padding: '3px 10px', borderRadius: 10, fontSize: 10, fontWeight: 500,
                            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)',
                            color: sc, whiteSpace: 'nowrap', flexShrink: 0,
                          }}>{song.mood}</span>
                        )}

                        {/* 재생 버튼 */}
                        <button
                          onClick={e => { e.stopPropagation(); onPlaySong?.(song) }}
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
                    ))}

                    {/* 전체 재생 버튼 */}
                    <div style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(100,120,200,0.12)', paddingTop: 14, marginTop: 8, display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => results.length > 0 && onPlaySong?.(results[0], results)}
                        style={{
                          flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                          background: `linear-gradient(135deg,${theme.from},${theme.to})`,
                          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          boxShadow: `0 4px 16px ${theme.to}33`,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                        전체 재생
                      </button>
                      <button
                        onClick={() => { setStep('select'); setResults([]); setErrorMessage('') }}
                        style={{
                          padding: '12px 20px', borderRadius: 12,
                          border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(100,120,200,0.25)',
                          background: 'transparent', color: sc, fontSize: 13, cursor: 'pointer',
                        }}
                      >↩ 재선택</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
