import { useState } from 'react'
import { useStore } from '../store/useStore'

function AIPanel() {
  const { code } = useStore()
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  async function refactor() {
    if (!code.trim()) return
    setLoading(true)
    setResponse('')

    const res = await fetch('/api/refactor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, intent: 'readability' }),
    })

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const lines = decoder.decode(value).split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const { text } = JSON.parse(line.slice(6))
            if (text) setResponse(prev => prev + text)
          } catch {}
        }
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1e1e1e', color: '#fff', padding: 20 }}>
      <h3 style={{ marginBottom: 16 }}>AI Refactor</h3>

      <button
        onClick={refactor}
        disabled={loading}
        style={{
          padding: '8px 16px',
          background: loading ? '#555' : '#0078d4',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: 16,
          fontSize: 14,
        }}
      >
        {loading ? 'Thinking...' : 'Refactor Code'}
      </button>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        background: '#2d2d2d',
        borderRadius: 6,
        padding: 12,
        fontSize: 13,
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
        color: response ? '#d4d4d4' : '#888',
      }}>
        {response || 'AI response will appear here...'}
      </div>
    </div>
  )
}

export default AIPanel