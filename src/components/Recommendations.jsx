// ============================================================
// Recommendations.jsx — backend recommendation API 사용
// ============================================================

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { glass, glassDark, pageBackground, getTheme, getDarkTheme, getComplement, getDarkComplement, GLOBAL_CSS } from '../styles/theme'
import { api, apiErrorMessage } from '../lib/api'

// ── 로딩 화면 ────────────────────────────────────────────────
function LoadingScreen({ isDark = false }) {
  const [progress, setProgress] = useState(0)
  const [message, setMessage]   = useState('감정을 분석하는 중...')
  const theme = getTheme('default')

  useEffect(() => {
    const messages = [
      { at:0,  text:'감정을 분석하는 중...' },
      { at:20, text:'취향을 파악하는 중...' },
      { at:45, text:'어울리는 노래를 찾는 중...' },
      { at:70, text:'플레이리스트를 구성하는 중...' },
      { at:90, text:'거의 다 됐어요...' },
    ]
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + Math.random() * 3, 95)
        const msg = [...messages].reverse().find(m => next >= m.at)
        if (msg) setMessage(msg.text)
        return next
      })
    }, 200)
    return () => clearInterval(interval)
  }, [])

  const cardStyle = isDark
    ? { background:'rgba(30,42,120,0.60)', backdropFilter:'blur(32px) saturate(200%) brightness(1.12)', WebkitBackdropFilter:'blur(32px) saturate(200%) brightness(1.12)', border:'1px solid rgba(140,160,255,0.25)', boxShadow:'0 16px 48px rgba(0,0,30,0.55), inset 0 1px 0 rgba(180,200,255,0.18)' }
    : { background:'rgba(255,255,255,0.82)', backdropFilter:'blur(32px) saturate(180%)', WebkitBackdropFilter:'blur(32px) saturate(180%)', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 16px 48px rgba(100,120,200,0.18), inset 0 1px 0 rgba(255,255,255,1)' }
  const titleColor = isDark ? '#c0c8f0' : '#1a2a4a'
  const msgColor   = isDark ? 'rgba(180,190,255,0.55)' : 'rgba(20,40,90,0.55)'
  const pctColor   = isDark ? 'rgba(180,190,255,0.45)' : 'rgba(20,40,90,0.45)'
  const trackColor = isDark ? 'rgba(140,160,255,0.18)' : 'rgba(100,120,200,0.15)'

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight:'100vh', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px' }}>
        <div style={{ ...cardStyle, borderRadius:28, padding:'48px 56px', display:'flex', flexDirection:'column', alignItems:'center', maxWidth:360, width:'100%' }}>
          <div style={{ fontSize:'52px', marginBottom:'24px' }}>🎵</div>
          <p style={{ color:titleColor, fontSize:'20px', marginBottom:'8px', fontWeight:'600' }}>AI가 음악을 추천하는 중...</p>
          <p style={{ color:msgColor, fontSize:'14px', marginBottom:'40px' }}>{message}</p>
          <div style={{ width:'100%', maxWidth:'280px', marginBottom:'12px' }}>
            <div style={{ width:'100%', height:'4px', borderRadius:'2px', overflow:'hidden', background:trackColor }}>
              <div style={{ height:'100%', borderRadius:'2px', background:'linear-gradient(to right, #6080e0, #c060c0)', width:`${progress}%`, transition:'width 0.2s ease' }}/>
            </div>
          </div>
          <p style={{ color:pctColor, fontSize:'13px' }}>{Math.round(progress)}%</p>
        </div>
      </div>
    </>
  )
}


const buildGradient = (emotions) => {
  const stops = []
  let cumulative = 0
  emotions.forEach((e, i) => {
    const next = emotions[i + 1]
    stops.push(`${e.color} ${cumulative}%`)
    cumulative += e.percent
    if (next) {
      stops.push(`${e.color} ${cumulative - e.percent * 0.3}%`)
      stops.push(`${next.color} ${cumulative}%`)
    } else {
      stops.push(`${e.color} ${cumulative}%`)
    }
  })
  return `linear-gradient(to right, ${stops.join(', ')})`
}

