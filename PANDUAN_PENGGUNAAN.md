# 📖 Panduan Lengkap Penggunaan Bot & Dashboard

## ✅ Status Sistem Saat Ini

### Backend (Bot Server)
- ✅ **Running** di port **3000**
- ✅ Bot ID 2 **Connected**
- ✅ Commands loaded: **919 total**
- ✅ Selfbot feature: **Active**
- ✅ Auto-reconnect: **Enabled**

### Frontend (Web Dashboard)
- ✅ **Running** di port **5173**
- ✅ Vite dev server: **Active**
- ✅ Ready time: **287ms**

---

## 🌐 URL Akses

### Dashboard Web
```
http://localhost:5173/
```

### Backend API
```
http://localhost:3000/
```

### Test Endpoint
```
http://localhost:3000/test
```

---

## 🎯 Langkah-Langkah Selanjutnya

### 1. Akses Dashboard Web

**Buka Browser:**
```
http://localhost:5173/
```

**Halaman yang Tersedia:**
- `/` - Landing page
- `/login` - Login page
- `/register` - Register page
- `/dashboard` - Dashboard utama
- `/bots` - Manage bots
- `/devices` - Manage devices
- `/messages` - View messages
- `/webhooks` - Manage webhooks
- `/commands` - Command settings
- `/filters` - Auto-reply filters
- `/menu` - Menu settings
- `/pricing` - Pricing plans
- `/api-docs` - API documentation

### 2. Login ke Dashboard

**Default Admin (jika ada):**
- Cek database untuk user yang sudah terdaftar
- Atau register user baru

**Register User Baru:**
1. Kunjungi: `http://localhost:5173/register`
2. Isi form registrasi
3. Login dengan akun yang dibuat

### 3. Manage Bot dari Dashboard

**Setelah Login:**

1. **Dashboard** - Lihat statistik bot
   - Total messages
   - Total groups
   - Bot status
   - Recent activity

2. **Bots** - Manage bot kamu
   - Create new bot
   - View bot status
   - Connect/disconnect bot
   - Delete bot

3. **Commands** - Atur command settings
   - Enable/disable commands
   - Set premium commands
   - Set sewa commands
   - Custom cooldown

4. **Filters** - Auto-reply
   - Create auto-reply
   - Trigger words
   - Response messages

5. **Menu** - Customize menu
   - Edit menu text
   - Add/remove sections
   - Custom footer

---

## 🤖 Test Bot di WhatsApp

### Command Dasar

**Menu:**
```
.menu
```

**Info Bot:**
```
.info
.owner
.ping
```

**Downloader:**
```
.play dewa 19
.tiktok https://vt.tiktok.com/xxx
.instagram https://instagram.com/p/xxx
.facebook https://fb.com/xxx
```

**Tools:**
```
.sticker (kirim gambar)
.toimg (reply sticker)
.qr https://google.com
.tts halo dunia
```

**Search:**
```
.google cara masak nasi
.wiki indonesia
.translate hello
.image kucing lucu
```

**Fun:**
```
.quote
.meme
.jokes
```

**AI (Premium):**
```
.ai siapa presiden indonesia?
.gemini jelaskan AI
```

**Group Management:**
```
.kick @user
.add 628xxx
.promote @user
.demote @user
.tagall
.hidetag pesan
```

**Group Protection:**
```
.antilink on
.antiwame on
.antibadword on
.antisticker on
.welcome on
.left on
```

---

## 🔧 Fitur Selfbot

### Buat Selfbot

**Chat ke Bot:**
```
.sb 628123456789
```
*(Ganti dengan nomor HP kamu)*

**Bot akan reply dengan Pairing Code:**
```
✅ PAIRING CODE

📱 Nomor: 628123456789
🔑 Code: 12345678

📝 Langkah-langkah:
1. Buka WhatsApp di HP
2. Settings → Linked Devices
3. Link a Device
4. "Link with phone number instead"
5. Masukkan code: 12345678
```

### Link WhatsApp

1. Buka **WhatsApp** di HP
2. **Settings** → **Linked Devices**
3. Tap **"Link a Device"**
4. Tap **"Link with phone number instead"**
5. Masukkan **Pairing Code**
6. Tunggu sampai connected

### Gunakan Selfbot

**Setelah Connected:**
```
.play dewa 19
.tiktok https://...
.sticker (kirim gambar)
.google cara masak nasi
```

**Manage Selfbot:**
```
.sb              # Cek status
.sb reconnect    # Reconnect
.sb off          # Delete
```

---

## 🛠️ Admin Features

### Admin Dashboard

**Akses Admin:**
```
http://localhost:5173/admin
```

**Fitur Admin:**
- View all users
- View all bots
- View all invoices
- System settings
- User management
- Bot management

### Admin Commands

**Owner Commands:**
```
.broadcast pesan    # Broadcast ke semua group
.ban @user          # Ban user
.unban @user        # Unban user
.addprem @user 30   # Add premium 30 hari
.delprem @user      # Remove premium
.addsewa groupid 30 # Add sewa 30 hari
.delsewa groupid    # Remove sewa
```

---

## 📊 Monitoring & Debug

### Lihat Log Backend

**Log akan muncul otomatis di terminal**

**Atau jalankan:**
```bash
# Lihat log real-time
tail -f logs/bot.log
```

### Debug Selfbot

```bash
node scripts/debugSelfbot.js
```

**Output:**
- List semua selfbot
- Status masing-masing
- Session info
- Recommendations
- Troubleshooting tips

