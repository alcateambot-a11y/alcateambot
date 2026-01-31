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
const { getMentionName } = require('./bot/utils');

// ==================== CACHING SYSTEM - OPTIMIZED ====================
// Filter cache for auto-reply
const filtersCache = new Map();
const FILTERS_CACHE_TTL = 300000; // 5 menit (dari 60 detik)

async function getCachedFilters(botId) {
  const cached = filtersCache.get(botId);
  
  if (cached && (Date.now() - cached.time) < FILTERS_CACHE_TTL) {
    return cached.data;
  }
  
  const filters = await Filter.findAll({ where: { botId, enabled: true } });
  filtersCache.set(botId, { data: filters, time: Date.now() });
  return filters;
}

// Function to invalidate filter cache
function invalidateFiltersCache(botId) {
  filtersCache.delete(botId);
}

// Helper function to get group settings using raw SQL (avoid Sequelize cache issues)
// With in-memory cache for performance
const groupSettingsCache = new Map();
const GROUP_SETTINGS_CACHE_TTL = 180000; // 3 menit (dari 30 detik) - lebih lama untuk reduce DB query

async function getGroupSettings(botId, groupId) {
  const cacheKey = `${botId}_${groupId}`;
  const cached = groupSettingsCache.get(cacheKey);
  
  // Return cached if still valid
  if (cached && (Date.now() - cached.time) < GROUP_SETTINGS_CACHE_TTL) {
    return cached.data;
  }
  
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
  
  // Cache the result
  groupSettingsCache.set(cacheKey, { data: results[0], time: Date.now() });
  
  return results[0];
}

// Function to invalidate group settings cache (call after updates)
function invalidateGroupSettingsCache(botId, groupId) {
  const cacheKey = `${botId}_${groupId}`;
  groupSettingsCache.delete(cacheKey);
}

