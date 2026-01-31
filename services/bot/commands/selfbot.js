/**
 * Selfbot Command
 * Allow users to create selfbot directly from chat
 */

const { Bot, User } = require('../../../models');
const { createSelfbotSession, getPairingCode } = require('../../selfbotConnection');

/**
 * Command: .sb atau .selfbot
 * Usage: .sb 628123456789
 */
async function cmdSelfbot(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  // Get sender phone number
  let senderPhone = sender.split('@')[0];
  if (senderPhone.includes(':')) {
    senderPhone = senderPhone.split(':')[0];
  }
  senderPhone = senderPhone.replace(/[^0-9]/g, '');
  
  try {
    // Check if user already has selfbot
    const existingSelfbot = await Bot.findOne({
      where: { 
        phone: senderPhone,
        isSelfbot: true 
      }
    });
    
    if (existingSelfbot) {
      // Check status
      if (existingSelfbot.status === 'connected' && existingSelfbot.selfbotEnabled) {
        return await sock.sendMessage(remoteJid, {
          text: `✅ *SELFBOT AKTIF*\n\nKamu sudah punya selfbot yang aktif!\n\n📱 Nomor: ${existingSelfbot.phone}\n🟢 Status: Connected\n\n💡 *Command tersedia:*\n• Downloader: .play, .tiktok, .ig, .fb\n• Tools: .sticker, .qr, .tts\n• Search: .google, .wiki, .translate\n• Fun: .quote, .meme, .jokes\n\n⚠️ Untuk disconnect, ketik: .sb off`
        });
      } else {
        // Selfbot exists but not connected
        return await sock.sendMessage(remoteJid, {
          text: `⚠️ *SELFBOT TIDAK AKTIF*\n\nKamu punya selfbot tapi belum connected.\n\n📱 Nomor: ${existingSelfbot.phone}\n🔴 Status: Disconnected\n\n💡 Untuk reconnect:\n1. Ketik: .sb reconnect\n2. Atau hapus dan buat baru: .sb delete`
        });
      }
    }
    
    // No args = show help
    if (!args.length) {
      return await sock.sendMessage(remoteJid, {
        text: `🤖 *SELFBOT COMMAND*\n\n📝 *Cara Pakai:*\n.sb <nomor_hp>\n\nContoh:\n.sb 628123456789\n\n📱 *Nomor HP:*\n• Pakai kode negara\n• Indonesia: 628xxx\n• US: 1xxx\n• Dll\n\n✨ *Fitur Selfbot:*\n• Downloader (TikTok, IG, YT, dll)\n• Tools (Sticker, QR, TTS)\n• Search (Google, Wiki)\n• Fun (Quote, Meme)\n\n⚠️ *Note:*\nSelfbot = Bot di akun WhatsApp kamu sendiri!`
      });
    }
    
    const action = args[0].toLowerCase();
    
    // Handle actions
    if (action === 'off' || action === 'delete') {
      if (!existingSelfbot) {
        return await sock.sendMessage(remoteJid, {
          text: '❌ Kamu belum punya selfbot!'
        });
      }
      
      // Delete selfbot
      const { deleteSelfbotSession } = require('../../selfbotConnection');
      await deleteSelfbotSession(existingSelfbot.id);
      await existingSelfbot.destroy();
      
      return await sock.sendMessage(remoteJid, {
        text: '✅ Selfbot berhasil dihapus!'
      });
    }
    
    if (action === 'reconnect') {
      if (!existingSelfbot) {
        return await sock.sendMessage(remoteJid, {
          text: '❌ Kamu belum punya selfbot! Buat dulu dengan: .sb <nomor_hp>'
        });
      }
      
      // Reconnect
      await createSelfbotSession(existingSelfbot.id, existingSelfbot.userId, existingSelfbot.phone);
      
      return await sock.sendMessage(remoteJid, {
        text: '🔄 Reconnecting selfbot...\n\nTunggu beberapa detik, lalu cek status dengan: .sb'
      });
    }
    
    // Create new selfbot
    const phoneNumber = args[0].replace(/[^0-9]/g, '');
    
    if (phoneNumber.length < 10) {
      return await sock.sendMessage(remoteJid, {
        text: '❌ Nomor HP tidak valid!\n\nContoh yang benar:\n.sb 628123456789'
      });
    }
    
    // Check if this phone already has selfbot
    const phoneExists = await Bot.findOne({
      where: { 
        phone: phoneNumber,
        isSelfbot: true 
      }
    });
    
    if (phoneExists) {
      return await sock.sendMessage(remoteJid, {
        text: '❌ Nomor ini sudah digunakan untuk selfbot lain!'
      });
    }
    
    // Get or create user
    let user = await User.findOne({ where: { phone: senderPhone } });
    
    if (!user) {
      // Try to find by email pattern first
      user = await User.findOne({ where: { email: `selfbot_${senderPhone}@temp.com` } });
      
      if (!user) {
        // Create temporary user for selfbot
        try {
          user = await User.create({
            name: `Selfbot User ${senderPhone}`,
            phone: senderPhone,
            email: `selfbot_${senderPhone}@temp.com`,
            password: `selfbot_${senderPhone}_${Date.now()}`, // Random password
            plan: 'free'
          });
        } catch (createErr) {
          console.error('Error creating user:', createErr.message);
          return await sock.sendMessage(remoteJid, {
            text: '❌ Gagal membuat user. Error: ' + createErr.message
          });
        }
      }
    }
    
    // Create selfbot
    const selfbot = await Bot.create({
      userId: user.id,
      name: `Selfbot ${phoneNumber}`,
      phone: phoneNumber,
      isSelfbot: true,
      selfbotEnabled: false,
      status: 'connecting',
      prefix: '.',
      prefixType: 'single'
    });
    
    // Send initial message
    await sock.sendMessage(remoteJid, {
      text: '⏳ *MEMBUAT SELFBOT...*\n\nTunggu sebentar, pairing code akan muncul...'
    });
    
    // Start selfbot session with error handling
    try {
      await createSelfbotSession(selfbot.id, user.id, phoneNumber);
    } catch (sessionErr) {
      console.error('Error creating selfbot session:', sessionErr.message);
      
      // Delete the bot if session creation failed
      await selfbot.destroy();
      
      return await sock.sendMessage(remoteJid, {
        text: `❌ *GAGAL MEMBUAT SELFBOT*\n\nError: ${sessionErr.message}\n\n💡 *Kemungkinan penyebab:*\n• Koneksi internet tidak stabil\n• Server sedang sibuk\n• Nomor sudah digunakan\n\n🔄 *Solusi:*\nCoba lagi dalam beberapa saat:\n.sb ${phoneNumber}`
      });
    }
    
    // Wait for pairing code (max 15 seconds)
    let attempts = 0;
    let pairingCode = null;
    
    while (attempts < 30 && !pairingCode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      pairingCode = getPairingCode(selfbot.id);
      attempts++;
    }
    
    if (!pairingCode) {
      // Delete the bot if pairing code not generated
      await selfbot.destroy();
      
      return await sock.sendMessage(remoteJid, {
        text: '❌ *GAGAL MENDAPATKAN PAIRING CODE*\n\nTimeout - pairing code tidak muncul dalam 15 detik.\n\n🔄 *Coba lagi:*\n.sb ' + phoneNumber
      });
    }
    
    // Send pairing code
    await sock.sendMessage(remoteJid, {
      text: `✅ *PAIRING CODE*\n\n📱 Nomor: ${phoneNumber}\n🔑 Code: *${pairingCode}*\n\n📝 *Langkah-langkah:*\n1. Buka WhatsApp di HP\n2. Settings → Linked Devices\n3. Link a Device\n4. "Link with phone number instead"\n5. Masukkan code: *${pairingCode}*\n\n⏰ Code berlaku 5 menit\n\n💡 Setelah connected, coba:\n.play dewa 19\n.tiktok <url>\n.sticker (kirim gambar)\n\n⚠️ Untuk disconnect: .sb off`
    });
    
  } catch (err) {
    console.error('Selfbot command error:', err);
    await sock.sendMessage(remoteJid, {
      text: '❌ Error: ' + err.message
    });
  }
}

module.exports = {
  selfbot: cmdSelfbot,
  sb: cmdSelfbot
};
