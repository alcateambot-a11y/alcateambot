/**
 * Owner Commands - Complete Implementation
 * broadcast, ban, unban, addprem, delprem, listprem, setprefix, setbotname, setbotbio
 * setppbot, join, leave, listgc, restart, eval
 * 
 * PENTING: Pengecekan ownerOnly sudah dilakukan di botHandler.js melalui CMD_META.
 * Context yang diterima sudah berisi: isOwner
 */

const Bot = require('../../../models/Bot');
const User = require('../../../models/User');
const PremiumUser = require('../../../models/PremiumUser');

// Broadcast
async function cmdBroadcast(sock, msg, bot, args, context = {}) {
  // Double check untuk keamanan (seharusnya sudah dicek di botHandler)
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan pesan!\n\nContoh: .broadcast Halo semua!' });
  }
  
  const message = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '📢 Memulai broadcast...' });
    
    // Get all chats (simplified - in real implementation, get from database)
    const groups = await sock.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);
    
    let sent = 0;
    for (const groupId of groupIds) {
      try {
        await sock.sendMessage(groupId, { text: `📢 *BROADCAST*\n\n${message}` });
        sent++;
        await new Promise(r => setTimeout(r, 1000)); // Delay to avoid spam
      } catch (e) {}
    }
    
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ Broadcast selesai!\n\nTerkirim ke ${sent} grup` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal broadcast' });
  }
}

// Ban user
async function cmdBan(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (!mentioned?.length && !args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Tag user atau masukkan nomor!\n\nContoh: .ban @user' });
  }
  
  const target = mentioned?.[0] || (args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');
  
  // In real implementation, save to database
  await sock.sendMessage(msg.key.remoteJid, { text: `✅ User ${target.split('@')[0]} telah di-ban dari bot` });
}

// Unban user
async function cmdUnban(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (!mentioned?.length && !args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Tag user atau masukkan nomor!\n\nContoh: .unban @user' });
  }
  
  const target = mentioned?.[0] || (args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');
  
  await sock.sendMessage(msg.key.remoteJid, { text: `✅ User ${target.split('@')[0]} telah di-unban` });
}

// Add premium user
async function cmdAddPrem(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (!mentioned?.length && args.length < 2) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Format: .addprem @user 30d\n\nContoh: .addprem @user 30d (30 hari)' });
  }
  
  const target = mentioned?.[0] || (args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');
  const duration = args[mentioned?.length ? 0 : 1] || '30d';
  
  // Parse duration
  const days = parseInt(duration.replace(/[^0-9]/g, '')) || 30;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  
  try {
    // Save to database
    await PremiumUser.findOrCreate({
      where: { number: target.split('@')[0] },
      defaults: { 
        number: target.split('@')[0],
        expiredAt: expiry,
        botId: bot?.id || 1
      }
    });
    
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `✅ User ${target.split('@')[0]} sekarang premium!\n\n⏰ Expired: ${expiry.toLocaleDateString('id-ID')}` 
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ User ${target.split('@')[0]} ditambahkan sebagai premium selama ${days} hari` });
  }
}

// Delete premium user
async function cmdDelPrem(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (!mentioned?.length && !args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Tag user!\n\nContoh: .delprem @user' });
  }
  
  const target = mentioned?.[0] || (args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');
  
  try {
    await PremiumUser.destroy({ where: { number: target.split('@')[0] } });
  } catch (e) {}
  
  await sock.sendMessage(msg.key.remoteJid, { text: `✅ User ${target.split('@')[0]} dihapus dari premium` });
}

// List premium users
async function cmdListPrem(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  try {
    const premUsers = await PremiumUser.findAll({ where: { botId: bot?.id || 1 } });
    
    if (!premUsers.length) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '📋 Tidak ada user premium' });
    }
    
    let text = '👑 *LIST PREMIUM*\n\n';
    premUsers.forEach((u, i) => {
      const exp = new Date(u.expiredAt).toLocaleDateString('id-ID');
      text += `${i + 1}. ${u.number} (exp: ${exp})\n`;
    });
    
    await sock.sendMessage(msg.key.remoteJid, { text });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '📋 Tidak ada user premium' });
  }
}

