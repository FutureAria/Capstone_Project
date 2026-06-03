import { useState } from 'react'
import { getTheme, getDarkTheme, glass, glassDark, GLOBAL_CSS } from '../styles/theme'

export default function AlbumPage({ albums = [], isDark = false, emotion = 'default', onBack, onPlaySong, onCreateAlbum, onDeleteAlbum, onRemoveFromAlbum }) {
  const theme = isDark ? getDarkTheme(emotion) : getTheme(emotion)
  const G    = isDark ? glassDark : glass
  const tc   = isDark ? '#c0c8f0' : '#1a2a4a'
  const sc   = isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.50)'
  const trow = isDark ? 'trow trow-dark' : 'trow trow-light'
  const [openIdx, setOpenIdx] = useState(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const handleCreate = () => {
    if (!name.trim()) return
    onCreateAlbum?.(name.trim())
    setName(''); setCreating(false)
  }

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
              <h2 style={{ fontSize: 22, fontWeight: 700, color: tc, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>🎵 내 앨범</h2>
              <p style={{ fontSize: 13, color: sc, margin: '4px 0 0' }}>{albums.length}개 앨범</p>
            </div>
            <button onClick={() => setCreating(c => !c)} style={{
              padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#7C5CFF,#FF4D8D)', color: '#fff', fontSize: 12, fontWeight: 700,
              boxShadow: '0 2px 8px rgba(124,92,255,0.3)',
            }}>+ 새 앨범</button>
          </div>

          {/* 새 앨범 입력 */}
          {creating && (
            <div style={{ ...G(0.62), borderRadius: 16, padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', animation: 'fadeInUp 0.25s both' }}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="앨범 이름 입력..."
                autoFocus
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: tc, fontSize: 14, fontFamily: 'inherit' }}
              />
              <button onClick={handleCreate} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${theme.from},${theme.to})`, color: '#fff', fontSize: 12, fontWeight: 700 }}>만들기</button>
            </div>
          )}

          {albums.length === 0 ? (
            <div style={{ ...G(0.62), borderRadius: 22, padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🎵</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: tc, marginBottom: 6 }}>아직 앨범이 없어요</p>
              <p style={{ fontSize: 13, color: sc }}>+ 새 앨범 버튼으로 앨범을 만들어보세요</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {albums.map((album, ai) => (
                <div key={ai} style={{ ...G(0.62), borderRadius: 18, padding: '18px 20px' }}>
                  {/* 앨범 헤더 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg,${theme.from},${theme.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff', fontWeight: 700 }}>
                      {album.name?.[0] || '🎵'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setOpenIdx(openIdx === ai ? null : ai)}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: tc }}>{album.name}</p>
                      <p style={{ fontSize: 12, color: sc, marginTop: 2 }}>{album.songs?.length || 0}곡</p>
                    </div>
                    {album.songs?.length > 0 && (
                      <button onClick={() => onPlaySong?.(album.songs[0], album.songs)} style={{
                        padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: `linear-gradient(135deg,${theme.from},${theme.to})`, color: '#fff', fontSize: 12, fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>재생
                      </button>
                    )}
                    <button onClick={() => onDeleteAlbum?.(ai)} title="앨범 삭제" style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: sc, fontSize: 16, padding: '4px',
                    }}>🗑️</button>
                    <button onClick={() => setOpenIdx(openIdx === ai ? null : ai)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: sc, fontSize: 13, padding: '4px',
                    }}>{openIdx === ai ? '▲' : '▼'}</button>
                  </div>

                  {/* 곡 목록 */}
                  {openIdx === ai && album.songs?.length > 0 && (
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 4, animation: 'fadeInUp 0.25s both' }}>
                      {album.songs.map((song, si) => (
                        <div key={si} className={trow} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, cursor: 'pointer' }}
                          onClick={() => onPlaySong?.(song, album.songs)}>
                          <span style={{ fontSize: 11, color: sc, minWidth: 18, textAlign: 'center' }}>{si + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: tc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</p>
                            <p style={{ fontSize: 11, color: sc, marginTop: 2 }}>{song.artist}</p>
                          </div>
                          <button onClick={e => { e.stopPropagation(); onRemoveFromAlbum?.(ai, si) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sc, fontSize: 14, padding: '4px' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {openIdx === ai && (!album.songs || album.songs.length === 0) && (
                    <p style={{ marginTop: 12, fontSize: 12, color: sc, textAlign: 'center', padding: '12px 0' }}>아직 담긴 곡이 없어요</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}