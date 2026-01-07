import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Plus, Trash2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function FilterCommand() {
  const [bot, setBot] = useState(null)
  const [filters, setFilters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [newFilter, setNewFilter] = useState({ trigger: '', response: '', type: 'exact' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const { data } = await api.get('/bots/my-bot')
      setBot(data)
      const { data: filterData } = await api.get(`/bots/${data.id}/filters`)
      setFilters(filterData)
    } catch (err) { console.error('Error loading filters:', err) }
    setLoading(false)
  }

  const addFilter = async () => {
    if (!newFilter.trigger || !newFilter.response) { toast.error('Trigger dan response harus diisi'); return }
    try {
      const { data } = await api.post(`/bots/${bot.id}/filters`, newFilter)
      setFilters([...filters, data])
      setNewFilter({ trigger: '', response: '', type: 'exact' })
      setShowAdd(false)
      toast.success('Filter ditambahkan!')
    } catch (err) { toast.error('Gagal menambahkan filter') }
  }

  const deleteFilter = async (id) => {
    try { await api.delete(`/bots/${bot.id}/filters/${id}`); setFilters(filters.filter(f => f.id !== id)); toast.success('Filter dihapus!') }
    catch (err) { toast.error('Gagal menghapus filter') }
  }

  const filteredFilters = filters.filter(f => f.trigger.toLowerCase().includes(search.toLowerCase()) || f.response.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-purple-600" /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Filter Command</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Buat auto-reply berdasarkan kata kunci</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 sm:px-5 py-2.5 rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-purple-500/30 transition"><Plus className="w-4 h-4 sm:w-5 sm:h-5" /> New</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{filters.length} filters</span>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Search:</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 sm:flex-none border dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
        {filteredFilters.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <tr>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Trigger</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Response</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="text-right px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {filteredFilters.map((filter) => (
                    <tr key={filter.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-800 dark:text-white">{filter.trigger}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{filter.response}</td>
                      <td className="px-4 sm:px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${filter.type === 'exact' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>{filter.type}</span></td>
                      <td className="px-4 sm:px-6 py-4 text-right"><button onClick={() => deleteFilter(filter.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="sm:hidden divide-y dark:divide-gray-700">
              {filteredFilters.map((filter) => (
                <div key={filter.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-gray-800 dark:text-white truncate">{filter.trigger}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{filter.response}</p>
                    </div>
                    <button onClick={() => deleteFilter(filter.id)} className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${filter.type === 'exact' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>{filter.type}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400 text-sm"><p>Belum ada filter. Klik "New" untuk menambahkan.</p></div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-white">Tambah Filter</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trigger</label>
                <input type="text" value={newFilter.trigger} onChange={(e) => setNewFilter({ ...newFilter, trigger: e.target.value })} placeholder="Kata kunci yang akan di-trigger" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Response</label>
                <textarea value={newFilter.response} onChange={(e) => setNewFilter({ ...newFilter, response: e.target.value })} placeholder="Balasan otomatis" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" rows={3} />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <select value={newFilter.type} onChange={(e) => setNewFilter({ ...newFilter, type: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                  <option value="exact">Exact Match</option>
                  <option value="contains">Contains</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 sm:py-3 border dark:border-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Batal</button>
              <button onClick={addFilter} className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition">Tambah</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
