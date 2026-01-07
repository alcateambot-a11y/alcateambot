import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { Bot, Wifi, WifiOff, Trash2, RefreshCw, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

export default function AdminBots() {
  const [bots, setBots] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteModal, setDeleteModal] = useState(null)

  useEffect(() => {
    loadBots()
  }, [statusFilter, page])

  const loadBots = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const { data } = await api.get(`/admin/bots?${params}`)
      setBots(data.bots)
      setTotalPages(data.totalPages)
    } catch (err) {
      toast.error('Gagal memuat bots')
    }
    setLoading(false)
  }

  const deleteBot = async () => {
    try {
      await api.delete(`/admin/bots/${deleteModal.id}`)
      toast.success('Bot berhasil dihapus')
      setDeleteModal(null)
      loadBots()
    } catch (err) {
      toast.error('Gagal hapus bot')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      connected: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', icon: Wifi },
      disconnected: { bg: 'bg-gray-200 dark:bg-slate-500/20', text: 'text-gray-700 dark:text-slate-300', icon: WifiOff },
      connecting: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300', icon: RefreshCw },
    }
    return styles[status] || styles.disconnected
  }

  const connectedCount = bots.filter(b => b.status === 'connected').length

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bots</h1>
          <p className="text-gray-500 dark:text-slate-400">Monitor semua bot yang terdaftar</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 dark:bg-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-300 font-medium">{connectedCount} Online</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-6 border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2">
            {['all', 'connected', 'disconnected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  statusFilter === status 
                    ? 'bg-violet-500 text-white' 
                    : 'bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={loadBots} className="p-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition ml-auto">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : bots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-slate-400">
            <Bot className="w-12 h-12 mb-4 opacity-50" />
            <p>Tidak ada bot</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Bot</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Owner</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Phone</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Plan</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Stats</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {bots.map((bot) => {
                  const statusStyle = getStatusBadge(bot.status)
                  const StatusIcon = statusStyle.icon
                  return (
                    <tr key={bot.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">{bot.botName || bot.name}</p>
                            <p className="text-gray-500 dark:text-slate-400 text-sm">ID: {bot.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900 dark:text-white">{bot.User?.name || '-'}</p>
                          <p className="text-gray-500 dark:text-slate-400 text-sm">{bot.User?.email || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-slate-300 font-mono text-sm">
                        {bot.phone || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          <StatusIcon className={`w-3.5 h-3.5 ${bot.status === 'connecting' ? 'animate-spin' : ''}`} />
                          {bot.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          bot.plan === 'pro' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' :
                          bot.plan === 'premium' ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300' :
                          'bg-gray-200 dark:bg-slate-500/20 text-gray-700 dark:text-slate-300'
                        }`}>
                          {bot.plan || 'free'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400 text-sm">
                        <div>
                          <p>{bot.totalMessages || 0} messages</p>
                          <p>{bot.totalCommands || 0} commands</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setDeleteModal(bot)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-gray-500 dark:text-slate-400 text-sm">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hapus Bot?</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-6">Bot "{deleteModal.botName || deleteModal.name}" akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                Batal
              </button>
              <button onClick={deleteBot} className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
