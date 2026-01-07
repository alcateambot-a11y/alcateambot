import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MessageCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const userStr = searchParams.get('user')
    const error = searchParams.get('error')

    if (error) {
      toast.error('Login dengan Google gagal')
      navigate('/login')
      return
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr))
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        toast.success('Login berhasil!')
        navigate('/dashboard')
      } catch (err) {
        toast.error('Terjadi kesalahan')
        navigate('/login')
      }
    } else {
      navigate('/login')
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Loader2 className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-spin" />
          <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Memproses login...</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Mohon tunggu sebentar</p>
      </div>
    </div>
  )
}
