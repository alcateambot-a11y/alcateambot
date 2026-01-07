/**
 * Bot Utility Functions
 * Helper functions untuk bot handler
 */

const { User, Bot } = require('../../models');

const userCooldowns = new Map();
const startTime = Date.now();

/**
 * Check apakah sender adalah owner bot
 * Note: This function may not work correctly with LID format in groups
 * The botHandler should resolve LID to phone number before calling commands
 */
function checkOwner(bot, sender) {
  try {
    const owners = JSON.parse(bot.owners || '[]');
    // Handle format: 6283174020347:45@s.whatsapp.net (group with device ID)
    // Also handle LID format: 129897209057458@lid (but this won't match - need resolution first)
    let senderNumber = sender.split('@')[0];
    if (senderNumber.includes(':')) {
      senderNumber = senderNumber.split(':')[0];
    }
    senderNumber = senderNumber.replace(/\D/g, '');
    
    const result = owners.some(o => (o.number || '').replace(/\D/g, '') === senderNumber);
    console.log('checkOwner - sender:', sender, '-> number:', senderNumber, '| result:', result);
    return result;
  } catch {
    return false;
  }
}

/**
 * Get fresh bot data from database
 * @param {number} botId - Bot ID
 * @returns {Promise<Object|null>} Bot data or null
 */
async function getBotData(botId) {
  try {
    console.log('getBotData called with botId:', botId);
    const bot = await Bot.findByPk(botId);
    if (bot) {
      console.log('getBotData result - footerText:', bot.footerText);
    }
    return bot ? bot.toJSON() : null;
  } catch (err) {
    console.error('Error getting bot data:', err.message);
    return null;
  }
}

/**
 * Get user data from database (fresh data)
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User data or null
 */
async function getUserData(userId) {
  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'plan', 'planExpiredAt', 'quota', 'usedQuota', 'role']
    });
    return user ? user.toJSON() : null;
  } catch (err) {
    console.error('Error getting user data:', err.message);
    return null;
  }
}

/**
 * Check if user plan is premium/pro (fresh from DB)
 * @param {number} userId - User ID
 * @returns {Promise<boolean>}
 */
async function isUserPremium(userId) {
  const user = await getUserData(userId);
  if (!user) return false;
  
  // Check plan
  if (user.plan !== 'premium' && user.plan !== 'pro') return false;
  
  // Check expiry
  if (user.planExpiredAt && new Date(user.planExpiredAt) < new Date()) return false;
  
  return true;
}

/**
 * Get user plan info (fresh from DB)
 * @param {number} userId - User ID
 * @returns {Promise<Object>}
 */
async function getUserPlanInfo(userId) {
  console.log('getUserPlanInfo called with userId:', userId);
  
  const user = await getUserData(userId);
  console.log('User data from DB:', user);
  
  if (!user) {
    console.log('User not found, returning free plan');
    return { plan: 'free', expired: false, expiredAt: null, quota: 0, usedQuota: 0 };
  }
  
  const expired = user.planExpiredAt && new Date(user.planExpiredAt) < new Date();
  
  const result = {
    plan: expired ? 'free' : (user.plan || 'free'),
    expired,
    expiredAt: user.planExpiredAt,
    quota: user.quota || 0,
    usedQuota: user.usedQuota || 0
  };
  
  console.log('getUserPlanInfo result:', result);
  return result;
}

/**
 * Check cooldown command
 * @returns {number} Sisa detik cooldown, 0 jika tidak ada cooldown
 */
function checkCooldown(botId, sender, cmd, seconds) {
  const key = `${botId}_${sender}_${cmd}`;
  const now = Date.now();
  
  if (userCooldowns.has(key)) {
    const remaining = Math.ceil((seconds * 1000 - (now - userCooldowns.get(key))) / 1000);
    if (remaining > 0) return remaining;
  }
  
  userCooldowns.set(key, now);
  return 0;
}

/**
 * Format message dengan placeholder
 * @example formatMsg("Halo {name}!", { name: "Budi" }) => "Halo Budi!"
 */
function formatMsg(msg, data = {}) {
  let result = msg || '';
  Object.keys(data).forEach(key => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), data[key]);
  });
  return result;
}

/**
 * Get variabel untuk menu
 */
function getMenuVariables(bot, sender, pushName, usedPrefix) {
  const now = new Date();
  const hour = now.getHours();
  
  let ucapan = 'Selamat Pagi';
  if (hour >= 12 && hour < 15) ucapan = 'Selamat Siang';
  else if (hour >= 15 && hour < 18) ucapan = 'Selamat Sore';
  else if (hour >= 18 || hour < 5) ucapan = 'Selamat Malam';
  
  return {
    pushname: pushName || 'User',
    prefix: usedPrefix || bot.prefix || '.',
    namebot: bot.botName || 'Bot',
    ucapan
  };
}

/**
 * Get random item dari array
 */
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get uptime bot
 */
function getUptime() {
  const uptime = Date.now() - startTime;
  const seconds = Math.floor(uptime / 1000) % 60;
  const minutes = Math.floor(uptime / (1000 * 60)) % 60;
  const hours = Math.floor(uptime / (1000 * 60 * 60)) % 24;
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
  
  return { days, hours, minutes, seconds };
}

/**
 * Format uptime ke string
 */
function formatUptime() {
  const { days, hours, minutes, seconds } = getUptime();
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
  userCooldowns,
  startTime,
  checkOwner,
  checkCooldown,
  formatMsg,
  getMenuVariables,
  getRandom,
  getUptime,
  formatUptime,
  getBotData,
  getUserData,
  isUserPremium,
  getUserPlanInfo
};
