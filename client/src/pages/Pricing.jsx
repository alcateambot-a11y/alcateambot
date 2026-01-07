import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Check, MessageCircle, X, Crown, Zap, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'
import DashboardLayout from '../components/DashboardLayout'

const plans = [
  { 
    name: 'Free', 
    desc: 'Untuk mencoba fitur dasar', 
    price: '0', 
    period: '/7 hari', 
    duration: '7 hari trial', 
    features: [
      { text: 'Online saat server aktif', included: true }, 
      { text: '10 Command dasar', included: true }, 
      { text: '1 Owner Bot', included: true }, 
      { text: '100 Pesan/hari', included: true }, 
      { text: 'Masa aktif 7 hari', included: true }, 
      { text: 'Semua fitur premium', included: false }
    ], 
    popular: false, 
    icon: Zap, 
    color: 'gray'
  },
  { 
    name: 'Premium', 
    desc: 'Akses semua fitur', 
    price: '30k', 
    period: '/15 hari', 
    duration: '15 hari', 
    features: [
      { text: 'Online 24 jam', included: true }, 
      { text: 'Semua Command (100+)', included: true }, 
      { text: '10 Owner Bot', included: true }, 
      { text: 'Unlimited Pesan', included: true }, 
      { text: 'Masa aktif 15 hari', included: true }, 
      { text: 'Support via WhatsApp', included: true }
    ], 
    popular: false, 
    icon: Crown, 
    color: 'purple'
  },
  { 
    name: 'Pro', 
    desc: 'Lebih hemat, lebih lama!', 
    price: '50k', 
    period: '/30 hari', 
    duration: '30 hari', 
    features: [
      { text: 'Online 24 jam', included: true }, 
      { text: 'Semua Command (100+)', included: true }, 
      { text: '10 Owner Bot', included: true }, 
      { text: 'Unlimited Pesan', included: true }, 
      { text: 'Masa aktif 30 hari', included: true }, 
      { text: 'Support via WhatsApp', included: true }
    ], 
    popular: true, 
    icon: Sparkles, 
    color: 'amber'
  },
]

