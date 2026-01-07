const express = require('express');
const auth = require('../middleware/auth');
const { Message, Device, User } = require('../models');
const { sendMessage } = require('../services/whatsapp');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  const messages = await Message.findAll({ 
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 100
  });
  res.json(messages);
});

router.post('/send', async (req, res) => {
  try {
    const { deviceId, to, content, type = 'text' } = req.body;
    
    const device = await Device.findOne({ where: { id: deviceId, userId: req.user.id } });
    if (!device) return res.status(404).json({ error: 'Device tidak ditemukan' });
    if (device.status !== 'connected') return res.status(400).json({ error: 'Device tidak terhubung' });

    const result = await sendMessage(deviceId, to, content, type);
    
    const message = await Message.create({
      userId: req.user.id,
      deviceId,
      to,
      type,
      content: typeof content === 'string' ? content : JSON.stringify(content),
      status: 'sent',
      messageId: result.key.id
    });

    await User.increment('usedQuota', { where: { id: req.user.id } });
    
    res.json({ success: true, message, messageId: result.key.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
