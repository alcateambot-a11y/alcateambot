const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  invoiceId: { type: DataTypes.STRING, unique: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  plan: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'expired'), defaultValue: 'pending' },
  paymentMethod: { type: DataTypes.STRING },
  paidAt: { type: DataTypes.DATE },
  expiredAt: { type: DataTypes.DATE },
});

module.exports = Invoice;
