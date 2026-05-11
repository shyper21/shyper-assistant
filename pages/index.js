import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Head from 'next/head'

const LANG = 'id-ID'

// ════════════════════════════════════════════════════════════════
//  CID AVATAR — Stylized Shadow / Cid Kagenou
//  Silver hair · Purple eyes · Black cape · Cold expression
//  Animations: idle breathing, blink, hair sway, cape sway
// ════════════════════════════════════════════════════════════════
function CidAvatar({ status, color }) {
  return (
    <div className={`cid-avatar status-${status}`}>
      <svg viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="hairGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#f4f4f8" />
            <stop offset="45%" stopColor="#c8c8d4" />
            <stop offset="100%" stopColor="#6a6a82" />
          </linearGradient>
          <linearGradient id="hairShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4a4a60" stopOpacity="0.55" />
            <stop offset="50%" stopColor="transparent" />
            <stop offset="100%" stopColor="#4a4a60" stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id="eyeGrad" cx="0.5" cy="0.5">
            <stop offset="0%" stopColor="#f0d4ff" />
            <stop offset="35%" stopColor="#c77dff" />
            <stop offset="75%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2d0852" />
          </radialGradient>
          <linearGradient id="capeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#181020" />
            <stop offset="60%" stopColor="#0a0612" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#f6e6d6" />
            <stop offset="100%" stopColor="#d8bca4" />
          </linearGradient>
          <radialGradient id="auraGrad" cx="0.5" cy="0.5">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="55%" stopColor={color} stopOpacity="0.1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Aura behind */}
        <ellipse cx="150" cy="200" rx="145" ry="175" fill="url(#auraGrad)" />

        {/* Cape — gently swaying */}
        <g className="cape-group">
          <path d="M 30 380 Q 48 250 88 218 L 212 218 Q 252 250 270 380 Z" fill="url(#capeGrad)" />
          <path d="M 75 380 L 88 285 L 102 380 Z" fill="#000" opacity="0.45" />
          <path d="M 225 380 L 212 285 L 198 380 Z" fill="#000" opacity="0.45" />
          <path d="M 150 218 L 150 380" stroke="#1a0d2e" strokeWidth="0.6" opacity="0.5" />
        </g>

        {/* Collar — high mandarin style */}
        <path d="M 95 222 Q 115 200 150 200 Q 185 200 205 222 L 200 248 Q 175 234 150 234 Q 125 234 100 248 Z" fill="#0a0612" stroke="#1f1230" strokeWidth="1" />

        {/* Neck */}
        <path d="M 132 196 L 132 224 L 168 224 L 168 196 Z" fill="url(#skinGrad)" />
        <path d="M 132 218 Q 150 226 168 218 L 168 224 Q 150 232 132 224 Z" fill="#b89878" opacity="0.55" />

        {/* Head — breathing as part of avatar wrapper */}
        <g className="head-group">
          {/* Face oval */}
          <ellipse cx="150" cy="150" rx="58" ry="70" fill="url(#skinGrad)" />

          {/* Cheek/jaw shading */}
          <path d="M 95 165 Q 150 222 205 165 L 200 195 Q 150 222 100 195 Z" fill="#c4a48c" opacity="0.3" />

          {/* Ears */}
          <ellipse cx="95" cy="156" rx="6" ry="11" fill="#d8bca4" />
          <path d="M 92 153 Q 96 158 94 163" stroke="#a8866c" strokeWidth="0.9" fill="none" />
          <ellipse cx="205" cy="156" rx="6" ry="11" fill="#d8bca4" />
          <path d="M 208 153 Q 204 158 206 163" stroke="#a8866c" strokeWidth="0.9" fill="none" />

          {/* Hair — back & sides (static base layer) */}
          <g className="hair-back">
            <path d="M 86 145 Q 78 88 116 62 Q 148 48 188 62 Q 222 88 214 145 L 218 178 Q 220 205 213 218 L 205 200 Q 213 178 211 145 Q 206 108 186 88 Q 165 73 150 73 Q 135 73 114 88 Q 94 108 89 145 Q 87 178 95 200 L 87 218 Q 80 205 82 178 Z" fill="url(#hairGrad)" />
            <path d="M 86 145 Q 78 88 116 62 Q 148 48 188 62 Q 222 88 214 145 L 218 178 Q 220 205 213 218 L 205 200 Q 213 178 211 145 Q 206 108 186 88 Q 165 73 150 73 Q 135 73 114 88 Q 94 108 89 145 Q 87 178 95 200 L 87 218 Q 80 205 82 178 Z" fill="url(#hairShade)" />
          </g>

          {/* Eyebrows — sharp, slanted (cold) */}
          <g className="eyebrows">
            <path d="M 112 128 Q 128 122 144 128" stroke="#4a4a62" strokeWidth="3.8" fill="none" strokeLinecap="round" />
            <path d="M 156 128 Q 172 122 188 128" stroke="#4a4a62" strokeWidth="3.8" fill="none" strokeLinecap="round" />
          </g>

          {/* Eyes */}
          <g className="eyes">
            {/* Left eye */}
            <g className="eye-left">
              <ellipse cx="125" cy="150" rx="14" ry="8" fill="#fafafa" />
              <ellipse cx="125" cy="150" rx="14" ry="8" fill="none" stroke="#3a2a4a" strokeWidth="0.9" />
              <ellipse cx="125" cy="150" rx="8.5" ry="7.8" fill="url(#eyeGrad)" />
              <circle cx="125" cy="150" r="3.2" fill="#1a0033" />
              <circle cx="127" cy="148" r="1.8" fill="#ffffff" />
              <circle cx="123" cy="152" r="0.9" fill="#ffffff" opacity="0.65" />
              {/* Upper eyelid for blink */}
              <path className="eyelid eyelid-left" d="M 110 150 Q 125 134 140 150 Q 125 152 110 150 Z" fill="url(#skinGrad)" stroke="#5a4068" strokeWidth="0.7" />
              {/* Lash hint */}
              <path d="M 113 148 Q 125 142 137 148" stroke="#2a1a3a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </g>
            {/* Right eye */}
            <g className="eye-right">
              <ellipse cx="175" cy="150" rx="14" ry="8" fill="#fafafa" />
              <ellipse cx="175" cy="150" rx="14" ry="8" fill="none" stroke="#3a2a4a" strokeWidth="0.9" />
              <ellipse cx="175" cy="150" rx="8.5" ry="7.8" fill="url(#eyeGrad)" />
              <circle cx="175" cy="150" r="3.2" fill="#1a0033" />
              <circle cx="177" cy="148" r="1.8" fill="#ffffff" />
              <circle cx="173" cy="152" r="0.9" fill="#ffffff" opacity="0.65" />
              <path className="eyelid eyelid-right" d="M 160 150 Q 175 134 190 150 Q 175 152 160 150 Z" fill="url(#skinGrad)" stroke="#5a4068" strokeWidth="0.7" />
              <path d="M 163 148 Q 175 142 187 148" stroke="#2a1a3a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </g>
          </g>

          {/* Nose — subtle */}
          <path d="M 150 156 Q 147 172 149 180 Q 150 182 151 180 Q 153 172 150 156 Z" fill="#c4a48c" opacity="0.55" />
          <path d="M 146 180 Q 150 184 154 180" stroke="#a8866c" strokeWidth="0.9" fill="none" strokeLinecap="round" />

          {/* Mouth — cold neutral, slight downward */}
          <path d="M 141 194 Q 150 196 159 194" stroke="#7a4838" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Hair — front bangs, layered, asymmetric (animated sway) */}
          <g className="hair-front">
            <path d="M 86 145 Q 92 82 130 70 Q 150 66 170 70 Q 208 82 214 145 L 206 132 Q 196 116 178 122 L 172 102 Q 168 120 161 134 L 156 96 Q 150 120 145 142 L 138 100 Q 132 122 126 138 L 120 108 Q 114 126 108 140 L 100 112 Q 92 130 86 145 Z" fill="url(#hairGrad)" />
            <path d="M 86 145 Q 92 82 130 70 Q 150 66 170 70 Q 208 82 214 145 L 206 132 Q 196 116 178 122 L 172 102 Q 168 120 161 134 L 156 96 Q 150 120 145 142 L 138 100 Q 132 122 126 138 L 120 108 Q 114 126 108 140 L 100 112 Q 92 130 86 145 Z" fill="url(#hairShade)" opacity="0.55" />

            {/* Side bangs falling */}
            <path d="M 86 145 Q 84 180 92 210 L 102 200 Q 96 178 100 145 Z" fill="url(#hairGrad)" />
            <path d="M 214 145 Q 216 180 208 210 L 198 200 Q 204 178 200 145 Z" fill="url(#hairGrad)" />

            {/* Bang that drapes over right eye — Cid signature */}
            <path d="M 165 70 Q 178 95 184 130 Q 180 142 173 152 L 168 140 Q 172 110 165 70 Z" fill="url(#hairGrad)" opacity="0.92" />

            {/* Strand highlights */}
            <path d="M 128 75 Q 126 100 124 130" stroke="#e8e8f0" strokeWidth="0.7" fill="none" opacity="0.6" />
            <path d="M 172 75 Q 174 100 176 130" stroke="#e8e8f0" strokeWidth="0.7" fill="none" opacity="0.6" />
          </g>
        </g>
      </svg>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
//  MAIN JARVIS COMPONENT
// ════════════════════════════════════════════════════════════════
export default function Jarvis() {
  // ─── Service Worker ─────────────────────────────────────
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  // ─── State ──────────────────────────────────────────────
  const [status, setStatus] = useState('idle')
  const [liveText, setLiveText] = useState('')
  const [command, setCommand] = useState('')
  const [response, setResponse] = useState('')
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState(new Date())

  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')

  // ─── Mount flag + real-time clock (every second) ────────
  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // ─── WIB time/date formatting (always Asia/Jakarta) ─────
  const timeWIB = useMemo(
    () => new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(now),
    [now]
  )
  const dateWIB = useMemo(
    () => new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(now),
    [now]
  )

  // ─── Time of day for background ─────────────────────────
  const hourWIB = useMemo(() => {
    const h = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false,
    }).format(now)
    return parseInt(h, 10)
  }, [now])

  const minuteWIB = useMemo(() => {
    const m = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta', minute: '2-digit',
    }).format(now)
    return parseInt(m, 10)
  }, [now])

  const tod = useMemo(() => {
    if (hourWIB >= 5 && hourWIB < 10) return 'pagi'
    if (hourWIB >= 10 && hourWIB < 15) return 'siang'
    if (hourWIB >= 15 && hourWIB < 18) return 'sore'
    if (hourWIB >= 18 && hourWIB < 19) return 'petang'
    return 'malam'
  }, [hourWIB])

  // ─── Sun / moon position based on hour ──────────────────
  const celestial = useMemo(() => {
    const h = hourWIB + minuteWIB / 60
    if (h >= 5 && h < 18) {
      // Sun: 05:00 (left horizon) → 11:30 (peak) → 18:00 (right horizon)
      const t = (h - 5) / 13
      const x = 8 + t * 84
      const y = 60 - Math.sin(t * Math.PI) * 48
      return { type: 'sun', x, y }
    } else {
      // Moon: 19:00 (left) → 00:00 (peak) → 05:00 (right). 18:00-19:00 → moon barely rising.
      let h2 = h >= 18 ? h - 18 : h + 6
      const t = h2 / 11
      const x = 8 + t * 84
      const y = 60 - Math.sin(t * Math.PI) * 48
      return { type: 'moon', x, y }
    }
  }, [hourWIB, minuteWIB])

  // ─── Stars (stable random positions, only generated once) ─
  const stars = useMemo(
    () => Array.from({ length: 45 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 55,
      size: 1 + Math.random() * 1.8,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
    })),
    []
  )

  // ─── TTS (Android native preferred) ─────────────────────
  const speak = useCallback((text) => {
    if (window.AndroidTTS && typeof window.AndroidTTS.speak === 'function') {
      window.AndroidTTS.speak(text)
      return
    }
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = LANG
    utt.rate = 1.0
    utt.pitch = 0.85
    utt.onstart = () => setStatus('speaking')
    utt.onend = () => setStatus('idle')
    window.speechSynthesis.speak(utt)
  }, [])

  // ─── Android command dispatcher ─────────────────────────
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

  // ─── Ask Jarvis (chat API call) ─────────────────────────
  const askJarvis = useCallback(async (cmd) => {
    if (!cmd || cmd.trim().length < 2) return
    setStatus('thinking')
    setCommand(cmd)
    setResponse('')
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
      if (handleAndroidCommands(reply)) {
        setStatus('idle')
        return
      }
      setResponse(reply)
      speak(reply)
    } catch {
      const err = 'Tidak bisa terhubung ke server.'
      setResponse(err)
      speak(err)
    }
  }, [speak, handleAndroidCommands])

  // ─── Speech Recognition setup (initialized once, NOT started) ─
  useEffect(() => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!SR) { setStatus('unsupported'); return }

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = LANG

    recognition.onresult = (e) => {
      let interim = '', final = ''
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      if (final) finalTranscriptRef.current += final
      setLiveText((finalTranscriptRef.current + interim).trim())
    }

    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') setStatus('unsupported')
    }

    recognitionRef.current = recognition

    return () => {
      try { recognition.stop() } catch {}
    }
  }, [])

  // ─── Push-to-talk: start recording ──────────────────────
  const startRecording = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec || status === 'thinking' || status === 'speaking') return
    finalTranscriptRef.current = ''
    setLiveText('')
    setCommand('')
    setResponse('')
    setIsRecording(true)
    setStatus('listening')
    window.speechSynthesis?.cancel()
    try { rec.start() } catch {}
  }, [status])

  // ─── Push-to-talk: stop & send ──────────────────────────
  const stopRecording = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec || !isRecording) return
    setIsRecording(false)
    try { rec.stop() } catch {}
    // Wait briefly for final transcript to settle
    setTimeout(() => {
      const text = (finalTranscriptRef.current || liveText).trim()
      if (text.length >= 2) askJarvis(text)
      else setStatus('idle')
    }, 280)
  }, [isRecording, liveText, askJarvis])

  // ─── Expose to Android native bridge ────────────────────
  useEffect(() => {
    window.startListening = () => startRecording()
    window.stopListening = () => stopRecording()
    return () => {
      delete window.startListening
      delete window.stopListening
    }
  }, [startRecording, stopRecording])

  // ─── Text input submit ──────────────────────────────────
  const handleTextSubmit = () => {
    if (!inputText.trim()) return
    askJarvis(inputText.trim())
    setInputText('')
  }

  // ─── Status badge config ────────────────────────────────
  const statusConfig = {
    idle:        { label: 'Standby',        color: '#5a4f8a', pulse: false },
    listening:   { label: 'Mendengarkan',   color: '#6a5acd', pulse: true  },
    thinking:    { label: 'Memproses',      color: '#c77dff', pulse: true  },
    speaking:    { label: 'Berbicara',      color: '#e0aaff', pulse: true  },
    unsupported: { label: 'Tidak Didukung', color: '#ff4444', pulse: false },
  }
  const s = statusConfig[status] || statusConfig.idle

  // ─── Background gradient per time of day ────────────────
  const bgGradients = {
    pagi:   'linear-gradient(180deg, #ffc89a 0%, #ff9c6e 22%, #b86db3 50%, #2a1f4a 78%, #05030f 100%)',
    siang:  'linear-gradient(180deg, #87ceeb 0%, #4fa8d8 25%, #3a4d8a 55%, #1a1a4a 80%, #05030f 100%)',
    sore:   'linear-gradient(180deg, #ffaa55 0%, #e8633a 22%, #a83a7a 50%, #2a1245 78%, #05030f 100%)',
    petang: 'linear-gradient(180deg, #6e2b8a 0%, #4a2480 28%, #2a1455 58%, #150830 82%, #05030f 100%)',
    malam:  'linear-gradient(180deg, #0a0a25 0%, #1a0d3a 30%, #0d0628 65%, #060418 88%, #05030f 100%)',
  }

  const showStars = tod === 'petang' || tod === 'malam'

  // Render-safe values for SSR (avoid hydration mismatch)
  const bgStyle = mounted ? { background: bgGradients[tod] } : { background: bgGradients.malam }

  return (
    <>
      <Head>
        <title>Jarvis — Shadow Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Rajdhani:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="root" style={bgStyle}>
        {/* Sky layer: sun/moon + stars */}
        <div className="sky">
          {mounted && (
            <div
              className={`celestial ${celestial.type}`}
              style={{ left: `${celestial.x}%`, top: `${celestial.y}%` }}
            />
          )}
          {mounted && showStars && (
            <div className="stars">
              {stars.map(st => (
                <span
                  key={st.id}
                  className="star"
                  style={{
                    left: `${st.left}%`,
                    top: `${st.top}%`,
                    width: `${st.size}px`,
                    height: `${st.size}px`,
                    animationDelay: `${st.delay}s`,
                    animationDuration: `${st.duration}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-grid" />
        <div className="vignette" />

        {/* Clock — top */}
        <div className="clock-display">
          <div className="clock-time">{mounted ? timeWIB : '--:--:--'} <span className="clock-tz">WIB</span></div>
          <div className="clock-date">{mounted ? dateWIB : '\u00A0'}</div>
        </div>

        <header>
          <span className="title">J.A.R.V.I.S</span>
          <span className="subtitle">SHADOW ASSISTANT</span>
        </header>

        <main>
          {/* Cid Avatar */}
          <div className="avatar-zone">
            <CidAvatar status={status} color={s.color} />
          </div>

          {/* Status badge */}
          <div className="badge" style={{ borderColor: s.color, color: s.color, boxShadow: `0 0 18px ${s.color}33` }}>
            {s.pulse && <span className="dot" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />}
            {s.label}
          </div>

          {/* Live transcription */}
          <div className="live-box">
            <span className="live-label">🎙 MENDENGAR</span>
            <p className="live-text">{liveText || '...'}</p>
          </div>

          {/* Conversation bubbles */}
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

          {/* Push-to-talk button */}
          <button
            className={`ptt-btn ${isRecording ? 'recording' : ''}`}
            onPointerDown={(e) => { e.preventDefault(); startRecording() }}
            onPointerUp={(e) => { e.preventDefault(); stopRecording() }}
            onPointerLeave={() => { if (isRecording) stopRecording() }}
            onPointerCancel={() => { if (isRecording) stopRecording() }}
            onContextMenu={(e) => e.preventDefault()}
            disabled={status === 'unsupported' || status === 'thinking' || status === 'speaking'}
          >
            <span className="ptt-icon">{isRecording ? '🔴' : '🎙'}</span>
            <span className="ptt-label">
              {isRecording ? 'Lepas untuk Kirim' : 'Tekan & Tahan untuk Bicara'}
            </span>
          </button>

          {/* Text input (always available fallback) */}
          <div className="text-input-row">
            <input
              className="text-input"
              type="text"
              placeholder="Atau ketik pesan ke Jarvis..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
            />
            <button className="send-btn" onClick={handleTextSubmit} aria-label="Kirim">▶</button>
          </div>
        </main>
      </div>

      {/* ═══════════════════════ GLOBAL STYLES ═══════════════════════ */}
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          height: 100%;
          background: #05030f;
          color: #e0d7ff;
          font-family: 'Rajdhani', sans-serif;
          overflow-x: hidden;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      {/* ═══════════════════════ SCOPED STYLES ═══════════════════════ */}
      <style jsx>{`
        .root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 18px 20px 32px;
          position: relative;
          transition: background 4s ease;
        }

        /* ─── Sky / celestial bodies ───────────────────────── */
        .sky { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .celestial {
          position: absolute;
          width: 64px; height: 64px;
          margin-left: -32px; margin-top: -32px;
          border-radius: 50%;
          transition: left 30s linear, top 30s linear;
        }
        .sun {
          background: radial-gradient(circle, #fff4c4 0%, #ffd866 35%, #ff8a3c 75%, transparent 100%);
          box-shadow:
            0 0 50px rgba(255, 200, 80, 0.6),
            0 0 100px rgba(255, 150, 60, 0.35),
            0 0 160px rgba(255, 120, 50, 0.15);
          animation: sun-pulse 4s ease-in-out infinite;
        }
        @keyframes sun-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        .moon {
          background: radial-gradient(circle at 35% 35%, #ffffff 0%, #e8e8f0 50%, #a8a8c4 90%, transparent 100%);
          box-shadow:
            0 0 40px rgba(220, 220, 255, 0.5),
            0 0 80px rgba(180, 200, 255, 0.25);
        }
        .moon::after {
          content: '';
          position: absolute; inset: 6px;
          border-radius: 50%;
          background: radial-gradient(circle at 70% 70%, transparent 55%, rgba(150, 150, 180, 0.35) 100%);
        }
        .stars { position: absolute; inset: 0; }
        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle ease-in-out infinite;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        /* ─── Background grid + vignette ──────────────────── */
        .bg-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(106, 90, 205, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(106, 90, 205, 0.04) 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
        }
        .vignette {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse at center, transparent 25%, rgba(5, 3, 15, 0.85) 90%);
          pointer-events: none;
        }

        /* ─── Clock ────────────────────────────────────────── */
        .clock-display {
          position: relative; z-index: 2;
          text-align: center;
          margin-bottom: 14px;
          padding: 4px 12px;
        }
        .clock-time {
          font-family: 'Cinzel', serif;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #f0e4ff;
          text-shadow: 0 0 24px rgba(199, 125, 255, 0.55), 0 0 6px rgba(0, 0, 0, 0.6);
          font-variant-numeric: tabular-nums;
        }
        .clock-tz {
          font-size: 0.85rem;
          color: #c8b8e0;
          margin-left: 4px;
        }
        .clock-date {
          font-size: 0.7rem;
          letter-spacing: 0.22em;
          color: #c0b0d8;
          text-transform: uppercase;
          margin-top: 4px;
          text-shadow: 0 0 8px rgba(0, 0, 0, 0.7);
          min-height: 0.9rem;
        }

        /* ─── Header ──────────────────────────────────────── */
        header {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          gap: 4px; margin-bottom: 12px;
        }
        .title {
          font-family: 'Cinzel', serif;
          font-size: 1.8rem;
          font-weight: 700;
          letter-spacing: 0.28em;
          background: linear-gradient(135deg, #e0aaff, #c77dff 50%, #9d4edd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px rgba(199, 125, 255, 0.3);
        }
        .subtitle {
          font-size: 0.55rem;
          letter-spacing: 0.32em;
          color: #a89cc8;
          font-weight: 400;
          text-shadow: 0 0 6px rgba(0, 0, 0, 0.7);
        }

        main {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; width: 100%; max-width: 480px; flex: 1;
        }

        /* ─── Cid Avatar ──────────────────────────────────── */
        .avatar-zone {
          width: 220px; height: 260px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        :global(.cid-avatar) {
          width: 100%; height: 100%;
          animation: idle-breathe 4.5s ease-in-out infinite;
          filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.6));
        }
        :global(.cid-avatar svg) { width: 100%; height: 100%; }

        :global(.cid-avatar.status-thinking) {
          animation: idle-breathe 2.2s ease-in-out infinite;
        }
        :global(.cid-avatar.status-speaking) {
          animation: idle-breathe 3s ease-in-out infinite;
        }

        @keyframes idle-breathe {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.012); }
        }

        /* Eye blink: eyelids briefly cover the eyes */
        :global(.cid-avatar .eyelid) {
          transform-origin: center;
          transform-box: fill-box;
          transform: scaleY(0);
          animation: blink 5.5s infinite;
        }
        :global(.cid-avatar .eyelid-right) {
          animation-delay: 0.04s;
        }
        @keyframes blink {
          0%, 92%, 100% { transform: scaleY(0); }
          94%, 96% { transform: scaleY(1.1); }
        }

        /* Hair sway — front bangs */
        :global(.cid-avatar .hair-front) {
          transform-origin: 150px 75px;
          animation: hair-sway 5.5s ease-in-out infinite;
        }
        @keyframes hair-sway {
          0%, 100% { transform: rotate(-0.6deg) translateY(0); }
          50% { transform: rotate(0.8deg) translateY(-0.5px); }
        }

        /* Cape sway */
        :global(.cid-avatar .cape-group) {
          transform-origin: 150px 218px;
          animation: cape-sway 6.5s ease-in-out infinite;
        }
        @keyframes cape-sway {
          0%, 100% { transform: rotate(-0.7deg); }
          50% { transform: rotate(0.7deg); }
        }

        /* Status-based glow on head */
        :global(.cid-avatar.status-listening .head-group) {
          filter: drop-shadow(0 0 6px rgba(106, 90, 205, 0.6));
        }
        :global(.cid-avatar.status-thinking .head-group) {
          filter: drop-shadow(0 0 8px rgba(199, 125, 255, 0.7));
        }
        :global(.cid-avatar.status-speaking .head-group) {
          filter: drop-shadow(0 0 10px rgba(224, 170, 255, 0.7));
        }

        /* ─── Status badge ────────────────────────────────── */
        .badge {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 18px;
          border: 1px solid; border-radius: 22px;
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          font-weight: 600;
          text-transform: uppercase;
          background: rgba(15, 8, 30, 0.55);
          backdrop-filter: blur(6px);
          transition: all 0.4s;
        }
        .dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          animation: dot-blink 1.2s ease-in-out infinite;
        }
        @keyframes dot-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        /* ─── Live transcription box ──────────────────────── */
        .live-box {
          width: 100%;
          background: rgba(15, 8, 30, 0.7);
          border: 1px solid rgba(106, 90, 205, 0.28);
          border-radius: 12px;
          padding: 12px 16px;
          backdrop-filter: blur(8px);
        }
        .live-label {
          font-size: 0.58rem;
          letter-spacing: 0.22em;
          color: #6a5f95;
          display: block;
          margin-bottom: 6px;
        }
        .live-text {
          font-size: 0.95rem;
          color: #b8a8e0;
          line-height: 1.5;
          min-height: 22px;
          font-style: italic;
        }

        /* ─── Bubbles ──────────────────────────────────────── */
        .bubble {
          width: 100%;
          border-radius: 12px;
          padding: 12px 16px;
          backdrop-filter: blur(8px);
        }
        .you-bubble {
          background: rgba(106, 90, 205, 0.12);
          border: 1px solid rgba(106, 90, 205, 0.35);
        }
        .ai-bubble {
          background: rgba(157, 78, 221, 0.1);
          border: 1px solid rgba(157, 78, 221, 0.28);
        }
        .blabel {
          font-size: 0.58rem;
          letter-spacing: 0.22em;
          font-weight: 600;
          color: #b88aff;
          display: block;
          margin-bottom: 6px;
        }
        .bubble p {
          font-size: 0.95rem;
          line-height: 1.65;
          color: #d4c8f0;
        }

        /* ─── Push-to-talk button ─────────────────────────── */
        .ptt-btn {
          width: 100%;
          min-height: 60px;
          display: flex; align-items: center; justify-content: center;
          gap: 12px;
          padding: 14px 22px;
          border: 1px solid rgba(157, 78, 221, 0.5);
          border-radius: 30px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.85), rgba(74, 32, 158, 0.85));
          color: #ffffff;
          font-family: 'Rajdhani', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
          touch-action: none;
          box-shadow: 0 4px 22px rgba(124, 58, 237, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transition: transform 0.15s, box-shadow 0.3s, background 0.3s;
          margin-top: 4px;
        }
        .ptt-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .ptt-btn:not(:disabled):active,
        .ptt-btn.recording {
          background: linear-gradient(135deg, rgba(220, 38, 88, 0.95), rgba(149, 25, 65, 0.95));
          border-color: rgba(255, 80, 120, 0.7);
          box-shadow: 0 4px 30px rgba(220, 38, 88, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transform: scale(0.98);
        }
        .ptt-btn.recording {
          animation: rec-pulse 1.2s ease-in-out infinite;
        }
        @keyframes rec-pulse {
          0%, 100% { box-shadow: 0 4px 30px rgba(220, 38, 88, 0.55); }
          50% { box-shadow: 0 4px 45px rgba(220, 38, 88, 0.85); }
        }
        .ptt-icon { font-size: 1.3rem; line-height: 1; }
        .ptt-label { white-space: nowrap; }

        /* ─── Text input row ──────────────────────────────── */
        .text-input-row {
          width: 100%;
          display: flex; gap: 8px; align-items: center;
          margin-top: 2px;
        }
        .text-input {
          flex: 1;
          background: rgba(15, 8, 30, 0.8);
          border: 1px solid rgba(106, 90, 205, 0.32);
          border-radius: 24px;
          padding: 10px 16px;
          color: #d0c4f4;
          font-size: 0.95rem;
          font-family: 'Rajdhani', sans-serif;
          outline: none;
          backdrop-filter: blur(6px);
        }
        .text-input::placeholder { color: #5a4f7a; }
        .text-input:focus { border-color: rgba(157, 78, 221, 0.65); }
        .send-btn {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: #7c3aed;
          border: none;
          color: #fff;
          font-size: 1rem;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 12px rgba(124, 58, 237, 0.4);
        }
        .send-btn:active { background: #6d28d9; transform: scale(0.95); }

        /* ─── Responsive tweaks ───────────────────────────── */
        @media (max-width: 380px) {
          .title { font-size: 1.55rem; letter-spacing: 0.22em; }
          .clock-time { font-size: 1.3rem; }
          .avatar-zone { width: 190px; height: 230px; }
          .ptt-btn { font-size: 0.95rem; padding: 12px 18px; }
        }
      `}</style>
    </>
  )
}
