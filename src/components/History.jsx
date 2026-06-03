import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { glass, glassDark, pageBackground, getTheme, getDarkTheme, getComplement, getDarkComplement, GLOBAL_CSS } from '../styles/theme'

const getLiquidGlass = (isDark) => isDark
  ? { background:'rgba(30,42,120,0.60)', backdropFilter:'blur(40px) saturate(200%) brightness(1.12)', WebkitBackdropFilter:'blur(40px) saturate(200%) brightness(1.12)', border:'1px solid rgba(140,160,255,0.25)', boxShadow:'0 4px 32px rgba(0,0,30,0.55), inset 0 1px 0 rgba(180,200,255,0.18)' }
  : { background:'rgba(255,255,255,0.65)', backdropFilter:'blur(40px) saturate(200%) brightness(1.06)', WebkitBackdropFilter:'blur(40px) saturate(200%) brightness(1.06)', border:'1px solid rgba(255,255,255,0.82)', boxShadow:'0 4px 24px rgba(100,120,200,0.10), 0 1px 0 rgba(255,255,255,0.95) inset' }

// ── 앨범 추가 드롭다운 ─────────────────────────────────────
function AlbumDropdown({ albums, song, onAddToAlbum, onClose, isDark, tc, sc, G }) {
  return (
    <div style={{ position:'absolute', right:0, top:'36px', borderRadius:'12px', padding:'8px', zIndex:50, minWidth:'160px', ...G(0.62) }}
      onClick={e => e.stopPropagation()}>
      {albums?.length === 0 ? (
        <p style={{ fontSize:'12px', color:sc, padding:'6px 8px' }}>앨범이 없어요<br/>사이드바에서 만들어주세요</p>
      ) : albums?.map((album, i) => (
        <div key={i} onClick={() => { onAddToAlbum?.(i, song); onClose() }}
          style={{ padding:'8px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', color:tc, transition:'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = isDark?'rgba(255,255,255,0.10)':'rgba(100,120,200,0.10)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          🎵 {album.name}
          <span style={{ fontSize:'11px', color:sc, marginLeft:'6px' }}>{album.songs?.length || 0}곡</span>
        </div>
      ))}
    </div>
  )
}

function HistoryItem({ item, onPlay, isDark = false, likedSongs = [], onToggleLike, albums = [], onAddToAlbum, onAddToQueue }) {
  const [expanded, setExpanded] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)   // 앨범 추가 드롭다운 (곡 인덱스)
  const displaySongs = expanded ? item.songs : item.songs?.slice(0, 3)

  // 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    if (openDropdown === null) return
    const close = () => setOpenDropdown(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [openDropdown])

  const emotionMap = {
    '슬픔':'슬픔','우울':'슬픔','그리움':'슬픔',
    '행복':'기쁨','기쁨':'기쁨','즐거움':'기쁨',
    '설렘':'설렘','두근거림':'설렘',
    '분노':'분노','화남':'분노',
    '불안':'불안','걱정':'불안',
    '평온':'평온','안정':'평온','평온함':'평온',
    '집중':'집중','신남':'기쁨',
    '무기력':'피로','피로':'피로','외로움':'슬픔',
  }

  const dominantEmotion = item.emotions?.length > 0
    ? (emotionMap[item.emotions[0].name] || 'default')
    : 'default'
  const complement = isDark ? getDarkComplement(dominantEmotion) : getComplement(dominantEmotion)
  const G = isDark ? glassDark : glass
  const tc = isDark ? '#c0c8f0' : '#1a2a4a'
  const sc = isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.50)'
  const trow = isDark ? 'trow trow-dark' : 'trow trow-light'

  const getTime = () => {
    if (item.timestamp?.toDate) return item.timestamp.toDate().toLocaleString('ko-KR', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' })
    return item.time || ''
  }

  return (
    <div style={{ borderRadius:'20px', padding:'16px', marginBottom:'12px', ...G(0.62) }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ fontSize:'20px' }}>🎵</span>
          <p style={{ fontSize:'14px', fontWeight:'500', color:tc }}>{item.freeText || item.text}</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
          {item.songs?.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onPlay?.(item.songs[0], item.songs) }}
              style={{
                padding:'6px 14px', borderRadius:'12px', border:'none', cursor:'pointer',
                background:'linear-gradient(135deg,#7C5CFF,#FF4D8D)', color:'#fff',
                fontSize:'11px', fontWeight:'700', display:'flex', alignItems:'center', gap:'5px',
                boxShadow:'0 2px 8px rgba(124,92,255,0.3)',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
              전체 재생
            </button>
          )}
          <p style={{ fontSize:'11px', color:isDark?'rgba(180,190,255,0.40)':sc }}>{getTime()}</p>
        </div>
      </div>

      {item.emotions?.length > 0 && (
        <div style={{ marginBottom:'12px' }}>
          <div style={{ height:'4px', borderRadius:'2px', marginBottom:'6px',
            background:`linear-gradient(to right, ${item.emotions.map((e, i) => {
              const start = item.emotions.slice(0, i).reduce((acc, cur) => acc + cur.percent, 0)
              return `${e.color} ${start}%, ${e.color} ${start + e.percent}%`
            }).join(', ')})` }}/>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {item.emotions.map((e, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:e.color }}/>
                <span style={{ fontSize:'11px', color:sc }}>{e.name} {e.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {item.songs?.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
          {displaySongs?.map((song, i) => {
            const isLiked = likedSongs?.some(s => s.title === song.title && s.artist === song.artist)
            const isInAnyAlbum = albums?.some(album => album.songs?.find(s => s.title === song.title))
            return (
              <div key={i} onClick={() => onPlay?.(song, [song])} className={trow}
                style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 8px', borderRadius:'8px', cursor:'pointer', position:'relative' }}>
                <div style={{
                  width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(100,120,200,0.15)',
                  border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(100,120,200,0.25)',
                }}>
                  <div style={{ width:0, height:0, borderStyle:'solid', borderWidth:'4px 0 4px 8px', borderColor:`transparent transparent transparent ${isDark ? 'rgba(255,255,255,0.9)' : 'rgba(30,50,100,0.75)'}`, marginLeft:'2px' }}/>
                </div>
                <p style={{ fontSize:'13px', color:tc, flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {song.title} <span style={{ color:complement }}>— {song.artist}</span>
                </p>

                {/* 다음에 재생 (큐에 추가) */}
                {onAddToQueue && (
                  <button
                    onClick={e => { e.stopPropagation(); onAddToQueue(song) }}
                    style={{
                      width:'26px', height:'26px', borderRadius:'50%', flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      border:'none', cursor:'pointer', transition:'all 0.2s',
                      background: isDark?'rgba(255,255,255,0.08)':'rgba(100,120,200,0.10)',
                      color: isDark?'rgba(180,190,255,0.55)':'rgba(20,40,90,0.45)',
                    }}
                    title="다음에 재생"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h10v2H4zm0 4h10v2H4zm0 4h6v2H4zm12-2v6l5-3z"/></svg>
                  </button>
                )}

                {/* 좋아요 버튼 */}
                {onToggleLike && (
                  <button
                    onClick={e => { e.stopPropagation(); onToggleLike(song) }}
                    style={{
                      width:'26px', height:'26px', borderRadius:'50%', flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      border:'none', cursor:'pointer', fontSize:'13px', transition:'all 0.2s',
                      background: isLiked ? 'rgba(255,60,100,0.18)' : (isDark?'rgba(255,255,255,0.08)':'rgba(100,120,200,0.10)'),
                      transform: isLiked ? 'scale(1.1)' : 'scale(1)',
                    }}
                    title={isLiked ? '좋아요 취소' : '좋아요'}
                  >
                    {isLiked ? '❤️' : '🤍'}
                  </button>
                )}

                {/* 앨범(재생목록) 추가 버튼 */}
                {onAddToAlbum && (
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <button
                      onClick={e => { e.stopPropagation(); setOpenDropdown(openDropdown === i ? null : i) }}
                      style={{
                        width:'26px', height:'26px', borderRadius:'50%',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        border:'none', cursor:'pointer', fontSize:'15px', fontWeight:'300', transition:'all 0.2s',
                        background: isInAnyAlbum ? `${complement}22` : (isDark?'rgba(255,255,255,0.08)':'rgba(100,120,200,0.10)'),
                        color: isInAnyAlbum ? complement : (isDark?'rgba(180,190,255,0.55)':'rgba(20,40,90,0.45)'),
                      }}
                      title="재생목록에 추가"
                    >
                      {isInAnyAlbum ? '✓' : '+'}
                    </button>
                    {openDropdown === i && (
                      <AlbumDropdown albums={albums} song={song} onAddToAlbum={onAddToAlbum} onClose={() => setOpenDropdown(null)} isDark={isDark} tc={tc} sc={sc} G={G} />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {item.songs?.length > 3 && (
        <button onClick={() => setExpanded(!expanded)} className="gbtn"
          style={{ marginTop:'10px', border:'none', borderRadius:'20px', color:sc, fontSize:'12px', cursor:'pointer', padding:'6px 16px', width:'100%', ...G(0.50) }}>
          {expanded ? '접기 ↑' : `+${item.songs?.length - 3}곡 더 보기 ↓`}
        </button>
      )}
    </div>
  )
}

export default function History({ user, onBack, onPlaySong, emotion = 'default', isDark = false, likedSongs = [], onToggleLike, albums = [], onAddToAlbum, onAddToQueue }) {
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)
  const theme = isDark ? getDarkTheme(emotion) : getTheme(emotion)
  const G = isDark ? glassDark : glass
  const tc = isDark ? (theme.text||'#c0c8f0') : '#1a2a4a'
  const sc = isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.50)'
  const trow = isDark ? 'trow trow-dark' : 'trow trow-light'

  // Firebase에서 히스토리 불러오기
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) { setLoading(false); return }
      try {
        const q = collection(db, 'users', user.uid, 'history')
        const snapshot = await getDocs(q)
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const aTime = a.timestamp?.seconds || 0
            const bTime = b.timestamp?.seconds || 0
            return bTime - aTime
          })
        setHistory(data)
      } catch (e) {
        console.error('히스토리 불러오기 실패:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [user])

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ ...pageBackground(theme), minHeight:'100vh' }}>

        {/* 헤더 — 배경 바 없이 투명 위에 글씨만 (LikedPage와 동일) */}
        <div style={{ display:'flex', alignItems:'center', gap:16, padding:'24px 28px 0' }}>
          <button onClick={onBack} style={{
            background:'none',
            border:`1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(100,120,200,0.25)'}`,
            borderRadius:12, padding:'8px 16px', color:sc, cursor:'pointer', fontSize:13,
          }}>← 돌아가기</button>
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, color:tc, margin:0, display:'flex', alignItems:'center', gap:8 }}>📜 내 취향 히스토리</h2>
            <p style={{ fontSize:13, color:sc, margin:'4px 0 0' }}>
              {user?.displayName || user?.email}님의 기록 {history?.length}개
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 20px' }}>
            <p style={{ color:isDark?'rgba(180,190,255,0.40)':sc }}>히스토리 불러오는 중...</p>
          </div>
        ) : history.length === 0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 20px' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🎵</div>
            <p style={{ color:isDark?'rgba(180,190,255,0.40)':sc, fontSize:'14px' }}>아직 기록이 없어요</p>
            <p style={{ color:sc, fontSize:'12px', marginTop:'8px' }}>감정 분석을 해보세요!</p>
          </div>
        ) : (
          <div style={{ padding:'20px 28px 100px' }}>
            {history.map((item, i) => (
              <HistoryItem key={item.id || i} item={item} onPlay={onPlaySong} isDark={isDark}
                likedSongs={likedSongs} onToggleLike={onToggleLike} albums={albums} onAddToAlbum={onAddToAlbum} onAddToQueue={onAddToQueue} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}