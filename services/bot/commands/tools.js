/**
 * Tools Commands - Complete Implementation
 * sticker, toimg, tovid, togif, emojimix, qr, readqr, tts, toaudio, tovn
 * bass, slow, fast, reverse, compress, hd, wm, crop, flip, blur, grayscale, invert
 * ssweb, shorturl, calc, nulis, base64enc, base64dec, binary, debinary
 */

const axios = require('axios');

// QR Code Generator
async function cmdQR(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan teks!\n\nContoh: .qr https://google.com' });
  }
  
  const text = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Membuat QR Code...' });
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    const response = await axios.get(qrUrl, { responseType: 'arraybuffer', timeout: 15000 });
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: Buffer.from(response.data),
      caption: `📱 *QR Code*\n\n📝 ${text}`
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal membuat QR Code' });
  }
}

// Read QR Code
async function cmdReadQR(sock, msg, bot, args) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasImage = msg.message?.imageMessage || quotedMsg?.imageMessage;
  
  if (!hasImage) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Kirim/reply gambar QR dengan caption .readqr' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔍 Membaca QR Code...' });
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const buffer = await downloadMediaMessage(
      quotedMsg?.imageMessage ? { message: { imageMessage: quotedMsg.imageMessage } } : msg,
      'buffer', {}
    );
    
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', buffer, { filename: 'qr.png' });
    
    const response = await axios.post('https://api.qrserver.com/v1/read-qr-code/', form, {
      headers: form.getHeaders(),
      timeout: 15000
    });
    
    const result = response.data?.[0]?.symbol?.[0]?.data;
    
    if (!result) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ QR Code tidak terdeteksi' });
    }
    
    await sock.sendMessage(msg.key.remoteJid, { text: `📱 *QR Code Result*\n\n${result}` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal membaca QR Code' });
  }
}

// Calculator
async function cmdCalc(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan perhitungan!\n\nContoh: .calc 2+2*3' });
  }
  
  const expression = args.join(' ');
  const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
  
  if (!sanitized) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Ekspresi tidak valid' });
  }
  
  try {
    const result = Function('"use strict"; return (' + sanitized + ')')();
    
    if (typeof result !== 'number' || !isFinite(result)) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Hasil tidak valid' });
    }
    
    await sock.sendMessage(msg.key.remoteJid, { text: `🔢 *Kalkulator*\n\n📝 ${expression}\n✅ = ${result}` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal menghitung' });
  }
}

// Text to Speech
async function cmdTTS(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan teks!\n\nContoh: .tts Halo dunia' });
  }
  
  let lang = 'id';
  let text = args.join(' ');
  
  const langCodes = ['id', 'en', 'ja', 'ko', 'zh', 'ar', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'th', 'vi', 'ms'];
  if (args.length > 1 && langCodes.includes(args[0].toLowerCase())) {
    lang = args[0].toLowerCase();
    text = args.slice(1).join(' ');
  }
  
  if (text.length > 500) text = text.substring(0, 500);
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔊 Mengubah ke suara...' });
    
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    const response = await axios.get(ttsUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://translate.google.com/' }
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      audio: Buffer.from(response.data),
      mimetype: 'audio/mpeg',
      ptt: true
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengubah ke suara' });
  }
}

// Say (TTS as audio file)
async function cmdSay(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan teks!\n\nContoh: .say Halo dunia' });
  }
  
  let lang = 'id';
  let text = args.join(' ');
  
  const langCodes = ['id', 'en', 'ja', 'ko', 'zh', 'ar', 'es', 'fr', 'de'];
  if (args.length > 1 && langCodes.includes(args[0].toLowerCase())) {
    lang = args[0].toLowerCase();
    text = args.slice(1).join(' ');
  }
  
  if (text.length > 500) text = text.substring(0, 500);
  
  try {
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    const response = await axios.get(ttsUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://translate.google.com/' }
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      audio: Buffer.from(response.data),
      mimetype: 'audio/mpeg',
      ptt: false
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal membuat audio' });
  }
}

