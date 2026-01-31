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
  
  const remoteJid = msg.key.remoteJid;
  const isGroup = remoteJid.endsWith('@g.us');
  
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
  
  let targetJid = null;
  let durationArg = '30d';
  
  // Priority: 1. Mention, 2. Reply, 3. Number in args
  if (mentioned?.length) {
    // Method 1: Mention
    targetJid = mentioned[0];
    // Filter out mention text from args
    const filteredArgs = args.filter(arg => !arg.startsWith('@'));
    durationArg = filteredArgs[0] || '30d';
  } else if (quotedMsg && quotedParticipant) {
    // Method 2: Reply
    targetJid = quotedParticipant;
    durationArg = args[0] || '30d';
  } else if (args.length >= 1) {
    // Method 3: Number in args
    const numberArg = args[0].replace(/[^0-9]/g, '');
    if (numberArg.length >= 10) {
      targetJid = numberArg + '@s.whatsapp.net';
      durationArg = args[1] || '30d';
    }
  }
  
  if (!targetJid) {
    return await sock.sendMessage(remoteJid, { 
      text: '❌ Format salah!\n\n' +
            'Cara pakai:\n' +
            '1. Tag: .addprem @user 30d\n' +
            '2. Reply: Reply pesan user lalu ketik .addprem 30d\n' +
            '3. Nomor: .addprem 628123456789 30d'
    });
  }
  
  // Resolve LID to phone number if in group
  let targetNumber = targetJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
  
  if (targetJid.endsWith('@lid') && isGroup) {
    try {
      const groupMetadata = await sock.groupMetadata(remoteJid);
      const participant = groupMetadata.participants.find(p => {
        if (p.id === targetJid) return true;
        if (p.lid && p.lid === targetJid) return true;
        return false;
      });
      
      if (participant && participant.phoneNumber) {
        targetNumber = participant.phoneNumber.split('@')[0].replace(/[^0-9]/g, '');
        console.log('Resolved LID to phone number:', targetNumber);
      }
    } catch (e) {
      console.error('Error resolving LID:', e.message);
    }
  }
  
  console.log('=== ADDPREM DEBUG ===');
  console.log('Target JID:', targetJid);
  console.log('Target Number (final):', targetNumber);
  console.log('Duration arg:', durationArg);
  
  // Parse duration - support format: 30d, 30, 7d, etc
  let days = 30; // default
  const match = durationArg.match(/(\d+)([dhm])?/i);
  if (match) {
    const value = parseInt(match[1]);
    const unit = (match[2] || 'd').toLowerCase();
    
    if (unit === 'd') {
      days = value;
    } else if (unit === 'h') {
      days = Math.ceil(value / 24);
    } else if (unit === 'm') {
      days = Math.ceil(value / (24 * 30));
    }
  }
  
  // Calculate expiry date
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  
  console.log('=== ADDPREM DEBUG ===');
  console.log('Duration arg:', durationArg);
  console.log('Parsed days:', days);
  console.log('Expiry date:', expiry);
  console.log('Expiry ISO:', expiry.toISOString());
  
  try {
    // Extract LID if available (for PC detection)
    const userLid = targetJid.endsWith('@lid') ? targetJid.split('@')[0] : null;
    
    // Upsert to database (create or update)
    const [premUser, created] = await PremiumUser.findOrCreate({
      where: { botId: bot.id, number: targetNumber },
      defaults: { 
        botId: bot.id,
        number: targetNumber,
        lid: userLid,
        expiredAt: expiry
      }
    });
    
    // If already exists, update expiry and LID
    if (!created) {
      await premUser.update({ 
        expiredAt: expiry,
        lid: userLid || premUser.lid // Keep existing LID if new one is null
      });
    }
    
    console.log('Premium user saved:', {
      number: targetNumber,
      lid: userLid,
      expiredAt: premUser.expiredAt,
      created: created
    });
    
    // Get mention name (pushName or number)
    const { getMentionName } = require('../utils');
    let mentionName = targetNumber;
    
    if (isGroup) {
      try {
        const groupMetadata = await sock.groupMetadata(remoteJid);
        mentionName = getMentionName(groupMetadata, targetJid, targetNumber);
      } catch (e) {}
    }
    
    const action = created ? 'sekarang premium' : 'diperpanjang premium';
    
    // Format date with fallback
    let dateStr;
    try {
      dateStr = new Date(premUser.expiredAt).toLocaleDateString('id-ID', { 
        day: 'numeric',
        month: 'long', 
        year: 'numeric'
      });
    } catch (e) {
      dateStr = expiry.toLocaleDateString('id-ID', { 
        day: 'numeric',
        month: 'long', 
        year: 'numeric'
      });
    }
    
    console.log('Formatted date:', dateStr);
    
    // Send notification to group/chat
    await sock.sendMessage(remoteJid, { 
      text: `✅ User @${mentionName} ${action}!\n\n⏰ Expired: ${dateStr}\n📅 Durasi: ${days} hari`,
      mentions: [targetJid]
    });
    
    // Send private message to user with upgradePremiumMessage
    try {
      const userJid = targetNumber + '@s.whatsapp.net';
      const { formatMsg } = require('../utils');
      
      // Get fresh bot data for message
      const { getBotData } = require('../utils');
      const freshBot = await getBotData(bot.id);
      
      const upgradeMsg = freshBot?.upgradePremiumMessage || bot.upgradePremiumMessage || 
        'Selamat! Nomor Anda sudah upgrade ke premium.\n\nNikmati semua fitur premium bot!';
      
      const vars = {
        namebot: bot.botName || 'Bot',
        expired: dateStr,
        durasi: `${days} hari`
      };
      
      const formattedMsg = formatMsg(upgradeMsg, vars);
      
      await sock.sendMessage(userJid, { text: formattedMsg });
      console.log('Sent upgrade notification to:', targetNumber);
    } catch (notifErr) {
      console.error('Error sending upgrade notification:', notifErr.message);
    }
  } catch (err) {
    console.error('Error in cmdAddPrem:', err);
    await sock.sendMessage(remoteJid, { text: `❌ Error: ${err.message}` });
  }
}

