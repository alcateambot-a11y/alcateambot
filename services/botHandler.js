/**
 * Bot Handler
 * Main handler untuk memproses pesan masuk
 * 
 * Struktur file sudah dirapikan:
 * - services/bot/commands/  → Semua command handlers
 * - services/bot/utils.js   → Helper functions
 * - services/bot/constants.js → API URLs, default menu
 * - services/bot/data.js    → Static data (truth, dare, jokes, dll)
 */

const { Filter, PremiumUser, Sewa } = require('../models');
const { CMD_META } = require('./bot/constants');
const { sequelize } = require('../config/database');

// Helper function to get group settings using raw SQL (avoid Sequelize cache issues)
async function getGroupSettings(botId, groupId) {
  let [results] = await sequelize.query(
    `SELECT * FROM Groups WHERE botId = ? AND groupId = ? LIMIT 1`,
    { replacements: [botId, groupId] }
  );
  
  if (!results[0]) {
    await sequelize.query(
      `INSERT INTO Groups (botId, groupId, createdAt, updatedAt) VALUES (?, ?, datetime('now'), datetime('now'))`,
      { replacements: [botId, groupId] }
    );
    
    [results] = await sequelize.query(
      `SELECT * FROM Groups WHERE botId = ? AND groupId = ? LIMIT 1`,
      { replacements: [botId, groupId] }
    );
  }
  
  return results[0];
}

// ==================== GROUP PROTECTION LOGIC ====================

// Link patterns for antilink
const LINK_PATTERNS = [
  /chat\.whatsapp\.com\/[A-Za-z0-9]+/gi,  // WhatsApp group links
  /wa\.me\/[0-9]+/gi,                      // wa.me links (for antiwame)
  /https?:\/\/[^\s]+/gi,                   // General URLs
  /t\.me\/[A-Za-z0-9_]+/gi,               // Telegram links
  /discord\.gg\/[A-Za-z0-9]+/gi,          // Discord links
];

// Channel link pattern
const CHANNEL_LINK_PATTERN = /whatsapp\.com\/channel\/[A-Za-z0-9]+/gi;

// Default badwords (Indonesian)
const DEFAULT_BADWORDS = [
  'anjing', 'bangsat', 'babi', 'kontol', 'memek', 'ngentot', 'pepek',
  'tolol', 'goblok', 'bodoh', 'idiot', 'bajingan', 'keparat', 'asu',
  'jancok', 'cok', 'pantek', 'puki', 'kimak', 'lancau', 'setan'
];

/**
 * Check if sender is admin in group
 */
function isParticipantAdmin(groupMetadata, senderJid) {
  if (!groupMetadata || !groupMetadata.participants) return false;
  
  for (const p of groupMetadata.participants) {
    const isAdmin = p.admin === 'admin' || p.admin === 'superadmin';
    if (!isAdmin) continue;
    
    // Direct match
    if (p.id === senderJid) return true;
    // LID match
    if (p.lid && p.lid === senderJid) return true;
  }
  return false;
}

/**
 * Check group protection rules and take action if violated
 * Returns true if message should be blocked (protection triggered)
 */
