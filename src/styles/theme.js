// src/styles/theme.js

// ────────────────────────────────────────────
// LIGHT 모드 테마
// ────────────────────────────────────────────
export const EMOTION_GRADIENTS = {
  기쁨:    { from:"#fce4ec", mid:"#e3f2fd", to:"#fff9c4", text:"#3a1a2a" },
  설렘:    { from:"#f3e5f5", mid:"#fce4ec", to:"#ffd6f0", text:"#2a1a3a" },
  평온:    { from:"#e0f7fa", mid:"#e8f5e9", to:"#f0f4ff", text:"#0a2a24" },
  슬픔:    { from:"#e8eaf6", mid:"#e3f2fd", to:"#e0f2f1", text:"#0a1a30" },
  분노:    { from:"#fce4ec", mid:"#fff3e0", to:"#fbe9e7", text:"#3a0a0a" },
  불안:    { from:"#ede7f6", mid:"#e8eaf6", to:"#e3f2fd", text:"#1a0a3a" },
  집중:    { from:"#e3f2fd", mid:"#e8eaf6", to:"#f3e5f5", text:"#0a1830" },
  피로:    { from:"#f5f5f5", mid:"#efebe9", to:"#fafafa", text:"#1a1814" },
  default: { from:"#e8f4ff", mid:"#ede8ff", to:"#f0f8ff", text:"#0a1830" },
}

export const EMOTION_COMPLEMENT = {
  기쁨:"#d44070", 설렘:"#a030a0", 평온:"#208060",
  슬픔:"#2060b0", 분노:"#c03020", 불안:"#6020c0",
  집중:"#1060c0", 피로:"#806040", default:"#4060c0",
}

// ────────────────────────────────────────────
// DARK 모드 테마 (2번 스크린샷: 어두운 네이비/퍼플)
// ────────────────────────────────────────────
export const DARK_EMOTION_GRADIENTS = {
  기쁨:    { from:"#1a0a20", mid:"#200a30", to:"#18102a", text:"#f0d0e8" },
  설렘:    { from:"#1a0828", mid:"#220a38", to:"#160820", text:"#ecc0e0" },
  평온:    { from:"#061828", mid:"#081e30", to:"#061420", text:"#a0d8cc" },
  슬픔:    { from:"#080e20", mid:"#0a1428", to:"#060c1c", text:"#a0b8e0" },
  분노:    { from:"#1e0808", mid:"#280a0a", to:"#160606", text:"#e8b0a0" },
  불안:    { from:"#100620", mid:"#160828", to:"#0c0418", text:"#c8a0e8" },
  집중:    { from:"#060e20", mid:"#081428", to:"#060a18", text:"#90c0e8" },
  피로:    { from:"#0e0e0e", mid:"#141414", to:"#0a0a0a", text:"#c0b8b0" },
  default: { from:"#080818", mid:"#0e1030", to:"#08081e", text:"#c0c8f0" },
}

export const DARK_EMOTION_COMPLEMENT = {
  기쁨:"#f0a0c0", 설렘:"#d080d0", 평온:"#60c0a0",
  슬픔:"#60a0d8", 분노:"#e08060", 불안:"#a060d8",
  집중:"#60a8e0", 피로:"#b0a080", default:"#8090d8",
}

// ────────────────────────────────────────────
// LIGHT 글래스
// ────────────────────────────────────────────
export const glass = (opacity = 0.60, blur = 24) => ({
  background: `rgba(255,255,255,${opacity})`,
  backdropFilter: `blur(${blur}px) saturate(180%) brightness(1.04)`,
  WebkitBackdropFilter: `blur(${blur}px) saturate(180%) brightness(1.04)`,
  border: "1px solid rgba(255,255,255,0.75)",
  boxShadow: "0 4px 24px rgba(100,120,200,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
})

