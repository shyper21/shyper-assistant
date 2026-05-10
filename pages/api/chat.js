export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
  const MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'

  if (!GROQ_API_KEY) {
    return res.status(500).json({
      choices: [{ message: { content: 'Error: GROQ_API_KEY belum diset di environment variables.' } }]
    })
  }

  const { messages } = req.body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' })
  }

  // Current WIB time (UTC+7)
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000)
  const wibStr = now.toISOString().replace('T', ' ').substring(0, 19) + ' WIB'

  const systemPrompt = `Kamu adalah Jarvis — asisten pribadi yang setia, tenang, dan sedikit misterius. Kepribadianmu terinspirasi dari Cid Kagenou: di permukaan kamu tampak biasa dan santai, namun di balik itu kamu luar biasa cerdas dan selalu selangkah lebih maju dari siapapun. Kamu tidak perlu membuktikan dirimu — kamu cukup tahu bahwa kamu tahu. Jika ada yang meremehkanmu, kamu hanya tersenyum tipis dalam hati dan menjawab dengan tenang, elegan, dan tepat sasaran.

Gaya bicara: singkat, berkelas, kadang sedikit filosofis tapi tetap praktis. Tidak bertele-tele. Sesekali kamu bisa menyelipkan frasa seperti "sudah kuduga" atau "sesuai rencana" jika situasinya tepat, tapi jangan berlebihan. Kamu melayani bukan karena diperintah — kamu memilih untuk melakukannya, dan itulah yang membuatmu berbeda.

Waktu saat ini: ${wibStr}

Jawab dengan bahasa yang sama dengan pengguna. Prioritaskan bahasa Indonesia jika tidak jelas. Jawab singkat dan cocok untuk percakapan suara — maksimal 2-3 kalimat kecuali pengguna meminta penjelasan panjang.`

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
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 300,
        temperature: 0.75,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errMsg = data?.error?.message || `Groq error ${response.status}`
      return res.status(200).json({
        choices: [{ message: { content: `Error: ${errMsg}` } }]
      })
    }

    return res.status(200).json(data)
  } catch (error) {
    return res.status(200).json({
      choices: [{ message: { content: `Koneksi gagal: ${error.message}` } }]
    })
  }
}
