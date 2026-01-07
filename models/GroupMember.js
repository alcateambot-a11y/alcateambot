const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GroupMember = sequelize.define('GroupMember', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  groupId: { type: DataTypes.INTEGER, allowNull: false },
  odId: { type: DataTypes.STRING, allowNull: false }, // WhatsApp user JID
  
  // Leveling System
  xp: { type: DataTypes.INTEGER, defaultValue: 0 },
  level: { type: DataTypes.INTEGER, defaultValue: 1 },
  totalMessages: { type: DataTypes.INTEGER, defaultValue: 0 },
  
  // Moderation
  warns: { type: DataTypes.INTEGER, defaultValue: 0 },
  isMuted: { type: DataTypes.BOOLEAN, defaultValue: false },
  mutedUntil: { type: DataTypes.DATE },
  
  // Games Stats
  gamesWon: { type: DataTypes.INTEGER, defaultValue: 0 },
  gamesLost: { type: DataTypes.INTEGER, defaultValue: 0 },
  coins: { type: DataTypes.INTEGER, defaultValue: 100 },
  
  // Profile
  bio: { type: DataTypes.STRING },
  title: { type: DataTypes.STRING }
});

module.exports = GroupMember;
