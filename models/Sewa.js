const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sewa = sequelize.define('Sewa', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  botId: { type: DataTypes.INTEGER, allowNull: false },
  groupId: { type: DataTypes.STRING, allowNull: false }, // WhatsApp group JID
  groupName: { type: DataTypes.STRING },
  expiredAt: { type: DataTypes.DATE, allowNull: false },
  addedBy: { type: DataTypes.STRING }, // Owner yang menambahkan
  note: { type: DataTypes.STRING }
});

module.exports = Sewa;