async function checkGroupProtection(sock, msg, bot, groupSettings, groupMetadata, senderJid, text, messageType) {
  if (!groupSettings) return false;
  
  const remoteJid = msg.key.remoteJid;
  const isAdmin = isParticipantAdmin(groupMetadata, senderJid);
  
  // Admin bypass - admins are not affected by protection
  if (isAdmin) return false;
  
  // Check if bot is admin (required for kick actions)
  const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
  const isBotAdmin = groupMetadata?.participants?.some(p => 
    p.id === botJid && (p.admin === 'admin' || p.admin === 'superadmin')
  );
  
  const senderNumber = senderJid.split('@')[0].split(':')[0];
  
  // === ANTILINK ===
  if (groupSettings.antiLink && text) {
    // Check for WhatsApp group links (exclude own group link)
    const hasGroupLink = /chat\.whatsapp\.com\/[A-Za-z0-9]+/gi.test(text);
    const hasTelegramLink = /t\.me\/[A-Za-z0-9_]+/gi.test(text);
    const hasDiscordLink = /discord\.gg\/[A-Za-z0-9]+/gi.test(text);
    
    if (hasGroupLink || hasTelegramLink || hasDiscordLink) {
      console.log('ANTILINK triggered for:', senderJid);
      
      // Delete message
      try {
        await sock.sendMessage(remoteJid, { delete: msg.key });
      } catch (e) {
        console.error('Failed to delete message:', e.message);
      }
      
      // Warn or kick
      if (groupSettings.antiLinkNoKick) {
        // Warn only
        await sock.sendMessage(remoteJid, {
          text: `⚠️ @${senderNumber} jangan kirim link di grup ini!`,
          mentions: [senderJid]
        });
      } else if (isBotAdmin) {
        // Kick
        try {
          await sock.groupParticipantsUpdate(remoteJid, [senderJid], 'remove');
          await sock.sendMessage(remoteJid, {
            text: `🚫 @${senderNumber} dikick karena mengirim link!`,
            mentions: [senderJid]
          });
        } catch (e) {
          console.error('Failed to kick:', e.message);
        }
      }
      return true;
    }
  }
  
  // === ANTIWAME ===
  if (groupSettings.antiWame && text) {
    const hasWameLink = /wa\.me\/[0-9]+/gi.test(text);
    
    if (hasWameLink) {
      console.log('ANTIWAME triggered for:', senderJid);
      
      try {
        await sock.sendMessage(remoteJid, { delete: msg.key });
      } catch (e) {}
      
      if (groupSettings.antiWameNoKick) {
        await sock.sendMessage(remoteJid, {
          text: `⚠️ @${senderNumber} jangan kirim link wa.me di grup ini!`,
          mentions: [senderJid]
        });
      } else if (isBotAdmin) {
        try {
          await sock.groupParticipantsUpdate(remoteJid, [senderJid], 'remove');
          await sock.sendMessage(remoteJid, {
            text: `🚫 @${senderNumber} dikick karena mengirim link wa.me!`,
            mentions: [senderJid]
          });
        } catch (e) {}
      }
      return true;
    }
  }
  
  // === ANTILINKCHANNEL ===
  if (groupSettings.antiLinkChannel && text) {
    const hasChannelLink = CHANNEL_LINK_PATTERN.test(text);
    
    if (hasChannelLink) {
      console.log('ANTILINKCHANNEL triggered for:', senderJid);
      
      try {
        await sock.sendMessage(remoteJid, { delete: msg.key });
      } catch (e) {}
      
      await sock.sendMessage(remoteJid, {
        text: `⚠️ @${senderNumber} jangan kirim link channel di grup ini!`,
        mentions: [senderJid]
      });
      return true;
    }
  }
  
  // === ANTIBADWORD ===
  if (groupSettings.antiBadword && text) {
    // Get custom badwords or use default
    let badwords = DEFAULT_BADWORDS;
    try {
      const customBadwords = JSON.parse(groupSettings.badwords || '[]');
      if (customBadwords.length > 0) {
        badwords = [...DEFAULT_BADWORDS, ...customBadwords];
      }
    } catch (e) {}
    
    const textLower = text.toLowerCase();
    const foundBadword = badwords.find(word => textLower.includes(word.toLowerCase()));
    
    if (foundBadword) {
      console.log('ANTIBADWORD triggered for:', senderJid, '- word:', foundBadword);
      
      try {
        await sock.sendMessage(remoteJid, { delete: msg.key });
      } catch (e) {}
      
      if (groupSettings.antiBadwordNoKick) {
        await sock.sendMessage(remoteJid, {
          text: `⚠️ @${senderNumber} jangan menggunakan kata kasar!`,
          mentions: [senderJid]
        });
      } else if (isBotAdmin) {
        try {
          await sock.groupParticipantsUpdate(remoteJid, [senderJid], 'remove');
          await sock.sendMessage(remoteJid, {
            text: `🚫 @${senderNumber} dikick karena kata kasar!`,
            mentions: [senderJid]
          });
        } catch (e) {}
      }
      return true;
    }
  }
  
  // === ANTISTICKER ===
  if (groupSettings.antiSticker && messageType === 'stickerMessage') {
    console.log('ANTISTICKER triggered for:', senderJid);
    
    try {
      await sock.sendMessage(remoteJid, { delete: msg.key });
    } catch (e) {}
    
    await sock.sendMessage(remoteJid, {
      text: `⚠️ @${senderNumber} sticker tidak diperbolehkan di grup ini!`,
      mentions: [senderJid]
    });
    return true;
  }
  
  // === ANTIVIEWONCE ===
  if (groupSettings.antiViewOnce) {
    const isViewOnce = msg.message?.viewOnceMessage || 
                       msg.message?.viewOnceMessageV2 ||
                       msg.message?.imageMessage?.viewOnce ||
                       msg.message?.videoMessage?.viewOnce;
    
    if (isViewOnce) {
      console.log('ANTIVIEWONCE triggered for:', senderJid);
      
      await sock.sendMessage(remoteJid, {
        text: `⚠️ @${senderNumber} view once message tidak diperbolehkan di grup ini!`,
        mentions: [senderJid]
      });
      // Note: Can't delete view once, just warn
      return true;
    }
  }
  
  // === ANTILUAR (Anti foreign numbers - non-Indonesian) ===
  if (groupSettings.antiLuar) {
    // Check if sender is not Indonesian number (not starting with 62)
    const cleanNumber = senderNumber.replace(/[^0-9]/g, '');
    if (!cleanNumber.startsWith('62')) {
      console.log('ANTILUAR triggered for:', senderJid);
      
      if (isBotAdmin) {
        try {
          await sock.groupParticipantsUpdate(remoteJid, [senderJid], 'remove');
          await sock.sendMessage(remoteJid, {
            text: `🚫 Nomor luar negeri (+${cleanNumber.substring(0, 2)}) tidak diperbolehkan di grup ini!`
          });
        } catch (e) {}
      }
      return true;
    }
  }
  
  return false;
}