function AlbumDropdown({ albums, song, onAddToAlbum, onClose, isDark, tc, sc, liquidGlass }) {
  return (
    <div style={{ position:'absolute', right:'40px', top:'0', borderRadius:'12px', padding:'8px', zIndex:50, minWidth:'160px', ...liquidGlass }}
      onClick={e => e.stopPropagation()}>
      {albums?.length === 0 ? (
        <p style={{ fontSize:'12px', color:isDark?'rgba(180,190,255,0.40)':sc, padding:'6px 8px' }}>앨범이 없어요<br/>사이드바에서 만들어주세요</p>
      ) : albums?.map((album, i) => (
        <div key={i} onClick={() => { onAddToAlbum(i, song); onClose() }}
          style={{ padding:'8px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', color:tc, transition:'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          🎵 {album.name}
          <span style={{ fontSize:'11px', color:isDark?'rgba(180,190,255,0.40)':sc, marginLeft:'6px' }}>{album.songs?.length}곡</span>
        </div>
      ))}
    </div>
  )
}

async function getBackendRecommendations(userInput) {
  return api.recommend({
    text: userInput.freeText,
    emotion: userInput.emotion,
    limit: 8,
  })
}

// ── 메인 컴포넌트 ────────────────────────────────────────────
export default function Recommendations({ userInput, user, cachedSongs, onSongsLoaded, onBack, onHistory, albums, onAddToAlbum, onThemeChange, onPlaySong, onEmotionChange, likedSongs = [], onToggleLike, isDark = false }) {
  const [songs, setSongs]           = useState(cachedSongs?.songs || [])
  const [emotions, setEmotions]     = useState(cachedSongs?.emotions || [])
  const [loading, setLoading]       = useState(!cachedSongs?.songs?.length)
  const [error, setError]           = useState(null)
  const [currentSong, setCurrentSong] = useState(null)
  const [openDropdown, setOpenDropdown] = useState(null)
  const hasFetched = useRef(false)

  const emotionMap = {
    '슬픔':'슬픔','우울':'슬픔','그리움':'슬픔',
    '행복':'기쁨','기쁨':'기쁨','즐거움':'기쁨',
    '설렘':'설렘','두근거림':'설렘',
    '분노':'분노','화남':'분노',
    '불안':'불안','걱정':'불안',
    '평온':'평온','안정':'평온',
    '집중':'집중','신남':'기쁨',
    '무기력':'피로','피로':'피로','외로움':'슬픔',
  }

  const dominantEmotion = emotions?.length > 0 ? (emotionMap[emotions[0].name] || 'default') : 'default'
  const theme      = useMemo(() => isDark ? getDarkTheme(dominantEmotion) : getTheme(dominantEmotion), [dominantEmotion, isDark])
  const complement = isDark ? getDarkComplement(dominantEmotion) : getComplement(dominantEmotion)
  const G          = isDark ? glassDark : glass
  const tc         = theme.text || (isDark ? '#c0c8f0' : '#1a2a4a')
  const sc         = isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.50)'
  const trow       = isDark ? 'trow trow-dark' : 'trow trow-light'
  const liquidGlass = G(0.62)

  useEffect(() => {
    if (onThemeChange) onThemeChange(theme)
    if (onEmotionChange) onEmotionChange(dominantEmotion)
  }, [dominantEmotion, onEmotionChange, onThemeChange, theme])

  // ── Claude API로 추천 받기 ──────────────────────────────────
  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getBackendRecommendations(userInput)
      setSongs(result.songs || [])
      setEmotions(result.emotions || [])
      onSongsLoaded?.(result)
    } catch (err) {
      console.error('추천 로드 실패:', err)
      setError(apiErrorMessage(err, '음악 추천을 불러오는 데 실패했습니다.'))
    } finally {
      setLoading(false)
    }
  }, [onSongsLoaded, userInput])

  useEffect(() => {
    if (cachedSongs?.songs?.length > 0) return
    if (hasFetched.current) return
    hasFetched.current = true
    fetchRecommendations()
  }, [cachedSongs?.songs?.length, fetchRecommendations])

  useEffect(() => {
    const handleClick = () => setOpenDropdown(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  // ── YouTube videoId 검색 ──────────────────────────────────
  const handlePlay = (song) => {
    setCurrentSong(song)
    onPlaySong?.(song, songs)
  }

  if (loading) return <LoadingScreen isDark={isDark} />

  if (error) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ ...pageBackground(getTheme('default')), display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>⏳</div>
        <p style={{ color:tc, fontSize:'18px', marginBottom:'8px' }}>{error}</p>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={onBack} style={{ padding:'12px 24px', borderRadius:'20px', border:'none', color:tc, cursor:'pointer', ...G(0.60) }}>뒤로 가기</button>
          <button onClick={() => { hasFetched.current = false; fetchRecommendations() }} style={{ padding:'12px 24px', borderRadius:'20px', border:'none', background:'rgba(255,0,51,0.85)', color:'#fff', cursor:'pointer' }}>🔄 다시 시도</button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <style>{`@keyframes glowPulse{0%,100%{opacity:0.35;filter:blur(10px)}50%{opacity:0.65;filter:blur(16px)}}`}</style>
      <div style={{ background:'transparent', paddingBottom: '40px', minHeight:'100vh', padding:'12px 12px 12px 0' }}
        onClick={() => setOpenDropdown(null)}>

        {/* 전체 패널 - 사이드바처럼 라운딩 */}
        <div style={{
          borderRadius:'24px',
          background:isDark?'rgba(20,30,100,0.55)':'rgba(255,255,255,0.45)',
          backdropFilter:'blur(40px) saturate(180%)',
          WebkitBackdropFilter:'blur(40px) saturate(180%)',
          border:isDark?'1px solid rgba(140,160,255,0.22)':'1px solid rgba(255,255,255,0.75)',
          boxShadow:'0 8px 40px rgba(100,120,200,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
          minHeight:'calc(100vh - 24px)',
          overflow:'hidden',
        }}>

        {/* 헤더 */}
        <div style={{
          display:'flex', alignItems:'center', gap:'12px',
          padding:'16px 24px', position:'sticky', top:0, zIndex:10,
          background:isDark?'rgba(15,22,80,0.75)':'rgba(255,255,255,0.65)',
          backdropFilter:'blur(32px) saturate(200%)', WebkitBackdropFilter:'blur(32px) saturate(200%)',
          borderBottom:isDark?'1px solid rgba(100,120,255,0.15)':'1px solid rgba(255,255,255,0.80)',
          boxShadow:'0 4px 24px rgba(100,120,200,0.12), inset 0 1px 0 rgba(255,255,255,0.95)',
        }}>
          <button onClick={onBack} style={{ background:'none', border:'none', color:tc, fontSize:'20px', cursor:'pointer' }}>←</button>
          <div style={{ flex:1 }}>
            <h2 style={{ fontSize:'16px', fontWeight:'600', color:tc }}>AI 추천 플레이리스트</h2>
            <p style={{ fontSize:'12px', color:complement, marginTop:'2px' }}>
              {user?.displayName || user?.email}님을 위한 {songs?.length}곡
            </p>
          </div>
          <span style={{ padding:'4px 14px', borderRadius:'12px', fontSize:'12px', color:complement, ...G(0.5) }}>
            {userInput.freeText}
          </span>
          <button onClick={onHistory} className="gbtn" style={{ border:'none', color:'rgba(20,40,90,0.7)', padding:'6px 14px', borderRadius:'16px', cursor:'pointer', fontSize:'12px', ...G(0.55) }}>
            📋 히스토리
          </button>
        </div>

        {/* 2칸 레이아웃 */}
        <div style={{
          display:'grid',
          gridTemplateColumns: emotions?.length > 0 ? '1fr 1.6fr' : '1fr',
          gap:'20px', padding:'32px 40px', maxWidth:'1100px', margin:'0 auto',
          alignItems:'start',
        }}>

          {/* 왼쪽: 감정 분석 */}
          {emotions?.length > 0 && (
            <div style={{ borderRadius:'24px', padding:'24px', overflow:'hidden', ...liquidGlass, animation:'fadeInUp 0.5s ease' }}>
              <p style={{ fontSize:'11px', color:isDark?'rgba(180,190,255,0.40)':sc, marginBottom:'20px', letterSpacing:'1.5px', textTransform:'uppercase' }}>감정 분석</p>

              <div style={{ position:'relative', marginBottom:'24px' }}>
                <div style={{ position:'absolute', top:'50%', left:0, right:0, height:'20px', transform:'translateY(-50%)', background:buildGradient(emotions), borderRadius:'10px', animation:'glowPulse 2.5s ease-in-out infinite', pointerEvents:'none' }}/>
                <div style={{ position:'relative', height:'10px', borderRadius:'5px', background:buildGradient(emotions) }}/>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                {emotions.map((e, i) => (
                  <div key={i}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:e.color, boxShadow:`0 0 8px ${e.color}` }}/>
                        <span style={{ fontSize:'14px', color:tc, fontWeight:'500' }}>{e.name}</span>
                      </div>
                      <span style={{ fontSize:'13px', color:sc }}>{e.percent}%</span>
                    </div>
                    <div style={{ height:'4px', borderRadius:'2px', background:'rgba(100,120,200,0.15)', overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:'2px', background:e.color, width:`${e.percent}%`, boxShadow:`0 0 8px ${e.color}`, transition:'width 0.8s ease' }}/>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop:'24px', padding:'14px', borderRadius:'14px', background:`${emotions[0]?.color}20`, border:`1px solid ${emotions[0]?.color}40`, textAlign:'center' }}>
                <p style={{ fontSize:'12px', color:sc, marginBottom:'4px' }}>주요 감정</p>
                <p style={{ fontSize:'20px', fontWeight:'600', color:emotions[0]?.color }}>{emotions[0]?.name}</p>
              </div>
            </div>
          )}

          {/* 오른쪽: 노래 추천 */}
          <div style={{ borderRadius:'24px', padding:'24px', ...liquidGlass, animation:'fadeInUp 0.6s ease' }}>
            <p style={{ fontSize:'11px', color:isDark?'rgba(180,190,255,0.40)':sc, marginBottom:'20px', letterSpacing:'1.5px', textTransform:'uppercase' }}>추천 플레이리스트</p>

            <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
              {songs.map((song, index) => {
                const isInAnyAlbum = albums?.some(album => album.songs?.find(s => s.title === song.title))
                const isLiked = likedSongs?.some(s => s.title === song.title && s.artist === song.artist)
                return (
                  <div key={index} onClick={() => handlePlay(song)} className={trow} style={{
                    display:'flex', alignItems:'center', gap:'12px',
                    padding:'10px 12px', borderRadius:'12px', cursor:'pointer',
                    background: currentSong?.title === song.title ? (isDark?'rgba(180,190,255,0.12)':'rgba(100,120,200,0.12)') : 'transparent',
                    border: currentSong?.title === song.title ? (isDark?'1px solid rgba(180,190,255,0.25)':'1px solid rgba(100,120,200,0.25)') : '1px solid transparent',
                    transition:'all 0.2s', position:'relative',
                  }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', flexShrink:0, background: currentSong?.title === song.title ? `${complement}22` : 'rgba(100,120,200,0.10)', color: currentSong?.title === song.title ? complement : 'rgba(20,40,90,0.45)' }}>
                      {currentSong?.title === song.title ? '▶' : index + 1}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:'14px', fontWeight:'500', color:tc, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{song.title}</p>
                      <p style={{ fontSize:'12px', color:sc, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{song.artist}</p>
                    </div>
                    <span style={{ padding:'3px 10px', borderRadius:'10px', fontSize:'11px', color:complement, flexShrink:0, ...G(0.5) }}>{song.mood}</span>

                    {/* ❤️ 좋아요 버튼 */}
                    <button
                      onClick={e => { e.stopPropagation(); onToggleLike?.(song) }}
                      style={{
                        width:'28px', height:'28px', borderRadius:'50%',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        border:'none', cursor:'pointer', flexShrink:0,
                        fontSize:'14px', transition:'all 0.2s',
                        background: isLiked ? 'rgba(255,60,100,0.18)' : 'rgba(100,120,200,0.10)',
                        transform: isLiked ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      {isLiked ? '❤️' : '🤍'}
                    </button>

                    <div style={{ position:'relative' }}>
                      <button onClick={e => { e.stopPropagation(); setOpenDropdown(openDropdown === index ? null : index) }} style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor:'pointer', flexShrink:0, fontSize:'16px', fontWeight:'300', transition:'all 0.2s', background: isInAnyAlbum ? `${complement}22` : 'rgba(100,120,200,0.10)', color: isInAnyAlbum ? complement : 'rgba(20,40,90,0.35)' }}>
                        {isInAnyAlbum ? '✓' : '+'}
                      </button>
                      {openDropdown === index && <AlbumDropdown albums={albums} song={song} onAddToAlbum={onAddToAlbum} onClose={() => setOpenDropdown(null)} isDark={isDark} tc={tc} sc={sc} liquidGlass={liquidGlass}/>}
                    </div>
                    <div style={{ width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, ...liquidGlass }}>
                      <div style={{ width:0, height:0, borderStyle:'solid', borderWidth:'5px 0 5px 9px', borderColor:`transparent transparent transparent ${complement}`, marginLeft:'2px' }}/>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop:'20px', textAlign:'center' }}>
              <button onClick={onBack} className="gbtn" style={{ padding:'10px 28px', borderRadius:'20px', border:'none', color:isDark?'rgba(180,190,255,0.60)':sc, cursor:'pointer', fontSize:'13px', ...G(0.5) }}>🔄 다시 추천받기</button>
            </div>
          </div>
        </div>


        </div>{/* 전체 패널 닫기 */}
      </div>
    </>
  )
}
