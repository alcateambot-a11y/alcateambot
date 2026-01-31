/**
 * Selfbot Handler
 * Handler khusus untuk selfbot mode dengan command terbatas
 * Hanya support: downloader, tools, search, fun
 */

const { Bot } = require('../models');

// Import command modules (hanya yang diizinkan untuk selfbot)
const downloaderCommands = require('./bot/commands/downloader');
const toolsCommands = require('./bot/commands/tools');
const searchCommands = require('./bot/commands/search');
const funCommands = require('./bot/commands/fun');

// Gabungkan semua command yang diizinkan
const SELFBOT_COMMANDS = {
  ...downloaderCommands,
  ...toolsCommands,
  ...searchCommands,
  ...funCommands
};

// Whitelist command untuk selfbot
const ALLOWED_COMMANDS = [
  // Downloader
  'play', 'p', 'tiktok', 'tt', 'instagram', 'ig', 'facebook', 'fb',
  'twitter', 'tw', 'ytmp3', 'ytmp4', 'pinterest', 'pin',
  
  // Tools
  'sticker', 's', 'toimg', 'qr', 'tts', 'ssweb', 'ss',
  
  // Search
  'google', 'g', 'wiki', 'translate', 'tr', 'image', 'img',
  
  // Fun
  'quote', 'meme', 'jokes'
];

console.log('Selfbot commands loaded:', Object.keys(SELFBOT_COMMANDS).length);

/**
 * Handle message for selfbot
 */
async function handleSelfbotMessage(sock, msg, bot) {
  try {
    // Skip if message from self (prevent loop)
    if (msg.key.fromMe) return;
    
    // Get message text
    const messageType = Object.keys(msg.message || {})[0];
    if (!messageType) return;
    
    let text = '';
    if (messageType === 'conversation') {
      text = msg.message.conversation;
    } else if (messageType === 'extendedTextMessage') {
      text = msg.message.extendedTextMessage.text;
    } else if (messageType === 'imageMessage' && msg.message.imageMessage.caption) {
      text = msg.message.imageMessage.caption;
    } else if (messageType === 'videoMessage' && msg.message.videoMessage.caption) {
      text = msg.message.videoMessage.caption;
    }
    
    if (!text) return;
    
    // Check prefix
    const prefix = bot.prefix || '.';
    if (!text.startsWith(prefix)) return;
    
    // Parse command
    const withoutPrefix = text.slice(prefix.length).trim();
    const [cmdName, ...args] = withoutPrefix.split(/\s+/);
    const cmd = cmdName.toLowerCase();
    
    // Check if command allowed for selfbot
    if (!ALLOWED_COMMANDS.includes(cmd)) {
      return; // Silent ignore - tidak ada response untuk command yang tidak diizinkan
    }
    
    // Check if command exists
    if (!SELFBOT_COMMANDS[cmd]) {
      return;
    }
    
    // Verify command is a function
    if (typeof SELFBOT_COMMANDS[cmd] !== 'function') {
      return;
    }
    
    console.log(`[SELFBOT ${bot.id}] Executing command: ${cmd}`);
    
    // Execute command
    const remoteJid = msg.key.remoteJid;
    const isGroup = remoteJid?.endsWith('@g.us');
    
    // Basic context for selfbot
    const context = {
      isGroup,
      isAdmin: false, // Selfbot tidak perlu admin check
      isBotAdmin: false,
      isOwner: true, // User adalah owner dari selfbot sendiri
      isPremium: true, // Selfbot user dianggap premium
      isSewa: false
    };
    
    try {
      await SELFBOT_COMMANDS[cmd](sock, msg, bot, args, context);
      console.log(`[SELFBOT ${bot.id}] Command executed: ${cmd}`);
    } catch (cmdErr) {
      console.error(`[SELFBOT ${bot.id}] Command error:`, cmdErr.message);
      // Silent fail - tidak kirim error message
    }
    
  } catch (err) {
    console.error('[SELFBOT] Handler error:', err.message);
  }
}

module.exports = {
  handleSelfbotMessage,
  ALLOWED_COMMANDS
};
