/**
 * Maker Commands - Complete Implementation
 * logo, attp, ttp, welcome1, welcome2, goodbye1, goodbye2, carbon
 * certificate, lovemsg, wanted, jail, triggered, wasted, trash
 */

const axios = require('axios');

// Text to Picture
async function cmdTTP(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan teks!\n\nContoh: .ttp Hello World' });
  }
  
  const text = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Membuat gambar...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/m/ttp?text=${encodeURIComponent(text)}`, {
      timeout: 15000,
      responseType: 'arraybuffer'
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      sticker: Buffer.from(response.data)
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal membuat gambar' });
  }
}

// Animated Text to Picture
async function cmdATTP(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan teks!\n\nContoh: .attp Hello World' });
  }
  
  const text = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Membuat sticker animasi...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/m/attp?text=${encodeURIComponent(text)}`, {
      timeout: 15000,
      responseType: 'arraybuffer'
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      sticker: Buffer.from(response.data)
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal membuat sticker' });
  }
}

// Logo Text
async function cmdLogo(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan teks!\n\nContoh: .logo MyBrand' });
  }
  
  const text = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Membuat logo...' });
    
    // Use textpro.me style API
    const response = await axios.get(`https://api.siputzx.my.id/api/m/textpro?text=${encodeURIComponent(text)}&style=neon`, {
      timeout: 20000,
      responseType: 'arraybuffer'
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: Buffer.from(response.data),
      caption: `🎨 *Logo: ${text}*`
    });
  } catch (err) {
    // Fallback to simple text image
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal membuat logo. Coba lagi.' });
  }
}

// Carbon Code
async function cmdCarbon(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan code!\n\nContoh: .carbon console.log("Hello")' });
  }
  
  const code = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Membuat carbon...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/m/carbon?code=${encodeURIComponent(code)}`, {
      timeout: 20000,
      responseType: 'arraybuffer'
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: Buffer.from(response.data),
      caption: '💻 *Carbon Code*'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal membuat carbon' });
  }
}

// Welcome Card 1
async function cmdWelcome1(sock, msg, bot, args) {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  const target = mentioned?.[0] || msg.key.participant || msg.key.remoteJid;
  const name = args.join(' ') || target.split('@')[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Membuat welcome card...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/m/welcome?name=${encodeURIComponent(name)}&bg=1`, {
      timeout: 20000,
      responseType: 'arraybuffer'
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: Buffer.from(response.data),
      caption: `👋 *Welcome ${name}!*`
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: `👋 *Welcome ${name}!*\n\nSelamat datang di grup!` });
  }
}

// Welcome Card 2
async function cmdWelcome2(sock, msg, bot, args) {
  return cmdWelcome1(sock, msg, bot, args);
}

// Goodbye Card 1
async function cmdGoodbye1(sock, msg, bot, args) {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  const target = mentioned?.[0] || msg.key.participant || msg.key.remoteJid;
  const name = args.join(' ') || target.split('@')[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Membuat goodbye card...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/m/goodbye?name=${encodeURIComponent(name)}`, {
      timeout: 20000,
      responseType: 'arraybuffer'
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: Buffer.from(response.data),
      caption: `👋 *Goodbye ${name}!*`
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: `👋 *Goodbye ${name}!*\n\nSampai jumpa lagi!` });
  }
}

// Goodbye Card 2
async function cmdGoodbye2(sock, msg, bot, args) {
  return cmdGoodbye1(sock, msg, bot, args);
}

// Certificate
async function cmdCertificate(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan nama!\n\nContoh: .certificate John Doe' });
  }
  
  const name = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Membuat sertifikat...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/m/certificate?name=${encodeURIComponent(name)}`, {
      timeout: 20000,
      responseType: 'arraybuffer'
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: Buffer.from(response.data),
      caption: `📜 *Certificate for ${name}*`
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal membuat sertifikat' });
  }
}

// Love Message
async function cmdLoveMsg(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan pesan!\n\nContoh: .lovemsg I Love You' });
  }
  
  const text = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Membuat love message...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/m/lovemsg?text=${encodeURIComponent(text)}`, {
      timeout: 20000,
      responseType: 'arraybuffer'
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: Buffer.from(response.data),
      caption: `💕 *Love Message*`
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: `💕 *Love Message*\n\n${text}` });
  }
}

// Image effects (wanted, jail, triggered, wasted, trash)
async function applyImageEffect(sock, msg, effect, caption) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasImage = msg.message?.imageMessage || quotedMsg?.imageMessage;
  
  if (!hasImage) {
    return await sock.sendMessage(msg.key.remoteJid, { text: `❌ Kirim/reply gambar dengan caption .${effect}` });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Memproses gambar...' });
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const buffer = await downloadMediaMessage(
      quotedMsg?.imageMessage ? { message: { imageMessage: quotedMsg.imageMessage } } : msg,
      'buffer', {}
    );
    
    const FormData = require('form-data');
    const form = new FormData();
    form.append('image', buffer, { filename: 'image.jpg' });
    
    const response = await axios.post(`https://api.siputzx.my.id/api/m/${effect}`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
      responseType: 'arraybuffer'
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: Buffer.from(response.data),
      caption
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal memproses gambar' });
  }
}

async function cmdWanted(sock, msg, bot, args) {
  await applyImageEffect(sock, msg, 'wanted', '🤠 *WANTED*');
}

async function cmdJail(sock, msg, bot, args) {
  await applyImageEffect(sock, msg, 'jail', '🔒 *JAIL*');
}

async function cmdTriggered(sock, msg, bot, args) {
  await applyImageEffect(sock, msg, 'triggered', '😤 *TRIGGERED*');
}

async function cmdWasted(sock, msg, bot, args) {
  await applyImageEffect(sock, msg, 'wasted', '💀 *WASTED*');
}

async function cmdTrash(sock, msg, bot, args) {
  await applyImageEffect(sock, msg, 'trash', '🗑️ *TRASH*');
}

module.exports = {
  ttp: cmdTTP,
  attp: cmdATTP,
  logo: cmdLogo, textlogo: cmdLogo,
  carbon: cmdCarbon,
  welcome1: cmdWelcome1,
  welcome2: cmdWelcome2,
  goodbye1: cmdGoodbye1,
  goodbye2: cmdGoodbye2,
  certificate: cmdCertificate, sertifikat: cmdCertificate,
  lovemsg: cmdLoveMsg, lovemessage: cmdLoveMsg,
  wanted: cmdWanted,
  jail: cmdJail, penjara: cmdJail,
  triggered: cmdTriggered,
  wasted: cmdWasted,
  trash: cmdTrash, sampah: cmdTrash
};
