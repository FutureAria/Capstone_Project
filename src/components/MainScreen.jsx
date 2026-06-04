import { useState, useEffect, useRef } from 'react'
import { glass, glassDark, getTheme, getDarkTheme, getComplement, getDarkComplement, GLOBAL_CSS } from '../styles/theme'
import { api, apiErrorMessage } from '../lib/api'

// ── 감정별 메타데이터 (실시간 통계용) ─────────────────────────────
const EMOTION_META = {
  기쁨: { color: '#e0a030', icon: '☀️' },
  설렘: { color: '#e06090', icon: '💗' },
  평온: { color: '#30b070', icon: '🍃' },
  슬픔: { color: '#6090d0', icon: '🌙' },
  분노: { color: '#e05040', icon: '🔥' },
  불안: { color: '#9060d0', icon: '💫' },
  집중: { color: '#4090e0', icon: '🎯' },
  피로: { color: '#a09080', icon: '😴' },
}

const NOTICE = [
  { type: 'NEW',  text: '아이유 새 앨범 \'에필로그\' 발매' },
  { type: 'HOT',  text: 'BTS 월드투어 기념 플레이리스트 공개' },
  { type: '공지', text: '감정 분석 AI 모델 v2.0 업데이트' },
]

// 더미 POPULAR (Firestore 통계 없을 때 fallback)
const POPULAR_FALLBACK = [
  { rank: 1, emotion: '설렘', count: '42.3k', color: '#e06090', icon: '💗' },
  { rank: 2, emotion: '평온', count: '38.1k', color: '#30b070', icon: '🍃' },
  { rank: 3, emotion: '기쁨', count: '31.7k', color: '#e0a030', icon: '☀️' },
  { rank: 4, emotion: '집중', count: '28.9k', color: '#4090e0', icon: '🎯' },
  { rank: 5, emotion: '슬픔', count: '22.4k', color: '#6090d0', icon: '🌙' },
]

const TODAY_STATS = [
  { emotion: '설렘', percent: 34, color: '#e06090', icon: '💗' },
  { emotion: '평온', percent: 28, color: '#30b070', icon: '🍃' },
  { emotion: '기쁨', percent: 20, color: '#e0a030', icon: '☀️' },
  { emotion: '슬픔', percent: 18, color: '#6090d0', icon: '🌙' },
]

const CHART_FALLBACK = [
  { title:'Whiplash',      artist:'aespa',        q:'aespa Whiplash official audio' },
  { title:'Magnetic',      artist:'ILLIT',        q:'ILLIT Magnetic official audio' },
  { title:'apt.',          artist:'ROSÉ',         q:'ROSÉ apt official audio' },
  { title:'Love Wins All', artist:'IU',           q:'IU Love Wins All official audio' },
  { title:'Sticky',        artist:'KISS OF LIFE', q:'KISS OF LIFE Sticky official audio' },
  { title:'Mantra',        artist:'JENNIE',       q:'JENNIE Mantra official audio' },
  { title:'Supernova',     artist:'aespa',        q:'aespa Supernova official audio' },
  { title:'Super Shy',     artist:'NewJeans',     q:'NewJeans Super Shy official audio' },
  { title:'밤편지',         artist:'IU',           q:'IU 밤편지 official audio' },
  { title:'Hype Boy',      artist:'NewJeans',     q:'NewJeans Hype Boy official audio' },
  { title:'Dynamite',      artist:'BTS',          q:'BTS Dynamite official audio' },
  { title:'OMG',           artist:'NewJeans',     q:'NewJeans OMG official audio' },
]

const NEW_FALLBACK = [
  { title:'HOME SWEET HOME', artist:'G-DRAGON',   q:'G-DRAGON HOME SWEET HOME official audio' },
  { title:'Whiplash',        artist:'aespa',       q:'aespa Whiplash official audio' },
  { title:'How Sweet',       artist:'NewJeans',    q:'NewJeans How Sweet official audio' },
  { title:'Mantra',          artist:'JENNIE',      q:'JENNIE Mantra official audio' },
  { title:'SPOT!',           artist:'ZICO',        q:'ZICO SPOT official audio' },
  { title:'Supernova',       artist:'aespa',       q:'aespa Supernova official audio' },
  { title:'Magnetic',        artist:'ILLIT',       q:'ILLIT Magnetic official audio' },
  { title:'Earthquake',      artist:'JISOO',       q:'JISOO Earthquake official audio' },
]

