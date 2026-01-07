import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Save, RefreshCw, User, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function Setting() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    try { const { data } = await api.get('/user/profile'); setUser(data); localStorage.setItem('user', JSON.stringify(data)) }
    catch (err) { const u = localStorage.getItem('user'); if (u) setUser(JSON.parse(u)) }
  }

  const updateProfile = async () => {
    setLoading(true)
    try { const { data } = await api.put('/user/profile', { name: user.name }); setUser(data); localStorage.setItem('user', JSON.stringify(data)); toast.success('Profil diperbarui!') }
    catch (err) { toast.error(err.response?.data?.error || 'Gagal memperbarui profil') }
    setLoading(false)
  }

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) { toast.error('Password baru tidak cocok'); return }
    if (passwords.new.length < 6) { toast.error('Password minimal 6 karakter'); return }
    setLoading(true)
    try { await api.put('/user/password', { currentPassword: passwords.current, newPassword: passwords.new }); toast.success('Password berhasil diubah!'); setPasswords({ current: '', new: '', confirm: '' }) }
    catch (err) { toast.error(err.response?.data?.error || 'Gagal mengubah password') }
    setLoading(false)
  }

  return (
    <DashboardLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Setting</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Kelola pengaturan akun kamu</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 sm:p-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base"><User className="w-4 h-4 sm:w-5 sm:h-5" /> Profil</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama</label>
              <input type="text" value={user?.name || ''} onChange={(e) => setUser({ ...user, name: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" value={user?.email || ''} disabled className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email tidak dapat diubah</p>
            </div>
            <button onClick={updateProfile} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white py-2.5 sm:py-3 rounded-xl font-medium text-sm disabled:opacity-50">
              {loading ? <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Save className="w-4 h-4 sm:w-5 sm:h-5" />} Simpan Profil
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 sm:p-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base"><Lock className="w-4 h-4 sm:w-5 sm:h-5" /> Ubah Password</h2>
          <div className="space-y-4">
            <div><label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Saat Ini</label><input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" /></div>
            <div><label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Baru</label><input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" /></div>
            <div><label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Konfirmasi Password Baru</label><input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" /></div>
            <button onClick={changePassword} disabled={loading || !passwords.current || !passwords.new} className="w-full flex items-center justify-center gap-2 border-2 border-purple-500 text-purple-600 dark:text-purple-400 py-2.5 sm:py-3 rounded-xl font-medium text-sm disabled:opacity-50 hover:bg-purple-50 dark:hover:bg-purple-900/20">Ubah Password</button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 sm:p-6 lg:col-span-2">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6 text-sm sm:text-base">Informasi Akun</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"><p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Plan</p><p className="font-semibold text-gray-800 dark:text-white capitalize text-sm sm:text-base">{user?.plan || 'Free'}</p></div>
            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"><p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Member Sejak</p><p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}</p></div>
            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"><p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Status</p><p className="font-semibold text-green-600 dark:text-green-400 text-sm sm:text-base">Aktif</p></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
