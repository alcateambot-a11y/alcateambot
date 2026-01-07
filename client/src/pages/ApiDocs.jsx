import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const endpoints = [
  {
    method: 'POST',
    path: '/api/send-message',
    desc: 'Kirim pesan teks',
    body: { deviceId: 1, to: '628123456789', message: 'Hello World!' },
    response: { status: true, messageId: 'xxx' }
  },
  {
    method: 'POST',
    path: '/api/send-image',
    desc: 'Kirim gambar',
    body: { deviceId: 1, to: '628123456789', imageUrl: 'https://example.com/image.jpg', caption: 'Caption' },
    response: { status: true, messageId: 'xxx' }
  },
  {
    method: 'POST',
    path: '/api/send-document',
    desc: 'Kirim dokumen',
    body: { deviceId: 1, to: '628123456789', documentUrl: 'https://example.com/doc.pdf', filename: 'document.pdf', mimetype: 'application/pdf' },
    response: { status: true, messageId: 'xxx' }
  },
  {
    method: 'GET',
    path: '/api/device-status/:deviceId',
    desc: 'Cek status device',
    response: { status: true, device: { id: 1, name: 'HP Utama', phone: '628xxx', status: 'connected' } }
  },
  {
    method: 'GET',
    path: '/api/quota',
    desc: 'Cek sisa quota',
    response: { status: true, quota: 1000, used: 50, remaining: 950 }
  },
]

export default function ApiDocs() {
  const [apiKey, setApiKey] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setApiKey(JSON.parse(u).apiKey)
  }, [])

  const copy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    toast.success('Disalin!')
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <DashboardLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">API Documentation</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Dokumentasi lengkap REST API</p>
      </div>

      {/* Auth */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border dark:border-gray-700 mb-4 sm:mb-6">
        <h2 className="font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white text-sm sm:text-base">Authentication</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm">Semua request API harus menyertakan header <code className="bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-gray-800 dark:text-gray-200 text-xs">x-api-key</code></p>
        <div className="bg-gray-900 rounded-xl p-3 sm:p-4 text-xs sm:text-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-xs">Header</span>
            <button onClick={() => copy(`x-api-key: ${apiKey}`, 'header')} className="text-gray-400 hover:text-white">
              {copied === 'header' ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
          <code className="text-purple-400 text-xs sm:text-sm break-all">x-api-key: {apiKey || 'YOUR_API_KEY'}</code>
        </div>
      </div>

      {/* Base URL */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border dark:border-gray-700 mb-4 sm:mb-6">
        <h2 className="font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white text-sm sm:text-base">Base URL</h2>
        <div className="bg-gray-100 dark:bg-gray-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-mono text-xs sm:text-sm flex justify-between items-center gap-2">
          <span className="text-gray-800 dark:text-gray-200 truncate">https://your-domain.com</span>
          <button onClick={() => copy('https://your-domain.com', 'base')} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white flex-shrink-0">
            {copied === 'base' ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-4 sm:space-y-6">
        {endpoints.map((ep, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold ${ep.method === 'GET' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'}`}>
                {ep.method}
              </span>
              <code className="font-mono text-xs sm:text-sm text-gray-800 dark:text-gray-200 break-all">{ep.path}</code>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm">{ep.desc}</p>

            {ep.body && (
              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Request Body</p>
                <div className="bg-gray-900 rounded-xl p-3 sm:p-4 text-xs sm:text-sm relative">
                  <button onClick={() => copy(JSON.stringify(ep.body, null, 2), `body-${i}`)} className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-400 hover:text-white">
                    {copied === `body-${i}` ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                  <pre className="text-purple-400 overflow-x-auto text-[10px] sm:text-xs">{JSON.stringify(ep.body, null, 2)}</pre>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs sm:text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Response</p>
              <div className="bg-gray-900 rounded-xl p-3 sm:p-4 text-xs sm:text-sm">
                <pre className="text-blue-400 overflow-x-auto text-[10px] sm:text-xs">{JSON.stringify(ep.response, null, 2)}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Example */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border dark:border-gray-700 mt-4 sm:mt-6">
        <h2 className="font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white text-sm sm:text-base">Contoh Penggunaan (cURL)</h2>
        <div className="bg-gray-900 rounded-xl p-3 sm:p-4 text-xs sm:text-sm relative">
          <button onClick={() => copy(`curl -X POST https://your-domain.com/api/send-message \\
  -H "x-api-key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"deviceId": 1, "to": "628123456789", "message": "Hello!"}'`, 'curl')} className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-400 hover:text-white">
            {copied === 'curl' ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
          <pre className="text-purple-400 overflow-x-auto whitespace-pre-wrap text-[10px] sm:text-xs">{`curl -X POST https://your-domain.com/api/send-message \\
  -H "x-api-key: ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"deviceId": 1, "to": "628123456789", "message": "Hello!"}'`}</pre>
        </div>
      </div>
    </DashboardLayout>
  )
}
