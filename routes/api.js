const express = require('express');
const apiAuth = require('../middleware/apiAuth');
const { Message, Device, User } = require('../models');
const { sendMessage } = require('../services/whatsapp');
const router = express.Router();

// Public API dengan API Key authentication
router.use(apiAuth);

// Kirim pesan text
router.post('/send-message', async (req, res) => {
  try {
    const { deviceId, to, message } = req.body;
    
    const device = await Device.findOne({ where: { id: deviceId, userId: req.user.id } });
    if (!device) return res.status(404).json({ status: false, error: 'Device tidak ditemukan' });
    if (device.status !== 'connected') return res.status(400).json({ status: false, error: 'Device tidak terhubung' });

    const result = await sendMessage(deviceId, to, message, 'text');
    
    await Message.create({
      userId: req.user.id,
      deviceId,
      to,
      type: 'text',
      content: message,
      status: 'sent',
      messageId: result.key.id
    });

    await User.increment('usedQuota', { where: { id: req.user.id } });
    
    res.json({ status: true, messageId: result.key.id });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// Kirim gambar
router.post('/send-image', async (req, res) => {
  try {
    const { deviceId, to, imageUrl, caption } = req.body;
    
    const device = await Device.findOne({ where: { id: deviceId, userId: req.user.id } });
    if (!device) return res.status(404).json({ status: false, error: 'Device tidak ditemukan' });
    if (device.status !== 'connected') return res.status(400).json({ status: false, error: 'Device tidak terhubung' });

    const result = await sendMessage(deviceId, to, { url: imageUrl, caption }, 'image');
    
    await Message.create({
      userId: req.user.id,
      deviceId,
      to,
      type: 'image',
      content: JSON.stringify({ url: imageUrl, caption }),
      status: 'sent',
      messageId: result.key.id
    });

    await User.increment('usedQuota', { where: { id: req.user.id } });
    
    res.json({ status: true, messageId: result.key.id });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// Kirim dokumen
router.post('/send-document', async (req, res) => {
  try {
    const { deviceId, to, documentUrl, filename, mimetype } = req.body;
    
    const device = await Device.findOne({ where: { id: deviceId, userId: req.user.id } });
    if (!device) return res.status(404).json({ status: false, error: 'Device tidak ditemukan' });
    if (device.status !== 'connected') return res.status(400).json({ status: false, error: 'Device tidak terhubung' });

    const result = await sendMessage(deviceId, to, { url: documentUrl, filename, mimetype }, 'document');
    
    await Message.create({
      userId: req.user.id,
      deviceId,
      to,
      type: 'document',
      content: JSON.stringify({ url: documentUrl, filename }),
      status: 'sent',
      messageId: result.key.id
    });

    await User.increment('usedQuota', { where: { id: req.user.id } });
    
    res.json({ status: true, messageId: result.key.id });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// Cek status device
router.get('/device-status/:deviceId', async (req, res) => {
  try {
    const device = await Device.findOne({ where: { id: req.params.deviceId, userId: req.user.id } });
    if (!device) return res.status(404).json({ status: false, error: 'Device tidak ditemukan' });
    
    res.json({ status: true, device: { id: device.id, name: device.name, phone: device.phone, status: device.status } });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// Cek quota
router.get('/quota', async (req, res) => {
  res.json({ 
    status: true, 
    quota: req.user.quota, 
    used: req.user.usedQuota, 
    remaining: req.user.quota - req.user.usedQuota 
  });
});

module.exports = router;