// ── 로딩 화면 (다크모드 지원) ───────────────────────────────────
function EmotionLoadingScreen({ text, isDark }) {
  const [dots, setDots] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 500)
    return () => clearInterval(t)
  }, [])

  const cardBg     = isDark ? 'rgba(15,22,80,0.92)' : 'rgba(255,255,255,0.82)'
  const cardBorder = isDark ? '1px solid rgba(140,160,255,0.30)' : '1px solid rgba(255,255,255,0.9)'
  const cardShadow = isDark
    ? '0 16px 48px rgba(0,0,40,0.65), inset 0 1px 0 rgba(180,200,255,0.18)'
    : '0 16px 48px rgba(100,120,200,0.18), inset 0 1px 0 rgba(255,255,255,1)'
  const titleColor = isDark ? '#c0c8f0' : '#1a2a4a'
  const subColor   = isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.45)'
  const boxBg      = isDark ? 'rgba(100,120,200,0.15)' : 'rgba(100,120,200,0.08)'
  const boxBorder  = isDark ? '1px solid rgba(140,160,255,0.25)' : '1px solid rgba(100,120,200,0.15)'
  const boxColor   = isDark ? 'rgba(180,190,255,0.60)' : 'rgba(20,40,90,0.65)'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: isDark ? 'rgba(0,0,20,0.78)' : 'rgba(200,215,255,0.55)', backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @keyframes brainPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
        @keyframes ripple{0%{transform:scale(0.8);opacity:0.6}100%{transform:scale(2.5);opacity:0}}
      `}</style>
      <div style={{ background: cardBg, backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)', border: cardBorder, boxShadow: cardShadow, borderRadius: 32, padding: '48px 64px', textAlign: 'center', maxWidth: 340 }}>
        <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 32px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1.5px solid ${isDark ? 'rgba(140,160,255,0.30)' : 'rgba(100,120,200,0.25)'}`, animation: `ripple 2.2s ${i * 0.7}s ease-out infinite` }} />
          ))}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: isDark ? 'rgba(100,120,200,0.15)' : 'rgba(100,120,200,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, animation: 'brainPulse 2s ease-in-out infinite' }}>🔍</div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: titleColor, marginBottom: 10 }}>
          감정을 분석하고 있어요{'.'.repeat(dots)}
        </div>
        {text && (
          <div style={{ background: boxBg, border: boxBorder, borderRadius: 12, padding: '10px 16px', margin: '12px 0 16px', fontSize: 13, color: boxColor, fontStyle: 'italic' }}>
            "{text.slice(0, 32)}{text.length > 32 ? '...' : ''}"
          </div>
        )}
        <div style={{ fontSize: 12, color: subColor }}>AI가 텍스트에서 감정을 읽고 있어요</div>
      </div>
    </div>
  )
}

