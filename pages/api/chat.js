export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'No message' })

  const ANDROID_PREFIX = '[CMD:YouTube=[OPEN_YOUTUBE:query],Camera=[OPEN_CAMERA],WhatsApp=[OPEN_WHATSAPP],Maps=[OPEN_MAPS:query],Settings=[OPEN_SETTINGS]] '

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'user',
            content: ANDROID_PREFIX + message
          }
        ]
      })
    })

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'Maaf, tidak ada respon.'
    res.status(200).json({ reply })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Gagal menghubungi AI' })
  }
}
