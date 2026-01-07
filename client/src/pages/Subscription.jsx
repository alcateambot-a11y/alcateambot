import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Check, Crown, Zap, Sparkles, MessageCircle, Clock, Shield } from 'lucide-react'
import api from '../lib/api'

const plans = [
  { name: 'Free', price: '0', priceNum: 0, duration: '7 hari', icon: Zap, features: ['Online saat server aktif', '10 Command dasar', '1 Owner Bot', '100 Pesan/hari', 'Masa aktif 7 hari'], color: 'gray' },
  { name: 'Premium', price: '30K', priceNum: 30000, duration: '15 hari', icon: Crown, features: ['Online 24 jam', 'Semua Command (100+)', '10 Owner Bot', 'Unlimited Pesan', 'Anti-link, Anti-spam', 'Custom welcome/left', 'Support WhatsApp'], color: 'purple', popular: true },
  { name: 'Pro', price: '50K', priceNum: 50000, duration: '30 hari', icon: Sparkles, features: ['Online 24 jam', 'Semua Command (100+)', '10 Owner Bot', 'Unlimited Pesan', 'Anti-link, Anti-spam', 'Custom welcome/left', 'Support WhatsApp', 'Lebih hemat!'], color: 'amber' },
]

const whatsappNumber = '6281340078956'

export default function Subscription() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadUser() }, [])
  
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
    setLoading(false) 
  }

  const handleWhatsAppOrder = (planName, price, duration) => {
    const message = encodeURIComponent(`🛒 *ORDER PAKET BOT*\n\n📦 Paket: ${planName}\n💰 Harga: Rp ${price}\n⏱️ Durasi: ${duration}\n\n👤 Nama: ${user?.name || 'User'}\n📧 Email: ${user?.email || '-'}\n\nSaya ingin order paket ini. Mohon info pembayarannya.`)
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
  }

  const currentPlan = user?.plan || 'free'
  const expiredAt = user?.planExpiredAt ? new Date(user.planExpiredAt) : null
  const isExpired = expiredAt && expiredAt < new Date()
  const daysLeft = expiredAt ? Math.ceil((expiredAt - new Date()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <DashboardLayout>
      <div className="mb-8"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Langganan</h1><p className="text-gray-500 dark:text-gray-400">Kelola subscription bot kamu</p></div>

      <div className={`rounded-2xl p-6 mb-8 ${currentPlan === 'free' ? 'bg-gray-100 dark:bg-gray-800' : isExpired ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800' : 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className={`text-sm ${currentPlan === 'free' || isExpired ? 'text-gray-500 dark:text-gray-400' : 'text-purple-100'}`}>Paket Saat Ini</p>
            <h2 className={`text-2xl font-bold ${isExpired ? 'text-red-600 dark:text-red-400' : currentPlan === 'free' ? 'text-gray-800 dark:text-white' : ''}`}>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}{isExpired && ' (Expired)'}</h2>
            {expiredAt && !isExpired && <p className={`text-sm mt-1 flex items-center gap-1 ${currentPlan === 'free' ? 'text-gray-500 dark:text-gray-400' : 'text-purple-100'}`}><Clock className="w-4 h-4" />{daysLeft > 0 ? `${daysLeft} hari tersisa` : 'Berakhir hari ini'}</p>}
          </div>
          {currentPlan === 'free' || isExpired ? (
            <button onClick={() => handleWhatsAppOrder('Premium', '30K', '15 hari')} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"><Crown className="w-5 h-5" />Upgrade Sekarang</button>
          ) : (
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl"><Shield className="w-5 h-5" /><span className="font-medium">Aktif</span></div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan, i) => {
          const isCurrentPlan = plan.name.toLowerCase() === currentPlan
          return (
            <div key={i} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 relative ${plan.popular ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-100 dark:border-gray-700'}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs px-3 py-1 rounded-full">Paling Populer</div>}
              {isCurrentPlan && !isExpired && <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full">Aktif</div>}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.color === 'gray' ? 'bg-gray-100 dark:bg-gray-700' : plan.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                <plan.icon className={`w-6 h-6 ${plan.color === 'gray' ? 'text-gray-600 dark:text-gray-400' : plan.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : 'text-amber-600 dark:text-amber-400'}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              <div className="mt-2 mb-4"><span className="text-3xl font-bold text-gray-900 dark:text-white">Rp {plan.price}</span><span className="text-gray-500 dark:text-gray-400">/{plan.duration}</span></div>
              <ul className="space-y-2 mb-6">{plan.features.map((f, j) => <li key={j} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><Check className={`w-4 h-4 flex-shrink-0 ${plan.color === 'gray' ? 'text-gray-500' : plan.color === 'purple' ? 'text-purple-500' : 'text-amber-500'}`} />{f}</li>)}</ul>
              {plan.priceNum === 0 ? <button disabled className="w-full py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default">Gratis (Trial)</button>
              : isCurrentPlan && !isExpired ? <button disabled className="w-full py-3 rounded-xl font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default">✓ Paket Aktif</button>
              : <button onClick={() => handleWhatsAppOrder(plan.name, plan.price, plan.duration)} className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${plan.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:shadow-lg hover:shadow-purple-500/30' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30'}`}><MessageCircle className="w-4 h-4" />Order via WhatsApp</button>}
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
        <h2 className="font-bold mb-4 text-gray-900 dark:text-white">Cara Pembayaran</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">1. Pilih Paket</h3><p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Klik tombol "Order via WhatsApp" pada paket yang diinginkan</p>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">2. Hubungi Admin</h3><p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Kamu akan diarahkan ke WhatsApp admin untuk konfirmasi order</p>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">3. Transfer Pembayaran</h3><p className="text-sm text-gray-500 dark:text-gray-400">Lakukan pembayaran sesuai instruksi dari admin</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Metode Pembayaran</h3>
            <div className="grid grid-cols-2 gap-2">{['Transfer Bank', 'QRIS', 'DANA', 'OVO', 'GoPay', 'ShopeePay'].map((method) => <div key={method} className="border dark:border-gray-600 rounded-lg p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">{method}</div>)}</div>
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl"><p className="text-sm text-green-700 dark:text-green-400 font-medium flex items-center gap-2"><MessageCircle className="w-4 h-4" />Butuh bantuan?</p><a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 dark:text-green-400 hover:underline">Chat Admin: 0813-4007-8956</a></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