// Helper function to update group settings
async function updateGroupSettings(botId, groupId, updates) {
  const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), botId, groupId];
  
  await sequelize.query(
    `UPDATE Groups SET ${setClauses}, updatedAt = datetime('now') WHERE botId = ? AND groupId = ?`,
    { replacements: values }
  );
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
  
  // Get sender number for fallback
  const senderNumber = senderJid.split('@')[0].split(':')[0];
  const senderClean = senderNumber.replace(/[^0-9]/g, '');
  
  // Helper function to get mention name (pushName or number)
  const getMention = () => getMentionName(groupMetadata, senderJid, senderClean);
  
  const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
  const botNumber = botJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
  const isBotAdmin = groupMetadata?.participants?.some(p => {
    if (p.admin !== 'admin' && p.admin !== 'superadmin') return false;
    
    // Direct match
    if (p.id === botJid) return true;
    
    // Match by phoneNumber field (most reliable for LID format)
    if (p.phoneNumber) {
      const pPhoneNumber = p.phoneNumber.split('@')[0].replace(/[^0-9]/g, '');
      if (pPhoneNumber === botNumber) return true;
    }
    
    // Match by phone number extracted from ID
    const pNumber = p.id.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
    if (pNumber === botNumber) return true;
    
    return false;
  });
  
  // === BLACKLIST AUTO-KICK ===
  // Check if sender is in blacklist - kick them automatically
  try {
    let blacklist = [];
    try {
      blacklist = JSON.parse(groupSettings.blacklist || '[]');
    } catch (e) {}
    
    if (blacklist.length > 0) {
      const senderClean = senderNumber.replace(/[^0-9]/g, '');
      
      // Check if sender is in blacklist
      let isBlacklisted = false;
      for (const blNumber of blacklist) {
        const blClean = blNumber.replace(/[^0-9]/g, '');
        
        // Check various formats
        if (blClean === senderClean || 
            blClean.endsWith(senderClean) || 
            senderClean.endsWith(blClean) ||
            '62' + blClean.replace(/^0/, '') === senderClean ||
            '62' + senderClean.replace(/^0/, '') === blClean) {
          isBlacklisted = true;
          break;
        }
      }
      
      if (isBlacklisted && isBotAdmin) {
        console.log('BLACKLIST AUTO-KICK triggered for:', senderJid, '| number:', senderNumber);
        
        try {
          // Delete the message first
          await sock.sendMessage(remoteJid, { delete: msg.key });
        } catch (e) {
          console.error('Failed to delete blacklisted user message:', e.message);
        }
        
        try {
          // Kick the blacklisted user
          await sock.groupParticipantsUpdate(remoteJid, [senderJid], 'remove');
          await sock.sendMessage(remoteJid, {
            text: `🚫 @${getMention()} telah di-kick karena masuk daftar blacklist!`,
            mentions: [senderJid]
          });
        } catch (e) {
          console.error('Failed to kick blacklisted user:', e.message);
        }
        
        return true; // Block message processing
      }
    }
  } catch (blErr) {
    console.error('Error checking blacklist:', blErr.message);
  }
  
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
          text: `⚠️ @${getMention()} jangan kirim link di grup ini!`,
          mentions: [senderJid]
        });
      } else if (isBotAdmin) {
        // Kick
        try {
          await sock.groupParticipantsUpdate(remoteJid, [senderJid], 'remove');
          await sock.sendMessage(remoteJid, {
            text: `🚫 @${getMention()} dikick karena mengirim link!`,
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
          text: `⚠️ @${getMention()} jangan kirim link wa.me di grup ini!`,
          mentions: [senderJid]
        });
      } else if (isBotAdmin) {
        try {
          await sock.groupParticipantsUpdate(remoteJid, [senderJid], 'remove');
          await sock.sendMessage(remoteJid, {
            text: `🚫 @${getMention()} dikick karena mengirim link wa.me!`,
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
        text: `⚠️ @${getMention()} jangan kirim link channel di grup ini!`,
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
          text: `⚠️ @${getMention()} jangan menggunakan kata kasar!`,
          mentions: [senderJid]
        });
      } else if (isBotAdmin) {
        try {
          await sock.groupParticipantsUpdate(remoteJid, [senderJid], 'remove');
          await sock.sendMessage(remoteJid, {
            text: `🚫 @${getMention()} dikick karena kata kasar!`,
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
      text: `⚠️ @${getMention()} sticker tidak diperbolehkan di grup ini!`,
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
        text: `⚠️ @${getMention()} view once message tidak diperbolehkan di grup ini!`,
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
async function checkAntiSpam(sock, msg, bot, groupSettings, senderJid, groupMetadata) {
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
    
    const senderNumber = senderJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
    const mentionName = getMentionName(groupMetadata, senderJid, senderNumber);
    
    // Reset counter
    tracker.count = 0;
    
    await sock.sendMessage(remoteJid, {
      text: `⚠️ @${mentionName} terdeteksi spam! Harap jangan spam.`,
      mentions: [senderJid]
    });
    
    return true;
  }
  
  return false;
}

// Load commands ONCE at startup (not every message!)
let cachedCommands = null;
let commandsLoadedAt = 0;
const COMMANDS_CACHE_TTL = 10000; // Reload every 10 seconds (faster for development)

function getCommands() {
  const now = Date.now();
  
  // Return cached if still valid
  if (cachedCommands && (now - commandsLoadedAt) < COMMANDS_CACHE_TTL) {
    return cachedCommands;
  }
  
  // Clear cache and reload
  const commandsPath = require.resolve('./bot/commands');
  delete require.cache[commandsPath];
  
  Object.keys(require.cache).forEach(key => {
    if (key.includes('services/bot/commands') || key.includes('services\\bot\\commands')) {
      delete require.cache[key];
    }
  });
  
  cachedCommands = require('./bot/commands');
  commandsLoadedAt = now;
  // Only log on first load or reload
  if (!cachedCommands._logged) {
    console.log('Commands loaded:', Object.keys(cachedCommands).length);
    cachedCommands._logged = true;
  }
  return cachedCommands;
}

// Preload commands at startup
getCommands();

// Function to get utils (cached)
let cachedUtils = null;
function getUtils() {
  if (!cachedUtils) {
    cachedUtils = require('./bot/utils');
  }
  return cachedUtils;
}

// Global group metadata cache
const groupMetadataCache = new Map();
const GROUP_METADATA_CACHE_TTL = 120000; // 2 minutes

async function getCachedGroupMetadata(sock, groupId) {
  const cached = groupMetadataCache.get(groupId);
  
  if (cached && (Date.now() - cached.time) < GROUP_METADATA_CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const metadata = await sock.groupMetadata(groupId);
    groupMetadataCache.set(groupId, { data: metadata, time: Date.now() });
    return metadata;
  } catch (e) {
    // Return cached even if expired, better than nothing
    return cached?.data || null;
  }
}

// Invalidate group metadata cache
function invalidateGroupMetadataCache(groupId) {
  groupMetadataCache.delete(groupId);
}

/**
 * Handle incoming message
 */
async function handleMessage(sock, msg, bot) {
  // Get cached modules (fast!)
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
    
    // Use global cached groupMetadata (much faster!)
    const getGroupMeta = async () => {
      if (!isGroup) return null;
      return await getCachedGroupMetadata(sock, remoteJid);
    };
    
    // Get real phone number from sender
    // WhatsApp now uses LID format in groups (e.g., 129897209057458@lid)
    let senderPhone = sender;
    
    // IMPORTANT: Resolve LID to phone number
    if (sender.endsWith('@lid')) {
      if (isGroup) {
        // In group: resolve from groupMetadata
        try {
          const groupMeta = await getGroupMeta();
          const participant = groupMeta?.participants?.find(p => p.id === sender);
          
          if (participant && participant.phoneNumber) {
            senderPhone = participant.phoneNumber;
            console.log('Resolved LID to phone in group:', senderPhone);
          } else {
            console.warn('Cannot resolve LID in group:', sender);
          }
        } catch (e) {
          console.error('Error resolving LID in group:', e.message);
        }
      } else {
        // In PC: LID should not happen, but if it does, we need to resolve it
        console.warn('LID detected in PC:', sender);
        console.warn('remoteJid is also LID:', remoteJid);
        
        // Try to get phone from bot's contact list or use LID as fallback
        // For now, we'll use the LID and let cmdCekPremium handle validation
        senderPhone = sender;
        
        // Log for debugging
        console.log('⚠️  Cannot resolve LID in PC - using LID as sender');
        console.log('User should use .cekpremium with phone number argument');
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
      return;
    }
    
    // Debug: Log extracted text for groups
    if (isGroup && text) {
      console.log('Group message text:', text.substring(0, 50));
    }
    
    if (!text || typeof text !== 'string') text = '';
    
    // === GROUP PROTECTION CHECK ===
    // Check protection rules BEFORE processing commands (for groups only)
    if (isGroup) {
      try {
        const groupSettings = await getGroupSettings(bot.id, remoteJid);
        const groupMetadata = await getGroupMeta();
        
        // === AFK SYSTEM ===
        // 1. Check if sender is AFK and sending a message (exit AFK mode)
        let afkUsers = [];
        try {
          afkUsers = JSON.parse(groupSettings.afkUsers || '[]');
        } catch (e) {
          afkUsers = [];
        }
        
        let senderNumber = senderPhone.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
        const senderAfkIndex = afkUsers.findIndex(u => u.number === senderNumber);
        
        if (senderAfkIndex !== -1) {
          // User is AFK and sending a message - exit AFK mode
          const afkData = afkUsers[senderAfkIndex];
          const afkDuration = Date.now() - afkData.time;
          const hours = Math.floor(afkDuration / 3600000);
          const minutes = Math.floor((afkDuration % 3600000) / 60000);
          
          afkUsers.splice(senderAfkIndex, 1);
          await updateGroupSettings(bot.id, remoteJid, { afkUsers: JSON.stringify(afkUsers) });
          
          const mentionName = getMentionName(groupMetadata, sender, senderNumber);
          await sock.sendMessage(remoteJid, {
            text: `✅ @${mentionName} sudah tidak AFK lagi!\n\nDurasi AFK: ${hours}j ${minutes}m\nAlasan: ${afkData.reason}`,
            mentions: [sender]
          });
        }
        
        // 2. Check if message mentions AFK users (delete mention and notify)
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentioned?.length && afkUsers.length > 0) {
          const afkMentioned = [];
          
          for (const mentionedJid of mentioned) {
            const mentionedNumber = mentionedJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
            const afkUser = afkUsers.find(u => u.number === mentionedNumber);
            
            if (afkUser) {
              afkMentioned.push(afkUser);
            }
          }
          
          if (afkMentioned.length > 0) {
            // Delete the message with mention
            try {
              await sock.sendMessage(remoteJid, { delete: msg.key });
            } catch (e) {
              console.error('Failed to delete mention message:', e.message);
            }
            
            // Notify about AFK users
            let notifyText = '⚠️ *USER SEDANG AFK*\n\n';
            for (const afkUser of afkMentioned) {
              const afkDuration = Date.now() - afkUser.time;
              const hours = Math.floor(afkDuration / 3600000);
              const minutes = Math.floor((afkDuration % 3600000) / 60000);
              
              notifyText += `• @${afkUser.number}\n`;
              notifyText += `  Alasan: ${afkUser.reason}\n`;
              notifyText += `  Sejak: ${hours}j ${minutes}m yang lalu\n\n`;
            }
            notifyText += '❌ Mention otomatis dihapus!';
            
            await sock.sendMessage(remoteJid, {
              text: notifyText,
              mentions: afkMentioned.map(u => u.jid)
            });
            
            return; // Stop processing this message
          }
        }
        
        // Check anti-spam first
        const isSpam = await checkAntiSpam(sock, msg, bot, groupSettings, sender, groupMetadata);
        if (isSpam) return;
        
        // Check other protections (antilink, antibadword, etc.)
        const isBlocked = await checkGroupProtection(sock, msg, bot, groupSettings, groupMetadata, sender, text, messageType);
        if (isBlocked) return;
        
      } catch (e) {}
    }
    
    // Check prefix
    const prefix = bot.prefix || '!';
    const prefixType = bot.prefixType || 'single';
    
    // Debug: Log prefix settings
    if (isGroup && text) {
      console.log('Prefix check:', { prefix, prefixType, textStart: text.substring(0, 5) });
    }
    
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
    
    // Check filters first (auto-reply) - with caching
    const filters = await getCachedFilters(bot.id);
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
      
      if (!commands[cmd]) {
        return;
      }
      
      // Verify command is a function
      if (typeof commands[cmd] !== 'function') {
        return;
      }
      
      // Get command metadata
      const meta = CMD_META[cmd] || { cooldown: 3 };
      
      // Get group info if in group (use cached metadata)
      let isAdmin = false;
      let isBotAdmin = false;
      let groupMetadata = null;
      
      if (isGroup) {
        try {
          groupMetadata = await getGroupMeta();
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
          
          // Check if bot is admin - handle both regular and LID format
          const botNumber = botJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
          
          isBotAdmin = groupMetadata?.participants?.some(p => {
            if (p.admin !== 'admin' && p.admin !== 'superadmin') return false;
            
            // Direct match with bot JID
            if (p.id === botJid) return true;
            
            // Match by phoneNumber field (most reliable for LID format)
            if (p.phoneNumber) {
              const pPhoneNumber = p.phoneNumber.split('@')[0].replace(/[^0-9]/g, '');
              if (pPhoneNumber === botNumber) return true;
            }
            
            // Match by phone number extracted from ID
            const pNumber = p.id.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
            if (pNumber === botNumber) return true;
            
            // Match with lid field
            if (p.lid) {
              const lidNumber = p.lid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
              if (lidNumber === botNumber) return true;
            }
            
            return false;
          }) || false;
          
        } catch (err) {}
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
      
      // Check premium status
      let isPremium = isOwner; // Owner selalu dianggap premium
      if (!isPremium) {
        try {
          console.log('=== PREMIUM CHECK DEBUG ===');
          console.log('Bot ID:', bot.id);
          console.log('Sender:', sender);
          console.log('Sender Phone:', senderPhone);
          console.log('Sender Number:', senderNumber);
          console.log('Is Group:', isGroup);
          
          // Extract LID if sender is LID
          const senderLid = sender.endsWith('@lid') ? sender.split('@')[0] : null;
          console.log('Sender LID:', senderLid);
          
          // Query by number OR LID
          const { Op } = require('sequelize');
          const whereClause = {
            botId: bot.id,
            [Op.or]: [
              { number: senderNumber }
            ]
          };
          
          // Add LID to query if available
          if (senderLid) {
            whereClause[Op.or].push({ lid: senderLid });
            console.log('Searching premium by number OR LID');
          } else {
            console.log('Searching premium by number only');
          }
          
          const premiumUser = await PremiumUser.findOne({ where: whereClause });
          
          console.log('Premium user found:', premiumUser ? 'YES' : 'NO');
          if (premiumUser) {
            console.log('Matched by:', premiumUser.lid === senderLid ? 'LID' : 'Number');
            console.log('Number:', premiumUser.number);
            console.log('LID:', premiumUser.lid);
            console.log('Expired at:', premiumUser.expiredAt);
            console.log('Is expired:', new Date(premiumUser.expiredAt) < new Date());
          }
          
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
    const { id, participants, action, author } = update;
    const { formatMsg } = getUtils();
    
    console.log('handleGroupUpdate - action:', action, 'participants:', JSON.stringify(participants));
    
    // Normalize participants - can be array of strings or array of objects
    const normalizedParticipants = participants.map(p => {
      if (typeof p === 'string') {
        return { id: p, phoneNumber: null };
      }
      return p;
    });
    
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
    
    // Helper function to get phone number from participant
    const getPhoneNumber = (participant) => {
      // If phoneNumber field exists, use it
      if (participant.phoneNumber) {
        return participant.phoneNumber.split('@')[0].replace(/[^0-9]/g, '');
      }
      // Otherwise try to extract from id
      if (participant.id && !participant.id.endsWith('@lid')) {
        return participant.id.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
      }
      // For LID, try to find in group metadata
      if (groupMetadata && participant.id) {
        const found = groupMetadata.participants.find(p => p.id === participant.id || p.lid === participant.id);
        if (found) {
          if (found.id && !found.id.endsWith('@lid')) {
            return found.id.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
          }
          if (found.phoneNumber) {
            return found.phoneNumber.replace(/[^0-9]/g, '');
          }
        }
      }
      return participant.id?.split('@')[0].replace(/[^0-9]/g, '') || '';
    };
    
    // Helper to get JID for mentions
    const getJid = (participant) => {
      if (participant.phoneNumber) {
        return participant.phoneNumber.includes('@') ? participant.phoneNumber : participant.phoneNumber + '@s.whatsapp.net';
      }
      return participant.id;
    };
    
    if (action === 'add') {
      // Check group settings first, then bot settings
      const welcomeEnabled = groupSettings?.welcomeEnabled ?? bot.welcomeEnabled;
      
      if (welcomeEnabled) {
        for (const participant of normalizedParticipants) {
          try {
            const phoneNumber = getPhoneNumber(participant);
            const jid = getJid(participant);
            
            // Use group welcome message if set, otherwise use bot default
            const welcomeTemplate = groupSettings?.welcomeMessage || bot.welcomeTextMessage || 'Welcome @{user} to {group}!';
            const welcomeText = formatMsg(welcomeTemplate, {
              user: phoneNumber,
              group: groupName,
              pushname: phoneNumber
            });
            
            await sock.sendMessage(id, { 
              text: welcomeText, 
              mentions: [jid] 
            });
          } catch (err) {
            console.error('Error sending welcome:', err.message);
          }
        }
      }
    }
    
    if (action === 'remove') {
      // === WHITELIST PROTECTION ===
      try {
        if (groupSettings && groupSettings.whitelistEnabled) {
          let whitelist = [];
          let blacklist = [];
          try {
            whitelist = JSON.parse(groupSettings.whitelist || '[]');
            blacklist = JSON.parse(groupSettings.blacklist || '[]');
          } catch (e) {}
          
          console.log('WHITELIST CHECK - whitelist:', whitelist);
          
          // Check if any kicked participant is in whitelist
          for (const participant of normalizedParticipants) {
            const kickedNumber = getPhoneNumber(participant);
            console.log('WHITELIST CHECK - kickedNumber:', kickedNumber);
            
            // Check if this number is in whitelist
            let isWhitelisted = false;
            let matchedNumber = '';
            
            for (const wlNumber of whitelist) {
              const wlClean = wlNumber.replace(/[^0-9]/g, '');
              const kickedClean = kickedNumber.replace(/[^0-9]/g, '');
              
              // Check various formats
              if (wlClean === kickedClean || 
                  wlClean.endsWith(kickedClean) || 
                  kickedClean.endsWith(wlClean) ||
                  '62' + wlClean.replace(/^0/, '') === kickedClean ||
                  '62' + kickedClean.replace(/^0/, '') === wlClean) {
                isWhitelisted = true;
                matchedNumber = wlNumber;
                break;
              }
            }
            
            console.log('WHITELIST CHECK - isWhitelisted:', isWhitelisted, 'matchedNumber:', matchedNumber);
            
            if (isWhitelisted) {
              console.log('WHITELIST PROTECTION TRIGGERED!');
              
              // Get author (who kicked) info
              let authorNumber = '';
              if (author) {
                // Try to resolve author's phone number
                if (author.endsWith('@lid') && groupMetadata) {
                  const authorParticipant = groupMetadata.participants.find(p => p.id === author || p.lid === author);
                  if (authorParticipant) {
                    if (authorParticipant.id && !authorParticipant.id.endsWith('@lid')) {
                      authorNumber = authorParticipant.id.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
                    } else if (authorParticipant.phoneNumber) {
                      authorNumber = authorParticipant.phoneNumber.replace(/[^0-9]/g, '');
                    }
                  }
                } else {
                  authorNumber = author.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
                }
              }
              
              console.log('Author (kicker):', authorNumber);
              
              // Check if author is in whitelist (whitelisted admins can kick each other)
              const authorInWhitelist = whitelist.some(wl => {
                const wlClean = wl.replace(/[^0-9]/g, '');
                return wlClean === authorNumber || 
                       wlClean.endsWith(authorNumber) || 
                       authorNumber.endsWith(wlClean);
              });
              
              // Check if author is bot owner
              let owners = [];
              try {
                owners = JSON.parse(bot.owners || '[]');
              } catch (e) {}
              const authorIsOwner = owners.some(o => {
                const ownerNum = (o.number || '').replace(/[^0-9]/g, '');
                return ownerNum === authorNumber;
              });
              
              console.log('Author in whitelist:', authorInWhitelist, 'Author is owner:', authorIsOwner);
              
              // Check if bot is admin - need to handle LID format
              const botNumber = sock.user?.id?.split(':')[0]?.replace(/[^0-9]/g, '');
              console.log('Bot number:', botNumber);
              console.log('Group participants:', JSON.stringify(groupMetadata?.participants?.map(p => ({ id: p.id, admin: p.admin, phoneNumber: p.phoneNumber })), null, 2));
              
              let isBotAdmin = false;
              if (groupMetadata?.participants) {
                for (const p of groupMetadata.participants) {
                  if (p.admin !== 'admin' && p.admin !== 'superadmin') continue;
                  
                  // Check various formats
                  const pNumber = p.id?.split('@')[0]?.split(':')[0]?.replace(/[^0-9]/g, '');
                  const pPhone = p.phoneNumber?.split('@')[0]?.replace(/[^0-9]/g, '');
                  
                  if (pNumber === botNumber || pPhone === botNumber) {
                    isBotAdmin = true;
                    break;
                  }
                }
              }
              
              console.log('Bot is admin:', isBotAdmin);
              
              if (isBotAdmin) {
                // Send warning message
                await sock.sendMessage(id, {
                  text: `⚠️ *WHITELIST PROTECTION*\n\n${matchedNumber} adalah member yang dilindungi (whitelist) dan telah di-kick!\n\nBot akan menambahkan kembali...`
                });
                
                // Add back the whitelisted member
                const addJid = matchedNumber.startsWith('62') 
                  ? matchedNumber + '@s.whatsapp.net'
                  : '62' + matchedNumber.replace(/^0/, '') + '@s.whatsapp.net';
                
                try {
                  await sock.groupParticipantsUpdate(id, [addJid], 'add');
                  await sock.sendMessage(id, {
                    text: `✅ ${matchedNumber} telah ditambahkan kembali ke grup.`
                  });
                  
                  // If author is not in whitelist and not owner, kick them and add to blacklist
                  if (authorNumber && !authorInWhitelist && !authorIsOwner) {
                    const authorJid = authorNumber.startsWith('62')
                      ? authorNumber + '@s.whatsapp.net'
                      : '62' + authorNumber.replace(/^0/, '') + '@s.whatsapp.net';
                    
                    try {
                      // Add to blacklist
                      if (!blacklist.includes(authorNumber)) {
                        blacklist.push(authorNumber);
                        await updateGroupSettings(bot.id, id, { blacklist: JSON.stringify(blacklist) });
                      }
                      
                      // Kick the kicker
                      await sock.groupParticipantsUpdate(id, [authorJid], 'remove');
                      await sock.sendMessage(id, {
                        text: `🚫 ${authorNumber} telah di-kick dan masuk blacklist karena kick member whitelist!`
                      });
                    } catch (kickErr) {
                      console.error('Failed to kick author:', kickErr.message);
                    }
                  }
                } catch (addErr) {
                  console.error('Failed to add back whitelisted member:', addErr.message);
                  await sock.sendMessage(id, {
                    text: `❌ Gagal menambahkan kembali ${matchedNumber}. Error: ${addErr.message}`
                  });
                }
              }
            }
          }
        }
      } catch (wlErr) {
        console.error('Error in whitelist protection:', wlErr.message);
      }
      
      // Send goodbye message
      const leftEnabled = groupSettings?.leftEnabled ?? bot.leftEnabled;
      
      if (leftEnabled) {
        for (const participant of normalizedParticipants) {
          try {
            const phoneNumber = getPhoneNumber(participant);
            const jid = getJid(participant);
            
            const leftTemplate = groupSettings?.leftMessage || bot.leftTextMessage || 'Goodbye @{user} 👋';
            const leftText = formatMsg(leftTemplate, {
              user: phoneNumber,
              group: groupName,
              pushname: phoneNumber
            });
            
            await sock.sendMessage(id, { 
              text: leftText, 
              mentions: [jid] 
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
  getGroupSettings,
  // Cache invalidation functions
  invalidateGroupSettingsCache,
  invalidateFiltersCache,
  invalidateGroupMetadataCache,
  // Export cache maps untuk monitoring
  filtersCache,
  groupSettingsCache
};
