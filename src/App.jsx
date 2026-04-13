import { useState, useEffect, useRef } from "react";

const EMOTION_GRADIENTS = {
  기쁨:  { from:"#5c2e28", to:"#a04848", glow:"#8a3a3a", text:"#f5e0dc" },
  설렘:  { from:"#5c2a44", to:"#7a3a6e", glow:"#6b3358", text:"#f0d8e8" },
  평온:  { from:"#0e3d35", to:"#1e5c48", glow:"#175040", text:"#d0ede6" },
  슬픔:  { from:"#0e1f38", to:"#1e3a5c", glow:"#1a3050", text:"#c8d8ee" },
  분노:  { from:"#3d0e0e", to:"#6b2020", glow:"#5a1818", text:"#f0d0d0" },
  불안:  { from:"#1e0e36", to:"#3a1a60", glow:"#2e1450", text:"#ddd0f0" },
  집중:  { from:"#061828", to:"#0a3050", glow:"#083a5c", text:"#c8e0f0" },
  피로:  { from:"#141414", to:"#2a2a2a", glow:"#222222", text:"#d8d8d8" },
  default:{ from:"#080818", to:"#141430", glow:"#101028", text:"#d8d8f0" },
};

// 감정별 파스텔 톤 (배경 대비 텍스트 강조용)
const EMOTION_COMPLEMENT = {
  기쁨:    "#f2c4b8",  // 딥로즈골드 → 살구 파스텔
  설렘:    "#f0b8d8",  // 딥로즈퍼플 → 핑크 파스텔
  평온:    "#b8e8d8",  // 다크그린   → 민트 파스텔
  슬픔:    "#b8d4f0",  // 딥네이비   → 하늘 파스텔
  분노:    "#f0c8b8",  // 다크레드   → 피치 파스텔
  불안:    "#d8b8f0",  // 딥퍼플     → 라벤더 파스텔
  집중:    "#b8ddf0",  // 딥블루     → 아이스블루 파스텔
  피로:    "#d8d0c8",  // 다크그레이 → 웜베이지 파스텔
  default: "#c8cce8",  // 다크네이비 → 퍼플 파스텔
};

const HISTORY = [
  { emotion:"설렘", text:"드라이브 하고 싶은 날", time:"오늘 14:23" },
  { emotion:"평온", text:"비 오는 날 커피 한 잔", time:"어제 09:11" },
  { emotion:"기쁨", text:"오늘 발표가 잘 됐어!", time:"2일 전" },
  { emotion:"슬픔", text:"보고 싶은 사람이 있어", time:"3일 전" },
];

const SAVED_ALBUMS = [
  { title:"드라이브 믹스", count:12, color:"#FF6B9D" },
  { title:"새벽 감성", count:8,  color:"#4A90D9" },
  { title:"운동할 때",   count:15, color:"#38ef7d" },
];

const NOTICE = [
  { type:"NEW",  text:"아이유 새 앨범 '에필로그' 발매" },
  { type:"HOT",  text:"BTS 월드투어 기념 플레이리스트 공개" },
  { type:"공지", text:"감정 분석 AI 모델 v2.0 업데이트" },
];

const POPULAR = [
  { rank:1, emotion:"설렘", count:"42.3k", color:"#FF6B9D" },
  { rank:2, emotion:"평온", count:"38.1k", color:"#38ef7d" },
  { rank:3, emotion:"기쁨", count:"31.7k", color:"#FFD700" },
  { rank:4, emotion:"집중", count:"28.9k", color:"#00BFFF" },
  { rank:5, emotion:"슬픔", count:"22.4k", color:"#4A90D9" },
];

const CHART = [
  { rank:1, title:"Supernova",  artist:"aespa",  emotion:"설렘" },
  { rank:2, title:"Whiplash",   artist:"aespa",  emotion:"기쁨" },
  { rank:3, title:"밤편지",      artist:"IU",     emotion:"슬픔" },
  { rank:4, title:"Magnetic",   artist:"ILLIT",  emotion:"설렘" },
  { rank:5, title:"apt.",       artist:"ROSE",   emotion:"기쁨" },
];

