import { useState } from 'react'
import Editor from './components/Editor'
import AIPanel from './components/AIPanel'
import IntentSelector from './components/IntentSelector'
import FlowGraph from './components/FlowGraph'
import { useStore } from './store/useStore'
import { parseCodeToGraph } from './utils/astParser'

function App() {
  const { intent, setIntent, code } = useStore()
  const [showFlow, setShowFlow] = useState(false)
  const [flowData, setFlowData] = useState({ nodes: [], edges: [] })

  function handleShowFlow() {
    const currentCode = window.__editorCode || code
    const graph = parseCodeToGraph(currentCode)
    setFlowData(graph)
    setShowFlow(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0d0d0d', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        borderBottom: '1px solid #222',
        background: '#111',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>⚡ AI IDE</span>
          <span style={{ fontSize: 11, color: '#555', padding: '2px 8px', border: '1px solid #333', borderRadius: 4 }}>beta</span>
        </div>

        <IntentSelector intent={intent} setIntent={setIntent} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button
            onClick={handleShowFlow}
            style={{
              padding: '6px 14px',
              background: 'transparent',
              border: '1px solid #0078d4',
              borderRadius: 6,
              color: '#0078d4',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            ⬡ Flow Graph
          </button>
          <span style={{ fontSize: 12, color: '#333' }}>Monaco + AI</span>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, borderRight: '1px solid #222' }}>
          <Editor />
        </div>
        <div style={{ width: '440px', overflowY: 'auto' }}>
          <AIPanel />
        </div>
      </div>

      {/* Flow Graph overlay */}
      {showFlow && (
        <FlowGraph
          nodes={flowData.nodes}
          edges={flowData.edges}
          onClose={() => setShowFlow(false)}
        />
      )}
    </div>
  )
}

export default App