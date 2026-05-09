export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
  const MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'

  const { messages, session_id } = req.body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah Jarvis, asisten AI pribadi yang cerdas, ramah, dan selalu siap membantu. Jawab dalam bahasa yang sama dengan yang digunakan pengguna. Jawaban singkat dan jelas untuk percakapan suara.'
          },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Groq API error' })
    }

    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: 'Gagal terhubung ke Groq.' })
  }
}
