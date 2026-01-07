import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  MessageCircle, Shield, Gamepad2, Trophy, Users, Zap, 
  Check, ArrowRight, Sun, Moon, Sparkles, Star, 
  Play, Menu, X, Clock, Headphones, Mail, Phone, MapPin,
  Instagram, Send, Github, Heart
} from 'lucide-react'

const features = [
  { 
    icon: MessageCircle, 
    title: 'Welcome Message', 
    desc: 'Sambut member baru dengan pesan custom yang menarik',
    color: 'from-green-500 to-emerald-600'
  },
  { 
    icon: Shield, 
    title: 'Anti-Spam Protection', 
    desc: 'Lindungi grup dari spam, link berbahaya & kata kasar',
    color: 'from-blue-500 to-cyan-600'
  },
  { 
    icon: Gamepad2, 
    title: 'Mini Games', 
    desc: '20+ game seru: tebak gambar, quiz, truth or dare',
    color: 'from-orange-500 to-amber-600'
  },
  { 
    icon: Trophy, 
    title: 'Leveling System', 
    desc: 'Sistem XP dan ranking untuk member aktif di grup',
    color: 'from-pink-500 to-rose-600'
  },
  { 
    icon: Users, 
    title: 'Group Management', 
    desc: 'Kelola member, admin, dan pengaturan grup dengan mudah',
    color: 'from-violet-500 to-purple-600'
  },
  { 
    icon: Zap, 
    title: 'Auto Response 24/7', 
    desc: 'Bot selalu aktif dengan response cepat & akurat',
    color: 'from-cyan-500 to-teal-600'
  },
]

const plans = [
  { 
    name: 'Starter', 
    price: 'Gratis', 
    period: '7 hari',
    desc: 'Untuk mencoba fitur dasar',
    features: ['10 Command dasar', '1 Owner bot', 'Welcome message', 'Anti-spam basic'],
    cta: 'Mulai Gratis'
  },
  { 
    name: 'Premium', 
    price: 'Rp 30K', 
    period: '15 hari',
    desc: 'Paling populer',
    features: ['100+ Command', 'Unlimited owner', 'Semua games', 'Leveling system', 'Priority support'],
    popular: true,
    cta: 'Pilih Premium'
  },
  { 
    name: 'Pro', 
    price: 'Rp 50K', 
    period: '30 hari',
    desc: 'Hemat jangka panjang',
    features: ['Semua fitur Premium', 'Custom command', 'API access', 'Dedicated support'],
    cta: 'Pilih Pro'
  },
]

const stats = [
  { value: '10K+', label: 'Users', icon: Users },
  { value: '50K+', label: 'Grup', icon: MessageCircle },
  { value: '99.9%', label: 'Uptime', icon: Clock },
  { value: '24/7', label: 'Support', icon: Headphones },
]

