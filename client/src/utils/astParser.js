import * as parser from '@babel/parser'

export function parseCodeToGraph(code) {
  const nodes = []
  const edges = []
  const functionMap = {}

  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
      errorRecovery: true,
    })

    let nodeId = 0

    // Walk AST manually (no traverse needed)
    function walk(node) {
      if (!node || typeof node !== 'object') return

      // Function declarations
      if (node.type === 'FunctionDeclaration' && node.id) {
        const id = `fn-${nodeId++}`
        functionMap[node.id.name] = id
        nodes.push({
          id,
          type: 'functionNode',
          data: {
            label: node.id.name,
            params: node.params?.map(p => p.name || '...').join(', ') || '',
            lines: `L${node.loc?.start?.line}–${node.loc?.end?.line}`,
          },
          position: { x: 0, y: 0 },
        })
      }

      // Arrow functions / const fn = () => {}
      if (
        node.type === 'VariableDeclarator' &&
        node.id?.name &&
        (node.init?.type === 'ArrowFunctionExpression' ||
          node.init?.type === 'FunctionExpression')
      ) {
        const id = `fn-${nodeId++}`
        functionMap[node.id.name] = id
        nodes.push({
          id,
          type: 'functionNode',
          data: {
            label: node.id.name,
            params: node.init?.params?.map(p => p.name || '...').join(', ') || '',
            lines: `L${node.loc?.start?.line}–${node.loc?.end?.line}`,
          },
          position: { x: 0, y: 0 },
        })
      }

      // Recurse into children
      for (const key of Object.keys(node)) {
        if (key === 'parent') continue
        const child = node[key]
        if (Array.isArray(child)) child.forEach(walk)
        else if (child && typeof child === 'object' && child.type) walk(child)
      }
    }

    walk(ast.program)

    // Second pass — find call expressions and build edges
    const edgeSet = new Set()

    function findCalls(node, currentFnId) {
      if (!node || typeof node !== 'object') return

      if (
        node.type === 'FunctionDeclaration' &&
        node.id &&
        functionMap[node.id.name]
      ) {
        currentFnId = functionMap[node.id.name]
      }

      if (
        node.type === 'VariableDeclarator' &&
        node.id?.name &&
        functionMap[node.id.name]
      ) {
        currentFnId = functionMap[node.id.name]
      }

      if (
        node.type === 'CallExpression' &&
        node.callee?.name &&
        currentFnId &&
        functionMap[node.callee.name] &&
        functionMap[node.callee.name] !== currentFnId
      ) {
        const edgeKey = `${currentFnId}->${functionMap[node.callee.name]}`
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey)
          edges.push({
            id: `e-${edges.length}`,
            source: currentFnId,
            target: functionMap[node.callee.name],
            animated: true,
            style: { stroke: '#0078d4' },
          })
        }
      }

      for (const key of Object.keys(node)) {
        if (key === 'parent') continue
        const child = node[key]
        if (Array.isArray(child)) child.forEach(c => findCalls(c, currentFnId))
        else if (child && typeof child === 'object' && child.type)
          findCalls(child, currentFnId)
      }
    }

    findCalls(ast.program, null)

    // Auto layout — arrange nodes in a grid
    nodes.forEach((node, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      node.position = { x: col * 220, y: row * 160 }
    })

  } catch (err) {
    console.error('AST parse error:', err.message)
  }

  return { nodes, edges }
}