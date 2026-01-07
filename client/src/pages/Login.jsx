import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Login berhasil!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login gagal')
    }
    setLoading(false)
  }

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    window.location.href = `${apiUrl}/auth/google`
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
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
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white">Selamat Datang</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            {/* Google Login */}
            <button 
              onClick={handleGoogleLogin} 
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-all mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Lanjutkan dengan Google
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
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium dark:text-white">Password</label>
                  <Link to="/forgot-password" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">Lupa password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                    placeholder="••••••••" 
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

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Memproses...' : 'Masuk'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
              Belum punya akun?{' '}
              <Link to="/register" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                Daftar Gratis
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 to-violet-700 p-12 items-center justify-center">
        <div className="max-w-md text-white">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Platform WhatsApp Gateway Terpercaya</h2>
          <p className="text-purple-100 text-lg mb-8">Kirim pesan WhatsApp otomatis dengan mudah dan aman.</p>
          
          <div className="space-y-3">
            {[
              'Enkripsi end-to-end untuk keamanan',
              'Uptime 99.9% server handal',
              'Support teknis 24/7',
              'Integrasi mudah dengan REST API'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-purple-100 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
