import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Save, RefreshCw, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

const messFields = [
  { key: 'waitMessage', label: 'wait', rows: 3, hint: 'Pesan loading saat bot memproses' },
  { key: 'errorMessage', label: 'error', rows: 5, hint: 'Variabel: {error}', vars: ['error'] },
  { key: 'invLinkMessage', label: 'invLink', rows: 2, hint: 'Pesan ketika link tidak valid' },
  { key: 'onlyGroupMessage', label: 'OnlyGrup', rows: 2, hint: 'Pesan ketika command hanya bisa di grup' },
  { key: 'onlyPMMessage', label: 'OnlyPM', rows: 2, hint: 'Pesan ketika command hanya bisa di private chat' },
  { key: 'groupAdminMessage', label: 'GrupAdmin', rows: 2, hint: 'Pesan ketika command hanya untuk admin grup' },
  { key: 'botAdminMessage', label: 'BotAdmin', rows: 2, hint: 'Pesan ketika bot harus menjadi admin' },
  { key: 'onlyOwnerMessage', label: 'OnlyOwner', rows: 2, hint: 'Pesan ketika command hanya untuk owner' },
  { key: 'onlyPremMessage', label: 'OnlyPrem', rows: 3, hint: 'Variabel: {prefix}', vars: ['prefix'] },
  { key: 'onlySewaMessage', label: 'OnlySewa', rows: 2, hint: 'Pesan ketika command hanya untuk grup sewa' },
  { key: 'limitMessage', label: 'limit', rows: 5, hint: 'Variabel: {prefix}, {limit}', vars: ['prefix', 'limit'] },
  { key: 'cmdLimitMessage', label: 'cmdLimit', rows: 5, hint: 'Variabel: {prefix}', vars: ['prefix'] },
  { key: 'requiredLimitMessage', label: 'requiredLimit', rows: 4, hint: 'Variabel: {limit}, {requiredLimit}', vars: ['limit', 'requiredLimit'] },
  { key: 'callMessage', label: 'call', rows: 4, hint: 'Pesan ketika ada yang call bot' },
  { key: 'antideleteMessage', label: 'antidelete', rows: 4, hint: 'Variabel: {sender}, {type}, {time}', vars: ['sender', 'type', 'time'] },
  { key: 'antiluarMessage', label: 'antiluar', rows: 2, hint: 'Variabel: {sender}', vars: ['sender'] },
  { key: 'promoteTextMessage', label: 'promoteText', rows: 2, hint: 'Variabel: {sender}, {author}', vars: ['sender', 'author'] },
  { key: 'demoteTextMessage', label: 'demoteText', rows: 2, hint: 'Variabel: {sender}, {author}', vars: ['sender', 'author'] },
  { key: 'welcomeTextMessage', label: 'welcomeText', rows: 4, hint: 'Variabel: {user}, {group}', vars: ['user', 'group'] },
  { key: 'leftTextMessage', label: 'leftText', rows: 3, hint: 'Variabel: {user}', vars: ['user'] },
  { key: 'sewaEndMessage', label: 'sewaEnd', rows: 3, hint: 'Pesan ketika sewa grup berakhir' },
  { key: 'sewaNotifMessage', label: 'SewaNotif', rows: 3, hint: 'Variabel: {groupId}, {subject}', vars: ['groupId', 'subject'] },
  { key: 'sewaReminderMessage', label: 'sewaReminder', rows: 3, hint: 'Pesan reminder sewa akan habis' },
  { key: 'joinToUseMessage', label: 'joinToUse', rows: 4, hint: 'Pesan ketika user harus join grup dulu' },
  { key: 'alarmMessage', label: 'alarm', rows: 3, hint: 'Variabel: {text}', vars: ['text'] },
  { key: 'reminderMessage', label: 'reminder', rows: 3, hint: 'Variabel: {text}', vars: ['text'] },
  { key: 'tiktokMessage', label: 'tiktok', rows: 4, hint: 'Variabel: {id}, {username}, {nickname}', vars: ['id', 'username', 'nickname'] },
  { key: 'twitterMessage', label: 'twitter', rows: 4, hint: 'Variabel: {username}, {likes}, {replies}', vars: ['username', 'likes', 'replies'] },
  { key: 'ytmp3Message', label: 'ytmp3', rows: 4, hint: 'Variabel: {title}, {size}, {bitrate}', vars: ['title', 'size', 'bitrate'] },
  { key: 'ytmp4Message', label: 'ytmp4', rows: 4, hint: 'Variabel: {title}, {size}, {quality}', vars: ['title', 'size', 'quality'] },
  { key: 'playMessage', label: 'play', rows: 4, hint: 'Variabel: {authorName}, {authorUrl}, {description}', vars: ['authorName', 'authorUrl', 'description'] },
  { key: 'levelMessage', label: 'level', rows: 2, hint: 'Variabel: {userLevel}, {requiredLevel}', vars: ['userLevel', 'requiredLevel'] },
  { key: 'levelupMessage', label: 'levelup', rows: 4, hint: 'Variabel: {before}, {level}, {tier}, {xp}, {maxXp}', vars: ['before', 'level', 'tier', 'xp', 'maxXp'] },
  { key: 'profileMessage', label: 'profile', rows: 5, hint: 'Variabel: {pushname}, {number}, {status}, {limit}, {balance}', vars: ['pushname', 'number', 'status', 'limit', 'balance'] },
  { key: 'confessMessage', label: 'confess', rows: 4, hint: 'Template contoh pengisian confess' },
  { key: 'countdownMessage', label: 'countdown', rows: 2, hint: 'Variabel: {days}, {hours}, {minutes}, {seconds}', vars: ['days', 'hours', 'minutes', 'seconds'] },
  { key: 'countdownEndMessage', label: 'countdownEnd', rows: 2, hint: 'Pesan ketika countdown selesai' },
  { key: 'cooldownMessage', label: 'cooldown', rows: 2, hint: 'Variabel: {detik}', vars: ['detik'] },
  { key: 'timeoutMessage', label: 'timeout', rows: 2, hint: 'Pesan ketika request timeout' },
  { key: 'ultahMessage', label: 'ultah', rows: 3, hint: 'Variabel: {user}', vars: ['user'] },
  { key: 'upgradePremiumMessage', label: 'upgradepremium', rows: 5, hint: 'Pesan ketika user upgrade ke premium' },
  { key: 'expirePremiumMessage', label: 'expirepremium', rows: 3, hint: 'Pesan ketika premium user expired' },
]