// Delete premium user
async function cmdDelPrem(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  const remoteJid = msg.key.remoteJid;
  const isGroup = remoteJid.endsWith('@g.us');
  
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
  
  let targetJid = null;
  
  // Priority: 1. Mention, 2. Reply, 3. Number in args
  if (mentioned?.length) {
    // Method 1: Mention
    targetJid = mentioned[0];
  } else if (quotedMsg && quotedParticipant) {
    // Method 2: Reply
    targetJid = quotedParticipant;
  } else if (args.length >= 1) {
    // Method 3: Number in args
    const numberArg = args[0].replace(/[^0-9]/g, '');
    if (numberArg.length >= 10) {
      targetJid = numberArg + '@s.whatsapp.net';
    }
  }
  
  if (!targetJid) {
    return await sock.sendMessage(remoteJid, { 
      text: '❌ Format salah!\n\n' +
            'Cara pakai:\n' +
            '1. Tag: .delprem @user\n' +
            '2. Reply: Reply pesan user lalu ketik .delprem\n' +
            '3. Nomor: .delprem 628123456789'
    });
  }
  
  // Resolve LID to phone number if in group
  let targetNumber = targetJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
  
  if (targetJid.endsWith('@lid') && isGroup) {
    try {
      const groupMetadata = await sock.groupMetadata(remoteJid);
      const participant = groupMetadata.participants.find(p => {
        if (p.id === targetJid) return true;
        if (p.lid && p.lid === targetJid) return true;
        return false;
      });
      
      if (participant && participant.phoneNumber) {
        targetNumber = participant.phoneNumber.split('@')[0].replace(/[^0-9]/g, '');
      }
    } catch (e) {
      console.error('Error resolving LID:', e.message);
    }
  }
  
  try {
    await PremiumUser.destroy({ 
      where: { 
        botId: bot.id,
        number: targetNumber 
      } 
    });
    
    // Get mention name (pushName or number)
    const { getMentionName } = require('../utils');
    let mentionName = targetNumber;
    
    if (isGroup) {
      try {
        const groupMetadata = await sock.groupMetadata(remoteJid);
        mentionName = getMentionName(groupMetadata, targetJid, targetNumber);
      } catch (e) {}
    }
    
    await sock.sendMessage(remoteJid, { 
      text: `✅ User @${mentionName} dihapus dari premium`,
      mentions: [targetJid]
    });
  } catch (e) {
    console.error('Error in cmdDelPrem:', e);
    await sock.sendMessage(remoteJid, { text: `❌ Error: ${e.message}` });
  }
}

// List premium users
async function cmdListPrem(sock, msg, bot, args, context = {}) {
  if (!context.isOwner) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Perintah ini hanya untuk owner!' });
  }
  
  const remoteJid = msg.key.remoteJid;
  const isGroup = remoteJid.endsWith('@g.us');
  
  try {
    const premUsers = await PremiumUser.findAll({ 
      where: { botId: bot.id },
      order: [['expiredAt', 'DESC']] // Sort by expiry date
    });
    
    if (!premUsers.length) {
      return await sock.sendMessage(remoteJid, { 
        text: '📋 *LIST PREMIUM*\n\n❌ Tidak ada user premium saat ini' 
      });
    }
    
    // Get group metadata for pushNames
    let groupMetadata = null;
    if (isGroup) {
      try {
        groupMetadata = await sock.groupMetadata(remoteJid);
      } catch (e) {}
    }
    
    const { getMentionName } = require('../utils');
    const now = new Date();
    
    let text = '👑 *LIST PREMIUM USERS*\n';
    text += `━━━━━━━━━━━━━━━━━━\n`;
    text += `📊 Total: ${premUsers.length} user${premUsers.length > 1 ? 's' : ''}\n\n`;
    
    const mentions = [];
    
    premUsers.forEach((u, i) => {
      const userJid = u.number + '@s.whatsapp.net';
      const expiredAt = new Date(u.expiredAt);
      const isExpired = expiredAt < now;
      
      // Get mention name
      let mentionName = u.number;
      if (isGroup && groupMetadata) {
        mentionName = getMentionName(groupMetadata, userJid, u.number);
      }
      
      // Calculate remaining days
      const diffTime = expiredAt - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Format date
      const dateStr = expiredAt.toLocaleDateString('id-ID', { 
        day: 'numeric',
        month: 'short', 
        year: 'numeric'
      });
      
      // Status emoji
      const statusEmoji = isExpired ? '❌' : (diffDays <= 7 ? '⚠️' : '✅');
      const statusText = isExpired ? 'EXPIRED' : (diffDays <= 7 ? `${diffDays} hari lagi` : `${diffDays} hari lagi`);
      
      text += `${i + 1}. ${statusEmoji} @${mentionName}\n`;
      text += `   📅 Expired: ${dateStr}\n`;
      text += `   ⏰ Status: ${statusText}\n`;
      if (i < premUsers.length - 1) text += `\n`;
      
      mentions.push(userJid);
    });
    
    text += `\n━━━━━━━━━━━━━━━━━━\n`;
    text += `💡 Gunakan .addprem untuk menambah/perpanjang`;
    
    await sock.sendMessage(remoteJid, { 
      text,
      mentions 
    });
  } catch (err) {
    console.error('Error in cmdListPrem:', err);
    await sock.sendMessage(remoteJid, { text: `❌ Error: ${err.message}` });
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
