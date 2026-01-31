/**
 * Keepalive Service
 * Menjaga koneksi WhatsApp tetap aktif dan responsif
 * Mengirim ping berkala untuk mencegah connection idle
 */

const keepaliveTimers = new Map();

/**
 * Start keepalive untuk bot
 * @param {Object} sock - WhatsApp socket
 * @param {Number} botId - Bot ID
 */
function startKeepalive(sock, botId) {
  // Stop existing keepalive jika ada
  stopKeepalive(botId);
  
  console.log(`Starting keepalive for bot ${botId}`);
  
  // Ping setiap 30 detik untuk keep connection alive
  const timer = setInterval(async () => {
    try {
      if (!sock || !sock.user) {
        console.log(`Bot ${botId} socket not available, stopping keepalive`);
        stopKeepalive(botId);
        return;
      }
      
      // Send presence update to keep connection active
      // Ini lebih ringan daripada kirim pesan
      await sock.sendPresenceUpdate('available');
      
      // Log hanya setiap 5 menit untuk reduce noise
      const now = Date.now();
      const lastLog = keepaliveTimers.get(botId)?.lastLog || 0;
      if (now - lastLog > 300000) { // 5 menit
        console.log(`Keepalive ping sent for bot ${botId}`);
        keepaliveTimers.get(botId).lastLog = now;
      }
    } catch (err) {
      // Ignore errors, keepalive is best-effort
      if (err.message && !err.message.includes('Connection Closed')) {
        console.error(`Keepalive error for bot ${botId}:`, err.message);
      }
    }
  }, 30000); // 30 detik
  
  keepaliveTimers.set(botId, { timer, lastLog: 0 });
}

/**
 * Stop keepalive untuk bot
 * @param {Number} botId - Bot ID
 */
function stopKeepalive(botId) {
  const existing = keepaliveTimers.get(botId);
  if (existing) {
    clearInterval(existing.timer);
    keepaliveTimers.delete(botId);
    console.log(`Stopped keepalive for bot ${botId}`);
  }
}

/**
 * Stop all keepalives
 */
function stopAllKeepalives() {
  for (const [botId, data] of keepaliveTimers.entries()) {
    clearInterval(data.timer);
  }
  keepaliveTimers.clear();
  console.log('Stopped all keepalives');
}

module.exports = {
  startKeepalive,
  stopKeepalive,
  stopAllKeepalives
};