const glass = (opacity = 0.12, blur = 24) => ({
  background: `rgba(255,255,255,${opacity})`,
  backdropFilter: `blur(${blur}px) saturate(180%)`,
  WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
  border: "1px solid rgba(255,255,255,0.2)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)",
});

function MusicLoadingScreen({ theme }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:`linear-gradient(135deg,${theme.from}cc,${theme.to}cc)`,
      backdropFilter:"blur(20px)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24,
    }}>
      <style>{`
        @keyframes musicBar {
          0%,100%{ transform:scaleY(0.3); opacity:0.5; }
          50%{ transform:scaleY(1); opacity:1; }
        }
      `}</style>
      <div style={{ ...glass(0.18), borderRadius:32, padding:"44px 64px", textAlign:"center" }}>
        <div style={{ display:"flex", alignItems:"flex-end", gap:6, justifyContent:"center", marginBottom:28, height:56 }}>
          {[0,1,2,3,4,5,6].map(i => (
            <div key={i} style={{
              width:6, borderRadius:3,
              background:`linear-gradient(to top,${theme.from},${theme.to})`,
              animation:`musicBar 0.9s ease-in-out ${i*0.1}s infinite`,
              height:56, transformOrigin:"bottom",
            }}/>
          ))}
        </div>
        <div style={{ fontSize:20, fontWeight:700, color:"#fff", marginBottom:10 }}>음악을 찾고 있어요</div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)" }}>감정에 맞는 곡을 큐레이션 중...</div>
      </div>
    </div>
  );
}

function EmotionLoadingScreen({ text }) {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d+1)%4), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,0.6)",
      backdropFilter:"blur(24px)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
    }}>
      <style>{`
        @keyframes brainPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        @keyframes ripple { 0%{transform:scale(0.8);opacity:0.7} 100%{transform:scale(2.5);opacity:0} }
      `}</style>
      <div style={{ ...glass(0.18), borderRadius:32, padding:"48px 64px", textAlign:"center", maxWidth:340 }}>
        <div style={{ position:"relative", width:88, height:88, margin:"0 auto 32px" }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              position:"absolute", inset:0, borderRadius:"50%",
              border:"1.5px solid rgba(255,255,255,0.35)",
              animation:`ripple 2.2s ${i*0.7}s ease-out infinite`,
            }}/>
          ))}
          <div style={{
            position:"absolute", inset:0, borderRadius:"50%",
            background:"rgba(255,255,255,0.12)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:36, animation:"brainPulse 2s ease-in-out infinite",
          }}>🔍</div>
        </div>
        <div style={{ fontSize:20, fontWeight:700, color:"#fff", marginBottom:10 }}>
          감정을 분석하고 있어요{".".repeat(dots)}
        </div>
        {text && (
          <div style={{
            ...glass(0.1), borderRadius:12, padding:"10px 16px", margin:"12px 0 16px",
            fontSize:13, color:"rgba(255,255,255,0.75)", fontStyle:"italic",
          }}>
            "{text.slice(0,32)}{text.length>32?"...":""}"
          </div>
        )}
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>AI가 텍스트에서 감정을 읽고 있어요</div>
      </div>
    </div>
  );
}

