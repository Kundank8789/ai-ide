const INTENTS = [
  { id: 'readability', label: '📖 Readability', color: '#0078d4' },
  { id: 'performance', label: '⚡ Performance', color: '#107c10' },
  { id: 'security',    label: '🔒 Security',    color: '#d83b01' },
  { id: 'minimal',     label: '✂️ Minimal',     color: '#5c2d91' },
  { id: 'explain',     label: '🧠 Explain',     color: '#b4a000' },
]

export default function IntentSelector({ intent, setIntent }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {INTENTS.map(i => (
        <button
          key={i.id}
          onClick={() => setIntent(i.id)}
          style={{
            padding: '5px 11px',
            borderRadius: 6,
            border: intent === i.id ? `1.5px solid ${i.color}` : '1px solid #333',
            background: intent === i.id ? i.color + '20' : 'transparent',
            color: intent === i.id ? i.color : '#666',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: intent === i.id ? 600 : 400,
            transition: 'all 0.15s',
          }}
        >
          {i.label}
        </button>
      ))}
    </div>
  )
}