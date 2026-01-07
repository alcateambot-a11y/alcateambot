/**
 * Sticker Commands
 * sticker, s, stiker - Convert image/video to sticker
 * toimg - Convert sticker to image
 */

const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

// Helper function to download media from WhatsApp
async function downloadMediaBuffer(msg, mediaType) {
  try {
    let mediaMessage = null;
    
    if (mediaType === 'image') {
      mediaMessage = msg.message?.imageMessage;
    } else if (mediaType === 'video') {
      mediaMessage = msg.message?.videoMessage;
    } else if (mediaType === 'sticker') {
      mediaMessage = msg.message?.stickerMessage;
    }
    
    if (!mediaMessage) {
      return null;
    }
    
    const stream = await downloadContentFromMessage(mediaMessage, mediaType === 'sticker' ? 'sticker' : mediaType);
    
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    
    return buffer;
    
  } catch (err) {
    console.error('Download error:', err.message);
    return null;
  }
}

// Create EXIF buffer for WhatsApp sticker metadata
function createExifBuffer(packname, author) {
  const json = {
    'sticker-pack-id': 'com.alcateambot.sticker',
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    'emojis': ['😀']
  };
  
  const jsonStr = JSON.stringify(json);
  const jsonBuffer = Buffer.from(jsonStr, 'utf8');
  
  // EXIF header for WebP
  const exifHeader = Buffer.from([
    0x49, 0x49, 0x2A, 0x00, // TIFF header (little endian)
    0x08, 0x00, 0x00, 0x00, // Offset to first IFD
    0x01, 0x00,             // Number of directory entries
    0x41, 0x57,             // Tag 0x5741 (custom for sticker)
    0x07, 0x00,             // Type: undefined
    0x00, 0x00, 0x00, 0x00, // Count (will be set)
    0x16, 0x00, 0x00, 0x00  // Offset to data
  ]);
  
  // Set the JSON length in the header
  exifHeader.writeUInt32LE(jsonBuffer.length, 14);
  
  return Buffer.concat([exifHeader, jsonBuffer]);
}

// Add EXIF metadata for sticker pack info
async function addExifToWebp(webpBuffer, packname, author) {
  try {
    const { Image } = require('node-webpmux');
    
    const img = new Image();
    await img.load(webpBuffer);
    
    // Create and set EXIF data
    const exifBuffer = createExifBuffer(packname, author);
    img.exif = exifBuffer;
    
    // Save with EXIF
    return await img.save(null);
  } catch (err) {
    console.error('EXIF error:', err.message);
    // Return original buffer if EXIF fails
    return webpBuffer;
  }
}

// Convert image buffer to WebP sticker format
async function imageToWebp(buffer) {
  try {
    const webpBuffer = await sharp(buffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 80 })
      .toBuffer();
    
    return webpBuffer;
  } catch (err) {
    console.error('Sharp error:', err.message);
    throw err;
  }
}

