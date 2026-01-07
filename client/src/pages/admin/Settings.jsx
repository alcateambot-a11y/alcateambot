import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { Save, Shield, Bell, Database, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Alcateambot.Corp',
    siteDescription: 'Platform Bot WhatsApp Terbaik Indonesia',
    adminWhatsApp: '6281340078956',
    maintenanceMode: false,
    registrationEnabled: true,
    maxBotsPerUser: 1,
    defaultPlan: 'free',
    defaultQuota: 100,
  })

  const handleSave = () => {
    // Save to localStorage for now (in production, save to backend)
    localStorage.setItem('adminSettings', JSON.stringify(settings))
    toast.success('Settings berhasil disimpan')
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-slate-400">Konfigurasi sistem</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/30 transition"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-500/20 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">General</h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Pengaturan umum website</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Site Description</label>
              <input
                type="text"
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Admin WhatsApp</label>
              <input
                type="text"
                value={settings.adminWhatsApp}
                onChange={(e) => setSettings({...settings, adminWhatsApp: e.target.value})}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-colors"
                placeholder="628xxxxxxxxxx"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System</h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Pengaturan sistem dan keamanan</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/30 rounded-xl">
              <div>
                <p className="text-gray-900 dark:text-white font-medium">Maintenance Mode</p>
                <p className="text-gray-500 dark:text-slate-400 text-sm">Nonaktifkan akses user sementara</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-slate-600 peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/30 rounded-xl">
              <div>
                <p className="text-gray-900 dark:text-white font-medium">Registration Enabled</p>
                <p className="text-gray-500 dark:text-slate-400 text-sm">Izinkan pendaftaran user baru</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.registrationEnabled}
                  onChange={(e) => setSettings({...settings, registrationEnabled: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-slate-600 peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Default Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Defaults</h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Pengaturan default untuk user baru</p>
            </div>
          </div>
          <div className="p-6 grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Max Bots per User</label>
              <input
                type="number"
                value={settings.maxBotsPerUser}
                onChange={(e) => setSettings({...settings, maxBotsPerUser: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Default Plan</label>
              <select
                value={settings.defaultPlan}
                onChange={(e) => setSettings({...settings, defaultPlan: e.target.value})}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-colors"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Default Quota</label>
              <input
                type="number"
                value={settings.defaultQuota}
                onChange={(e) => setSettings({...settings, defaultQuota: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 transition-colors">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <p className="text-gray-900 dark:text-white font-medium">Clear Cache</p>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Hapus cache sistem</p>
            </button>
            <button className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <p className="text-gray-900 dark:text-white font-medium">Backup Database</p>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Download backup DB</p>
            </button>
            <button className="p-4 bg-red-50 dark:bg-red-500/20 rounded-xl text-left hover:bg-red-100 dark:hover:bg-red-500/30 transition">
              <p className="text-red-700 dark:text-red-300 font-medium">Reset All Bots</p>
              <p className="text-red-500 dark:text-red-400/70 text-sm">Disconnect semua bot</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
