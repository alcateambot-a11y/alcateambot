const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const { User, Invoice } = require('../models');
const router = express.Router();

router.use(auth);

// Get current user profile (always fresh from DB)
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      planExpiredAt: user.planExpiredAt,
      quota: user.quota,
      usedQuota: user.usedQuota,
      role: user.role,
      apiKey: user.apiKey,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (name) user.name = name;
    await user.save();
    
    res.json({ 
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Password lama dan baru harus diisi' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }
    
    const user = await User.findByPk(req.user.id);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Password lama salah' });
    }
    
    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user invoices
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.findAll({ 
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single invoice
router.get('/invoices/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ 
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice tidak ditemukan' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order/invoice
router.post('/orders', async (req, res) => {
  try {
    const { plan, paymentMethod } = req.body;
    
    const prices = {
      'nitro-15': { amount: 50000, days: 15, name: 'Nitro 15 Days' },
      'nitro-30': { amount: 85000, days: 30, name: 'Nitro 30 Days' },
    };
    
    if (!prices[plan]) {
      return res.status(400).json({ error: 'Plan tidak valid' });
    }
    
    const planData = prices[plan];
    const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const invoice = await Invoice.create({
      invoiceId,
      userId: req.user.id,
      plan: planData.name,
      amount: planData.amount,
      status: 'pending',
      paymentMethod,
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours to pay
    });
    
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
