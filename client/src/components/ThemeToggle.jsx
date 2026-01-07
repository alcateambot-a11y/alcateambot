import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const handleScroll = () => setOpen(false)
    
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [])

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    setOpen(false)
  }

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  const CurrentIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`
          flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 border
          ${isDark
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 border-gray-700'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200'
          }
          ${open ? 'ring-2 ring-purple-500/50' : ''}
        `}
        aria-label="Toggle theme"
      >
        <CurrentIcon className="w-5 h-5" />
      </button>

      {open && (
        <>
          {/* Backdrop untuk mobile */}
          <div 
            className="fixed inset-0 z-[998] lg:hidden" 
            onClick={() => setOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div 
            className={`
              absolute left-0 mt-2 w-40 rounded-xl shadow-xl border py-1 z-[9999]
              animate-dropdown
              ${isDark
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
              }
            `}
          >
            {options.map((opt) => {
              const Icon = opt.icon
              const isActive = theme === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => handleThemeChange(opt.value)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all
                    ${isActive 
                      ? isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-700/50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{opt.label}</span>
                  {isActive && <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