// Spam tracking
const spamTracker = new Map(); // Map<groupId_senderId, { count, lastTime }>

/**
 * Check for spam (multiple messages in short time)
 */
async function checkAntiSpam(sock, msg, bot, groupSettings, senderJid) {
  if (!groupSettings || !groupSettings.antiSpam) return false;
  
  const remoteJid = msg.key.remoteJid;
  const key = `${remoteJid}_${senderJid}`;
  const now = Date.now();
  const SPAM_THRESHOLD = 5; // 5 messages
  const SPAM_WINDOW = 5000; // in 5 seconds
  
  let tracker = spamTracker.get(key);
  
  if (!tracker) {
    tracker = { count: 1, lastTime: now };
    spamTracker.set(key, tracker);
    return false;
  }
  
  // Reset if outside window
  if (now - tracker.lastTime > SPAM_WINDOW) {
    tracker.count = 1;
    tracker.lastTime = now;
    return false;
  }
  
  tracker.count++;
  tracker.lastTime = now;
  
  if (tracker.count >= SPAM_THRESHOLD) {
    console.log('ANTISPAM triggered for:', senderJid);
    
    const senderNumber = senderJid.split('@')[0].split(':')[0];
    
    // Reset counter
    tracker.count = 0;
    
    await sock.sendMessage(remoteJid, {
      text: `⚠️ @${senderNumber} terdeteksi spam! Harap jangan spam.`,
      mentions: [senderJid]
    });
    
    return true;
  }
  
  return false;
}

