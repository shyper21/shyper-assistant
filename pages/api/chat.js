import { createServerClient } from '@supabase/ssr'

// ─── Nanobot config (set via Vercel env vars) ──────────────────────────────
const NANOBOT_URL = process.env.NANOBOT_URL || 'https://nanobot-production-d64d.up.railway.app'
const SESSION_ID  = process.env.NANOBOT_SESSION_ID || 'jarvis-web'

// ─── Android command system prompt ─────────────────────────────────────────
// Dikirim ke Nanobot setiap request agar Nanobot tahu format command Android
const ANDROID_SYSTEM = `Kamu adalah Jarvis, asisten AI pribadi yang misterius, tenang, dan sangat cerdas seperti karakter Shadow dari anime Eminence in Shadow. Jawab singkat, tepat, dan percaya diri. Gunakan bahasa yang sama dengan pengguna.

PENTING - Jika pengguna meminta membuka aplikasi, balas HANYA dengan format perintah berikut (tanpa teks lain):
- Buka YouTube / putar video / cari di YouTube → [OPEN_YOUTUBE:kata pencarian]
- Buka kamera / foto / selfie → [OPEN_CAMERA]
- Buka WhatsApp → [OPEN_WHATSAPP]
- Buka Maps / navigasi / arah ke → [OPEN_MAPS:lokasi tujuan]
- Buka pengaturan / settings → [OPEN_SETTINGS]

Untuk pertanyaan biasa, jawab normal tanpa format perintah.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // ─── Auth: tetap pakai Supabase (login web) ─────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return Object.entries(req.cookies || {}).map(([name, value]) => ({ name, value }))
        },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  // ─── Validasi input ──────────────────────────────────────────────────────
  const { messages } = req.body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' })
  }

  const userMessage = messages[messages.length - 1]?.content || ''
  if (!userMessage.trim()) return res.status(400).json({ error: 'Empty message' })

  // ─── Kirim ke Nanobot ────────────────────────────────────────────────────
  // Memory & history dihandle otomatis oleh Nanobot (tidak perlu Supabase lagi)
  // session_id = sama dengan sesi Telegram → history otomatis sinkron
  try {
    const response = await fetch(`${NANOBOT_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: ANDROID_SYSTEM },
          { role: 'user',   content: userMessage },
        ],
        session_id: SESSION_ID,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const errMsg  = errData?.error?.message || `Nanobot error ${response.status}`
      return res.status(200).json({
        choices: [{ message: { content: `Error: ${errMsg}` } }],
      })
    }

    const data = await response.json()
    return res.status(200).json(data)

  } catch (error) {
    return res.status(200).json({
      choices: [{ message: { content: `Tidak bisa terhubung ke Nanobot: ${error.message}` } }],
    })
  }
}
