import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { FileText, Search, RefreshCw } from 'lucide-react'
import api from '../lib/api'

export default function Invoice() {
  const [invoices, setInvoices] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadInvoices() }, [])

  const loadInvoices = async () => {
    try { const { data } = await api.get('/user/invoices'); setInvoices(data) }
    catch (err) { console.error('Error loading invoices:', err) }
    setLoading(false)
  }

  const filteredInvoices = invoices.filter(inv => inv.invoiceId?.toLowerCase().includes(search.toLowerCase()) || inv.plan?.toLowerCase().includes(search.toLowerCase()))
  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-purple-600" /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Invoice</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Riwayat pembayaran dan invoice</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total: {invoices.length} invoices</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full sm:w-auto pl-9 pr-4 py-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
        {filteredInvoices.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <tr>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Invoice ID</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Plan</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Jumlah</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 sm:px-6 py-4"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /><span className="font-medium text-sm text-gray-800 dark:text-white">{invoice.invoiceId}</span></div></td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">{new Date(invoice.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">{invoice.plan}</td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-800 dark:text-white">{formatCurrency(invoice.amount)}</td>
                      <td className="px-4 sm:px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : invoice.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>{invoice.status === 'paid' ? 'Lunas' : invoice.status === 'pending' ? 'Pending' : 'Gagal'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="sm:hidden divide-y dark:divide-gray-700">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-sm text-gray-800 dark:text-white">{invoice.invoiceId}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : invoice.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>{invoice.status === 'paid' ? 'Lunas' : invoice.status === 'pending' ? 'Pending' : 'Gagal'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{new Date(invoice.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="capitalize">{invoice.plan}</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-gray-800 dark:text-white">{formatCurrency(invoice.amount)}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400"><FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" /><p className="text-sm">Belum ada invoice</p><p className="text-xs mt-1">Invoice akan muncul setelah kamu melakukan pembelian</p></div>
        )}
      </div>
    </DashboardLayout>
  )
}
