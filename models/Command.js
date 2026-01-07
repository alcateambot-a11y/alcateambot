const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Command = sequelize.define('Command', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  botId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, defaultValue: 'Custom' },
  description: { type: DataTypes.STRING },
  enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = Command;
