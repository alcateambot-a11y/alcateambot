const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const { Bot, Group, User } = require('../models');

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

async function createSession(botId, userId) {
  const sessionPath = path.join(__dirname, '../sessions', `${botId}`);
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  // Reset QR retry count
  qrRetryCount[botId] = 0;

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true, // Also print to terminal for debugging
    logger: pino({ level: 'warn' }), // Show warnings
    browser: ['Alcateambot', 'Chrome', '120.0.0'], // Identify as Chrome browser
    connectTimeoutMs: 60000, // 60 second timeout
    qrTimeout: 40000, // 40 second QR timeout
    retryRequestDelayMs: 2000, // Delay between retries
    markOnlineOnConnect: false, // Don't mark online immediately
  });

  sessions.set(botId, sock);

  sock.ev.on('creds.update', saveCreds);

  // Track reconnect attempts
  let reconnectAttempts = 0;
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
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== 401;
      console.log('Connection closed for bot', botId, ', statusCode:', statusCode, ', reconnect:', shouldReconnect);
      
      reconnectAttempts++;
      
      if (shouldReconnect && reconnectAttempts <= maxReconnectAttempts) {
        // Exponential backoff: 5s, 10s, 20s
        const delay = 5000 * Math.pow(2, reconnectAttempts - 1);
        console.log(`Reconnecting bot ${botId} in ${delay/1000}s (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
        
        setTimeout(() => {
          createSession(botId, userId);
        }, delay);
      } else {
        console.log(`Bot ${botId} stopped reconnecting after ${reconnectAttempts} attempts`);
        sessions.delete(botId);
        await Bot.update({ status: 'disconnected', connectedAt: null }, { where: { id: botId } });
        global.io?.emit(`status-${botId}`, 'disconnected');
      }
    } else if (connection === 'open') {
      // Reset reconnect counter on successful connection
      reconnectAttempts = 0;
      console.log('Bot connected:', botId);
      qrRetryCount[botId] = 0;
      const phone = sock.user?.id?.split(':')[0] || '';
      
      try {
        await Bot.update({ status: 'connected', phone, connectedAt: new Date() }, { where: { id: botId } });
        global.io?.emit(`status-${botId}`, 'connected');
      } catch (e) {
        console.error('Error updating bot status:', e.message);
      }
      
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

  // Handle incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    console.log('=== messages.upsert ===');
    console.log('Type:', type);
    console.log('Messages count:', messages?.length);
    
    // Only process 'notify' type (new incoming messages)
    // 'append' is for message history sync
    if (type !== 'notify') {
      console.log('Skipping non-notify type:', type);
      return;
    }
    
    const bot = await Bot.findByPk(botId);
    if (!bot) {
      console.log('Bot not found in DB');
      return;
    }
    if (bot.status !== 'connected') {
      console.log('Bot status not connected:', bot.status);
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
      console.log('Processing message:', {
        fromMe: msg.key.fromMe,
        hasMessage: !!msg.message,
        remoteJid: msg.key.remoteJid,
        messageType: msg.message ? Object.keys(msg.message)[0] : null
      });
      
      if (!msg.key.fromMe && msg.message) {
        console.log('Calling handleMessage...');
        try {
          await handleMessage(sock, msg, bot);
          console.log('handleMessage completed');
          await Bot.increment('totalMessages', { where: { id: botId } });
        } catch (err) {
          console.error('Error in handleMessage:', err);
          console.error('Stack:', err.stack);
        }
      }
    }
  });

  // Handle group participant updates (welcome/left)
  sock.ev.on('group-participants.update', async (update) => {
    const bot = await Bot.findByPk(botId);
    if (!bot || bot.status !== 'connected') return;
    await handleGroupUpdate(sock, update, bot);
  });

  return sock;
}

function getSession(botId) {
  return sessions.get(botId);
}

function deleteSession(botId) {
  const sock = sessions.get(botId);
  if (sock) {
    sock.logout();
    sessions.delete(botId);
  }
  const sessionPath = path.join(__dirname, '../sessions', `${botId}`);
  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true });
  }
}

module.exports = { createSession, getSession, deleteSession, sessions };
