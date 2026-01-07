import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { Users, Bot, Receipt, TrendingUp, DollarSign, Activity, UserPlus, Wifi } from 'lucide-react'
import api from '../../lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    try { const { data } = await api.get('/admin/stats'); setStats(data) }
    catch (err) { console.error('Error loading stats:', err) }
    setLoading(false)
  }

  const formatCurrency = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'violet', change: `+${stats.newUsersThisWeek} minggu ini` },
    { label: 'Total Bots', value: stats.totalBots, icon: Bot, color: 'blue', change: `${stats.connectedBots} connected` },
    { label: 'Active Subscribers', value: stats.activeUsers, icon: TrendingUp, color: 'emerald', change: `${Math.round(stats.activeUsers/stats.totalUsers*100)}% dari total` },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'amber', change: `${stats.pendingInvoices} pending` },
  ] : []

  const getColorClasses = (color) => {
    const colors = {
      violet: 'from-violet-500 to-purple-600 shadow-violet-500/30',
      blue: 'from-blue-500 to-cyan-600 shadow-blue-500/30',
      emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
      amber: 'from-amber-500 to-orange-600 shadow-amber-500/30',
    }
    return colors[color] || colors.violet
  }

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-slate-400">Overview statistik dan aktivitas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(stat.color)} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm">{stat.label}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{stat.change}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Distribution</h3>
          <div className="space-y-4">
            {stats && [
              { label: 'Free', value: stats.freeUsers, color: 'bg-gray-500 dark:bg-slate-500', percent: Math.round(stats.freeUsers/stats.totalUsers*100) },
              { label: 'Premium', value: stats.premiumUsers, color: 'bg-violet-500', percent: Math.round(stats.premiumUsers/stats.totalUsers*100) },
              { label: 'Pro', value: stats.proUsers, color: 'bg-amber-500', percent: Math.round(stats.proUsers/stats.totalUsers*100) },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-slate-300 text-sm">{item.label}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{item.value} ({item.percent}%)</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Wifi className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                <span className="text-gray-500 dark:text-slate-400 text-sm">Connected Bots</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.connectedBots || 0}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <UserPlus className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="text-gray-500 dark:text-slate-400 text-sm">New This Week</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.newUsersThisWeek || 0}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Receipt className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <span className="text-gray-500 dark:text-slate-400 text-sm">Pending Orders</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingInvoices || 0}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                <span className="text-gray-500 dark:text-slate-400 text-sm">Active Rate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats ? Math.round(stats.activeUsers/stats.totalUsers*100) : 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/users" className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition">
            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Manage Users</p>
              <p className="text-gray-500 dark:text-slate-400 text-sm">View & edit users</p>
            </div>
          </a>
          <a href="/admin/invoices" className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Pending Orders</p>
              <p className="text-gray-500 dark:text-slate-400 text-sm">{stats?.pendingInvoices || 0} waiting approval</p>
            </div>
          </a>
          <a href="/admin/bots" className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Bot Status</p>
              <p className="text-gray-500 dark:text-slate-400 text-sm">{stats?.connectedBots || 0} online</p>
            </div>
          </a>
        </div>
      </div>
    </AdminLayout>
  )
}
