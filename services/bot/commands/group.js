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
  const { isGroup, isAdmin, isBotAdmin, senderPhone } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  if (!isBotAdmin) {
    return await sock.sendMessage(remoteJid, { text: '❌ Bot bukan admin!' });
  }
  
  // Get target user from mention OR reply
  let targets = [];
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
  
  if (mentioned?.length) {
    targets = mentioned;
  } else if (quotedParticipant) {
    targets = [quotedParticipant];
  }
  
  if (!targets.length) {
    return await sock.sendMessage(remoteJid, { text: '❌ Tag member atau reply pesan!\n\nContoh:\n• .promote @user\n• Reply pesan dengan .promote' });
  }
  
  try {
    await sock.groupParticipantsUpdate(remoteJid, targets, 'promote');
    
    // Use promoteTextMessage from bot settings
    const promoteTemplate = bot.promoteTextMessage || '*PROMOTE DETECTED*\nTerdeteksi @{sender} Telah Menjadi Admin Group Oleh @{author}';
    const author = senderPhone || msg.key.participant || msg.key.remoteJid;
    
    // Send message for each promoted user
    for (const user of targets) {
      const promoteMsg = promoteTemplate
        .replace(/{sender}/g, user.split('@')[0])
        .replace(/{author}/g, author.split('@')[0]);
      
      await sock.sendMessage(remoteJid, { 
        text: promoteMsg,
        mentions: [user, author]
      });
    }
  } catch (err) {
    console.error('Promote error:', err);
    await sock.sendMessage(remoteJid, { text: '❌ Gagal promote' });
  }
}

