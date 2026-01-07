const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  googleId: { type: DataTypes.STRING, unique: true },
  avatar: { type: DataTypes.STRING },
  apiKey: { type: DataTypes.STRING, unique: true },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  plan: { type: DataTypes.ENUM('free', 'basic', 'premium', 'pro'), defaultValue: 'free' },
  planExpiredAt: { type: DataTypes.DATE },
  quota: { type: DataTypes.INTEGER, defaultValue: 100 },
  usedQuota: { type: DataTypes.INTEGER, defaultValue: 0 },
  emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isBanned: { type: DataTypes.BOOLEAN, defaultValue: false },
  banReason: { type: DataTypes.STRING }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password && !user.googleId) {
        user.password = await bcrypt.hash(user.password, 10);
      }
      user.apiKey = require('uuid').v4();
    }
  }
});

User.prototype.validPassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;
