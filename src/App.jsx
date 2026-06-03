import { lazy, Suspense, useState, useEffect } from 'react'
import { auth, db } from './lib/firebase'
import { api, apiErrorMessage } from './lib/api'
import { appBackground, getTheme, getDarkTheme } from './styles/theme'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection, addDoc, getDocs, serverTimestamp,
  doc, setDoc, deleteDoc, updateDoc, getDoc, increment
} from 'firebase/firestore'
import Auth from './components/Auth'
import Sidebar from './components/Sidebar'

const MainScreen = lazy(() => import('./components/MainScreen'))
const Recommendations = lazy(() => import('./components/Recommendations'))
const History = lazy(() => import('./components/History'))
const MusicPlayer = lazy(() => import('./components/MusicPlayer'))
const TasteSelect = lazy(() => import('./components/TasteSelect'))
const ArtistStage = lazy(() => import('./components/ArtistStage'))
const Search = lazy(() => import('./components/Search'))
const AlbumPage = lazy(() => import('./components/Albumpage'))
const LikedPage = lazy(() => import('./components/Likedpage'))
const MixPage = lazy(() => import('./components/MixPage'))

function ScreenFallback({ isDark = false }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: isDark ? '#c0c8f0' : '#1a2a4a',
      fontSize: 14,
    }}>
      불러오는 중...
    </div>
  )
}

