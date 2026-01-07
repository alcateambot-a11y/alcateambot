/**
 * Info Commands
 * menu, ping, info, owner
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { formatMsg, getMenuVariables, formatUptime, checkOwner, getUserPlanInfo, isUserPremium, getBotData } = require('../utils');
const { DEFAULT_MENU } = require('../constants');

/**
 * Resize image for thumbnail (max 300x300, max 100KB)
 */
async function resizeForThumbnail(buffer) {
  try {
    // Resize to smaller size for better compatibility
    const resized = await sharp(buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 50 })
      .toBuffer();
    
    console.log('Thumbnail resized from', buffer.length, 'to', resized.length, 'bytes');
    return resized;
  } catch (err) {
    console.error('Error resizing thumbnail:', err.message);
    return null;
  }
}

/**
 * Send menu based on menuType setting
 */
async function cmdMenu(sock, msg, bot, args, { sender, pushName, usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  console.log('=== cmdMenu called ===');
  
  // Get fresh bot data from database (for footerText and other settings)
  const freshBot = await getBotData(bot.id) || bot;
  
  // Get fresh user plan from database
  const planInfo = await getUserPlanInfo(freshBot.userId);
  
  // Build variables safely
  let vars;
  try {
    vars = getMenuVariables(freshBot, sender, pushName, usedPrefix);
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    vars.tanggal = now.toLocaleDateString('id-ID');
    vars.hari = days[now.getDay()];
    vars.wib = now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' });
    vars.sender = sender ? sender.split('@')[0] : 'User';
    vars.limit = planInfo.plan === 'free' ? (planInfo.quota - planInfo.usedQuota) : '∞';
    vars.balance = '0';
    vars.plan = planInfo.plan.charAt(0).toUpperCase() + planInfo.plan.slice(1);
    vars.status = checkOwner(freshBot, sender) ? 'Owner' : (planInfo.plan !== 'free' ? planInfo.plan.charAt(0).toUpperCase() + planInfo.plan.slice(1) : 'Free');
    
    // Add footer variable - use footerText if premium, otherwise use default
    const isPremium = await isUserPremium(freshBot.userId);
    vars.footer = (isPremium && freshBot.footerText) ? freshBot.footerText : (freshBot.botName || 'Alcateambot');
  } catch (e) {
    console.error('Error building vars:', e.message);
    vars = { pushname: 'User', prefix: '!', namebot: 'Bot', ucapan: 'Halo', status: 'Free', plan: 'Free', footer: 'Alcateambot' };
  }
  
  const menuText = freshBot.menuText || DEFAULT_MENU;
  const formattedMenu = formatMsg(menuText, vars);
  
  const menuType = freshBot.menuType || 'text';
  
  console.log('Menu type:', menuType);
  
  try {
    // TYPE: TEXT or no image
    if (menuType === 'text' || !freshBot.menuImagePath) {
      await sock.sendMessage(remoteJid, { text: formattedMenu });
      return;
    }
    
    // Load image
    let imageBuffer;
    const imagePath = freshBot.menuImagePath;
    
    try {
      if (imagePath.startsWith('http')) {
        const response = await axios.get(imagePath, { 
          responseType: 'arraybuffer', 
          timeout: 8000
        });
        imageBuffer = Buffer.from(response.data);
      } else {
        const fullPath = path.join(__dirname, '../../../public', imagePath);
        if (fs.existsSync(fullPath)) {
          imageBuffer = fs.readFileSync(fullPath);
        }
      }
    } catch (loadErr) {
      console.error('Error loading image:', loadErr.message);
    }
    
    if (!imageBuffer) {
      await sock.sendMessage(remoteJid, { text: formattedMenu });
      return;
    }
    
    // TYPE: IMAGE - Image with caption
    if (menuType === 'image') {
      // Resize for image (max 1MB)
      let finalImage = imageBuffer;
      if (imageBuffer.length > 1024 * 1024) {
        try {
          finalImage = await sharp(imageBuffer)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();
        } catch (e) {
          console.error('Error resizing image:', e.message);
        }
      }
      
      await sock.sendMessage(remoteJid, {
        image: finalImage,
        caption: formattedMenu
      });
      return;
    }
    
    // TYPE: THUMBNAIL - External ad reply with thumbnail
    if (menuType === 'thumbnail') {
      // IMPORTANT: Resize thumbnail to small size (WhatsApp limit ~100KB)
      const thumbnailBuffer = await resizeForThumbnail(imageBuffer);
      
      if (!thumbnailBuffer) {
        console.log('Thumbnail resize failed, falling back to text');
        await sock.sendMessage(remoteJid, { text: formattedMenu });
        return;
      }
      
      // Check showAd setting - must be explicitly true
      const showAd = freshBot.showAd === true;
      const useLargeThumbnail = freshBot.menuLarge !== false;
      
      console.log('Thumbnail settings - showAd:', freshBot.showAd, 'large:', useLargeThumbnail);
      console.log('Thumbnail buffer size:', thumbnailBuffer.length, 'bytes');
      
      try {
        // Use extendedTextMessage with contextInfo for better compatibility
        await sock.sendMessage(remoteJid, {
          text: formattedMenu,
          contextInfo: {
            externalAdReply: {
              title: freshBot.menuTitle || freshBot.botName || 'MENU BOT',
              body: freshBot.menuBody || 'WhatsApp Bot',
              thumbnail: thumbnailBuffer,
              sourceUrl: freshBot.adUrl || 'https://wa.me',
              mediaType: 1,
              renderLargerThumbnail: useLargeThumbnail,
              showAdAttribution: showAd
            }
          }
        });
        console.log('Thumbnail menu sent successfully');
      } catch (thumbErr) {
        console.error('Error sending thumbnail menu:', thumbErr.message);
        // Fallback to text
        await sock.sendMessage(remoteJid, { text: formattedMenu });
      }
      return;
    }
    
    // TYPE: LOCATION
    if (menuType === 'location') {
      const lat = parseFloat(freshBot.menuLatitude);
      const lng = parseFloat(freshBot.menuLongitude);
      
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        await sock.sendMessage(remoteJid, {
          location: {
            degreesLatitude: lat,
            degreesLongitude: lng,
            name: freshBot.menuTitle || freshBot.botName || 'Location'
          }
        });
        await sock.sendMessage(remoteJid, { text: formattedMenu });
        return;
      }
      
      await sock.sendMessage(remoteJid, { text: formattedMenu });
      return;
    }
    
    // Default
    await sock.sendMessage(remoteJid, { text: formattedMenu });
    
  } catch (err) {
    console.error('Error in cmdMenu:', err.message);
    try {
      await sock.sendMessage(remoteJid, { text: formattedMenu });
    } catch (e) {
      console.error('Fallback failed:', e.message);
    }
  }
}