// DARK 글래스
export const glassDark = (opacity = 0.15, blur = 28) => ({
  background: `rgba(40,55,140,${Math.min(opacity * 1.8, 0.45)})`,
  backdropFilter: `blur(${blur}px) saturate(180%) brightness(1.15)`,
  WebkitBackdropFilter: `blur(${blur}px) saturate(180%) brightness(1.15)`,
  border: "1px solid rgba(140,160,255,0.28)",
  boxShadow: [
    "0 8px 32px rgba(0,0,30,0.55)",
    "inset 0 1px 0 rgba(180,200,255,0.22)",
    "inset 0 -1px 0 rgba(60,80,200,0.15)",
    "0 0 0 0.5px rgba(100,120,255,0.12)",
  ].join(", "),
})

// ────────────────────────────────────────────
// 전체 앱 배경 (App.jsx 래퍼용)
// ────────────────────────────────────────────
export const appBackground = (theme, isDark) => ({
  background: isDark
    ? `linear-gradient(145deg, ${theme.from} 0%, ${theme.mid} 50%, ${theme.to} 100%)`
    : `linear-gradient(145deg, ${theme.from} 0%, ${theme.mid} 50%, ${theme.to} 100%)`,
  transition: "background 1.5s cubic-bezier(0.4,0,0.2,1)",
  minHeight: "100vh",
  fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  color: theme.text || (isDark ? "#c0c8f0" : "#0a1830"),
})

// pageBackground (콘텐츠 영역 - 투명)
export const pageBackground = () => ({
  minHeight: "100vh",
  background: "transparent",
  fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
})

// ────────────────────────────────────────────
// 사이드바 글래스
// ────────────────────────────────────────────
export const sidebarGlass = () => ({
  background: "rgba(255,255,255,0.52)",
  backdropFilter: "blur(40px) saturate(200%) brightness(1.08)",
  WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.08)",
  border: "1px solid rgba(255,255,255,0.80)",
  boxShadow: "0 8px 48px rgba(100,120,200,0.14), inset 0 1px 0 rgba(255,255,255,0.95)",
})

export const sidebarGlassDark = () => ({
  background: "rgba(25,35,100,0.62)",
  backdropFilter: "blur(48px) saturate(200%) brightness(1.12)",
  WebkitBackdropFilter: "blur(48px) saturate(200%) brightness(1.12)",
  border: "1px solid rgba(140,160,255,0.22)",
  boxShadow: [
    "0 12px 56px rgba(0,0,30,0.65)",
    "inset 0 1px 0 rgba(180,200,255,0.18)",
    "inset 0 -1px 0 rgba(60,80,200,0.12)",
    "0 0 0 0.5px rgba(100,120,255,0.10)",
  ].join(", "),
})

// ────────────────────────────────────────────
// 공통 CSS
// ────────────────────────────────────────────
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:rgba(100,120,200,0.2); border-radius:2px; }
  textarea:focus, input:focus { outline:none; }
  textarea::placeholder { color:rgba(60,80,140,0.35); }
  input::placeholder { color:rgba(60,80,140,0.35); }
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
  .gbtn:hover { transform:translateY(-1px); }
  .gbtn-light:hover { background:rgba(255,255,255,0.80) !important; box-shadow:0 4px 16px rgba(100,120,200,0.14) !important; }
  .gbtn-dark:hover  { background:rgba(60,80,200,0.35) !important; box-shadow:0 4px 20px rgba(0,0,40,0.4), inset 0 1px 0 rgba(180,200,255,0.25) !important; border-color:rgba(140,160,255,0.3) !important; }
  .trow-light:hover { background:rgba(255,255,255,0.55) !important; border-radius:10px; }
  .trow-dark:hover  { background:rgba(50,70,180,0.25) !important; border-radius:10px; }
`

// ────────────────────────────────────────────
// 헬퍼
// ────────────────────────────────────────────
export const getTheme = (emotion) => EMOTION_GRADIENTS[emotion] || EMOTION_GRADIENTS.default
export const getComplement = (emotion) => EMOTION_COMPLEMENT[emotion] || EMOTION_COMPLEMENT.default
export const getDarkTheme = (emotion) => DARK_EMOTION_GRADIENTS[emotion] || DARK_EMOTION_GRADIENTS.default
export const getDarkComplement = (emotion) => DARK_EMOTION_COMPLEMENT[emotion] || DARK_EMOTION_COMPLEMENT.default