export default function Mess() {
  const [bot, setBot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadBot() }, [])

  const loadBot = async () => {
    try { const { data } = await api.get('/bots/my-bot'); setBot(data) }
    catch (err) { console.error('Error loading bot:', err) }
    setLoading(false)
  }

  const saveMessages = async () => {
    setSaving(true)
    try {
      const updateData = {}
      messFields.forEach(field => { updateData[field.key] = bot[field.key] || '' })
      await api.put(`/bots/${bot.id}`, updateData)
      toast.success('Messages disimpan!')
      await loadBot()
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal menyimpan') }
    setSaving(false)
  }

  const updateBot = (key, value) => setBot(prev => ({ ...prev, [key]: value }))

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-purple-600" /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Mess</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Kustomisasi pesan bot. Gunakan variabel dalam kurung kurawal seperti {'{prefix}'}</p>
        </div>
        <button onClick={saveMessages} disabled={saving} className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 sm:px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-purple-700 transition disabled:opacity-50">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Submit
        </button>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2 text-sm">Variabel yang tersedia:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2 text-xs">
              {['{prefix}', '{user}', '{pushname}', '{group}', '{sender}', '{number}', '{status}', '{limit}', '{balance}', '{detik}', '{author}', '{error}'].map(v => (
                <div key={v}><code className="bg-white dark:bg-gray-800 px-1.5 sm:px-2 py-0.5 rounded text-purple-700 dark:text-purple-400 text-[10px] sm:text-xs">{v}</code></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 sm:p-6 space-y-4 sm:space-y-5">
        {messFields.map((field) => (
          <div key={field.key}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{field.label}*</label>
              {field.vars && <span className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded self-start">{field.vars.map(v => `{${v}}`).join(' ')}</span>}
            </div>
            <textarea value={bot?.[field.key] || ''} onChange={(e) => updateBot(field.key, e.target.value)} rows={Math.max(2, field.rows - 1)} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder={field.hint} />
            {field.hint && !field.vars && <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{field.hint}</p>}
          </div>
        ))}
        <p className="text-[10px] sm:text-xs text-gray-400 text-right pt-4">* required fields</p>
      </div>
    </DashboardLayout>
  )
}
