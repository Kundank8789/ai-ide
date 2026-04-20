import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useEffect } from 'react'

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
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    // Add proper edge markers
    const styledEdges = initEdges.map(e => ({
      ...e,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#0078d4', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#0078d4',
        width: 20,
        height: 20,
      },
    }))
    setNodes(initNodes)
    setEdges(styledEdges)
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
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#444' }}>drag nodes · scroll to zoom</span>
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
      </div>

      {/* Legend */}
      <div style={{
        padding: '8px 20px',
        background: '#0d0d0d',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        gap: 20,
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 30, height: 2, background: '#0078d4', position: 'relative' }}>
            <div style={{ position: 'absolute', right: -4, top: -4, width: 0, height: 0, borderLeft: '8px solid #0078d4', borderTop: '4px solid transparent', borderBottom: '4px solid transparent' }} />
          </div>
          <span style={{ fontSize: 11, color: '#555' }}>function call</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 16, background: '#1a1a2e', border: '1.5px solid #0078d4', borderRadius: 4 }} />
          <span style={{ fontSize: 11, color: '#555' }}>function node</span>
        </div>
        <span style={{ fontSize: 11, color: '#333', marginLeft: 'auto' }}>
          tip: click ⊡ to fit all nodes in view
        </span>
      </div>

      {/* Empty state */}
      {nodes.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⬡</div>
          <div style={{ fontSize: 15, color: '#555' }}>No functions found</div>
          <div style={{ fontSize: 12, color: '#333', marginTop: 8 }}>
            Write some functions in the editor and try again
          </div>
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
            fitViewOptions={{ padding: 0.4 }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
            }}
          >
            <Background color="#111" gap={24} size={1} />
            <Controls style={{ background: '#111', border: '1px solid #222', borderRadius: 8 }} />
            <MiniMap
              style={{ background: '#0d0d0d', border: '1px solid #222' }}
              nodeColor="#1a1a2e"
              maskColor="rgba(0,0,0,0.6)"
            />
          </ReactFlow>
        </div>
      )}
    </div>
  )
}