import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import MusicPlayer from './MusicPlayer'

function HistoryItem({ item, onPlay }) {
  const [expanded, setExpanded] = useState(false)

  const displaySongs = expanded ? item.songs : item.songs?.slice(0, 3)

  return (
    <div style={{
      background: '#1a1a1a', borderRadius: '12px',
      padding: '16px', marginBottom: '12px',
      border: '0.5px solid #2a2a2a'
    }}>
      {/* 검색어 & 날짜 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🎵</span>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>{item.freeText}</p>
        </div>
        <p style={{ fontSize: '11px', color: '#555', flexShrink: 0 }}>
          {item.timestamp?.toDate().toLocaleDateString('ko-KR')}
        </p>
      </div>

      {/* 감정 바 */}
      {item.emotions?.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            height: '4px', borderRadius: '2px', marginBottom: '6px',
            background: `linear-gradient(to right, ${item.emotions.map((e, i) => {
              const start = item.emotions.slice(0, i).reduce((acc, cur) => acc + cur.percent, 0)
              const end = start + e.percent
              return `${e.color} ${start}%, ${e.color} ${end}%`
            }).join(', ')})`,
          }} />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {item.emotions.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: e.color }} />
                <span style={{ fontSize: '11px', color: '#888' }}>{e.name} {e.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 노래 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {displaySongs?.map((song, i) => (
          <div
            key={i}
            onClick={() => onPlay(song)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 8px', borderRadius: '8px', cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: '#FF0033', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0
            }}>
              <div style={{
                width: 0, height: 0, borderStyle: 'solid',
                borderWidth: '4px 0 4px 8px',
                borderColor: 'transparent transparent transparent #fff',
                marginLeft: '2px'
              }} />
            </div>
            <p style={{ fontSize: '13px', color: '#ccc' }}>
              {song.title} <span style={{ color: '#666' }}>— {song.artist}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 더보기 / 접기 버튼 */}
      {item.songs?.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: '10px', background: 'none',
            border: '0.5px solid #333', borderRadius: '20px',
            color: '#888', fontSize: '12px', cursor: 'pointer',
            padding: '6px 16px', width: '100%'
          }}
        >
          {expanded ? '접기 ↑' : `+${item.songs.length - 3}곡 더 보기 ↓`}
        </button>
      )}
    </div>
  )
}

export default function History({ user, onBack }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSong, setCurrentSong] = useState(null)
  const [videoId, setVideoId] = useState(null)
  const [currentSongs, setCurrentSongs] = useState([])

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const q = query(
        collection(db, 'users', user.uid, 'history'),
        orderBy('timestamp', 'desc')
      )
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setHistory(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = async (song, songs) => {
    setCurrentSong(song)
    setCurrentSongs(songs || [])
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(song.youtubeQuery)}&type=video&videoCategoryId=10&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
      )
      const data = await res.json()
      if (data.items && data.items.length > 0) {
        setVideoId(data.items[0].id.videoId)
      }
    } catch (err) {
      console.error('유튜브 검색 실패:', err)
    }
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0f0f0f'
    }}>
      <p style={{ color: '#888' }}>히스토리 불러오는 중...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', paddingBottom: videoId ? '140px' : '40px' }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '16px 20px', borderBottom: '0.5px solid #2a2a2a',
        position: 'sticky', top: 0, background: '#0f0f0f', zIndex: 10
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: '#fff',
          fontSize: '20px', cursor: 'pointer'
        }}>←</button>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '500' }}>내 취향 히스토리</h2>
          <p style={{ fontSize: '12px', color: '#888' }}>{user?.displayName || user?.email}님의 기록 {history.length}개</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '80px 20px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
          <p style={{ color: '#888', fontSize: '14px' }}>아직 기록이 없어요</p>
        </div>
      ) : (
        <div style={{ padding: '20px' }}>
          {history.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              onPlay={(song) => handlePlay(song, item.songs)}
            />
          ))}
        </div>
      )}

      {/* 뮤직 플레이어 */}
      {videoId && (
        <MusicPlayer
          song={currentSong}
          videoId={videoId}
          songs={currentSongs}
          onClose={() => { setVideoId(null); setCurrentSong(null) }}
          onSongChange={(song) => handlePlay(song, currentSongs)}
        />
      )}
    </div>
  )
}