// Demote from admin
async function cmdDemote(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin, isBotAdmin, senderPhone } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  if (!isBotAdmin) {
    return await sock.sendMessage(remoteJid, { text: '❌ Bot bukan admin!' });
  }
  
  // Get target user from mention OR reply
  let targets = [];
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
  
  if (mentioned?.length) {
    targets = mentioned;
  } else if (quotedParticipant) {
    targets = [quotedParticipant];
  }
  
  if (!targets.length) {
    return await sock.sendMessage(remoteJid, { text: '❌ Tag admin atau reply pesan!\n\nContoh:\n• .demote @user\n• Reply pesan dengan .demote' });
  }
  
  try {
    await sock.groupParticipantsUpdate(remoteJid, targets, 'demote');
    
    // Use demoteTextMessage from bot settings
    const demoteTemplate = bot.demoteTextMessage || '*DEMOTE DETECTED*\nTerdeteksi @{sender} Telah Di Unadmin Oleh @{author}';
    const author = senderPhone || msg.key.participant || msg.key.remoteJid;
    
    // Send message for each demoted user
    for (const user of targets) {
      const demoteMsg = demoteTemplate
        .replace(/{sender}/g, user.split('@')[0])
        .replace(/{author}/g, author.split('@')[0]);
      
      await sock.sendMessage(remoteJid, { 
        text: demoteMsg,
        mentions: [user, author]
      });
    }
  } catch (err) {
    console.error('Demote error:', err);
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
    
    // Get AFK users to exclude them
    const groupSettings = await getGroupSettings(bot.id, remoteJid);
    let afkUsers = [];
    try {
      afkUsers = JSON.parse(groupSettings.afkUsers || '[]');
    } catch (e) {
      afkUsers = [];
    }
    const afkNumbers = afkUsers.map(u => u.number);
    
    // Filter out AFK users from participants
    const participants = groupMeta.participants
      .map(p => p.id)
      .filter(jid => {
        const number = jid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
        return !afkNumbers.includes(number);
      });
    
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
    
    // Get AFK users to exclude them
    const groupSettings = await getGroupSettings(bot.id, remoteJid);
    let afkUsers = [];
    try {
      afkUsers = JSON.parse(groupSettings.afkUsers || '[]');
    } catch (e) {
      afkUsers = [];
    }
    const afkNumbers = afkUsers.map(u => u.number);
    
    // Filter out AFK users from participants
    const participants = groupMeta.participants
      .map(p => p.id)
      .filter(jid => {
        const number = jid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
        return !afkNumbers.includes(number);
      });
    
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

// Whitelist GC - Proteksi admin yang di-whitelist
async function cmdWhitelistGC(sock, msg, bot, args, context = {}) {
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
    let whitelist = [];
    try {
      whitelist = JSON.parse(groupSettings.whitelist || '[]');
    } catch (e) {
      whitelist = [];
    }
    
    if (!args.length) {
      // Show whitelist status and list
      const status = groupSettings.whitelistEnabled ? '✅ ON' : '❌ OFF';
      let listText = whitelist.length > 0 
        ? whitelist.map((num, i) => `${i + 1}. @${num}`).join('\n')
        : '~ Kosong ~';
      
      return await sock.sendMessage(remoteJid, { 
        text: `🛡️ *WHITELIST PROTECTION*\n\nStatus: ${status}\n\n📋 *Daftar Whitelist:*\n${listText}\n\n─────────────\n*Penggunaan:*\n• .wlgc on - Aktifkan proteksi\n• .wlgc off - Nonaktifkan\n• .wlgc add @user - Tambah via tag\n• .wlgc add 628xxx - Tambah via nomor\n• .wlgc del @user - Hapus via tag\n• .wlgc del 628xxx - Hapus via nomor\n• .wlgc clear - Hapus semua\n\n⚠️ *Catatan:*\nJika admin non-whitelist kick member whitelist, maka admin tersebut akan di-kick dan masuk blacklist!`,
        mentions: whitelist.map(num => num + '@s.whatsapp.net')
      });
    }
    
    const action = args[0].toLowerCase();
    
    if (action === 'on') {
      await updateGroupSettings(bot.id, remoteJid, { whitelistEnabled: 1 });
      await sock.sendMessage(remoteJid, { text: '✅ Whitelist protection diaktifkan!\n\nAdmin yang di-whitelist akan dilindungi.' });
    } else if (action === 'off') {
      await updateGroupSettings(bot.id, remoteJid, { whitelistEnabled: 0 });
      await sock.sendMessage(remoteJid, { text: '❌ Whitelist protection dinonaktifkan!' });
    } else if (action === 'add') {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      
      // Check if user provided a number directly (not tag)
      const numberArg = args[1]?.replace(/[^0-9]/g, '');
      
      if (!mentioned?.length && !numberArg) {
        return await sock.sendMessage(remoteJid, { text: '❌ Tag user atau masukkan nomor!\n\nContoh:\n• .wlgc add @user\n• .wlgc add 6281234567890' });
      }
      
      let added = [];
      
      // If number provided directly
      if (numberArg && numberArg.length >= 10) {
        let number = numberArg;
        // Normalize to 62 format
        if (number.startsWith('0')) {
          number = '62' + number.substring(1);
        } else if (!number.startsWith('62')) {
          number = '62' + number;
        }
        
        if (!whitelist.includes(number)) {
          whitelist.push(number);
          added.push(number);
        }
      }
      
      // If mentioned users
      if (mentioned?.length) {
        // Get group metadata to resolve LID to phone number
        let groupMetadata = null;
        try {
          groupMetadata = await sock.groupMetadata(remoteJid);
        } catch (e) {
          console.error('Failed to get group metadata:', e.message);
        }
        
        for (const jid of mentioned) {
          let number = jid.split('@')[0].split(':')[0];
          
          // If it's a LID format, try to resolve to phone number
          if (jid.endsWith('@lid') && groupMetadata) {
            const participant = groupMetadata.participants.find(p => p.id === jid || p.lid === jid);
            if (participant) {
              if (participant.id && !participant.id.endsWith('@lid')) {
                number = participant.id.split('@')[0].split(':')[0];
              } else if (participant.phoneNumber) {
                number = participant.phoneNumber.replace(/[^0-9]/g, '');
              }
            }
          }
          
          // Clean the number
          number = number.replace(/[^0-9]/g, '');
          
          if (number && !whitelist.includes(number)) {
            whitelist.push(number);
            added.push(number);
          }
        }
      }
      
      if (added.length > 0) {
        await updateGroupSettings(bot.id, remoteJid, { whitelist: JSON.stringify(whitelist) });
        await sock.sendMessage(remoteJid, { 
          text: `✅ Berhasil menambahkan ${added.length} user ke whitelist:\n${added.map(n => `• ${n}`).join('\n')}`,
          mentions: mentioned || []
        });
      } else {
        await sock.sendMessage(remoteJid, { text: '⚠️ Semua user sudah ada di whitelist!' });
      }
    } else if (action === 'del' || action === 'remove') {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      
      // Check if user provided a number directly
      const numberArg = args[1]?.replace(/[^0-9]/g, '');
      
      if (!mentioned?.length && !numberArg) {
        return await sock.sendMessage(remoteJid, { text: '❌ Tag user atau masukkan nomor!\n\nContoh:\n• .wlgc del @user\n• .wlgc del 6281234567890' });
      }
      
      let removed = [];
      
      // If number provided directly
      if (numberArg && numberArg.length >= 10) {
        let number = numberArg;
        // Normalize to 62 format
        if (number.startsWith('0')) {
          number = '62' + number.substring(1);
        } else if (!number.startsWith('62')) {
          number = '62' + number;
        }
        
        // Try to find and remove (check various formats)
        for (let i = whitelist.length - 1; i >= 0; i--) {
          const wl = whitelist[i];
          if (wl === number || wl === numberArg || 
              wl.endsWith(numberArg) || numberArg.endsWith(wl)) {
            removed.push(whitelist.splice(i, 1)[0]);
            break;
          }
        }
      }
      
      // If mentioned users
      if (mentioned?.length) {
        // Get group metadata to resolve LID to phone number
        let groupMetadata = null;
        try {
          groupMetadata = await sock.groupMetadata(remoteJid);
        } catch (e) {
          console.error('Failed to get group metadata:', e.message);
        }
        
        for (const jid of mentioned) {
          let number = jid.split('@')[0].split(':')[0];
          
          // If it's a LID format, try to resolve to phone number
          if (jid.endsWith('@lid') && groupMetadata) {
            const participant = groupMetadata.participants.find(p => p.id === jid || p.lid === jid);
            if (participant) {
              if (participant.id && !participant.id.endsWith('@lid')) {
                number = participant.id.split('@')[0].split(':')[0];
              } else if (participant.phoneNumber) {
                number = participant.phoneNumber.replace(/[^0-9]/g, '');
              }
            }
          }
          
          number = number.replace(/[^0-9]/g, '');
          
          const index = whitelist.indexOf(number);
          if (index > -1) {
            whitelist.splice(index, 1);
            removed.push(number);
          }
        }
      }
      
      if (removed.length > 0) {
        await updateGroupSettings(bot.id, remoteJid, { whitelist: JSON.stringify(whitelist) });
        await sock.sendMessage(remoteJid, { 
          text: `✅ Berhasil menghapus ${removed.length} user dari whitelist:\n${removed.map(n => `• ${n}`).join('\n')}`,
          mentions: mentioned || []
        });
      } else {
        await sock.sendMessage(remoteJid, { text: '⚠️ User tidak ditemukan di whitelist!' });
      }
    } else if (action === 'clear') {
      await updateGroupSettings(bot.id, remoteJid, { whitelist: '[]' });
      await sock.sendMessage(remoteJid, { text: '✅ Whitelist berhasil dikosongkan!' });
    } else {
      await sock.sendMessage(remoteJid, { text: '❌ Gunakan: .whitelistgc on/off/add/del/clear' });
    }
  } catch (err) {
    console.error('Error in cmdWhitelistGC:', err.message);
    await sock.sendMessage(remoteJid, { text: '❌ Error: ' + err.message });
  }
}

