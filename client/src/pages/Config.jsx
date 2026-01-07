import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Save, RefreshCw, Plus, X, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function Config() {
  const [bot, setBot] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [owners, setOwners] = useState([])

  // Check premium from user plan, not bot
  const isPremium = user?.plan === 'premium' || user?.plan === 'pro'

  useEffect(() => { 
    loadBot()
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const { data } = await api.get('/user/profile')
      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
    } catch (err) {
      // Fallback to localStorage
      const u = localStorage.getItem('user')
      if (u) setUser(JSON.parse(u))
    }
  }

  const loadBot = async () => {
    try {
      const { data } = await api.get('/bots/my-bot')
      setBot(data)
      try { const parsedOwners = JSON.parse(data.owners || '[]'); setOwners(parsedOwners.length > 0 ? parsedOwners : [{ name: '', number: '' }]) }
      catch { setOwners([{ name: '', number: '' }]) }
    } catch (err) { console.error('Error loading bot:', err) }
    setLoading(false)
  }

  const saveConfig = async () => {
    if ((bot.prefixType === 'multi' || bot.prefixType === 'single' || !bot.prefixType) && !bot.prefix) { toast.error('Prefix tidak boleh kosong'); return }
    setSaving(true)
    try {
      const validOwners = owners.filter(o => o.name && o.number)
      await api.put(`/bots/${bot.id}`, { botName: bot.botName, packname: bot.packname, authorSticker: bot.authorSticker, footerText: isPremium ? bot.footerText : '', limitPerDay: bot.limitPerDay, balanceDefault: bot.balanceDefault, prefix: bot.prefix, prefixType: bot.prefixType, onlineOnConnect: bot.onlineOnConnect, premiumNotification: bot.premiumNotification, sewaNotificationGroup: bot.sewaNotificationGroup, sewaNotificationOwner: bot.sewaNotificationOwner, joinToUse: bot.joinToUse, owners: JSON.stringify(validOwners) })
      toast.success('Konfigurasi disimpan!')
      await loadBot()
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal menyimpan') }
    setSaving(false)
  }

  const updateBot = (key, value) => setBot(prev => ({ ...prev, [key]: value }))
  const handlePrefixTypeChange = (type) => {
    let newPrefix = bot?.prefix || ''
    if (type === 'multi') { if (!newPrefix || newPrefix.length <= 1) newPrefix = '!#$%/.' }
    else if (type === 'single') { if (!newPrefix || newPrefix.length > 1) newPrefix = '!' }
    else if (type === 'empty') newPrefix = ''
    setBot(prev => ({ ...prev, prefixType: type, prefix: newPrefix }))
  }
  const addOwner = () => setOwners([...owners, { name: '', number: '' }])
  const removeOwner = (index) => { if (owners.length > 1) setOwners(owners.filter((_, i) => i !== index)) }
  const updateOwner = (index, field, value) => { const newOwners = [...owners]; newOwners[index][field] = value; setOwners(newOwners) }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-purple-600" /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Config</h1>
        <button onClick={saveConfig} disabled={saving} className="flex items-center gap-2 bg-purple-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 text-sm">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Submit
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Nama Bot*</label>
          <input type="text" value={bot?.botName || ''} onChange={(e) => updateBot('botName', e.target.value)} className="w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Bot Paimon" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Packname Sticker*</label>
          <input type="text" value={bot?.packname || ''} onChange={(e) => updateBot('packname', e.target.value)} className="w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="@Alcateambot_" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Authorname Sticker*</label>
          <input type="text" value={bot?.authorSticker || ''} onChange={(e) => updateBot('authorSticker', e.target.value)} className="w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Paimon" />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">FooterText (Only Premium & Pro)* {!isPremium && <Lock className="w-3.5 h-3.5 text-amber-500" />}</label>
          <input type="text" value={isPremium ? (bot?.footerText || '') : ''} onChange={(e) => updateBot('footerText', e.target.value)} disabled={!isPremium} className={`w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${!isPremium ? 'bg-gray-100 dark:bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`} placeholder={isPremium ? "Powered by Bot" : "Upgrade ke Premium/Pro"} />
          {!isPremium && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">🔒 Fitur ini hanya tersedia untuk plan Premium & Pro</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Limit*</label>
            <input type="number" value={bot?.limitPerDay || 50} onChange={(e) => updateBot('limitPerDay', parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="50" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Balance/limit*</label>
            <input type="number" value={bot?.balanceDefault || 500} onChange={(e) => updateBot('balanceDefault', parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="500" />
          </div>
        </div>

        <div className="space-y-3">
          {owners.map((owner, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-3 items-start">
              <div className="flex-1 w-full">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Owner Name*</label>
                <input type="text" value={owner.name} onChange={(e) => updateOwner(index, 'name', e.target.value)} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" placeholder="Owner Name" />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Owner Number*</label>
                <div className="flex gap-2">
                  <input type="text" value={owner.number} onChange={(e) => updateOwner(index, 'number', e.target.value)} className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" placeholder="62**********" />
                  <button onClick={() => removeOwner(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" disabled={owners.length === 1}><X className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addOwner} className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-purple-500 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition text-sm"><Plus className="w-4 h-4" /> Add Owner</button>
        </div>

        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Prefix*</label>
          <input type="text" value={bot?.prefix || ''} onChange={(e) => updateBot('prefix', e.target.value)} disabled={bot?.prefixType === 'empty'} className={`w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${bot?.prefixType === 'empty' ? 'bg-gray-100 dark:bg-gray-600 text-gray-400' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`} placeholder={bot?.prefixType === 'multi' ? '!#$%/' : '!'} />
        </div>

        <div className="flex flex-wrap gap-4">
          {['multi', 'single', 'empty'].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="prefixType" checked={type === 'single' ? (bot?.prefixType === 'single' || !bot?.prefixType) : bot?.prefixType === type} onChange={() => handlePrefixTypeChange(type)} className="w-4 h-4 text-purple-600" />
              <span className="text-gray-700 dark:text-gray-300">{type === 'multi' ? 'Multi Prefix' : type === 'single' ? 'Single Prefix' : 'Empty Prefix'}</span>
            </label>
          ))}
        </div>

        <div className="space-y-3 pt-2">
          {[{ key: 'onlineOnConnect', label: 'Online On Connect' }, { key: 'premiumNotification', label: 'Premium Notification' }, { key: 'sewaNotificationGroup', label: 'Sewa Notification To Group' }, { key: 'sewaNotificationOwner', label: 'Sewa Notification To Owner' }, { key: 'joinToUse', label: 'Join To Use' }].map((item) => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={bot?.[item.key] || false} onChange={(e) => updateBot(item.key, e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
              <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
            </label>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-right pt-4">* required fields</p>
      </div>
    </DashboardLayout>
  )
}
