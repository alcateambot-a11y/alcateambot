const express = require('express');
const auth = require('../middleware/auth');
const { Device } = require('../models');
const { createSession, deleteSession, getSession } = require('../services/whatsapp');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  const devices = await Device.findAll({ where: { userId: req.user.id } });
  res.json(devices);
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const device = await Device.create({ name, userId: req.user.id });
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/connect', async (req, res) => {
  try {
    const device = await Device.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!device) return res.status(404).json({ error: 'Device tidak ditemukan' });
    
    await createSession(device.id, req.user.id);
    res.json({ message: 'Menghubungkan, tunggu QR code...' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/disconnect', async (req, res) => {
  try {
    const device = await Device.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!device) return res.status(404).json({ error: 'Device tidak ditemukan' });
    
    deleteSession(device.id);
    await Device.update({ status: 'disconnected' }, { where: { id: device.id } });
    res.json({ message: 'Device disconnected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const device = await Device.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!device) return res.status(404).json({ error: 'Device tidak ditemukan' });
    
    deleteSession(device.id);
    await device.destroy();
    res.json({ message: 'Device dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
