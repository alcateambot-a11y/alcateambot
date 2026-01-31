const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const { Bot, Group, User } = require('../models');
const { startKeepalive, stopKeepalive } = require('./keepalive');

// Clear cache and reload bot modules to ensure fresh code
const botPath = path.join(__dirname, 'bot');
Object.keys(require.cache).forEach(key => {
  if (key.includes(botPath) || key.includes('botHandler')) {
    delete require.cache[key];
  }
});

const botHandler = require('./botHandler');
const { handleMessage, handleGroupUpdate } = botHandler;

const sessions = new Map();
let qrRetryCount = {};
let reconnectAttempts = {}; // Track per bot
let reconnectTimers = {}; // Track reconnect timers to prevent duplicates
let isReconnecting = {}; // Flag to prevent multiple reconnect calls
let notificationSent = {}; // Track if online notification already sent

async function createSession(botId, userId) {
  // CRITICAL: Check if already reconnecting to prevent spam
  if (isReconnecting[botId]) {
    console.log(`Bot ${botId} is already reconnecting, skipping duplicate call`);
    return sessions.get(botId);
  }
  
  // Check if session already exists and is connected
  const existingSession = sessions.get(botId);
  if (existingSession) {
    try {
      // Check if socket is still usable
      if (existingSession.user) {
        console.log(`Bot ${botId} already has active session, reusing`);
        return existingSession;
      }
    } catch (e) {
      console.log(`Existing session for bot ${botId} is stale, creating new one`);
    }
    
    // Cleanup old session properly
    try {
      existingSession.ev.removeAllListeners();
      existingSession.ws?.close();
    } catch (e) {
      console.log('Error cleaning up old session:', e.message);
    }
    sessions.delete(botId);
  }
  
  // Clear any pending reconnect timer
  if (reconnectTimers[botId]) {
    clearTimeout(reconnectTimers[botId]);
    reconnectTimers[botId] = null;
  }
  
  isReconnecting[botId] = true;
  
  const sessionPath = path.join(__dirname, '../sessions', `${botId}`);
  
  try {
    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    // Reset QR retry count
    qrRetryCount[botId] = 0;

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: 'error' }),
      browser: ['Alcateambot', 'Chrome', '120.0.0'],
      connectTimeoutMs: 60000,
      qrTimeout: 40000,
      retryRequestDelayMs: 250, // Lebih cepat retry (dari 3000ms ke 250ms)
      markOnlineOnConnect: true, // Selalu online untuk respon cepat
      syncFullHistory: false,
      getMessage: async () => undefined,
      // Optimasi untuk respon lebih cepat
      defaultQueryTimeoutMs: 30000,
      keepAliveIntervalMs: 10000, // Keepalive setiap 10 detik
      emitOwnEvents: false, // Skip event dari pesan sendiri
      fireInitQueries: true, // Load data awal lebih cepat
    });

    sessions.set(botId, sock);
    isReconnecting[botId] = false;

    sock.ev.on('creds.update', saveCreds);

    // Initialize reconnect attempts for this bot
    if (typeof reconnectAttempts[botId] === 'undefined') {
      reconnectAttempts[botId] = 0;
    }
    const maxReconnectAttempts = 3;

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    // Only log significant updates
    if (connection || qr) {
      console.log('Connection update for bot', botId, ':', { connection, hasQr: !!qr, lastDisconnect: lastDisconnect?.error?.message });
    }

    if (qr) {
      qrRetryCount[botId] = (qrRetryCount[botId] || 0) + 1;
      console.log(`Generating QR code for bot ${botId} (attempt ${qrRetryCount[botId]})`);
      
      // Max 5 QR attempts
      if (qrRetryCount[botId] > 5) {
        console.log('Max QR attempts reached, stopping...');
        sessions.delete(botId);
        await Bot.update({ status: 'disconnected' }, { where: { id: botId } });
        global.io?.emit(`status-${botId}`, 'disconnected');
        global.io?.emit(`error-${botId}`, 'QR expired. Silakan coba lagi.');
        return;
      }
      
      const QRCode = require('qrcode');
      const qrDataUrl = await QRCode.toDataURL(qr);
      console.log('Emitting QR to:', `qr-${botId}`);
      global.io?.emit(`qr-${botId}`, qrDataUrl);
      await Bot.update({ status: 'connecting' }, { where: { id: botId } });
    }

    if (connection === 'close') {
      // Stop keepalive saat disconnect
      stopKeepalive(botId);
      
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== 401;
      console.log('Connection closed for bot', botId, ', statusCode:', statusCode, ', reconnect:', shouldReconnect);
      
      // Prevent duplicate reconnect attempts
      if (isReconnecting[botId] || reconnectTimers[botId]) {
        console.log(`Bot ${botId} reconnect already scheduled, skipping`);
        return;
      }
      
      reconnectAttempts[botId] = (reconnectAttempts[botId] || 0) + 1;
      
      if (shouldReconnect && reconnectAttempts[botId] <= maxReconnectAttempts) {
        // Exponential backoff: 10s, 20s, 40s (increased base delay)
        const delay = 10000 * Math.pow(2, reconnectAttempts[botId] - 1);
        console.log(`Reconnecting bot ${botId} in ${delay/1000}s (attempt ${reconnectAttempts[botId]}/${maxReconnectAttempts})`);
        
        // Cleanup current socket before reconnect
        try {
          sock.ev.removeAllListeners();
          sock.ws?.close();
        } catch (e) {}
        sessions.delete(botId);
        
        reconnectTimers[botId] = setTimeout(async () => {
          reconnectTimers[botId] = null;
          try {
            await createSession(botId, userId);
          } catch (e) {
            console.error(`Failed to reconnect bot ${botId}:`, e.message);
          }
        }, delay);
      } else {
        console.log(`Bot ${botId} stopped reconnecting after ${reconnectAttempts[botId]} attempts`);
        reconnectAttempts[botId] = 0; // Reset for next manual start
        
        // Cleanup
        try {
          sock.ev.removeAllListeners();
          sock.ws?.close();
        } catch (e) {}
        sessions.delete(botId);
        
        await Bot.update({ status: 'disconnected', connectedAt: null }, { where: { id: botId } });
        global.io?.emit(`status-${botId}`, 'disconnected');
      }
    } else if (connection === 'open') {
      // Reset reconnect counter on successful connection
      reconnectAttempts[botId] = 0;
      console.log('Bot connected:', botId);
      qrRetryCount[botId] = 0;
      const phone = sock.user?.id?.split(':')[0] || '';
      
      try {
        await Bot.update({ status: 'connected', phone, connectedAt: new Date() }, { where: { id: botId } });
        global.io?.emit(`status-${botId}`, 'connected');
      } catch (e) {
        console.error('Error updating bot status:', e.message);
      }
      
      // START KEEPALIVE - Jaga koneksi tetap aktif
      startKeepalive(sock, botId);
      
      // Count groups
      try {
        const groups = await sock.groupFetchAllParticipating();
        await Bot.update({ totalGroups: Object.keys(groups).length }, { where: { id: botId } });
      } catch (err) {
        console.error('Error fetching groups:', err.message);
      }
      
      // Send notification to owner that bot is online
      try {
        const bot = await Bot.findByPk(botId);
        if (bot) {
          let owners = [];
          try {
            owners = JSON.parse(bot.owners || '[]');
          } catch (e) {
            owners = [];
          }
          
          if (owners.length > 0) {
            const botName = bot.botName || 'Bot';
            const now = new Date();
            const timeStr = now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
            
            const notifMessage = `🤖 *${botName} Online!*\n\n✅ Bot berhasil terhubung\n⏰ ${timeStr}\n📱 ${phone}\n\nKetik .menu untuk melihat daftar perintah`;
            
            for (const owner of owners) {
              const ownerNumber = (owner.number || '').replace(/[^0-9]/g, '');
              if (ownerNumber) {
                const ownerJid = ownerNumber + '@s.whatsapp.net';
                try {
                  await sock.sendMessage(ownerJid, { text: notifMessage });
                  console.log('Sent online notification to owner:', ownerNumber);
                } catch (e) {
                  console.error('Failed to send notification to owner:', e.message);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error sending owner notification:', err.message);
      }
    }
  });

  // Handle incoming messages - OPTIMIZED FOR SPEED
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    // FAST PATH: Process immediately without heavy filtering
    if (!messages || messages.length === 0) return;
    
    // Process both 'notify' and 'append' types for faster response
    const now = Date.now();
    const MAX_MESSAGE_AGE = 120000; // 2 menit - lebih toleran untuk message history
    
    const bot = await Bot.findByPk(botId);
    if (!bot) {
      return;
    }
    if (bot.status !== 'connected') {
      return;
    }
    
    // Check subscription from User (fresh data)
    const user = await User.findByPk(bot.userId);
    if (user) {
      const isPremium = user.plan === 'premium' || user.plan === 'pro';
      const isExpired = user.planExpiredAt && new Date(user.planExpiredAt) < new Date();
      
      if (isPremium && isExpired) {
        console.log('User subscription expired');
        return;
      }
    }

    for (const msg of messages) {
      // FAST SKIP: Only skip obvious non-messages
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;
      
      // FAST TIMESTAMP CHECK: Skip very old messages only
      const msgTimestamp = msg.messageTimestamp;
      if (msgTimestamp) {
        const msgTime = typeof msgTimestamp === 'number' ? msgTimestamp * 1000 : msgTimestamp;
        const age = now - msgTime;
        
        // Skip hanya jika message lebih dari 2 menit (bukan 60 detik)
        if (age > MAX_MESSAGE_AGE) {
          continue;
        }
      }
      
      // PROCESS IMMEDIATELY - no logging to reduce overhead
      try {
        // Handle message tanpa await untuk non-blocking
        handleMessage(sock, msg, bot).catch(err => {
          console.error('Error in handleMessage:', err.message);
        });
        
        // Update counter async (non-blocking)
        Bot.increment('totalMessages', { where: { id: botId } }).catch(() => {});
      } catch (err) {
        console.error('Error processing message:', err.message);
      }
    }
  });

  // Handle group participant updates (welcome/left)
  sock.ev.on('group-participants.update', async (update) => {
    console.log('=== GROUP PARTICIPANTS UPDATE ===');
    console.log('Update:', JSON.stringify(update, null, 2));
    
    const bot = await Bot.findByPk(botId);
    if (!bot || bot.status !== 'connected') {
      console.log('Bot not found or not connected, skipping');
      return;
    }
    
    console.log('Calling handleGroupUpdate...');
    await handleGroupUpdate(sock, update, bot);
    console.log('handleGroupUpdate completed');
  });

    return sock;
  } catch (err) {
    console.error(`Error creating session for bot ${botId}:`, err.message);
    isReconnecting[botId] = false;
    
    // If session is corrupt, try to delete and recreate
    if (err.message.includes('Bad MAC') || err.message.includes('invalid') || err.message.includes('corrupt')) {
      console.log(`Session for bot ${botId} appears corrupt, deleting...`);
      const sessionPath = path.join(__dirname, '../sessions', `${botId}`);
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true });
      }
      await Bot.update({ status: 'disconnected' }, { where: { id: botId } });
      global.io?.emit(`status-${botId}`, 'disconnected');
      global.io?.emit(`error-${botId}`, 'Session corrupt. Silakan scan QR ulang.');
    }
    
    throw err;
  }
}

function getSession(botId) {
  return sessions.get(botId);
}

function deleteSession(botId) {
  // Stop keepalive
  stopKeepalive(botId);
  
  // Clear any pending reconnect
  if (reconnectTimers[botId]) {
    clearTimeout(reconnectTimers[botId]);
    reconnectTimers[botId] = null;
  }
  isReconnecting[botId] = false;
  reconnectAttempts[botId] = 0;
  
  const sock = sessions.get(botId);
  if (sock) {
    try {
      sock.ev.removeAllListeners();
      sock.logout();
    } catch (e) {
      console.log('Error during logout:', e.message);
    }
    sessions.delete(botId);
  }
  const sessionPath = path.join(__dirname, '../sessions', `${botId}`);
  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true });
  }
}

module.exports = { createSession, getSession, deleteSession, sessions };
