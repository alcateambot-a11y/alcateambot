import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'

const faqCategories = [
  { name: 'Payment', icon: '💳', questions: [
    { q: 'Saya ingin membeli atau memperpanjang nitro atau plan lainnya', a: 'Kamu bisa membeli atau memperpanjang plan melalui halaman Pricing. Pilih plan yang sesuai dan lakukan pembayaran.' },
    { q: 'Apakah bisa membayar memakai QRIS?', a: 'Ya, kami menerima pembayaran via QRIS, Transfer Bank, dan E-Wallet (OVO, GoPay, Dana).' },
    { q: 'Bisakah saya membayar memakai pulsa?', a: 'Untuk saat ini kami belum menerima pembayaran via pulsa.' },
    { q: 'Apakah saya akan ditipu?', a: 'Tidak, kami adalah layanan resmi dan terpercaya. Semua transaksi tercatat dan bisa diverifikasi.' },
    { q: 'Saya ingin membeli nitro/plan lainnya dalam waktu 1 tahun, apakah bisa?', a: 'Ya, kamu bisa membeli plan untuk periode 1 tahun dengan diskon khusus. Hubungi admin untuk info lebih lanjut.' },
  ]},
  { name: 'Customize Bot', icon: '🤖', questions: [
    { q: 'Bagaimana cara mengubah prefix bot?', a: 'Buka halaman Config, lalu ubah field Prefix sesuai keinginan kamu.' },
    { q: 'Bagaimana cara mengubah pesan welcome?', a: 'Buka halaman Mess, scroll ke bagian Welcome Message dan edit sesuai keinginan.' },
    { q: 'Apakah bisa menambah command custom?', a: 'Ya, kamu bisa menambah auto-reply custom melalui halaman Filter Command.' },
  ]},
  { name: 'Technical', icon: '⚙️', questions: [
    { q: 'Bot tidak merespon, apa yang harus dilakukan?', a: 'Pastikan bot dalam status Connected. Jika masih tidak merespon, coba disconnect dan connect ulang.' },
    { q: 'QR Code tidak muncul', a: 'Refresh halaman dan coba connect ulang. Pastikan koneksi internet stabil.' },
    { q: 'Bot tiba-tiba disconnect', a: 'Ini bisa terjadi karena WhatsApp logout dari HP. Pastikan tidak logout dari Linked Devices di HP.' },
  ]},
]

export default function FAQ() {
  const [search, setSearch] = useState('')
  const [openItems, setOpenItems] = useState({})
  const [activeCategory, setActiveCategory] = useState('Payment')

  const toggleItem = (key) => setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
  const currentCategory = faqCategories.find(c => c.name === activeCategory)
  const filteredQuestions = currentCategory?.questions.filter(q => q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase())) || []

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8 text-white">
        <h1 className="text-lg sm:text-2xl font-bold mb-2">Let's answer some questions</h1>
        <p className="text-purple-100 text-sm sm:text-base mb-4 sm:mb-6">or choose a category to quickly find the help you need</p>
        <div className="relative max-w-md">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search faq..." className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-white" />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Mobile Category Tabs */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {faqCategories.map((cat) => (
            <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition flex-shrink-0 ${activeCategory === cat.name ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-white'}`}>
              <span>{cat.icon}</span><span className="font-medium">{cat.name}</span>
            </button>
          ))}
        </div>
        
        {/* Desktop Category Sidebar */}
        <div className="hidden lg:block space-y-2">
          {faqCategories.map((cat) => (
            <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${activeCategory === cat.name ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white'}`}>
              <span>{cat.icon}</span><span className="font-medium">{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
            <div className="p-3 sm:p-4 border-b dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base"><span>{currentCategory?.icon}</span> {activeCategory}</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Plan mana yang harus saya pilih?</p>
            </div>
            <div className="divide-y dark:divide-gray-700">
              {filteredQuestions.map((item, index) => (
                <div key={index} className="p-3 sm:p-4">
                  <button onClick={() => toggleItem(`${activeCategory}-${index}`)} className="w-full flex items-center justify-between text-left gap-3">
                    <span className="font-medium text-gray-800 dark:text-white text-sm sm:text-base">{item.q}</span>
                    {openItems[`${activeCategory}-${index}`] ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />}
                  </button>
                  {openItems[`${activeCategory}-${index}`] && <p className="mt-3 text-gray-600 dark:text-gray-400 text-xs sm:text-sm pl-3 sm:pl-4 border-l-2 border-purple-200 dark:border-purple-800">{item.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
