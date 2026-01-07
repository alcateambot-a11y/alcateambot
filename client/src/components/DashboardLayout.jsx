import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, CreditCard, HelpCircle, LogOut, Settings, MessageSquare, 
  Terminal, Filter, Menu, FileText, User, Shield, PanelLeftClose, PanelLeft, X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import api from '../lib/api'

const mainMenu = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Pricing', path: '/dashboard/pricing', icon: CreditCard },
  { name: "FAQ's", path: '/dashboard/faq', icon: HelpCircle },
  { name: 'Changelog', path: '/dashboard/changelog', icon: FileText },
]

const botMenu = [
  { name: 'Config', path: '/dashboard/config', icon: Settings },
  { name: 'Mess', path: '/dashboard/mess', icon: MessageSquare },
  { name: 'Command', path: '/dashboard/command', icon: Terminal },
  { name: 'Filter Command', path: '/dashboard/filter-command', icon: Filter },
  { name: 'Menu', path: '/dashboard/menu', icon: Menu },
]

const userMenu = [
  { name: 'Setting', path: '/dashboard/setting', icon: User },
  { name: 'Invoice', path: '/dashboard/invoice', icon: FileText },
]

export default function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen')
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    loadUserProfile()
    const interval = setInterval(loadUserProfile, 30000)
    const handleStorageChange = (e) => {
      if (e.key === 'user' && e.newValue) setUser(JSON.parse(e.newValue))
    }
    window.addEventListener('storage', handleStorageChange)
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen))
  }, [sidebarOpen])

  const loadUserProfile = async () => {
    try {
      const { data } = await api.get('/user/profile')
      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
    } catch (err) {
      const u = localStorage.getItem('user')
      if (!u) navigate('/login')
      else setUser(JSON.parse(u))
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('bot')
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const SidebarContent = ({ mobile = false }) => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/logo/logo.png" alt="Logo" className="w-10 h-10 object-contain flex-shrink-0" />
          {(sidebarOpen || mobile) && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-lg text-gray-900 dark:text-white leading-tight whitespace-nowrap">Alcateambot<span className="text-purple-600 dark:text-purple-400">.Corp</span></span>
              <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">WhatsApp Bot Gateway</span>
            </div>
          )}
        </Link>
        {mobile && (
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className={`${(sidebarOpen || mobile) ? 'px-3' : 'px-2'} space-y-1`}>
          {mainMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={!(sidebarOpen || mobile) ? item.name : ''}
              className={`flex items-center ${(sidebarOpen || mobile) ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg transition text-sm ${
                isActive(item.path) 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(sidebarOpen || mobile) && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          {(sidebarOpen || mobile) && <p className="px-6 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">BOT</p>}
          {!(sidebarOpen || mobile) && <div className="border-t border-gray-200 dark:border-gray-700 mx-3 my-2"></div>}
          <div className={`${(sidebarOpen || mobile) ? 'px-3' : 'px-2'} space-y-1`}>
            {botMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                title={!(sidebarOpen || mobile) ? item.name : ''}
                className={`flex items-center ${(sidebarOpen || mobile) ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg transition text-sm ${
                  isActive(item.path) 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(sidebarOpen || mobile) && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {(sidebarOpen || mobile) && <p className="px-6 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">USER</p>}
          {!(sidebarOpen || mobile) && <div className="border-t border-gray-200 dark:border-gray-700 mx-3 my-2"></div>}
          <div className={`${(sidebarOpen || mobile) ? 'px-3' : 'px-2'} space-y-1`}>
            {userMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                title={!(sidebarOpen || mobile) ? item.name : ''}
                className={`flex items-center ${(sidebarOpen || mobile) ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg transition text-sm ${
                  isActive(item.path) 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(sidebarOpen || mobile) && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className={`${(sidebarOpen || mobile) ? 'p-4' : 'p-2'} border-t border-gray-200 dark:border-gray-700`}>
        {(sidebarOpen || mobile) && user?.plan !== 'premium' && user?.plan !== 'pro' && (
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl p-3 mb-4">
            <p className="text-xs text-purple-200">Paket Anda</p>
            <p className="font-bold text-white capitalize">{user?.plan || 'Free'}</p>
            <Link to="/dashboard/pricing" className="mt-2 block text-center bg-white/20 hover:bg-white/30 rounded-lg py-1.5 text-xs font-medium text-white transition">
              Upgrade
            </Link>
          </div>
        )}

        <div className={`flex items-center ${(sidebarOpen || mobile) ? 'gap-3' : 'justify-center'} mb-3`}>
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          {(sidebarOpen || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        
        {user?.role === 'admin' && (
          <Link 
            to="/admin" 
            title={!(sidebarOpen || mobile) ? 'Admin Panel' : ''}
            className={`flex items-center ${(sidebarOpen || mobile) ? 'gap-2 px-3' : 'justify-center px-2'} text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 w-full py-2 rounded-lg text-sm mb-2`}
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            {(sidebarOpen || mobile) && <span>Admin Panel</span>}
          </Link>
        )}
        
        <button 
          onClick={logout} 
          title={!(sidebarOpen || mobile) ? 'Logout' : ''}
          className={`flex items-center ${(sidebarOpen || mobile) ? 'gap-2 px-3' : 'justify-center px-2'} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 w-full py-2 rounded-lg text-sm`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(sidebarOpen || mobile) && <span>Logout</span>}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-800 z-50 transform transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <SidebarContent mobile={true} />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full hidden lg:flex flex-col transition-all duration-300 ease-in-out z-10`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className={`flex-1 lg:${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out`} style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? (sidebarOpen ? '16rem' : '5rem') : '0' }}>
        {/* Top Bar */}
        <div className="p-3 sm:p-4 pb-0 relative z-20">
          <header className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Desktop Sidebar Toggle */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:block p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
                title={sidebarOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
              >
                {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
              </button>
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.plan || 'Free'}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm sm:text-base">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
            </div>
          </header>
        </div>

        {/* Page Content */}
        <div className="p-3 sm:p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