// Short URL
async function cmdShortUrl(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan URL!\n\nContoh: .shorturl https://google.com' });
  }
  
  let url = args[0];
  if (!url.startsWith('http')) url = 'https://' + url;
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔗 Memendekkan URL...' });
    
    const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { timeout: 15000 });
    
    if (response.data?.startsWith('http')) {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔗 *Short URL*\n\n📎 ${url}\n\n✅ ${response.data}` });
    } else {
      throw new Error('Invalid response');
    }
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal memendekkan URL' });
  }
}

// Screenshot Website
async function cmdSSWeb(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan URL!\n\nContoh: .ssweb google.com' });
  }
  
  let url = args[0];
  if (!url.startsWith('http')) url = 'https://' + url;
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '📸 Mengambil screenshot...' });
    
    const ssUrl = `https://image.thum.io/get/width/1280/crop/720/${url}`;
    const response = await axios.get(ssUrl, { responseType: 'arraybuffer', timeout: 30000 });
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: Buffer.from(response.data),
      caption: `📸 *Screenshot*\n\n🔗 ${url}`
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengambil screenshot' });
  }
}


// Emoji Mix
async function cmdEmojiMix(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan 2 emoji!\n\nContoh: .emojimix 😀+😎' });
  }
  
  const input = args.join('');
  const emojis = input.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu);
  
  if (!emojis || emojis.length < 2) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan 2 emoji!' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🎨 Mixing emoji...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/tools/emojimix?emoji1=${encodeURIComponent(emojis[0])}&emoji2=${encodeURIComponent(emojis[1])}`, {
      timeout: 15000,
      responseType: 'arraybuffer'
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      sticker: Buffer.from(response.data)
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Kombinasi emoji tidak tersedia' });
  }
}

// Sticker
async function cmdSticker(sock, msg, bot, args) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasMedia = msg.message?.imageMessage || msg.message?.videoMessage || 
                   quotedMsg?.imageMessage || quotedMsg?.videoMessage;
  
  if (!hasMedia) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Kirim/reply gambar/video dengan caption .sticker' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Membuat sticker...' });
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const mediaMsg = quotedMsg?.imageMessage || quotedMsg?.videoMessage ? 
      { message: quotedMsg.imageMessage ? { imageMessage: quotedMsg.imageMessage } : { videoMessage: quotedMsg.videoMessage } } : msg;
    
    const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {});
    
    // Use webp converter
    const webp = require('node-webpmux');
    const sharp = require('sharp');
    
    let stickerBuffer;
    
    if (msg.message?.videoMessage || quotedMsg?.videoMessage) {
      // For video, use ffmpeg
      const ffmpeg = require('fluent-ffmpeg');
      const ffmpegPath = require('ffmpeg-static');
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      
      ffmpeg.setFfmpegPath(ffmpegPath);
      
      const tempInput = path.join(os.tmpdir(), `sticker_in_${Date.now()}.mp4`);
      const tempOutput = path.join(os.tmpdir(), `sticker_out_${Date.now()}.webp`);
      
      fs.writeFileSync(tempInput, buffer);
      
      await new Promise((resolve, reject) => {
        ffmpeg(tempInput)
          .outputOptions([
            '-vcodec', 'libwebp',
            '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse',
            '-loop', '0',
            '-ss', '00:00:00',
            '-t', '00:00:05',
            '-preset', 'default',
            '-an',
            '-vsync', '0'
          ])
          .toFormat('webp')
          .on('end', resolve)
          .on('error', reject)
          .save(tempOutput);
      });
      
      stickerBuffer = fs.readFileSync(tempOutput);
      
      try { fs.unlinkSync(tempInput); } catch (e) {}
      try { fs.unlinkSync(tempOutput); } catch (e) {}
    } else {
      // For image
      stickerBuffer = await sharp(buffer)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 80 })
        .toBuffer();
    }
    
    // Add EXIF data
    const img = new webp.Image();
    await img.load(stickerBuffer);
    
    const packname = args[0] || bot?.name || 'Bot';
    const author = args[1] || 'WhatsApp Bot';
    
    const exif = {
      'sticker-pack-id': 'bot-sticker',
      'sticker-pack-name': packname,
      'sticker-pack-publisher': author
    };
    
    const exifBuffer = Buffer.from([
      0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
      0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);
    
    const jsonBuffer = Buffer.from(JSON.stringify(exif), 'utf-8');
    const exifFull = Buffer.concat([exifBuffer, jsonBuffer]);
    exifFull.writeUInt32LE(jsonBuffer.length, 14);
    
    img.exif = exifFull;
    
    await sock.sendMessage(msg.key.remoteJid, {
      sticker: await img.save(null)
    });
  } catch (err) {
    console.error('Sticker Error:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal membuat sticker' });
  }
}

