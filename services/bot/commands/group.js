/**
 * Group Commands - Complete Implementation
 * kick, add, promote, demote, setname, setdesc, setppgc, linkgc, revoke
 * tagall, hidetag, listadmin, infogc, open, close, welcome, goodbye, antilink, antispam, mute
 * 
 * PENTING: Pengecekan groupOnly, adminOnly, dan botAdminRequired sudah dilakukan di botHandler.js
 * melalui CMD_META. Jadi di sini kita hanya perlu fokus pada logic command-nya saja.
 * Context yang diterima sudah berisi: isGroup, isAdmin, isBotAdmin, isOwner, groupMetadata
 */

// Helper function to get or create group settings using raw SQL (avoid Sequelize cache issues)
async function getGroupSettings(botId, groupId) {
  const { sequelize } = require('../../../config/database');
  
  let [results] = await sequelize.query(
    `SELECT * FROM Groups WHERE botId = ? AND groupId = ? LIMIT 1`,
    { replacements: [botId, groupId] }
  );
  
  if (!results[0]) {
    await sequelize.query(
      `INSERT INTO Groups (botId, groupId, createdAt, updatedAt) VALUES (?, ?, datetime('now'), datetime('now'))`,
      { replacements: [botId, groupId] }
    );
    
    [results] = await sequelize.query(
      `SELECT * FROM Groups WHERE botId = ? AND groupId = ? LIMIT 1`,
      { replacements: [botId, groupId] }
    );
  }
  
  return results[0];
}

// Helper function to update group settings
async function updateGroupSettings(botId, groupId, updates) {
  const { sequelize } = require('../../../config/database');
  
  const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), botId, groupId];
  
  await sequelize.query(
    `UPDATE Groups SET ${setClauses}, updatedAt = datetime('now') WHERE botId = ? AND groupId = ?`,
    { replacements: values }
  );
}

// Kick member - context sudah berisi isAdmin dan isBotAdmin dari botHandler
async function cmdKick(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin, isBotAdmin } = context;
  
  // Double check untuk keamanan (seharusnya sudah dicek di botHandler)
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  if (!isBotAdmin) {
    return await sock.sendMessage(remoteJid, { text: '❌ Bot bukan admin!' });
  }
  
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (!mentioned?.length) {
    return await sock.sendMessage(remoteJid, { text: '❌ Tag member yang ingin di-kick!\n\nContoh: .kick @user' });
  }
  
  try {
    await sock.groupParticipantsUpdate(remoteJid, mentioned, 'remove');
    await sock.sendMessage(remoteJid, { text: `✅ Berhasil kick ${mentioned.length} member` });
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal kick member' });
  }
}

// Add member
async function cmdAdd(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin, isBotAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  if (!isBotAdmin) {
    return await sock.sendMessage(remoteJid, { text: '❌ Bot bukan admin!' });
  }
  
  if (!args.length) {
    return await sock.sendMessage(remoteJid, { text: '❌ Masukkan nomor!\n\nContoh: .add 628xxx' });
  }
  
  let number = args[0].replace(/[^0-9]/g, '');
  if (!number.startsWith('62')) number = '62' + number.replace(/^0/, '');
  number = number + '@s.whatsapp.net';
  
  try {
    await sock.groupParticipantsUpdate(remoteJid, [number], 'add');
    await sock.sendMessage(remoteJid, { text: `✅ Berhasil menambahkan member` });
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal menambahkan. Mungkin nomor tidak valid atau sudah di grup.' });
  }
}

// Promote to admin
async function cmdPromote(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin, isBotAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  if (!isBotAdmin) {
    return await sock.sendMessage(remoteJid, { text: '❌ Bot bukan admin!' });
  }
  
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (!mentioned?.length) {
    return await sock.sendMessage(remoteJid, { text: '❌ Tag member!\n\nContoh: .promote @user' });
  }
  
  try {
    await sock.groupParticipantsUpdate(remoteJid, mentioned, 'promote');
    await sock.sendMessage(remoteJid, { text: `✅ Berhasil promote ${mentioned.length} member jadi admin` });
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal promote' });
  }
}