const navLinks = [
  { name: 'Fitur', href: '#features' },
  { name: 'Harga', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Kontak', href: '#contact' },
]

export default function Landing() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme-mode') === 'dark')
  const [mobileMenu, setMobileMenu] = useState(false)
  
  useEffect(() => { 
    localStorage.setItem('theme-mode', dark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className={`min-h-screen overflow-x-hidden ${dark ? 'bg-[#0f0f1a] text-white' : 'bg-white text-gray-900'}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-20 -left-20 w-72 md:w-[500px] h-72 md:h-[500px] rounded-full blur-[100px] md:blur-[150px] ${dark ? 'bg-purple-600/20' : 'bg-purple-500/25'}`} />
        <div className={`absolute top-1/2 -right-20 w-60 md:w-[400px] h-60 md:h-[400px] rounded-full blur-[80px] md:blur-[120px] ${dark ? 'bg-blue-600/10' : 'bg-blue-500/15'}`} />
      </div>

      {/* Navigation - Mobile Optimized */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl ${dark ? 'bg-[#0f0f1a]/95 border-b border-white/5' : 'bg-white/95 border-b border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5">
              <img src="/logo/logo.png" alt="Alcateambot" className="w-8 h-8 md:w-9 md:h-9" />
              <span className="font-bold text-base md:text-lg">
                Alcateambot<span className="text-purple-500">.Corp</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className={`text-sm font-medium transition-colors hover:text-purple-500 ${dark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={() => setDark(!dark)} 
                className={`w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all ${dark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {dark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-gray-600" />}
              </button>
              
              {/* Login Button - Hidden on small mobile */}
              <Link 
                to="/login" 
                className={`hidden sm:flex items-center px-4 py-2 rounded-lg md:rounded-xl text-sm font-medium transition-all border ${dark ? 'border-gray-700 text-gray-300 hover:border-purple-500' : 'border-gray-300 text-gray-700 hover:border-purple-500'}`}
              >
                Masuk
              </Link>
              
              <Link to="/register" className="bg-purple-600 hover:bg-purple-500 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-sm font-semibold transition-all">
                Daftar
              </Link>
              
              <button 
                onClick={() => setMobileMenu(!mobileMenu)}
                className={`lg:hidden w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center ${dark ? 'bg-white/5' : 'bg-gray-100'}`}
              >
                {mobileMenu ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className={`lg:hidden ${dark ? 'bg-[#0f0f1a] border-t border-white/5' : 'bg-white border-t border-gray-200'}`}>
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenu(false)}
                  className={`block py-3 text-base font-medium ${dark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {link.name}
                </a>
              ))}
              <Link to="/login" onClick={() => setMobileMenu(false)} className={`block py-3 text-base font-medium ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                Masuk
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <section className="relative z-10 min-h-screen flex items-center pt-16 md:pt-20">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-purple-500/10 mb-6 md:mb-10">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-xs md:text-sm font-medium text-purple-400">Bot WhatsApp dengan 100+ Fitur Lengkap</span>
            </div>
            
            {/* Headline - Responsive */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Buat Grup WhatsApp
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
                Lebih Seru & Interaktif
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className={`text-sm sm:text-base md:text-lg lg:text-xl mb-8 md:mb-10 px-2 leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
              Bot WhatsApp dengan <span className="text-purple-400 font-semibold">100+ fitur</span> untuk games, 
              leveling, protection, dan management grup.
            </p>
            
            {/* CTA Buttons - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-10 md:mb-16 px-4 sm:px-0">
              <Link 
                to="/register" 
                className="group inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl font-semibold text-sm md:text-base transition-all"
              >
                Mulai Gratis Sekarang
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#features" 
                className={`inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 rounded-xl font-semibold text-sm md:text-base transition-all ${dark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <Play size={18} className="text-purple-500" />
                Lihat Demo
              </a>
            </div>
            
            {/* Stats - 2x2 grid on mobile */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {stats.map((stat, i) => (
                <div key={i} className={`p-4 md:p-6 rounded-xl md:rounded-2xl ${dark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <stat.icon size={20} className="text-purple-500 mx-auto mb-2 md:mb-3 md:w-6 md:h-6" />
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-500 mb-0.5">
                    {stat.value}
                  </div>
                  <div className={`text-xs md:text-sm ${dark ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile Optimized */}
      <section id="features" className={`relative z-10 py-16 md:py-24 ${dark ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 mb-4">
              <Zap size={14} className="text-purple-400" />
              <span className="text-xs md:text-sm font-medium text-purple-400">Fitur Lengkap</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              Semua yang Kamu Butuhkan
            </h2>
            <p className={`text-sm md:text-base max-w-xl mx-auto px-4 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
              Fitur lengkap untuk membuat grup WhatsApp-mu lebih hidup
            </p>
          </div>
          
          {/* Features Grid - 1 col mobile, 2 col tablet, 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className={`group p-5 md:p-6 rounded-xl md:rounded-2xl transition-all duration-300 ${dark ? 'bg-white/5 hover:bg-white/[0.08]' : 'bg-white shadow-md hover:shadow-lg'}`}
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold mb-2">{feature.title}</h3>
                <p className={`text-sm leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Mobile Optimized */}
      <section id="pricing" className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 mb-4">
              <Star size={14} className="text-purple-400" />
              <span className="text-xs md:text-sm font-medium text-purple-400">Harga Terjangkau</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              Pilih Paket yang Sesuai
            </h2>
            <p className={`text-sm md:text-base max-w-xl mx-auto px-4 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
              Mulai gratis, upgrade kapan saja
            </p>
          </div>
          
          {/* Pricing Cards - Stack on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {plans.map((plan, i) => {
              const isPopular = plan.popular
              return (
                <div 
                  key={i} 
                  className={`relative p-5 md:p-6 rounded-2xl transition-all ${
                    isPopular 
                      ? 'bg-gradient-to-br from-purple-600 to-violet-600 text-white md:scale-105' 
                      : dark ? 'bg-white/5' : 'bg-white shadow-md'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                      POPULER
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h3 className="text-lg md:text-xl font-bold mb-1">{plan.name}</h3>
                    <p className={`text-xs md:text-sm ${isPopular ? 'text-purple-200' : dark ? 'text-gray-500' : 'text-gray-500'}`}>{plan.desc}</p>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-3xl md:text-4xl font-bold">{plan.price}</span>
                    <span className={`text-sm ml-1 ${isPopular ? 'text-purple-200' : dark ? 'text-gray-500' : 'text-gray-500'}`}>/ {plan.period}</span>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className={`flex items-center gap-2 text-sm ${isPopular ? 'text-purple-100' : dark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${isPopular ? 'bg-white/20' : 'bg-purple-500/10'}`}>
                          <Check size={10} className={isPopular ? 'text-white' : 'text-purple-500'} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    to="/register" 
                    className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                      isPopular 
                        ? 'bg-white text-purple-600 hover:bg-gray-100' 
                        : 'bg-purple-600 text-white hover:bg-purple-500'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section - Mobile Optimized */}
      <section id="faq" className={`relative z-10 py-16 md:py-24 ${dark ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 mb-4">
              <MessageCircle size={14} className="text-purple-400" />
              <span className="text-xs md:text-sm font-medium text-purple-400">FAQ</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              Pertanyaan Umum
            </h2>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {[
              { q: 'Bagaimana cara menggunakan bot ini?', a: 'Cukup daftar, scan QR code WhatsApp, dan bot langsung aktif. Setup hanya 5 menit!' },
              { q: 'Apakah aman untuk grup saya?', a: 'Ya, 100% aman. Kami tidak menyimpan pesan pribadi dan semua data terenkripsi.' },
              { q: 'Bisa digunakan di berapa grup?', a: 'Starter untuk 1 grup, Premium dan Pro unlimited grup.' },
              { q: 'Bagaimana cara pembayaran?', a: 'Transfer bank, e-wallet (OVO, GoPay, Dana), dan QRIS.' },
            ].map((faq, i) => (
              <div key={i} className={`p-4 md:p-5 rounded-xl ${dark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                <h3 className="text-sm md:text-base font-semibold mb-1.5">{faq.q}</h3>
                <p className={`text-xs md:text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-purple-600 to-violet-600 p-8 md:p-12 text-center">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 mb-6">
                <Sparkles size={14} className="text-yellow-300" />
                <span className="text-xs md:text-sm font-medium text-white">Gratis 7 Hari Trial</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                Siap Membuat Grup-mu Lebih Seru?
              </h2>
              <p className="text-sm md:text-base text-purple-100 mb-8 max-w-lg mx-auto">
                Bergabung dengan 10.000+ pengguna yang sudah merasakan kemudahan mengelola grup
              </p>
              
              <Link 
                to="/register" 
                className="group inline-flex items-center justify-center gap-2 bg-white text-purple-600 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base transition-all"
              >
                Daftar Gratis Sekarang
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Mobile Optimized */}
      <footer id="contact" className={`relative z-10 pt-12 md:pt-16 pb-8 ${dark ? 'bg-[#0a0a12] border-t border-white/5' : 'bg-gray-900 text-white'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Footer Top */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10 md:mb-12">
            {/* Brand - Full width on mobile */}
            <div className="col-span-2 md:col-span-4 lg:col-span-2">
              <div className="flex items-center gap-1.5 mb-3">
                <img src="/logo/logo.png" alt="Alcateambot" className="w-8 h-8" />
                <span className="font-bold text-base text-white">
                  Alcateambot<span className="text-purple-500">.Corp</span>
                </span>
              </div>
              <p className={`text-sm mb-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                Bot WhatsApp terbaik untuk membuat grup-mu lebih seru.
              </p>
              {/* Social Links */}
              <div className="flex gap-2">
                <a href="#" className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${dark ? 'bg-white/5 hover:bg-purple-500' : 'bg-gray-800 hover:bg-purple-500'}`}>
                  <Instagram size={16} />
                </a>
                <a href="#" className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${dark ? 'bg-white/5 hover:bg-purple-500' : 'bg-gray-800 hover:bg-purple-500'}`}>
                  <Send size={16} />
                </a>
                <a href="#" className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${dark ? 'bg-white/5 hover:bg-purple-500' : 'bg-gray-800 hover:bg-purple-500'}`}>
                  <Github size={16} />
                </a>
              </div>
            </div>
            
            {/* Links - Produk */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Produk</h4>
              <ul className="space-y-2">
                {['Fitur', 'Harga', 'Demo', 'API'].map((item) => (
                  <li key={item}>
                    <a href="#" className={`text-sm transition-colors hover:text-purple-400 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Links - Support */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Support</h4>
              <ul className="space-y-2">
                {['FAQ', 'Panduan', 'Kontak', 'Status'].map((item) => (
                  <li key={item}>
                    <a href="#" className={`text-sm transition-colors hover:text-purple-400 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Contact - Hidden on small mobile, shown on md+ */}
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-semibold text-white text-sm mb-3">Kontak</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Mail size={14} className="text-purple-500" />
                  <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>support@alcateambot.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={14} className="text-purple-500" />
                  <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>+62 812-xxxx-xxxx</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={14} className="text-purple-500" />
                  <span className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Indonesia</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className={`pt-6 border-t ${dark ? 'border-white/5' : 'border-gray-800'}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className={`text-xs md:text-sm ${dark ? 'text-gray-600' : 'text-gray-500'}`}>
                © 2024 Alcateambot.Corp
              </p>
              <div className="flex items-center gap-1 text-xs md:text-sm">
                <span className={dark ? 'text-gray-600' : 'text-gray-500'}>Made with</span>
                <Heart size={12} className="text-red-500 fill-red-500" />
                <span className={dark ? 'text-gray-600' : 'text-gray-500'}>in Indonesia</span>
              </div>
              <div className="flex gap-4">
                <a href="#" className={`text-xs md:text-sm transition-colors hover:text-purple-400 ${dark ? 'text-gray-600' : 'text-gray-500'}`}>
                  Privacy
                </a>
                <a href="#" className={`text-xs md:text-sm transition-colors hover:text-purple-400 ${dark ? 'text-gray-600' : 'text-gray-500'}`}>
                  Terms
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
