import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Plus, Webhook, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ url: '', events: ['message.incoming', 'message.status'] })
  const [loading, setLoading] = useState(false)

  const eventOptions = [
    { value: 'message.incoming', label: 'Pesan Masuk' },
    { value: 'message.status', label: 'Status Pesan' },
    { value: 'device.connected', label: 'Device Terhubung' },
    { value: 'device.disconnected', label: 'Device Terputus' },
  ]

  useEffect(() => { loadWebhooks() }, [])

  const loadWebhooks = async () => {
    try { const { data } = await api.get('/webhooks'); setWebhooks(data) } catch (err) {}
  }

  const addWebhook = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/webhooks', form)
      toast.success('Webhook ditambahkan!')
      setShowAdd(false)
      setForm({ url: '', events: ['message.incoming', 'message.status'] })
      loadWebhooks()
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal menambah webhook') }
    setLoading(false)
  }

  const toggleActive = async (id, isActive) => {
    try { await api.put(`/webhooks/${id}`, { isActive: !isActive }); loadWebhooks() }
    catch (err) { toast.error('Gagal mengubah status') }
  }

  const deleteWebhook = async (id) => {
    if (!confirm('Hapus webhook ini?')) return
    try { await api.delete(`/webhooks/${id}`); toast.success('Webhook dihapus'); loadWebhooks() }
    catch (err) { toast.error('Gagal menghapus') }
  }

  const toggleEvent = (event) => {
    setForm(prev => ({
      ...prev,
      events: prev.events.includes(event) ? prev.events.filter(e => e !== event) : [...prev.events, event]
    }))
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Webhooks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Terima notifikasi real-time ke server Anda</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:shadow-lg hover:shadow-purple-500/30 transition">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Tambah Webhook
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {webhooks.map((wh) => (
          <div key={wh.id} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${wh.isActive ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <Webhook className={`w-5 h-5 sm:w-6 sm:h-6 ${wh.isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs sm:text-sm break-all text-gray-800 dark:text-white">{wh.url}</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                    {wh.events?.map((e, i) => (
                      <span key={i} className="text-[10px] sm:text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{e}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-start">
                <button onClick={() => toggleActive(wh.id, wh.isActive)} className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm ${wh.isActive ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  {wh.isActive ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => deleteWebhook(wh.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {webhooks.length === 0 && (
          <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
            <Webhook className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Belum ada webhook. Tambahkan webhook untuk menerima notifikasi.</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Tambah Webhook</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={addWebhook} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">URL Webhook</label>
                <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://yourserver.com/webhook" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" required />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Events</label>
                <div className="space-y-2">
                  {eventOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 p-2.5 sm:p-3 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input type="checkbox" checked={form.events.includes(opt.value)} onChange={() => toggleEvent(opt.value)} className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-50">
                {loading ? 'Loading...' : 'Tambah Webhook'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
