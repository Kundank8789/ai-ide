import { create } from 'zustand'

export const useStore = create((set) => ({
  code: `// Write or paste your code here\nfunction add(a, b) {\n  return a + b\n}`,
  intent: 'readability',
  language: 'javascript',
  setCode: (code) => set({ code }),
  setIntent: (intent) => set({ intent }),
  setLanguage: (language) => set({ language }),
}))