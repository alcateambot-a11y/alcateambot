import { useEffect, useState, useRef } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { RefreshCw, RotateCcw, Link, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

const defaultHelpMenu = `*Command:* {command}
*Category:* {category}
*Description:* {description}
*Example:* {example}`

const variables = [
  { var: '{pushname}', desc: 'Nama pengguna' }, { var: '{prefix}', desc: 'Prefix Bot' }, { var: '{namebot}', desc: 'Nama Bot' },
  { var: '{ucapan}', desc: 'Ucapan (Pagi/Siang/Sore/Malam)' }, { var: '{tanggal}', desc: 'Tanggal' }, { var: '{hari}', desc: 'Hari' },
  { var: '{wib}', desc: 'Jam WIB' }, { var: '{sender}', desc: 'Nomor Pengirim' }, { var: '{limit}', desc: 'Limit' },
  { var: '{balance}', desc: 'Balance' }, { var: '{status}', desc: 'Status (Owner|Premium|Free)' },
  { var: '{footer}', desc: 'FooterText (Premium) / Nama Bot (Free)' },
]

export default function Menu() {
  const [bot, setBot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [defaultMenu, setDefaultMenu] = useState('')
  const [menuText, setMenuText] = useState('')
  const [helpMenu, setHelpMenu] = useState(defaultHelpMenu)
  const [menuType, setMenuType] = useState('thumbnail')
  const [menuTitle, setMenuTitle] = useState('')
  const [menuBody, setMenuBody] = useState('')
  const [menuImagePath, setMenuImagePath] = useState('')
  const [menuLarge, setMenuLarge] = useState(true)
  const [showAd, setShowAd] = useState(false)
  const [adUrl, setAdUrl] = useState('')
  const [menuLatitude, setMenuLatitude] = useState('')
  const [menuLongitude, setMenuLongitude] = useState('')
  const [mapsLink, setMapsLink] = useState('')
  const [previewImage, setPreviewImage] = useState(null)

  const parseGoogleMapsLink = (link) => {
    try {
      let match = link.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/); if (match) return { lat: match[1], lng: match[2] }
      match = link.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/); if (match) return { lat: match[1], lng: match[2] }
      match = link.match(/\/maps\/place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/); if (match) return { lat: match[1], lng: match[2] }
      match = link.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/); if (match) return { lat: match[1], lng: match[2] }
      return null
    } catch { return null }
  }

  const handleMapsLinkChange = (link) => { setMapsLink(link); const coords = parseGoogleMapsLink(link); if (coords) { setMenuLatitude(coords.lat); setMenuLongitude(coords.lng) } }

  useEffect(() => { loadBot() }, [])

  const loadBot = async () => {
    try {
      // Load default menu from server first
      const { data: menuData } = await api.get('/bots/default-menu')
      setDefaultMenu(menuData.menu)
      
      const { data } = await api.get('/bots/my-bot')
      setBot(data)
      // Use saved menuText or default menu
      setMenuText(data.menuText || menuData.menu)
      if (data.helpMenuText) setHelpMenu(data.helpMenuText)
      if (data.menuType) setMenuType(data.menuType); if (data.menuTitle) setMenuTitle(data.menuTitle)
      if (data.menuBody) setMenuBody(data.menuBody); if (data.menuImagePath) setMenuImagePath(data.menuImagePath)
      if (data.menuLarge !== undefined) setMenuLarge(data.menuLarge); if (data.showAd !== undefined) setShowAd(data.showAd)
      if (data.adUrl) setAdUrl(data.adUrl); if (data.menuLatitude) setMenuLatitude(data.menuLatitude.toString())
      if (data.menuLongitude) setMenuLongitude(data.menuLongitude.toString()); if (data.mapsLink) setMapsLink(data.mapsLink)
    } catch (err) { toast.error('Failed to load bot') }
    setLoading(false)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return }
    if (file.size > 100 * 1024 * 1024) { toast.error('Ukuran file maksimal 100MB'); return }
    const reader = new FileReader(); reader.onload = (e) => setPreviewImage(e.target?.result); reader.readAsDataURL(file)
    setUploading(true)
    try {
      const formData = new FormData(); formData.append('image', file)
      const { data } = await api.post(`/bots/${bot.id}/upload-menu-image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMenuImagePath(data.path); toast.success('Gambar berhasil diupload!')
    } catch (err) { toast.error('Gagal upload gambar'); setPreviewImage(null) }
    setUploading(false)
  }

  const removeImage = () => { setMenuImagePath(''); setPreviewImage(null); if (fileInputRef.current) fileInputRef.current.value = '' }

  const handleSubmit = async () => {
    if (!bot?.id) return toast.error('Bot not loaded')
    setSaving(true)
    try {
      await api.put(`/bots/${bot.id}`, { menuText, helpMenuText: helpMenu, menuType, menuTitle: menuType === 'thumbnail' || menuType === 'location' ? menuTitle : null, menuBody: menuType === 'thumbnail' ? menuBody : null, menuImagePath, menuLarge, showAd: menuType === 'thumbnail' ? showAd : false, adUrl: menuType === 'thumbnail' && showAd ? adUrl : null, menuLatitude: menuType === 'location' && menuLatitude ? parseFloat(menuLatitude) : null, menuLongitude: menuType === 'location' && menuLongitude ? parseFloat(menuLongitude) : null, mapsLink: menuType === 'location' ? mapsLink : null })
      toast.success('Menu saved!')
    } catch (err) { toast.error('Failed to save') }
    setSaving(false)
  }

  const resetMenu = () => { setMenuText(defaultMenu); setHelpMenu(defaultHelpMenu); toast.success('Menu reset to default') }
  const getImageUrl = () => { if (previewImage) return previewImage; if (menuImagePath) return `http://localhost:3000${menuImagePath}`; return null }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-purple-600" /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Menu</h2>
            <textarea value={menuText} onChange={(e) => setMenuText(e.target.value)} className="w-full h-60 sm:h-80 border dark:border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm resize-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Menu template..." />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Help Menu</label>
              <textarea value={helpMenu} onChange={(e) => setHelpMenu(e.target.value)} className="w-full h-24 sm:h-32 border dark:border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm resize-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Help menu template..." />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
              <button onClick={handleSubmit} disabled={saving} className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">{saving && <RefreshCw className="w-4 h-4 animate-spin" />}Submit</button>
              <button onClick={resetMenu} className="px-4 sm:px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 text-sm"><RotateCcw className="w-4 h-4" />Reset</button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Type Menu</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type*</label>
                <select value={menuType} onChange={(e) => setMenuType(e.target.value)} className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="thumbnail">thumbnail</option><option value="text">text</option><option value="image">image</option><option value="location">location</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{menuType === 'text' && 'Menampilkan menu text saja'}{menuType === 'image' && 'Menampilkan gambar dengan caption menu'}{menuType === 'thumbnail' && 'Menampilkan thumbnail dengan iklan'}{menuType === 'location' && 'Menampilkan lokasi + menu text'}</p>
              </div>
              
              {(menuType === 'thumbnail' || menuType === 'location') && (
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{menuType === 'location' ? 'Nama Lokasi' : 'Title'}</label><input type="text" value={menuTitle} onChange={(e) => setMenuTitle(e.target.value)} className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder={menuType === 'location' ? 'Kantor Pusat' : 'PAIMON BOT'} /></div>
              )}
              
              {menuType === 'thumbnail' && (
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body</label><input type="text" value={menuBody} onChange={(e) => setMenuBody(e.target.value)} className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Tap untuk info lebih lanjut" /></div>
              )}
              
              {(menuType === 'thumbnail' || menuType === 'image') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Gambar*</label>
                  {getImageUrl() ? (
                    <div className="relative inline-block"><img src={getImageUrl()} alt="Preview" className="w-48 h-48 object-cover rounded-lg border dark:border-gray-600" /><button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X className="w-4 h-4" /></button></div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"><Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" /><p className="text-gray-600 dark:text-gray-400">Klik untuk upload gambar</p><p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF (Max 100MB)</p></div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {uploading && <div className="flex items-center gap-2 mt-2 text-purple-600"><RefreshCw className="w-4 h-4 animate-spin" /><span className="text-sm">Uploading...</span></div>}
                </div>
              )}
              
              {menuType === 'location' && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link Google Maps*</label><input type="text" value={mapsLink} onChange={(e) => handleMapsLinkChange(e.target.value)} className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="https://www.google.com/maps/place/..." /><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Paste link dari Google Maps, koordinat akan otomatis terdeteksi</p></div>
                  {menuLatitude && menuLongitude && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3"><p className="text-sm text-green-800 dark:text-green-400">✓ Koordinat terdeteksi: <span className="font-mono">{menuLatitude}, {menuLongitude}</span></p></div>}
                </div>
              )}
              
              {menuType === 'thumbnail' && (
                <>
                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-3 cursor-pointer"><div className={`w-12 h-6 rounded-full p-1 transition-colors ${menuLarge ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => setMenuLarge(!menuLarge)}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${menuLarge ? 'translate-x-6' : ''}`} /></div><span className="text-sm text-gray-700 dark:text-gray-300">Large Thumbnail</span></label>
                    <label className="flex items-center gap-3 cursor-pointer"><div className={`w-12 h-6 rounded-full p-1 transition-colors ${showAd ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => setShowAd(!showAd)}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${showAd ? 'translate-x-6' : ''}`} /></div><span className="text-sm text-gray-700 dark:text-gray-300">Show Ad</span></label>
                  </div>
                  {showAd && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400"><Link className="w-4 h-4" /><span className="font-medium text-sm">Pengaturan Iklan</span></div>
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Iklan*</label><input type="text" value={adUrl} onChange={(e) => setAdUrl(e.target.value)} className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="https://www.instagram.com/alcateambot_" /><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ketika user klik thumbnail, akan diarahkan ke URL ini</p></div>
                    </div>
                  )}
                </>
              )}
              
              <button onClick={handleSubmit} disabled={saving} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">Submit</button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 h-fit">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">📝 Variable Reference</h3>
          <div className="space-y-2 text-sm max-h-[600px] overflow-y-auto">
            {variables.map((v, i) => (<div key={i} className="flex gap-2"><span className="text-purple-600 dark:text-purple-400">•</span><span className="text-gray-700 dark:text-gray-300"><code className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-1 rounded font-mono">{v.var}</code> {v.desc}</span></div>))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