// Demote from admin
async function cmdDemote(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin, isBotAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  if (!isBotAdmin) {
    return await sock.sendMessage(remoteJid, { text: '❌ Bot bukan admin!' });
  }
  
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (!mentioned?.length) {
    return await sock.sendMessage(remoteJid, { text: '❌ Tag admin!\n\nContoh: .demote @user' });
  }
  
  try {
    await sock.groupParticipantsUpdate(remoteJid, mentioned, 'demote');
    await sock.sendMessage(remoteJid, { text: `✅ Berhasil demote ${mentioned.length} admin` });
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal demote' });
  }
}

// Set group name
async function cmdSetName(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin, isBotAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  if (!isBotAdmin) {
    return await sock.sendMessage(remoteJid, { text: '❌ Bot bukan admin!' });
  }
  
  if (!args.length) {
    return await sock.sendMessage(remoteJid, { text: '❌ Masukkan nama baru!\n\nContoh: .setname Nama Grup Baru' });
  }
  
  try {
    await sock.groupUpdateSubject(remoteJid, args.join(' '));
    await sock.sendMessage(remoteJid, { text: '✅ Nama grup berhasil diubah' });
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal mengubah nama grup' });
  }
}

// Set group description
async function cmdSetDesc(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin, isBotAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  if (!isBotAdmin) {
    return await sock.sendMessage(remoteJid, { text: '❌ Bot bukan admin!' });
  }
  
  try {
    await sock.groupUpdateDescription(remoteJid, args.join(' ') || '');
    await sock.sendMessage(remoteJid, { text: '✅ Deskripsi grup berhasil diubah' });
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal mengubah deskripsi' });
  }
}

// Get group link
async function cmdLinkGC(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isBotAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isBotAdmin) {
    return await sock.sendMessage(remoteJid, { text: '❌ Bot bukan admin!' });
  }
  
  try {
    const code = await sock.groupInviteCode(remoteJid);
    await sock.sendMessage(remoteJid, { text: `🔗 *Link Grup*\n\nhttps://chat.whatsapp.com/${code}` });
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal mendapatkan link' });
  }
}

// Revoke group link
async function cmdRevoke(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin, isBotAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  if (!isBotAdmin) {
    return await sock.sendMessage(remoteJid, { text: '❌ Bot bukan admin!' });
  }
  
  try {
    await sock.groupRevokeInvite(remoteJid);
    await sock.sendMessage(remoteJid, { text: '✅ Link grup berhasil direset' });
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal reset link' });
  }
}

// Tag all members
async function cmdTagAll(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  try {
    const groupMeta = await sock.groupMetadata(remoteJid);
    const participants = groupMeta.participants.map(p => p.id);
    
    let text = `📢 *TAG ALL*\n\n${args.join(' ') || 'Perhatian!'}\n\n`;
    participants.forEach(p => { text += `@${p.split('@')[0]}\n`; });
    
    await sock.sendMessage(remoteJid, { text, mentions: participants });
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal tag all' });
  }
}

// Hidden tag
async function cmdHideTag(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  try {
    const groupMeta = await sock.groupMetadata(remoteJid);
    const participants = groupMeta.participants.map(p => p.id);
    
    await sock.sendMessage(remoteJid, { 
      text: args.join(' ') || '📢 Perhatian!', 
      mentions: participants 
    });
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal hidetag' });
  }
}

// List admins
async function cmdListAdmin(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  try {
    const groupMeta = await sock.groupMetadata(remoteJid);
    const admins = groupMeta.participants.filter(p => p.admin);
    
    let text = `👑 *ADMIN GRUP*\n\n`;
    admins.forEach((a, i) => {
      text += `${i + 1}. @${a.id.split('@')[0]} ${a.admin === 'superadmin' ? '(Owner)' : ''}\n`;
    });
    
    await sock.sendMessage(remoteJid, { text, mentions: admins.map(a => a.id) });
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal mendapatkan list admin' });
  }
}

