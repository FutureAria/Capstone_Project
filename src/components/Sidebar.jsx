import { useState } from 'react'
import { glass, glassDark, getTheme, getDarkTheme, sidebarGlass, sidebarGlassDark, GLOBAL_CSS } from '../styles/theme'

export default function Sidebar({ playlist, albums, historyList = [], likedSongs = [], onRemoveFromAlbum, onCreateAlbum, onDeleteAlbum, user, onLogout, onPlay, dominantTheme, onHistoryClick, onLogoClick, onTasteClick, onArtistClick, onSearchClick, onAlbumPage, onLikedPage, onMixPage, activeScreen, isDark = false, onToggleDark, onCollapseChange, isMobile = false, mobileOpen = false, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false)
  // 모바일에서는 항상 펼친 형태로 표시 (접힘 무시)
  const isCollapsed = isMobile ? false : collapsed

  // 접힘 아이콘 → 앨범/좋아요 전용 페이지로 이동
  const onAlbumClick = () => onAlbumPage?.()
  const onLikedClick = () => onLikedPage?.()
  const [activeAlbum, setActiveAlbum] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAlbumName, setNewAlbumName] = useState('')

  const theme = dominantTheme || (isDark ? getDarkTheme('default') : getTheme('default'))
  const sidebarStyle = isDark ? sidebarGlassDark() : sidebarGlass()
  const glassStyle = isDark ? glassDark : glass
  const textColor = isDark ? 'rgba(255,255,255,0.85)' : '#1a2a4a'
  const subTextColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(30,50,100,0.5)'
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)'
  const tc       = isDark ? 'rgba(200,210,255,0.90)' : '#1a2a4a'
  const sc       = isDark ? 'rgba(180,190,255,0.45)' : 'rgba(30,50,100,0.50)'
  const dc       = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)'
  const hoverRow = isDark ? 'trow trow-dark' : 'trow trow-light'
  const hoverBtn = isDark ? 'gbtn gbtn-dark' : 'gbtn gbtn-light'

  const handleCreateAlbum = () => {
    if (!newAlbumName.trim()) return
    onCreateAlbum(newAlbumName.trim())
    setNewAlbumName('')
    setShowCreateModal(false)
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
      `}</style>

      {/* 앨범 이름 생성 모달 */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowCreateModal(false)}>
          <div style={{
            borderRadius: '20px', padding: '28px', width: '300px',
            ...glass(0.22),
          }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              🎵 새 앨범 만들기
            </p>
            <input
              type="text"
              placeholder="앨범 이름 입력..."
              value={newAlbumName}
              onChange={e => setNewAlbumName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateAlbum()}
              autoFocus
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px',
                fontSize: '14px', color: '#1a2a4a', marginBottom: '14px',
                ...glass(0.16)
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowCreateModal(false)} style={{
                flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
                color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px',
                ...glass(0.22)
              }}>취소</button>
              <button onClick={handleCreateAlbum} disabled={!newAlbumName.trim()} style={{
                flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
                background: newAlbumName.trim() ? 'rgba(255,0,51,0.85)' : 'rgba(255,255,255,0.1)',
                color: '#fff', cursor: newAlbumName.trim() ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: '500'
              }}>만들기</button>
            </div>
          </div>
        </div>
      )}

      {/* 모바일 오버레이 (사이드바 열렸을 때 배경 어둡게) */}
      {isMobile && mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{ position: 'fixed', inset: 0, zIndex: 19, background: 'rgba(0,0,20,0.45)', backdropFilter: 'blur(2px)' }}
        />
      )}

      <div style={{
        position: 'fixed',
        left: '12px', top: '12px', bottom: '12px',
        width: isMobile ? '280px' : (isCollapsed ? '56px' : '248px'),
        transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-110%)') : 'none',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        zIndex: isMobile ? 25 : 20,
        borderRadius: '24px',
        ...sidebarStyle,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* 상단 로고 + 접기 */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '16px 0' : '16px 20px',
          borderBottom: '1px solid rgba(100,120,200,0.12)',
          flexShrink: 0,
        }}>
          {!isCollapsed && (
            <div onClick={onLogoClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #6a1a6a, #3a1060)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 2px 8px rgba(106,26,106,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                gap: '2px'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="5" width="3" height="14" rx="1"/>
                  <rect x="11" y="5" width="3" height="14" rx="1"/>
                  <path d="M16 5v14l6-7z"/>
                </svg>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: tc, whiteSpace: 'nowrap' }}>Music Curation</span>
            </div>
          )}
          <button onClick={() => {
            if (isMobile) { onMobileClose?.() }
            else { const next = !collapsed; setCollapsed(next); onCollapseChange?.(next) }
          }} style={{
            background: 'none', border: 'none', color: sc,
            cursor: 'pointer', fontSize: '16px', padding: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {isMobile ? '✕' : (isCollapsed ? '→' : '←')}
          </button>
        </div>

        {/* 유저 정보 */}
        {!isCollapsed && (
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid rgba(100,120,200,0.12)',
            flexShrink: 0,
          }}>
            {/* 이름 + 이메일 */}
            <p style={{ fontSize:'13px', fontWeight:'600', color:textColor, marginBottom:2 }}>
              {user?.displayName || '사용자'}
            </p>
            <p style={{ fontSize:'11px', color:sc, marginBottom:10,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.email}
            </p>
            {/* 다크 + 로그아웃 — 가로 배치 */}
            <div style={{ display:'flex', flexDirection:'row', gap:6 }}>
              <button onClick={onToggleDark} style={{
                flex:1, padding:'6px 4px', borderRadius:'10px', border:'none',
                color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(30,50,100,0.65)',
                cursor:'pointer', fontSize:'11px', fontWeight:'500',
                background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(100,120,200,0.10)',
                whiteSpace:'nowrap', textAlign:'center',
              }}>{isDark ? '☀️ 라이트' : '🌙 다크'}</button>
              <button onClick={onLogout} style={{
                flex:1, padding:'6px 4px', borderRadius:'10px',
                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(100,120,200,0.18)',
                color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(30,50,100,0.65)',
                cursor:'pointer', fontSize:'11px', fontWeight:'500',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(100,120,200,0.06)',
                whiteSpace:'nowrap', textAlign:'center',
              }}>로그아웃</button>
            </div>
          </div>
        )}

        {/* 맞춤 믹스 진입 (펼침) */}
        {!isCollapsed && (
          <div style={{ padding: '12px 12px 0' }}>
            <button onClick={onMixPage} style={{
              width: '100%', padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
              border: 'none', display: 'flex', alignItems: 'center', gap: 10,
              background: activeScreen === 'mix'
                ? 'linear-gradient(135deg,#7C5CFF,#FF4D8D)'
                : (isDark ? 'rgba(124,92,255,0.16)' : 'rgba(124,92,255,0.10)'),
              color: activeScreen === 'mix' ? '#fff' : (isDark ? 'rgba(200,200,255,0.85)' : 'rgba(60,40,140,0.85)'),
              fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 16 }}>🎚️</span>
              <span style={{ flex: 1, textAlign: 'left' }}>맞춤 믹스</span>
              <span style={{ fontSize: 11, opacity: 0.8 }}>AI ✨</span>
            </button>
          </div>
        )}

        {/* 히스토리 + 앨범 목록 */}
        <div className="sidebar-scroll" style={{ flex: 1, overflowY: 'auto', padding: isCollapsed ? '12px 0' : '0' }}>

          {/* 접힘 상태: 아이콘 메뉴 (음표=앨범, 하트=좋아요) */}
          {isCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingTop: 4 }}>
              {/* 홈 */}
              <button onClick={onLogoClick} title="홈"
                style={{ width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: isDark?'rgba(255,255,255,0.06)':'rgba(100,120,200,0.08)', color: sc,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.14)':'rgba(100,120,200,0.16)'}
                onMouseLeave={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.06)':'rgba(100,120,200,0.08)'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              </button>
              {/* 믹스 = 맞춤 믹스 */}
              <button onClick={onMixPage} title="맞춤 믹스"
                style={{ width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: isDark?'rgba(124,92,255,0.16)':'rgba(124,92,255,0.10)', color: '#7C5CFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(124,92,255,0.26)'}
                onMouseLeave={e=>e.currentTarget.style.background=isDark?'rgba(124,92,255,0.16)':'rgba(124,92,255,0.10)'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="9" width="3" height="11" rx="1"/><rect x="10.5" y="4" width="3" height="16" rx="1"/><rect x="17" y="13" width="3" height="7" rx="1"/></svg>
              </button>
              {/* 음표 = 내 앨범 (앨범 있으면 첫 앨범 재생, 없으면 메인) */}
              <button onClick={onAlbumClick} title="내 앨범"
                style={{ width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: isDark?'rgba(255,255,255,0.06)':'rgba(100,120,200,0.08)', color: sc,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.14)':'rgba(100,120,200,0.16)'}
                onMouseLeave={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.06)':'rgba(100,120,200,0.08)'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
              </button>
              {/* 하트 = 좋아요 목록 (펼치면서 좋아요로 스크롤) */}
              <button onClick={onLikedClick} title="좋아요"
                style={{ width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: isDark?'rgba(255,80,120,0.12)':'rgba(255,80,120,0.10)', color: '#ff4d6d',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,80,120,0.22)'}
                onMouseLeave={e=>e.currentTarget.style.background=isDark?'rgba(255,80,120,0.12)':'rgba(255,80,120,0.10)'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
            </div>
          )}

          {/* 히스토리 섹션 (위쪽 절반) */}
          {!isCollapsed && (
            <div style={{ padding: '16px 12px', borderBottom: '1px solid rgba(100,120,200,0.12)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px', padding:'0 8px', gap:6 }}>
                <p style={{ fontSize: '11px', color: sc, letterSpacing: '1px', textTransform: 'uppercase', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  최근 히스토리
                </p>
                <button onClick={onHistoryClick} style={{ background:'none', border:`1px solid ${dc}`, borderRadius:'8px', color:sc, cursor:'pointer', fontSize:'10px', padding:'2px 8px', flexShrink:0, whiteSpace:'nowrap' }}>
                  전체보기
                </button>
              </div>
              {historyList.length === 0 ? (
                <div style={{ textAlign:'center', padding:'16px 0' }}>
                  <p style={{ fontSize:11, color:sc }}>아직 검색 기록이 없어요</p>
                </div>
              ) : historyList.slice(0, 4).map((h, i) => (
                <div key={i} onClick={onHistoryClick} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, marginBottom:4, cursor:'pointer', background:isDark?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.65)', border:isDark?'1px solid rgba(255,255,255,0.12)':'1px solid rgba(255,255,255,0.85)' }}
                  className={hoverBtn}>
                  <span style={{ fontSize:12 }}>🎵</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:11, color:textColor, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {h.freeText || h.text}
                    </p>
                    <p style={{ fontSize:10, color:subTextColor, marginTop:1 }}>
                      {h.emotion} · {h.timestamp?.toDate ? h.timestamp.toDate().toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit'}) : h.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 좋아요 섹션 */}
          {!isCollapsed && (
            <div id="sidebar-likes" style={{ padding: '16px 12px', borderBottom: `1px solid ${dc}` }}>
              {/* 1행: 제목 + 곡 수 */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px', padding:'0 8px' }}>
                <p onClick={onLikedPage} style={{ fontSize:'11px', color:sc, letterSpacing:'1px', textTransform:'uppercase', cursor:'pointer', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  ❤️ 좋아요
                </p>
                <span style={{ fontSize:'10px', color:sc, flexShrink:0, whiteSpace:'nowrap' }}>{likedSongs.length}곡</span>
              </div>
              {/* 2행: 전체보기 / 전체재생 버튼 */}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:'10px', padding:'0 8px' }}>
                <button
                  onClick={onLikedPage}
                  style={{
                    flex:1,
                    background: isDark?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.65)',
                    border: isDark?'1px solid rgba(255,255,255,0.12)':'1px solid rgba(255,255,255,0.85)',
                    borderRadius:8, padding:'4px 8px', cursor:'pointer',
                    fontSize:10, color: isDark?'rgba(255,255,255,0.65)':'rgba(30,50,100,0.65)',
                    whiteSpace:'nowrap', textAlign:'center',
                  }}
                >전체보기</button>
                {likedSongs.length > 0 && (
                  <button
                    onClick={() => onPlay(likedSongs[0], likedSongs)}
                    style={{
                      flex:1,
                      background: isDark?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.65)',
                      border: isDark?'1px solid rgba(255,255,255,0.12)':'1px solid rgba(255,255,255,0.85)',
                      borderRadius:8, padding:'4px 8px', cursor:'pointer',
                      fontSize:10, color: isDark?'rgba(255,255,255,0.65)':'rgba(30,50,100,0.65)',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:4,
                      whiteSpace:'nowrap',
                    }}
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    전체재생
                  </button>
                )}
              </div>
              {likedSongs.length === 0 ? (
                <div style={{ textAlign:'center', padding:'12px 0' }}>
                  <p style={{ fontSize:11, color:sc }}>좋아요한 곡이 없어요</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                  {likedSongs.slice(0, 5).map((song, i) => (
                    <div key={i}
                      onClick={() => onPlay(likedSongs[i], likedSongs)}
                      style={{
                        display:'flex', alignItems:'center', gap:8,
                        padding:'8px 10px', borderRadius:10, cursor:'pointer',
                        background: isDark?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.65)',
                        border: isDark?'1px solid rgba(255,255,255,0.12)':'1px solid rgba(255,255,255,0.85)',
                        transition:'all 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark?'rgba(255,255,255,0.13)':'rgba(255,255,255,0.90)'}
                      onMouseLeave={e => e.currentTarget.style.background = isDark?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.65)'}
                    >
                      <span style={{ fontSize:12, flexShrink:0 }}>🎵</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:11, color:textColor, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{song.title}</p>
                        <p style={{ fontSize:10, color:subTextColor, marginTop:1 }}>{song.artist}</p>
                      </div>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"
                        style={{ color: isDark?'rgba(255,255,255,0.22)':'rgba(30,50,100,0.22)', flexShrink:0 }}>
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  ))}
                  {likedSongs.length > 5 && (
                    <p style={{ fontSize:10, color:sc, textAlign:'center', padding:'4px 0' }}>+{likedSongs.length - 5}곡 더</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 앨범 섹션 (아래쪽 절반) */}
          <div id="sidebar-albums" style={{ padding: isCollapsed ? '0' : '16px 12px' }}>
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 8px', gap: 6 }}>
              <p onClick={onAlbumPage} style={{ fontSize: '11px', color: sc, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                내 앨범
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <button onClick={onAlbumPage} style={{
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)',
                  border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.85)',
                  borderRadius: '8px', color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(30,50,100,0.65)',
                  cursor: 'pointer', fontSize: '10px', padding: '2px 8px', whiteSpace: 'nowrap',
                }}>전체보기</button>
                <button onClick={() => setShowCreateModal(true)} style={{
                  background: isDark ? 'none' : 'rgba(100,120,200,0.10)',
                  border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(100,120,200,0.30)',
                  borderRadius: '8px',
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(30,50,120,0.70)',
                  cursor: 'pointer', fontSize: '11px', padding: '2px 8px',
                  fontWeight: '500', whiteSpace: 'nowrap',
                }}>+ 새 앨범</button>
              </div>
            </div>
          )}

          {isCollapsed ? null : albums?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎵</div>
              <p style={{ fontSize: '12px', color: subTextColor }}>
                + 새 앨범 버튼으로<br />앨범을 만들어요
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {albums?.map((album, ai) => (
                <div key={ai}>
                  {/* 앨범 헤더 */}
                  <div
                    onClick={() => setActiveAlbum(activeAlbum === ai ? null : ai)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 10px', borderRadius: '10px', cursor: 'pointer',
                      ...glass(activeAlbum === ai ? 0.14 : 0.06),
                      transition: 'all 0.2s', marginBottom: '2px',
                    }}
                  >
                    {/* 앨범 첫 글자 아이콘 */}
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `hsl(${ai * 60 % 360}, 45%, 35%)`,
                      fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.9)',
                    }}>
                      {album.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: '500', color: tc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {album.name}
                      </p>
                      <p style={{ fontSize: '11px', color: subTextColor }}>{album.songs?.length || 0}곡</p>
                    </div>
                    {/* 앨범 전체 재생 버튼 */}
                    {album.songs?.length > 0 && (
                      <button
                        onClick={e => { e.stopPropagation(); onPlay(album.songs[0], album.songs) }}
                        title="앨범 전체 재생"
                        style={{
                          background: 'rgba(255,0,51,0.75)', border: 'none', borderRadius: '50%',
                          width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,0,51,1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,0,51,0.75)'}
                      >
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                    )}
                    <span style={{ fontSize: '10px', color: sc }}>
                      {activeAlbum === ai ? '▲' : '▼'}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteAlbum(ai) }} style={{
                      background: 'none', border: 'none', color: sc,
                      cursor: 'pointer', fontSize: '12px', padding: '2px', lineHeight: 1
                    }}>✕</button>
                  </div>

                  {/* 앨범 안 곡 목록 */}
                  {activeAlbum === ai && (
                    <div style={{ paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' }}>
                      {album.songs?.length === 0 ? (
                        <p style={{ fontSize: '11px', color: sc, padding: '6px 10px' }}>
                          아직 곡이 없어요
                        </p>
                      ) : album.songs?.map((song, si) => (
                        <div key={si} className={hoverRow} style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}>
                          <div onClick={() => onPlay(song)} style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '11px', color: tc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {song.title}
                            </p>
                            <p style={{ fontSize: '10px', color: sc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {song.artist}
                            </p>
                          </div>
                          <button onClick={() => onRemoveFromAlbum(ai, si)} style={{
                            background: 'none', border: 'none', color: sc,
                            cursor: 'pointer', fontSize: '11px', padding: '2px', lineHeight: 1, flexShrink: 0
                          }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  )
}