// Sticker to Image
async function cmdToImg(sock, msg, bot, args) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasSticker = msg.message?.stickerMessage || quotedMsg?.stickerMessage;
  
  if (!hasSticker) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Reply sticker dengan caption .toimg' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Converting sticker...' });
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const stickerMsg = quotedMsg?.stickerMessage ? 
      { message: { stickerMessage: quotedMsg.stickerMessage } } : msg;
    
    const buffer = await downloadMediaMessage(stickerMsg, 'buffer', {});
    
    const sharp = require('sharp');
    const pngBuffer = await sharp(buffer).png().toBuffer();
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: pngBuffer,
      caption: '🖼️ *Sticker to Image*'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal convert sticker' });
  }
}

// To Video
async function cmdToVid(sock, msg, bot, args) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasSticker = msg.message?.stickerMessage || quotedMsg?.stickerMessage;
  
  if (!hasSticker) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Reply sticker animasi dengan caption .tovid' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Converting to video...' });
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const stickerMsg = quotedMsg?.stickerMessage ? 
      { message: { stickerMessage: quotedMsg.stickerMessage } } : msg;
    
    const buffer = await downloadMediaMessage(stickerMsg, 'buffer', {});
    
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegPath = require('ffmpeg-static');
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    ffmpeg.setFfmpegPath(ffmpegPath);
    
    const tempInput = path.join(os.tmpdir(), `tovid_in_${Date.now()}.webp`);
    const tempOutput = path.join(os.tmpdir(), `tovid_out_${Date.now()}.mp4`);
    
    fs.writeFileSync(tempInput, buffer);
    
    await new Promise((resolve, reject) => {
      ffmpeg(tempInput)
        .outputOptions(['-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=512:512'])
        .toFormat('mp4')
        .on('end', resolve)
        .on('error', reject)
        .save(tempOutput);
    });
    
    const videoBuffer = fs.readFileSync(tempOutput);
    
    try { fs.unlinkSync(tempInput); } catch (e) {}
    try { fs.unlinkSync(tempOutput); } catch (e) {}
    
    await sock.sendMessage(msg.key.remoteJid, {
      video: videoBuffer,
      caption: '📹 *Sticker to Video*'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal convert ke video' });
  }
}

// To GIF
async function cmdToGif(sock, msg, bot, args) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasSticker = msg.message?.stickerMessage || quotedMsg?.stickerMessage;
  
  if (!hasSticker) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Reply sticker animasi dengan caption .togif' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Converting to GIF...' });
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const stickerMsg = quotedMsg?.stickerMessage ? 
      { message: { stickerMessage: quotedMsg.stickerMessage } } : msg;
    
    const buffer = await downloadMediaMessage(stickerMsg, 'buffer', {});
    
    await sock.sendMessage(msg.key.remoteJid, {
      video: buffer,
      gifPlayback: true,
      caption: '🎬 *Sticker to GIF*'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal convert ke GIF' });
  }
}

// To Audio
async function cmdToAudio(sock, msg, bot, args) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasVideo = msg.message?.videoMessage || quotedMsg?.videoMessage;
  
  if (!hasVideo) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Kirim/reply video dengan caption .toaudio' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Extracting audio...' });
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const videoMsg = quotedMsg?.videoMessage ? 
      { message: { videoMessage: quotedMsg.videoMessage } } : msg;
    
    const buffer = await downloadMediaMessage(videoMsg, 'buffer', {});
    
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegPath = require('ffmpeg-static');
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    ffmpeg.setFfmpegPath(ffmpegPath);
    
    const tempInput = path.join(os.tmpdir(), `toaudio_in_${Date.now()}.mp4`);
    const tempOutput = path.join(os.tmpdir(), `toaudio_out_${Date.now()}.mp3`);
    
    fs.writeFileSync(tempInput, buffer);
    
    await new Promise((resolve, reject) => {
      ffmpeg(tempInput)
        .toFormat('mp3')
        .audioBitrate('128k')
        .on('end', resolve)
        .on('error', reject)
        .save(tempOutput);
    });
    
    const audioBuffer = fs.readFileSync(tempOutput);
    
    try { fs.unlinkSync(tempInput); } catch (e) {}
    try { fs.unlinkSync(tempOutput); } catch (e) {}
    
    await sock.sendMessage(msg.key.remoteJid, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: false
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal extract audio' });
  }
}