// Load commands directly (no caching issues)
function getCommands() {
  // Always require fresh to avoid cache issues
  const commandsPath = require.resolve('./bot/commands');
  delete require.cache[commandsPath];
  
  // Also clear cache for all command files
  Object.keys(require.cache).forEach(key => {
    if (key.includes('services/bot/commands') || key.includes('services\\bot\\commands')) {
      delete require.cache[key];
    }
  });
  
  const commands = require('./bot/commands');
  console.log('Commands loaded:', Object.keys(commands).length);
  return commands;
}

// Function to get utils
function getUtils() {
  return require('./bot/utils');
}

/**
 * Handle incoming message
 */
async function handleMessage(sock, msg, bot) {
  // Get fresh modules
  const commands = getCommands();
  const { checkCooldown, formatMsg } = getUtils();
  
  // Wrap everything in try-catch to prevent crashes
  let remoteJid, sender, text;
  
  try {
    if (!msg || !msg.key || !msg.message) return;
    
    remoteJid = msg.key.remoteJid;
    if (!remoteJid) return;
    
    sender = msg.key.participant || msg.key.remoteJid || '';
    const pushName = msg.pushName || 'User';
    const isGroup = remoteJid.endsWith('@g.us');
    
    // Get real phone number from sender
    // WhatsApp now uses LID format in groups (e.g., 129897209057458@lid)
    // We need to get the actual phone number from participant's phoneNumber field
    let senderPhone = sender;
    if (sender.endsWith('@lid') && isGroup) {
      try {
        // Try to get phone number from group metadata
        const groupMeta = await sock.groupMetadata(remoteJid);
        const participant = groupMeta.participants.find(p => p.id === sender);
        
        if (participant && participant.phoneNumber) {
          // Use the participant's phoneNumber field
          senderPhone = participant.phoneNumber;
          console.log('LID resolved:', sender, '->', senderPhone);
        } else {
          console.log('Could not resolve LID - participant:', participant ? 'found but no phoneNumber' : 'not found');
        }
      } catch (e) {
        console.log('Could not resolve LID:', e.message);
      }
    }
    
    // Get message text safely
    const messageType = Object.keys(msg.message || {})[0];
    text = '';
    
    try {
      if (messageType === 'conversation') {
        text = msg.message.conversation || '';
      } else if (messageType === 'extendedTextMessage') {
        text = msg.message.extendedTextMessage?.text || '';
      } else if (messageType === 'imageMessage') {
        text = msg.message.imageMessage?.caption || '';
      } else if (messageType === 'videoMessage') {
        text = msg.message.videoMessage?.caption || '';
      }
    } catch (e) {
      console.error('Error extracting text:', e.message);
      return;
    }
    
    if (!text || typeof text !== 'string') text = '';
    
    console.log('Message from', sender, ':', text.substring(0, 50));
    
    // === GROUP PROTECTION CHECK ===
    // Check protection rules BEFORE processing commands (for groups only)
    if (isGroup) {
      try {
        const groupSettings = await getGroupSettings(bot.id, remoteJid);
        let groupMetadata = null;
        
        try {
          groupMetadata = await sock.groupMetadata(remoteJid);
        } catch (e) {}
        
        // Check anti-spam first
        const isSpam = await checkAntiSpam(sock, msg, bot, groupSettings, sender);
        if (isSpam) return;
        
        // Check other protections (antilink, antibadword, etc.)
        const isBlocked = await checkGroupProtection(sock, msg, bot, groupSettings, groupMetadata, sender, text, messageType);
        if (isBlocked) return;
        
      } catch (e) {
        console.error('Error checking group protection:', e.message);
      }
    }
    
    // Check prefix
    const prefix = bot.prefix || '!';
    const prefixType = bot.prefixType || 'single';
    
    let usedPrefix = '';
    let isCommand = false;
    
    if (prefixType === 'multi') {
      const prefixes = ['.', '!', '#', '/', '\\'];
      for (const p of prefixes) {
        if (text.startsWith(p)) {
          usedPrefix = p;
          isCommand = true;
          break;
        }
      }
    } else if (prefixType === 'empty') {
      usedPrefix = '';
      isCommand = true;
    } else {
      if (text.startsWith(prefix)) {
        usedPrefix = prefix;
        isCommand = true;
      }
    }
    
    // Check filters first (auto-reply)
    const filters = await Filter.findAll({ where: { botId: bot.id, enabled: true } });
    for (const filter of filters) {
      const trigger = filter.trigger.toLowerCase();
      const msgLower = text.toLowerCase();
      
      if (filter.type === 'exact' && msgLower === trigger) {
        await sock.sendMessage(remoteJid, { text: filter.response });
        return;
      } else if (filter.type === 'contains' && msgLower.includes(trigger)) {
        await sock.sendMessage(remoteJid, { text: filter.response });
        return;
      }
    }
    
    // Process command
    if (isCommand) {
      const withoutPrefix = text.slice(usedPrefix.length).trim();
      const [cmdName, ...args] = withoutPrefix.split(/\s+/);
      const cmd = cmdName.toLowerCase();
      
      console.log('Command:', cmd, 'Args:', args);
      
      // Check if command exists
      console.log('Available commands sample:', Object.keys(commands).slice(0, 5));
      console.log('Looking for command:', cmd, '| exists:', !!commands[cmd]);
      console.log('Command type:', typeof commands[cmd]);
      console.log('Commands object keys count:', Object.keys(commands).length);
      
      if (!commands[cmd]) {
        console.log('Command not found:', cmd);
        return;
      }
      
      // Verify command is a function
      if (typeof commands[cmd] !== 'function') {
        console.log('Command exists but is not a function:', cmd, typeof commands[cmd]);
        return;
      }
      
      // Get command metadata
      const meta = CMD_META[cmd] || { cooldown: 3 };
      
      // Get group info if in group
      let isAdmin = false;
      let isBotAdmin = false;
      let groupMetadata = null;
      
      if (isGroup) {
        try {
          groupMetadata = await sock.groupMetadata(remoteJid);
          const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
          
          // Check if sender is admin - handle both LID and regular format
          // WhatsApp sekarang menggunakan format LID (xxx@lid) di group
          // Kita perlu mencocokkan dengan berbagai cara:
          // 1. Direct match dengan sender ID
          // 2. Match dengan lid field jika ada
          // 3. Match dengan phone number jika sender sudah di-resolve
          
          for (const p of groupMetadata.participants) {
            const pAdmin = p.admin === 'admin' || p.admin === 'superadmin';
            if (!pAdmin) continue;
            
            // Direct match dengan sender
            if (p.id === sender) {
              isAdmin = true;
              break;
            }
            
            // Match dengan lid field
            if (p.lid && p.lid === sender) {
              isAdmin = true;
              break;
            }
            
            // Match dengan phone number (jika sender sudah di-resolve dari LID)
            if (senderPhone !== sender) {
              // senderPhone sudah di-resolve, coba cocokkan dengan participant ID
              const pNumber = p.id.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
              const sNumber = senderPhone.replace(/[^0-9]/g, '');
              if (pNumber === sNumber) {
                isAdmin = true;
                break;
              }
            }
          }
          
          // Check if bot is admin
          isBotAdmin = groupMetadata.participants.some(p => 
            p.id === botJid && (p.admin === 'admin' || p.admin === 'superadmin')
          );
          
          console.log('Group check - sender:', sender, '| senderPhone:', senderPhone, '| isAdmin:', isAdmin, '| isBotAdmin:', isBotAdmin);
        } catch (err) {
          console.error('Error getting group metadata:', err.message);
        }
      }
      
      // Check owner - use senderPhone (resolved from LID if needed)
      let owners = [];
      try {
        owners = JSON.parse(bot.owners || '[]');
      } catch (e) {
        owners = [];
      }
      
      // Extract sender number - handle various formats:
      // - 6283174020347@s.whatsapp.net (private chat)
      // - 6283174020347:123@s.whatsapp.net (group with device ID)
      // - Use senderPhone which is already resolved from LID
      let senderNumber = senderPhone.split('@')[0];
      if (senderNumber.includes(':')) {
        senderNumber = senderNumber.split(':')[0];
      }
      senderNumber = senderNumber.replace(/[^0-9]/g, '');
      
      const isOwner = owners.some(o => {
        const ownerNumber = (o.number || '').replace(/[^0-9]/g, '');
        return ownerNumber === senderNumber;
      });
      
      console.log('Owner check - senderPhone:', senderPhone, '-> number:', senderNumber, '| owners:', owners.map(o => o.number), '| isOwner:', isOwner);
      
      // Check premium status
      let isPremium = isOwner; // Owner selalu dianggap premium
      if (!isPremium) {
        try {
          const premiumUser = await PremiumUser.findOne({
            where: { botId: bot.id, number: senderNumber }
          });
          if (premiumUser && new Date(premiumUser.expiredAt) > new Date()) {
            isPremium = true;
          }
        } catch (e) {
          console.error('Error checking premium:', e.message);
        }
      }
      
      // Check sewa status (untuk group)
      let isSewa = false;
      if (isGroup) {
        try {
          const sewa = await Sewa.findOne({
            where: { botId: bot.id, groupId: remoteJid }
          });
          if (sewa && new Date(sewa.expiredAt) > new Date()) {
            isSewa = true;
          }
        } catch (e) {
          console.error('Error checking sewa:', e.message);
        }
      }
      
      // Get command settings from bot
      let commandSettings = {};
      try {
        commandSettings = JSON.parse(bot.commandSettings || '{}');
      } catch (e) {
        commandSettings = {};
      }
      const cmdSettings = commandSettings[cmd] || {};
      
      // === PERMISSION CHECKS WITH CUSTOM MESSAGES ===
      
      // Check: Group Only
      if (meta.groupOnly && !isGroup) {
        const msg = formatMsg(bot.onlyGroupMessage || 'Perintah ini hanya bisa digunakan di group', { prefix: usedPrefix });
        await sock.sendMessage(remoteJid, { text: msg });
        return;
      }
      
      // Check: Private Only
      if (meta.privateOnly && isGroup) {
        const msg = formatMsg(bot.onlyPMMessage || 'Perintah ini hanya bisa digunakan di private chat', { prefix: usedPrefix });
        await sock.sendMessage(remoteJid, { text: msg });
        return;
      }
      
      // Check: Admin Only
      if (meta.adminOnly && isGroup && !isAdmin && !isOwner) {
        const msg = formatMsg(bot.groupAdminMessage || 'Perintah ini hanya bisa digunakan oleh Admin Grup', { prefix: usedPrefix });
        await sock.sendMessage(remoteJid, { text: msg });
        return;
      }
      
      // Check: Bot must be Admin
      if (meta.botAdminRequired && isGroup && !isBotAdmin) {
        const msg = formatMsg(bot.botAdminMessage || 'Bot harus menjadi admin', { prefix: usedPrefix });
        await sock.sendMessage(remoteJid, { text: msg });
        return;
      }
      
      // Check: Owner Only
      if (meta.ownerOnly && !isOwner) {
        const msg = formatMsg(bot.onlyOwnerMessage || 'Perintah ini hanya dapat digunakan oleh owner bot', { prefix: usedPrefix });
        await sock.sendMessage(remoteJid, { text: msg });
        return;
      }
      
      // Check: Premium Only (from CMD_META or command settings)
      const isPremiumCommand = meta.premiumOnly || cmdSettings.premiumOnly;
      if (isPremiumCommand && !isPremium) {
        const msg = formatMsg(bot.onlyPremMessage || 'Perintah ini khusus member premium\n\n> ketik premium untuk membeli premium', { prefix: usedPrefix });
        await sock.sendMessage(remoteJid, { text: msg });
        return;
      }
      
      // Check: Sewa Only (from command settings, only in group)
      if (cmdSettings.sewaOnly && isGroup && !isSewa && !isOwner) {
        const msg = formatMsg(bot.onlySewaMessage || 'Perintah ini khusus group sewa', { prefix: usedPrefix });
        await sock.sendMessage(remoteJid, { text: msg });
        return;
      }
      
      // Check: Group Mute (bot tidak merespon di grup yang di-mute, kecuali owner atau command mute)
      if (isGroup && cmd !== 'mute' && cmd !== 'mutegc') {
        try {
          const groupSettings = await getGroupSettings(bot.id, remoteJid);
          if (groupSettings && groupSettings.muteEnabled && !isOwner) {
            console.log('Group is muted, ignoring command:', cmd);
            return; // Silent ignore - don't respond
          }
        } catch (e) {
          console.error('Error checking group mute:', e.message);
        }
      }
      
      // Check cooldown
      const cooldownRemaining = checkCooldown(bot.id, sender, cmd, meta.cooldown);
      
      if (cooldownRemaining > 0) {
        const cooldownMsg = formatMsg(bot.cooldownMessage || 'Tunggu {detik} detik lagi', { detik: cooldownRemaining });
        await sock.sendMessage(remoteJid, { text: cooldownMsg });
        return;
      }
      
      // Execute command with timeout protection
      try {
        // Send wait message for heavy commands
        const heavyCommands = ['play', 'p', 'tiktok', 'tt', 'ig', 'instagram', 'pinterest', 'pin', 'tebakgambar', 'tg'];
        if (heavyCommands.includes(cmd) && bot.waitMessage) {
          await sock.sendMessage(remoteJid, { text: bot.waitMessage });
        }
        
        // Set timeout for command execution (120 seconds for download commands, 30 for others)
        const downloadCommands = ['play', 'p', 'tiktok', 'tt', 'ig', 'instagram'];
        const timeoutMs = downloadCommands.includes(cmd) ? 120000 : 30000;
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Command timeout')), timeoutMs)
        );
        
        // Debug: Check if command function exists
        console.log('Executing command:', cmd);
        console.log('Command function type:', typeof commands[cmd]);
        
        if (typeof commands[cmd] !== 'function') {
          console.error('Command is not a function!', cmd, commands[cmd]);
          return;
        }
        
        const commandPromise = commands[cmd](sock, msg, bot, args, {
          sender: senderPhone, // Use resolved phone number instead of LID
          senderLid: sender, // Keep original LID if needed
          pushName,
          usedPrefix,
          isGroup,
          isAdmin,
          isBotAdmin,
          isOwner,
          isPremium,
          isSewa,
          groupMetadata
        });
        
        await Promise.race([commandPromise, timeoutPromise]);
        console.log('Command executed successfully:', cmd);
      } catch (err) {
        console.error('Error executing command:', cmd);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        try {
          // Check if timeout
          if (err.message === 'Command timeout') {
            const timeoutMsg = formatMsg(bot.timeoutMessage || '*Timeout, silahkan coba lagi*', {});
            await sock.sendMessage(remoteJid, { text: timeoutMsg });
          } else {
            const errorMsg = formatMsg(bot.errorMessage || 'Terjadi error: {error}', { error: err.message });
            await sock.sendMessage(remoteJid, { text: errorMsg });
          }
        } catch (e) {
          console.error('Failed to send error message:', e.message);
        }
      }
    }
  } catch (err) {
    console.error('Error in handleMessage:', err.message);
    console.error('Stack:', err.stack);
    // Don't rethrow - prevent crash
  }
}