### Test Commands

```bash
# Test semua komponen selfbot
node scripts/testSelfbot.js

# Test end-to-end
node scripts/testSelfbotE2E.js

# Test specific features
node scripts/testAllFeatures.js
```

---

## 🔒 Security & Best Practices

### Keamanan Bot

1. **Jangan share credentials**
   - API keys
   - Database credentials
   - Session files

2. **Set owner dengan benar**
   - Edit di dashboard
   - Atau via database

3. **Monitor usage**
   - Check logs regularly
   - Monitor API usage
   - Watch for abuse

### Keamanan Selfbot

1. **Jangan share pairing code**
2. **Disconnect saat tidak digunakan**
3. **Monitor command usage**
4. **Backup session files**

---

## 📱 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

**Authentication:**
```
POST /auth/register
POST /auth/login
GET  /auth/me
```

**Bots:**
```
GET    /bots
POST   /bots
GET    /bots/:id
PUT    /bots/:id
DELETE /bots/:id
POST   /bots/:id/connect
POST   /bots/:id/disconnect
```

**Messages:**
```
POST /api/send-message
POST /api/send-media
GET  /messages
```

**Webhooks:**
```
GET    /webhooks
POST   /webhooks
DELETE /webhooks/:id
```

**Selfbot:**
```
POST   /api/selfbot/create
GET    /api/selfbot/my-selfbot
GET    /api/selfbot/pairing-code/:botId
DELETE /api/selfbot/:botId
POST   /api/selfbot/:botId/disconnect
POST   /api/selfbot/:botId/reconnect
```

---

## 🐛 Troubleshooting

### Bot Tidak Connect

**Solusi:**
1. Cek session folder: `sessions/2`
2. Delete session dan scan QR ulang
3. Restart server
4. Check logs untuk error

### Dashboard Tidak Bisa Diakses

**Solusi:**
1. Pastikan frontend running: `http://localhost:5173/`
2. Check console browser untuk error
3. Clear browser cache
4. Restart frontend: `npm run dev` di folder `client`

### Selfbot Tidak Responding

**Solusi:**
1. Cek status: `.sb`
2. Reconnect: `.sb reconnect`
3. Check logs: `node scripts/debugSelfbot.js`
4. Restart server

### Command Tidak Work

**Solusi:**
1. Cek prefix (default: `.`)
2. Pastikan command ada di list
3. Check cooldown
4. Verify bot status connected

---

## 📚 Dokumentasi Lengkap

### File Dokumentasi

1. **README.md** - Overview project
2. **SELFBOT_README.md** - Panduan selfbot lengkap
3. **SELFBOT_RINGKASAN.md** - Ringkasan selfbot
4. **SELFBOT_FIX.md** - Technical fixes
5. **SELFBOT_TESTING_SUMMARY.md** - Test results
6. **SELFBOT_FINAL_REPORT.md** - Final report
7. **PANDUAN_PENGGUNAAN.md** - File ini

### Script Utilities

```bash
# Testing
node scripts/testSelfbot.js
node scripts/testSelfbotE2E.js
node scripts/testAllFeatures.js

# Debug
node scripts/debugSelfbot.js
node scripts/debugMenu.js

# Database
node scripts/addSelfbotColumns.js
node scripts/syncUserPlan.js

# Test Data
node scripts/createTestSelfbot.js
node scripts/deleteTestSelfbot.js
```

---

## 🎯 Quick Start Checklist

- [x] Backend running (port 3000)
- [x] Frontend running (port 5173)
- [x] Bot connected
- [ ] Login ke dashboard
- [ ] Test bot di WhatsApp
- [ ] Buat selfbot (optional)
- [ ] Configure settings
- [ ] Add owners
- [ ] Test commands

---

## 💡 Tips & Tricks

### Optimize Performance

1. **Restart bot regularly**
   - Prevent memory leaks
   - Clear cache

2. **Monitor logs**
   - Check for errors
   - Watch for spam

3. **Update dependencies**
   ```bash
   npm update
   cd client && npm update
   ```

### Customize Bot

1. **Edit menu text**
   - Dashboard → Menu Settings
   - Or edit `services/bot/constants.js`

2. **Add custom commands**
   - Create file in `services/bot/commands/`
   - Export in `services/bot/commands/index.js`
   - Add to `services/bot/commandList.js`

3. **Custom messages**
   - Dashboard → Settings
   - Edit welcome, left, promote, demote messages

---

## 🚀 Next Steps

### Untuk Development

1. **Add new features**
   - Create new commands
   - Add new API endpoints
   - Improve UI/UX

2. **Testing**
   - Write unit tests
   - Integration tests
   - E2E tests

3. **Documentation**
   - Update docs
   - Add examples
   - Create tutorials

### Untuk Production

1. **Deploy to server**
   - Railway, Heroku, VPS
   - Configure environment variables
   - Setup domain

2. **Security**
   - Enable HTTPS
   - Add rate limiting
   - Implement authentication

3. **Monitoring**
   - Setup logging service
   - Add analytics
   - Error tracking

---

## 📞 Support

**Jika ada masalah:**

1. Baca dokumentasi ini
2. Check troubleshooting section
3. Run debug scripts
4. Check logs
5. Contact developer

---

## 🎉 Selamat Menggunakan!

Bot dan dashboard sudah siap digunakan. Nikmati semua fitur yang tersedia!

**Happy Botting! 🤖**

---

**Last Updated:** January 17, 2026
**Version:** 2.0.0
**Status:** ✅ Production Ready
