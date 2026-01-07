const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Group = sequelize.define('Group', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  botId: { type: DataTypes.INTEGER, allowNull: false },
  groupId: { type: DataTypes.STRING, allowNull: false }, // WhatsApp group JID
  name: { type: DataTypes.STRING },
  
  // === PROTECTION FEATURES ===
  antiDelete: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiLink: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiLinkNoKick: { type: DataTypes.BOOLEAN, defaultValue: false }, // Warn only, no kick
  antiBadword: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiBadwordNoKick: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiBot: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiWame: { type: DataTypes.BOOLEAN, defaultValue: false }, // Anti wa.me links
  antiWameNoKick: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiLuar: { type: DataTypes.BOOLEAN, defaultValue: false }, // Anti foreign numbers
  antiViewOnce: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiMentionSW: { type: DataTypes.BOOLEAN, defaultValue: false }, // Anti mention status/story
  antiLinkChannel: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiSticker: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiSpam: { type: DataTypes.BOOLEAN, defaultValue: false },
  antiNsfw: { type: DataTypes.BOOLEAN, defaultValue: false },
  
  // === DETECTOR FEATURES ===
  demoteDetector: { type: DataTypes.BOOLEAN, defaultValue: false },
  promoteDetector: { type: DataTypes.BOOLEAN, defaultValue: true },
  
  // === GROUP FEATURES ===
  welcomeEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  leftEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  muteEnabled: { type: DataTypes.BOOLEAN, defaultValue: false }, // Bot muted in group
  selfMode: { type: DataTypes.BOOLEAN, defaultValue: false }, // Only owner can use
  gamesEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  premiumOnly: { type: DataTypes.BOOLEAN, defaultValue: false }, // Only premium users
  levelingEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  
  // === LIMIT SETTINGS ===
  limitType: { type: DataTypes.STRING, defaultValue: 'default' }, // 'default', 'unlimited', 'custom'
  limitAmount: { type: DataTypes.INTEGER, defaultValue: 30 },
  
  // === CUSTOM MESSAGES ===
  welcomeMessage: { type: DataTypes.TEXT },
  leftMessage: { type: DataTypes.TEXT },
  rules: { type: DataTypes.TEXT }, // Group rules
  
  // === PROTECTION SETTINGS ===
  warnMax: { type: DataTypes.INTEGER, defaultValue: 3 },
  muteDuration: { type: DataTypes.INTEGER, defaultValue: 5 }, // minutes
  
  // Badwords list (JSON array)
  badwords: { type: DataTypes.TEXT, defaultValue: '[]' },
  
  // === STATS ===
  totalMembers: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalMessages: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = Group;