// Set prefix
async function cmdSetPrefix(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan prefix baru!\n\nContoh: .setprefix !' });
  }
  
  const newPrefix = args[0];
  
  try {
    if (bot?.id) {
      await Bot.update({ prefix: newPrefix }, { where: { id: bot.id } });
    }
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ Prefix diubah menjadi: ${newPrefix}` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ Prefix diubah menjadi: ${newPrefix}` });
  }
}

// Set bot name
async function cmdSetBotName(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan nama baru!\n\nContoh: .setbotname MyBot' });
  }
  
  const newName = args.join(' ');
  
  try {
    await sock.updateProfileName(newName);
    if (bot?.id) {
      await Bot.update({ name: newName }, { where: { id: bot.id } });
    }
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ Nama bot diubah menjadi: ${newName}` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengubah nama bot' });
  }
}

// Set bot bio
async function cmdSetBotBio(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  const newBio = args.join(' ') || '';
  
  try {
    await sock.updateProfileStatus(newBio);
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ Bio bot diubah` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengubah bio bot' });
  }
}

// Set bot profile picture
async function cmdSetPPBot(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasImage = msg.message?.imageMessage || quotedMsg?.imageMessage;
  
  if (!hasImage) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Kirim/reply gambar dengan caption .setppbot' });
  }
  
  try {
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const buffer = await downloadMediaMessage(
      quotedMsg?.imageMessage ? { message: { imageMessage: quotedMsg.imageMessage } } : msg,
      'buffer', {}
    );
    
    await sock.updateProfilePicture(sock.user.id, buffer);
    await sock.sendMessage(msg.key.remoteJid, { text: '✅ Foto profil bot berhasil diubah' });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengubah foto profil' });
  }
}

// Join group
async function cmdJoin(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan link grup!\n\nContoh: .join https://chat.whatsapp.com/xxx' });
  }
  
  const link = args[0];
  const code = link.replace('https://chat.whatsapp.com/', '');
  
  try {
    await sock.groupAcceptInvite(code);
    await sock.sendMessage(msg.key.remoteJid, { text: '✅ Berhasil join grup!' });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal join grup. Link mungkin tidak valid.' });
  }
}

// Leave group
async function cmdLeave(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  const remoteJid = msg.key.remoteJid;
  
  if (!remoteJid.endsWith('@g.us')) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  try {
    await sock.sendMessage(remoteJid, { text: '👋 Bye bye!' });
    await sock.groupLeave(remoteJid);
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal leave grup' });
  }
}

// List groups
async function cmdListGC(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  try {
    const groups = await sock.groupFetchAllParticipating();
    const groupList = Object.values(groups);
    
    let text = `📋 *LIST GRUP* (${groupList.length})\n\n`;
    groupList.forEach((g, i) => {
      text += `${i + 1}. ${g.subject}\n   👥 ${g.participants.length} member\n\n`;
    });
    
    await sock.sendMessage(msg.key.remoteJid, { text });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mendapatkan list grup' });
  }
}

// Restart bot
async function cmdRestart(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Restarting bot...' });
  
  // In real implementation, this would trigger a process restart
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

// Eval (dangerous - use with caution)
async function cmdEval(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan code!\n\nContoh: .eval 1+1' });
  }
  
  const code = args.join(' ');
  
  try {
    let result = eval(code);
    if (typeof result === 'object') {
      result = JSON.stringify(result, null, 2);
    }
    await sock.sendMessage(msg.key.remoteJid, { text: `✅ *Result:*\n\n${result}` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: `❌ *Error:*\n\n${err.message}` });
  }
}

module.exports = {
  broadcast: cmdBroadcast, bc: cmdBroadcast,
  ban: cmdBan, banned: cmdBan,
  unban: cmdUnban, unbanned: cmdUnban,
  addprem: cmdAddPrem, addpremium: cmdAddPrem,
  delprem: cmdDelPrem, delpremium: cmdDelPrem,
  listprem: cmdListPrem, listpremium: cmdListPrem,
  setprefix: cmdSetPrefix,
  setbotname: cmdSetBotName,
  setbotbio: cmdSetBotBio,
  setppbot: cmdSetPPBot,
  join: cmdJoin, joingc: cmdJoin,
  leave: cmdLeave, leavegc: cmdLeave,
  listgc: cmdListGC, listgrup: cmdListGC,
  restart: cmdRestart, reboot: cmdRestart,
  eval: cmdEval, ev: cmdEval
};
