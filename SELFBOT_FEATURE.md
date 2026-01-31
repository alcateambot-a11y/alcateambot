# Fitur Selfbot - Complete Documentation

## 📱 Apa itu Selfbot?

Selfbot adalah fitur yang memungkinkan user menggunakan akun WhatsApp pribadi mereka sendiri sebagai bot dengan command terbatas. Berbeda dengan bot biasa yang menggunakan nomor terpisah, selfbot berjalan di akun WhatsApp user sendiri.

## ✨ Cara Menggunakan Selfbot

### Via Chat Bot (ONLY WAY) 🚀
**Langsung dari WhatsApp, tidak perlu buka website!**

1. Chat ke bot: `.sb 628123456789` (nomor HP kamu)
2. Bot akan reply dengan **Pairing Code** (8 digit)
3. Buka WhatsApp → Settings → Linked Devices
4. Link a Device → "Link with phone number instead"
5. Masukkan pairing code
6. Done! Selfbot aktif

## 🎮 Command `.sb` / `.selfbot`

### Lihat Help
```
.sb
```
Output: Panduan lengkap cara pakai

### Buat Selfbot
```
.sb 628123456789
```
Output: Pairing code untuk link WhatsApp

### Cek Status
```
.sb
```
Jika sudah punya selfbot, akan tampil status

### Disconnect/Delete
```
.sb off
atau
.sb delete
```
Hapus selfbot

### Reconnect
```
.sb reconnect
```
Reconnect selfbot yang disconnect

## ✨ Fitur Utama

### 1. **Pairing Code Authentication**
- ✅ Tidak perlu scan QR code
- ✅ Cukup masukkan nomor HP dan pairing code
- ✅ Lebih mudah dan cepat

### 2. **Limited Commands**
Hanya command yang aman dan berguna:
- 📥 **Downloader**: TikTok, Instagram, YouTube, Facebook, Twitter, Pinterest
- 🛠️ **Tools**: Sticker, QR Code, TTS, Screenshot
- 🔍 **Search**: Google, Wikipedia, Translate, Image
- 🎉 **Fun**: Quote, Meme, Jokes

### 3. **Personal Bot**
- Bot berjalan di akun sendiri
- Tidak perlu nomor tambahan
- Command hanya untuk user sendiri

## 🚀 Cara Menggunakan

### Step 1: Buka Halaman Selfbot
1. Login ke dashboard
2. Klik menu **"Selfbot"** di sidebar

### Step 2: Create Selfbot
1. Masukkan nomor HP (dengan kode negara)
   - Contoh: `628123456789` (Indonesia)
   - Contoh: `1234567890` (US)
2. Klik **"Create Selfbot"**

### Step 3: Pairing Code
1. Setelah create, akan muncul **Pairing Code** (8 digit)
2. Buka WhatsApp di HP
3. Masuk ke **Settings → Linked Devices**
4. Tap **"Link a Device"**
5. Tap **"Link with phone number instead"**
6. Masukkan pairing code yang ditampilkan
7. Tunggu sampai status berubah jadi **"Connected"**

### Step 4: Gunakan Command
Setelah connected, kamu bisa langsung pakai command di WhatsApp:
```
.play dewa 19
.tiktok https://...
.sticker (kirim gambar)
.google cara masak nasi
```

## 📋 Daftar Command Lengkap

### 📥 Downloader
| Command | Alias | Deskripsi |
|---------|-------|-----------|
| `.play` | `.p` | Download lagu dari YouTube |
| `.tiktok` | `.tt` | Download video TikTok |
| `.instagram` | `.ig` | Download post Instagram |
| `.facebook` | `.fb` | Download video Facebook |
| `.twitter` | `.tw` | Download video Twitter/X |
| `.pinterest` | `.pin` | Download gambar Pinterest |
| `.ytmp3` | - | Download audio YouTube |
| `.ytmp4` | - | Download video YouTube |

### 🛠️ Tools
| Command | Alias | Deskripsi |
|---------|-------|-----------|
| `.sticker` | `.s` | Buat sticker dari gambar/video |
| `.toimg` | - | Convert sticker ke gambar |
| `.qr` | - | Buat QR Code |
| `.tts` | - | Text to speech |
| `.ssweb` | `.ss` | Screenshot website |

### 🔍 Search
| Command | Alias | Deskripsi |
|---------|-------|-----------|
| `.google` | `.g` | Cari di Google |
| `.wiki` | - | Cari di Wikipedia |
| `.translate` | `.tr` | Terjemahkan teks |
| `.image` | `.img` | Cari gambar |