function PricingContent({ isDashboard }) {
  const [currentPlan, setCurrentPlan] = useState('free')
  
  useEffect(() => { 
    const user = localStorage.getItem('user')
    if (user) { 
      const userData = JSON.parse(user)
      setCurrentPlan(userData.plan || 'free') 
    } 
  }, [])

  const whatsappNumber = '6281340078956'
  const handleWhatsAppOrder = (planName, price, duration) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const message = encodeURIComponent(`🛒 *ORDER PAKET BOT*\n\n📦 Paket: ${planName}\n💰 Harga: Rp ${price}\n⏱️ Durasi: ${duration}\n\n👤 Nama: ${user.name || 'User'}\n📧 Email: ${user.email || '-'}\n\nSaya ingin order paket ini. Mohon info pembayarannya.`)
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
  }

  return (
    <div className={isDashboard ? '' : 'pt-20 pb-12'}>
      <div className="max-w-5xl mx-auto px-4">
        {!isDashboard && (
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">Pilih Paket</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Mulai gratis, upgrade kapan saja</p>
          </div>
        )}
        
        {/* Plan Cards */}
        <div className="space-y-4">
          {plans.map((plan, i) => {
            const IconComponent = plan.icon
            const isCurrentPlan = plan.name.toLowerCase() === currentPlan
            const colorClasses = {
              gray: 'from-gray-500 to-gray-600',
              purple: 'from-purple-500 to-violet-600',
              amber: 'from-amber-500 to-orange-500'
            }
            
            return (
              <div 
                key={i} 
                className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden ${
                  plan.popular 
                    ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/10' 
                    : 'border border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs text-center py-1.5 font-medium">
                    ⭐ Paling Populer & Hemat
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[plan.color]} flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{plan.desc}</p>
                      </div>
                    </div>
                    {isCurrentPlan && (
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                        Aktif
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-xs text-gray-400">Rp</span>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{plan.period}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {plan.features.map((feature, j) => (
                      <div key={j} className={`flex items-center gap-1.5 text-xs ${feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                        {feature.included 
                          ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> 
                          : <X className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                        }
                        <span className="truncate">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {plan.price === '0' ? (
                    <button disabled className="w-full py-2.5 rounded-xl font-medium text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {isCurrentPlan ? 'Paket Saat Ini' : 'Gratis (Trial)'}
                    </button>
                  ) : isCurrentPlan ? (
                    <button disabled className="w-full py-2.5 rounded-xl font-medium text-sm bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      ✓ Paket Aktif
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleWhatsAppOrder(plan.name, plan.price, plan.duration)} 
                      className={`w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 text-white bg-gradient-to-r ${colorClasses[plan.color]} hover:opacity-90 transition`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Order via WhatsApp
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Comparison Table */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white">Perbandingan</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Fitur</th>
                  <th className="text-center p-3 font-medium text-gray-600 dark:text-gray-400">Free</th>
                  <th className="text-center p-3 font-medium text-purple-600 dark:text-purple-400">Premium</th>
                  <th className="text-center p-3 font-medium text-amber-600 dark:text-amber-400">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                <tr>
                  <td className="p-3 text-gray-700 dark:text-gray-300">Harga</td>
                  <td className="p-3 text-center font-medium text-gray-900 dark:text-white">Gratis</td>
                  <td className="p-3 text-center font-medium text-purple-600 dark:text-purple-400">Rp 30k</td>
                  <td className="p-3 text-center font-medium text-amber-600 dark:text-amber-400">Rp 50k</td>
                </tr>
                <tr className="bg-gray-50/50 dark:bg-gray-700/30">
                  <td className="p-3 text-gray-700 dark:text-gray-300">Durasi</td>
                  <td className="p-3 text-center text-gray-600 dark:text-gray-400">7 hari</td>
                  <td className="p-3 text-center text-gray-600 dark:text-gray-400">15 hari</td>
                  <td className="p-3 text-center font-medium text-green-600 dark:text-green-400">30 hari</td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-700 dark:text-gray-300">Command</td>
                  <td className="p-3 text-center text-gray-600 dark:text-gray-400">10</td>
                  <td className="p-3 text-center text-gray-600 dark:text-gray-400">100+</td>
                  <td className="p-3 text-center text-gray-600 dark:text-gray-400">100+</td>
                </tr>
                <tr className="bg-gray-50/50 dark:bg-gray-700/30">
                  <td className="p-3 text-gray-700 dark:text-gray-300">Pesan/Hari</td>
                  <td className="p-3 text-center text-gray-600 dark:text-gray-400">100</td>
                  <td className="p-3 text-center text-gray-600 dark:text-gray-400">∞</td>
                  <td className="p-3 text-center text-gray-600 dark:text-gray-400">∞</td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-700 dark:text-gray-300">Harga/Hari</td>
                  <td className="p-3 text-center text-gray-400">-</td>
                  <td className="p-3 text-center text-gray-600 dark:text-gray-400">Rp 2k</td>
                  <td className="p-3 text-center font-medium text-green-600 dark:text-green-400">Rp 1.6k 🔥</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 text-center">FAQ</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            {[
              { q: 'Apa bedanya Premium dan Pro?', a: 'Fiturnya sama! Bedanya hanya durasi. Pro lebih hemat per harinya.' },
              { q: 'Bagaimana cara bayar?', a: 'Klik Order via WhatsApp, lalu ikuti instruksi admin. Bisa Transfer/QRIS/E-Wallet.' },
              { q: 'Berapa lama aktivasi?', a: 'Setelah bayar, bot aktif dalam 5-15 menit (jam kerja).' },
              { q: 'Bisa perpanjang sebelum habis?', a: 'Bisa! Sisa waktu akan ditambahkan.' },
            ].map((item, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer">
                  <span className="font-medium text-sm text-gray-900 dark:text-white pr-4">{item.q}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                </summary>
                <p className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm -mt-2">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Pricing() {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  if (isDashboard) {
    return (
      <DashboardLayout>
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Pricing</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pilih paket sesuai kebutuhan</p>
        </div>
        <PricingContent isDashboard={true} />
      </DashboardLayout>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <PricingContent isDashboard={false} />
    </div>
  )
}
