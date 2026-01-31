/**
 * Bot Constants
 * API URLs, default menu, command metadata
 */

const { COMMANDS } = require('./commandList');

// Generate CMD_META from COMMANDS array
const CMD_META = {};
COMMANDS.forEach(cmd => {
  CMD_META[cmd.name] = {
    cooldown: cmd.cooldown || 3,
    premiumOnly: cmd.premiumOnly || false,
    groupOnly: cmd.groupOnly || false,
    privateOnly: cmd.privateOnly || false,
    adminOnly: cmd.adminOnly || false,
    ownerOnly: cmd.ownerOnly || false,
    botAdminRequired: cmd.botAdminRequired || false
  };
  // Also add aliases
  if (cmd.aliases) {
    cmd.aliases.forEach(alias => {
      CMD_META[alias] = CMD_META[cmd.name];
    });
  }
});

// API Endpoints
const API = {
  // AI
  ai: 'https://api.siputzx.my.id/api/ai/gpt4o?content=',
  gemini: 'https://api.siputzx.my.id/api/ai/gemini-pro?text=',
  
  // Search
  wiki: 'https://id.wikipedia.org/api/rest_v1/page/summary/',
  weather: 'https://api.openweathermap.org/data/2.5/weather?q=',
  
  // Downloader
  tiktok: 'https://api.siputzx.my.id/api/d/tiktok?url=',
  instagram: 'https://api.siputzx.my.id/api/d/igdl?url=',
  pinterest: 'https://api.siputzx.my.id/api/s/pinterest?query=',
  
  // Tools
  qr: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=',
  
  // Anime/Random Images
  waifu: 'https://api.waifu.pics/sfw/waifu',
  neko: 'https://api.waifu.pics/sfw/neko',
  cat: 'https://api.thecatapi.com/v1/images/search',
  dog: 'https://dog.ceo/api/breeds/image/random',
  
  // Fun
  meme: 'https://meme-api.com/gimme',
  quote: 'https://api.quotable.io/random'
};

// Default Menu Template - Auto-generated from COMMANDS
function generateDefaultMenu() {
  const categories = {};
  
  // Group commands by category
  COMMANDS.forEach(cmd => {
    const cat = cmd.category.toUpperCase();
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(cmd.name);
  });
  
  // Category display order and emoji
  const categoryOrder = [
    { key: 'INFO', emoji: '📋', name: 'INFO' },
    { key: 'AI', emoji: '🤖', name: 'AI' },
    { key: 'SEARCH', emoji: '🔍', name: 'SEARCH' },
    { key: 'DOWNLOADER', emoji: '📥', name: 'DOWNLOADER' },
    { key: 'TOOLS', emoji: '🛠️', name: 'TOOLS' },
    { key: 'FUN', emoji: '🎉', name: 'FUN' },
    { key: 'GAME', emoji: '🎮', name: 'GAMES' },
    { key: 'ANIME', emoji: '🎌', name: 'ANIME' },
    { key: 'RANDOM', emoji: '🎲', name: 'RANDOM' },
    { key: 'GROUP', emoji: '👥', name: 'GROUP' },
    { key: 'OWNER', emoji: '👑', name: 'OWNER' },
    { key: 'MAKER', emoji: '🎨', name: 'MAKER' },
    { key: 'TRADING', emoji: '📈', name: 'TRADING' }
  ];
  
  // Track which categories have been displayed
  const displayedCategories = new Set();
  
  let menu = `*⊱ ━━━━━━━━ ⊰*
*• ✦ ABOUT ✦ •*
*>> Tanggal:* {tanggal} 📅
*>> Hari:* {hari} 🗓
*>> Waktu:* {ucapan} ⏰
*>> Bot Name:* {namebot} 🏷
*>> Prefix:* {prefix} 🔧
`;

  // Display categories in order
  categoryOrder.forEach(({ key, emoji, name }) => {
    const cmds = categories[key];
    if (cmds && cmds.length > 0) {
      displayedCategories.add(key);
      menu += `
*⊱ ━━━━━━━━ ⊰*
*• ${emoji} ${name} (${cmds.length}) •*
`;
      cmds.forEach(cmd => {
        menu += `┃ ◈ {prefix}${cmd}\n`;
      });
    }
  });
  
  // Display any remaining categories not in categoryOrder (for future-proofing)
  Object.keys(categories).forEach(key => {
    if (!displayedCategories.has(key)) {
      const cmds = categories[key];
      if (cmds && cmds.length > 0) {
        menu += `
*⊱ ━━━━━━━━ ⊰*
*• ✨ ${key} (${cmds.length}) •*
`;
        cmds.forEach(cmd => {
          menu += `┃ ◈ {prefix}${cmd}\n`;
        });
      }
    }
  });
  
  menu += `
*⊱ ━━━━━━━━ ⊰*
*Total:* ${COMMANDS.length} Commands
*⊱ ━━━━━━━━ ⊰*
_Powered By {footer}_`;

  return menu;
}

const DEFAULT_MENU = generateDefaultMenu();

module.exports = {
  API,
  DEFAULT_MENU,
  CMD_META,
  COMMANDS
};
