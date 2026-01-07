const express = require('express');
const auth = require('../middleware/auth');
const { User, Bot, Invoice } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// Admin middleware - check if user is admin
const adminOnly = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak. Admin only.' });
  }
  next();
};

router.use(auth);
router.use(adminOnly);

// ==================== DASHBOARD STATS ====================
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalBots = await Bot.count();
    const activeUsers = await User.count({ where: { plan: { [Op.ne]: 'free' } } });
    const connectedBots = await Bot.count({ where: { status: 'connected' } });
    
    // Users by plan
    const freeUsers = await User.count({ where: { plan: 'free' } });
    const premiumUsers = await User.count({ where: { plan: 'premium' } });
    const proUsers = await User.count({ where: { plan: 'pro' } });
    
    // Recent stats (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.count({ where: { createdAt: { [Op.gte]: weekAgo } } });
    
    // Revenue from invoices
    const paidInvoices = await Invoice.findAll({ where: { status: 'paid' } });
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    const pendingInvoices = await Invoice.count({ where: { status: 'pending' } });
    
    res.json({
      totalUsers,
      totalBots,
      activeUsers,
      connectedBots,
      freeUsers,
      premiumUsers,
      proUsers,
      newUsersThisWeek,
      totalRevenue,
      pendingInvoices
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== USER MANAGEMENT ====================
router.get('/users', async (req, res) => {
  try {
    const { search, plan, status, page = 1, limit = 20 } = req.query;
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    if (plan && plan !== 'all') where.plan = plan;
    if (status === 'banned') where.isBanned = true;
    if (status === 'active') where.isBanned = false;
    
    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      users: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    
    const bots = await Bot.findAll({ where: { userId: user.id } });
    const invoices = await Invoice.findAll({ 
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    res.json({ user, bots, invoices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    
    const { name, email, plan, planExpiredAt, quota, role, isBanned, banReason } = req.body;
    
    if (name) user.name = name;
    if (email) user.email = email;
    
    // Handle plan change
    if (plan && plan !== user.plan) {
      user.plan = plan;
      
      // Set default quota based on plan
      const planQuotas = {
        free: 100,
        basic: 500,
        premium: 2000,
        pro: 10000
      };
      
      // Only update quota if not explicitly provided
      if (quota === undefined) {
        user.quota = planQuotas[plan] || 100;
      }
      
      // Set default expiry for paid plans if not provided
      if (plan !== 'free' && !planExpiredAt) {
        const days = plan === 'pro' ? 30 : 15;
        const currentExpiry = user.planExpiredAt && new Date(user.planExpiredAt) > new Date() 
          ? new Date(user.planExpiredAt) 
          : new Date();
        user.planExpiredAt = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
      }
      
      // === SYNC PLAN TO BOT ===
      // Update all bots owned by this user to sync plan
      const botPlanMap = {
        free: 'free',
        basic: 'basic',
        premium: 'premium',
        pro: 'unlimited'  // Pro user gets unlimited bot plan
      };
      
      await Bot.update(
        { 
          plan: botPlanMap[plan] || 'free',
          expiredAt: plan === 'free' ? null : user.planExpiredAt
        },
        { where: { userId: user.id } }
      );
    }
    
    // Handle explicit planExpiredAt
    if (planExpiredAt) {
      user.planExpiredAt = planExpiredAt;
      // Also sync to bot
      await Bot.update(
        { expiredAt: planExpiredAt },
        { where: { userId: user.id } }
      );
    } else if (plan === 'free') {
      user.planExpiredAt = null;
      // Also sync to bot
      await Bot.update(
        { plan: 'free', expiredAt: null },
        { where: { userId: user.id } }
      );
    }
    
    if (quota !== undefined) user.quota = quota;
    if (role) user.role = role;
    if (isBanned !== undefined) user.isBanned = isBanned;
    if (banReason !== undefined) user.banReason = banReason;
    
    await user.save();
    
    // Reload to get updated values
    await user.reload();
    
    res.json({ message: 'User berhasil diupdate', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    
    // Delete related bots
    await Bot.destroy({ where: { userId: user.id } });
    await Invoice.destroy({ where: { userId: user.id } });
    await user.destroy();
    
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ban/Unban user
router.post('/users/:id/ban', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    
    user.isBanned = true;
    user.banReason = req.body.reason || 'Melanggar ketentuan';
    await user.save();
    
    res.json({ message: 'User berhasil di-ban' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/:id/unban', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    
    user.isBanned = false;
    user.banReason = null;
    await user.save();
    
    res.json({ message: 'User berhasil di-unban' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== BOT MANAGEMENT ====================
router.get('/bots', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const where = {};
    
    if (status && status !== 'all') where.status = status;
    
    const offset = (page - 1) * limit;
    const { count, rows } = await Bot.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      bots: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/bots/:id', async (req, res) => {
  try {
    const bot = await Bot.findByPk(req.params.id);
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    await bot.destroy();
    res.json({ message: 'Bot berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== INVOICE MANAGEMENT ====================
router.get('/invoices', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    
    if (status && status !== 'all') where.status = status;
    
    const offset = (page - 1) * limit;
    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      invoices: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/invoices/:id/approve', async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice tidak ditemukan' });
    
    invoice.status = 'paid';
    invoice.paidAt = new Date();
    await invoice.save();
    
    // Update user plan
    const user = await User.findByPk(invoice.userId);
    if (user) {
      // Determine plan and duration from invoice
      let plan = 'premium';
      let days = 15;
      
      if (invoice.plan.toLowerCase().includes('pro') || invoice.amount >= 50000) {
        plan = 'pro';
        days = 30;
      }
      
      user.plan = plan;
      
      // Add days to existing expiry or start from now
      const currentExpiry = user.planExpiredAt && new Date(user.planExpiredAt) > new Date() 
        ? new Date(user.planExpiredAt) 
        : new Date();
      user.planExpiredAt = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
      
      await user.save();
      
      // === SYNC PLAN TO BOT ===
      const botPlanMap = {
        free: 'free',
        basic: 'basic',
        premium: 'premium',
        pro: 'unlimited'
      };
      
      await Bot.update(
        { 
          plan: botPlanMap[plan] || 'free',
          expiredAt: user.planExpiredAt
        },
        { where: { userId: user.id } }
      );
    }
    
    res.json({ message: 'Invoice approved dan plan user diupdate' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/invoices/:id/reject', async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice tidak ditemukan' });
    
    invoice.status = 'failed';
    await invoice.save();
    
    res.json({ message: 'Invoice ditolak' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
