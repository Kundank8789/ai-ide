import { Router } from 'express'

const router = Router()

const INTENTS = {
  readability: 'You are a code clarity expert. Refactor for maximum readability. Use descriptive names, JSDoc comments, and clear structure.',
  performance: 'You are a performance engineer. Refactor for speed. Reduce complexity, minimize loops, add Big-O notation in comments.',
  security: 'You are a security engineer. Find and fix security vulnerabilities. Check for injection risks, unsafe operations, missing validation, and exposed secrets.',
  minimal: 'You are a minimalist engineer. Remove ALL unnecessary code. Make it as short as possible while keeping full functionality.',
  explain: 'You are a senior engineer and teacher. Do NOT rewrite the code. Instead explain exactly what this code does, how it works, what each function does, and what could be improved.',
}

router.post('/', async (req, res) => {
  const { code, intent = 'readability' } = req.body

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        stream: true,
        messages: [
          { role: 'system', content: INTENTS[intent] || INTENTS.readability },
          { role: 'user', content: `Refactor this code:\n\`\`\`\n${code}\n\`\`\`` }
        ]
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Groq error:', errText)
      res.write(`data: ${JSON.stringify({ text: 'API Error: ' + errText })}\n\n`)
      res.end()
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6))
            const text = json.choices?.[0]?.delta?.content
            if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`)
          } catch (e) {
            console.log('Parse skip:', trimmed)
          }
        }
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()

  } catch (err) {
    console.error('Route error:', err.message)
    res.write(`data: ${JSON.stringify({ text: 'Error: ' + err.message })}\n\n`)
    res.end()
  }
})

export default router