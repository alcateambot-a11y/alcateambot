const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  deviceId: { type: DataTypes.INTEGER, allowNull: false },
  to: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('text', 'image', 'document', 'button', 'template'), defaultValue: 'text' },
  content: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'sent', 'delivered', 'read', 'failed'), defaultValue: 'pending' },
  messageId: { type: DataTypes.STRING }
});

module.exports = Message;
