import { create } from 'zustand'

export const useStore = create((set) => ({
  code: `// Paste your code here and click Refactor
function add(a, b) {
  return a + b
}`,
  intent: 'readability',
  setCode: (code) => set({ code }),
  setIntent: (intent) => set({ intent }),
}))