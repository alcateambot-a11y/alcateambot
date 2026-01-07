const { User } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    if (!apiKey) return res.status(401).json({ error: 'API Key tidak ditemukan' });
    
    const user = await User.findOne({ where: { apiKey } });
    if (!user) return res.status(401).json({ error: 'API Key tidak valid' });
    
    if (user.usedQuota >= user.quota) {
      return res.status(429).json({ error: 'Quota habis, silakan upgrade paket' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Autentikasi gagal' });
  }
};
