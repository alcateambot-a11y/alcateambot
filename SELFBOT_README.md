# 🤖 Selfbot Feature - User Guide

## Apa itu Selfbot?

Selfbot adalah fitur yang memungkinkan kamu menggunakan **akun WhatsApp pribadi** sebagai bot dengan command terbatas. Berbeda dengan bot biasa yang menggunakan nomor terpisah, selfbot berjalan di akun WhatsApp kamu sendiri!

## ✨ Keunggulan Selfbot

- ✅ Tidak perlu nomor WhatsApp tambahan
- ✅ Pakai akun WhatsApp pribadi kamu
- ✅ Setup cepat dengan pairing code (tanpa scan QR)
- ✅ Command aman (hanya downloader, tools, search, fun)
- ✅ Auto-reconnect jika disconnect
- ✅ Gratis!

## 🚀 Cara Menggunakan

### Step 1: Buat Selfbot

Chat ke bot kamu dan ketik:
```
.sb 628123456789
```
*(Ganti dengan nomor HP kamu, pakai kode negara)*

Bot akan reply dengan **Pairing Code** (8 digit angka).

### Step 2: Link WhatsApp

1. Buka **WhatsApp** di HP kamu
2. Masuk ke **Settings** → **Linked Devices**
3. Tap **"Link a Device"**
4. Tap **"Link with phone number instead"**
5. Masukkan **Pairing Code** yang dikirim bot
6. Tunggu sampai connected

### Step 3: Gunakan Command!

Setelah connected, kamu bisa langsung pakai command:
```
.play dewa 19
.tiktok https://vt.tiktok.com/xxx
.sticker (kirim gambar)
.google cara masak nasi
```

## 📋 Command yang Tersedia

### 📥 Downloader (12 commands)
```
.play <judul>      - Download lagu dari YouTube
.tiktok <url>      - Download video TikTok
.instagram <url>   - Download post Instagram
.facebook <url>    - Download video Facebook
.twitter <url>     - Download video Twitter
.pinterest <url>   - Download gambar Pinterest
.ytmp3 <url>       - Download audio YouTube
.ytmp4 <url>       - Download video YouTube
```

**Alias:** `.p`, `.tt`, `.ig`, `.fb`, `.tw`, `.pin`

### 🛠️ Tools (7 commands)
```
.sticker           - Buat sticker dari gambar/video
.toimg             - Convert sticker ke gambar
.qr <text>         - Buat QR Code
.tts <text>        - Text to speech
.ssweb <url>       - Screenshot website
```

**Alias:** `.s`, `.ss`

### 🔍 Search (6 commands)
```
.google <query>    - Cari di Google
.wiki <query>      - Cari di Wikipedia
.translate <text>  - Terjemahkan teks
.image <query>     - Cari gambar
```

**Alias:** `.g`, `.tr`, `.img`

### 🎉 Fun (3 commands)
```
.quote             - Quote motivasi random
.meme              - Meme random
.jokes             - Jokes lucu
```

## 🎮 Manage Selfbot

### Cek Status
```
.sb
```
Akan tampil status selfbot kamu (connected/disconnected).

### Reconnect
```
.sb reconnect
```
Gunakan jika selfbot disconnect.

### Delete Selfbot
```
.sb off
atau
.sb delete
```
Hapus selfbot permanent.

## ⚠️ Command yang TIDAK Diizinkan

Untuk keamanan, command berikut **TIDAK** bisa digunakan di selfbot:

❌ Group management (kick, add, promote, demote)
❌ Owner commands (broadcast, ban, eval)
❌ Admin commands
❌ Game commands
❌ AI commands (premium)

## 🔒 Keamanan

### Proteksi Otomatis
- ✅ Hanya command aman yang diizinkan
- ✅ Pesan dari diri sendiri diabaikan (prevent loop)
- ✅ Tidak bisa kick/ban orang
- ✅ Tidak bisa manage group
- ✅ Pairing code expired setelah 5 menit

### Tips Keamanan
1. ❌ Jangan share pairing code ke orang lain
2. ✅ Disconnect saat tidak digunakan
3. ✅ Gunakan prefix yang unik
4. ✅ Monitor penggunaan
5. ✅ Backup data penting

## 🐛 Troubleshooting

### Pairing code tidak muncul?
1. Refresh chat
2. Coba lagi: `.sb <nomor>`
3. Pastikan nomor HP benar (dengan kode negara)

### Selfbot tidak responding?
1. Cek status: `.sb`
2. Pastikan status "connected"
3. Coba reconnect: `.sb reconnect`
4. Restart server jika perlu

### Command tidak work?
1. Pastikan pakai prefix yang benar (default: `.`)
2. Cek apakah command termasuk yang diizinkan
3. Lihat list command di atas
4. Cek server logs untuk error

### Selfbot disconnect sendiri?
1. Normal jika tidak ada aktivitas lama
2. Klik reconnect: `.sb reconnect`
3. Atau restart server (auto-reconnect enabled)

## 📊 Batasan

- 1 user hanya bisa punya 1 selfbot
- Pairing code expired setelah 5 menit
- Hanya 31 command yang diizinkan
- Pesan lebih dari 60 detik diabaikan
- Session tersimpan di server

## 💡 Tips & Tricks

### Gunakan Alias
Banyak command punya alias pendek:
```
.play = .p
.tiktok = .tt
.instagram = .ig
.sticker = .s
.google = .g
```

### Combine dengan Caption
Kirim gambar dengan caption:
```
.sticker
```
Langsung jadi sticker!

### Cepat Download
```
.p dewa 19 - cinta gila
.tt https://vt.tiktok.com/xxx
.ig https://instagram.com/p/xxx
```

## 📞 Support

Jika ada masalah:
1. Baca dokumentasi ini
2. Cek troubleshooting section
3. Run debug script: `node scripts/debugSelfbot.js`
4. Contact admin/owner bot

## 📚 Dokumentasi Lengkap

- **SELFBOT_FEATURE.md** - Dokumentasi teknis lengkap
- **SELFBOT_FIX.md** - Changelog dan fixes
- **SELFBOT_TESTING_SUMMARY.md** - Testing results

## ⚡ Quick Start

```bash
# 1. Buat selfbot
.sb 628123456789

# 2. Link WhatsApp dengan pairing code

# 3. Test command
.play test song

# 4. Enjoy! 🎉
```

## 🎉 Selamat Menggunakan!

Selfbot siap digunakan! Nikmati fitur bot di akun WhatsApp pribadi kamu tanpa perlu nomor tambahan.

**Happy Botting! 🤖**

---

**Version:** 2.0.0
**Last Updated:** January 17, 2026
**Status:** ✅ Fully Working
