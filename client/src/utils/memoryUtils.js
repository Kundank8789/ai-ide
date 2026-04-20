const KEY = 'ai-ide-decisions'

export function loadMemories() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function saveMemory(text, intent) {
  const memories = loadMemories()
  const newMemory = {
    id: Date.now(),
    text,
    intent,
    timestamp: new Date().toLocaleDateString()
  }
  const updated = [newMemory, ...memories].slice(0, 20)
  localStorage.setItem(KEY, JSON.stringify(updated))
  return updated
}

export function deleteMemory(id) {
  const updated = loadMemories().filter(m => m.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated))
  return updated
}