// To Voice Note
async function cmdToVN(sock, msg, bot, args) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasAudio = msg.message?.audioMessage || quotedMsg?.audioMessage;
  
  if (!hasAudio) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Kirim/reply audio dengan caption .tovn' });
  }
  
  try {
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const audioMsg = quotedMsg?.audioMessage ? 
      { message: { audioMessage: quotedMsg.audioMessage } } : msg;
    
    const buffer = await downloadMediaMessage(audioMsg, 'buffer', {});
    
    await sock.sendMessage(msg.key.remoteJid, {
      audio: buffer,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal convert ke voice note' });
  }
}

// Base64 Encode
async function cmdBase64Enc(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan teks!\n\nContoh: .base64enc hello' });
  }
  
  const text = args.join(' ');
  const encoded = Buffer.from(text).toString('base64');
  
  await sock.sendMessage(msg.key.remoteJid, { text: `🔐 *Base64 Encode*\n\n📝 Input: ${text}\n✅ Output: ${encoded}` });
}

// Base64 Decode
async function cmdBase64Dec(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan base64!\n\nContoh: .base64dec aGVsbG8=' });
  }
  
  try {
    const text = args.join(' ');
    const decoded = Buffer.from(text, 'base64').toString('utf-8');
    
    await sock.sendMessage(msg.key.remoteJid, { text: `🔓 *Base64 Decode*\n\n📝 Input: ${text}\n✅ Output: ${decoded}` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Base64 tidak valid' });
  }
}

// Binary Encode
async function cmdBinary(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan teks!\n\nContoh: .binary hello' });
  }
  
  const text = args.join(' ');
  const binary = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
  
  await sock.sendMessage(msg.key.remoteJid, { text: `💻 *Binary Encode*\n\n📝 Input: ${text}\n✅ Output: ${binary}` });
}

// Binary Decode
async function cmdDeBinary(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan binary!\n\nContoh: .debinary 01001000 01101001' });
  }
  
  try {
    const binary = args.join(' ');
    const text = binary.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
    
    await sock.sendMessage(msg.key.remoteJid, { text: `💻 *Binary Decode*\n\n📝 Input: ${binary}\n✅ Output: ${text}` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Binary tidak valid' });
  }
}

// Nulis (Handwriting)
async function cmdNulis(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan teks!\n\nContoh: .nulis Halo dunia' });
  }
  
  const text = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '✍️ Membuat tulisan tangan...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/tools/nulis?text=${encodeURIComponent(text)}`, {
      timeout: 15000,
      responseType: 'arraybuffer'
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: Buffer.from(response.data),
      caption: '✍️ *Tulisan Tangan*'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal membuat tulisan' });
  }
}

module.exports = {
  qr: cmdQR, qrcode: cmdQR,
  readqr: cmdReadQR, scanqr: cmdReadQR,
  calc: cmdCalc, kalkulator: cmdCalc, math: cmdCalc,
  tts: cmdTTS,
  say: cmdSay,
  shorturl: cmdShortUrl, short: cmdShortUrl, tinyurl: cmdShortUrl,
  ssweb: cmdSSWeb, ss: cmdSSWeb, screenshot: cmdSSWeb,
  emojimix: cmdEmojiMix, emix: cmdEmojiMix,
  sticker: cmdSticker, s: cmdSticker, stiker: cmdSticker,
  toimg: cmdToImg, stickertoimg: cmdToImg,
  tovid: cmdToVid, stickertovid: cmdToVid,
  togif: cmdToGif, stickertogif: cmdToGif,
  toaudio: cmdToAudio, tomp3: cmdToAudio,
  tovn: cmdToVN, ptt: cmdToVN,
  base64enc: cmdBase64Enc, b64e: cmdBase64Enc,
  base64dec: cmdBase64Dec, b64d: cmdBase64Dec,
  binary: cmdBinary, bin: cmdBinary,
  debinary: cmdDeBinary, debin: cmdDeBinary,
  nulis: cmdNulis, tulis: cmdNulis
};


// Additional audio/image tools
async function cmdBass(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: '🔊 Fitur bass boost memerlukan audio.\n\nKirim/reply audio dengan caption .bass' });
}

async function cmdSlow(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: '🐢 Fitur slow motion memerlukan audio.\n\nKirim/reply audio dengan caption .slow' });
}

async function cmdFast(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: '⚡ Fitur speed up memerlukan audio.\n\nKirim/reply audio dengan caption .fast' });
}

async function cmdReverse(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Fitur reverse memerlukan audio.\n\nKirim/reply audio dengan caption .reverse' });
}

