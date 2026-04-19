import Editor from './components/Editor'
import AIPanel from './components/AIPanel'

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1, borderRight: '1px solid #333' }}>
        <Editor />
      </div>
      <div style={{ width: '420px' }}>
        <AIPanel />
      </div>
    </div>
  )
}

export default App