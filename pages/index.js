import { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'
import JarvisAvatar from '../components/JarvisAvatar'

// Longest phrases first so "hey jarvis" matches before "jarvis"
const WAKE_WORDS = ['hey jarvis', 'hei jarvis', 'hai jarvis', 'jarvis', 'jarves', 'jarbes']
const LANG = 'id-ID'
const MAX_HISTORY = 20  // max messages kept in session memory

export default function Home() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  const [status, setStatus] = useState('idle')
  const [liveText, setLiveText] = useState('')
  const [command, setCommand] = useState('')
  const [response, setResponse] = useState('')
  const [textInput, setTextInput] = useState('')

  const awakeRef = useRef(false)
  const commandTimerRef = useRef(null)
  const messagesRef = useRef([])   // session memory across turns
  const voiceRef = useRef(null)    // preferred Indonesian male voice

  // Load preferred voice — prefer Indonesian male
  useEffect(() => {
    if (!window.speechSynthesis) return
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      voiceRef.current =
        voices.find(v => v.lang.startsWith('id') && /male|pria|man/i.test(v.name)) ||
        voices.find(v => v.lang === 'id-ID') ||
        voices.find(v => v.lang.startsWith('id')) ||
        null
    }
    pickVoice()
    window.speechSynthesis.onvoiceschanged = pickVoice
  }, [])

  const speak = useCallback((text) => {
    setStatus('speaking')

    // Android WebView bridge — delegate to native TTS to fix no-sound in WebView
    if (window.AndroidBridge?.speak) {
      window.AndroidBridge.speak(text)
      // No onend callback from Android; estimate duration then return to idle
      const ms = Math.max(1500, text.length * 55)
      setTimeout(() => { setStatus('idle'); awakeRef.current = false }, ms)
      return
    }

    // Browser TTS fallback
    if (!window.speechSynthesis) { setStatus('idle'); return }
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = LANG
    utt.rate = 1.0
    utt.pitch = 0.8
    if (voiceRef.current) utt.voice = voiceRef.current
    utt.onend = () => { setStatus('listening'); awakeRef.current = false }
    window.speechSynthesis.speak(utt)
  }, [])

  const askJarvis = useCallback(async (cmd) => {
    if (!cmd || cmd.trim().length < 2) return
    setStatus('thinking')
    setCommand(cmd)

    // Append to session memory
    const updated = [...messagesRef.current, { role: 'user', content: cmd }]
    const trimmed = updated.slice(-MAX_HISTORY)
    messagesRef.current = trimmed

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: trimmed }),
      })
      const data = await res.json()
      const reply = data?.choices?.[0]?.message?.content || 'Maaf, tidak ada respons.'
      setResponse(reply)

      // Store assistant reply in session memory
      messagesRef.current = [...messagesRef.current, { role: 'assistant', content: reply }]

      speak(reply)
    } catch {
      const err = 'Tidak bisa terhubung ke server.'
      setResponse(err)
      speak(err)
    }
  }, [speak])

  const handleTextSubmit = useCallback((e) => {
    e.preventDefault()
    const cmd = textInput.trim()
    if (!cmd) return
    setTextInput('')
    askJarvis(cmd)
  }, [textInput, askJarvis])

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setStatus('unsupported'); return }

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = LANG

    recognition.onstart = () => setStatus('listening')

    recognition.onresult = (e) => {
      let interim = ''
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript.toLowerCase().trim()
        if (e.results[i].isFinal) final = t
        else interim = t
      }

      const heard = final || interim
      setLiveText(heard)

      // Match longest wake word first
      const foundWake = WAKE_WORDS.find(w => heard.includes(w))

      if (foundWake) {
        const afterWake = heard.split(foundWake).pop().trim()

        if (afterWake && afterWake.length > 2) {
          // Inline command: "Hey Jarvis siapa presiden Indonesia"
          awakeRef.current = false
          if (commandTimerRef.current) clearTimeout(commandTimerRef.current)
          askJarvis(afterWake)
        } else {
          // Wake only → enter listening-for-command mode
          awakeRef.current = true
          setStatus('awake')
          setResponse('')
          setCommand('')
          window.speechSynthesis?.cancel()

          if (commandTimerRef.current) clearTimeout(commandTimerRef.current)
          commandTimerRef.current = setTimeout(() => {
            if (awakeRef.current) {
              awakeRef.current = false
              setStatus('listening')
            }
          }, 5000)
        }
        return
      }

      // Already awake and got a final utterance → treat as command
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
    return () => {
      try { recognition.stop() } catch {}
      if (commandTimerRef.current) clearTimeout(commandTimerRef.current)
    }
  }, [askJarvis])

  const statusConfig = {
    idle:        { label: 'Standby',        color: '#4a4a6a', pulse: false },
    listening:   { label: 'Mendengarkan',   color: '#6a5acd', pulse: true  },
    awake:       { label: 'Siap!',          color: '#9d4edd', pulse: true  },
    thinking:    { label: 'Memproses...',   color: '#c77dff', pulse: true  },
    speaking:    { label: 'Berbicara',      color: '#e0aaff', pulse: true  },
    unsupported: { label: 'Tidak Didukung', color: '#ff4444', pulse: false },
  }
  const s = statusConfig[status] || statusConfig.idle

  // Map internal status to avatar states
  const avatarState =
    status === 'thinking'    ? 'processing' :
    status === 'awake'       ? 'listening'  :
    status === 'unsupported' ? 'idle'       : status

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
          <JarvisAvatar state={avatarState} />

          <div className="badge" style={{ borderColor: s.color, color: s.color }}>
            {s.pulse && <span className="dot" style={{ background: s.color }} />}
            {s.label}
          </div>

          <div className="live-box">
            <span className="live-label">🎙 MENDENGAR SEKARANG</span>
            <p className="live-text">{liveText || '...'}</p>
          </div>

          {status === 'listening' && (
            <p className="hint">
              Ucap <strong>&ldquo;Hey Jarvis&rdquo;</strong> atau <strong>&ldquo;Hey Jarvis [perintah]&rdquo;</strong>
            </p>
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

          <form className="text-form" onSubmit={handleTextSubmit}>
            <input
              className="text-input"
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Ketik pesan ke Jarvis..."
              disabled={status === 'thinking' || status === 'speaking'}
              autoComplete="off"
            />
            <button
              className="text-send"
              type="submit"
              disabled={!textInput.trim() || status === 'thinking' || status === 'speaking'}
            >
              ➤
            </button>
          </form>
        </main>

        <footer>Powered by Groq · Jarvis AI</footer>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #05030f; color: #e0d7ff; font-family: 'Rajdhani', sans-serif; overflow-x: hidden; }
      `}</style>

      <style jsx>{`
        .root { min-height:100vh; display:flex; flex-direction:column; align-items:center; padding:24px 20px 16px; position:relative; }
        .bg-grid { position:fixed; inset:0; z-index:0; background-image:linear-gradient(rgba(106,90,205,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(106,90,205,0.05) 1px,transparent 1px); background-size:40px 40px; }
        .vignette { position:fixed; inset:0; z-index:0; background:radial-gradient(ellipse at center,transparent 20%,#05030f 75%); }
        header { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:4px; margin-bottom:20px; }
        .title { font-family:'Cinzel',serif; font-size:2.2rem; font-weight:700; letter-spacing:0.25em; background:linear-gradient(135deg,#c77dff,#6a5acd,#e0aaff); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .subtitle { font-size:0.6rem; letter-spacing:0.22em; color:#4a3d7a; font-weight:300; }
        main { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:16px; width:100%; max-width:480px; flex:1; }
        .badge { display:flex; align-items:center; gap:8px; padding:5px 16px; border:1px solid; border-radius:20px; font-size:0.72rem; letter-spacing:0.15em; font-weight:600; text-transform:uppercase; transition:all 0.4s; }
        .dot { width:7px; height:7px; border-radius:50%; animation:blink 1.2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
        .live-box { width:100%; background:rgba(20,10,40,0.7); border:1px solid rgba(106,90,205,0.25); border-radius:12px; padding:12px 16px; }
        .live-label { font-size:0.58rem; letter-spacing:0.2em; color:#5a4f8a; display:block; margin-bottom:6px; }
        .live-text { font-size:1rem; color:#a898d8; line-height:1.5; min-height:24px; font-style:italic; }
        .hint { font-size:0.85rem; color:#6a5acd; text-align:center; }
        .hint strong { color:#c77dff; }
        .hint.active { color:#c77dff; font-weight:600; }
        .bubble { width:100%; border-radius:12px; padding:14px 18px; }
        .you-bubble { background:rgba(106,90,205,0.1); border:1px solid rgba(106,90,205,0.3); }
        .ai-bubble { background:rgba(157,78,221,0.08); border:1px solid rgba(157,78,221,0.25); }
        .blabel { font-size:0.58rem; letter-spacing:0.2em; font-weight:600; color:#9d4edd; display:block; margin-bottom:6px; }
        .bubble p { font-size:0.95rem; line-height:1.65; color:#d0c4f4; }
        footer { position:relative; z-index:1; margin-top:20px; font-size:0.6rem; color:#2a2245; letter-spacing:0.1em; text-transform:uppercase; }
        .text-form { width:100%; display:flex; gap:10px; align-items:center; margin-top:4px; }
        .text-input { flex:1; background:rgba(20,10,40,0.85); border:1px solid rgba(106,90,205,0.35); border-radius:10px; padding:12px 14px; color:#e0d7ff; font-family:'Rajdhani',sans-serif; font-size:0.95rem; outline:none; transition:border-color 0.3s; }
        .text-input::placeholder { color:#4a3d7a; }
        .text-input:focus { border-color:#9d4edd; }
        .text-input:disabled { opacity:0.45; }
        .text-send { background:linear-gradient(135deg,#6a5acd,#9d4edd); border:none; border-radius:10px; padding:12px 18px; color:#fff; font-size:1.1rem; cursor:pointer; transition:opacity 0.25s; flex-shrink:0; }
        .text-send:disabled { opacity:0.35; cursor:not-allowed; }
        .text-send:not(:disabled):active { opacity:0.75; }
      `}</style>
    </>
  )
}
