const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bot = sequelize.define('Bot', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, defaultValue: 'My Bot' },
  phone: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('disconnected', 'connecting', 'connected'), defaultValue: 'disconnected' },
  sessionData: { type: DataTypes.TEXT },
  
  // Subscription
  plan: { type: DataTypes.ENUM('free', 'basic', 'premium', 'unlimited'), defaultValue: 'free' },
  expiredAt: { type: DataTypes.DATE },
  
  // Settings / Config (Wibusoft style)
  botName: { type: DataTypes.STRING, defaultValue: 'Alcateambot' },
  packname: { type: DataTypes.STRING, defaultValue: '@alcateambot' },
  authorSticker: { type: DataTypes.STRING, defaultValue: 'Alcateambot.Corp' },
  footerText: { type: DataTypes.STRING, defaultValue: 'Powered by Alcateambot.Corp' },
  limitPerDay: { type: DataTypes.INTEGER, defaultValue: 50 },
  balanceDefault: { type: DataTypes.INTEGER, defaultValue: 500 },
  
  // Multiple Owners - stored as JSON array [{name, number}]
  owners: { type: DataTypes.TEXT, defaultValue: '[]' },
  
  // Banned Users - stored as JSON array of JIDs
  bannedUsers: { type: DataTypes.TEXT, defaultValue: '[]' },
  
  // Prefix Settings
  prefix: { type: DataTypes.STRING, defaultValue: '!' },
  prefixType: { type: DataTypes.ENUM('multi', 'single', 'empty'), defaultValue: 'single' },
  
  // Feature Toggles (Wibusoft style)
  onlineOnConnect: { type: DataTypes.BOOLEAN, defaultValue: true },
  premiumNotification: { type: DataTypes.BOOLEAN, defaultValue: true },
  sewaNotificationGroup: { type: DataTypes.BOOLEAN, defaultValue: true },
  sewaNotificationOwner: { type: DataTypes.BOOLEAN, defaultValue: false },
  joinToUse: { type: DataTypes.BOOLEAN, defaultValue: false },
  welcomeEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  leftEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  antiLinkEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiSpamEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiBadwordEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiNsfwEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  gamesEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  levelingEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  
  // Custom Messages (Mess) - Wibusoft style
  // Basic Messages
  waitMessage: { type: DataTypes.TEXT, defaultValue: '*_Loading ..._*' },
  errorMessage: { type: DataTypes.TEXT, defaultValue: 'Jika Bot Mengalami Error Silahkan Join Ke Group Di Bawah 👇\nhttps://chat.whatsapp.com/xxx\n\n*Note*\nJangan Lupa Berika Ss Bukti Error Dan Kirim Ke Group!' },
  invLinkMessage: { type: DataTypes.TEXT, defaultValue: 'Link yang kamu berikan tidak valid' },
  onlyGroupMessage: { type: DataTypes.TEXT, defaultValue: 'Perintah ini hanya bisa digunakan di group' },
  onlyPMMessage: { type: DataTypes.TEXT, defaultValue: 'Perintah ini hanya bisa digunakan di private message' },
  groupAdminMessage: { type: DataTypes.TEXT, defaultValue: 'Perintah ini hanya bisa digunakan oleh Admin Grup' },
  botAdminMessage: { type: DataTypes.TEXT, defaultValue: 'Bot Harus menjadi admin' },
  onlyOwnerMessage: { type: DataTypes.TEXT, defaultValue: 'Perintah ini hanya dapat digunakan oleh owner bot' },
  onlyPremMessage: { type: DataTypes.TEXT, defaultValue: 'Perintah ini khusus member premium\n\n> ketik premium untuk membeli premium' },
  onlySewaMessage: { type: DataTypes.TEXT, defaultValue: 'Perintah ini khusus group sewa' },
  
  // Limit Messages
  limitMessage: { type: DataTypes.TEXT, defaultValue: 'Maaf limit harian kamu sudah habis,\nLimit akan direset pada pukul 05.05 setiap harinya.\n\n> beli premium untuk mendapatkan limit Unlimited, ketik {prefix}premium\n> atau kamu dapat membeli limit dengan mengetik {prefix}buylimit' },
  cmdLimitMessage: { type: DataTypes.TEXT, defaultValue: '> Kamu dapat membeli premium user untuk mendapatkan limit unlimited, ketik {prefix}premium\n> Ataupun kalian dapat membeli limit menggunakan balance, ketik {prefix}buylimit.\n> Jika balance tidak cukup anda bisa membelinya dengan ketik {prefix}buybalance\n\nLimit akan direset pada pukul 05.05 setiap harinya' },
  requiredLimitMessage: { type: DataTypes.TEXT, defaultValue: 'Limit yang kamu miliki tidak cukup untuk menggunakan fitur ini\n\nLimit kamu: {limit}\nLimit dibutuhkan: {requiredLimit}' },
  
  // Call Message
  callMessage: { type: DataTypes.TEXT, defaultValue: '"Maaf Anda Di Block Dikarenakan Bot Tidak Menerima Call"\n\n"Jika Ingin Membuka Block Anda Harus membayar denda 5k pada owner"\nhttps://wa.me/628xxx?text=Hi+Owner+Saya+Terblock+Oleh+Bot' },
  
  // Anti Delete
  antideleteMessage: { type: DataTypes.TEXT, defaultValue: '*[ Anti delete ]*\n\n• Sender : @{sender}\n• Type : {type}\n• Time : {time}' },
  
  // Anti Luar
  antiluarMessage: { type: DataTypes.TEXT, defaultValue: 'Hello @{sender}, this group is only for Indonesian people and you will be removed automatically' },
  
  // Promote/Demote
  promoteTextMessage: { type: DataTypes.TEXT, defaultValue: '*PROMOTE DETECTED*\nTerdeteksi @{sender} Telah Menjadi Admin Group Oleh @{author}' },
  demoteTextMessage: { type: DataTypes.TEXT, defaultValue: '*DEMOTE DETECTED*\nTerdeteksi @{sender} Telah Di Unadmin Oleh @{author}' },
  
  // Welcome/Left
  welcomeTextMessage: { type: DataTypes.TEXT, defaultValue: '━━━• WELCOME •━━━\n\n*• USER JOIN: @{user}*\n*• GROUP: {group}*' },
  leftTextMessage: { type: DataTypes.TEXT, defaultValue: '* • USER LEAVE • *\n\nSelamat tinggal @{user} 👋' },
  
  // Sewa Messages
  sewaEndMessage: { type: DataTypes.TEXT, defaultValue: 'Waktu sewa di grup ini sudah habis, silahkan hubungi owner untuk memperpanjang masa sewa\n\n> Untuk melihat list sewa ketik .sewa' },
  sewaNotifMessage: { type: DataTypes.TEXT, defaultValue: '*Sewa Notification*\n\nId: ${groupId}\nName: ${subject}' },
  sewaReminderMessage: { type: DataTypes.TEXT, defaultValue: 'Waktu sewa di grup ini kurang dari 24 jam, silahkan hubungi owner untuk memperpanjang masa sewa\n\n> Untuk melihat list sewa ketik .sewa' },
  
  // Join To Use
  joinToUseMessage: { type: DataTypes.TEXT, defaultValue: 'Ups..\nKamu belum masuk group, silahkan masuk group untuk menggunakan bot ini..\n\nhttps://chat.whatsapp.com/xxx' },
  
  // Alarm & Reminder
  alarmMessage: { type: DataTypes.TEXT, defaultValue: '{text}' },
  reminderMessage: { type: DataTypes.TEXT, defaultValue: '{text}' },
  
  // Downloader Messages
  tiktokMessage: { type: DataTypes.TEXT, defaultValue: '*[ Tiktok Downloader ]*\n\n• Id : {id}\n• Username : {username}\n• Nickname : {nickname}' },
  twitterMessage: { type: DataTypes.TEXT, defaultValue: '*[ Twitter Downloader]*\n\nUsername : {username}\nLike : {likes}\nReply : {replies}' },
  ytmp3Message: { type: DataTypes.TEXT, defaultValue: '*[ YOUTUBE AUDIO ]*\n\n• Title : {title}\n• Size : {size}\n• Quality : {bitrate}kbps' },
  ytmp4Message: { type: DataTypes.TEXT, defaultValue: '• Title : {title}\n• Size : {size}\n• Quality : {quality}\n\n...Harap tunggu sebentar, video anda akan segera dikirim..' },
  playMessage: { type: DataTypes.TEXT, defaultValue: '• Author Name : {authorName}\n• Author Channel : {authorUrl}\n• Description : {description}\n\n...Harap tunggu sebentar, permintaan anda akan segera dikirim..' },
  
  // Level Messages
  levelMessage: { type: DataTypes.TEXT, defaultValue: 'Maaf level anda {userLevel}, untuk menggunakan command ini minimal harus level {requiredLevel} evel' },
  levelupMessage: { type: DataTypes.TEXT, defaultValue: 'Selamat kamu naik level\n\nLevel : {before} -> {level}\nTier : {tier}\nXP : {xp}/{maxXp}' },
  
  // Profile
  profileMessage: { type: DataTypes.TEXT, defaultValue: '━━━• [ *User Info* ] •━━━\n\n| • Name: {pushname}\n| • Tag: @{number}\n| • Api: wa.me/{number}\n| • Status: {status}' },
  
  // Confess
  confessMessage: { type: DataTypes.TEXT, defaultValue: '*Contoh pengisian form*:\n\nNama Pengirim: Paimon\nNomor Penerima: 628111111\nPesan: Hai aku suka kamu <3' },
  
  // Countdown
  countdownMessage: { type: DataTypes.TEXT, defaultValue: '{days} days, {hours} hours, {minutes} minutes, {seconds} seconds' },
  countdownEndMessage: { type: DataTypes.TEXT, defaultValue: 'berakhir' },
  
  // Cooldown & Timeout
  cooldownMessage: { type: DataTypes.TEXT, defaultValue: 'Command sedang cooldown, harap tunggu {detik} detik lgi' },
  timeoutMessage: { type: DataTypes.TEXT, defaultValue: '*Timeout Silahkan Ulangin Kembali*' },
  
  // Birthday
  ultahMessage: { type: DataTypes.TEXT, defaultValue: 'Selamat ulang tahun kepada @{user} 🎂🎉!!\n\nSemoga panjang umur dan sehat selalu 🙏' },
  
  // Premium Messages
  upgradePremiumMessage: { type: DataTypes.TEXT, defaultValue: 'Selamat nomor anda sudah upgrade ke premium.\n\n*GROUP PREMIUM PAIMON*\nhttps://chat.whatsapp.com/xxx\n\n*Note*\n..Group Untuk Para Pengguna Premium User Bot Paimon..' },
  expirePremiumMessage: { type: DataTypes.TEXT, defaultValue: 'Status premium anda sudah habis, silahkan hubungi owner untuk memperpanjang premium\n\n> ketik premium untuk melihat list premium.' },
  
  // Menu Settings
  menuHeader: { type: DataTypes.TEXT, defaultValue: '╭─「 *{botName}* 」\n│ Prefix: {prefix}\n│ User: @user\n╰────────────' },
  menuFooter: { type: DataTypes.TEXT, defaultValue: '╰────「 *{botName}* 」' },
  menuThumbnail: { type: DataTypes.STRING },
  menuText: { type: DataTypes.TEXT },
  helpMenuText: { type: DataTypes.TEXT },
  menuType: { type: DataTypes.STRING, defaultValue: 'thumbnail' },
  menuTitle: { type: DataTypes.STRING },
  menuBody: { type: DataTypes.STRING },
  menuUrl: { type: DataTypes.STRING },
  menuLarge: { type: DataTypes.BOOLEAN, defaultValue: true },
  showAd: { type: DataTypes.BOOLEAN, defaultValue: false },
  // Location for menu type 'location'
  menuLatitude: { type: DataTypes.FLOAT },
  menuLongitude: { type: DataTypes.FLOAT },
  mapsLink: { type: DataTypes.STRING },
  // Image upload path
  menuImagePath: { type: DataTypes.STRING },
  // Ad URL for thumbnail click
  adUrl: { type: DataTypes.STRING },
  
  // Stats
  totalMessages: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalCommands: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalGroups: { type: DataTypes.INTEGER, defaultValue: 0 },
  connectedAt: { type: DataTypes.DATE },
  
  // Command Settings (JSON)
  commandSettings: { type: DataTypes.TEXT, defaultValue: '{}' }
});

module.exports = Bot;