async function cmdPing(sock, msg, bot) {
  const start = Date.now();
  await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong!' });
  const latency = Date.now() - start;
  await sock.sendMessage(msg.key.remoteJid, { text: `📶 Latency: ${latency}ms` });
}

async function cmdInfo(sock, msg, bot) {
  const uptime = formatUptime();
  
  console.log('=== cmdInfo called ===');
  console.log('Bot userId:', bot.userId);
  
  // Get fresh bot data from database
  const freshBot = await getBotData(bot.id) || bot;
  
  // Get fresh user plan from database
  const planInfo = await getUserPlanInfo(freshBot.userId);
  console.log('Plan info received:', planInfo);
  
  const planDisplay = planInfo.plan.charAt(0).toUpperCase() + planInfo.plan.slice(1);
  
  // Format expiry - show date if > 30 days, show days if <= 30 days
  let expiredInfo = '';
  if (planInfo.plan !== 'free' && planInfo.expiredAt) {
    const expDate = new Date(planInfo.expiredAt);
    const daysLeft = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft > 30) {
      // Show full date
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      expiredInfo = `\n📅 *Expired:* ${expDate.toLocaleDateString('id-ID', options)}`;
    } else if (daysLeft > 0) {
      expiredInfo = `\n📅 *Expired:* ${daysLeft} hari lagi`;
    } else {
      expiredInfo = `\n📅 *Status:* Expired`;
    }
  }
  
  // Get footer text - use footerText if premium, otherwise use botName
  const isPremium = await isUserPremium(freshBot.userId);
  const footer = (isPremium && freshBot.footerText) ? freshBot.footerText : (freshBot.botName || 'Alcateambot');
  
  const info = `╭━━━━━━━━━━━━━━━━━╮
│   🤖 *Bot Info*
╰━━━━━━━━━━━━━━━━━╯

� *TName:* ${freshBot.botName || 'Alcateambot'}
⏱️ *Uptime:* ${uptime}
📦 *Plan:* ${planDisplay}${expiredInfo}
📊 *Total Messages:* ${freshBot.totalMessages || 0}
📝 *Total Commands:* ${freshBot.totalCommands || 0}
👥 *Total Groups:* ${freshBot.totalGroups || 0}

_Powered by ${footer}_`;

  await sock.sendMessage(msg.key.remoteJid, { text: info });
}