// Group info - Wibusoft style
async function cmdInfoGC(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  try {
    const { sequelize } = require('../../../config/database');
    const groupMeta = await sock.groupMetadata(remoteJid);
    
    // Get group settings from database using raw query to avoid Sequelize cache issues
    let [results] = await sequelize.query(
      `SELECT * FROM Groups WHERE botId = ? AND groupId = ? LIMIT 1`,
      { replacements: [bot.id, remoteJid] }
    );
    
    let groupSettings = results[0];
    
    // If not exists, create new record
    if (!groupSettings) {
      await sequelize.query(
        `INSERT INTO Groups (botId, groupId, name, createdAt, updatedAt) VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
        { replacements: [bot.id, remoteJid, groupMeta.subject] }
      );
      
      // Get the newly created record
      [results] = await sequelize.query(
        `SELECT * FROM Groups WHERE botId = ? AND groupId = ? LIMIT 1`,
        { replacements: [bot.id, remoteJid] }
      );
      groupSettings = results[0];
    }
    
    // Get group info
    const members = groupMeta.participants.length;
    const created = new Date(groupMeta.creation * 1000);
    const createdDate = created.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const createdTime = created.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    // Find group owner/creator - handle LID format
    const owner = groupMeta.participants.find(p => p.admin === 'superadmin');
    let ownerNumber = 'Unknown';
    
    if (owner) {
      // Check if owner has phoneNumber field (for LID format)
      if (owner.phoneNumber) {
        ownerNumber = owner.phoneNumber.replace(/[^0-9]/g, '');
      } else if (owner.id.endsWith('@lid')) {
        // LID format without phoneNumber - try to extract from lid
        // This is a fallback, might not always work
        ownerNumber = owner.id.split('@')[0];
      } else {
        // Regular format: 6281234567890@s.whatsapp.net or 6281234567890:123@s.whatsapp.net
        ownerNumber = owner.id.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
      }
    }
    
    // Also check groupMeta.owner if available (some groups have this)
    if (ownerNumber === 'Unknown' && groupMeta.owner) {
      ownerNumber = groupMeta.owner.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
    }
    
    // Format creator display
    const creatorDisplay = ownerNumber !== 'Unknown' && ownerNumber.length > 5 
      ? `wa.me/${ownerNumber}` 
      : 'Unknown';
    
    // Status icons
    const on = '✅';
    const off = '❌';
    
    // Helper function to check boolean (SQLite returns 0/1)
    const isOn = (val) => val === 1 || val === true || val === '1';
    
    // Build info text
    let infoText = `┌──「 *Group Info* 」
│ • *ID :* ${remoteJid}
│ • *Name :* ${groupMeta.subject}
│ • *Size :* ${members}
│ • *Creator :* ${creatorDisplay}
│ • *Creation :* ${createdDate} ${createdTime}
└────────────

┌──「 *Group Setting* 」
│ • *AntiDelete* ${isOn(groupSettings.antiDelete) ? on : off}
│ • *AntiLink* ${isOn(groupSettings.antiLink) ? on : off}
│ • *AntiLinkNoKick* ${isOn(groupSettings.antiLinkNoKick) ? on : off}
│ • *AntiBadword* ${isOn(groupSettings.antiBadword) ? on : off}
│ • *AntiBadwordNoKick* ${isOn(groupSettings.antiBadwordNoKick) ? on : off}
│ • *AntiBot* ${isOn(groupSettings.antiBot) ? on : off}
│ • *AntiWame* ${isOn(groupSettings.antiWame) ? on : off}
│ • *AntiWameNoKick* ${isOn(groupSettings.antiWameNoKick) ? on : off}
│ • *AntiLuar* ${isOn(groupSettings.antiLuar) ? on : off}
│ • *AntiViewOnce* ${isOn(groupSettings.antiViewOnce) ? on : off}
│ • *AntiMentionSW* ${isOn(groupSettings.antiMentionSW) ? on : off}
│ • *AntiLinkChannel* ${isOn(groupSettings.antiLinkChannel) ? on : off}
│ • *AntiSticker* ${isOn(groupSettings.antiSticker) ? on : off}
│ • *Demote Detector* ${isOn(groupSettings.demoteDetector) ? on : off}
│ • *Promote Detector* ${isOn(groupSettings.promoteDetector) ? on : off}
│ • *Left* ${isOn(groupSettings.leftEnabled) ? on : off}
│ • *Welcome* ${isOn(groupSettings.welcomeEnabled) ? on : off}
│ • *Mute* ${isOn(groupSettings.muteEnabled) ? on : off}
│ • *Self* ${isOn(groupSettings.selfMode) ? on : off}
│ • *Game* ${isOn(groupSettings.gamesEnabled) ? on : off}
│ • *Premium* ${isOn(groupSettings.premiumOnly) ? on : off}
│ • *Limit* ${groupSettings.limitType === 'unlimited' ? 'Unlimited' : (groupSettings.limitAmount || 30) + '(default)'}
└────────────

*Welcome Text*
${groupSettings.welcomeMessage || `Hi @{user} WELCOME TO ${groupMeta.subject.toUpperCase()}`}

*Left Text*
${groupSettings.leftMessage || 'Bye @{user}'}

*RULES*
${groupSettings.rules || '~ Belum diset ~'}

*Link GC:*`;

    // Try to get group link
    let linkText = '~ Bot bukan admin ~';
    try {
      const code = await sock.groupInviteCode(remoteJid);
      linkText = `https://chat.whatsapp.com/${code}`;
    } catch (e) {
      // Bot is not admin
    }
    
    infoText += `\n${linkText}`;
    
    // Try to get group profile picture
    let ppUrl = null;
    try {
      ppUrl = await sock.profilePictureUrl(remoteJid, 'image');
    } catch (e) {
      // No profile picture
    }
    
    // Send with image if available
    if (ppUrl) {
      const axios = require('axios');
      try {
        const response = await axios.get(ppUrl, { responseType: 'arraybuffer', timeout: 10000 });
        const imageBuffer = Buffer.from(response.data);
        
        await sock.sendMessage(remoteJid, {
          image: imageBuffer,
          caption: infoText
        });
      } catch (imgErr) {
        // Failed to get image, send text only
        await sock.sendMessage(remoteJid, { text: infoText });
      }
    } else {
      await sock.sendMessage(remoteJid, { text: infoText });
    }
    
  } catch (err) {
    console.error('Error in cmdInfoGC:', err.message);
    await sock.sendMessage(remoteJid, { text: '❌ Gagal mendapatkan info grup: ' + err.message });
  }
}

// Open group
async function cmdOpen(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin, isBotAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  if (!isBotAdmin) {
    return await sock.sendMessage(remoteJid, { text: '❌ Bot bukan admin!' });
  }
  
  try {
    await sock.groupSettingUpdate(remoteJid, 'not_announcement');
    await sock.sendMessage(remoteJid, { text: '✅ Grup dibuka! Semua member bisa chat.' });
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal membuka grup' });
  }
}

// Close group
async function cmdClose(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin, isBotAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  if (!isBotAdmin) {
    return await sock.sendMessage(remoteJid, { text: '❌ Bot bukan admin!' });
  }
  
  try {
    await sock.groupSettingUpdate(remoteJid, 'announcement');
    await sock.sendMessage(remoteJid, { text: '✅ Grup ditutup! Hanya admin yang bisa chat.' });
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal menutup grup' });
  }
}

// Welcome - on/off dan set message
async function cmdWelcome(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  try {
    const groupSettings = await getGroupSettings(bot.id, remoteJid);
    
    if (!args.length) {
      const status = groupSettings.welcomeEnabled ? '✅ ON' : '❌ OFF';
      return await sock.sendMessage(remoteJid, { 
        text: `👋 *WELCOME*\n\nStatus: ${status}\n\nPenggunaan:\n• .welcome on - Aktifkan\n• .welcome off - Nonaktifkan\n• .welcome set <pesan> - Set pesan welcome\n\nVariabel: {user}, {group}, {pushname}` 
      });
    }
    
    const action = args[0].toLowerCase();
    
    if (action === 'on') {
      await updateGroupSettings(bot.id, remoteJid, { welcomeEnabled: 1 });
      await sock.sendMessage(remoteJid, { text: '✅ Welcome diaktifkan!' });
    } else if (action === 'off') {
      await updateGroupSettings(bot.id, remoteJid, { welcomeEnabled: 0 });
      await sock.sendMessage(remoteJid, { text: '❌ Welcome dinonaktifkan!' });
    } else if (action === 'set') {
      const message = args.slice(1).join(' ');
      if (!message) {
        return await sock.sendMessage(remoteJid, { text: '❌ Masukkan pesan!\n\nContoh: .welcome set Hi {user} welcome to {group}!' });
      }
      await updateGroupSettings(bot.id, remoteJid, { welcomeMessage: message });
      await sock.sendMessage(remoteJid, { text: `✅ Pesan welcome diset:\n\n${message}` });
    } else {
      await sock.sendMessage(remoteJid, { text: '❌ Gunakan: .welcome on/off/set <pesan>' });
    }
  } catch (err) {
    console.error('Error in cmdWelcome:', err.message);
    await sock.sendMessage(remoteJid, { text: '❌ Error: ' + err.message });
  }
}

// Goodbye/Left - on/off dan set message
async function cmdGoodbye(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  try {
    const groupSettings = await getGroupSettings(bot.id, remoteJid);
    
    if (!args.length) {
      const status = groupSettings.leftEnabled ? '✅ ON' : '❌ OFF';
      return await sock.sendMessage(remoteJid, { 
        text: `👋 *GOODBYE/LEFT*\n\nStatus: ${status}\n\nPenggunaan:\n• .goodbye on - Aktifkan\n• .goodbye off - Nonaktifkan\n• .goodbye set <pesan> - Set pesan goodbye\n\nVariabel: {user}, {group}, {pushname}` 
      });
    }
    
    const action = args[0].toLowerCase();
    
    if (action === 'on') {
      await updateGroupSettings(bot.id, remoteJid, { leftEnabled: 1 });
      await sock.sendMessage(remoteJid, { text: '✅ Goodbye diaktifkan!' });
    } else if (action === 'off') {
      await updateGroupSettings(bot.id, remoteJid, { leftEnabled: 0 });
      await sock.sendMessage(remoteJid, { text: '❌ Goodbye dinonaktifkan!' });
    } else if (action === 'set') {
      const message = args.slice(1).join(' ');
      if (!message) {
        return await sock.sendMessage(remoteJid, { text: '❌ Masukkan pesan!\n\nContoh: .goodbye set Bye {user} 👋' });
      }
      await updateGroupSettings(bot.id, remoteJid, { leftMessage: message });
      await sock.sendMessage(remoteJid, { text: `✅ Pesan goodbye diset:\n\n${message}` });
    } else {
      await sock.sendMessage(remoteJid, { text: '❌ Gunakan: .goodbye on/off/set <pesan>' });
    }
  } catch (err) {
    console.error('Error in cmdGoodbye:', err.message);
    await sock.sendMessage(remoteJid, { text: '❌ Error: ' + err.message });
  }
}

// Antilink - on/off
async function cmdAntilink(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  try {
    const groupSettings = await getGroupSettings(bot.id, remoteJid);
    
    if (!args.length) {
      const status = groupSettings.antiLink ? '✅ ON' : '❌ OFF';
      return await sock.sendMessage(remoteJid, { 
        text: `🔗 *ANTILINK*\n\nStatus: ${status}\n\nPenggunaan:\n• .antilink on - Aktifkan (kick)\n• .antilink off - Nonaktifkan\n• .antilink warn - Aktifkan (warn only)` 
      });
    }
    
    const action = args[0].toLowerCase();
    
    if (action === 'on') {
      await updateGroupSettings(bot.id, remoteJid, { antiLink: 1, antiLinkNoKick: 0 });
      await sock.sendMessage(remoteJid, { text: '✅ Antilink diaktifkan! Member yang kirim link akan di-kick.' });
    } else if (action === 'off') {
      await updateGroupSettings(bot.id, remoteJid, { antiLink: 0, antiLinkNoKick: 0 });
      await sock.sendMessage(remoteJid, { text: '❌ Antilink dinonaktifkan!' });
    } else if (action === 'warn') {
      await updateGroupSettings(bot.id, remoteJid, { antiLink: 1, antiLinkNoKick: 1 });
      await sock.sendMessage(remoteJid, { text: '⚠️ Antilink diaktifkan (warn only)! Member yang kirim link akan diperingatkan.' });
    } else {
      await sock.sendMessage(remoteJid, { text: '❌ Gunakan: .antilink on/off/warn' });
    }
  } catch (err) {
    console.error('Error in cmdAntilink:', err.message);
    await sock.sendMessage(remoteJid, { text: '❌ Error: ' + err.message });
  }
}

// Antispam - on/off
async function cmdAntispam(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  try {
    const groupSettings = await getGroupSettings(bot.id, remoteJid);
    
    if (!args.length) {
      const status = groupSettings.antiSpam ? '✅ ON' : '❌ OFF';
      return await sock.sendMessage(remoteJid, { 
        text: `🚫 *ANTISPAM*\n\nStatus: ${status}\n\nPenggunaan:\n• .antispam on - Aktifkan\n• .antispam off - Nonaktifkan` 
      });
    }
    
    const action = args[0].toLowerCase();
    
    if (action === 'on') {
      await updateGroupSettings(bot.id, remoteJid, { antiSpam: 1 });
      await sock.sendMessage(remoteJid, { text: '✅ Antispam diaktifkan!' });
    } else if (action === 'off') {
      await updateGroupSettings(bot.id, remoteJid, { antiSpam: 0 });
      await sock.sendMessage(remoteJid, { text: '❌ Antispam dinonaktifkan!' });
    } else {
      await sock.sendMessage(remoteJid, { text: '❌ Gunakan: .antispam on/off' });
    }
  } catch (err) {
    console.error('Error in cmdAntispam:', err.message);
    await sock.sendMessage(remoteJid, { text: '❌ Error: ' + err.message });
  }
}

// Mute - on/off (bot tidak merespon di grup)
async function cmdMute(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  try {
    const groupSettings = await getGroupSettings(bot.id, remoteJid);
    
    if (!args.length) {
      const status = groupSettings.muteEnabled ? '✅ ON (Bot tidak merespon)' : '❌ OFF';
      return await sock.sendMessage(remoteJid, { 
        text: `🔇 *MUTE*\n\nStatus: ${status}\n\nPenggunaan:\n• .mute on - Bot tidak merespon di grup ini\n• .mute off - Bot merespon normal` 
      });
    }
    
    const action = args[0].toLowerCase();
    
    if (action === 'on') {
      await updateGroupSettings(bot.id, remoteJid, { muteEnabled: 1 });
      await sock.sendMessage(remoteJid, { text: '🔇 Bot di-mute! Bot tidak akan merespon di grup ini.' });
    } else if (action === 'off') {
      await updateGroupSettings(bot.id, remoteJid, { muteEnabled: 0 });
      await sock.sendMessage(remoteJid, { text: '🔊 Bot unmuted! Bot akan merespon normal.' });
    } else {
      await sock.sendMessage(remoteJid, { text: '❌ Gunakan: .mute on/off' });
    }
  } catch (err) {
    console.error('Error in cmdMute:', err.message);
    await sock.sendMessage(remoteJid, { text: '❌ Error: ' + err.message });
  }
}

// Set Rules
async function cmdSetRules(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  try {
    const { Group } = require('../../../models');
    const groupSettings = await getGroupSettings(bot.id, remoteJid);
    
    if (!args.length) {
      const rules = groupSettings.rules || '~ Belum diset ~';
      return await sock.sendMessage(remoteJid, { 
        text: `📜 *RULES*\n\n${rules}\n\n─────────────\nUntuk set rules:\n.setrules <aturan grup>` 
      });
    }
    
    const rules = args.join(' ');
    await updateGroupSettings(bot.id, remoteJid, { rules });
    await sock.sendMessage(remoteJid, { text: `✅ Rules diset:\n\n${rules}` });
  } catch (err) {
    console.error('Error in cmdSetRules:', err.message);
    await sock.sendMessage(remoteJid, { text: '❌ Error: ' + err.message });
  }
}

// Generic group setting toggle
async function cmdGroupSetting(sock, msg, bot, args, context = {}, settingName, settingField, displayName) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  try {
    const groupSettings = await getGroupSettings(bot.id, remoteJid);
    
    if (!args.length) {
      const status = groupSettings[settingField] ? '✅ ON' : '❌ OFF';
      return await sock.sendMessage(remoteJid, { 
        text: `⚙️ *${displayName}*\n\nStatus: ${status}\n\nPenggunaan:\n• .${settingName} on\n• .${settingName} off` 
      });
    }
    
    const action = args[0].toLowerCase();
    
    if (action === 'on') {
      await updateGroupSettings(bot.id, remoteJid, { [settingField]: 1 });
      await sock.sendMessage(remoteJid, { text: `✅ ${displayName} diaktifkan!` });
    } else if (action === 'off') {
      await updateGroupSettings(bot.id, remoteJid, { [settingField]: 0 });
      await sock.sendMessage(remoteJid, { text: `❌ ${displayName} dinonaktifkan!` });
    } else {
      await sock.sendMessage(remoteJid, { text: `❌ Gunakan: .${settingName} on/off` });
    }
  } catch (err) {
    console.error(`Error in cmd${displayName}:`, err.message);
    await sock.sendMessage(remoteJid, { text: '❌ Error: ' + err.message });
  }
}

