// src/styles/theme.js
// ─────────────────────────────────────────────
// 팀 공유 파일 — 이 파일을 import해서 UI 통일
// ─────────────────────────────────────────────

// ── 감정별 그라데이션 테마 ──
export const EMOTION_GRADIENTS = {
  기쁨:    { from:"#5c2e28", to:"#a04848", glow:"#8a3a3a" },
  설렘:    { from:"#5c2a44", to:"#7a3a6e", glow:"#6b3358" },
  평온:    { from:"#0e3d35", to:"#1e5c48", glow:"#175040" },
  슬픔:    { from:"#0e1f38", to:"#1e3a5c", glow:"#1a3050" },
  분노:    { from:"#3d0e0e", to:"#6b2020", glow:"#5a1818" },
  불안:    { from:"#1e0e36", to:"#3a1a60", glow:"#2e1450" },
  집중:    { from:"#061828", to:"#0a3050", glow:"#083a5c" },
  피로:    { from:"#141414", to:"#2a2a2a", glow:"#222222" },
  default: { from:"#080818", to:"#141430", glow:"#101028" },
};

// ── 감정별 보색 (텍스트 강조용) ──
export const EMOTION_COMPLEMENT = {
  기쁨:    "#f2c4b8",  // 살구 파스텔
  설렘:    "#f0b8d8",  // 핑크 파스텔
  평온:    "#b8e8d8",  // 민트 파스텔
  슬픔:    "#b8d4f0",  // 하늘 파스텔
  분노:    "#f0c8b8",  // 피치 파스텔
  불안:    "#d8b8f0",  // 라벤더 파스텔
  집중:    "#b8ddf0",  // 아이스블루 파스텔
  피로:    "#d8d0c8",  // 웜베이지 파스텔
  default: "#c8cce8",  // 퍼플 파스텔
};

// ── 글래스 스타일 함수 ──
// 사용법: style={{ ...glass(0.12) }}
export const glass = (opacity = 0.12, blur = 24) => ({
  background: `rgba(255,255,255,${opacity})`,
  backdropFilter: `blur(${blur}px) saturate(180%)`,
  WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
  border: "1px solid rgba(255,255,255,0.2)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)",
});

// ── 배경 전체 래퍼 스타일 함수 ──
// 사용법: style={{ ...pageBackground(theme) }}
export const pageBackground = (theme) => ({
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 55%, ${theme.glow}66 100%)`,
  transition: "background 2s cubic-bezier(0.4,0,0.2,1)",
  fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  color: "#fff",
  position: "relative",
  overflow: "hidden",
});

// ── 공통 CSS (index.css 또는 App.jsx style 태그에 한 번만 추가) ──
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.2); border-radius:2px; }
  textarea:focus, input:focus { outline:none; }
  textarea::placeholder { color:rgba(255,255,255,0.35); }
  @keyframes fadeInUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes slideUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes noticeIn {
    0%   { opacity:0; transform:translateY(6px);  }
    15%  { opacity:1; transform:translateY(0);    }
    85%  { opacity:1; transform:translateY(0);    }
    100% { opacity:0; transform:translateY(-6px); }
  }
  .gbtn { transition:all 0.2s ease !important; cursor:pointer; }
  .gbtn:hover { background:rgba(255,255,255,0.22) !important; transform:translateY(-1px); }
  .trow:hover { background:rgba(255,255,255,0.08) !important; border-radius:10px; }
`;

// ── 테마 가져오기 헬퍼 ──
export const getTheme = (emotion) =>
  EMOTION_GRADIENTS[emotion] || EMOTION_GRADIENTS.default;

export const getComplement = (emotion) =>
  EMOTION_COMPLEMENT[emotion] || EMOTION_COMPLEMENT.default;