// Blacklist GC - Lihat daftar blacklist
async function cmdBlacklistGC(sock, msg, bot, args, context = {}) {
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
    let blacklist = [];
    try {
      blacklist = JSON.parse(groupSettings.blacklist || '[]');
    } catch (e) {
      blacklist = [];
    }
    
    if (!args.length) {
      // Show blacklist
      let listText = blacklist.length > 0 
        ? blacklist.map((num, i) => `${i + 1}. @${num}`).join('\n')
        : '~ Kosong ~';
      
      return await sock.sendMessage(remoteJid, { 
        text: `🚫 *BLACKLIST*\n\n📋 *Daftar Blacklist:*\n${listText}\n\n─────────────\n*Penggunaan:*\n• .blacklistgc add @user - Tambah ke blacklist\n• .blacklistgc del @user - Hapus dari blacklist\n• .blacklistgc clear - Hapus semua\n\n⚠️ *Catatan:*\nUser di blacklist adalah admin yang pernah kick admin whitelist.`,
        mentions: blacklist.map(num => num + '@s.whatsapp.net')
      });
    }
    
    const action = args[0].toLowerCase();
    
    if (action === 'add') {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return await sock.sendMessage(remoteJid, { text: '❌ Tag user yang ingin ditambahkan!\n\nContoh: .blacklistgc add @user' });
      }
      
      // Get group metadata to resolve LID to phone number
      let groupMetadata = null;
      try {
        groupMetadata = await sock.groupMetadata(remoteJid);
      } catch (e) {
        console.error('Failed to get group metadata:', e.message);
      }
      
      let added = [];
      for (const jid of mentioned) {
        let number = jid.split('@')[0].split(':')[0];
        
        // If it's a LID format, try to resolve to phone number
        if (jid.endsWith('@lid') && groupMetadata) {
          const participant = groupMetadata.participants.find(p => p.id === jid || p.lid === jid);
          if (participant) {
            if (participant.id && !participant.id.endsWith('@lid')) {
              number = participant.id.split('@')[0].split(':')[0];
            } else if (participant.phoneNumber) {
              number = participant.phoneNumber.replace(/[^0-9]/g, '');
            }
          }
        }
        
        number = number.replace(/[^0-9]/g, '');
        
        if (number && !blacklist.includes(number)) {
          blacklist.push(number);
          added.push(number);
        }
      }
      
      if (added.length > 0) {
        await updateGroupSettings(bot.id, remoteJid, { blacklist: JSON.stringify(blacklist) });
        await sock.sendMessage(remoteJid, { 
          text: `✅ Berhasil menambahkan ${added.length} user ke blacklist:\n${added.map(n => `• ${n}`).join('\n')}`,
          mentions: mentioned
        });
      } else {
        await sock.sendMessage(remoteJid, { text: '⚠️ Semua user sudah ada di blacklist!' });
      }
    } else if (action === 'del' || action === 'remove') {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return await sock.sendMessage(remoteJid, { text: '❌ Tag user yang ingin dihapus!\n\nContoh: .blacklistgc del @user' });
      }
      
      // Get group metadata to resolve LID to phone number
      let groupMetadata = null;
      try {
        groupMetadata = await sock.groupMetadata(remoteJid);
      } catch (e) {
        console.error('Failed to get group metadata:', e.message);
      }
      
      let removed = [];
      for (const jid of mentioned) {
        let number = jid.split('@')[0].split(':')[0];
        
        // If it's a LID format, try to resolve to phone number
        if (jid.endsWith('@lid') && groupMetadata) {
          const participant = groupMetadata.participants.find(p => p.id === jid || p.lid === jid);
          if (participant) {
            if (participant.id && !participant.id.endsWith('@lid')) {
              number = participant.id.split('@')[0].split(':')[0];
            } else if (participant.phoneNumber) {
              number = participant.phoneNumber.replace(/[^0-9]/g, '');
            }
          }
        }
        
        number = number.replace(/[^0-9]/g, '');
        
        const index = blacklist.indexOf(number);
        if (index > -1) {
          blacklist.splice(index, 1);
          removed.push(number);
        }
      }
      
      if (removed.length > 0) {
        await updateGroupSettings(bot.id, remoteJid, { blacklist: JSON.stringify(blacklist) });
        await sock.sendMessage(remoteJid, { 
          text: `✅ Berhasil menghapus ${removed.length} user dari blacklist:\n${removed.map(n => `• ${n}`).join('\n')}`,
          mentions: mentioned
        });
      } else {
        await sock.sendMessage(remoteJid, { text: '⚠️ User tidak ditemukan di blacklist!' });
      }
    } else if (action === 'clear') {
      await updateGroupSettings(bot.id, remoteJid, { blacklist: '[]' });
      await sock.sendMessage(remoteJid, { text: '✅ Blacklist berhasil dikosongkan!' });
    } else {
      await sock.sendMessage(remoteJid, { text: '❌ Gunakan: .blacklistgc add/del/clear' });
    }
  } catch (err) {
    console.error('Error in cmdBlacklistGC:', err.message);
    await sock.sendMessage(remoteJid, { text: '❌ Error: ' + err.message });
  }
}

