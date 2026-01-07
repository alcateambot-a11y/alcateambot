const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Device = sequelize.define('Device', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('disconnected', 'connecting', 'connected'), defaultValue: 'disconnected' },
  sessionData: { type: DataTypes.TEXT('long') }
});

module.exports = Device;
