import { getTheme, getDarkTheme, glass, glassDark, GLOBAL_CSS } from '../styles/theme'

export default function LikedPage({ likedSongs = [], isDark = false, emotion = 'default', onBack, onPlaySong, onToggleLike, onAddToQueue }) {
  const theme = isDark ? getDarkTheme(emotion) : getTheme(emotion)
  const G    = isDark ? glassDark : glass
  const tc   = isDark ? '#c0c8f0' : '#1a2a4a'
  const sc   = isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.50)'
  const trow = isDark ? 'trow trow-dark' : 'trow trow-light'

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
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: tc, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>❤️ 좋아요한 곡</h2>
              <p style={{ fontSize: 13, color: sc, margin: '4px 0 0' }}>{likedSongs.length}곡</p>
            </div>
          </div>

          {likedSongs.length === 0 ? (
            <div style={{ ...G(0.62), borderRadius: 22, padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🤍</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: tc, marginBottom: 6 }}>아직 좋아요한 곡이 없어요</p>
              <p style={{ fontSize: 13, color: sc }}>마음에 드는 곡의 하트를 눌러보세요</p>
            </div>
          ) : (
            <div style={{ ...G(0.62), borderRadius: 22, padding: '22px 24px' }}>
              {/* 전체 재생 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
                <button
                  onClick={() => onPlaySong?.(likedSongs[0], likedSongs)}
                  style={{
                    padding: '8px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg,#7C5CFF,#FF4D8D)', color: '#fff',
                    fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 2px 8px rgba(124,92,255,0.3)',
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                  전체 재생
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {likedSongs.map((song, i) => (
                  <div key={i} className={trow}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, cursor: 'pointer' }}
                    onClick={() => onPlaySong?.(song, likedSongs)}>
                    <span style={{ fontSize: 11, fontWeight: 700, minWidth: 22, textAlign: 'center', color: sc, fontFamily: "'Space Mono',monospace" }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg,${theme.from}55,${theme.to}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎵</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: tc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</p>
                      <p style={{ fontSize: 11, color: sc, marginTop: 3 }}>{song.artist}</p>
                    </div>
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
                    {onToggleLike && (
                      <button onClick={e => { e.stopPropagation(); onToggleLike(song) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '4px', flexShrink: 0 }}>
                        ❤️
                      </button>
                    )}
                    <button onClick={e => { e.stopPropagation(); onPlaySong?.(song, likedSongs) }}
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
            </div>
          )}
        </div>
      </div>
    </>
  )
}