### 🎉 Fun
| Command | Alias | Deskripsi |
|---------|-------|-----------|
| `.quote` | - | Quote motivasi |
| `.meme` | - | Meme random |
| `.jokes` | - | Jokes lucu |

## ⚙️ Manage Selfbot

### Disconnect
Untuk disconnect selfbot sementara:
1. Buka halaman Selfbot
2. Klik **"Disconnect"**
3. Selfbot akan offline tapi data tersimpan

### Reconnect
Untuk reconnect selfbot:
1. Buka halaman Selfbot
2. Klik **"Reconnect"**
3. Tunggu sampai connected

### Delete
Untuk hapus selfbot permanent:
1. Buka halaman Selfbot
2. Klik **"Delete"**
3. Confirm
4. Selfbot dan semua data akan dihapus

## 🔒 Keamanan

### ✅ Aman
- Hanya command terbatas yang diizinkan
- Tidak ada command berbahaya (kick, ban, dll)
- Session tersimpan aman di server
- Pairing code expired setelah 5 menit

### ⚠️ Perhatian
- Jangan share pairing code ke orang lain
- Selfbot hanya untuk personal use
- Jangan spam command
- WhatsApp bisa ban akun jika abuse

## 🛠️ Implementasi Teknis

### Database Schema
```sql
-- Bots table
isSelfbot BOOLEAN DEFAULT 0
selfbotEnabled BOOLEAN DEFAULT 0
```

### Backend Files
1. **models/Bot.js** - Model dengan field selfbot
2. **services/selfbotHandler.js** - Handler khusus selfbot
3. **services/selfbotConnection.js** - Pairing code connection
4. **routes/selfbot.js** - API endpoints
5. **scripts/addSelfbotColumns.js** - Migration script

### Frontend Files
1. **client/src/pages/Selfbot.jsx** - UI halaman selfbot
2. **client/src/App.jsx** - Route registration
3. **client/src/components/DashboardLayout.jsx** - Menu link

### API Endpoints
- `POST /api/selfbot/create` - Create selfbot
- `GET /api/selfbot/my-selfbot` - Get user's selfbot
- `GET /api/selfbot/pairing-code/:botId` - Get pairing code
- `DELETE /api/selfbot/:botId` - Delete selfbot
- `POST /api/selfbot/:botId/disconnect` - Disconnect
- `POST /api/selfbot/:botId/:reconnect` - Reconnect

### Socket Events
- `selfbot-pairing-code-${botId}` - Emit pairing code
- `selfbot-status-${botId}` - Emit status changes
- `selfbot-connected-${botId}` - Emit when connected

## 🐛 Troubleshooting

### Pairing code tidak muncul?
- Refresh halaman
- Coba create ulang
- Cek console log di browser

### Tidak bisa connect?
- Pastikan nomor HP benar (dengan kode negara)
- Pastikan WhatsApp di HP aktif
- Coba disconnect dan reconnect

### Command tidak work?
- Pastikan selfbot status "Connected"
- Pastikan pakai prefix yang benar (default: `.`)
- Cek apakah command termasuk yang diizinkan

### Selfbot disconnect sendiri?
- Normal jika tidak ada aktivitas lama
- Klik "Reconnect" untuk connect ulang
- Atau restart server

## 📊 Limitations

### ❌ Command yang TIDAK Diizinkan
- Group management (kick, add, promote, dll)
- Owner commands (broadcast, ban, dll)
- Admin commands
- Game commands
- AI commands (premium)

### ✅ Command yang Diizinkan
- Downloader (semua)
- Tools (semua)
- Search (semua)
- Fun (semua)

## 🎯 Best Practices

1. **Gunakan untuk personal use saja**
2. **Jangan spam command**
3. **Disconnect saat tidak digunakan**
4. **Jangan share pairing code**
5. **Backup data penting**

## 📝 Notes

- Selfbot menggunakan akun WhatsApp pribadi user
- Satu user hanya bisa punya 1 selfbot
- Pairing code expired setelah 5 menit
- Session tersimpan di folder `sessions/selfbot_{botId}`
- Auto reconnect jika disconnect (max 3 attempts)

## 🚀 Future Improvements

- [ ] Custom prefix per user
- [ ] Command usage statistics
- [ ] Auto-reply filters
- [ ] Schedule messages
- [ ] More command categories

---

**Status:** ✅ Fully Implemented & Working
**Version:** 1.0.0
**Last Updated:** January 17, 2026
