import { createServerClient } from '@supabase/ssr'

const NANOBOT_URL = process.env.NANOBOT_URL || 'https://nanobot-production-d64d.up.railway.app'
const SESSION_ID  = process.env.NANOBOT_SESSION_ID || 'jarvis-web'

// Disisipkan ke depan pesan agar Nanobot selalu tahu format Android command
const ANDROID_HINT = '[Jika diminta buka app, balas HANYA: YouTube→[OPEN_YOUTUBE:q] | Kamera→[OPEN_CAMERA] | WhatsApp→[OPEN_WHATSAPP] | Maps→[OPEN_MAPS:lokasi] | Settings→[OPEN_SETTINGS]] '

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

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

  const { messages } = req.body
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid messages' })

  const userMessage = messages[messages.length - 1]?.content || ''
  if (!userMessage.trim()) return res.status(400).json({ error: 'Empty message' })

  try {
    const response = await fetch(`${NANOBOT_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: ANDROID_HINT + userMessage }],
        session_id: SESSION_ID,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      return res.status(200).json({
        choices: [{ message: { content: `Error: ${errData?.error?.message || response.status}` } }],
      })
    }

    return res.status(200).json(await response.json())

  } catch (error) {
    return res.status(200).json({
      choices: [{ message: { content: `Tidak bisa terhubung ke Nanobot: ${error.message}` } }],
    })
  }
}
