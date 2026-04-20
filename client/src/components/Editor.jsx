import MonacoEditor from '@monaco-editor/react'
import { useStore } from '../store/useStore'

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust']

export default function Editor() {
  const { code, setCode, language, setLanguage } = useStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Editor toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 14px',
        background: '#111',
        borderBottom: '1px solid #222'
      }}>
        <span style={{ fontSize: 12, color: '#555' }}>Language:</span>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          style={{
            background: '#1e1e1e',
            color: '#ccc',
            border: '1px solid #333',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          {LANGUAGES.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <span style={{ fontSize: 11, color: '#444', marginLeft: 'auto' }}>
          {code.split('\n').length} lines
        </span>
      </div>

      <MonacoEditor
        height="100%"
        language={language}
        value={code}
        onChange={(val) => {
          setCode(val || '')
          window.__editorCode = val || ''
        }}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          padding: { top: 12 },
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          renderLineHighlight: 'line',
          smoothScrolling: true,
        }}
      />
    </div>
  )
}