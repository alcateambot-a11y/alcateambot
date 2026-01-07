const express = require('express');
const auth = require('../middleware/auth');
const { Bot, Group, Command, Filter } = require('../models');
const { createSession, deleteSession, getSession, sessions } = require('../services/whatsapp');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads/menu');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `menu_${req.params.id}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('File harus berupa gambar'));
    }
  }
});

// Public endpoint - Get all available commands (no auth required)
router.get('/commands/list', async (req, res) => {
  try {
    // Clear cache to get fresh data
    const modulePath = require.resolve('../services/bot/commandList');
    delete require.cache[modulePath];
    
    const { COMMANDS } = require('../services/bot/commandList');
    console.log('Commands list requested, returning', COMMANDS.length, 'commands');
    res.json(COMMANDS);
  } catch (err) {
    console.error('Error getting commands:', err);
    res.status(500).json({ error: err.message });
  }
});

// Public endpoint - Get default menu template (no auth required)
router.get('/default-menu', async (req, res) => {
  try {
    const { DEFAULT_MENU } = require('../services/bot/constants');
    res.json({ menu: DEFAULT_MENU });
  } catch (err) {
    console.error('Error getting default menu:', err);
    res.status(500).json({ error: err.message });
  }
});

router.use(auth);

// Get user's bot (single bot per user)
router.get('/my-bot', async (req, res) => {
  try {
    console.log('=== GET /my-bot ===');
    console.log('User ID:', req.user?.id);
    console.log('User email:', req.user?.email);
    console.log('User name:', req.user?.name);
    
    if (!req.user || !req.user.id) {
      console.log('No user in request');
      return res.status(401).json({ error: 'User tidak terautentikasi' });
    }
    
    // Get first bot for this user - use ASC to get the FIRST created bot (not latest)
    // This ensures user always gets the same bot
    let bot = await Bot.findOne({ 
      where: { userId: req.user.id },
      order: [['id', 'ASC']] // Get FIRST bot (oldest) to ensure consistency
    });
    
    console.log('Found bot:', bot?.id || 'none');
    if (bot) {
      console.log('Bot settings - menuType:', bot.menuType, 'menuText:', bot.menuText ? 'SET' : 'NULL');
    }
    
    // Auto-create bot ONLY if not exists
    if (!bot) {
      console.log('No bot found, creating new bot for user:', req.user.id);
      bot = await Bot.create({
        userId: req.user.id,
        name: `Bot ${req.user.name || 'User'}`,
        plan: req.user.plan || 'free',
        expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days free trial
      });
      console.log('Created new bot:', bot.id);
    }
    
    console.log('Returning bot:', bot.id, 'for user:', req.user.id);
    res.json(bot);
  } catch (err) {
    console.error('Error in /my-bot:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Get all bots (legacy, returns single bot as array)
router.get('/', async (req, res) => {
  const bot = await Bot.findOne({ where: { userId: req.user.id } });
  res.json(bot ? [bot] : []);
});

// Get single bot with groups
router.get('/:id', async (req, res) => {
  const bot = await Bot.findOne({ 
    where: { id: req.params.id, userId: req.user.id },
    include: [{ model: Group }]
  });
  if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
  res.json(bot);
});

// Connect bot (get QR)
router.post('/:id/connect', async (req, res) => {
  try {
    console.log('Connect request for bot:', req.params.id, 'user:', req.user.id);
    
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) {
      console.log('Bot not found');
      return res.status(404).json({ error: 'Bot tidak ditemukan' });
    }
    
    console.log('Found bot:', bot.id, 'status:', bot.status);
    
    // Check if expired - if expired, extend by 30 days for testing
    if (bot.expiredAt && new Date(bot.expiredAt) < new Date()) {
      console.log('Bot expired, extending...');
      await bot.update({ expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
    }
    
    console.log('Creating session...');
    await createSession(bot.id, req.user.id);
    res.json({ message: 'Menghubungkan, tunggu QR code...' });
  } catch (err) {
    console.error('Error in connect:', err);
    res.status(500).json({ error: err.message });
  }
});

// Disconnect bot
router.post('/:id/disconnect', async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    deleteSession(bot.id);
    await Bot.update({ status: 'disconnected' }, { where: { id: bot.id } });
    res.json({ message: 'Bot disconnected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start bot (smart - will show QR if no session, or reconnect if session exists)
router.post('/:id/start', async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    // Check if expired
    if (bot.expiredAt && new Date(bot.expiredAt) < new Date()) {
      return res.status(400).json({ error: 'Bot sudah expired. Perpanjang langganan untuk mengaktifkan.' });
    }
    
    // Check if already connected
    if (getSession(bot.id)) {
      return res.status(400).json({ error: 'Bot sudah berjalan' });
    }
    
    // Check if session exists
    const sessionPath = path.join(__dirname, '../sessions', `${bot.id}`);
    const sessionExists = fs.existsSync(sessionPath) && fs.readdirSync(sessionPath).length > 0;
    
    // Create session (will auto-connect if session exists, or show QR if not)
    await createSession(bot.id, req.user.id);
    
    // Return whether QR is needed
    res.json({ 
      message: sessionExists ? 'Bot starting...' : 'Menghubungkan, tunggu QR code...',
      needsQR: !sessionExists
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stop bot (disconnect but keep session)
router.post('/:id/stop', async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    const sock = getSession(bot.id);
    if (sock) {
      sock.end();
      sessions.delete(bot.id);
    }
    
    await Bot.update({ status: 'disconnected', connectedAt: null }, { where: { id: bot.id } });
    res.json({ message: 'Bot stopped' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete session
router.delete('/:id/session', async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    // Stop bot if running
    const sock = getSession(bot.id);
    if (sock) {
      try {
        sock.logout();
      } catch (e) {
        // Ignore logout errors
      }
      sessions.delete(bot.id);
    }
    
    // Delete session folder
    const sessionPath = path.join(__dirname, '../sessions', `${bot.id}`);
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true });
    }
    
    await Bot.update({ status: 'disconnected', phone: null, connectedAt: null }, { where: { id: bot.id } });
    res.json({ message: 'Session dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update bot settings
router.put('/:id', async (req, res) => {
  try {
    console.log('=== PUT /bots/:id ===');
    console.log('Bot ID:', req.params.id);
    console.log('User ID:', req.user?.id);
    console.log('Body:', JSON.stringify(req.body).slice(0, 500));
    
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) {
      console.log('Bot not found');
      return res.status(404).json({ error: 'Bot tidak ditemukan' });
    }
    
    console.log('Found bot:', bot.id);
    
    const allowedFields = [
      'name', 'prefix', 'prefixType', 'botName',
      // Config fields (Wibusoft style)
      'packname', 'authorSticker', 'footerText', 'limitPerDay', 'balanceDefault', 'owners',
      // Messages (Wibusoft style - all mess fields)
      'waitMessage', 'errorMessage', 'invLinkMessage', 'onlyGroupMessage', 'onlyPMMessage',
      'groupAdminMessage', 'botAdminMessage', 'onlyOwnerMessage', 'onlyPremMessage', 'onlySewaMessage',
      'limitMessage', 'cmdLimitMessage', 'requiredLimitMessage', 'callMessage',
      'antideleteMessage', 'antiluarMessage', 'promoteTextMessage', 'demoteTextMessage',
      'welcomeTextMessage', 'leftTextMessage', 'sewaEndMessage', 'sewaNotifMessage', 'sewaReminderMessage',
      'joinToUseMessage', 'alarmMessage', 'reminderMessage',
      'tiktokMessage', 'twitterMessage', 'ytmp3Message', 'ytmp4Message', 'playMessage',
      'levelMessage', 'levelupMessage', 'profileMessage', 'confessMessage',
      'countdownMessage', 'countdownEndMessage', 'cooldownMessage', 'timeoutMessage',
      'ultahMessage', 'upgradePremiumMessage', 'expirePremiumMessage',
      // Features (Wibusoft style)
      'onlineOnConnect', 'premiumNotification', 'sewaNotificationGroup',
      'sewaNotificationOwner', 'joinToUse',
      'welcomeEnabled', 'leftEnabled', 'antiLinkEnabled', 
      'antiSpamEnabled', 'antiBadwordEnabled', 'gamesEnabled', 'levelingEnabled',
      // Menu Settings (Wibusoft style)
      'menuHeader', 'menuFooter', 'menuThumbnail',
      'menuText', 'helpMenuText', 'menuType', 'menuTitle', 'menuBody', 'menuUrl', 'menuLarge', 'showAd',
      'menuLatitude', 'menuLongitude', 'menuImagePath', 'adUrl',
      // Command settings
      'commandSettings'
    ];
    
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    
    console.log('Updates to apply:', Object.keys(updates));
    console.log('menuText in updates:', updates.menuText ? 'YES (' + updates.menuText.length + ' chars)' : 'NO');
    
    await bot.update(updates);
    
    // Verify save
    const updated = await Bot.findByPk(bot.id);
    console.log('After save - menuText:', updated.menuText ? 'SAVED' : 'NULL');
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload menu image
router.post('/:id/upload-menu-image', upload.single('image'), async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    if (!req.file) {
      return res.status(400).json({ error: 'File tidak ditemukan' });
    }
    
    // Delete old image if exists
    if (bot.menuImagePath) {
      const oldPath = path.join(__dirname, '../public', bot.menuImagePath);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    const imagePath = `/uploads/menu/${req.file.filename}`;
    await bot.update({ menuImagePath: imagePath });
    
    res.json({ path: imagePath, message: 'Image uploaded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete bot
router.delete('/:id', async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    deleteSession(bot.id);
    await Group.destroy({ where: { botId: bot.id } });
    await bot.destroy();
    res.json({ message: 'Bot dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bot groups
router.get('/:id/groups', async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    const groups = await Group.findAll({ where: { botId: bot.id } });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update group settings
router.put('/:id/groups/:groupId', async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    const group = await Group.findOne({ where: { id: req.params.groupId, botId: bot.id } });
    if (!group) return res.status(404).json({ error: 'Group tidak ditemukan' });
    
    await group.update(req.body);
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== BOT COMMAND SETTINGS ====================

// Get bot commands
router.get('/:id/commands', async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    const commands = await Command.findAll({ where: { botId: bot.id } });
    res.json(commands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update command status
router.put('/:id/commands/:commandId', async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    const command = await Command.findOne({ where: { id: req.params.commandId, botId: bot.id } });
    if (!command) return res.status(404).json({ error: 'Command tidak ditemukan' });
    
    await command.update({ enabled: req.body.enabled });
    res.json(command);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk update commands
router.put('/:id/commands', async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    const { commands } = req.body;
    for (const cmd of commands) {
      await Command.upsert({
        botId: bot.id,
        name: cmd.name,
        category: cmd.category,
        description: cmd.description,
        enabled: cmd.enabled
      });
    }
    
    const updatedCommands = await Command.findAll({ where: { botId: bot.id } });
    res.json(updatedCommands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== FILTER ROUTES ====================

// Get bot filters
router.get('/:id/filters', async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    const filters = await Filter.findAll({ where: { botId: bot.id } });
    res.json(filters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create filter
router.post('/:id/filters', async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    const { trigger, response, type } = req.body;
    if (!trigger || !response) {
      return res.status(400).json({ error: 'Trigger dan response harus diisi' });
    }
    
    const filter = await Filter.create({
      botId: bot.id,
      trigger,
      response,
      type: type || 'exact'
    });
    
    res.json(filter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update filter
router.put('/:id/filters/:filterId', async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    const filter = await Filter.findOne({ where: { id: req.params.filterId, botId: bot.id } });
    if (!filter) return res.status(404).json({ error: 'Filter tidak ditemukan' });
    
    await filter.update(req.body);
    res.json(filter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete filter
router.delete('/:id/filters/:filterId', async (req, res) => {
  try {
    const bot = await Bot.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!bot) return res.status(404).json({ error: 'Bot tidak ditemukan' });
    
    const filter = await Filter.findOne({ where: { id: req.params.filterId, botId: bot.id } });
    if (!filter) return res.status(404).json({ error: 'Filter tidak ditemukan' });
    
    await filter.destroy();
    res.json({ message: 'Filter dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
