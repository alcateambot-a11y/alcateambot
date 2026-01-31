# ⚡ Quick Reference - Bot & Dashboard

## 🌐 URLs

| Service | URL | Status |
|---------|-----|--------|
| Dashboard | http://localhost:5173/ | ✅ Running |
| Backend API | http://localhost:3000/ | ✅ Running |
| Test Endpoint | http://localhost:3000/test | ✅ Available |

## 🤖 Bot Commands (Top 20)

### Essentials
```
.menu          # Show menu
.info          # Bot info
.owner         # Owner info
.ping          # Check latency
```

### Downloader
```
.play <judul>           # Download lagu
.tiktok <url>           # Download TikTok
.instagram <url>        # Download Instagram
.facebook <url>         # Download Facebook
```

### Tools
```
.sticker               # Buat sticker (kirim gambar)
.toimg                 # Sticker to image
.qr <text>             # Generate QR code
.tts <text>            # Text to speech
```

### Search
```
.google <query>        # Search Google
.wiki <query>          # Search Wikipedia
.translate <text>      # Translate text
.image <query>         # Search images
```

### Group
```
.kick @user            # Kick member
.add 628xxx            # Add member
.tagall                # Tag all members
.antilink on/off       # Toggle antilink
```

## 🔧 Selfbot Commands

```
.sb 628xxx             # Create selfbot
.sb                    # Check status
.sb reconnect          # Reconnect
.sb off                # Delete selfbot
```

## 📊 Admin Commands

```
.broadcast <msg>       # Broadcast to all groups
.ban @user             # Ban user
.addprem @user 30      # Add premium 30 days
.addsewa groupid 30    # Add sewa 30 days
```

## 🛠️ Debug Scripts

```bash
node scripts/debugSelfbot.js        # Debug selfbot
node scripts/testSelfbot.js         # Test selfbot
node scripts/testSelfbotE2E.js      # E2E test
node scripts/createTestSelfbot.js   # Create test data
```

## 🔍 Monitoring

```bash
# Check bot status
curl http://localhost:3000/test

# View processes
# Backend: Process 1
# Frontend: Process 2
```

## 📱 Dashboard Pages

```
/                      # Landing
/login                 # Login
/register              # Register
/dashboard             # Dashboard
/bots                  # Manage bots
/commands              # Command settings
/filters               # Auto-reply
/menu                  # Menu settings
/admin                 # Admin panel
```

## 🚨 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Bot not responding | Check status: `.sb` or restart server |
| Dashboard not loading | Check http://localhost:5173/ |
| Selfbot not working | Run: `node scripts/debugSelfbot.js` |
| Command not found | Check prefix (default: `.`) |

## 💾 Important Files

```
server.js                          # Main server
services/whatsapp.js               # WhatsApp connection
services/botHandler.js             # Message handler
services/selfbotHandler.js         # Selfbot handler
services/selfbotConnection.js      # Selfbot connection
client/src/App.jsx                 # Frontend routes
```

## 🔐 Security Checklist

- [ ] Set strong passwords
- [ ] Configure owners correctly
- [ ] Don't share pairing codes
- [ ] Monitor logs regularly
- [ ] Backup session files
- [ ] Update dependencies

## 📞 Quick Help

**Bot not connecting?**
1. Delete session folder
2. Restart server
3. Scan QR again

**Selfbot issues?**
1. Check status: `.sb`
2. Reconnect: `.sb reconnect`
3. Debug: `node scripts/debugSelfbot.js`

**Dashboard issues?**
1. Clear browser cache
2. Check console for errors
3. Restart frontend

## 🎯 Quick Start

```bash
# 1. Start backend
npm start

# 2. Start frontend (new terminal)
cd client
npm run dev

# 3. Access dashboard
# Open: http://localhost:5173/

# 4. Test bot
# Send: .menu to bot in WhatsApp
```

## ✅ System Status

- ✅ Backend: Running on port 3000
- ✅ Frontend: Running on port 5173
- ✅ Bot: Connected (ID: 2)
- ✅ Selfbot: Feature loaded
- ✅ Commands: 919 total loaded

---

**Last Updated:** January 17, 2026
**Quick Access:** Keep this file open for quick reference!
