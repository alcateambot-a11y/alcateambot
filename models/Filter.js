const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Filter = sequelize.define('Filter', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  botId: { type: DataTypes.INTEGER, allowNull: false },
  trigger: { type: DataTypes.STRING, allowNull: false },
  response: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('exact', 'contains'), defaultValue: 'exact' },
  enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = Filter;
