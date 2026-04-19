import MonacoEditor from '@monaco-editor/react'
import { useStore } from '../store/useStore'

function Editor() {
  const { code, setCode } = useStore()

  return (
    <MonacoEditor
      height="100vh"
      defaultLanguage="javascript"
      value={code}
      onChange={(val) => setCode(val || '')}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        padding: { top: 16 },
        wordWrap: 'on',
      }}
    />
  )
}

export default Editor