export default function App() {
  const [emotion, setEmotion] = useState("default");
  const [inputText, setInputText] = useState("");
  const [loadingType, setLoadingType] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [noticeIdx, setNoticeIdx] = useState(0);
  const textareaRef = useRef(null);

  const theme = EMOTION_GRADIENTS[emotion] || EMOTION_GRADIENTS.default;

  useEffect(() => {
    const t = setInterval(() => setNoticeIdx(i => (i+1) % NOTICE.length), 3500);
    return () => clearInterval(t);
  }, []);

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    setLoadingType("emotion");
    setTimeout(() => {
      const emotions = Object.keys(EMOTION_GRADIENTS).filter(e => e !== "default");
      setEmotion(emotions[Math.floor(Math.random() * emotions.length)]);
      setLoadingType("music");
      setTimeout(() => setLoadingType(null), 2200);
    }, 2600);
  };

  return (
    <div style={{
      minHeight:"100vh",
      width:"100vw",
      background:`linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 55%, ${theme.glow}66 100%)`,
      transition:"background 2s cubic-bezier(0.4,0,0.2,1)",
      fontFamily:"'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
      color:"#fff",
      position:"relative",
      overflow:"hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
        html,body,#root{width:100%;height:100%;margin:0;padding:0;}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2);border-radius:2px;}
        textarea:focus{outline:none;}
        textarea::placeholder{color:rgba(255,255,255,0.35);}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes noticeIn{0%{opacity:0;transform:translateY(6px)}15%{opacity:1;transform:translateY(0)}85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-6px)}}
        .gbtn{transition:all 0.2s ease!important;cursor:pointer;}
        .gbtn:hover{background:rgba(255,255,255,0.22)!important;transform:translateY(-1px);}
        .trow:hover{background:rgba(255,255,255,0.08)!important;border-radius:10px;}
      `}</style>

      {/* 배경 글로우 오브 */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-15%",left:"-5%",width:700,height:700,borderRadius:"50%",background:`radial-gradient(circle,${theme.glow}20 0%,transparent 65%)`,transition:"all 2.2s ease"}}/>
        <div style={{position:"absolute",bottom:"-20%",right:"-10%",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle,${theme.from}18 0%,transparent 65%)`,transition:"all 2.2s ease"}}/>
        <div style={{position:"absolute",top:"40%",right:"20%",width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,${theme.to}10 0%,transparent 65%)`,transition:"all 2.2s ease"}}/>
      </div>

      {loadingType === "emotion" && <EmotionLoadingScreen text={inputText} />}
      {loadingType === "music"   && <MusicLoadingScreen theme={theme} />}

      <div style={{position:"relative",zIndex:1,display:"flex",minHeight:"100vh"}}>

        {/* ── 사이드바 ── */}
        <aside style={{
          width: sidebarOpen ? 256 : 0,
          minWidth: sidebarOpen ? 256 : 0,
          transition:"all 0.45s cubic-bezier(0.4,0,0.2,1)",
          overflow:"hidden",
          borderRight:"1px solid rgba(255,255,255,0.1)",
          background:"rgba(0,0,0,0.15)",
          backdropFilter:"blur(32px)",
          WebkitBackdropFilter:"blur(32px)",
        }}>
          <div style={{width:256,padding:"24px 16px",height:"100vh",overflow:"auto"}}>

            {/* 로고 */}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 8px",marginBottom:32}}>
              <div style={{width:38,height:38,borderRadius:12,background:`linear-gradient(135deg,${theme.from},${theme.to})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:`0 4px 12px ${theme.glow}28`}}>🎵</div>
              <div>
                <div style={{fontSize:17,fontWeight:700,letterSpacing:"-0.02em"}}>Muse</div>
                <div style={{fontSize:11,opacity:0.45}}>감정 음악 큐레이터</div>
              </div>
            </div>

            {/* 히스토리 */}
            <div style={{marginBottom:28}}>
              <div style={{fontSize:11,fontWeight:600,opacity:0.45,letterSpacing:"0.1em",textTransform:"uppercase",padding:"0 8px",marginBottom:12}}>최근 감정</div>
              {HISTORY.map((h,i) => (
                <div key={i} className="gbtn" style={{
                  ...glass(0.07,16),borderRadius:12,padding:"10px 14px",marginBottom:6,
                  display:"flex",alignItems:"center",gap:10,
                  animation:`fadeInUp 0.4s ${i*0.07}s both`,
                }}>
                  <div style={{width:9,height:9,borderRadius:"50%",background:EMOTION_GRADIENTS[h.emotion]?.to||"#fff",flexShrink:0,boxShadow:`0 0 6px ${EMOTION_GRADIENTS[h.emotion]?.to||"#fff"}88`}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.text}</div>
                    <div style={{fontSize:10,opacity:0.45,marginTop:2}}>{h.emotion} · {h.time}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* 저장 앨범 */}
            <div>
              <div style={{fontSize:11,fontWeight:600,opacity:0.45,letterSpacing:"0.1em",textTransform:"uppercase",padding:"0 8px",marginBottom:12}}>내 앨범</div>
              {SAVED_ALBUMS.map((a,i) => (
                <div key={i} className="gbtn" style={{
                  ...glass(0.07,16),borderRadius:12,padding:"10px 14px",marginBottom:6,
                  display:"flex",alignItems:"center",gap:10,
                }}>
                  <div style={{width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${a.color}77,${a.color})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>🎵</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:500}}>{a.title}</div>
                    <div style={{fontSize:10,opacity:0.45,marginTop:2}}>{a.count}곡</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── 메인 ── */}
        <main style={{flex:1,display:"flex",flexDirection:"column",padding:"20px 28px 48px",minWidth:0,overflowY:"auto"}}>

          {/* 헤더 */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
            <button onClick={()=>setSidebarOpen(v=>!v)} className="gbtn" style={{...glass(0.1),border:"none",borderRadius:10,width:40,height:40,color:"#fff",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center"}}>
              ☰
            </button>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {emotion !== "default" && (
                <div style={{...glass(0.1),borderRadius:20,padding:"7px 14px",fontSize:12,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:theme.to,display:"inline-block",boxShadow:`0 0 5px ${theme.to}88`}}/>
                  {emotion} 모드
                </div>
              )}
              <button className="gbtn" style={{...glass(0.12),border:"none",borderRadius:20,padding:"8px 22px",color:"#fff",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:7}}>
                <span>👤</span> 로그인
              </button>
            </div>
          </div>

          {/* ① 공지 배너 */}
          <div style={{...glass(0.1),borderRadius:16,padding:"13px 20px",marginBottom:18,display:"flex",alignItems:"center",gap:12,overflow:"hidden"}}>
            <div style={{...glass(0.15),borderRadius:7,padding:"3px 9px",fontSize:10,fontWeight:700,color:theme.to,whiteSpace:"nowrap",border:`1px solid ${theme.to}55`,flexShrink:0}}>
              {NOTICE[noticeIdx].type}
            </div>
            <div key={noticeIdx} style={{fontSize:13,fontWeight:500,flex:1,animation:"noticeIn 3.5s ease both"}}>
              {NOTICE[noticeIdx].text}
            </div>
            <div style={{display:"flex",gap:4,flexShrink:0}}>
              {NOTICE.map((_,i)=>(
                <div key={i} style={{width:5,height:5,borderRadius:"50%",background:i===noticeIdx?"#fff":"rgba(255,255,255,0.3)",transition:"all 0.3s"}}/>
              ))}
            </div>
          </div>

          {/* ② 감정 검색 */}
          <div style={{...glass(0.12),borderRadius:28,padding:"36px 40px",marginBottom:18,textAlign:"center",animation:"fadeInUp 0.6s 0.1s both"}}>
            <div style={{fontSize:11,opacity:0.5,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>AI Emotion Music Curator</div>
            <h1 style={{fontSize:"clamp(1.5rem,2.8vw,2.2rem)",fontWeight:700,letterSpacing:"-0.03em",lineHeight:1.25,marginBottom:28}}>
              지금 이 순간,{" "}
              <span style={{
                color: EMOTION_COMPLEMENT[emotion] || EMOTION_COMPLEMENT.default,
                textShadow:`0 0 24px ${EMOTION_COMPLEMENT[emotion] || EMOTION_COMPLEMENT.default}66`,
                transition:"color 1.8s ease, text-shadow 1.8s ease",
              }}>
                당신의 감정
              </span>을 들려주세요
            </h1>

            <div style={{...glass(0.09,32),borderRadius:20,padding:"20px 24px",maxWidth:580,margin:"0 auto"}}>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={e=>setInputText(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&(e.metaKey||e.ctrlKey)&&handleAnalyze()}
                placeholder={"오늘 하루 어땠나요?\n지금 느끼는 감정을 자유롭게 적어주세요..."}
                rows={3}
                style={{width:"100%",background:"transparent",border:"none",resize:"none",color:"#fff",fontSize:14,lineHeight:1.75,fontFamily:"inherit"}}
              />
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.1)",marginTop:4}}>
                <span style={{fontSize:11,opacity:0.3}}>⌘ + Enter</span>
                <button
                  onClick={handleAnalyze}
                  disabled={!inputText.trim()}
                  className="gbtn"
                  style={{
                    background: inputText.trim() ? `linear-gradient(135deg,${theme.from === "#0f0c29"?"#7c3aed":theme.from},${theme.to})` : "rgba(255,255,255,0.1)",
                    border:"none",borderRadius:12,padding:"10px 28px",
                    color:"#fff",fontSize:13,fontWeight:700,
                    opacity:inputText.trim()?1:0.4,
                    boxShadow: inputText.trim() ? `0 4px 16px ${theme.glow}33` : "none",
                  }}
                >
                  감정 분석하기 →
                </button>
              </div>
            </div>
          </div>

          {/* ③ 하단 — 인기 감정 + 차트 */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,animation:"fadeInUp 0.6s 0.2s both"}}>

            {/* 인기 감정 */}
            <div style={{...glass(0.09),borderRadius:22,padding:"22px 24px"}}>
              <div style={{fontSize:13,fontWeight:600,opacity:0.65,marginBottom:18,display:"flex",alignItems:"center",gap:7}}>
                🔥 <span>인기 감정 TOP 5</span>
              </div>
              {POPULAR.map((p,i)=>(
                <div key={i} className="gbtn" style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<4?14:0,padding:"4px 6px",borderRadius:8}}
                  onClick={()=>setEmotion(p.emotion)}>
                  <div style={{width:20,fontSize:11,fontWeight:700,opacity:0.4,textAlign:"right",flexShrink:0}}>{p.rank}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:500,marginBottom:5}}>{p.emotion}</div>
                    <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,0.1)",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${100-i*16}%`,background:`linear-gradient(90deg,${p.color}44,${p.color}88)`,borderRadius:2,transition:"width 1.2s ease"}}/>
                    </div>
                  </div>
                  <div style={{fontSize:11,opacity:0.45,flexShrink:0}}>{p.count}</div>
                </div>
              ))}
            </div>

            {/* 인기 차트 */}
            <div style={{...glass(0.09),borderRadius:22,padding:"22px 24px"}}>
              <div style={{fontSize:13,fontWeight:600,opacity:0.65,marginBottom:18,display:"flex",alignItems:"center",gap:7}}>
                📈 <span>인기 차트</span>
              </div>
              {CHART.map((c,i)=>(
                <div key={i} className="trow" style={{display:"flex",alignItems:"center",gap:12,padding:"8px 8px",marginBottom:4,cursor:"pointer"}}>
                  <div style={{width:18,fontSize:11,fontWeight:700,opacity:0.35,textAlign:"center",flexShrink:0}}>{c.rank}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title}</div>
                    <div style={{fontSize:11,opacity:0.45,marginTop:2}}>{c.artist}</div>
                  </div>
                  <div style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:`${EMOTION_GRADIENTS[c.emotion]?.to||"#fff"}22`,color:EMOTION_GRADIENTS[c.emotion]?.to||"#fff",border:`1px solid ${EMOTION_GRADIENTS[c.emotion]?.to||"#fff"}33`,whiteSpace:"nowrap",flexShrink:0}}>
                    {c.emotion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}