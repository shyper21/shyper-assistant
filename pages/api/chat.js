
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const NANOBOT_URL = 'https://dazzling-cooperation-production-d997.up.railway.app/v1/chat/completions'
  const API_KEY = process.env.NANOBOT_API_KEY || ''

  try {
    const response = await fetch(NANOBOT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
      },
      body: JSON.stringify({
        messages: req.body.messages,
        session_id: req.body.session_id || 'shyper-web',
      }),
    })

    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Nanobot API error:', error)
    return res.status(500).json({ error: 'Failed to connect to Shyper server' })
  }
}