/**
 * Handle group participant updates (welcome/left)
 */
async function handleGroupUpdate(sock, update, bot) {
  try {
    const { id, participants, action } = update;
    const { formatMsg } = getUtils();
    
    // Get group metadata once for all actions
    let groupMetadata = null;
    try {
      groupMetadata = await sock.groupMetadata(id);
    } catch (err) {
      console.error('Error getting group metadata:', err.message);
    }
    
    const groupName = groupMetadata?.subject || 'Group';
    
    // Get group settings from database
    let groupSettings = null;
    try {
      groupSettings = await getGroupSettings(bot.id, id);
    } catch (err) {
      console.error('Error getting group settings:', err.message);
    }
    
    // Check if group is muted - don't send any messages
    if (groupSettings && groupSettings.muteEnabled) {
      console.log('Group is muted, skipping welcome/left messages');
      return;
    }
    
    if (action === 'add') {
      // Check group settings first, then bot settings
      const welcomeEnabled = groupSettings?.welcomeEnabled ?? bot.welcomeEnabled;
      
      if (welcomeEnabled) {
        for (const participant of participants) {
          try {
            // Use group welcome message if set, otherwise use bot default
            const welcomeTemplate = groupSettings?.welcomeMessage || bot.welcomeTextMessage || 'Welcome @{user} to {group}!';
            const welcomeText = formatMsg(welcomeTemplate, {
              user: participant.split('@')[0],
              group: groupName,
              pushname: participant.split('@')[0]
            });
            
            await sock.sendMessage(id, { 
              text: welcomeText, 
              mentions: [participant] 
            });
          } catch (err) {
            console.error('Error sending welcome:', err.message);
          }
        }
      }
    }
    
    if (action === 'remove') {
      // Check group settings first, then bot settings
      const leftEnabled = groupSettings?.leftEnabled ?? bot.leftEnabled;
      
      if (leftEnabled) {
        for (const participant of participants) {
          try {
            // Use group left message if set, otherwise use bot default
            const leftTemplate = groupSettings?.leftMessage || bot.leftTextMessage || 'Goodbye @{user} 👋';
            const leftText = formatMsg(leftTemplate, {
              user: participant.split('@')[0],
              group: groupName,
              pushname: participant.split('@')[0]
            });
            
            await sock.sendMessage(id, { 
              text: leftText, 
              mentions: [participant] 
            });
          } catch (err) {
            console.error('Error sending left message:', err.message);
          }
        }
      }
    }
    
    if (action === 'promote') {
      // Check group settings for promote detector
      const promoteDetector = groupSettings?.promoteDetector ?? true;
      
      if (promoteDetector && bot.promoteTextMessage) {
        for (const participant of participants) {
          try {
            const promoteText = formatMsg(bot.promoteTextMessage, {
              sender: participant.split('@')[0],
              author: 'Admin',
              group: groupName,
              user: participant.split('@')[0]
            });
            
            await sock.sendMessage(id, { 
              text: promoteText, 
              mentions: [participant] 
            });
          } catch (err) {
            console.error('Error sending promote message:', err.message);
          }
        }
      }
    }
    
    if (action === 'demote') {
      // Check group settings for demote detector
      const demoteDetector = groupSettings?.demoteDetector ?? false;
      
      if (demoteDetector && bot.demoteTextMessage) {
        for (const participant of participants) {
          try {
            const demoteText = formatMsg(bot.demoteTextMessage, {
              sender: participant.split('@')[0],
              author: 'Admin',
              group: groupName,
              user: participant.split('@')[0]
            });
            
            await sock.sendMessage(id, { 
              text: demoteText, 
              mentions: [participant] 
            });
          } catch (err) {
            console.error('Error sending demote message:', err.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error in handleGroupUpdate:', err);
  }
}

module.exports = {
  handleMessage,
  handleGroupUpdate,
  getGroupSettings
};
