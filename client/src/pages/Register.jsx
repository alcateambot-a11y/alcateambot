import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Zap, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import ThemeToggle from '../components/ThemeToggle'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreed) return toast.error('Anda harus menyetujui syarat dan ketentuan')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Registrasi berhasil!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registrasi gagal')
    }
    setLoading(false)
  }

  const handleGoogleRegister = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    window.location.href = `${apiUrl}/auth/google`
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 to-violet-700 p-12 items-center justify-center">
        <div className="max-w-md text-white">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <Zap className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Mulai Kirim Pesan WhatsApp Otomatis</h2>
          <p className="text-purple-100 text-lg mb-8">Daftar gratis dan dapatkan 100 pesan setiap bulan.</p>
          
          <div className="bg-white/10 rounded-2xl p-5">
            <h3 className="font-semibold mb-4 text-sm">Yang Anda dapatkan:</h3>
            <div className="space-y-2.5">
              {['100 pesan gratis/bulan', '1 device WhatsApp', 'REST API lengkap', 'Webhook notifikasi', 'Dashboard monitoring'].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-purple-100 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col">
        {/* Header with Logo and Theme Toggle */}
        <div className="flex items-center justify-between p-4 md:p-6">
          <Link to="/" className="flex items-center gap-1.5">
            <img src="/logo/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-base dark:text-white">
              Alcateambot<span className="text-purple-600 dark:text-purple-400">.Corp</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-4 pb-8">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white">Buat Akun Baru</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gratis 100 pesan setiap bulan</p>
            </div>

            {/* Google Register */}
            <button 
              onClick={handleGoogleRegister} 
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-all mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Daftar dengan Google
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400">atau</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-white">Nama</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                    placeholder="Nama lengkap" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-white">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                    placeholder="nama@email.com" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 dark:text-white">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                    placeholder="Min. 8 karakter" 
                    minLength={8} 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)} 
                  className="w-4 h-4 mt-0.5 text-purple-600 rounded focus:ring-purple-500 border-gray-300" 
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Saya setuju dengan <a href="#" className="text-purple-600 dark:text-purple-400">Syarat & Ketentuan</a> dan <a href="#" className="text-purple-600 dark:text-purple-400">Kebijakan Privasi</a>
                </span>
              </label>

              <button 
                type="submit" 
                disabled={loading || !agreed} 
                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Memproses...' : 'Buat Akun'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
