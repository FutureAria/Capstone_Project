import { useEffect, useState } from 'react'
import { auth, db } from '../lib/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { glass, glassDark, appBackground, getTheme, getDarkTheme, getComplement, getDarkComplement, GLOBAL_CSS } from '../styles/theme'

const provider = new GoogleAuthProvider()

export default function Auth({ onLogin, isDark = false, onToggleDark }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ── 다크/라이트 분기 테마 ──────────────────────────────────────────────────
  const theme      = isDark ? getDarkTheme('default') : getTheme('default')
  const complement = isDark ? getDarkComplement('default') : getComplement('default')
  const G          = isDark ? glassDark : glass

  // ── 색상 변수 ──────────────────────────────────────────────────────────────
  const TC     = theme.text || (isDark ? '#c0c8f0' : '#0a1830')
  const SC     = isDark ? 'rgba(180,190,255,0.50)' : 'rgba(20,40,90,0.50)'
  const ACCENT = isDark ? '#7080f0' : '#3541e5'
  const gbtn   = isDark ? 'gbtn gbtn-dark' : 'gbtn gbtn-light'

  useEffect(() => {
    let cancelled = false
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result || cancelled) return
        const user = result.user
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName, email: user.email, createdAt: new Date(),
        }, { merge: true })
        onLogin(user)
      })
      .catch((err) => {
        console.error('Google redirect login failed:', err)
        if (!cancelled) setError('Google 로그인에 실패했어요. Firebase 도메인 설정을 확인해주세요.')
      })
    return () => { cancelled = true }
  }, [onLogin])

  // ── 유효성 검사 ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요'); return }
    if (!isLogin && !name) { setError('이름을 입력해주세요'); return }
    if (!isLogin) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])(.{8,})$/
      if (!passwordRegex.test(password)) {
        setError('비밀번호는 8자 이상, 소문자·숫자·특수문자(!@#$%^&*)를 포함해야 해요')
        return
      }
    }
    setLoading(true)
    setError('')
    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password)
        onLogin(result.user)
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(result.user, { displayName: name })
        await setDoc(doc(db, 'users', result.user.uid), {
          name, email, createdAt: new Date(),
        })
        onLogin({ ...result.user, displayName: name })
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('존재하지 않는 계정이에요')
      else if (err.code === 'auth/wrong-password') setError('비밀번호가 틀렸어요')
      else if (err.code === 'auth/email-already-in-use') setError('이미 사용중인 이메일이에요')
      else if (err.code === 'auth/weak-password') setError('비밀번호는 6자 이상이어야 해요')
      else if (err.code === 'auth/invalid-email') setError('이메일 형식이 올바르지 않아요')
      else if (err.code === 'auth/invalid-credential') setError('이메일 또는 비밀번호가 틀렸어요')
      else setError('오류가 발생했어요. 다시 시도해주세요')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName, email: user.email, createdAt: new Date(),
      }, { merge: true })
      onLogin(user)
    } catch (err) {
      console.error('Google popup login failed:', err)
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, provider)
        return
      }
      setError('Google 로그인에 실패했어요. Firebase 도메인 설정을 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) { setError('이메일을 입력해주세요'); return }
    try {
      await sendPasswordResetEmail(auth, email)
      setError('')
      alert('비밀번호 재설정 이메일을 보냈어요! 메일함을 확인해주세요 📧')
    } catch (err) {
      setError('이메일을 찾을 수 없어요')
    }
  }

  // ── 입력창: 다크/라이트 유리 분기 ───────────────────────────────────────
  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: '12px',
    fontSize: '15px', color: TC,
    border: 'none',
    ...G(0.65, 20),
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{
        ...appBackground(theme, isDark),
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        position: 'relative',
      }}>

        {/* ── 로고: Sidebar.jsx 코드와 완전히 동일 ──────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6a1a6a, #3a1060)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(106,26,106,0.4)',
            border: '1px solid rgba(255,255,255,0.15)',
            gap: '2px',
          }}>
            {/* Sidebar.jsx SVG — || ▶ (일시정지 두 줄 + 재생 삼각형) */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="5" width="3" height="14" rx="1"/>
              <rect x="11" y="5" width="3" height="14" rx="1"/>
              <path d="M16 5v14l6-7z"/>
            </svg>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: TC, whiteSpace: 'nowrap' }}>
            Music Curation
          </span>
        </div>

        {/* ── 다크모드 토글 ────────────────────────────────────────────────── */}
        {onToggleDark && (
          <button
            onClick={onToggleDark}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '20px', opacity: 0.6, transition: 'opacity 0.2s',
            }}
            title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        )}

        {/* ── 탭: 다크/라이트 유리 분기 ────────────────────────────────────── */}
        <div style={{
          display: 'flex', borderRadius: '14px', padding: '4px',
          marginBottom: '28px', width: '100%', maxWidth: '340px',
          gap: '4px',
          ...G(0.55, 20),
        }}>
          <button
            onClick={() => { setIsLogin(true); setError('') }}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
              background: isLogin ? ACCENT : 'transparent',
              color: isLogin ? '#fff' : SC,
              cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              boxShadow: isLogin ? `0 2px 10px ${ACCENT}55` : 'none',
              transition: 'all 0.2s',
            }}
          >로그인</button>
          <button
            onClick={() => { setIsLogin(false); setError('') }}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
              background: !isLogin ? ACCENT : 'transparent',
              color: !isLogin ? '#fff' : SC,
              cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              boxShadow: !isLogin ? `0 2px 10px ${ACCENT}55` : 'none',
              transition: 'all 0.2s',
            }}
          >회원가입</button>
        </div>

        {/* ── 폼 영역 ─────────────────────────────────────────────────────── */}
        <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {!isLogin && (
            <input
              type="text" placeholder="이름" value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={inputStyle}
            />
          )}

          <input
            type="email" placeholder="이메일" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="비밀번호 (8자 이상, 소문자·숫자·특수문자 포함)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={inputStyle}
          />

          {/* ── 에러 메시지: 다크/라이트 분기 ───────────────────────────── */}
          {error && (
            <p style={{ color: isDark ? '#f08080' : '#c62828', fontSize: '13px', textAlign: 'center' }}>
              {error}
            </p>
          )}

          {/* ── 제출 버튼 ─────────────────────────────────────────────────── */}
          <button
            onClick={handleSubmit} disabled={loading}
            className={`gbtn ${gbtn}`}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
              background: loading
                ? (isDark ? 'rgba(100,110,220,0.4)' : '#848adc90')
                : `linear-gradient(135deg, ${ACCENT} 0%, ${isDark ? '#9040c0' : '#c62828'} 100%)`,
              color: '#fff', fontSize: '15px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: `0 4px 18px ${ACCENT}44`,
              transition: 'all 0.2s',
            }}
          >
            {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
          </button>

          {/* ── 구분선 ────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '0.5px', background: isDark ? 'rgba(180,190,255,0.15)' : 'rgba(20,40,90,0.15)' }} />
            <span style={{ fontSize: '12px', color: SC }}>또는</span>
            <div style={{ flex: 1, height: '0.5px', background: isDark ? 'rgba(180,190,255,0.15)' : 'rgba(20,40,90,0.15)' }} />
          </div>

          {/* ── 구글 로그인 버튼: 다크/라이트 유리 분기 ────────────────────── */}
          <button
            onClick={handleGoogleLogin} disabled={loading}
            className={`gbtn ${gbtn}`}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px',
              color: TC, fontSize: '15px', fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: 'all 0.2s',
              border: 'none',
              ...G(0.65, 20),
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            Google로 {isLogin ? '로그인' : '회원가입'}
          </button>

          {/* ── 비밀번호 찾기 ─────────────────────────────────────────────── */}
          {isLogin && (
            <button
              onClick={handleResetPassword}
              style={{
                background: 'none', border: 'none', color: SC,
                fontSize: '13px', cursor: 'pointer',
                textDecoration: 'underline', textUnderlineOffset: '3px',
                textAlign: 'center', marginTop: '4px',
                transition: 'color 0.2s',
              }}
            >
              비밀번호를 잊으셨나요?
            </button>
          )}
        </div>
      </div>
    </>
  )
}
