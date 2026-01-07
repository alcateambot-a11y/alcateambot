const express = require('express');
const auth = require('../middleware/auth');
const { Webhook } = require('../models');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  const webhooks = await Webhook.findAll({ where: { userId: req.user.id } });
  res.json(webhooks);
});

router.post('/', async (req, res) => {
  try {
    const { url, events } = req.body;
    const webhook = await Webhook.create({ url, events, userId: req.user.id });
    res.json(webhook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const webhook = await Webhook.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!webhook) return res.status(404).json({ error: 'Webhook tidak ditemukan' });
    
    await webhook.update(req.body);
    res.json(webhook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const webhook = await Webhook.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!webhook) return res.status(404).json({ error: 'Webhook tidak ditemukan' });
    
    await webhook.destroy();
    res.json({ message: 'Webhook dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
