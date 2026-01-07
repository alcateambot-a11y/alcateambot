import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { Search, CheckCircle, XCircle, Clock, RefreshCw, Eye, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [detailModal, setDetailModal] = useState(null)

  useEffect(() => {
    loadInvoices()
  }, [statusFilter, page])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const { data } = await api.get(`/admin/invoices?${params}`)
      setInvoices(data.invoices)
      setTotalPages(data.totalPages)
    } catch (err) {
      toast.error('Gagal memuat invoices')
    }
    setLoading(false)
  }

  const approveInvoice = async (id) => {
    try {
      await api.put(`/admin/invoices/${id}/approve`)
      toast.success('Invoice approved! Plan user sudah diupdate.')
      loadInvoices()
      setDetailModal(null)
    } catch (err) {
      toast.error('Gagal approve invoice')
    }
  }

  const rejectInvoice = async (id) => {
    try {
      await api.put(`/admin/invoices/${id}/reject`)
      toast.success('Invoice ditolak')
      loadInvoices()
      setDetailModal(null)
    } catch (err) {
      toast.error('Gagal reject invoice')
    }
  }

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300', icon: Clock },
      paid: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', icon: CheckCircle },
      failed: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-300', icon: XCircle },
      expired: { bg: 'bg-gray-200 dark:bg-slate-500/20', text: 'text-gray-700 dark:text-slate-300', icon: Clock },
    }
    return styles[status] || styles.pending
  }

  // Stats
  const pendingCount = invoices.filter(i => i.status === 'pending').length
  const paidTotal = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-gray-500 dark:text-slate-400">Kelola pembayaran dan order</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-amber-100 dark:bg-amber-500/20 px-4 py-2 rounded-xl">
            <span className="text-amber-700 dark:text-amber-300 font-medium">{pendingCount} Pending</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-6 border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2">
            {['all', 'pending', 'paid', 'failed'].map((status) => (
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
          <button onClick={loadInvoices} className="p-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition ml-auto">
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
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-slate-400">
            <DollarSign className="w-12 h-12 mb-4 opacity-50" />
            <p>Tidak ada invoice</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Invoice ID</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">User</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Plan</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Date</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {invoices.map((invoice) => {
                  const statusStyle = getStatusBadge(invoice.status)
                  const StatusIcon = statusStyle.icon
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4">
                        <span className="text-gray-900 dark:text-white font-mono text-sm">{invoice.invoiceId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">{invoice.User?.name || '-'}</p>
                          <p className="text-gray-500 dark:text-slate-400 text-sm">{invoice.User?.email || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{invoice.plan}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{formatCurrency(invoice.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400 text-sm">
                        {new Date(invoice.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => approveInvoice(invoice.id)}
                                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg transition"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => rejectInvoice(invoice.id)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => setDetailModal(invoice)}
                            className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                            title="Detail"
                          >
                            <Eye className="w-4 h-4" />
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

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg border border-gray-200 dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Detail</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Invoice ID</p>
                  <p className="text-gray-900 dark:text-white font-mono">{detailModal.invoiceId}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(detailModal.status).bg} ${getStatusBadge(detailModal.status).text}`}>
                    {detailModal.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">User</p>
                  <p className="text-gray-900 dark:text-white">{detailModal.User?.name}</p>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">{detailModal.User?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Amount</p>
                  <p className="text-gray-900 dark:text-white text-xl font-bold">{formatCurrency(detailModal.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Plan</p>
                  <p className="text-gray-900 dark:text-white">{detailModal.plan}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Created</p>
                  <p className="text-gray-900 dark:text-white">{new Date(detailModal.createdAt).toLocaleString('id-ID')}</p>
                </div>
                {detailModal.paidAt && (
                  <div>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">Paid At</p>
                    <p className="text-gray-900 dark:text-white">{new Date(detailModal.paidAt).toLocaleString('id-ID')}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
              <button onClick={() => setDetailModal(null)} className="flex-1 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                Tutup
              </button>
              {detailModal.status === 'pending' && (
                <>
                  <button onClick={() => rejectInvoice(detailModal.id)} className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition">
                    Reject
                  </button>
                  <button onClick={() => approveInvoice(detailModal.id)} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition">
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
