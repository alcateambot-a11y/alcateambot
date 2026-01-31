/**
 * Selfbot Connection Handler - FIXED VERSION
 * Handle pairing code authentication untuk selfbot
 */

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const { Bot } = require('../models');
const { handleSelfbotMessage } = require('./selfbotHandler');

const selfbotSessions = new Map();
const pairingCodes = new Map(); // Store pairing codes temporarily

/**
 * Create selfbot session with pairing code
 */
async function createSelfbotSession(botId, userId, phoneNumber) {
  const sessionPath = path.join(__dirname, '../sessions', `selfbot_${botId}`);
  
  try {
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();
    
    // Clean phone number
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

    const sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      printQRInTerminal: false, // Disable QR
      logger: pino({ level: 'error' }),
      browser: ['Selfbot', 'Chrome', '120.0.0'],
      connectTimeoutMs: 60000,
      markOnlineOnConnect: true,
      syncFullHistory: false,
      getMessage: async () => undefined,
    });

    selfbotSessions.set(botId, sock);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr, isNewLogin } = update;
      
      console.log(`[SELFBOT ${botId}] Connection update:`, { connection, hasQr: !!qr });

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== 401;
        
        console.log(`[SELFBOT ${botId}] Connection closed, statusCode:`, statusCode, 'reconnect:', shouldReconnect);
        
        if (shouldReconnect) {
          // Auto reconnect after 5 seconds
          setTimeout(() => {
            console.log(`[SELFBOT ${botId}] Reconnecting...`);
            createSelfbotSession(botId, userId, phoneNumber);
          }, 5000);
        } else {
          // Logged out, update status
          await Bot.update({ status: 'disconnected', selfbotEnabled: false }, { where: { id: botId } });
          selfbotSessions.delete(botId);
          pairingCodes.delete(botId);
          global.io?.emit(`selfbot-status-${botId}`, 'disconnected');
        }
      }

      if (connection === 'open') {
        console.log(`[SELFBOT ${botId}] Connected successfully!`);
        await Bot.update({ 
          status: 'connected', 
          selfbotEnabled: true,
          phone: phoneNumber 
        }, { where: { id: botId } });
        
        global.io?.emit(`selfbot-status-${botId}`, 'connected');
        global.io?.emit(`selfbot-connected-${botId}`, { phone: phoneNumber });
      }
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      const now = Date.now();
      const MAX_MESSAGE_AGE = 60000;
      
      const bot = await Bot.findByPk(botId);
      if (!bot || !bot.selfbotEnabled) return;
      
      for (const msg of messages) {
        if (!msg.message) continue;
        if (msg.key.fromMe) continue;
        
        const msgTimestamp = msg.messageTimestamp;
        if (msgTimestamp) {
          const msgTime = typeof msgTimestamp === 'number' ? msgTimestamp * 1000 : msgTimestamp;
          const age = now - msgTime;
          if (age > MAX_MESSAGE_AGE) continue;
        }
        
        try {
          await handleSelfbotMessage(sock, msg, bot);
        } catch (err) {
          console.error(`[SELFBOT ${botId}] Message handler error:`, err.message);
        }
      }
    });

    // Request pairing code BEFORE connection is established
    if (!sock.authState.creds.registered) {
      console.log(`[SELFBOT ${botId}] Requesting pairing code for:`, cleanPhone);
      
      // Use setTimeout to request pairing code after socket is initialized
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(cleanPhone);
          console.log(`[SELFBOT ${botId}] Pairing code:`, code);
          
          // Store pairing code
          pairingCodes.set(botId, code);
          global.io?.emit(`selfbot-pairing-code-${botId}`, code);
          
          // Auto-delete after 5 minutes
          setTimeout(() => {
            pairingCodes.delete(botId);
          }, 5 * 60 * 1000);
        } catch (err) {
          console.error(`[SELFBOT ${botId}] Error requesting pairing code:`, err.message);
          pairingCodes.set(botId, null); // Set null to indicate error
        }
      }, 3000); // Wait 3 seconds for socket to initialize
    }

    return sock;
  } catch (err) {
    console.error(`[SELFBOT ${botId}] Error creating session:`, err.message);
    throw err;
  }
}

/**
 * Get selfbot session
 */
function getSelfbotSession(botId) {
  return selfbotSessions.get(botId);
}

/**
 * Delete selfbot session
 */
async function deleteSelfbotSession(botId) {
  const sock = selfbotSessions.get(botId);
  if (sock) {
    try {
      await sock.logout();
      sock.ev.removeAllListeners();
      sock.ws?.close();
    } catch (e) {
      console.log(`[SELFBOT ${botId}] Error during logout:`, e.message);
    }
    selfbotSessions.delete(botId);
  }
  
  // Delete session folder
  const sessionPath = path.join(__dirname, '../sessions', `selfbot_${botId}`);
  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true });
  }
  
  // Update database
  await Bot.update({ 
    status: 'disconnected', 
    selfbotEnabled: false 
  }, { where: { id: botId } });
}

/**
 * Get pairing code
 */
function getPairingCode(botId) {
  return pairingCodes.get(botId);
}

module.exports = {
  createSelfbotSession,
  getSelfbotSession,
  deleteSelfbotSession,
  getPairingCode
};
