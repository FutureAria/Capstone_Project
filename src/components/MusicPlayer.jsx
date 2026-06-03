import { useState, useEffect, useRef } from 'react'
import { glass, glassDark, GLOBAL_CSS } from '../styles/theme'

export default function MusicPlayer({ song, videoId, onClose, songs, onSongChange, onReorderQueue, onQueueEnd, likedSongs = [], onToggleLike, isDark = false, sidebarCollapsed = false, isMobile = false }) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [volume, setVolume] = useState(80)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showVolume, setShowVolume] = useState(false)
  const [showQueue, setShowQueue] = useState(false)   // 큐 패널 토글
  const [dragIdx, setDragIdx]     = useState(null)     // 드래그 중인 곡 인덱스
  const [overIdx, setOverIdx]     = useState(null)     // 드롭 대상 인덱스
  const playerRef = useRef(null)
  const timerRef = useRef(null)
  const currentIndex = songs?.findIndex(s => s.title === song?.title) ?? -1
  const latestRef = useRef({ currentIndex, onQueueEnd, onSongChange, song, songs, volume })

  useEffect(() => {
    latestRef.current = { currentIndex, onQueueEnd, onSongChange, song, songs, volume }
  }, [currentIndex, onQueueEnd, onSongChange, song, songs, volume])

  useEffect(() => {
    if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null }
    clearInterval(timerRef.current)
    setCurrentTime(0); setDuration(0); setIsPlaying(true)

    const initPlayer = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        videoId,
        playerVars: { autoplay: 1, controls: 0, rel: 0 },
          events: {
          onReady: (e) => {
            e.target.setVolume(latestRef.current.volume)
            e.target.playVideo()
            setDuration(e.target.getDuration())
            timerRef.current = setInterval(() => {
              if (playerRef.current?.getCurrentTime) {
                setCurrentTime(playerRef.current.getCurrentTime())
                setDuration(playerRef.current.getDuration())
              }
            }, 500)
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) setIsPlaying(true)
            if (e.data === window.YT.PlayerState.PAUSED) setIsPlaying(false)
            if (e.data === window.YT.PlayerState.ENDED) {
              const latest = latestRef.current
              if (latest.currentIndex < latest.songs?.length - 1) {
                latest.onSongChange(latest.songs[latest.currentIndex + 1])
              } else {
                // 큐가 끝나면 비슷한 곡 자동 추천
                latest.onQueueEnd?.(latest.song)
              }
            }
          }
        }
      })
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }

    return () => clearInterval(timerRef.current)
  }, [videoId])

  const handlePlayPause = () => {
    if (!playerRef.current) return
    if (isPlaying) playerRef.current.pauseVideo()
    else playerRef.current.playVideo()
  }

  const handleVolume = (v) => {
    setVolume(v)
    if (playerRef.current?.setVolume) playerRef.current.setVolume(v)
  }

  const handleSeek = (v) => {
    if (playerRef.current?.seekTo) playerRef.current.seekTo(Number(v), true)
    setCurrentTime(Number(v))
  }

  const handlePrev = () => { if (currentIndex > 0) onSongChange(songs[currentIndex - 1]) }
  const handleNext = () => { if (currentIndex < songs?.length - 1) onSongChange(songs[currentIndex + 1]) }

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{
        position: 'fixed', bottom: 16, left: isMobile ? 12 : (sidebarCollapsed ? 92 : 276), right: isMobile ? 12 : 16, transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 100, padding: '10px 16px',
        background: isDark ? 'rgba(20,30,100,0.78)' : 'rgba(255,255,255,0.70)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        border: isDark ? '1px solid rgba(140,160,255,0.28)' : '1px solid rgba(255,255,255,0.85)',
        borderRadius: 20,
        boxShadow: isDark ? '0 8px 40px rgba(0,0,30,0.6), inset 0 1px 0 rgba(180,200,255,0.20), inset 0 -1px 0 rgba(60,80,200,0.12)' : '0 8px 40px rgba(100,120,200,0.20), 0 2px 0 rgba(255,255,255,0.95) inset',
      }}>
        {/* 숨겨진 유튜브 플레이어 */}
        <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1, overflow: 'hidden' }}>
          <div id="yt-player" />
        </div>

        {/* 진행 바 */}
        <input
          type="range"
          min={0}
          max={Math.floor(duration) || 100}
          value={Math.floor(currentTime)}
          onChange={e => handleSeek(e.target.value)}
          style={{
            width: '100%', height: '3px', marginBottom: '10px',
            accentColor: '#FF0033', cursor: 'pointer', display: 'block'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* 앨범 커버 */}
          <img
            src={thumbnailUrl}
            alt="thumbnail"
            style={{
              width: '40px', height: '40px', borderRadius: '8px',
              objectFit: 'cover', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}
          />

          {/* 노래 정보 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '13px', fontWeight: '600', color: isDark ? '#c0c8f0' : '#1a2a4a',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>{song?.title}</p>
            <p style={{ fontSize: '12px', color: isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.5)', marginTop: '2px' }}>
              {song?.artist}
            </p>
          </div>

          {/* 시간 */}
          <span style={{ fontSize: '11px', color: isDark ? 'rgba(180,190,255,0.40)' : 'rgba(20,40,90,0.4)', flexShrink: 0 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* 컨트롤 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {/* 이전 */}
            <button onClick={handlePrev} disabled={currentIndex <= 0} style={{
              background: 'none', border: 'none',
              cursor: currentIndex <= 0 ? 'not-allowed' : 'pointer',
              color: currentIndex <= 0 ? (isDark?'rgba(255,255,255,0.15)':'rgba(20,40,90,0.2)') : (isDark?'rgba(200,210,255,0.80)':'rgba(20,40,90,0.7)'),
              fontSize: '20px', padding: '6px', lineHeight: 1
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
              </svg>
            </button>

            {/* 재생/일시정지 */}
            <button onClick={handlePlayPause} style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'rgba(255,0,51,0.85)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', color: '#fff', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(255,0,51,0.4)'
            }}>
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isDark?"#c0c8f0":"#1a2a4a"}>
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isDark?"#c0c8f0":"#1a2a4a"}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* 다음 */}
            <button onClick={handleNext} disabled={currentIndex >= songs?.length - 1} style={{
              background: 'none', border: 'none',
              cursor: currentIndex >= songs?.length - 1 ? 'not-allowed' : 'pointer',
              color: currentIndex >= songs?.length - 1 ? (isDark?'rgba(255,255,255,0.15)':'rgba(20,40,90,0.2)') : (isDark?'rgba(200,210,255,0.80)':'rgba(20,40,90,0.7)'),
              fontSize: '20px', padding: '6px', lineHeight: 1
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zm2.5-6 8.5 6V6z" /><rect x="16" y="6" width="2" height="12"/>
              </svg>
            </button>

            {/* 음량 */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowVolume(!showVolume)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: isDark ? 'rgba(180,190,255,0.60)' : 'rgba(20,40,90,0.5)', fontSize: '18px', padding: '6px', lineHeight: 1
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
              </button>
              {showVolume && (
                <div style={{
                  position: 'absolute', bottom: '44px', right: 0,
                  borderRadius: '12px', padding: '12px 8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  ...glass(0.18)
                }}>
                  <span style={{ fontSize: '11px', color: 'rgba(20,40,90,0.5)' }}>{volume}%</span>
                  <input
                    type="range" min={0} max={100} value={volume}
                    onChange={e => handleVolume(Number(e.target.value))}
                    style={{
                      writingMode: 'vertical-lr', direction: 'rtl',
                      height: '80px', accentColor: '#FF0033', cursor: 'pointer'
                    }}
                  />
                </div>
              )}
            </div>

            {/* 좋아요 버튼 */}
            {onToggleLike && (() => {
              const isLiked = likedSongs?.some(s => s.title === song?.title && s.artist === song?.artist)
              return (
                <button onClick={() => onToggleLike(song)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '16px', padding: '6px', lineHeight: 1,
                  transition: 'transform 0.2s',
                  transform: isLiked ? 'scale(1.2)' : 'scale(1)',
                }}>
                  {isLiked ? '❤️' : '🤍'}
                </button>
              )
            })()}

            {/* 큐(재생목록) 버튼 */}
            {songs?.length > 1 && (
              <button onClick={() => setShowQueue(!showQueue)} style={{
                background: showQueue ? (isDark?'rgba(140,160,255,0.20)':'rgba(100,120,200,0.15)') : 'none',
                border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px',
                color: isDark ? 'rgba(180,190,255,0.60)' : 'rgba(20,40,90,0.5)', lineHeight: 1,
                transition: 'all 0.2s',
              }} title="재생목록">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
              </button>
            )}

            {/* 닫기 */}
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.4)', fontSize: '18px', padding: '6px', lineHeight: 1
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── 큐 패널 ──────────────────────────────────────────── */}
        {showQueue && songs?.length > 1 && (
          <div style={{
            borderTop: isDark ? '1px solid rgba(140,160,255,0.15)' : '1px solid rgba(100,120,200,0.12)',
            marginTop: '10px', paddingTop: '10px',
            maxHeight: '200px', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: '2px',
          }}>
            <p style={{ fontSize: '10px', color: isDark?'rgba(180,190,255,0.40)':'rgba(20,40,90,0.4)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px', paddingLeft: '4px' }}>
              재생목록 ({songs.length}곡) · 드래그로 순서 변경
            </p>
            {songs.map((s, i) => {
              const isCurrent = s.title === song?.title
              const isDragging = dragIdx === i
              const isOver = overIdx === i && dragIdx !== null && dragIdx !== i
              return (
                <div
                  key={i}
                  draggable
                  onDragStart={(e) => { setDragIdx(i); e.dataTransfer.effectAllowed = 'move' }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (overIdx !== i) setOverIdx(i) }}
                  onDrop={(e) => { e.preventDefault(); if (dragIdx !== null && dragIdx !== i) onReorderQueue?.(dragIdx, i); setDragIdx(null); setOverIdx(null) }}
                  onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
                  onClick={() => onSongChange(s)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 8px', borderRadius: '8px', cursor: 'pointer',
                    background: isCurrent
                      ? (isDark ? 'rgba(140,160,255,0.18)' : 'rgba(100,120,200,0.12)')
                      : 'transparent',
                    opacity: isDragging ? 0.4 : 1,
                    borderTop: isOver ? '2px solid #FF0033' : '2px solid transparent',
                    transition: 'background 0.15s, opacity 0.15s',
                  }}
                  onMouseEnter={e => { if (!isCurrent && !isDragging) e.currentTarget.style.background = isDark?'rgba(255,255,255,0.06)':'rgba(100,120,200,0.07)' }}
                  onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent' }}
                >
                  {/* 드래그 핸들 */}
                  <span
                    onClick={e => e.stopPropagation()}
                    style={{ cursor: 'grab', color: isDark?'rgba(180,190,255,0.30)':'rgba(20,40,90,0.25)', flexShrink: 0, display: 'flex', alignItems: 'center', lineHeight: 1 }}
                    title="드래그하여 순서 변경"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>
                  </span>
                  <span style={{
                    fontSize: '10px', fontWeight: '700', minWidth: '16px', textAlign: 'center',
                    color: isCurrent ? '#FF0033' : (isDark?'rgba(180,190,255,0.35)':'rgba(20,40,90,0.35)'),
                  }}>
                    {isCurrent ? '▶' : i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '12px', fontWeight: isCurrent ? '600' : '400',
                      color: isCurrent ? (isDark?'#c0c8f0':'#1a2a4a') : (isDark?'rgba(180,190,255,0.70)':'rgba(20,40,90,0.70)'),
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{s.title}</p>
                    <p style={{ fontSize: '10px', color: isDark?'rgba(180,190,255,0.40)':'rgba(20,40,90,0.40)', marginTop: '1px' }}>{s.artist}</p>
                  </div>
                  {likedSongs?.some(l => l.title === s.title) && (
                    <span style={{ fontSize: '10px' }}>❤️</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
