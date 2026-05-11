import { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'

const WAKE_WORDS = ['jarvis', 'hey jarvis', 'hei jarvis', 'jarves']
const LANG = 'id-ID'

export default function Jarvis() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  const [status, setStatus] = useState('idle')
  const [liveText, setLiveText] = useState('')
  const [command, setCommand] = useState('')
  const [response, setResponse] = useState('')
  const [inputText, setInputText] = useState('')
  const awakeRef = useRef(false)
  const recognitionRef = useRef(null)
  const commandTimerRef = useRef(null)

  // ─── Android TTS ───────────────────────────────────────
  const speak = useCallback((text) => {
    // Try Android native TTS first
    if (window.AndroidTTS && typeof window.AndroidTTS.speak === 'function') {
      window.AndroidTTS.speak(text)
      return
    }
    // Fallback: browser TTS
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = LANG
    utt.rate = 1.0
    utt.pitch = 0.85
    utt.onstart = () => setStatus('speaking')
    utt.onend = () => { setStatus('listening'); awakeRef.current = false }
    window.speechSynthesis.speak(utt)
  }, [])

  // ─── Android Command Handler ────────────────────────────
  const handleAndroidCommands = useCallback((text) => {
    if (!window.AndroidLauncher) return false

    const ytMatch = text.match(/\[OPEN_YOUTUBE:(.*?)\]/)
    if (ytMatch) { window.AndroidLauncher.openYouTube(ytMatch[1].trim()); return true }

    if (text.includes('[OPEN_CAMERA]')) { window.AndroidLauncher.openCamera(); return true }
    if (text.includes('[OPEN_WHATSAPP]')) { window.AndroidLauncher.openWhatsApp(); return true }
    if (text.includes('[OPEN_SETTINGS]')) { window.AndroidLauncher.openSettings(); return true }

    const mapsMatch = text.match(/\[OPEN_MAPS:(.*?)\]/)
    if (mapsMatch) { window.AndroidLauncher.openMaps(mapsMatch[1].trim()); return true }

    return false
  }, [])

  // ─── Ask Jarvis ─────────────────────────────────────────
  const askJarvis = useCallback(async (cmd) => {
    if (!cmd || cmd.trim().length < 2) return
    setStatus('thinking')
    setCommand(cmd)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: cmd }],
          session_id: 'jarvis-web',
        }),
      })
      const data = await res.json()
      const reply = data?.choices?.[0]?.message?.content || 'Maaf, tidak ada respons.'

      // Check for Android commands
      if (handleAndroidCommands(reply)) {
        setStatus('listening')
        awakeRef.current = false
        return
      }

      setResponse(reply)
      speak(reply)
      setStatus('speaking')
    } catch {
      const err = 'Tidak bisa terhubung ke server.'
      setResponse(err)
      speak(err)
      setStatus('listening')
    }
  }, [speak, handleAndroidCommands])

  // ─── Speech Recognition ──────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setStatus('unsupported'); return }

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = LANG
    recognitionRef.current = recognition

    recognition.onstart = () => setStatus('listening')

    recognition.onresult = (e) => {
      let interim = '', final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript.toLowerCase().trim()
        if (e.results[i].isFinal) final = t
        else interim = t
      }
      const heard = final || interim
      setLiveText(heard)

      const foundWake = WAKE_WORDS.find(w => heard.includes(w))
      if (foundWake) {
        const afterWake = heard.split(foundWake).pop().trim()
        if (afterWake && afterWake.length > 2) {
          awakeRef.current = false
          if (commandTimerRef.current) clearTimeout(commandTimerRef.current)
          askJarvis(afterWake)
        } else {
          awakeRef.current = true
          setStatus('awake')
          setResponse('')
          setCommand('')
          window.speechSynthesis?.cancel()
          if (commandTimerRef.current) clearTimeout(commandTimerRef.current)
          commandTimerRef.current = setTimeout(() => {
            if (awakeRef.current) { awakeRef.current = false; setStatus('listening') }
          }, 7000)
        }
        return
      }

      if (awakeRef.current && final) {
        awakeRef.current = false
        if (commandTimerRef.current) clearTimeout(commandTimerRef.current)
        askJarvis(final)
      }
    }

    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') setStatus('unsupported')
    }

    recognition.onend = () => {
      setTimeout(() => { try { recognition.start() } catch {} }, 300)
    }

    recognition.start()

    // ─── Expose to Android Native ──────────────────────────
    window.startListening = () => {
      awakeRef.current = true
      setStatus('awake')
      setResponse('')
      setCommand('')
      try { recognition.start() } catch {}
    }

    window.stopListening = () => {
      awakeRef.current = false
      setStatus('listening')
      try { recognition.stop() } catch {}
      setTimeout(() => { try { recognition.start() } catch {} }, 500)
    }

    return () => {
      try { recognition.stop() } catch {}
      if (commandTimerRef.current) clearTimeout(commandTimerRef.current)
      delete window.startListening
      delete window.stopListening
    }
  }, [askJarvis])

  // ─── Text Input Submit ───────────────────────────────────
  const handleTextSubmit = () => {
    if (!inputText.trim()) return
    askJarvis(inputText.trim())
    setInputText('')
  }

  const statusConfig = {
    idle:        { label: 'Standby',        color: '#4a4a6a', pulse: false },
    listening:   { label: 'Mendengarkan',   color: '#6a5acd', pulse: true  },
    awake:       { label: 'Siap!',          color: '#9d4edd', pulse: true  },
    thinking:    { label: 'Memproses...',   color: '#c77dff', pulse: true  },
    speaking:    { label: 'Berbicara',      color: '#e0aaff', pulse: true  },
    unsupported: { label: 'Tidak Didukung', color: '#ff4444', pulse: false },
  }
  const s = statusConfig[status] || statusConfig.idle

  return (
    <>
      <Head>
        <title>Jarvis — AI Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Rajdhani:wght@300;400;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="root">
        <div className="bg-grid" />
        <div className="vignette" />

        <header>
          <span className="title">J.A.R.V.I.S</span>
          <span className="subtitle">PERSONAL AI ASSISTANT</span>
        </header>

        <main>
          <div className={`orb-wrap ${s.pulse ? 'pulsing' : ''}`}>
            <div className="ring r3" /><div className="ring r2" /><div className="ring r1" />
            <div className="orb" style={{ boxShadow: `0 0 50px ${s.color}88, 0 0 100px ${s.color}33` }}>
              <svg viewBox="0 0 80 80" width="56" height="56" fill="none">
                <circle cx="40" cy="28" r="14" stroke={s.color} strokeWidth="1.5"/>
                <path d="M18 68c0-12.15 9.85-22 22-22s22 9.85 22 22" stroke={s.color} strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="40" cy="28" r="6" fill={s.color} opacity="0.4"/>
              </svg>
            </div>
          </div>

          <div className="badge" style={{ borderColor: s.color, color: s.color }}>
            {s.pulse && <span className="dot" style={{ background: s.color }} />}
            {s.label}
          </div>

          <div className="live-box">
            <span className="live-label">🎙 MENDENGAR SEKARANG</span>
            <p className="live-text">{liveText || '...'}</p>
          </div>

          {status === 'listening' && (
            <p className="hint">Ucap <strong>"Jarvis"</strong> atau <strong>"Jarvis [perintah]"</strong> langsung</p>
          )}
          {status === 'awake' && (
            <p className="hint active">Jarvis siap — ucapkan perintahmu sekarang</p>
          )}

          {command && (
            <div className="bubble you-bubble">
              <span className="blabel">KAMU</span>
              <p>{command}</p>
            </div>
          )}

          {response && (
            <div className="bubble ai-bubble">
              <span className="blabel">JARVIS</span>
              <p>{response}</p>
            </div>
          )}

          {status === 'unsupported' && (
            <div className="bubble ai-bubble">
              <p>Gunakan <strong>Chrome</strong> di Android dan izinkan akses mikrofon.</p>
            </div>
          )}

          {/* Text Input */}
          <div className="text-input-row">
            <input
              className="text-input"
              type="text"
              placeholder="Ketik pesan ke Jarvis..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
            />
            <button className="send-btn" onClick={handleTextSubmit}>▶</button>
          </div>
        </main>

        <footer>Powered by Groq · Vercel · Railway</footer>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #05030f; color: #e0d7ff; font-family: 'Rajdhani', sans-serif; overflow-x: hidden; }
      `}</style>

      <style jsx>{`
        .root { min-height:100vh; display:flex; flex-direction:column; align-items:center; padding:24px 20px 80px; position:relative; }
        .bg-grid { position:fixed; inset:0; z-index:0; background-image:linear-gradient(rgba(106,90,205,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(106,90,205,0.05) 1px,transparent 1px); background-size:40px 40px; }
        .vignette { position:fixed; inset:0; z-index:0; background:radial-gradient(ellipse at center,transparent 20%,#05030f 75%); }
        header { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:4px; margin-bottom:24px; }
        .title { font-family:'Cinzel',serif; font-size:2.2rem; font-weight:700; letter-spacing:0.25em; background:linear-gradient(135deg,#c77dff,#6a5acd,#e0aaff); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .subtitle { font-size:0.6rem; letter-spacing:0.22em; color:#4a3d7a; font-weight:300; }
        main { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:14px; width:100%; max-width:480px; flex:1; }
        .orb-wrap { position:relative; width:140px; height:140px; display:flex; align-items:center; justify-content:center; }
        .ring { position:absolute; border-radius:50%; border:1px solid rgba(106,90,205,0.2); animation:spin linear infinite; }
        .r1 { width:100%; height:100%; animation-duration:8s; border-color:rgba(157,78,221,0.3); }
        .r2 { width:78%; height:78%; animation-duration:14s; animation-direction:reverse; }
        .r3 { width:122%; height:122%; animation-duration:22s; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .orb { width:100px; height:100px; border-radius:50%; background:radial-gradient(circle at 35% 35%,#1a1035,#05030f); border:1px solid rgba(157,78,221,0.4); display:flex; align-items:center; justify-content:center; transition:box-shadow 0.5s; position:relative; z-index:2; }
        .pulsing .orb { animation:pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        .badge { display:flex; align-items:center; gap:8px; padding:5px 16px; border:1px solid; border-radius:20px; font-size:0.72rem; letter-spacing:0.15em; font-weight:600; text-transform:uppercase; transition:all 0.4s; }
        .dot { width:7px; height:7px; border-radius:50%; animation:blink 1.2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
        .live-box { width:100%; background:rgba(20,10,40,0.7); border:1px solid rgba(106,90,205,0.25); border-radius:12px; padding:12px 16px; }
        .live-label { font-size:0.58rem; letter-spacing:0.2em; color:#5a4f8a; display:block; margin-bottom:6px; }
        .live-text { font-size:1rem; color:#a898d8; line-height:1.5; min-height:24px; font-style:italic; }
        .hint { font-size:0.82rem; color:#6a5acd; text-align:center; }
        .hint strong { color:#c77dff; }
        .hint.active { color:#c77dff; font-weight:600; }
        .bubble { width:100%; border-radius:12px; padding:12px 16px; }
        .you-bubble { background:rgba(106,90,205,0.1); border:1px solid rgba(106,90,205,0.3); }
        .ai-bubble { background:rgba(157,78,221,0.08); border:1px solid rgba(157,78,221,0.25); }
        .blabel { font-size:0.58rem; letter-spacing:0.2em; font-weight:600; color:#9d4edd; display:block; margin-bottom:6px; }
        .bubble p { font-size:0.95rem; line-height:1.65; color:#d0c4f4; }
        .text-input-row { width:100%; display:flex; gap:8px; align-items:center; margin-top:4px; }
        .text-input { flex:1; background:rgba(20,10,40,0.8); border:1px solid rgba(106,90,205,0.3); border-radius:24px; padding:10px 16px; color:#d0c4f4; font-size:0.95rem; font-family:'Rajdhani',sans-serif; outline:none; }
        .text-input::placeholder { color:#4a3d7a; }
        .text-input:focus { border-color:rgba(157,78,221,0.6); }
        .send-btn { width:42px; height:42px; border-radius:50%; background:#7c3aed; border:none; color:#fff; font-size:1rem; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .send-btn:active { background:#6d28d9; }
        footer { position:relative; z-index:1; margin-top:16px; font-size:0.6rem; color:#2a2245; letter-spacing:0.1em; text-transform:uppercase; }
      `}</style>
    </>
  )
}
