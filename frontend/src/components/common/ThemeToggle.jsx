import { useThemeStore } from '@/store/themeStore'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { mode, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={`Theme: ${mode === 'light' ? 'Light' : 'Dark'}`}
      aria-label={`Switch theme (current: ${mode})`}
    >
      {mode === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  )
}
