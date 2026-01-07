# Alcateambot.Corp - WhatsApp Bot Platform

Platform WhatsApp Bot lengkap dengan Landing Page, Dashboard, Admin Panel, dan REST API.

## Fitur

- ✅ Multi-device WhatsApp connection
- ✅ REST API untuk kirim pesan (text, image, document)
- ✅ Webhook untuk terima pesan masuk
- ✅ QR Code scan untuk connect device
- ✅ Dashboard admin untuk monitoring
- ✅ Landing page profesional
- ✅ Sistem quota & paket
- ✅ Bot commands (games, downloader, sticker, dll)
- ✅ Admin panel untuk manage users

## Tech Stack

- **Backend**: Node.js, Express, Baileys (WhatsApp Web API)
- **Frontend**: React, Vite, TailwindCSS
- **Database**: SQLite
- **Real-time**: Socket.io

## Instalasi

### 1. Clone & Install Dependencies

```bash
npm install
cd client && npm install
```

### 2. Konfigurasi Environment

Copy `.env.example` ke `.env` dan sesuaikan:

```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-this
```

### 3. Jalankan Server

```bash
# Development
npm run dev

# Frontend (terminal terpisah)
cd client && npm run dev
```

Server berjalan di `http://localhost:3000`
Frontend berjalan di `http://localhost:5173`

## API Endpoints

### Authentication

Semua API request memerlukan header:
```
x-api-key: YOUR_API_KEY
```

### Kirim Pesan Text

```bash
POST /api/send-message
{
  "deviceId": 1,
  "to": "628123456789",
  "message": "Hello World!"
}
```

### Kirim Gambar

```bash
POST /api/send-image
{
  "deviceId": 1,
  "to": "628123456789",
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Caption gambar"
}
```

### Kirim Dokumen

```bash
POST /api/send-document
{
  "deviceId": 1,
  "to": "628123456789",
  "documentUrl": "https://example.com/doc.pdf",
  "filename": "document.pdf",
  "mimetype": "application/pdf"
}
```

### Cek Status Device

```bash
GET /api/device-status/:deviceId
```

### Cek Quota

```bash
GET /api/quota
```

## Production Deployment

### Build Frontend

```bash
cd client && npm run build
```

### Jalankan dengan PM2

```bash
pm2 start server.js --name alcateambot
```

## License

MIT
