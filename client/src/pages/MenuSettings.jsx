import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Save, RefreshCw, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function MenuSettings() {
  const [bot, setBot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadBot() }, [])

  const loadBot = async () => {
    try { const { data } = await api.get('/bots/my-bot'); setBot(data) }
    catch (err) { toast.error('Gagal memuat data') }
    setLoading(false)
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      await api.put(`/bots/${bot.id}`, bot)
      localStorage.setItem('bot', JSON.stringify(bot))
      toast.success('Menu disimpan!')
    } catch (err) { toast.error('Gagal menyimpan') }
    setSaving(false)
  }

  const updateBot = (key, value) => setBot(prev => ({ ...prev, [key]: value }))

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-purple-600" /></div></DashboardLayout>

  const previewMenu = (bot?.menuHeader || '')
    .replace('{botName}', bot?.botName || 'Alcateambot')
    .replace('{prefix}', bot?.prefix || '!')
    .replace('@user', '@User')

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Menu</h1>
          <p className="text-gray-500 dark:text-gray-400">Kustomisasi tampilan menu bot</p>
        </div>
        <button onClick={saveConfig} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-50">
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Menu Header</label>
            <textarea value={bot?.menuHeader || ''} onChange={(e) => updateBot('menuHeader', e.target.value)} className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={6} placeholder="╭─「 *{botName}* 」&#10;│ Prefix: {prefix}&#10;│ User: @user&#10;╰────────────" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Variabel: {'{botName}'}, {'{prefix}'}, @user</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Menu Footer</label>
            <textarea value={bot?.menuFooter || ''} onChange={(e) => updateBot('menuFooter', e.target.value)} className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={3} placeholder="╰────「 *{botName}* 」" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Menu Thumbnail URL</label>
            <input type="text" value={bot?.menuThumbnail || ''} onChange={(e) => updateBot('menuThumbnail', e.target.value)} className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="https://example.com/image.jpg" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">URL gambar untuk thumbnail menu (opsional)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Preview</h3>
          <div className="bg-[#0b141a] rounded-xl p-4 text-white font-mono text-sm">
            <div className="bg-[#005c4b] rounded-lg p-3 max-w-[280px]">
              {bot?.menuThumbnail && (
                <div className="mb-2 rounded-lg overflow-hidden bg-gray-700 h-32 flex items-center justify-center">
                  <Image className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <pre className="whitespace-pre-wrap text-[13px] leading-relaxed">
{previewMenu}

╭─「 *Main* 」
│ • menu
│ • help
│ • info
╰────────────

╭─「 *Group* 」
│ • kick
│ • add
│ • tagall
╰────────────

{(bot?.menuFooter || '').replace('{botName}', bot?.botName || 'Alcateambot')}
              </pre>
              <div className="text-right text-[10px] text-gray-300 mt-1">12:00 ✓✓</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
