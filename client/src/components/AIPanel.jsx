import { useState } from 'react'

const INTENTS = [
  { id: 'readability', label: 'Readability', color: '#0078d4' },
  { id: 'performance', label: 'Performance', color: '#107c10' },
  { id: 'minimal',     label: 'Minimal',     color: '#5c2d91' },
]

function AIPanel() {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [intent, setIntent] = useState('readability')

  async function refactor() {
    const code = window.__editorCode || 'function add(a,b){ return a+b }'
    setLoading(true)
    setResponse('')
    setError('')

    try {
      const res = await fetch('/api/refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, intent }),
      })

      if (!res.ok) {
        const err = await res.text()
        setError(`Error: ${err}`)
        setLoading(false)
        return
      }

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
    } catch (err) {
      setError('Network error: ' + err.message)
    }

    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1e1e1e', color: '#fff', padding: 20 }}>
      <h3 style={{ marginBottom: 12 }}>AI Refactor</h3>

      {/* Intent selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {INTENTS.map(i => (
          <button
            key={i.id}
            onClick={() => setIntent(i.id)}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              border: intent === i.id ? `2px solid ${i.color}` : '1px solid #444',
              background: intent === i.id ? i.color + '22' : 'transparent',
              color: intent === i.id ? i.color : '#aaa',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: intent === i.id ? 600 : 400,
            }}
          >
            {i.label}
          </button>
        ))}
      </div>

      <button
        onClick={refactor}
        disabled={loading}
        style={{
          padding: '8px 16px',
          background: loading ? '#555' : INTENTS.find(i => i.id === intent)?.color,
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: 16,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {loading ? 'Thinking...' : `Refactor for ${intent}`}
      </button>

      {error && (
        <div style={{ background: '#5a1a1a', color: '#ff6b6b', padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 12 }}>
          {error}
        </div>
      )}

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
        {response || 'Select an intent and click Refactor...'}
      </div>
    </div>
  )
}

export default AIPanel