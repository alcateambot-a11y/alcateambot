const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PremiumUser = sequelize.define('PremiumUser', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  botId: { type: DataTypes.INTEGER, allowNull: false },
  number: { type: DataTypes.STRING, allowNull: false }, // Nomor user (tanpa @s.whatsapp.net)
  expiredAt: { type: DataTypes.DATE, allowNull: false },
  addedBy: { type: DataTypes.STRING }, // Owner yang menambahkan
  note: { type: DataTypes.STRING }
});

module.exports = PremiumUser;
