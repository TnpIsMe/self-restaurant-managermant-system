import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 'light' | 'dark'
export const useThemeStore = create(
  persist(
    (set) => ({
      mode: 'light',
      toggleTheme: () => set((state) => ({
        mode: state.mode === 'light' ? 'dark' : 'light'
      })),
      setTheme: (mode) => set({ mode }),
    }),
    {
      name: 'theme',
      partialize: (s) => ({ mode: s.mode }),
    }
  )
)
