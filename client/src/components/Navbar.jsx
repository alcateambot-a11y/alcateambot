import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'shadow-sm backdrop-blur-md bg-white/95 dark:bg-gray-900/95' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-0">
            <img src="/logo/logo.png" alt="Alcateambot.Corp" className="w-14 h-14 object-contain" />
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-tight tracking-tight text-gray-900 dark:text-white">
                Alcateambot<span className="text-purple-500">.Corp</span>
              </span>
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">WhatsApp Bot Gateway</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            <a href="/#features" className="px-4 py-2 font-medium transition hover:text-purple-500 text-gray-600 dark:text-gray-300">Fitur</a>
            <a href="/#pricing" className="px-4 py-2 font-medium transition hover:text-purple-500 text-gray-600 dark:text-gray-300">Harga</a>
            <div className="w-px h-6 mx-2 bg-gray-200 dark:bg-gray-700"></div>
            <ThemeToggle />
            <div className="w-px h-6 mx-2 bg-gray-200 dark:bg-gray-700"></div>
            <Link to="/login" className="px-4 py-2 font-medium transition hover:text-purple-500 text-gray-600 dark:text-gray-300">Login</Link>
            <Link to="/register" className="ml-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all">
              Coba Gratis
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button className="p-2" onClick={() => setOpen(!open)}>
              {open ? <X className="w-6 h-6 text-gray-900 dark:text-white" /> : <Menu className="w-6 h-6 text-gray-900 dark:text-white" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-80 border-t' : 'max-h-0'} bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800`}>
        <div className="p-4 space-y-2">
          <a href="/#features" className="block py-3 px-4 rounded-lg font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800">Fitur</a>
          <a href="/#pricing" className="block py-3 px-4 rounded-lg font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800">Harga</a>
          <hr className="border-gray-200 dark:border-gray-700" />
          <Link to="/login" className="block py-3 px-4 rounded-lg font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800">Login</Link>
          <Link to="/register" className="block bg-gradient-to-r from-purple-500 to-violet-600 text-white text-center py-3 rounded-xl font-semibold">
            Coba Gratis
          </Link>
        </div>
      </div>
    </nav>
  )
}
