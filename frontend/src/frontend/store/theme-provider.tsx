import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  toggle: () => void
  setDark: (isDark: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () => set((state) => ({ isDark: !state.isDark })),
      setDark: (isDark: boolean) => set({ isDark }),
    }),
    {
      name: 'theme-storage',
    }
  )
)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { isDark } = useThemeStore()
  
  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {children}
      </div>
    </div>
  )
}

export default useThemeStore
