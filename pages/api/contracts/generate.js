/**
 * API route: generate contract content using Google Gemini.
 * Requires GEMINI_API_KEY in .env.local.
 * Get a key: https://aistudio.google.com/app/apikey
 * POST body: { prompt: string, templateType?: string, context?: { clientName?, title? } }
 */

const GEMINI_MODEL = 'gemini-1.5-flash'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      error: 'AI generation is not configured. Add GEMINI_API_KEY to your environment.',
    })
  }

  try {
    const { prompt, templateType, context = {} } = req.body || {}
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid prompt' })
    }

    const clientName = context.clientName || 'the client'
    const title = context.title || 'Contract'

    const systemInstruction = `You are a professional legal and business contract writer. Generate clear, professional contract or agreement text suitable for freelancers and small businesses. Output only the contract body text, no preamble or "here is your contract" - just the actual contract content. Use plain text with clear section headings. Do not use markdown or code blocks.`
    const userContent = templateType
      ? `Contract type: ${templateType}. Context: Client name: ${clientName}. Title: ${title}. Instructions: ${prompt}`
      : `Context: Client: ${clientName}. Title: ${title}. Instructions: ${prompt}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text: userContent }] }],
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.4,
          },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini API error:', response.status, err)
      return res.status(502).json({
        error: 'AI service error. Check your API key and quota.',
      })
    }

    const data = await response.json()
    const textPart = data?.candidates?.[0]?.content?.parts?.[0]
    const content = (textPart?.text || '').trim()
    return res.status(200).json({ content })
  } catch (e) {
    console.error('Contract generate error:', e)
    return res.status(500).json({ error: 'Failed to generate contract' })
  }
}
