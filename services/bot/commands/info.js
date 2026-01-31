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
  
  // Send initial message and measure response time
  const sentMsg = await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong!' });
  
  // Calculate latency in seconds (like Wibusoft)
  const latency = Date.now() - start;
  const latencySeconds = (latency / 1000).toFixed(4); // 4 decimal places
  
  // Edit the message with response time in monospace (kotak hitam)
  // Pakai backtick (`) untuk monospace formatting di WhatsApp
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `\`${latencySeconds}\` second`,
    edit: sentMsg.key 
  });
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
 * Help Command - Show detailed help for a specific command
 * Uses helpMenuText template and command settings from database
 */
async function cmdHelpCmd(sock, msg, bot, args, { usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  const { Command } = require('../../../models');
  const { COMMANDS } = require('../commandList');
  
  if (!args.length) {
    const helpText = `📚 *Help Command*

Ketik ${usedPrefix}helpcmd <nama_command> untuk melihat detail command.

Contoh: ${usedPrefix}helpcmd ai
Contoh: ${usedPrefix}helpcmd sticker

Atau ketik ${usedPrefix}menu untuk melihat semua command.`;
    
    await sock.sendMessage(remoteJid, { text: helpText });
    return;
  }
  
  const cmdName = args[0].toLowerCase().replace(usedPrefix, '');
  
  // Find command in master list
  const masterCmd = COMMANDS.find(c => 
    c.name === cmdName || 
    (c.aliases && c.aliases.includes(cmdName))
  );
  
  if (!masterCmd) {
    await sock.sendMessage(remoteJid, { 
      text: `❌ Command *${cmdName}* tidak ditemukan.\n\nKetik ${usedPrefix}menu untuk melihat daftar command.` 
    });
    return;
  }
  
  // Get saved settings from database
  let savedCmd = null;
  try {
    savedCmd = await Command.findOne({
      where: { botId: bot.id, name: masterCmd.name }
    });
  } catch (e) {
    console.error('Error getting command settings:', e.message);
  }
  
  // Use saved description/example if available, otherwise use master
  const description = savedCmd?.description || masterCmd.description || 'Tidak ada deskripsi';
  let example = savedCmd?.example || masterCmd.example || `${usedPrefix}${masterCmd.name}`;
  const category = masterCmd.category || 'General';
  
  // Replace {prefix} in example with actual prefix
  example = example.replace(/\{prefix\}/g, usedPrefix);
  
  // Get help menu template
  const helpTemplate = bot.helpMenuText || '*Command:* {command}\n*Category:* {category}\n*Description:* {description}\n*Example:* {example}';
  
  // Format message
  const helpMsg = formatMsg(helpTemplate, {
    command: `${usedPrefix}${masterCmd.name}`,
    category: category.charAt(0).toUpperCase() + category.slice(1),
    description: description,
    example: example
  });
  
  await sock.sendMessage(remoteJid, { text: helpMsg });
}

/**
 * Premium Menu - Show only premium features
 * 100% sync with website dashboard (exact same logic as Command.jsx)
 */
async function cmdPremium(sock, msg, bot, args, { sender, pushName, usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  // CRITICAL: Try to get fresh data, fallback to bot parameter if fails
  let freshBot = null;
  try {
    freshBot = await getBotData(bot.id);
  } catch (err) {
    console.error('Error getting fresh bot data:', err.message);
  }
  
  // Use fresh data if available, otherwise use bot parameter
  const botData = freshBot || bot;
  
  // Get command list for reference
  const { COMMANDS } = require('../commandList');
  
  try {
    // Parse commandSettings from database
    let commandSettings = {};
    try {
      commandSettings = JSON.parse(botData.commandSettings || '{}');
    } catch (e) {
      commandSettings = {};
    }
    
    console.log('=== PREMIUM COMMAND DEBUG ===');
    console.log('Using fresh data:', freshBot ? 'YES' : 'NO (fallback to cached)');
    console.log('Bot ID:', botData.id);
    console.log('Command settings loaded:', Object.keys(commandSettings).length);
    console.log('CommandSettings JSON length:', botData.commandSettings?.length || 0);
    
    // EXACT SAME LOGIC AS WEBSITE (Command.jsx)
    // For each command in master list, merge with saved settings
    const premiumByCategory = {};
    
    for (const masterCmd of COMMANDS) {
      // Check saved settings by name OR aliases
      let savedSettings = commandSettings[masterCmd.name];
      
      // If not found by name, try aliases
      if (!savedSettings && masterCmd.aliases) {
        for (const alias of masterCmd.aliases) {
          if (commandSettings[alias]) {
            savedSettings = commandSettings[alias];
            console.log(`Found settings for "${masterCmd.name}" via alias "${alias}"`);
            break;
          }
        }
      }
      
      // Merge logic (same as website):
      // premiumOnly: savedSettings?.premiumOnly ?? masterCmd.premiumOnly ?? false
      // active: savedSettings?.enabled ?? true
      const isPremium = savedSettings?.premiumOnly ?? masterCmd.premiumOnly ?? false;
      const isActive = savedSettings?.enabled ?? true;
      
      // Only show if premium AND active
      if (isPremium && isActive) {
        const category = masterCmd.category || 'other';
        
        if (!premiumByCategory[category]) {
          premiumByCategory[category] = [];
        }
        
        premiumByCategory[category].push({
          name: masterCmd.name,
          description: savedSettings?.description || masterCmd.description || ''
        });
      }
    }
    
    // Count total premium commands
    let totalPremium = 0;
    for (const category in premiumByCategory) {
      totalPremium += premiumByCategory[category].length;
    }
    
    console.log('Total premium commands found:', totalPremium);
    console.log('Premium by category:', Object.keys(premiumByCategory).map(cat => `${cat}:${premiumByCategory[cat].length}`).join(', '));
    
    // Build premium menu text
    const vars = getMenuVariables(botData, sender, pushName, usedPrefix);
    const isPremiumUser = await isUserPremium(botData.userId);
    const footer = (isPremiumUser && botData.footerText) ? botData.footerText : (botData.botName || 'Alcateambot');
    
    let menuText = `*⊱ ━━━━━━━━ ⊰*
*• ✦ PREMIUM MENU ✦ •*
*>> Bot Name:* ${botData.botName || 'Bot'} 🏷
*>> Prefix:* ${usedPrefix} 🔧

👑 *Fitur Premium* adalah fitur eksklusif
yang hanya bisa diakses oleh user premium.

Hubungi owner untuk membeli premium!
Ketik: ${usedPrefix}owner

*⊱ ━━━━━━━━ ⊰*\n`;
    
    if (totalPremium === 0) {
      menuText += `\n_Belum ada fitur premium yang diset_\n`;
      menuText += `\n💡 *Tip:* Admin bisa set fitur premium di dashboard\n`;
    } else {
      // Sort categories
      const categoryOrder = ['ai', 'downloader', 'tools', 'games', 'fun', 'search', 'anime', 'maker', 'group', 'trading', 'other'];
      const sortedCategories = Object.keys(premiumByCategory).sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a.toLowerCase());
        const bIndex = categoryOrder.indexOf(b.toLowerCase());
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
      
      for (const category of sortedCategories) {
        const cmds = premiumByCategory[category];
        menuText += `\n*• ✦ ${category.toUpperCase()} ✦ •*\n`;
        for (const cmd of cmds) {
          menuText += `┃ 👑 ${usedPrefix}${cmd.name}\n`;
        }
      }
    }
    
    menuText += `\n*⊱ ━━━━━━━━ ⊰*
*Total:* ${totalPremium} Fitur Premium
*⊱ ━━━━━━━━ ⊰*
_Powered By ${footer}_

✅ *100% Sync dengan Dashboard*`;

    await sock.sendMessage(remoteJid, { text: menuText });
  } catch (err) {
    console.error('Error in cmdPremium:', err);
    await sock.sendMessage(remoteJid, { text: '❌ Error loading premium menu' });
  }
}

/**
 * Cek Premium - Check if user is premium
 */
async function cmdCekPremium(sock, msg, bot, args, { sender, usedPrefix, isGroup, groupMetadata }) {
  const remoteJid = msg.key.remoteJid;
  const { PremiumUser } = require('../../../models');
  const { Op } = require('sequelize');
  
  // Determine target JID and number
  let targetJid = sender;
  let targetNumber = sender.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
  let targetName = 'Kamu';
  let targetLid = null;
  
  // Extract LID if sender is LID
  if (sender.endsWith('@lid')) {
    targetLid = sender.split('@')[0];
  }
  
  // Resolve LID to phone number for sender (if in group)
  if (sender.endsWith('@lid') && isGroup && groupMetadata) {
    const participant = groupMetadata.participants.find(p => {
      if (p.id === sender) return true;
      if (p.lid && p.lid === sender) return true;
      return false;
    });
    
    if (participant && participant.phoneNumber) {
      targetNumber = participant.phoneNumber.split('@')[0].replace(/[^0-9]/g, '');
      console.log('Resolved sender LID to phone number:', targetNumber);
    }
  }
  
  // Check if there's a mention
  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  
  // Check if replying to someone
  const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
  
  if (mentionedJid) {
    targetJid = mentionedJid;
    // Resolve LID to phone number if in group
    if (mentionedJid.endsWith('@lid') && isGroup && groupMetadata) {
      const participant = groupMetadata.participants.find(p => {
        if (p.id === mentionedJid) return true;
        if (p.lid && p.lid === mentionedJid) return true;
        return false;
      });
      
      if (participant && participant.phoneNumber) {
        targetNumber = participant.phoneNumber.split('@')[0].replace(/[^0-9]/g, '');
      } else {
        targetNumber = mentionedJid.split('@')[0].replace(/[^0-9]/g, '');
      }
    } else {
      targetNumber = mentionedJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
    }
    targetName = `@${targetNumber}`;
  } else if (quotedParticipant) {
    targetJid = quotedParticipant;
    // Resolve LID to phone number if in group
    if (quotedParticipant.endsWith('@lid') && isGroup && groupMetadata) {
      const participant = groupMetadata.participants.find(p => {
        if (p.id === quotedParticipant) return true;
        if (p.lid && p.lid === quotedParticipant) return true;
        return false;
      });
      
      if (participant && participant.phoneNumber) {
        targetNumber = participant.phoneNumber.split('@')[0].replace(/[^0-9]/g, '');
      } else {
        targetNumber = quotedParticipant.split('@')[0].replace(/[^0-9]/g, '');
      }
    } else {
      targetNumber = quotedParticipant.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
    }
    targetName = `@${targetNumber}`;
  } else if (args.length > 0) {
    // Check if number provided in args
    const argNumber = args[0].replace(/[^0-9]/g, '');
    if (argNumber.length >= 10) {
      targetNumber = argNumber;
      targetName = targetNumber;
    }
  }
  
  // Clean target number one more time to ensure consistency
  targetNumber = targetNumber.replace(/[^0-9]/g, '');
  
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
    console.log('=== CEKPREMIUM DEBUG ===');
    console.log('Bot ID:', bot.id);
    console.log('Target number (raw):', targetNumber);
    console.log('Target LID:', targetLid);
    console.log('Target JID:', targetJid);
    console.log('Sender (original):', sender);
    
    // Clean target number - remove all non-numeric characters
    targetNumber = targetNumber.replace(/[^0-9]/g, '');
    
    console.log('Target number (cleaned):', targetNumber);
    
    // Query by number OR LID
    const whereClause = {
      botId: bot.id,
      [Op.or]: [
        { number: targetNumber }
      ]
    };
    
    // Add LID to query if available
    if (targetLid) {
      whereClause[Op.or].push({ lid: targetLid });
      console.log('Searching by number OR LID');
    } else {
      console.log('Searching by number only');
    }
    
    premiumUser = await PremiumUser.findOne({ where: whereClause });
    
    console.log('Premium user found:', premiumUser ? 'YES' : 'NO');
    if (premiumUser) {
      console.log('Matched by:', premiumUser.lid === targetLid ? 'LID' : 'Number');
      console.log('Number:', premiumUser.number);
      console.log('LID:', premiumUser.lid);
      console.log('Expired at:', premiumUser.expiredAt);
      console.log('Is expired:', new Date(premiumUser.expiredAt) < new Date());
      
      // Update targetNumber with the correct number from database
      targetNumber = premiumUser.number;
    }
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
  helpcmd: cmdHelpCmd,  // help for specific command
  menucmd: cmdHelpCmd,  // alias for helpcmd
  cmdhelp: cmdHelpCmd,  // alias for helpcmd
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
    
    const OWNER_NUMBER = '6281340078956@s.whatsapp.net';
    const senderNumber = msg.key.remoteJid.endsWith('@g.us') 
      ? msg.key.participant 
      : msg.key.remoteJid;
    const senderName = msg.pushName || senderNumber.split('@')[0];
    const reportText = args.join(' ');
    
    const reportMessage = `📢 *LAPORAN BUG*\n\n👤 *Dari:* ${senderName}\n📱 *Nomor:* ${senderNumber.split('@')[0]}\n📍 *Chat:* ${msg.key.remoteJid}\n\n📝 *Laporan:*\n${reportText}\n\n⏰ *Waktu:* ${new Date().toLocaleString('id-ID')}`;
    
    try {
      await sock.sendMessage(OWNER_NUMBER, { text: reportMessage });
      await sock.sendMessage(msg.key.remoteJid, { text: '✅ Laporan terkirim ke owner!\n\nTerima kasih atas laporanmu.' });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengirim laporan. Coba lagi nanti.' });
    }
  },
  lapor: async (sock, msg, bot, args) => {
    if (!args.length) return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan laporan!\n\nContoh: .lapor bug di fitur x' });
    
    const OWNER_NUMBER = '6281340078956@s.whatsapp.net';
    const senderNumber = msg.key.remoteJid.endsWith('@g.us') 
      ? msg.key.participant 
      : msg.key.remoteJid;
    const senderName = msg.pushName || senderNumber.split('@')[0];
    const reportText = args.join(' ');
    
    const reportMessage = `📢 *LAPORAN BUG*\n\n👤 *Dari:* ${senderName}\n📱 *Nomor:* ${senderNumber.split('@')[0]}\n📍 *Chat:* ${msg.key.remoteJid}\n\n📝 *Laporan:*\n${reportText}\n\n⏰ *Waktu:* ${new Date().toLocaleString('id-ID')}`;
    
    try {
      await sock.sendMessage(OWNER_NUMBER, { text: reportMessage });
      await sock.sendMessage(msg.key.remoteJid, { text: '✅ Laporan terkirim ke owner!\n\nTerima kasih atas laporanmu.' });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengirim laporan. Coba lagi nanti.' });
    }
  },
  request: async (sock, msg, bot, args) => {
    if (!args.length) return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan request!\n\nContoh: .request fitur baru' });
    
    const OWNER_NUMBER = '6281340078956@s.whatsapp.net';
    const senderNumber = msg.key.remoteJid.endsWith('@g.us') 
      ? msg.key.participant 
      : msg.key.remoteJid;
    const senderName = msg.pushName || senderNumber.split('@')[0];
    const requestText = args.join(' ');
    
    const requestMessage = `💡 *REQUEST FITUR*\n\n👤 *Dari:* ${senderName}\n📱 *Nomor:* ${senderNumber.split('@')[0]}\n📍 *Chat:* ${msg.key.remoteJid}\n\n📝 *Request:*\n${requestText}\n\n⏰ *Waktu:* ${new Date().toLocaleString('id-ID')}`;
    
    try {
      await sock.sendMessage(OWNER_NUMBER, { text: requestMessage });
      await sock.sendMessage(msg.key.remoteJid, { text: '✅ Request terkirim ke owner!\n\nTerima kasih atas saranmu.' });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengirim request. Coba lagi nanti.' });
    }
  },
  req: async (sock, msg, bot, args) => {
    if (!args.length) return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan request!\n\nContoh: .req fitur baru' });
    
    const OWNER_NUMBER = '6281340078956@s.whatsapp.net';
    const senderNumber = msg.key.remoteJid.endsWith('@g.us') 
      ? msg.key.participant 
      : msg.key.remoteJid;
    const senderName = msg.pushName || senderNumber.split('@')[0];
    const requestText = args.join(' ');
    
    const requestMessage = `💡 *REQUEST FITUR*\n\n👤 *Dari:* ${senderName}\n📱 *Nomor:* ${senderNumber.split('@')[0]}\n📍 *Chat:* ${msg.key.remoteJid}\n\n📝 *Request:*\n${requestText}\n\n⏰ *Waktu:* ${new Date().toLocaleString('id-ID')}`;
    
    try {
      await sock.sendMessage(OWNER_NUMBER, { text: requestMessage });
      await sock.sendMessage(msg.key.remoteJid, { text: '✅ Request terkirim ke owner!\n\nTerima kasih atas saranmu.' });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengirim request. Coba lagi nanti.' });
    }
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