async function cmdOwner(sock, msg, bot) {
  try {
    const owners = JSON.parse(bot.owners || '[]');
    if (owners.length === 0) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Owner belum diset' });
    }
    
    // Build vCard contacts
    const contacts = [];
    
    for (const owner of owners) {
      const name = owner.name || 'Owner';
      const number = (owner.number || '').replace(/[^0-9]/g, '');
      
      if (!number) continue;
      
      // Format vCard with name
      const vcard = 'BEGIN:VCARD\n'
        + 'VERSION:3.0\n'
        + 'N:' + name + ';;;\n'
        + 'FN:' + name + '\n'
        + 'TEL;type=CELL;waid=' + number + ':+' + number + '\n'
        + 'END:VCARD';
      
      contacts.push({
        displayName: name,
        vcard: vcard
      });
    }
    
    if (contacts.length === 0) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Owner belum diset' });
    }
    
    // Send contacts only - displayName will show the name from config
    // Note: If receiver has the number saved, WhatsApp will show their saved name instead
    const displayName = contacts.length === 1 
      ? `👑 ${contacts[0].displayName}` 
      : `👑 ${contacts.length} Owner Bot`;
    
    await sock.sendMessage(msg.key.remoteJid, {
      contacts: {
        displayName: displayName,
        contacts: contacts.map(c => ({ vcard: c.vcard }))
      }
    });
    
  } catch (err) {
    console.error('Error in cmdOwner:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Error: ' + err.message });
  }
}

async function cmdRuntime(sock, msg, bot) {
  const uptime = formatUptime();
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `⏱️ *Bot Runtime*\n\n🕐 ${uptime}` 
  });
}

async function cmdHelp(sock, msg, bot, args, { usedPrefix }) {
  if (!args.length) {
    // Show general help
    const helpText = `📚 *Help Menu*

Ketik ${usedPrefix}help <command> untuk melihat detail command.

Contoh: ${usedPrefix}help ai

Atau ketik ${usedPrefix}menu untuk melihat semua command.`;
    
    await sock.sendMessage(msg.key.remoteJid, { text: helpText });
    return;
  }
  
  const cmd = args[0].toLowerCase();
  const helpTemplate = bot.helpMenuText || '*Command:* {command}\n*Description:* {description}';
  
  // Command descriptions
  const cmdDescriptions = {
    menu: 'Menampilkan daftar semua command',
    ping: 'Cek response time bot',
    info: 'Menampilkan informasi bot',
    owner: 'Menampilkan info owner bot',
    ai: 'Tanya AI (GPT)',
    gpt: 'Tanya AI (GPT)',
    gemini: 'Tanya AI (Gemini)',
    wiki: 'Cari di Wikipedia',
    cuaca: 'Cek cuaca kota',
    tiktok: 'Download video TikTok',
    ig: 'Download media Instagram',
    pinterest: 'Cari gambar di Pinterest',
    qr: 'Buat QR Code',
    calc: 'Kalkulator',
    slot: 'Main slot machine',
    dice: 'Lempar dadu',
    truth: 'Pertanyaan truth',
    dare: 'Tantangan dare',
    fakta: 'Fakta unik random',
    quote: 'Quote inspiratif',
    jokes: 'Jokes lucu',
    meme: 'Meme random',
    waifu: 'Gambar waifu random',
    neko: 'Gambar neko random',
    cat: 'Gambar kucing random',
    dog: 'Gambar anjing random',
    kick: 'Kick member dari grup',
    add: 'Tambah member ke grup',
    hidetag: 'Tag semua member (hidden)',
    tagall: 'Tag semua member'
  };
  
  const description = cmdDescriptions[cmd] || 'Tidak ada deskripsi';
  const helpMsg = formatMsg(helpTemplate, {
    command: cmd,
    category: 'General',
    description: description,
    example: `${usedPrefix}${cmd}`
  });
  
  await sock.sendMessage(msg.key.remoteJid, { text: helpMsg });
}

