const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Webhook = sequelize.define('Webhook', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  events: { type: DataTypes.JSON, defaultValue: ['message.incoming', 'message.status'] },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = Webhook;