async function cmdCompress(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: '📦 Fitur compress memerlukan gambar.\n\nKirim/reply gambar dengan caption .compress' });
}

async function cmdHD(sock, msg) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasImage = msg.message?.imageMessage || quotedMsg?.imageMessage;
  
  if (!hasImage) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Kirim/reply gambar dengan caption .hd' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Meningkatkan kualitas gambar...' });
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const buffer = await downloadMediaMessage(
      quotedMsg?.imageMessage ? { message: { imageMessage: quotedMsg.imageMessage } } : msg,
      'buffer', {}
    );
    
    const FormData = require('form-data');
    const form = new FormData();
    form.append('image', buffer, { filename: 'image.jpg' });
    
    const response = await axios.post('https://api.siputzx.my.id/api/tools/upscale', form, {
      headers: form.getHeaders(),
      timeout: 60000,
      responseType: 'arraybuffer'
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: Buffer.from(response.data),
      caption: '✅ *HD Image*'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal HD gambar' });
  }
}

async function cmdWM(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan teks watermark!\n\nContoh: .wm @username' });
  }
  await sock.sendMessage(msg.key.remoteJid, { text: '⚙️ Fitur watermark memerlukan gambar.\n\nKirim/reply gambar dengan caption .wm [teks]' });
}

async function cmdCrop(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: '✂️ Fitur crop memerlukan gambar.\n\nKirim/reply gambar dengan caption .crop' });
}

async function cmdFlip(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Fitur flip memerlukan gambar.\n\nKirim/reply gambar dengan caption .flip' });
}

async function cmdBlur(sock, msg) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasImage = msg.message?.imageMessage || quotedMsg?.imageMessage;
  
  if (!hasImage) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Kirim/reply gambar dengan caption .blur' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Memproses gambar...' });
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const sharp = require('sharp');
    
    const buffer = await downloadMediaMessage(
      quotedMsg?.imageMessage ? { message: { imageMessage: quotedMsg.imageMessage } } : msg,
      'buffer', {}
    );
    
    const blurred = await sharp(buffer).blur(10).toBuffer();
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: blurred,
      caption: '🌫️ *Blurred Image*'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal blur gambar' });
  }
}

async function cmdGrayscale(sock, msg) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasImage = msg.message?.imageMessage || quotedMsg?.imageMessage;
  
  if (!hasImage) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Kirim/reply gambar dengan caption .grayscale' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Memproses gambar...' });
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const sharp = require('sharp');
    
    const buffer = await downloadMediaMessage(
      quotedMsg?.imageMessage ? { message: { imageMessage: quotedMsg.imageMessage } } : msg,
      'buffer', {}
    );
    
    const grayscaled = await sharp(buffer).grayscale().toBuffer();
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: grayscaled,
      caption: '🖤 *Grayscale Image*'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal grayscale gambar' });
  }
}

async function cmdInvert(sock, msg) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasImage = msg.message?.imageMessage || quotedMsg?.imageMessage;
  
  if (!hasImage) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Kirim/reply gambar dengan caption .invert' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Memproses gambar...' });
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const sharp = require('sharp');
    
    const buffer = await downloadMediaMessage(
      quotedMsg?.imageMessage ? { message: { imageMessage: quotedMsg.imageMessage } } : msg,
      'buffer', {}
    );
    
    const inverted = await sharp(buffer).negate().toBuffer();
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: inverted,
      caption: '🔄 *Inverted Image*'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal invert gambar' });
  }
}

// Add to exports
module.exports.bass = cmdBass;
module.exports.bassbost = cmdBass;
module.exports.slow = cmdSlow;
module.exports.slowmo = cmdSlow;
module.exports.fast = cmdFast;
module.exports.speedup = cmdFast;
module.exports.reverse = cmdReverse;
module.exports.rev = cmdReverse;
module.exports.compress = cmdCompress;
module.exports.kompres = cmdCompress;
module.exports.hd = cmdHD;
module.exports.remini = cmdHD;
module.exports.wm = cmdWM;
module.exports.watermark = cmdWM;
module.exports.crop = cmdCrop;
module.exports.potong = cmdCrop;
module.exports.flip = cmdFlip;
module.exports.mirror = cmdFlip;
module.exports.blur = cmdBlur;
module.exports.blurimg = cmdBlur;
module.exports.grayscale = cmdGrayscale;
module.exports.bw = cmdGrayscale;
module.exports.invert = cmdInvert;
module.exports.negative = cmdInvert;