/**
 * Premium Menu - Show only premium features
 */
async function cmdPremium(sock, msg, bot, args, { sender, pushName, usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  // Get fresh bot data
  const freshBot = await getBotData(bot.id) || bot;
  
  // Get command settings to find premium commands
  let commandSettings = {};
  try {
    commandSettings = JSON.parse(freshBot.commandSettings || '{}');
  } catch (e) {
    commandSettings = {};
  }
  
  // Find all premium commands and group by category
  const premiumByCategory = {};
  
  for (const [cmdName, settings] of Object.entries(commandSettings)) {
    if (settings.premiumOnly) {
      // Determine category based on command name
      let category = 'Other';
      if (['ai', 'imagine', 'gpt', 'gemini'].includes(cmdName)) category = 'AI';
      else if (['tiktok', 'instagram', 'play', 'pinterest'].includes(cmdName)) category = 'Downloader';
      else if (['ssweb'].includes(cmdName)) category = 'Tools';
      else if (['tebakgambar'].includes(cmdName)) category = 'Games';
      else if (['aesthetic', 'ppcouple'].includes(cmdName)) category = 'Random';
      
      if (!premiumByCategory[category]) {
        premiumByCategory[category] = [];
      }
      premiumByCategory[category].push(cmdName);
    }
  }
  
  // Build premium menu text
  const vars = getMenuVariables(freshBot, sender, pushName, usedPrefix);
  const isPremiumUser = await isUserPremium(freshBot.userId);
  const footer = (isPremiumUser && freshBot.footerText) ? freshBot.footerText : (freshBot.botName || 'Alcateambot');
  
  let menuText = `*⊱ ━━━━━━━━ ⊰*
*• ✦ PREMIUM MENU ✦ •*
*>> Bot Name:* ${freshBot.botName || 'Bot'} 🏷
*>> Prefix:* ${usedPrefix} 🔧

👑 *Fitur Premium* adalah fitur eksklusif
yang hanya bisa diakses oleh user premium.

Hubungi owner untuk membeli premium!
Ketik: ${usedPrefix}owner

*⊱ ━━━━━━━━ ⊰*\n`;

  const totalPremium = Object.values(premiumByCategory).reduce((sum, cmds) => sum + cmds.length, 0);
  
  if (totalPremium === 0) {
    menuText += `\n_Belum ada fitur premium yang diset_\n`;
  } else {
    for (const [category, cmds] of Object.entries(premiumByCategory)) {
      menuText += `\n*• ✦ ${category.toUpperCase()} ✦ •*\n`;
      for (const cmd of cmds) {
        menuText += `┃ 👑 ${usedPrefix}${cmd}\n`;
      }
    }
  }
  
  menuText += `\n*⊱ ━━━━━━━━ ⊰*
*Total:* ${totalPremium} Fitur Premium
*⊱ ━━━━━━━━ ⊰*
_Powered By ${footer}_`;

  await sock.sendMessage(remoteJid, { text: menuText });
}

/**
 * Cek Premium - Check if user is premium
 */
async function cmdCekPremium(sock, msg, bot, args, { sender, usedPrefix, isGroup, groupMetadata }) {
  const remoteJid = msg.key.remoteJid;
  const { PremiumUser } = require('../../../models');
  
  // Determine target number
  let targetNumber = sender.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
  let targetJid = sender;
  let targetName = 'Kamu';
  
  // Check if there's a mention
  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  
  // Check if replying to someone
  const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
  
  if (mentionedJid) {
    targetJid = mentionedJid;
    // Resolve LID to phone number if in group
    if (mentionedJid.endsWith('@lid') && isGroup && groupMetadata) {
      const participant = groupMetadata.participants.find(p => p.id === mentionedJid);
      if (participant && participant.phoneNumber) {
        targetNumber = participant.phoneNumber.replace(/[^0-9]/g, '');
      } else {
        targetNumber = mentionedJid.split('@')[0];
      }
    } else {
      targetNumber = mentionedJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
    }
    targetName = `@${targetNumber}`;
  } else if (quotedParticipant) {
    targetJid = quotedParticipant;
    // Resolve LID to phone number if in group
    if (quotedParticipant.endsWith('@lid') && isGroup && groupMetadata) {
      const participant = groupMetadata.participants.find(p => p.id === quotedParticipant);
      if (participant && participant.phoneNumber) {
        targetNumber = participant.phoneNumber.replace(/[^0-9]/g, '');
      } else {
        targetNumber = quotedParticipant.split('@')[0];
      }
    } else {
      targetNumber = quotedParticipant.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
    }
    targetName = `@${targetNumber}`;
  } else if (args.length > 0) {
    // Check if number provided in args
    targetNumber = args[0].replace(/[^0-9]/g, '');
    if (targetNumber.length >= 10) {
      targetName = targetNumber;
    }
  }
  
  // Check if owner
  let owners = [];
  try {
    owners = JSON.parse(bot.owners || '[]');
  } catch (e) {
    owners = [];
  }
  const isOwner = owners.some(o => {
    const ownerNumber = (o.number || '').replace(/[^0-9]/g, '');
    return ownerNumber === targetNumber;
  });
  
  // Check premium status
  let premiumUser = null;
  try {
    premiumUser = await PremiumUser.findOne({
      where: { botId: bot.id, number: targetNumber }
    });
  } catch (e) {
    console.error('Error checking premium:', e.message);
  }
  
  let statusText = '';
  const mentions = targetName.startsWith('@') ? [`${targetNumber}@s.whatsapp.net`] : [];
  
  if (isOwner) {
    statusText = `👑 *CEK PREMIUM*

• *User:* ${targetName}
• *Nomor:* wa.me/${targetNumber}
• *Status:* 👑 OWNER

_Owner memiliki akses ke semua fitur!_`;
  } else if (premiumUser && new Date(premiumUser.expiredAt) > new Date()) {
    const expDate = new Date(premiumUser.expiredAt);
    const now = new Date();
    const diff = expDate - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeLeft = '';
    if (premiumUser.expiredAt.getTime() > Date.now() + (100 * 365 * 24 * 60 * 60 * 1000)) {
      timeLeft = 'PERMANENT';
    } else {
      timeLeft = `${days} Hari ${hours} Jam ${minutes} Menit`;
    }
    
    statusText = `👑 *CEK PREMIUM*

• *User:* ${targetName}
• *Nomor:* wa.me/${targetNumber}
• *Status:* ✅ PREMIUM AKTIF
• *Sisa Waktu:* ${timeLeft}

_Nikmati semua fitur premium!_
Ketik ${usedPrefix}premium untuk melihat fitur`;
  } else {
    statusText = `👑 *CEK PREMIUM*

• *User:* ${targetName}
• *Nomor:* wa.me/${targetNumber}
• *Status:* ❌ BUKAN PREMIUM

_Hubungi owner untuk membeli premium!_
Ketik ${usedPrefix}owner`;
  }
  
  await sock.sendMessage(remoteJid, { text: statusText, mentions });
}

module.exports = {
  menu: cmdMenu,
  help: cmdMenu,        // alias for menu
  listcmd: cmdMenu,     // alias for menu
  listcommand: cmdMenu, // alias for menu
  ping: cmdPing,
  speed: cmdPing,       // alias for ping
  speedtest: cmdPing,   // alias for ping
  info: cmdInfo,
  botinfo: cmdInfo,     // alias for info
  owner: cmdOwner,
  runtime: cmdRuntime,
  uptime: cmdRuntime,   // alias for runtime
  premium: cmdPremium,
  prem: cmdPremium,     // alias for premium
  cekpremium: cmdCekPremium,
  cekprem: cmdCekPremium,
  checkpremium: cmdCekPremium,
  donate: async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, { text: '💰 *DONASI*\n\nTerima kasih atas dukunganmu!\n\nHubungi owner untuk info donasi.\nKetik: .owner' });
  },
  donasi: async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, { text: '💰 *DONASI*\n\nTerima kasih atas dukunganmu!\n\nHubungi owner untuk info donasi.\nKetik: .owner' });
  },
  report: async (sock, msg, bot, args) => {
    if (!args.length) return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan laporan!\n\nContoh: .report bug di fitur x' });
    await sock.sendMessage(msg.key.remoteJid, { text: '✅ Laporan terkirim ke owner!\n\nTerima kasih atas laporanmu.' });
  },
  lapor: async (sock, msg, bot, args) => {
    if (!args.length) return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan laporan!\n\nContoh: .lapor bug di fitur x' });
    await sock.sendMessage(msg.key.remoteJid, { text: '✅ Laporan terkirim ke owner!\n\nTerima kasih atas laporanmu.' });
  },
  request: async (sock, msg, bot, args) => {
    if (!args.length) return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan request!\n\nContoh: .request fitur baru' });
    await sock.sendMessage(msg.key.remoteJid, { text: '✅ Request terkirim ke owner!\n\nTerima kasih atas saranmu.' });
  },
  req: async (sock, msg, bot, args) => {
    if (!args.length) return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan request!\n\nContoh: .req fitur baru' });
    await sock.sendMessage(msg.key.remoteJid, { text: '✅ Request terkirim ke owner!\n\nTerima kasih atas saranmu.' });
  },
  botrules: async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, { text: '📜 *RULES BOT*\n\n1. Jangan spam command\n2. Gunakan bot dengan bijak\n3. Jangan abuse fitur\n4. Hormati sesama user\n5. Ikuti aturan grup\n\n_Pelanggaran = BAN_' });
  },
  aturanbot: async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, { text: '📜 *ATURAN BOT*\n\n1. Jangan spam command\n2. Gunakan bot dengan bijak\n3. Jangan abuse fitur\n4. Hormati sesama user\n5. Ikuti aturan grup\n\n_Pelanggaran = BAN_' });
  },
  about: async (sock, msg, bot) => {
    await sock.sendMessage(msg.key.remoteJid, { text: `📖 *ABOUT*\n\n🤖 *${bot?.botName || 'Bot'}*\n\nBot WhatsApp multifungsi dengan berbagai fitur menarik!\n\n✨ Features:\n• AI Chat\n• Downloader\n• Games\n• Tools\n• Dan masih banyak lagi!\n\n🌐 Dashboard: http://localhost:5173\n\nKetik .menu untuk melihat semua fitur.` });
  },
  tentang: async (sock, msg, bot) => {
    await sock.sendMessage(msg.key.remoteJid, { text: `📖 *TENTANG*\n\n🤖 *${bot?.botName || 'Bot'}*\n\nBot WhatsApp multifungsi dengan berbagai fitur menarik!\n\n✨ Fitur:\n• AI Chat\n• Downloader\n• Games\n• Tools\n• Dan masih banyak lagi!\n\n🌐 Dashboard: http://localhost:5173\n\nKetik .menu untuk melihat semua fitur.` });
  },
  dashboard: async (sock, msg, bot) => {
    await sock.sendMessage(msg.key.remoteJid, { text: `📖 *ABOUT*\n\n🤖 *${bot?.botName || 'Bot'}*\n\nBot WhatsApp multifungsi dengan berbagai fitur menarik!\n\n✨ Features:\n• AI Chat\n• Downloader\n• Games\n• Tools\n• Dan masih banyak lagi!\n\n🌐 Dashboard: http://localhost:5173\n\nKetik .menu untuk melihat semua fitur.` });
  },
  panel: async (sock, msg, bot) => {
    await sock.sendMessage(msg.key.remoteJid, { text: `📖 *ABOUT*\n\n🤖 *${bot?.botName || 'Bot'}*\n\nBot WhatsApp multifungsi dengan berbagai fitur menarik!\n\n✨ Features:\n• AI Chat\n• Downloader\n• Games\n• Tools\n• Dan masih banyak lagi!\n\n🌐 Dashboard: http://localhost:5173\n\nKetik .menu untuk melihat semua fitur.` });
  }
};
