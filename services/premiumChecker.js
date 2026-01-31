/**
 * Premium Checker Service
 * Cek premium users yang hampir/sudah expired dan kirim notifikasi
 */

const { PremiumUser, Bot } = require('../models');
const { getSession } = require('./whatsapp');
const { formatMsg, getBotData } = require('./bot/utils');

// Track notifikasi yang sudah dikirim (agar tidak spam)
const notificationSent = new Map(); // Map<botId_number_type, timestamp>

/**
 * Check premium expiry and send notifications
 */
async function checkPremiumExpiry() {
  try {
    console.log('[Premium Checker] Running check...');
    
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    // Get all premium users
    const premUsers = await PremiumUser.findAll();
    
    for (const premUser of premUsers) {
      const expiredAt = new Date(premUser.expiredAt);
      const botId = premUser.botId;
      const number = premUser.number;
      
      // Get bot session
      const sock = getSession(botId);
      if (!sock || !sock.user) {
        continue; // Bot not connected
      }
      
      // Get bot data
      const bot = await getBotData(botId);
      if (!bot) continue;
      
      const userJid = number + '@s.whatsapp.net';
      
      // Check if expired
      if (expiredAt < now) {
        // Already expired - send expire notification (once per day)
        const notifKey = `${botId}_${number}_expired`;
        const lastSent = notificationSent.get(notifKey);
        
        if (!lastSent || (now - lastSent) > (24 * 60 * 60 * 1000)) {
          try {
            const expireMsg = bot.expirePremiumMessage || 
              'Status premium Anda sudah habis. Silahkan hubungi owner untuk memperpanjang premium.\n\nKetik .premium untuk melihat list premium.';
            
            const vars = {
              namebot: bot.botName || 'Bot',
              expired: expiredAt.toLocaleDateString('id-ID', { 
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
              })
            };
            
            const formattedMsg = formatMsg(expireMsg, vars);
            
            await sock.sendMessage(userJid, { text: formattedMsg });
            notificationSent.set(notifKey, now);
            console.log(`[Premium Checker] Sent expire notification to ${number}`);
          } catch (e) {
            console.error(`[Premium Checker] Error sending expire notification to ${number}:`, e.message);
          }
        }
      } else if (expiredAt < threeDaysLater) {
        // Expiring soon (within 3 days) - send reminder (once per day)
        const notifKey = `${botId}_${number}_reminder`;
        const lastSent = notificationSent.get(notifKey);
        
        if (!lastSent || (now - lastSent) > (24 * 60 * 60 * 1000)) {
          try {
            const daysLeft = Math.ceil((expiredAt - now) / (1000 * 60 * 60 * 24));
            
            const reminderMsg = `⚠️ *REMINDER PREMIUM*\n\nHalo! Premium Anda akan segera berakhir.\n\n` +
              `📅 Expired: ${expiredAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n` +
              `⏰ Sisa waktu: ${daysLeft} hari lagi\n\n` +
              `Hubungi owner untuk memperpanjang premium Anda!\n` +
              `Ketik .owner untuk info kontak.`;
            
            await sock.sendMessage(userJid, { text: reminderMsg });
            notificationSent.set(notifKey, now);
            console.log(`[Premium Checker] Sent reminder to ${number} (${daysLeft} days left)`);
          } catch (e) {
            console.error(`[Premium Checker] Error sending reminder to ${number}:`, e.message);
          }
        }
      }
    }
    
    console.log('[Premium Checker] Check completed');
  } catch (err) {
    console.error('[Premium Checker] Error:', err);
  }
}

/**
 * Start premium checker (run every 6 hours)
 */
function startPremiumChecker() {
  console.log('[Premium Checker] Service started');
  
  // Run immediately on start
  setTimeout(checkPremiumExpiry, 60000); // Wait 1 minute after server start
  
  // Run every 6 hours
  setInterval(checkPremiumExpiry, 6 * 60 * 60 * 1000);
}

module.exports = {
  startPremiumChecker,
  checkPremiumExpiry
};
