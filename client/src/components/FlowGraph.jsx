import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useEffect } from 'react'

// Custom node component
function FunctionNode({ data }) {
  return (
    <div style={{
      background: '#1a1a2e',
      border: '1.5px solid #0078d4',
      borderRadius: 10,
      padding: '10px 16px',
      minWidth: 160,
      boxShadow: '0 0 12px #0078d420',
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', marginBottom: 4 }}>
        ƒ {data.label}
      </div>
      {data.params && (
        <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>
          ({data.params})
        </div>
      )}
      <div style={{ fontSize: 10, color: '#444' }}>{data.lines}</div>
    </div>
  )
}

const nodeTypes = { functionNode: FunctionNode }

export default function FlowGraph({ nodes: initNodes, edges: initEdges, onClose }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)

  useEffect(() => {
    setNodes(initNodes)
    setEdges(initEdges)
  }, [initNodes, initEdges])

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: '#0a0a0f',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid #222',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#111',
      }}>
        <div>
          <span style={{ fontWeight: 700, color: '#60a5fa', fontSize: 15 }}>
            ⬡ Code Flow Graph
          </span>
          <span style={{ fontSize: 12, color: '#555', marginLeft: 12 }}>
            {nodes.length} functions · {edges.length} connections
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '5px 14px',
            background: 'transparent',
            border: '1px solid #333',
            borderRadius: 6,
            color: '#888',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          ✕ Close
        </button>
      </div>

      {/* Empty state */}
      {nodes.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#333' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⬡</div>
          <div style={{ fontSize: 15, color: '#555' }}>No functions found</div>
          <div style={{ fontSize: 12, color: '#333', marginTop: 8 }}>Write some functions in the editor and try again</div>
        </div>
      ) : (
        <div style={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
          >
            <Background color="#1a1a2e" gap={20} />
            <Controls style={{ background: '#111', border: '1px solid #222' }} />
            <MiniMap
              style={{ background: '#0d0d0d', border: '1px solid #222' }}
              nodeColor="#0078d4"
            />
          </ReactFlow>
        </div>
      )}
    </div>
  )
}