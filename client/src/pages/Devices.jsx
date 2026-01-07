import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Plus, Smartphone, WifiOff, Trash2, QrCode, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { io } from 'socket.io-client'

export default function Devices() {
  const [devices, setDevices] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [qrModal, setQrModal] = useState({ show: false, qr: '', deviceId: null })

  useEffect(() => {
    loadDevices()
    const socket = io()
    socket.on('connect', () => {
      devices.forEach(d => {
        socket.on(`qr-${d.id}`, (qr) => setQrModal({ show: true, qr, deviceId: d.id }))
        socket.on(`status-${d.id}`, () => loadDevices())
      })
    })
    return () => socket.disconnect()
  }, [])

  const loadDevices = async () => {
    try { const { data } = await api.get('/devices'); setDevices(data) }
    catch (err) { toast.error('Gagal memuat devices') }
  }

  const addDevice = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/devices', { name })
      toast.success('Device ditambahkan!')
      setShowAdd(false)
      setName('')
      loadDevices()
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal menambah device') }
    setLoading(false)
  }

  const connectDevice = async (id) => {
    try {
      await api.post(`/devices/${id}/connect`)
      toast.success('Menghubungkan... Tunggu QR code')
      const socket = io()
      socket.on(`qr-${id}`, (qr) => setQrModal({ show: true, qr, deviceId: id }))
      socket.on(`status-${id}`, (status) => {
        if (status === 'connected') {
          setQrModal({ show: false, qr: '', deviceId: null })
          toast.success('Device terhubung!')
          loadDevices()
        }
      })
    } catch (err) { toast.error(err.response?.data?.error || 'Gagal menghubungkan') }
  }

  const disconnectDevice = async (id) => {
    try { await api.post(`/devices/${id}/disconnect`); toast.success('Device disconnected'); loadDevices() }
    catch (err) { toast.error('Gagal disconnect') }
  }

  const deleteDevice = async (id) => {
    if (!confirm('Hapus device ini?')) return
    try { await api.delete(`/devices/${id}`); toast.success('Device dihapus'); loadDevices() }
    catch (err) { toast.error('Gagal menghapus') }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Devices</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kelola nomor WhatsApp Anda</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition text-sm">
          <Plus className="w-4 h-4" /> Tambah Device
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {devices.map((device) => (
          <div key={device.id} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${device.status === 'connected' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <Smartphone className={`w-5 h-5 sm:w-6 sm:h-6 ${device.status === 'connected' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">{device.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{device.phone || 'Belum terhubung'}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                device.status === 'connected' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                device.status === 'connecting' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>{device.status}</span>
            </div>

            <div className="flex gap-2">
              {device.status === 'connected' ? (
                <button onClick={() => disconnectDevice(device.id)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm">
                  <WifiOff className="w-4 h-4" /> Disconnect
                </button>
              ) : (
                <button onClick={() => connectDevice(device.id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition text-sm">
                  <QrCode className="w-4 h-4" /> Connect
                </button>
              )}
              <button onClick={() => deleteDevice(device.id)} className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {devices.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada device. Tambahkan device pertama Anda!</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Tambah Device</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"><X /></button>
            </div>
            <form onSubmit={addDevice}>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama device (contoh: HP Utama)" className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-50">
                {loading ? 'Loading...' : 'Tambah Device'}
              </button>
            </form>
          </div>
        </div>
      )}

      {qrModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Scan QR Code</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Buka WhatsApp di HP Anda, pilih Linked Devices, lalu scan QR code ini</p>
            {qrModal.qr && <img src={qrModal.qr} alt="QR Code" className="mx-auto mb-4" />}
            <button onClick={() => setQrModal({ show: false, qr: '', deviceId: null })} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">Tutup</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