// AFK - Set status AFK
async function cmdAFK(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  try {
    const sender = msg.key.participant || msg.key.remoteJid;
    let senderNumber = sender.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
    
    // Resolve LID to phone number if needed
    if (sender.endsWith('@lid')) {
      try {
        const groupMeta = await sock.groupMetadata(remoteJid);
        const participant = groupMeta?.participants?.find(p => p.id === sender);
        if (participant && participant.phoneNumber) {
          senderNumber = participant.phoneNumber.replace(/[^0-9]/g, '');
        }
      } catch (e) {}
    }
    
    const groupSettings = await getGroupSettings(bot.id, remoteJid);
    let afkUsers = [];
    try {
      afkUsers = JSON.parse(groupSettings.afkUsers || '[]');
    } catch (e) {
      afkUsers = [];
    }
    
    // Check if already AFK
    const existingAfk = afkUsers.find(u => u.number === senderNumber);
    if (existingAfk) {
      return await sock.sendMessage(remoteJid, { 
        text: `⚠️ Kamu sudah dalam mode AFK!\n\nAlasan: ${existingAfk.reason}\nSejak: ${new Date(existingAfk.time).toLocaleString('id-ID')}\n\nKetik apapun untuk keluar dari mode AFK.` 
      });
    }
    
    // Set AFK
    const reason = args.join(' ') || 'Tidak ada alasan';
    afkUsers.push({
      number: senderNumber,
      jid: sender,
      reason: reason,
      time: Date.now()
    });
    
    await updateGroupSettings(bot.id, remoteJid, { afkUsers: JSON.stringify(afkUsers) });
    
    // Get pushName for mention
    const { getMentionName } = require('../utils');
    const groupMetadata = await sock.groupMetadata(remoteJid);
    const mentionName = getMentionName(groupMetadata, sender, senderNumber);
    
    await sock.sendMessage(remoteJid, { 
      text: `💤 *AFK MODE AKTIF*\n\n@${mentionName} sekarang AFK\nAlasan: ${reason}\n\n⚠️ Bot tidak akan mention kamu di tagall/hidetag/totag\n⚠️ Mention manual dari user lain akan dihapus otomatis`,
      mentions: [sender]
    });
  } catch (err) {
    console.error('Error in cmdAFK:', err.message);
    await sock.sendMessage(remoteJid, { text: '❌ Error: ' + err.message });
  }
}

