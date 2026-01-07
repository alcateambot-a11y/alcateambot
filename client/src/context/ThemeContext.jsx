import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'system'
    }
    return 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') || 'system'
      if (saved === 'dark') return 'dark'
      if (saved === 'light') return 'light'
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  // Function to apply theme to DOM
  const applyTheme = useCallback((currentTheme) => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = currentTheme === 'dark' || (currentTheme === 'system' && systemDark)
    
    // Direct DOM manipulation on html element
    const html = document.documentElement
    
    // Remove both classes first
    html.classList.remove('light', 'dark')
    
    // Add the appropriate class
    if (isDark) {
      html.classList.add('dark')
      html.style.colorScheme = 'dark'
    } else {
      html.classList.add('light')
      html.style.colorScheme = 'light'
    }
    
    return isDark ? 'dark' : 'light'
  }, [])

  // Apply theme on mount
  useEffect(() => {
    const resolved = applyTheme(theme)
    setResolvedTheme(resolved)
  }, [theme, applyTheme])

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') {
        const resolved = applyTheme(theme)
        setResolvedTheme(resolved)
      }
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme, applyTheme])

  // Listen for storage changes (for multi-tab sync)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'theme' && e.newValue) {
        setThemeState(e.newValue)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const setTheme = useCallback((newTheme) => {
    localStorage.setItem('theme', newTheme)
    setThemeState(newTheme)
    // Apply immediately
    const resolved = applyTheme(newTheme)
    setResolvedTheme(resolved)
  }, [applyTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