async function cmdSticker(sock, msg, bot, args, context) {
  const remoteJid = msg.key.remoteJid;
  
  try {
    let buffer = null;
    let isVideo = false;
    
    // Check current message for image
    if (msg.message?.imageMessage) {
      console.log('Found image in current message');
      buffer = await downloadMediaBuffer(msg, 'image');
    } 
    // Check current message for video
    else if (msg.message?.videoMessage) {
      console.log('Found video in current message');
      const duration = msg.message.videoMessage?.seconds || 0;
      if (duration > 10) {
        return await sock.sendMessage(remoteJid, { 
          text: '❌ Video terlalu panjang! Maksimal 10 detik untuk sticker' 
        });
      }
      buffer = await downloadMediaBuffer(msg, 'video');
      isVideo = true;
    }
    // Check quoted message
    else {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (quotedMsg?.imageMessage) {
        console.log('Found image in quoted message');
        const wrapperMsg = { message: { imageMessage: quotedMsg.imageMessage } };
        buffer = await downloadMediaBuffer(wrapperMsg, 'image');
      } 
      else if (quotedMsg?.videoMessage) {
        console.log('Found video in quoted message');
        const duration = quotedMsg.videoMessage?.seconds || 0;
        if (duration > 10) {
          return await sock.sendMessage(remoteJid, { 
            text: '❌ Video terlalu panjang! Maksimal 10 detik untuk sticker' 
          });
        }
        const wrapperMsg = { message: { videoMessage: quotedMsg.videoMessage } };
        buffer = await downloadMediaBuffer(wrapperMsg, 'video');
        isVideo = true;
      }
      else if (quotedMsg?.stickerMessage) {
        return await cmdToImg(sock, msg, bot, args, context);
      }
    }
    
    if (!buffer || buffer.length < 100) {
      return await sock.sendMessage(remoteJid, { 
        text: '❌ Kirim gambar/video dengan caption .sticker atau reply gambar/video dengan .sticker' 
      });
    }
    
    await sock.sendMessage(remoteJid, { text: '⏳ Membuat sticker...' });
    
    // Get packname and author from bot settings
    const packname = bot.packname || '@stikerbot';
    const author = bot.authorSticker || bot.botName || 'Bot';
    
    console.log('Buffer size:', buffer.length);
    console.log('Packname:', packname, 'Author:', author);
    
    let stickerBuffer;
    
    if (isVideo) {
      // For video, use ffmpeg to convert to webp
      const tempDir = path.join(__dirname, '../../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const inputPath = path.join(tempDir, `input_${Date.now()}.mp4`);
      const outputPath = path.join(tempDir, `output_${Date.now()}.webp`);
      
      fs.writeFileSync(inputPath, buffer);
      
      await new Promise((resolve, reject) => {
        exec(`"${ffmpegPath}" -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse" -loop 0 -t 5 "${outputPath}"`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      stickerBuffer = fs.readFileSync(outputPath);
      
      // Cleanup
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    } else {
      // For image, use sharp
      stickerBuffer = await imageToWebp(buffer);
    }
    
    // Add EXIF metadata (packname & author)
    stickerBuffer = await addExifToWebp(stickerBuffer, packname, author);
    
    console.log('Sticker buffer size:', stickerBuffer.length);
    
    await sock.sendMessage(remoteJid, { 
      sticker: stickerBuffer 
    });
    
    console.log('Sticker sent successfully');
    
  } catch (err) {
    console.error('Sticker error:', err);
    await sock.sendMessage(remoteJid, { 
      text: '❌ Gagal membuat sticker: ' + err.message 
    });
  }
}

async function cmdStickerCircle(sock, msg, bot, args, context) {
  const remoteJid = msg.key.remoteJid;
  
  try {
    let buffer = null;
    
    if (msg.message?.imageMessage) {
      buffer = await downloadMediaBuffer(msg, 'image');
    } else {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMsg?.imageMessage) {
        const wrapperMsg = { message: { imageMessage: quotedMsg.imageMessage } };
        buffer = await downloadMediaBuffer(wrapperMsg, 'image');
      }
    }
    
    if (!buffer || buffer.length < 100) {
      return await sock.sendMessage(remoteJid, { 
        text: '❌ Kirim gambar dengan caption .scircle atau reply gambar dengan .scircle' 
      });
    }
    
    await sock.sendMessage(remoteJid, { text: '⏳ Membuat sticker circle...' });
    
    const packname = bot.packname || '@stikerbot';
    const author = bot.authorSticker || bot.botName || 'Bot';
    
    // Create circular sticker
    const size = 512;
    const circleShape = Buffer.from(
      `<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`
    );
    
    let stickerBuffer = await sharp(buffer)
      .resize(size, size, { fit: 'cover' })
      .composite([{
        input: circleShape,
        blend: 'dest-in'
      }])
      .webp({ quality: 80 })
      .toBuffer();
    
    // Add EXIF metadata
    stickerBuffer = await addExifToWebp(stickerBuffer, packname, author);
    
    await sock.sendMessage(remoteJid, { sticker: stickerBuffer });
    
  } catch (err) {
    console.error('Sticker circle error:', err);
    await sock.sendMessage(remoteJid, { 
      text: '❌ Gagal membuat sticker: ' + err.message 
    });
  }
}

async function cmdStickerRounded(sock, msg, bot, args, context) {
  const remoteJid = msg.key.remoteJid;
  
  try {
    let buffer = null;
    
    if (msg.message?.imageMessage) {
      buffer = await downloadMediaBuffer(msg, 'image');
    } else {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMsg?.imageMessage) {
        const wrapperMsg = { message: { imageMessage: quotedMsg.imageMessage } };
        buffer = await downloadMediaBuffer(wrapperMsg, 'image');
      }
    }
    
    if (!buffer || buffer.length < 100) {
      return await sock.sendMessage(remoteJid, { 
        text: '❌ Kirim gambar dengan caption .srounded atau reply gambar dengan .srounded' 
      });
    }
    
    await sock.sendMessage(remoteJid, { text: '⏳ Membuat sticker rounded...' });
    
    const packname = bot.packname || '@stikerbot';
    const author = bot.authorSticker || bot.botName || 'Bot';
    
    // Create rounded rectangle sticker
    const size = 512;
    const radius = 50;
    const roundedRect = Buffer.from(
      `<svg><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/></svg>`
    );
    
    let stickerBuffer = await sharp(buffer)
      .resize(size, size, { fit: 'cover' })
      .composite([{
        input: roundedRect,
        blend: 'dest-in'
      }])
      .webp({ quality: 80 })
      .toBuffer();
    
    // Add EXIF metadata
    stickerBuffer = await addExifToWebp(stickerBuffer, packname, author);
    
    await sock.sendMessage(remoteJid, { sticker: stickerBuffer });
    
  } catch (err) {
    console.error('Sticker rounded error:', err);
    await sock.sendMessage(remoteJid, { 
      text: '❌ Gagal membuat sticker: ' + err.message 
    });
  }
}

async function cmdToImg(sock, msg, bot, args, context) {
  const remoteJid = msg.key.remoteJid;
  
  try {
    let buffer = null;
    
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quotedMsg?.stickerMessage) {
      const wrapperMsg = { message: { stickerMessage: quotedMsg.stickerMessage } };
      buffer = await downloadMediaBuffer(wrapperMsg, 'sticker');
    }
    
    if (!buffer || buffer.length < 100) {
      return await sock.sendMessage(remoteJid, { 
        text: '❌ Reply sticker dengan .toimg untuk convert ke gambar' 
      });
    }
    
    await sock.sendMessage(remoteJid, { text: '⏳ Converting sticker to image...' });
    
    // Convert webp to png
    const pngBuffer = await sharp(buffer)
      .png()
      .toBuffer();
    
    await sock.sendMessage(remoteJid, { 
      image: pngBuffer,
      caption: '✅ Sticker converted to image'
    });
    
  } catch (err) {
    console.error('ToImg error:', err);
    await sock.sendMessage(remoteJid, { 
      text: '❌ Gagal convert sticker: ' + err.message 
    });
  }
}

module.exports = {
  sticker: cmdSticker,
  stiker: cmdSticker,
  s: cmdSticker,
  scircle: cmdStickerCircle,
  srounded: cmdStickerRounded,
  sround: cmdStickerRounded,
  toimg: cmdToImg,
  toimage: cmdToImg
};
