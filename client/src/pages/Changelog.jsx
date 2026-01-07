import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'

const changelogs = [
  { date: '24/12/2024', type: 'feat', title: 'setname', desc: 'Menambahkan fitur setname yang berfungsi untuk mengganti nama bot', details: 'Gunakan command !setname <nama baru> untuk mengubah nama bot kamu.' },
  { date: '20/12/2024', type: 'feat', title: 'antibot', desc: 'Fitur antibot untuk mencegah bot lain masuk grup', details: 'Aktifkan fitur ini di halaman Config untuk mencegah bot lain bergabung ke grup.' },
  { date: '19/12/2024', type: 'feat', title: 'deluitahku & createthumbnail', desc: 'Fitur baru untuk membuat thumbnail custom', details: null },
  { date: '19/12/2024', type: 'feat', title: 'type menu thumbnail', desc: 'Menambahkan opsi thumbnail untuk menu', details: null },
  { date: '14/12/2024', type: 'fix', title: 'loli', desc: 'Memperbaiki fitur loli', details: null },
  { date: '16/12/2024', type: 'feat', title: 'affiliate', desc: 'Program affiliate untuk mendapatkan komisi', details: 'Dapatkan komisi 10% dari setiap referral yang berhasil upgrade plan.' },
  { date: '13/12/2024', type: 'feat', title: 'tebakkata, levelling, & ww restart', desc: 'Fitur game baru dan perbaikan sistem levelling', details: null },
  { date: '10/12/2024', type: 'chore', title: 'afk, listgroup, listgroup, etc', desc: 'Perbaikan dan optimasi berbagai fitur', details: null },
  { date: '08/12/2024', type: 'fix', title: 'pindl, tiktokmp3, delsewa, translate, listprem & listban', desc: 'Perbaikan berbagai bug', details: null },
]

export default function Changelog() {
  const [expandedItems, setExpandedItems] = useState({})
  const toggleItem = (index) => setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }))
  const getTypeColor = (type) => ({ feat: 'bg-blue-500', fix: 'bg-green-500', chore: 'bg-yellow-500' }[type] || 'bg-gray-500')

  return (
    <DashboardLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Changelog</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Riwayat update dan perubahan</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
        <div className="divide-y dark:divide-gray-700">
          {changelogs.map((log, index) => (
            <div key={index} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mt-1.5 flex-shrink-0 ${getTypeColor(log.type)}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-medium text-gray-800 dark:text-white text-sm sm:text-base">{log.type}: {log.title}</span>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{log.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-center">
                      <span className="text-xs sm:text-sm text-gray-400">{log.date}</span>
                      {log.details && <button onClick={() => toggleItem(index)} className="px-2 sm:px-3 py-1 border dark:border-gray-600 rounded-lg text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 whitespace-nowrap">More Info</button>}
                    </div>
                  </div>
                  {expandedItems[index] && log.details && <div className="mt-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs sm:text-sm text-gray-600 dark:text-gray-400">{log.details}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
