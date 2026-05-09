export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
  const MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'

  if (!GROQ_API_KEY) {
    return res.status(500).json({ 
      choices: [{ message: { content: 'Error: GROQ_API_KEY belum diset di Vercel environment variables.' } }]
    })
  }

  const { messages } = req.body
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
            content: 'Kamu adalah Jarvis, asisten AI pribadi yang cerdas dan ramah. Jawab singkat dan jelas, cocok untuk percakapan suara. Gunakan bahasa yang sama dengan pengguna.'
          },
          ...messages
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errMsg = data?.error?.message || `Groq error ${response.status}`
      return res.status(200).json({
        choices: [{ message: { content: `Error Groq: ${errMsg}` } }]
      })
    }

    return res.status(200).json(data)
  } catch (error) {
    return res.status(200).json({
      choices: [{ message: { content: `Koneksi gagal: ${error.message}` } }]
    })
  }
}