function MusicLoadingScreen({ theme, isDark }) {
  const cardBg     = isDark ? 'rgba(15,22,80,0.92)' : 'rgba(255,255,255,0.82)'
  const cardBorder = isDark ? '1px solid rgba(140,160,255,0.30)' : '1px solid rgba(255,255,255,0.9)'
  const cardShadow = isDark
    ? '0 16px 48px rgba(0,0,40,0.65), inset 0 1px 0 rgba(180,200,255,0.18)'
    : '0 16px 48px rgba(100,120,200,0.18), inset 0 1px 0 rgba(255,255,255,1)'
  const titleColor = isDark ? '#c0c8f0' : '#1a2a4a'
  const subColor   = isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.5)'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: isDark ? 'rgba(0,0,20,0.78)' : 'rgba(200,215,255,0.55)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes musicBar{0%,100%{transform:scaleY(0.3);opacity:0.4}50%{transform:scaleY(1);opacity:1}}`}</style>
      <div style={{ background: cardBg, backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)', border: cardBorder, boxShadow: cardShadow, borderRadius: 32, padding: '44px 64px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, justifyContent: 'center', marginBottom: 28, height: 56 }}>
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ width: 6, borderRadius: 3, background: `linear-gradient(to top, ${theme.to}, ${theme.mid || theme.from})`, animation: `musicBar 0.9s ease-in-out ${i * 0.1}s infinite`, height: 56, transformOrigin: 'bottom' }} />
          ))}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: titleColor, marginBottom: 10 }}>음악을 찾고 있어요</div>
        <div style={{ fontSize: 13, color: subColor }}>감정에 맞는 곡을 큐레이션 중...</div>
      </div>
    </div>
  )
}

export default function MainScreen({ emotion = 'default', onAnalyzeComplete, onEmotionSelect, onPlaySong, onStopPlayer, isDark = false, emotionStats = null }) {
  const [inputText, setInputText]       = useState('')
  const [loadingType, setLoadingType]   = useState(null)
  const [noticeIdx, setNoticeIdx]       = useState(0)
  const [chartData, setChartData]       = useState([])
  const [chartLoading, setChartLoading] = useState(true)
  const [searchMode, setSearchMode]     = useState('emotion') // 'emotion' | 'search'
  const [searchQuery, setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [newSongs, setNewSongs]         = useState([])
  const [newSongsLoading, setNewSongsLoading] = useState(true)
  const [mvModal, setMvModal]           = useState(null)   // 뮤비 팝업 { videoId, title, artist }
  const [tasteGenres, setTasteGenres]     = useState([])
  const [tasteArtist, setTasteArtist]     = useState('')
  const [tasteResults, setTasteResults]   = useState([])
  const [tasteLoading, setTasteLoading]   = useState(false)
  const [tasteOpen, setTasteOpen]         = useState(false)
  const [apiNotice, setApiNotice]         = useState('')
  const textareaRef = useRef(null)

  const theme      = isDark ? getDarkTheme(emotion) : getTheme(emotion)
  const complement = isDark ? getDarkComplement(emotion) : getComplement(emotion)
  const G          = isDark ? glassDark : glass
  const tc         = theme.text || (isDark ? '#c0c8f0' : '#1a2a4a')
  const sc         = isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.50)'
  const trow       = isDark ? 'trow trow-dark' : 'trow trow-light'
  const gbtn       = isDark ? 'gbtn gbtn-dark' : 'gbtn gbtn-light'

  // ── 인기 감정 TOP 5: Firestore 실제 데이터 or 더미 ─────────────
  const popularData = emotionStats && Object.keys(emotionStats).length > 0
    ? Object.entries(emotionStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count], i) => ({
          rank: i + 1,
          emotion: name,
          count: count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count),
          color: EMOTION_META[name]?.color || '#8090d8',
          icon:  EMOTION_META[name]?.icon  || '🎵',
        }))
    : POPULAR_FALLBACK

  // ── 공지 배너 자동 교체 ─────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setNoticeIdx(i => (i + 1) % NOTICE.length), 3500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const data = await api.chart(10)
        const songs = data.songs || []

        // 10개 미만이면 큐레이션으로 보충 (중복 제외)
        if (songs.length < 10) {
          const usedA = new Set(songs.map(s => s.artist.toLowerCase().replace(/[^a-z0-9가-힣]/g,'').slice(0,8)))
          const usedT = new Set(songs.map(s => s.title.toLowerCase().replace(/[^a-z0-9가-힣]/g,'').slice(0,14)))
          for (const f of CHART_FALLBACK) {
            if (songs.length >= 10) break
            const ak = f.artist.toLowerCase().replace(/[^a-z0-9가-힣]/g,'').slice(0,8)
            const tk = f.title.toLowerCase().replace(/[^a-z0-9가-힣]/g,'').slice(0,14)
            if (usedA.has(ak) || usedT.has(tk)) continue
            usedA.add(ak); usedT.add(tk)
            songs.push({ rank: songs.length+1, title: f.title, artist: f.artist, cover:'', youtubeQuery: f.q, videoId:'' })
          }
        }
        if (songs.length === 0) throw new Error('filtered all')
        setChartData(songs)
      } catch (err) {
        console.error('YouTube 차트 로드 실패:', err)
        setApiNotice(apiErrorMessage(err, '실시간 차트를 불러오지 못해 기본 추천 차트를 보여드려요.'))
        setChartData(CHART_FALLBACK.slice(0,10).map((f,i)=>({ rank:i+1, title:f.title, artist:f.artist, cover:'', youtubeQuery:f.q, videoId:'' })))
      } finally {
        setChartLoading(false)
      }
    }
    fetchChart()
  }, [])

  useEffect(() => {
    // 뮤직비디오 TOP10은 인기 차트(chartData)를 재활용하므로
    // 별도 신곡 검색(search 100 unit)은 하지 않는다. quota 절약.
    setNewSongs(NEW_FALLBACK.map(f => ({ title: f.title, artist: f.artist, youtubeQuery: f.q, cover: '', videoId: '' })))
    setNewSongsLoading(false)
  }, [])

  // ── 감정 분석 ───────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!inputText.trim()) return
    setLoadingType('emotion')
    try {
      const valid = ['기쁨','슬픔','분노','불안','평온','설렘','피로','집중']
      const data = await api.emotion(inputText)
      const detectedEmotion = valid.includes(data.emotion) ? data.emotion : 'default'
      setLoadingType('music')
      setTimeout(() => {
        setLoadingType(null)
        onAnalyzeComplete?.(inputText, detectedEmotion)
      }, 2200)
    } catch (e) {
      console.error('Gemini API 오류:', e)
      setApiNotice(apiErrorMessage(e, '감정 분석에 실패했어요. 잠시 후 다시 시도해주세요.'))
      setLoadingType(null)
    }
  }

  // ── 노래 직접 검색 ─────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    setSearchResults([])
    try {
      const data = await api.search(searchQuery, 10)
      setSearchResults(data.songs || [])
    } catch (err) {
      console.error('검색 실패:', err)
      setApiNotice(apiErrorMessage(err, '검색에 실패했어요. 잠시 후 다시 시도해주세요.'))
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', fontFamily: "'Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif", color: tc, position: 'relative', overflow: 'hidden' }}>
      <style>{GLOBAL_CSS}</style>
      <style>{`
        .new-songs-scroll::-webkit-scrollbar { display: none; }
        .new-songs-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        /* ── 반응형 그리드 ── */
        /* 상단 2카드(오늘의 감정 / 인기 감정 TOP5): 좁으면 1열 */
        .ms-top-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 16px;
        }
        /* 인기 차트: 기본 2열, 좁으면 1열 */
        .ms-chart-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
        }
        .ms-chart-skeleton {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        @media (max-width: 768px) {
          .ms-chart-grid, .ms-chart-skeleton { grid-template-columns: minmax(0, 1fr); }
        }
        /* 메인 패딩: 모바일에서 축소 */
        .ms-content { padding: 20px 28px 80px; }
        @media (max-width: 600px) {
          .ms-content { padding: 14px 14px 90px; }
        }
      `}</style>

      {/* 배경 글로우 */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-5%', width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle,${theme.glow || theme.to}20 0%,transparent 65%)`, transition: 'all 2.2s ease' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle,${theme.from}18 0%,transparent 65%)`, transition: 'all 2.2s ease' }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle,${theme.to}10 0%,transparent 65%)`, transition: 'all 2.2s ease' }} />
      </div>

      {loadingType === 'emotion' && <EmotionLoadingScreen text={inputText} isDark={isDark} />}
      {loadingType === 'music'   && <MusicLoadingScreen theme={theme} isDark={isDark} />}

      <div className="ms-content" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {apiNotice && (
          <div style={{ ...G(0.70), borderRadius: 16, padding: '12px 16px', marginBottom: 14, color: tc, fontSize: 13, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span>{apiNotice}</span>
            <button onClick={() => setApiNotice('')} style={{ border: 'none', background: 'transparent', color: sc, cursor: 'pointer' }}>닫기</button>
          </div>
        )}

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 24 }}>
          {emotion !== 'default' && (
            <div style={{ ...G(0.62), borderRadius: 20, padding: '7px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: theme.to, display: 'inline-block', boxShadow: `0 0 5px ${theme.to}88` }} />
              {emotion} 모드
            </div>
          )}
        </div>

        {/* ① 공지 배너 */}
        <div style={{ ...G(0.62), borderRadius: 16, padding: '13px 20px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
          <div style={{ borderRadius: 7, padding: '3px 9px', fontSize: 10, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', flexShrink: 0, background: `linear-gradient(135deg, ${theme.to}cc, ${theme.mid || theme.from}cc)`, boxShadow: `0 2px 8px ${theme.to}44` }}>
            {NOTICE[noticeIdx].type}
          </div>
          <div key={noticeIdx} style={{ fontSize: 13, fontWeight: 500, flex: 1, animation: 'noticeIn 3.5s ease both' }}>
            {NOTICE[noticeIdx].text}
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {NOTICE.map((_, i) => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i === noticeIdx ? theme.mid || '#6080c0' : 'rgba(100,120,200,0.25)', transition: 'all 0.3s' }} />)}
          </div>
        </div>

        {/* ② 입력 영역 (감정 분석 / 노래 검색 탭) */}
        <div style={{ ...G(0.62), borderRadius: 28, padding: '36px 40px', marginBottom: 18, textAlign: 'center', animation: 'fadeInUp 0.6s 0.1s both' }}>
          <div style={{ fontSize: 11, opacity: 0.45, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12, fontFamily: "'Space Mono',monospace" }}>AI Emotion Music Curator</div>
          <h1 style={{ fontSize: 'clamp(1.8rem,3.2vw,2.8rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 20 }}>
            지금 이 순간,{' '}
            <span style={{ color: complement, fontWeight: 800, transition: 'color 1.8s ease', textDecoration: 'underline', textDecorationColor: `${complement}44`, textUnderlineOffset: '4px' }}>당신의 감정</span>을 들려주세요
          </h1>

          {/* 탭 */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
            {[
              { key: 'emotion', label: '😊 감정 분석' },
              { key: 'search',  label: '🔍 노래 검색' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSearchMode(tab.key)}
                style={{
                  padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
                  background: searchMode === tab.key
                    ? `linear-gradient(135deg,${theme.from},${theme.to})`
                    : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)'),
                  color: searchMode === tab.key ? tc : sc,
                  fontWeight: searchMode === tab.key ? 700 : 400,
                  transition: 'all 0.2s',
                  boxShadow: searchMode === tab.key ? `0 4px 12px ${theme.to}33` : 'none',
                }}
              >{tab.label}</button>
            ))}
          </div>

          {/* 감정 분석 모드 */}
          {searchMode === 'emotion' && (
            <div style={{ ...G(0.62), borderRadius: 20, padding: '20px 24px', maxWidth: 580, margin: '0 auto' }}>
              <textarea
                ref={textareaRef}
                className="mc-emotion-input"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && handleAnalyze()}
                placeholder={"오늘 하루 어땠나요?\n지금 느끼는 감정을 자유롭게 적어주세요..."}
                rows={3}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', color: tc, fontSize: 14, lineHeight: 1.75, fontFamily: 'inherit' }}
              />
              <style>{`.mc-emotion-input::placeholder{color:${isDark?'rgba(200,210,255,0.55)':'rgba(20,40,90,0.40)'};opacity:1}`}</style>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(100,120,200,0.18)', marginTop: 4 }}>
                <span style={{ fontSize: 11, opacity: 0.3 }}>⌘ + Enter</span>
                <button onClick={handleAnalyze} disabled={!inputText.trim()} className={gbtn} style={{
                  background: inputText.trim() ? `linear-gradient(135deg,${theme.from},${theme.to})` : 'rgba(255,255,255,0.1)',
                  border: 'none', borderRadius: 12, padding: '10px 28px', color: tc, fontSize: 13, fontWeight: 700,
                  opacity: inputText.trim() ? 1 : 0.4,
                  boxShadow: inputText.trim() ? `0 4px 16px ${theme.to}33` : 'none',
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                }}>감정 분석하기 →</button>
              </div>
            </div>
          )}

          {/* 노래 검색 모드 */}
          {searchMode === 'search' && (
            <div style={{ maxWidth: 580, margin: '0 auto' }}>
              <div style={{ ...G(0.62), borderRadius: 20, padding: '16px 20px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  className="mc-search-input"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="노래 제목, 아티스트 이름을 입력하세요..."
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: tc, fontSize: 14, fontFamily: 'inherit' }}
                />
                <style>{`.mc-search-input::placeholder{color:${isDark?'rgba(200,210,255,0.55)':'rgba(20,40,90,0.45)'};opacity:1}`}</style>
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || searchLoading}
                  className={gbtn}
                  style={{
                    background: searchQuery.trim() ? `linear-gradient(135deg,${theme.from},${theme.to})` : 'rgba(255,255,255,0.1)',
                    border: 'none', borderRadius: 12, padding: '10px 20px', color: tc, fontSize: 13, fontWeight: 700,
                    opacity: searchQuery.trim() ? 1 : 0.4,
                    cursor: searchQuery.trim() ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap',
                  }}
                >🔍 검색</button>
              </div>

              {searchLoading && (
                <div style={{ textAlign: 'center', padding: '20px', color: sc, fontSize: 13 }}>검색 중...</div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div style={{ ...G(0.62), borderRadius: 20, padding: '10px', marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {searchResults.map((song, i) => (
                    <div key={i} className={trow} onClick={() => onPlaySong?.(song)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, cursor: 'pointer' }}>
                      {song.cover
                        ? <img src={song.cover} alt={song.title} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎵</div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: tc }}>{song.title}</div>
                        <div style={{ fontSize: 11, color: sc, marginTop: 2 }}>{song.artist}</div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); onPlaySong?.(song) }}
                        title="재생"
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

              {!searchLoading && searchResults.length === 0 && searchQuery && (
                <div style={{ textAlign: 'center', padding: '16px', color: sc, fontSize: 13 }}>
                  검색어를 입력하고 Enter 또는 검색 버튼을 눌러주세요
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 취향 기반 추천 카드 (입력창과 하단 패널 사이, 독립 블록) ── */}
        <div style={{ ...G(0.62), borderRadius: 22, overflow: 'hidden', marginBottom: 24, animation: 'fadeInUp 0.6s 0.15s both' }}>
          <div
            onClick={() => setTasteOpen(o => !o)}
            style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', cursor:'pointer' }}
          >
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <span style={{ fontSize:16 }}>🎨</span>
              <span style={{ fontSize:13, fontWeight:600, color:tc }}>취향 기반 추천</span>
              <span style={{ fontSize:11, color:sc }}>장르 · 아티스트 선택 → AI 맞춤 추천</span>
            </div>
            <span style={{ fontSize:11, color:sc, userSelect:'none' }}>{tasteOpen ? '▲ 접기' : '▼ 열기'}</span>
          </div>

          {tasteOpen && (
            <div style={{ padding:'0 24px 20px', animation:'fadeInUp 0.25s both' }}>
              <p style={{ fontSize:11, color:sc, letterSpacing:'1px', textTransform:'uppercase', marginBottom:10 }}>장르 선택</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:18 }}>
                {[
                  {k:'kpop',l:'K-POP',c:'#e06090'},{k:'ballad',l:'발라드',c:'#6090d0'},
                  {k:'hiphop',l:'힙합',c:'#e0a030'},{k:'rnb',l:'R&B',c:'#9060d0'},
                  {k:'indie',l:'인디',c:'#30b070'},{k:'dance',l:'댄스',c:'#e05040'},
                  {k:'ost',l:'OST',c:'#4090e0'},{k:'lofi',l:'Lo-Fi',c:'#a09080'},
                ].map(g => {
                  const sel = tasteGenres.includes(g.k)
                  return (
                    <button key={g.k} onClick={() => setTasteGenres(p => sel ? p.filter(x=>x!==g.k) : [...p,g.k])}
                      style={{
                        padding:'7px 15px', borderRadius:18, cursor:'pointer', fontSize:12, fontWeight: sel?700:400,
                        border: sel?`2px solid ${g.c}`:`1px solid ${isDark?'rgba(255,255,255,0.14)':'rgba(100,120,200,0.22)'}`,
                        background: sel?`${g.c}22`:(isDark?'rgba(255,255,255,0.05)':'rgba(100,120,200,0.06)'),
                        color: sel?g.c:sc, transition:'all 0.18s', boxShadow: sel?`0 2px 8px ${g.c}30`:'none',
                      }}>{g.l}</button>
                  )
                })}
              </div>
              <p style={{ fontSize:11, color:sc, letterSpacing:'1px', textTransform:'uppercase', marginBottom:10 }}>아티스트 (선택)</p>
              <div style={{ ...G(0.55), borderRadius:14, padding:'10px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:14 }}>🎤</span>
                <input value={tasteArtist} onChange={e=>setTasteArtist(e.target.value)}
                  placeholder="예: IU, BTS, aespa (쉼표 구분)"
                  style={{ flex:1, background:'transparent', border:'none', outline:'none', color:tc, fontSize:13, fontFamily:'inherit' }}/>
              </div>
              <button
                onClick={async () => {
                  if (tasteGenres.length===0 && !tasteArtist.trim()) return
                  setTasteLoading(true); setTasteResults([])
                  try {
                    const data = await api.tasteRecommend({
                      genres: tasteGenres,
                      artists: tasteArtist.split(',').map(a => a.trim()).filter(Boolean),
                      limit: 8,
                    })
                    setTasteResults(data.songs || [])
                  } catch(e) {
                    console.error('취향 추천 실패:', e)
                    setApiNotice(apiErrorMessage(e, '취향 추천을 불러오지 못했어요. 잠시 후 다시 시도해주세요.'))
                  }
                  finally { setTasteLoading(false) }
                }}
                disabled={tasteGenres.length===0 && !tasteArtist.trim()}
                style={{
                  width:'100%', padding:'12px', borderRadius:14, border:'none', cursor:'pointer',
                  background:(tasteGenres.length>0||tasteArtist.trim())
                    ? 'linear-gradient(135deg,#7C5CFF,#FF4D8D)'
                    : (isDark?'rgba(255,255,255,0.12)':'rgba(100,120,200,0.18)'),
                  color:(tasteGenres.length>0||tasteArtist.trim())?'#fff':(isDark?'rgba(255,255,255,0.5)':'rgba(30,50,100,0.55)'),
                  fontSize:13, fontWeight:700,
                  opacity:1,
                  boxShadow:(tasteGenres.length>0||tasteArtist.trim())?'0 4px 16px rgba(124,92,255,0.35)':'none',
                  marginBottom:(tasteResults.length>0||tasteLoading)?16:0, transition:'all 0.2s',
                }}>{tasteLoading ? '추천 중...' : '✨ 맞춤 추천받기'}</button>

              {tasteLoading && (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {Array.from({length:5}).map((_,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:10, background:isDark?'rgba(255,255,255,0.04)':'rgba(100,120,200,0.05)' }}>
                      <div style={{width:36,height:36,borderRadius:8,background:isDark?'rgba(255,255,255,0.08)':'rgba(100,120,200,0.10)',flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{height:12,borderRadius:4,background:isDark?'rgba(255,255,255,0.08)':'rgba(100,120,200,0.10)',width:'60%',marginBottom:5}}/>
                        <div style={{height:10,borderRadius:4,background:isDark?'rgba(255,255,255,0.05)':'rgba(100,120,200,0.07)',width:'38%'}}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!tasteLoading && tasteResults.length>0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:11, color:sc }}>추천 결과 {tasteResults.length}곡</span>
                    <button onClick={()=>onPlaySong?.(tasteResults[0], tasteResults)}
                      style={{ padding:'6px 16px', borderRadius:10, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#7C5CFF,#FF4D8D)', color:'#fff', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:5, boxShadow:'0 2px 8px rgba(124,92,255,0.3)' }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>전체 재생
                    </button>
                  </div>
                  {tasteResults.map((song,i)=>(
                    <div key={i} className={trow} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, cursor:'pointer' }} onClick={()=>onPlaySong?.(song, tasteResults)}>
                      <span style={{ fontSize:11, fontWeight:700, minWidth:18, textAlign:'center', color:sc, fontFamily:"'Space Mono',monospace" }}>{String(i+1).padStart(2,'0')}</span>
                      <div style={{ width:36,height:36,borderRadius:8,flexShrink:0,background:`linear-gradient(135deg,${theme.from}55,${theme.to}88)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>🎵</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13,fontWeight:600,color:tc,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{song.title}</p>
                        <p style={{ fontSize:11,color:sc,marginTop:2 }}>{song.artist}</p>
                      </div>
                      <button onClick={e=>{e.stopPropagation();onPlaySong?.(song,tasteResults)}}
                        style={{
                          width:28, height:28, borderRadius:'50%', cursor:'pointer', flexShrink:0,
                          display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s',
                          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)',
                          border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.9)',
                          color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(30,50,100,0.7)',
                          boxShadow: '0 2px 6px rgba(100,120,200,0.15)',
                        }}
                        onMouseEnter={e=>{e.currentTarget.style.background='linear-gradient(135deg,#7C5CFF,#FF4D8D)';e.currentTarget.style.color='#fff';e.currentTarget.style.border='none'}}
                        onMouseLeave={e=>{e.currentTarget.style.background=isDark?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.75)';e.currentTarget.style.color=isDark?'rgba(255,255,255,0.75)':'rgba(30,50,100,0.7)';e.currentTarget.style.border=isDark?'1px solid rgba(255,255,255,0.15)':'1px solid rgba(255,255,255,0.9)'}}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ③ 하단 — 2열 + 차트 + 신곡 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeInUp 0.6s 0.2s both' }}>
          <div className="ms-top-grid">

            {/* 도넛 차트 */}
            <div style={{ ...G(0.62), borderRadius: 22, padding: '22px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85, marginBottom: 16, color: theme.text || '#1a2a4a', display: 'flex', alignItems: 'center', gap: 7 }}>📊 <span>오늘의 감정</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
                  <svg width="90" height="90" viewBox="0 0 90 90">
                    {(() => {
                      let offset = 0
                      const r = 32, cx = 45, cy = 45, circ = 2 * Math.PI * r
                      return TODAY_STATS.map((s, i) => {
                        const dash = (s.percent / 100) * circ, gap = circ - dash
                        const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="10" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset * circ / 100} strokeLinecap="round" style={{ transition: 'all 1s ease' }} />
                        offset += s.percent
                        return el
                      })
                    })()}
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.9 }}>{TODAY_STATS[0].percent}%</div>
                    <div style={{ fontSize: 9, opacity: 0.5 }}>{TODAY_STATS[0].emotion}</div>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {TODAY_STATS.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12 }}>{s.icon}</span>
                      <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.percent}%`, background: s.color, borderRadius: 2, transition: 'width 1.2s ease' }} />
                      </div>
                      <span style={{ fontSize: 10, opacity: 0.5, minWidth: 24, textAlign: 'right' }}>{s.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 인기 감정 TOP 5 (Firestore 실시간 or 더미) */}
            <div style={{ ...G(0.62), borderRadius: 22, padding: '22px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85, marginBottom: 18, color: theme.text || '#1a2a4a', display: 'flex', alignItems: 'center', gap: 7 }}>
                🔥 <span>인기 감정 TOP 5</span>
                {emotionStats && <span style={{ fontSize: 9, opacity: 0.4, marginLeft: 'auto' }}>실시간</span>}
              </div>
              {popularData.map((p, i) => (
                <div key={i} className={gbtn}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 4 ? 10 : 0, padding: '6px 8px', borderRadius: 10, cursor: 'pointer' }}
                  onClick={() => onEmotionSelect?.(p.emotion)}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)', border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(100,120,200,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, opacity: 0.85, flexShrink: 0, fontFamily: "'Space Mono',monospace" }}>
                    {String(p.rank).padStart(2, '0')}
                  </div>
                  <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg,${p.color}55,${p.color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: `0 2px 10px ${p.color}44`, border: `1px solid ${p.color}44` }}>
                    {p.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{p.emotion}</div>
                    <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${100 - i * 16}%`, background: `linear-gradient(90deg,${p.color}55,${p.color}99)`, borderRadius: 2, transition: 'width 1.2s ease' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.4, flexShrink: 0 }}>{p.count}</div>
                </div>
              ))}
            </div>

          </div>

          {/* 인기 차트 - 전체 너비 */}
          <div style={{ ...G(0.62), borderRadius: 22, padding: '22px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85, marginBottom: 18, color: theme.text || '#1a2a4a', display: 'flex', alignItems: 'center', gap: 7 }}>
              📈 <span>인기 차트</span>
              {!chartLoading && chartData.length > 0 && (
                <button
                  onClick={() => onPlaySong?.(
                    { title: chartData[0].title, artist: chartData[0].artist, youtubeQuery: chartData[0].youtubeQuery, videoId: chartData[0].videoId },
                    chartData.map(c => ({ title: c.title, artist: c.artist, youtubeQuery: c.youtubeQuery, videoId: c.videoId }))
                  )}
                  style={{
                    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg,#7C5CFF,#FF4D8D)',
                    color: '#fff', fontSize: 11, fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(124,92,255,0.3)',
                  }}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                  모두 재생
                </button>
              )}
              <span style={{ fontSize: 10, opacity: 0.4, marginLeft: chartLoading || chartData.length === 0 ? 'auto' : 0 }}>YouTube 기준</span>
            </div>
            {chartLoading ? (
              <div className="ms-chart-skeleton">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'rgba(100,120,200,0.06)' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.08)', marginBottom: 6, width: '70%' }} />
                      <div style={{ height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '50%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ms-chart-grid">
                {chartData.map((c, i) => (
                  <div key={i} className={trow} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', cursor: 'pointer', borderRadius: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,120,200,0.10)', border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(100,120,200,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, opacity: 0.85, flexShrink: 0, fontFamily: "'Space Mono',monospace" }}>
                      {String(c.rank).padStart(2, '0')}
                    </div>
                    {c.cover
                      ? <img src={c.cover} alt={c.title} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
                      : <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎵</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                      <div style={{ fontSize: 11, opacity: 0.45, marginTop: 2 }}>{c.artist}</div>
                    </div>
                    <button
                      onClick={() => onPlaySong?.(
                        { title: c.title, artist: c.artist, youtubeQuery: c.youtubeQuery, videoId: c.videoId },
                        chartData.map(x => ({ title: x.title, artist: x.artist, youtubeQuery: x.youtubeQuery, videoId: x.videoId }))
                      )}
                      style={{
                        width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)',
                        border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.9)',
                        color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(30,50,100,0.7)',
                        boxShadow: '0 2px 6px rgba(100,120,200,0.15)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg,${theme.from},${theme.to})`; e.currentTarget.style.color = '#fff'; e.currentTarget.style.border = 'none' }}
                      onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)'; e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(30,50,100,0.7)'; e.currentTarget.style.border = isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.9)' }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 뮤직비디오 TOP 10 (인기 차트 기반) */}
          <div style={{ ...G(0.62), borderRadius: 22, padding: '22px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85, marginBottom: 16, color: theme.text || '#1a2a4a', display: 'flex', alignItems: 'center', gap: 7 }}>
              🎬 <span>뮤직비디오 TOP 10</span>
              <span style={{ fontSize: 10, opacity: 0.4, marginLeft: 'auto' }}>YouTube 인기순</span>
            </div>
            {chartLoading ? (
              <div style={{ display: 'flex', gap: 12, overflow: 'hidden' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ minWidth: 130, flexShrink: 0 }}>
                    <div style={{ width: 130, height: 85, borderRadius: 12, background: 'rgba(100,120,200,0.08)' }} />
                    <div style={{ height: 12, borderRadius: 4, background: 'rgba(100,120,200,0.06)', margin: '8px 0 4px', width: '80%' }} />
                    <div style={{ height: 10, borderRadius: 4, background: 'rgba(100,120,200,0.04)', width: '60%' }} />
                  </div>
                ))}
              </div>
            ) : chartData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: sc, fontSize: 13 }}>
                뮤직비디오를 불러오지 못했어요
              </div>
            ) : (
              <div className="new-songs-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
                {chartData.map((song, i) => (
                  <div key={i}
                    style={{ width: 130, minWidth: 130, maxWidth: 130, cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => {
                      if (song.videoId) { onStopPlayer?.(); setMvModal({ videoId: song.videoId, title: song.title, artist: song.artist }) }
                      else onPlaySong?.({ title: song.title, artist: song.artist, youtubeQuery: song.youtubeQuery, videoId: song.videoId })
                    }}>
                    <div style={{ position: 'relative', width: 130, height: 85, borderRadius: 12, overflow: 'hidden', marginBottom: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.25)', transition: 'transform 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                      {song.cover
                        ? <img src={song.cover} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', background: 'rgba(100,120,200,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🎵</div>
                      }
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
                      <div style={{ position: 'absolute', top: 6, left: 6 }}>
                        <span style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6, fontFamily: "'Space Mono',monospace" }}>
                          #{song.rank || i + 1}
                        </span>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation();
                          if (song.videoId) { onStopPlayer?.(); setMvModal({ videoId: song.videoId, title: song.title, artist: song.artist }) }
                          else onPlaySong?.({ title: song.title, artist: song.artist, youtubeQuery: song.youtubeQuery, videoId: song.videoId }) }}
                        style={{ position: 'absolute', bottom: 6, right: 6, width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#1a2a4a"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                    </div>
                    <p title={song.title} style={{ fontSize: 12, fontWeight: 600, color: tc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{song.title}</p>
                    <p title={song.artist} style={{ fontSize: 11, color: sc, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{song.artist}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── 뮤직비디오 팝업 모달 ── */}
      {mvModal && (
        <div
          onClick={() => setMvModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,20,0.78)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 880, borderRadius: 20, overflow: 'hidden',
              background: isDark ? 'rgba(20,30,100,0.85)' : 'rgba(255,255,255,0.95)',
              border: isDark ? '1px solid rgba(140,160,255,0.28)' : '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 20px 70px rgba(0,0,30,0.55)',
            }}
          >
            {/* 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: tc, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mvModal.title}</p>
                <p style={{ fontSize: 12, color: sc, margin: '3px 0 0' }}>{mvModal.artist}</p>
              </div>
              <button
                onClick={() => setMvModal(null)}
                aria-label="닫기"
                style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', border: 'none',
                  background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(100,120,200,0.12)',
                  color: isDark ? '#c0c8f0' : '#1a2a4a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 12,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
            {/* 영상 (16:9) */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
              <iframe
                src={`https://www.youtube.com/embed/${mvModal.videoId}?autoplay=1&rel=0`}
                title={mvModal.title}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