// Anti features
async function cmdAntidelete(sock, msg, bot, args, context = {}) {
  return cmdGroupSetting(sock, msg, bot, args, context, 'antidelete', 'antiDelete', 'AntiDelete');
}

async function cmdAntibot(sock, msg, bot, args, context = {}) {
  return cmdGroupSetting(sock, msg, bot, args, context, 'antibot', 'antiBot', 'AntiBot');
}

async function cmdAntiwame(sock, msg, bot, args, context = {}) {
  return cmdGroupSetting(sock, msg, bot, args, context, 'antiwame', 'antiWame', 'AntiWame');
}

async function cmdAntiluar(sock, msg, bot, args, context = {}) {
  return cmdGroupSetting(sock, msg, bot, args, context, 'antiluar', 'antiLuar', 'AntiLuar');
}

async function cmdAntiviewonce(sock, msg, bot, args, context = {}) {
  return cmdGroupSetting(sock, msg, bot, args, context, 'antiviewonce', 'antiViewOnce', 'AntiViewOnce');
}

async function cmdAntibadword(sock, msg, bot, args, context = {}) {
  return cmdGroupSetting(sock, msg, bot, args, context, 'antibadword', 'antiBadword', 'AntiBadword');
}

async function cmdAntisticker(sock, msg, bot, args, context = {}) {
  return cmdGroupSetting(sock, msg, bot, args, context, 'antisticker', 'antiSticker', 'AntiSticker');
}

