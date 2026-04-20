import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { loadMemories, saveMemory, deleteMemory } from '../utils/memoryUtils'

const INTENT_CONFIG = {
  readability: { color: '#0078d4', label: 'Readability' },
  performance: { color: '#107c10', label: 'Performance' },
  security:    { color: '#d83b01', label: 'Security'    },
  minimal:     { color: '#5c2d91', label: 'Minimal'     },
  explain:     { color: '#b4a000', label: 'Explain'     },
}

function parseResponse(text) {
  const parts = []
  const regex = /```(\w+)?\n([\s\S]*?)```/g
  let last = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: 'text', content: text.slice(last, match.index) })
    }
    parts.push({ type: 'code', lang: match[1] || 'javascript', content: match[2] })
    last = match.index + match[0].length
  }

  if (last < text.length) {
    parts.push({ type: 'text', content: text.slice(last) })
  }

  return parts
}

export default function AIPanel() {
  const { code, intent, language } = useStore()
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [memories, setMemories] = useState(loadMemories())
  const [showMemory, setShowMemory] = useState(false)
  const [copied, setCopied] = useState(false)

  const config = INTENT_CONFIG[intent] || INTENT_CONFIG.readability

  async function refactor() {
    const currentCode = window.__editorCode || code
    if (!currentCode.trim()) return
    setLoading(true)
    setResponse('')
    setError('')

    try {
      const res = await fetch('/api/refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentCode, intent, language, memories }),
      })

      if (!res.ok) {
        setError(`Server error: ${await res.text()}`)
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

  function handleSave() {
    if (!response) return
    const summary = response.slice(0, 150).replace(/[#`*]/g, '').trim()
    setMemories(saveMemory(summary, intent))
  }

  function handleDelete(id) {
    setMemories(deleteMemory(id))
  }

  function handleCopy() {
    navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const parts = parseResponse(response)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#111', color: '#fff' }}>
      
      {/* Panel header */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: config.color }}>
          {config.label} Mode
        </span>
        <button
          onClick={() => setShowMemory(!showMemory)}
          style={{ padding: '3px 10px', borderRadius: 5, border: '1px solid #333', background: showMemory ? '#222' : 'transparent', color: '#888', cursor: 'pointer', fontSize: 11 }}
        >
          🧠 Memory ({memories.length})
        </button>
      </div>

      {/* Memory panel */}
      {showMemory && (
        <div style={{ maxHeight: 180, overflowY: 'auto', borderBottom: '1px solid #222', padding: '10px 16px', background: '#0d0d0d' }}>
          {memories.length === 0
            ? <p style={{ color: '#444', fontSize: 12 }}>No saved decisions yet.</p>
            : memories.map(m => (
              <div key={m.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px solid #1a1a1a' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: INTENT_CONFIG[m.intent]?.color + '30', color: INTENT_CONFIG[m.intent]?.color }}>
                    {m.intent}
                  </span>
                  <span style={{ fontSize: 10, color: '#444', marginLeft: 6 }}>{m.timestamp}</span>
                  <p style={{ fontSize: 11, color: '#888', margin: '3px 0 0', lineHeight: 1.4 }}>{m.text.slice(0, 90)}...</p>
                </div>
                <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 14 }}>×</button>
              </div>
            ))
          }
        </div>
      )}

      {/* Action button */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #222' }}>
        <button
          onClick={refactor}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            background: loading ? '#1a1a1a' : config.color,
            color: loading ? '#555' : '#fff',
            border: loading ? '1px solid #333' : 'none',
            borderRadius: 7,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.15s',
          }}
        >
          {loading ? '⏳ AI is thinking...' : `▶ Run ${config.label} Mode`}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: '0 16px 10px', padding: 10, background: '#2a0a0a', color: '#ff6b6b', borderRadius: 6, fontSize: 12 }}>
          {error}
        </div>
      )}

      {/* Response */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {!response && !loading && (
          <div style={{ color: '#333', fontSize: 13, textAlign: 'center', marginTop: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
            <div>Select a mode and run it</div>
            <div style={{ fontSize: 11, marginTop: 6, color: '#2a2a2a' }}>AI will refactor your code based on the selected intent</div>
          </div>
        )}

        {parts.map((part, i) =>
          part.type === 'code' ? (
            <SyntaxHighlighter
              key={i}
              language={part.lang}
              style={vscDarkPlus}
              customStyle={{ borderRadius: 8, fontSize: 12, margin: '8px 0' }}
            >
              {part.content}
            </SyntaxHighlighter>
          ) : (
            <p key={i} style={{ fontSize: 13, color: '#aaa', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: '4px 0' }}>
              {part.content}
            </p>
          )
        )}
      </div>

      {/* Footer actions */}
      {response && !loading && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid #222', display: 'flex', gap: 8 }}>
          <button
            onClick={handleCopy}
            style={{ flex: 1, padding: '7px', background: 'transparent', border: '1px solid #333', borderRadius: 6, color: copied ? '#107c10' : '#888', cursor: 'pointer', fontSize: 12 }}
          >
            {copied ? '✓ Copied!' : '📋 Copy Response'}
          </button>
          <button
            onClick={handleSave}
            style={{ flex: 1, padding: '7px', background: 'transparent', border: '1px solid #333', borderRadius: 6, color: '#888', cursor: 'pointer', fontSize: 12 }}
          >
            🧠 Save Decision
          </button>
        </div>
      )}
    </div>
  )
}