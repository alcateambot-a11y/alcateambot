import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Search, X, ChevronLeft, ChevronRight, RotateCcw, Edit3, Star, Ban, Terminal, Crown, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

function Toggle({ checked, onChange, size = 'md' }) {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' }
  }
  const s = sizes[size]
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative ${s.track} rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <span className={`absolute top-0.5 left-0.5 ${s.thumb} bg-white rounded-full transition-transform ${checked ? s.translate : ''}`} />
    </button>
  )
}

export default function Command() {
  const [commands, setCommands] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [showPremium, setShowPremium] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [editModal, setEditModal] = useState({ show: false, command: null })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadCommands() }, [])

  const loadCommands = async () => {
    try {
      const { data: botData } = await api.get('/bots/my-bot')
      if (!botData || !botData.id) { setLoading(false); return }
      const { data: masterCmds } = await api.get('/bots/commands/list')
      let savedSettings = {}
      try {
        const { data: saved } = await api.get('/bots/' + botData.id + '/commands')
        saved.forEach(c => { savedSettings[c.name] = c })
      } catch (e) {}
      const merged = masterCmds.map((cmd, idx) => ({
        id: idx + 1, name: cmd.name,
        aliases: cmd.aliases || [],
        category: cmd.category || 'general', description: cmd.description || '', example: cmd.example || '',
        limit: savedSettings[cmd.name]?.limit ?? cmd.limit ?? 0,
        level: savedSettings[cmd.name]?.level ?? 0,
        cooldown: savedSettings[cmd.name]?.cooldown ?? cmd.cooldown ?? 5,
        active: savedSettings[cmd.name]?.enabled ?? true,
        groupOnly: savedSettings[cmd.name]?.groupOnly ?? false,
        privateOnly: savedSettings[cmd.name]?.privateOnly ?? false,
        premiumOnly: savedSettings[cmd.name]?.premiumOnly ?? cmd.premiumOnly ?? false,
        ownerOnly: savedSettings[cmd.name]?.ownerOnly ?? false,
        adminOnly: savedSettings[cmd.name]?.adminOnly ?? false,
        sewaOnly: savedSettings[cmd.name]?.sewaOnly ?? false,
      }))
      setCommands(merged)
    } catch (err) { toast.error('Gagal memuat commands') }
    setLoading(false)
  }

  const categories = ['all', ...new Set(commands.map(c => c.category).filter(Boolean))]
  
  // Stats
  const totalCommands = commands.length
  const premiumCommands = commands.filter(c => c.premiumOnly).length
  const activeCommands = commands.filter(c => c.active).length
  const inactiveCommands = commands.filter(c => !c.active).length
  
  const filtered = commands.filter(cmd => {
    const aliasStr = cmd.aliases ? cmd.aliases.join(' ') : ''
    const matchSearch = cmd.name.toLowerCase().includes(search.toLowerCase()) || aliasStr.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'all' || cmd.category === category
    const matchPremium = !showPremium || cmd.premiumOnly
    const matchInactive = !showInactive || !cmd.active
    return matchSearch && matchCategory && matchPremium && matchInactive
  })
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const openEdit = (cmd) => setEditModal({ show: true, command: { ...cmd } })
  const saveCommand = async () => {
    if (!editModal.command) return
    setSaving(true)
    try {
      const { data: botData } = await api.get('/bots/my-bot')
      const cmd = editModal.command
      await api.put('/bots/' + botData.id + '/commands', {
        commands: [{ name: cmd.name, category: cmd.category, description: cmd.description, enabled: cmd.active,
          limit: cmd.limit, level: cmd.level, cooldown: cmd.cooldown, groupOnly: cmd.groupOnly,
          privateOnly: cmd.privateOnly, premiumOnly: cmd.premiumOnly, ownerOnly: cmd.ownerOnly,
          adminOnly: cmd.adminOnly, sewaOnly: cmd.sewaOnly }]
      })
      setCommands(prev => prev.map(c => c.name === cmd.name ? cmd : c))
      toast.success('Command berhasil disimpan')
      setEditModal({ show: false, command: null })
    } catch (err) { toast.error('Gagal menyimpan') }
    setSaving(false)
  }
  const resetCommand = (cmd) => {
    setEditModal({ show: true, command: { ...cmd, active: true, limit: 0, level: 0, cooldown: 5,
      groupOnly: false, privateOnly: false, premiumOnly: false, ownerOnly: false, adminOnly: false, sewaOnly: false } })
  }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Command</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Kelola command bot</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Terminal className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCommands}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Fitur</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{premiumCommands}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Premium</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCommands}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{inactiveCommands}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Cari command..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => { setShowPremium(!showPremium); setPage(1) }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${showPremium ? 'bg-yellow-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
          <Star className="w-3.5 h-3.5" /> Premium
        </button>
        <button onClick={() => { setShowInactive(!showInactive); setPage(1) }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${showInactive ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
          <Ban className="w-3.5 h-3.5" /> Inactive
        </button>
      </div>

      <div className="relative mb-4">
        <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => { setCategory(cat); setPage(1) }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${category === cat ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                {cat === 'all' ? 'Semua' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">NAME</th>
              <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">ALIAS</th>
              <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">STATUS</th>
              <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">CATEGORY</th>
              <th className="text-center p-3 font-medium text-gray-600 dark:text-gray-400">LIMIT</th>
              <th className="text-center p-3 font-medium text-gray-600 dark:text-gray-400">CD</th>
              <th className="text-center p-3 font-medium text-gray-600 dark:text-gray-400">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {paginated.map((cmd) => (
              <tr key={cmd.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="p-3 font-medium text-gray-900 dark:text-white">{cmd.name}</td>
                <td className="p-3">
                  {cmd.aliases && cmd.aliases.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {cmd.aliases.map((alias, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">{alias}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${cmd.active ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{cmd.active ? 'Active' : 'Off'}</span></td>
                <td className="p-3 text-gray-600 dark:text-gray-400">{cmd.category}</td>
                <td className="p-3 text-center text-gray-600 dark:text-gray-400">{cmd.limit}</td>
                <td className="p-3 text-center text-gray-600 dark:text-gray-400">{cmd.cooldown}s</td>
                <td className="p-3"><div className="flex justify-center gap-1">
                  <button onClick={() => resetCommand(cmd)} className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded"><RotateCcw className="w-4 h-4" /></button>
                  <button onClick={() => openEdit(cmd)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><Edit3 className="w-4 h-4" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - Full Width */}
      <div className="lg:hidden space-y-3">
        {paginated.map((cmd) => (
          <div key={cmd.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">{cmd.name}</span>
                  {cmd.premiumOnly && <Star className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" fill="currentColor" />}
                </div>
                <span className={`ml-2 flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${cmd.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {cmd.active ? 'ON' : 'OFF'}
                </span>
              </div>
              {cmd.aliases && cmd.aliases.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-[10px] text-gray-400">Alias:</span>
                  {cmd.aliases.map((alias, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[10px]">{alias}</span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-[10px] capitalize">{cmd.category}</span>
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded text-[10px]">L:{cmd.limit}</span>
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded text-[10px]">CD:{cmd.cooldown}s</span>
              </div>
            </div>
            <div className="p-2 pt-0" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button onClick={() => resetCommand(cmd)} style={{ width: '100%' }} className="py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button onClick={() => openEdit(cmd)} style={{ width: '100%' }} className="py-2.5 bg-blue-600 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5">
                <Edit3 className="w-4 h-4" /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-gray-500">{filtered.length} commands</p>
        <div className="flex items-center gap-2">
          <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
            className="px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">{page}/{totalPages || 1}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {editModal.show && editModal.command && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setEditModal({ show: false, command: null })}>
          <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center pt-3"><div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" /></div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div><h2 className="text-base font-bold text-gray-900 dark:text-white">Edit Command</h2><p className="text-xs text-gray-500">{editModal.command.name}</p></div>
              <button onClick={() => setEditModal({ show: false, command: null })} className="p-2 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[{ key: 'active', label: 'Active' }, { key: 'groupOnly', label: 'Group Only' }, { key: 'privateOnly', label: 'Private Only' }, { key: 'premiumOnly', label: 'Premium' }, { key: 'ownerOnly', label: 'Owner Only' }, { key: 'adminOnly', label: 'Admin Only' }, { key: 'sewaOnly', label: 'Sewa Only' }].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-700 dark:text-gray-300">{label}</span>
                    <Toggle size="sm" checked={editModal.command[key]} onChange={(v) => setEditModal(prev => ({ ...prev, command: { ...prev.command, [key]: v } }))} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="block text-xs text-gray-500 mb-1">Limit</label><input type="number" min="0" value={editModal.command.limit} onChange={(e) => setEditModal(prev => ({ ...prev, command: { ...prev.command, limit: parseInt(e.target.value) || 0 } }))} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-center" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Level</label><input type="number" min="0" value={editModal.command.level} onChange={(e) => setEditModal(prev => ({ ...prev, command: { ...prev.command, level: parseInt(e.target.value) || 0 } }))} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-center" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Cooldown</label><input type="number" min="0" value={editModal.command.cooldown} onChange={(e) => setEditModal(prev => ({ ...prev, command: { ...prev.command, cooldown: parseInt(e.target.value) || 0 } }))} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-center" /></div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={saveCommand} disabled={saving} className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium text-sm disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}