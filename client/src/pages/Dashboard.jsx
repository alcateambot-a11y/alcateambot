import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Bot, Users, Power, Settings, RefreshCw, Play, Square, Trash2, HelpCircle, ChevronDown, ChevronUp, Clock, Crown, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { io } from 'socket.io-client'

export default function Dashboard() {
  const [bot, setBot] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qrModal, setQrModal] = useState({ show: false, qr: '' })
  const [actionLoading, setActionLoading] = useState('')
  const [showFaq, setShowFaq] = useState(true)
  const [expandedFaq, setExpandedFaq] = useState(0)
  const [runtime, setRuntime] = useState('00:00:00')

  useEffect(() => {
    // Load user from server (fresh data)
    loadUserProfile()
    loadBot(true)
    const interval = setInterval(() => loadBot(false), 5000)
    // Refresh user profile every 30 seconds for plan sync
    const userInterval = setInterval(() => loadUserProfile(), 30000)
    return () => {
      clearInterval(interval)
      clearInterval(userInterval)
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      const { data } = await api.get('/user/profile')
      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
    } catch (err) {
      // Fallback to localStorage if API fails
      const u = localStorage.getItem('user')
      if (u) setUser(JSON.parse(u))
    }
  }

  useEffect(() => {
    if (!bot?.id) return
    const socketUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000')
    const socket = io(socketUrl, { transports: ['polling', 'websocket'], withCredentials: true, reconnectionAttempts: 5, reconnectionDelay: 1000 })
    socket.on(`status-${bot.id}`, (status) => {
      if (status === 'connected' || status === 'disconnected') {
        loadBot(false)
        if (status === 'connected') { setQrModal({ show: false, qr: '' }); setActionLoading('') }
      }
    })
    socket.on(`qr-${bot.id}`, (qr) => { if (actionLoading === 'start') { setQrModal({ show: true, qr }); setActionLoading('') } })
    return () => socket.disconnect()
  }, [bot?.id])

  useEffect(() => {
    let interval
    if (bot?.status === 'connected' && bot?.connectedAt) {
      interval = setInterval(() => {
        const diff = Date.now() - new Date(bot.connectedAt).getTime()
        const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000)
        setRuntime(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`)
      }, 1000)
    } else setRuntime('00:00:00')
    return () => clearInterval(interval)
  }, [bot?.status, bot?.connectedAt])

  const loadBot = async (showLog = false) => {
    try {
      const { data } = await api.get('/bots/my-bot')
      setBot(prev => (!prev || prev.status !== data.status || prev.id !== data.id) ? data : { ...prev, ...data })
      localStorage.setItem('bot', JSON.stringify(data))
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; return }
    }
    setLoading(false)
  }

  const startBot = async () => {
    if (actionLoading) return
    let currentBot = bot
    if (!currentBot) {
      setActionLoading('start')
      try { const { data } = await api.get('/bots/my-bot'); setBot(data); currentBot = data; localStorage.setItem('bot', JSON.stringify(data)) }
      catch (err) { setActionLoading(''); toast.error('Gagal memuat bot'); return }
    }
    if (!currentBot?.id) { setActionLoading(''); toast.error('Bot tidak ditemukan'); return }
    setActionLoading('start')
    try {
      const response = await api.post(`/bots/${currentBot.id}/start`)
      if (response.data.needsQR) {
        toast.success('Menghubungkan... Tunggu QR code')
        const socketUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000')
        const socket = io(socketUrl, { transports: ['polling', 'websocket'], withCredentials: true })
        socket.on(`qr-${currentBot.id}`, (qr) => { setQrModal({ show: true, qr }); setActionLoading('') })
        socket.on(`status-${currentBot.id}`, (status) => { if (status === 'connected') { setQrModal({ show: false, qr: '' }); toast.success('Bot terhubung!'); socket.disconnect(); loadBot(); setActionLoading('') } else if (status === 'disconnected') { setQrModal({ show: false, qr: '' }); loadBot(); setActionLoading('') } })
        setTimeout(() => { if (actionLoading === 'start' && !qrModal.show) setActionLoading('') }, 30000)
      } else { toast.success('Bot started!'); loadBot(); setActionLoading('') }
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal start bot'); setActionLoading('') }
  }

  const stopBot = async () => { if (!bot) return; setActionLoading('stop'); try { await api.post(`/bots/${bot.id}/stop`); toast.success('Bot stopped'); loadBot() } catch (err) { toast.error(err.response?.data?.error || 'Gagal stop bot') } setActionLoading('') }
  const deleteSession = async () => { 
    // Allow delete even if bot object is incomplete
    let botId = bot?.id
    if (!botId) {
      // Try to get bot ID from localStorage
      try {
        const storedBot = JSON.parse(localStorage.getItem('bot') || '{}')
        botId = storedBot.id
      } catch (e) {}
    }
    
    if (!botId) {
      toast.error('Bot tidak ditemukan')
      return
    }
    
    if (!confirm('Yakin ingin menghapus session? Anda perlu scan QR code ulang.')) return
    
    setActionLoading('delete')
    try { 
      await api.delete(`/bots/${botId}/session`)
      toast.success('Session dihapus! Silakan klik Start untuk scan QR baru.')
      loadBot() 
    } catch (err) { 
      console.error('Delete session error:', err)
      toast.error(err.response?.data?.error || 'Gagal hapus session') 
    } 
    setActionLoading('') 
  }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-purple-600" /></div></DashboardLayout>

  // Use user.planExpiredAt for subscription info (synced from admin)
  const isExpired = user?.planExpiredAt && new Date(user.planExpiredAt) < new Date()
  const daysLeft = user?.planExpiredAt ? Math.ceil((new Date(user.planExpiredAt) - new Date()) / 86400000) : null
  const isPaidPlan = user?.plan === 'premium' || user?.plan === 'pro'
  
  // Format expiry display - show date if > 30 days, show days if <= 30 days
  const formatExpiry = () => {
    if (!user?.planExpiredAt) return ''
    const expDate = new Date(user.planExpiredAt)
    if (daysLeft > 30) {
      // Show full date
      return expDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    } else if (daysLeft > 0) {
      return `${daysLeft} hari lagi`
    } else {
      return 'Expired'
    }
  }

  const faqItems = [
    { question: 'Bagaimana cara mengaktifkan bot?', answer: '1. Klik tombol "Start" di dashboard\n2. Jika belum pernah terhubung, akan muncul QR Code\n3. Scan QR Code menggunakan WhatsApp di HP\n4. Buka WhatsApp → Settings → Linked Devices → Link a Device\n5. Arahkan kamera ke QR Code\n6. Tunggu hingga status berubah menjadi "Connected"' },
    { question: 'Apa fungsi masing-masing tombol?', answer: '• Start: Mengaktifkan bot\n• Stop: Menghentikan bot sementara\n• Delete Session: Menghapus session, perlu scan QR ulang' },
    { question: 'Bagaimana cara menggunakan bot?', answer: '1. Pastikan bot sudah "Connected"\n2. Kirim pesan ke nomor bot atau tambahkan ke grup\n3. Gunakan prefix "!" diikuti command, contoh: !menu' },
    { question: 'Kenapa bot tidak merespon?', answer: '• Pastikan status bot "Connected"\n• Cek apakah masa aktif belum expired\n• Pastikan menggunakan prefix yang benar' },
    { question: 'Bagaimana cara menambah auto-reply?', answer: '1. Buka menu "Filter Command"\n2. Klik "Tambah Filter"\n3. Masukkan trigger dan response\n4. Simpan filter' }
  ]

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Selamat datang, {user?.name}!</p>
      </div>

      {/* User Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-3 sm:p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-purple-600 dark:text-purple-400 font-bold">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-800 dark:text-white truncate text-sm sm:text-base">{user?.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">User ID: {user?.id} | Bot ID: {bot?.id || '-'}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Status Bot</p>
              <p className={`text-lg sm:text-xl font-bold ${bot?.status === 'connected' ? 'text-green-600' : 'text-gray-400'}`}>{bot?.status === 'connected' ? 'Online' : 'Offline'}</p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bot?.status === 'connected' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Power className={`w-5 h-5 sm:w-6 sm:h-6 ${bot?.status === 'connected' ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Total Grup</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{bot?.totalGroups || 0}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Runtime</p>
              <p className={`text-base sm:text-xl font-bold font-mono ${bot?.status === 'connected' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>{runtime}</p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bot?.status === 'connected' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Clock className={`w-5 h-5 sm:w-6 sm:h-6 ${bot?.status === 'connected' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Plan</p>
              <p className={`text-lg sm:text-xl font-bold capitalize ${user?.plan === 'premium' || user?.plan === 'unlimited' ? 'text-yellow-600' : user?.plan === 'basic' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}>{user?.plan || 'Free'}</p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${user?.plan === 'premium' || user?.plan === 'unlimited' ? 'bg-yellow-100 dark:bg-yellow-900/30' : user?.plan === 'basic' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Crown className={`w-5 h-5 sm:w-6 sm:h-6 ${user?.plan === 'premium' || user?.plan === 'unlimited' ? 'text-yellow-600' : user?.plan === 'basic' ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Bot Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${bot?.status === 'connected' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <Bot className={`w-6 h-6 sm:w-8 sm:h-8 ${bot?.status === 'connected' ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{bot?.name || 'My Bot'}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{bot?.phone || 'Belum terhubung'}</p>
              </div>
            </div>
            <span className={`self-start sm:self-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${bot?.status === 'connected' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : bot?.status === 'connecting' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
              {bot?.status === 'connected' ? '🟢 Connected' : bot?.status === 'connecting' ? '🟡 Connecting...' : '⚪ Disconnected'}
            </span>
          </div>

          {isPaidPlan && user?.planExpiredAt && (
            <div className={`mb-6 p-3 sm:p-4 rounded-xl ${isExpired ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : daysLeft <= 7 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'}`}>
              {isExpired ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div><p className="font-medium text-red-700 dark:text-red-400 text-sm sm:text-base">⚠️ Langganan sudah expired!</p><p className="text-xs sm:text-sm text-red-600 dark:text-red-400">Perpanjang langganan untuk mengaktifkan kembali</p></div>
                  <Link to="/dashboard/pricing" className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-red-700 text-center">Perpanjang</Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div><p className={`font-medium text-sm sm:text-base ${daysLeft <= 7 ? 'text-yellow-700 dark:text-yellow-400' : 'text-blue-700 dark:text-blue-400'}`}>📅 Masa aktif: {formatExpiry()}</p></div>
                  {daysLeft <= 7 && <Link to="/dashboard/pricing" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-700 text-center">Perpanjang</Link>}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button onClick={startBot} disabled={actionLoading === 'start' || bot?.status === 'connected' || bot?.status === 'connecting' || isExpired} className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm hover:bg-green-100 dark:hover:bg-green-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {actionLoading === 'start' ? <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4" />} <span className="hidden xs:inline">Start</span>
            </button>
            <button onClick={stopBot} disabled={actionLoading === 'stop' || (bot?.status !== 'connected' && bot?.status !== 'connecting')} className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {actionLoading === 'stop' ? <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Square className="w-3 h-3 sm:w-4 sm:h-4" />} <span className="hidden xs:inline">Stop</span>
            </button>
            <button onClick={deleteSession} disabled={actionLoading === 'delete'} className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {actionLoading === 'delete' ? <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />} <span className="hidden xs:inline">Delete</span>
            </button>
          </div>
          
          <div className="mt-4">
            <Link to="/dashboard/config" className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300">
              <Settings className="w-5 h-5" /> Bot Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Link to="/dashboard/config" className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition"><Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div>
            <div><p className="font-medium text-gray-900 dark:text-white">Config</p><p className="text-sm text-gray-500 dark:text-gray-400">Atur konfigurasi bot</p></div>
          </div>
        </Link>
        <Link to="/dashboard/mess" className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition"><MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
            <div><p className="font-medium text-gray-900 dark:text-white">Mess</p><p className="text-sm text-gray-500 dark:text-gray-400">Kustomisasi pesan bot</p></div>
          </div>
        </Link>
        <Link to="/dashboard/command" className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition"><MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
            <div><p className="font-medium text-gray-900 dark:text-white">Command</p><p className="text-sm text-gray-500 dark:text-gray-400">Kelola command bot</p></div>
          </div>
        </Link>
      </div>

      {/* FAQ Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
        <button onClick={() => setShowFaq(!showFaq)} className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center"><HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div>
            <div className="text-left"><h3 className="font-semibold text-gray-800 dark:text-white">FAQ - Cara Menggunakan Bot</h3><p className="text-sm text-gray-500 dark:text-gray-400">Panduan lengkap mengaktifkan dan menggunakan bot</p></div>
          </div>
          {showFaq ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {showFaq && (
          <div className="border-t dark:border-gray-700 divide-y dark:divide-gray-700">
            {faqItems.map((item, index) => (
              <div key={index} className="px-6">
                <button onClick={() => setExpandedFaq(expandedFaq === index ? -1 : index)} className="w-full flex items-center justify-between py-4 text-left">
                  <span className="font-medium text-gray-800 dark:text-white">{item.question}</span>
                  {expandedFaq === index ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {expandedFaq === index && <div className="pb-4 text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">{item.answer}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-sm text-center">
            <h2 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-white">Scan QR Code</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-xs sm:text-sm">Buka WhatsApp di HP → Linked Devices → Link a Device</p>
            {qrModal.qr && <img src={qrModal.qr} alt="QR Code" className="mx-auto mb-4 rounded-xl max-w-full" />}
            <button onClick={() => setQrModal({ show: false, qr: '' })} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm">Tutup</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