async function cmdAntilinkchannel(sock, msg, bot, args, context = {}) {
  return cmdGroupSetting(sock, msg, bot, args, context, 'antilinkchannel', 'antiLinkChannel', 'AntiLinkChannel');
}

// Game toggle
async function cmdGame(sock, msg, bot, args, context = {}) {
  return cmdGroupSetting(sock, msg, bot, args, context, 'game', 'gamesEnabled', 'Game');
}

// Set group photo
async function cmdSetPPGC(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin, isBotAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasImage = msg.message?.imageMessage || quotedMsg?.imageMessage;
  
  if (!hasImage) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kirim/reply gambar dengan caption .setppgc' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  if (!isBotAdmin) {
    return await sock.sendMessage(remoteJid, { text: '❌ Bot bukan admin!' });
  }
  
  try {
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const buffer = await downloadMediaMessage(
      quotedMsg?.imageMessage ? { message: { imageMessage: quotedMsg.imageMessage } } : msg,
      'buffer', {}
    );
    
    await sock.updateProfilePicture(remoteJid, buffer);
    await sock.sendMessage(remoteJid, { text: '✅ Foto grup berhasil diubah' });
  } catch (err) {
    await sock.sendMessage(remoteJid, { text: '❌ Gagal mengubah foto grup' });
  }
}

