import { createServerClient } from '@supabase/ssr'

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

  const userId = user.id
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
  const MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat'

  if (!OPENROUTER_API_KEY) {
    return res.status(200).json({
      choices: [{ message: { content: 'Error: OPENROUTER_API_KEY belum diset.' } }]
    })
  }

  const { messages } = req.body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' })
  }

  const userMessage = messages[messages.length - 1]?.content || ''

  const { data: profileData } = await supabase
    .from('user_profile')
    .select('facts')
    .eq('user_id', userId)
    .single()

  const userFacts = profileData?.facts || ''

  const { data: historyData } = await supabase
    .from('conversations')
    .select('role, content')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  const history = (historyData || []).reverse()

  const now = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
  })

  const memorySection = userFacts ? `\n\nAPA YANG KAMU TAHU TENTANG USER:\n${userFacts}` : ''

  const systemPrompt = `Kamu adalah Jarvis, asisten AI pribadi yang misterius, tenang, dan sangat cerdas seperti karakter Shadow dari anime Eminence in Shadow. Jawab singkat, tepat, dan percaya diri. Gunakan bahasa yang sama dengan pengguna.

Waktu sekarang: ${now} WIB.${memorySection}

PENTING - Jika pengguna meminta membuka aplikasi, balas HANYA dengan format perintah berikut (tanpa teks lain):
- Buka YouTube / putar video / cari di YouTube → [OPEN_YOUTUBE:kata pencarian]
- Buka kamera / foto / selfie → [OPEN_CAMERA]
- Buka WhatsApp → [OPEN_WHATSAPP]
- Buka Maps / navigasi / arah ke → [OPEN_MAPS:lokasi tujuan]
- Buka pengaturan / settings → [OPEN_SETTINGS]

Untuk pertanyaan biasa, jawab normal tanpa format perintah.`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://shyper-assistant.vercel.app',
        'X-Title': 'Jarvis AI Assistant',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errMsg = data?.error?.message || `OpenRouter error ${response.status}`
      return res.status(200).json({
        choices: [{ message: { content: `Error: ${errMsg}` } }]
      })
    }

    const replyText = data?.choices?.[0]?.message?.content || ''

    const isAndroidCommand = /\[(OPEN_YOUTUBE|OPEN_CAMERA|OPEN_WHATSAPP|OPEN_MAPS|OPEN_SETTINGS)/.test(replyText)
    if (!isAndroidCommand && userMessage && replyText) {
      await supabase.from('conversations').insert([
        { user_id: userId, role: 'user', content: userMessage },
        { user_id: userId, role: 'assistant', content: replyText },
      ])
    }

    return res.status(200).json(data)
  } catch (error) {
    return res.status(200).json({
      choices: [{ message: { content: `Koneksi gagal: ${error.message}` } }]
    })
  }
}