export default function App() {
  const [user, setUser]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [screen, setScreen]           = useState('main')
  const [userInput, setUserInput]     = useState(null)
  const [cachedSongs, setCachedSongs] = useState([])
  const [albums, setAlbums]           = useState([])
  const [dominantTheme, setDominantTheme] = useState(null)
  const [emotion, setEmotion]         = useState('default')
  const [historyList, setHistoryList] = useState([])
  const [isDark, setIsDark]           = useState(false)
  const [likedSongs, setLikedSongs]   = useState([])
  const [emotionStats, setEmotionStats] = useState(null) // Firestore 감정 집계
  const [tasteGenres, setTasteGenres]   = useState([])   // 취향: 장르
  const [tasteArtists, setTasteArtists] = useState([])   // 취향: 아티스트

  // ── 전역 미니 플레이어 state ──────────────────────────
  const [currentSong, setCurrentSong]   = useState(null)
  const [currentSongs, setCurrentSongs] = useState([])
  const [videoId, setVideoId]           = useState(null)
  const [playerNotice, setPlayerNotice] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile]         = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // ── 화면 폭 감지 (모바일 = 768px 이하) ──────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 화면 전환 시 모바일 사이드바 자동 닫기
  useEffect(() => { setMobileSidebarOpen(false) }, [screen])

  // ── 로그인 감지 + 데이터 불러오기 ───────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)

      if (firebaseUser) {
        try {
          // 히스토리
          const histSnap = await getDocs(collection(db, 'users', firebaseUser.uid, 'history'))
          const histData = histSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
          setHistoryList(histData)

          // 좋아요 목록
          const likesSnap = await getDocs(collection(db, 'users', firebaseUser.uid, 'likes'))
          setLikedSongs(likesSnap.docs.map(d => ({ id: d.id, ...d.data() })))

          // 앨범 (Firestore 영속화)
          const albumsSnap = await getDocs(collection(db, 'users', firebaseUser.uid, 'albums'))
          const albumsData = albumsSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
          setAlbums(albumsData)

          // 취향 (Firestore 영속화) — users/{uid}/preferences/taste
          const tasteSnap = await getDoc(doc(db, 'users', firebaseUser.uid, 'preferences', 'taste'))
          if (tasteSnap.exists()) {
            const t = tasteSnap.data()
            setTasteGenres(Array.isArray(t.genres) ? t.genres : [])
            setTasteArtists(Array.isArray(t.artists) ? t.artists : [])
          }
        } catch (e) {
          console.error('데이터 불러오기 실패:', e)
        }
      } else {
        setAlbums([])
        setLikedSongs([])
        setTasteGenres([])
        setTasteArtists([])
      }
    })

    // 감정 통계 (로그인 불필요, 전체 유저 집계)
    getDoc(doc(db, 'stats', 'emotionCounts'))
      .then(snap => { if (snap.exists()) setEmotionStats(snap.data()) })
      .catch(() => {})

    return unsubscribe
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    setUser(null)
    setScreen('main')
    setAlbums([])
    setLikedSongs([])
    setTasteGenres([])
    setTasteArtists([])
  }

  // ── 취향 저장 (Firestore 영속화) ───────────────────────
  const handleSaveTaste = async (genres, artists) => {
    // 낙관적 업데이트
    setTasteGenres(genres)
    setTasteArtists(artists)
    if (user) {
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'preferences', 'taste'),
          { genres, artists, updatedAt: serverTimestamp() },
          { merge: true }
        )
      } catch (e) {
        console.error('취향 저장 실패:', e)
      }
    }
  }
  const handleToggleLike = async (song) => {
    const songKey = `${song.title}_${song.artist}`.replace(/\//g, '-').slice(0, 100)
    const isLiked = likedSongs.some(s => s.title === song.title && s.artist === song.artist)

    // 낙관적 업데이트
    setLikedSongs(prev =>
      isLiked
        ? prev.filter(s => !(s.title === song.title && s.artist === song.artist))
        : [...prev, { ...song, id: songKey }]
    )

    if (user) {
      try {
        if (isLiked) {
          await deleteDoc(doc(db, 'users', user.uid, 'likes', songKey))
        } else {
          await setDoc(doc(db, 'users', user.uid, 'likes', songKey), {
            title: song.title || '',
            artist: song.artist || '',
            youtubeQuery: song.youtubeQuery || '',
            videoId: song.videoId || '',
            likedAt: serverTimestamp(),
          })
        }
      } catch (e) {
        console.error('좋아요 저장 실패:', e)
      }
    }
  }

  // ── 앨범 핸들러 (Firestore 영속화) ───────────────────────
  const handleCreateAlbum = async (name) => {
    if (user) {
      try {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'albums'), {
          name, songs: [], createdAt: serverTimestamp(),
        })
        setAlbums(prev => [...prev, { id: docRef.id, name, songs: [] }])
      } catch (e) {
        console.error('앨범 생성 실패:', e)
        setAlbums(prev => [...prev, { name, songs: [] }])
      }
    } else {
      setAlbums(prev => [...prev, { name, songs: [] }])
    }
  }

  const handleDeleteAlbum = async (albumIndex) => {
    const album = albums[albumIndex]
    if (user && album?.id) {
      try { await deleteDoc(doc(db, 'users', user.uid, 'albums', album.id)) } catch (e) {}
    }
    setAlbums(prev => prev.filter((_, i) => i !== albumIndex))
  }

  const handleAddToAlbum = async (albumIndex, song) => {
    const album = albums[albumIndex]
    if (album.songs.find(s => s.title === song.title)) return
    const updatedSongs = [...album.songs, {
      title: song.title || '',
      artist: song.artist || '',
      youtubeQuery: song.youtubeQuery || '',
      videoId: song.videoId || '',
      mood: song.mood || '',
    }]
    if (user && album?.id) {
      try { await updateDoc(doc(db, 'users', user.uid, 'albums', album.id), { songs: updatedSongs }) } catch (e) {}
    }
    setAlbums(prev => prev.map((a, i) => i !== albumIndex ? a : { ...a, songs: updatedSongs }))
  }

  const handleRemoveFromAlbum = async (albumIndex, songIndex) => {
    const album = albums[albumIndex]
    const updatedSongs = album.songs.filter((_, si) => si !== songIndex)
    if (user && album?.id) {
      try { await updateDoc(doc(db, 'users', user.uid, 'albums', album.id), { songs: updatedSongs }) } catch (e) {}
    }
    setAlbums(prev => prev.map((a, i) => i !== albumIndex ? a : { ...a, songs: updatedSongs }))
  }

  const handleAnalyzeComplete = (text, emotionResult) => {
    setUserInput({ freeText: text, emotion: emotionResult || 'default' })
    setEmotion(emotionResult || 'default')
    setCachedSongs([])
    setScreen('recommendations')
  }

  // ── 히스토리 저장 + 감정 통계 업데이트 ─────────────────────
  const handleSongsLoaded = async (result) => {
    setCachedSongs(result)
    if (user) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'history'), {
          text: userInput?.freeText?.slice(0, 20) + (userInput?.freeText?.length > 20 ? '...' : '') || '',
          freeText: userInput?.freeText || '',
          emotion: result?.emotions?.[0]?.name || emotion,
          songs: result?.songs || [],
          emotions: result?.emotions || [],
          timestamp: serverTimestamp(),
        })

        // 감정 통계 카운터 업데이트
        const dominant = result?.emotions?.[0]?.name
        if (dominant) {
          await setDoc(
            doc(db, 'stats', 'emotionCounts'),
            { [dominant]: increment(1) },
            { merge: true }
          )
          setEmotionStats(prev => ({ ...(prev || {}), [dominant]: (prev?.[dominant] || 0) + 1 }))
        }

        // 히스토리 갱신
        const snapshot = await getDocs(collection(db, 'users', user.uid, 'history'))
        const data = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
        setHistoryList(data)
      } catch (e) {
        console.error('히스토리 저장 실패:', e)
      }
    }
  }

  // ── 전역 노래 재생 핸들러 ─────────────────────────────
  // videoId 캐싱으로 동일 곡 재검색(search 100 unit) 방지
  const handlePlaySong = async (song, songs = []) => {
    setCurrentSong(song)
    setCurrentSongs(songs.length > 0 ? songs : [song])
    setPlayerNotice('')

    // 1) 곡 객체에 videoId가 이미 있으면 검색 불필요
    if (song.videoId) {
      setVideoId(song.videoId)
      return
    }

    const query = song.youtubeQuery || `${song.title} ${song.artist}`
    const cacheKey = `yt:${query.toLowerCase().trim()}`

    // 2) localStorage 캐시 확인 (이전에 검색한 적 있는 곡)
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        setVideoId(cached)
        return
      }
    } catch (_) { /* localStorage 불가 환경이면 무시하고 검색 */ }

    // 3) 캐시에 없으면 search 호출 후 결과를 캐시에 저장
    try {
      const data = await api.videoId(query)
      const foundId = data.videoId
      if (foundId) {
        setVideoId(foundId)
        try { localStorage.setItem(cacheKey, foundId) } catch (_) {}
      } else {
        setVideoId(null)
        setPlayerNotice('재생할 YouTube 영상을 찾지 못했어요. 다른 곡을 선택해 주세요.')
      }
    } catch (err) {
      console.error('유튜브 검색 실패:', err)
      setVideoId(null)
      setPlayerNotice(apiErrorMessage(err, '재생 영상을 불러오지 못했어요. 잠시 후 다시 시도해주세요.'))
    }
  }

  const handleSongChange = (song) => handlePlaySong(song, currentSongs)

  // ── 미니 플레이어 정지 (MV 팝업 등에서 사용) ──────────────
  const handleStopPlayer = () => {
    setVideoId(null)
    setCurrentSong(null)
    setCurrentSongs([])
  }

  // ── 다음에 재생 (현재 곡 바로 뒤에 큐 삽입) ──────────────
  const handleAddToQueue = (song) => {
    // 재생 중이 아니면 바로 재생
    if (!currentSong || currentSongs.length === 0) {
      handlePlaySong(song, [song])
      return
    }
    setCurrentSongs(prev => {
      // 이미 큐에 있으면 중복 추가 안 함
      if (prev.some(s => s.title === song.title && s.artist === song.artist)) return prev
      const curIdx = prev.findIndex(s => s.title === currentSong.title && s.artist === currentSong.artist)
      const insertAt = curIdx >= 0 ? curIdx + 1 : prev.length
      const next = [...prev]
      next.splice(insertAt, 0, song)
      return next
    })
  }

  // ── 큐 순서 변경 (드래그앤드롭) ──────────────────────────
  const handleReorderQueue = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return
    setCurrentSongs(prev => {
      if (fromIdx < 0 || toIdx < 0 || fromIdx >= prev.length || toIdx >= prev.length) return prev
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }

  // ── 비슷한 곡 연속재생 (큐가 끝나면 Gemini 자동 추천) ────────
  const handleQueueEnd = async (song) => {
    try {
      const recommended = await api.similarSong(song)
      handlePlaySong(recommended)
    } catch (e) {
      console.error('비슷한 곡 추천 실패:', e)
      setPlayerNotice(apiErrorMessage(e, '다음 곡을 자동 추천하지 못했어요. 직접 곡을 선택해 주세요.'))
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, #e8f4ff 0%, #ede8ff 100%)' }}>
      <div style={{ fontSize: '32px' }}>🎵</div>
    </div>
  )

  if (!user) return <Auth onLogin={setUser} isDark={isDark} onToggleDark={() => setIsDark(d => !d)} />

  const currentTheme = isDark ? getDarkTheme(emotion) : getTheme(emotion)

  return (
    <div style={{ ...appBackground(currentTheme, isDark), display: 'flex', minHeight: '100vh', position: 'relative' }}>

      <Sidebar
        albums={albums}
        historyList={historyList}
        likedSongs={likedSongs}
        onCreateAlbum={handleCreateAlbum}
        onDeleteAlbum={handleDeleteAlbum}
        onRemoveFromAlbum={handleRemoveFromAlbum}
        user={user}
        onLogout={handleLogout}
        onPlay={handlePlaySong}
        dominantTheme={dominantTheme}
        onHistoryClick={() => setScreen('history')}
        onLogoClick={() => setScreen('main')}
        onTasteClick={() => setScreen('taste')}
        onArtistClick={() => setScreen('artist')}
        onSearchClick={() => setScreen('search')}
        onAlbumPage={() => setScreen('album')}
        onLikedPage={() => setScreen('liked')}
        onMixPage={() => setScreen('mix')}
        activeScreen={screen}
        onCollapseChange={setSidebarCollapsed}
        isDark={isDark}
        onToggleDark={() => setIsDark(d => !d)}
        isMobile={isMobile}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div style={{ flex: 1, marginLeft: isMobile ? '0' : (sidebarCollapsed ? '88px' : '272px'), transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)', minWidth: 0 }}>

        {/* 모바일 햄버거 버튼 (사이드바 닫혀 있을 때만) */}
        {isMobile && !mobileSidebarOpen && (
          <button
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="메뉴 열기"
            style={{
              position: 'fixed', top: 14, left: 14, zIndex: 30,
              width: 42, height: 42, borderRadius: 12, cursor: 'pointer',
              border: isDark ? '1px solid rgba(140,160,255,0.28)' : '1px solid rgba(255,255,255,0.85)',
              background: isDark ? 'rgba(20,30,100,0.78)' : 'rgba(255,255,255,0.80)',
              backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              color: isDark ? '#c0c8f0' : '#1a2a4a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(100,120,200,0.2)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>
          </button>
        )}

        <Suspense fallback={<ScreenFallback isDark={isDark} />}>
          {screen === 'main' && (
            <MainScreen
              emotion={emotion}
              onAnalyzeComplete={handleAnalyzeComplete}
              onEmotionSelect={setEmotion}
              onPlaySong={handlePlaySong}
              onStopPlayer={handleStopPlayer}
              isDark={isDark}
              emotionStats={emotionStats}
            />
          )}

          {screen === 'recommendations' && (
            <Recommendations
              userInput={userInput}
              user={user}
              cachedSongs={cachedSongs}
              onSongsLoaded={handleSongsLoaded}
              onBack={() => {
                setCachedSongs([])
                setDominantTheme(null)
                setScreen('main')
              }}
              onHistory={() => setScreen('history')}
              albums={albums}
              onAddToAlbum={handleAddToAlbum}
              onThemeChange={(theme) => setDominantTheme(theme)}
              onEmotionChange={setEmotion}
              onPlaySong={handlePlaySong}
              likedSongs={likedSongs}
              onToggleLike={handleToggleLike}
              isDark={isDark}
            />
          )}

          {screen === 'history' && (
            <History
              user={user}
              historyList={historyList}
              emotion={emotion}
              onBack={() => cachedSongs.length > 0 ? setScreen('recommendations') : setScreen('main')}
              onPlaySong={handlePlaySong}
              isDark={isDark}
              likedSongs={likedSongs}
              onToggleLike={handleToggleLike}
              albums={albums}
              onAddToAlbum={handleAddToAlbum}
              onAddToQueue={handleAddToQueue}
            />
          )}

          {screen === 'taste' && (
            <TasteSelect
              isDark={isDark}
              emotion={emotion}
              onBack={() => setScreen('main')}
              onPlaySong={handlePlaySong}
              initialGenres={tasteGenres}
              initialArtists={tasteArtists}
              onSaveTaste={handleSaveTaste}
            />
          )}

          {screen === 'artist' && (
            <ArtistStage
              isDark={isDark}
              emotion={emotion}
              onBack={() => setScreen('main')}
              onPlaySong={handlePlaySong}
            />
          )}

          {screen === 'search' && (
            <Search
              isDark={isDark}
              emotion={emotion}
              onBack={() => setScreen('main')}
              onPlaySong={handlePlaySong}
              likedSongs={likedSongs}
              onToggleLike={handleToggleLike}
            />
          )}

          {screen === 'album' && (
            <AlbumPage
              albums={albums}
              isDark={isDark}
              emotion={emotion}
              onBack={() => setScreen('main')}
              onPlaySong={handlePlaySong}
              onCreateAlbum={handleCreateAlbum}
              onDeleteAlbum={handleDeleteAlbum}
              onRemoveFromAlbum={handleRemoveFromAlbum}
            />
          )}

          {screen === 'liked' && (
            <LikedPage
              likedSongs={likedSongs}
              isDark={isDark}
              emotion={emotion}
              onBack={() => setScreen('main')}
              onPlaySong={handlePlaySong}
              onToggleLike={handleToggleLike}
              onAddToQueue={handleAddToQueue}
            />
          )}

          {screen === 'mix' && (
            <MixPage
              likedSongs={likedSongs}
              albums={albums}
              historyList={historyList}
              isDark={isDark}
              emotion={emotion}
              onBack={() => setScreen('main')}
              onPlaySong={handlePlaySong}
              onAddToQueue={handleAddToQueue}
            />
          )}
        </Suspense>
      </div>

      {playerNotice && (
        <div
          role="status"
          style={{
            position: 'fixed',
            left: isMobile ? 16 : (sidebarCollapsed ? 112 : 296),
            right: 16,
            bottom: videoId ? 116 : 24,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 14px',
            borderRadius: 14,
            border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(120,140,210,0.22)',
            background: isDark ? 'rgba(17,24,55,0.88)' : 'rgba(255,255,255,0.88)',
            color: isDark ? '#dbe2ff' : '#1a2a4a',
            boxShadow: '0 10px 30px rgba(35,45,90,0.20)',
            backdropFilter: 'blur(18px) saturate(170%)',
            WebkitBackdropFilter: 'blur(18px) saturate(170%)',
            fontSize: 13,
          }}
        >
          <span>{playerNotice}</span>
          <button
            onClick={() => setPlayerNotice('')}
            aria-label="알림 닫기"
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              border: 'none',
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(30,50,100,0.08)',
              color: 'inherit',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            x
          </button>
        </div>
      )}

      {/* ── 전역 미니 플레이어 ── */}
      {videoId && currentSong && (
        <Suspense fallback={null}>
          <MusicPlayer
            song={currentSong}
            videoId={videoId}
            songs={currentSongs}
            onClose={handleStopPlayer}
            onSongChange={handleSongChange}
            onReorderQueue={handleReorderQueue}
            onQueueEnd={handleQueueEnd}
            likedSongs={likedSongs}
            onToggleLike={handleToggleLike}
            isDark={isDark}
            sidebarCollapsed={sidebarCollapsed}
            isMobile={isMobile}
          />
        </Suspense>
      )}
    </div>
  )
}
