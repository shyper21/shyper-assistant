import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Head from 'next/head'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    if (!email || !email.includes('@')) {
      setError('Masukkan email yang valid.')
      return
    }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback` }
    })
    setLoading(false)
    if (err) {
      setError(`Error: ${err.message}`)
    } else {
      setSent(true)
    }
  }

  return (
    <>
      <Head>
        <title>Jarvis — Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Rajdhani:wght@300;400;600&display=swap" rel="stylesheet" />
      </Head>
      <div className="root">
        <div className="bg-grid" />
        <div className="vignette" />
        <div className="card">
          <h1 className="title">J.A.R.V.I.S</h1>
          <p className="subtitle">PERSONAL AI ASSISTANT</p>
          <div className="orb">
            <svg viewBox="0 0 80 80" width="48" height="48" fill="none">
              <circle cx="40" cy="28" r="14" stroke="#9d4edd" strokeWidth="1.5"/>
              <path d="M18 68c0-12.15 9.85-22 22-22s22 9.85 22 22" stroke="#9d4edd" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="40" cy="28" r="6" fill="#9d4edd" opacity="0.4"/>
            </svg>
          </div>
          {!sent ? (
            <>
              <p className="desc">Masukkan email Anda untuk mendapatkan magic link login.</p>
              <input
                className="input"
                type="email"
                placeholder="email@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoFocus
              />
              {error && <p className="error">{error}</p>}
              <button className="btn" onClick={handleLogin} disabled={loading}>
                {loading ? 'Mengirim...' : 'Kirim Magic Link'}
              </button>
            </>
          ) : (
            <div className="success">
              <p>Link login dikirim ke</p>
              <p className="email-sent">{email}</p>
              <p className="hint">Cek inbox dan spam. Klik link di email untuk masuk.</p>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #05030f; color: #e0d7ff; font-family: 'Rajdhani', sans-serif; }
      `}</style>
      <style jsx>{`
        .root { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; position:relative; }
        .bg-grid { position:fixed; inset:0; background-image:linear-gradient(rgba(106,90,205,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(106,90,205,0.05) 1px,transparent 1px); background-size:40px 40px; }
        .vignette { position:fixed; inset:0; background:radial-gradient(ellipse at center,transparent 20%,#05030f 75%); }
        .card { position:relative; z-index:1; background:rgba(20,10,40,0.9); border:1px solid rgba(157,78,221,0.3); border-radius:20px; padding:40px 32px; width:100%; max-width:380px; display:flex; flex-direction:column; align-items:center; gap:16px; }
        .title { font-family:'Cinzel',serif; font-size:1.8rem; font-weight:700; letter-spacing:0.25em; background:linear-gradient(135deg,#c77dff,#6a5acd,#e0aaff); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .subtitle { font-size:0.55rem; letter-spacing:0.22em; color:#4a3d7a; }
        .orb { width:72px; height:72px; border-radius:50%; background:radial-gradient(circle at 35% 35%,#1a1035,#05030f); border:1px solid rgba(157,78,221,0.4); display:flex; align-items:center; justify-content:center; margin:8px 0; }
        .desc { font-size:0.85rem; color:#8a7ab8; text-align:center; line-height:1.5; }
        .input { width:100%; background:rgba(10,5,25,0.8); border:1px solid rgba(106,90,205,0.4); border-radius:12px; padding:12px 16px; color:#d0c4f4; font-size:1rem; font-family:'Rajdhani',sans-serif; outline:none; text-align:center; }
        .input:focus { border-color:rgba(157,78,221,0.7); }
        .btn { width:100%; padding:12px; background:linear-gradient(135deg,#7c3aed,#9d4edd); border:none; border-radius:12px; color:#fff; font-family:'Rajdhani',sans-serif; font-size:1rem; font-weight:600; letter-spacing:0.1em; cursor:pointer; }
        .btn:disabled { opacity:0.5; cursor:not-allowed; }
        .error { color:#ff6b6b; font-size:0.82rem; }
        .success { text-align:center; display:flex; flex-direction:column; gap:8px; }
        .success p { color:#8a7ab8; font-size:0.9rem; }
        .email-sent { color:#c77dff; font-size:1rem; font-weight:600; }
        .hint { font-size:0.78rem; color:#5a4f8a; }
      `}</style>
    </>
  )
}