// ToTag - Reply message dengan mention semua member (hidetag)
async function cmdToTag(sock, msg, bot, args, context = {}) {
  const remoteJid = msg.key.remoteJid;
  const { isGroup, isAdmin } = context;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Perintah ini hanya untuk grup!' });
  }
  
  if (!isAdmin && !context.isOwner) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu bukan admin!' });
  }
  
  try {
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!quotedMsg) {
      return await sock.sendMessage(remoteJid, { 
        text: '❌ Reply pesan yang ingin di-totag!\n\nContoh:\nReply gambar/video/text dengan caption .totag' 
      });
    }
    
    const groupMeta = await sock.groupMetadata(remoteJid);
    
    // Get AFK users to exclude them
    const groupSettings = await getGroupSettings(bot.id, remoteJid);
    let afkUsers = [];
    try {
      afkUsers = JSON.parse(groupSettings.afkUsers || '[]');
    } catch (e) {
      afkUsers = [];
    }
    const afkNumbers = afkUsers.map(u => u.number);
    
    // Filter out AFK users from participants
    const participants = groupMeta.participants
      .map(p => p.id)
      .filter(jid => {
        const number = jid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
        return !afkNumbers.includes(number);
      });
    
    // Prepare message based on quoted message type
    let messageToSend = {};
    
    if (quotedMsg.conversation) {
      messageToSend = { 
        text: quotedMsg.conversation,
        mentions: participants 
      };
    } else if (quotedMsg.extendedTextMessage) {
      messageToSend = { 
        text: quotedMsg.extendedTextMessage.text,
        mentions: participants 
      };
    } else if (quotedMsg.imageMessage) {
      const { downloadMediaMessage } = require('@whiskeysockets/baileys');
      const buffer = await downloadMediaMessage(
        { message: { imageMessage: quotedMsg.imageMessage } },
        'buffer', {}
      );
      messageToSend = {
        image: buffer,
        caption: quotedMsg.imageMessage.caption || '',
        mentions: participants
      };
    } else if (quotedMsg.videoMessage) {
      const { downloadMediaMessage } = require('@whiskeysockets/baileys');
      const buffer = await downloadMediaMessage(
        { message: { videoMessage: quotedMsg.videoMessage } },
        'buffer', {}
      );
      messageToSend = {
        video: buffer,
        caption: quotedMsg.videoMessage.caption || '',
        mentions: participants
      };
    } else if (quotedMsg.stickerMessage) {
      const { downloadMediaMessage } = require('@whiskeysockets/baileys');
      const buffer = await downloadMediaMessage(
        { message: { stickerMessage: quotedMsg.stickerMessage } },
        'buffer', {}
      );
      messageToSend = {
        sticker: buffer,
        mentions: participants
      };
    } else if (quotedMsg.audioMessage) {
      const { downloadMediaMessage } = require('@whiskeysockets/baileys');
      const buffer = await downloadMediaMessage(
        { message: { audioMessage: quotedMsg.audioMessage } },
        'buffer', {}
      );
      messageToSend = {
        audio: buffer,
        mimetype: 'audio/mp4',
        mentions: participants
      };
    } else if (quotedMsg.documentMessage) {
      const { downloadMediaMessage } = require('@whiskeysockets/baileys');
      const buffer = await downloadMediaMessage(
        { message: { documentMessage: quotedMsg.documentMessage } },
        'buffer', {}
      );
      messageToSend = {
        document: buffer,
        mimetype: quotedMsg.documentMessage.mimetype,
        fileName: quotedMsg.documentMessage.fileName,
        caption: quotedMsg.documentMessage.caption || '',
        mentions: participants
      };
    } else {
      return await sock.sendMessage(remoteJid, { text: '❌ Tipe pesan tidak didukung!' });
    }
    
    await sock.sendMessage(remoteJid, messageToSend);
    
    // Delete the command message
    try {
      await sock.sendMessage(remoteJid, { delete: msg.key });
    } catch (e) {}
    
  } catch (err) {
    console.error('Error in cmdToTag:', err.message);
    await sock.sendMessage(remoteJid, { text: '❌ Error: ' + err.message });
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
  hidetag: cmdHideTag, ht: cmdHideTag, h: cmdHideTag,
  totag: cmdToTag, tt: cmdToTag,
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
  game: cmdGame,
  whitelistgc: cmdWhitelistGC, wlgc: cmdWhitelistGC,
  blacklistgc: cmdBlacklistGC, blgc: cmdBlacklistGC,
  afk: cmdAFK
};
