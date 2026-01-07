import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { Search, Filter, MoreVertical, Edit, Trash2, Ban, CheckCircle, X, Crown, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editModal, setEditModal] = useState(null)
  const [editData, setEditData] = useState({})
  const [deleteModal, setDeleteModal] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [search, planFilter, statusFilter, page])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.append('search', search)
      if (planFilter !== 'all') params.append('plan', planFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const { data } = await api.get(`/admin/users?${params}`)
      setUsers(data.users)
      setTotalPages(data.totalPages)
    } catch (err) {
      toast.error('Gagal memuat users')
    }
    setLoading(false)
  }

  const openEditModal = (user) => {
    setEditData({
      name: user.name,
      email: user.email,
      plan: user.plan || 'free',
      planExpiredAt: user.planExpiredAt ? new Date(user.planExpiredAt).toISOString().split('T')[0] : '',
      role: user.role || 'user',
      quota: user.quota || 100
    })
    setEditModal(user)
  }

  // Auto-set default values when plan changes
  const handlePlanChange = (newPlan) => {
    const planQuotas = { free: 100, basic: 500, premium: 2000, pro: 10000 }
    const planDays = { free: 0, basic: 15, premium: 15, pro: 30 }
    
    const updates = { plan: newPlan, quota: planQuotas[newPlan] || 100 }
    
    // Set expiry date for paid plans
    if (newPlan !== 'free' && !editData.planExpiredAt) {
      const days = planDays[newPlan]
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + days)
      updates.planExpiredAt = expiry.toISOString().split('T')[0]
    } else if (newPlan === 'free') {
      updates.planExpiredAt = ''
    }
    
    setEditData({ ...editData, ...updates })
  }

  // Add days to current expiry date (or from today if no expiry)
  const addDays = (days) => {
    // Start from current expiry date or today
    const baseDate = editData.planExpiredAt 
      ? new Date(editData.planExpiredAt) 
      : new Date()
    
    // If base date is in the past, start from today
    const startDate = baseDate < new Date() ? new Date() : baseDate
    
    // Add days
    const newDate = new Date(startDate)
    newDate.setDate(newDate.getDate() + days)
    
    setEditData({ 
      ...editData, 
      planExpiredAt: newDate.toISOString().split('T')[0] 
    })
  }

  const saveUser = async () => {
    try {
      await api.put(`/admin/users/${editModal.id}`, editData)
      toast.success('User berhasil diupdate')
      setEditModal(null)
      loadUsers()
    } catch (err) {
      toast.error('Gagal update user')
    }
  }

  const deleteUser = async () => {
    try {
      await api.delete(`/admin/users/${deleteModal.id}`)
      toast.success('User berhasil dihapus')
      setDeleteModal(null)
      loadUsers()
    } catch (err) {
      toast.error('Gagal hapus user')
    }
  }

  const toggleBan = async (user) => {
    try {
      if (user.isBanned) {
        await api.post(`/admin/users/${user.id}/unban`)
        toast.success('User di-unban')
      } else {
        await api.post(`/admin/users/${user.id}/ban`, { reason: 'Banned by admin' })
        toast.success('User di-ban')
      }
      loadUsers()
    } catch (err) {
      toast.error('Gagal update status ban')
    }
  }

  const getPlanBadge = (plan) => {
    const styles = {
      free: 'bg-gray-200 dark:bg-slate-500/20 text-gray-700 dark:text-slate-300',
      premium: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300',
      pro: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
      basic: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
    }
    return styles[plan] || styles.free
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-500 dark:text-slate-400">Kelola semua pengguna</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-6 border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
            />
          </div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-colors"
          >
            <option value="all">Semua Plan</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="pro">Pro</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-colors"
          >
            <option value="all">Semua Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
          <button onClick={loadUsers} className="p-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition">
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">User</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Plan</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Expired</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Joined</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                            {user.name}
                            {user.role === 'admin' && <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
                          </p>
                          <p className="text-gray-500 dark:text-slate-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlanBadge(user.plan)}`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300 text-sm">
                      {user.planExpiredAt ? new Date(user.planExpiredAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {user.isBanned ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300">Banned</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleBan(user)}
                          className={`p-2 rounded-lg transition ${user.isBanned ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20'}`}
                          title={user.isBanned ? 'Unban' : 'Ban'}
                        >
                          {user.isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => setDeleteModal(user)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit User</h3>
              <button onClick={() => setEditModal(null)} className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Nama</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Plan</label>
                  <select
                    value={editData.plan}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-colors"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Role</label>
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({...editData, role: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-colors"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Plan Expired At</label>
                <input
                  type="date"
                  value={editData.planExpiredAt}
                  onChange={(e) => setEditData({...editData, planExpiredAt: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-colors"
                  disabled={editData.plan === 'free'}
                />
                {editData.plan === 'free' ? (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Plan free tidak memiliki tanggal expired</p>
                ) : (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Tambah masa aktif:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => addDays(15)}
                        className="px-3 py-1.5 text-xs font-medium bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-500/30 transition"
                      >
                        +15 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => addDays(30)}
                        className="px-3 py-1.5 text-xs font-medium bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-500/30 transition"
                      >
                        +30 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => addDays(90)}
                        className="px-3 py-1.5 text-xs font-medium bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-500/30 transition"
                      >
                        +3 Bulan
                      </button>
                      <button
                        type="button"
                        onClick={() => addDays(365)}
                        className="px-3 py-1.5 text-xs font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-500/30 transition"
                      >
                        +1 Tahun
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Quota</label>
                <input
                  type="number"
                  value={editData.quota}
                  onChange={(e) => setEditData({...editData, quota: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-colors"
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Default: Free=100, Basic=500, Premium=2000, Pro=10000
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
              <button onClick={() => setEditModal(null)} className="flex-1 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                Batal
              </button>
              <button onClick={saveUser} className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hapus User?</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-6">User "{deleteModal.name}" akan dihapus permanen beserta semua data terkait.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                Batal
              </button>
              <button onClick={deleteUser} className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
