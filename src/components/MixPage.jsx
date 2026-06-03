import { useState, useCallback } from 'react'
import { getTheme, getDarkTheme, glass, glassDark, GLOBAL_CSS } from '../styles/theme'
import { api, apiErrorMessage } from '../lib/api'

// ── Gemini로 테마별 믹스 생성 ────────────────────────────────
// 좋아요/앨범/히스토리(감정)를 종합해 믹스 4개를 자동 구성한다.
async function generateMixes({ likedSongs, albums, historyList }) {
  const data = await api.mixes({ likedSongs, albums, historyList })
  return data.mixes || []
}

export default function MixPage({
  likedSongs = [],
  albums = [],
  historyList = [],
  isDark = false,
  emotion = 'default',
  onBack,
  onPlaySong,
  onAddToQueue,
}) {
  const theme = isDark ? getDarkTheme(emotion) : getTheme(emotion)
  const G    = isDark ? glassDark : glass
  const tc   = isDark ? '#c0c8f0' : '#1a2a4a'
  const sc   = isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.50)'
  const trow = isDark ? 'trow trow-dark' : 'trow trow-light'

  const [mixes, setMixes]       = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [openMix, setOpenMix]   = useState(null)   // 펼친 믹스 인덱스
  const [generated, setGenerated] = useState(false)

  const handleGenerate = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await generateMixes({ likedSongs, albums, historyList })
      setMixes(result)
      setGenerated(true)
      setOpenMix(result.length > 0 ? 0 : null)
    } catch (err) {
      console.error('믹스 생성 실패:', err)
      setError(apiErrorMessage(err, '믹스를 만드는 데 실패했어요.'))
    } finally {
      setLoading(false)
    }
  }, [likedSongs, albums, historyList])

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight: '100vh', background: 'transparent', fontFamily: "'Noto Sans KR',-apple-system,sans-serif", color: tc }}>
        <div style={{ padding: '24px 28px 100px' }}>

          {/* 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <button onClick={onBack} style={{
              background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(100,120,200,0.25)'}`,
              borderRadius: 12, padding: '8px 16px', color: sc, cursor: 'pointer', fontSize: 13,
            }}>← 돌아가기</button>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: tc, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>🎚️ 맞춤 믹스</h2>
              <p style={{ fontSize: 13, color: sc, margin: '4px 0 0' }}>
                좋아요·앨범·감정을 분석해 만든 나만의 믹스
              </p>
            </div>
            {generated && !loading && (
              <button onClick={handleGenerate} style={{
                padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(100,120,200,0.10)',
                color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(30,50,100,0.7)', fontSize: 12, fontWeight: 600,
              }}>🔄 다시 만들기</button>
            )}
          </div>

          {/* 1) 생성 전 안내 카드 */}
          {!generated && !loading && !error && (
            <div style={{ ...G(0.62), borderRadius: 22, padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}>🎚️</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: tc, marginBottom: 8 }}>AI 맞춤 믹스 만들기</p>
              <p style={{ fontSize: 13, color: sc, marginBottom: 6, lineHeight: 1.6 }}>
                좋아요한 곡 {likedSongs.length}개 · 앨범 {albums.length}개 · 감정 기록 {historyList.length}개를<br />
                분석해서 테마별 믹스 4개를 만들어드려요.
              </p>
              {likedSongs.length === 0 && historyList.length === 0 && (
                <p style={{ fontSize: 12, color: sc, marginBottom: 18, opacity: 0.8 }}>
                  ⚠️ 아직 데이터가 적어서 인기곡 위주로 구성돼요.
                </p>
              )}
              <button onClick={handleGenerate} style={{
                marginTop: 14, padding: '12px 28px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#7C5CFF,#FF4D8D)', color: '#fff', fontSize: 14, fontWeight: 700,
                boxShadow: '0 4px 14px rgba(124,92,255,0.35)',
              }}>✨ 믹스 생성하기</button>
            </div>
          )}

          {/* 2) 로딩 */}
          {loading && (
            <div style={{ ...G(0.62), borderRadius: 22, padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 14, animation: 'spin 1.2s linear infinite' }}>🎚️</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: tc, marginBottom: 6 }}>AI가 믹스를 구성하는 중...</p>
              <p style={{ fontSize: 13, color: sc }}>취향을 분석하고 있어요</p>
              <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {/* 3) 에러 */}
          {error && !loading && (
            <div style={{ ...G(0.62), borderRadius: 22, padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>⏳</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: tc, marginBottom: 14 }}>{error}</p>
              <button onClick={handleGenerate} style={{
                padding: '10px 24px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'rgba(255,0,51,0.85)', color: '#fff', fontSize: 13, fontWeight: 700,
              }}>🔄 다시 시도</button>
            </div>
          )}

          {/* 4) 믹스 목록 */}
          {generated && !loading && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mixes.length === 0 ? (
                <div style={{ ...G(0.62), borderRadius: 22, padding: '40px 24px', textAlign: 'center' }}>
                  <p style={{ fontSize: 14, color: sc }}>믹스를 만들지 못했어요. 다시 시도해주세요.</p>
                </div>
              ) : mixes.map((mix, mi) => {
                const isOpen = openMix === mi
                const songs = mix.songs || []
                return (
                  <div key={mi} style={{ ...G(0.62), borderRadius: 22, overflow: 'hidden' }}>
                    {/* 믹스 헤더 */}
                    <div
                      onClick={() => setOpenMix(isOpen ? null : mi)}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', cursor: 'pointer' }}
                    >
                      <div style={{
                        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                        background: `linear-gradient(135deg,${theme.from}66,${theme.to}99)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                      }}>{mix.emoji || '🎵'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: tc, margin: 0 }}>{mix.title}</p>
                        <p style={{ fontSize: 12, color: sc, margin: '4px 0 0' }}>
                          {mix.description} · {songs.length}곡
                        </p>
                      </div>
                      {/* 전체 재생 */}
                      <button
                        onClick={e => { e.stopPropagation(); if (songs.length) onPlaySong?.(songs[0], songs) }}
                        style={{
                          padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0,
                          background: 'linear-gradient(135deg,#7C5CFF,#FF4D8D)', color: '#fff',
                          fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                          boxShadow: '0 2px 8px rgba(124,92,255,0.3)',
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                        재생
                      </button>
                      <span style={{ fontSize: 16, color: sc, flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>⌄</span>
                    </div>

                    {/* 곡 목록 (펼침) */}
                    {isOpen && (
                      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {songs.map((song, i) => (
                          <div key={i} className={trow}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, cursor: 'pointer' }}
                            onClick={() => onPlaySong?.(song, songs)}>
                            <span style={{ fontSize: 11, fontWeight: 700, minWidth: 22, textAlign: 'center', color: sc, fontFamily: "'Space Mono',monospace" }}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg,${theme.from}55,${theme.to}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎵</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: tc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{song.title}</p>
                              <p style={{ fontSize: 11, color: sc, margin: '3px 0 0' }}>{song.artist}</p>
                            </div>
                            {song.mood && (
                              <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 11, color: sc, flexShrink: 0, ...G(0.5) }}>{song.mood}</span>
                            )}
                            {onAddToQueue && (
                              <button onClick={e => { e.stopPropagation(); onAddToQueue(song) }}
                                title="다음에 재생"
                                style={{
                                  width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
                                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)',
                                  color: isDark ? 'rgba(180,190,255,0.55)' : 'rgba(20,40,90,0.45)',
                                }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h10v2H4zm0 4h10v2H4zm0 4h6v2H4zm12-2v6l5-3z"/></svg>
                              </button>
                            )}
                            <button onClick={e => { e.stopPropagation(); onPlaySong?.(song, songs) }}
                              style={{
                                width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)',
                                border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.9)',
                                color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(30,50,100,0.7)',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#7C5CFF,#FF4D8D)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.border = 'none' }}
                              onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)'; e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(30,50,100,0.7)'; e.currentTarget.style.border = isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.9)' }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