module.exports = {
  kick: cmdKick, tendang: cmdKick,
  add: cmdAdd, tambah: cmdAdd,
  promote: cmdPromote, jadiadmin: cmdPromote,
  demote: cmdDemote, hapusadmin: cmdDemote,
  setname: cmdSetName, setnamegc: cmdSetName,
  setdesc: cmdSetDesc, setdescgc: cmdSetDesc,
  setppgc: cmdSetPPGC, setfotogc: cmdSetPPGC,
  linkgc: cmdLinkGC, linkgrup: cmdLinkGC,
  revoke: cmdRevoke, resetlink: cmdRevoke,
  tagall: cmdTagAll, mentionall: cmdTagAll,
  hidetag: cmdHideTag, ht: cmdHideTag,
  listadmin: cmdListAdmin, admins: cmdListAdmin,
  infogc: cmdInfoGC, gcinfo: cmdInfoGC, infogroup: cmdInfoGC,
  open: cmdOpen, buka: cmdOpen,
  close: cmdClose, tutup: cmdClose,
  welcome: cmdWelcome, setwelcome: cmdWelcome,
  goodbye: cmdGoodbye, setgoodbye: cmdGoodbye, left: cmdGoodbye,
  antilink: cmdAntilink,
  antispam: cmdAntispam,
  mute: cmdMute, mutegc: cmdMute,
  setrules: cmdSetRules, rules: cmdSetRules,
  antidelete: cmdAntidelete,
  antibot: cmdAntibot,
  antiwame: cmdAntiwame,
  antiluar: cmdAntiluar,
  antiviewonce: cmdAntiviewonce,
  antibadword: cmdAntibadword,
  antisticker: cmdAntisticker,
  antilinkchannel: cmdAntilinkchannel,
  game: cmdGame
};
