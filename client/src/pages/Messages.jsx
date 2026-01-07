import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Send, Image, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function Messages() {
  const [devices, setDevices] = useState([])
  const [messages, setMessages] = useState([])
  const [form, setForm] = useState({ deviceId: '', to: '', content: '', type: 'text' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [d, m] = await Promise.all([api.get('/devices'), api.get('/messages')])
      setDevices(d.data.filter(x => x.status === 'connected'))
      setMessages(m.data)
    } catch (err) {}
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!form.deviceId) return toast.error('Pilih device terlebih dahulu')
    setLoading(true)
    try {
      await api.post('/messages/send', form)
      toast.success('Pesan terkirim!')
      setForm({ ...form, to: '', content: '' })
      loadData()
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal mengirim pesan') }
    setLoading(false)
  }

  return (
    <DashboardLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Kirim Pesan</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Kirim pesan WhatsApp dari dashboard</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border dark:border-gray-700">
          <h2 className="font-semibold mb-4 text-gray-800 dark:text-white text-sm sm:text-base">Kirim Pesan Baru</h2>
          <form onSubmit={sendMessage} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Device</label>
              <select value={form.deviceId} onChange={(e) => setForm({ ...form, deviceId: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" required>
                <option value="">Pilih Device</option>
                {devices.map((d) => (<option key={d.id} value={d.id}>{d.name} ({d.phone})</option>))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nomor Tujuan</label>
              <input type="text" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="628123456789" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" required />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tipe Pesan</label>
              <div className="flex gap-2">
                {[{ type: 'text', icon: Send, label: 'Text' }, { type: 'image', icon: Image, label: 'Image' }, { type: 'document', icon: FileText, label: 'Doc' }].map((t) => (
                  <button key={t.type} type="button" onClick={() => setForm({ ...form, type: t.type })} className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 rounded-lg border dark:border-gray-600 text-xs sm:text-sm ${form.type === t.type ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    <t.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {form.type === 'text' ? 'Pesan' : form.type === 'image' ? 'URL Gambar' : 'URL Dokumen'}
              </label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder={form.type === 'text' ? 'Tulis pesan...' : 'https://example.com/file.jpg'} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border dark:border-gray-600 rounded-xl h-24 sm:h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" required />
            </div>

            <button type="submit" disabled={loading || devices.length === 0} className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2">
              <Send className="w-4 h-4 sm:w-5 sm:h-5" /> {loading ? 'Mengirim...' : 'Kirim Pesan'}
            </button>

            {devices.length === 0 && (
              <p className="text-center text-orange-500 dark:text-orange-400 text-xs sm:text-sm">Tidak ada device yang terhubung. Hubungkan device terlebih dahulu.</p>
            )}
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border dark:border-gray-700">
          <h2 className="font-semibold mb-4 text-gray-800 dark:text-white text-sm sm:text-base">Riwayat Pesan</h2>
          <div className="space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="font-medium text-gray-800 dark:text-white text-sm truncate">{msg.to}</span>
                  <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                    msg.status === 'sent' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                    msg.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                    'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>{msg.status}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">{msg.content}</p>
                <p className="text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs mt-1">{new Date(msg.createdAt).toLocaleString('id-ID')}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6 sm:py-8 text-sm">Belum ada pesan</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
