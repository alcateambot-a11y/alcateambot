/**
 * Anime & Random Image Commands
 * waifu, neko, shinobu, megumin, loli, husbu, wallpaperanime, cosplay
 * kucing, anjing, aesthetic, wallpaper, couple, ppcouple, darkwp, nature, space, car, motor, teknologi
 */

const axios = require('axios');

// API endpoints
const APIS = {
  waifu: 'https://api.waifu.pics/sfw/waifu',
  neko: 'https://api.waifu.pics/sfw/neko',
  shinobu: 'https://api.waifu.pics/sfw/shinobu',
  megumin: 'https://api.waifu.pics/sfw/megumin',
  husbu: 'https://nekos.best/api/v2/husbando',
  cat: 'https://api.thecatapi.com/v1/images/search',
  dog: 'https://dog.ceo/api/breeds/image/random'
};

async function sendRandomImage(sock, msg, apiUrl, caption, isNekos = false) {
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengambil gambar...' });
    
    const response = await axios.get(apiUrl, { timeout: 30000 });
    let url;
    
    if (isNekos) {
      url = response.data?.results?.[0]?.url;
    } else if (Array.isArray(response.data)) {
      url = response.data[0]?.url;
    } else {
      url = response.data?.url || response.data?.message;
    }
    
    if (!url) throw new Error('No URL');
    
    await sock.sendMessage(msg.key.remoteJid, { image: { url }, caption });
  } catch (err) {
    // Fallback to Pinterest for anime images
    if (apiUrl.includes('waifu.pics') || apiUrl.includes('nekos')) {
      const query = caption.replace(/[*🎌🐱🦋💥💙]/g, '').trim().toLowerCase();
      await sendPinterestImage(sock, msg, `anime ${query}`, caption);
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengambil gambar' });
    }
  }
}

async function sendPinterestImage(sock, msg, query, caption) {
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengambil gambar...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(query)}`, { timeout: 15000 });
    const images = response.data?.data;
    
    if (!images?.length) throw new Error('No images');
    
    const randomImg = images[Math.floor(Math.random() * images.length)];
    const url = randomImg.image_url || randomImg;
    
    await sock.sendMessage(msg.key.remoteJid, { image: { url }, caption });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengambil gambar' });
  }
}

// Anime Commands
async function cmdWaifu(sock, msg) {
  await sendRandomImage(sock, msg, APIS.waifu, '🎌 *Waifu*');
}

async function cmdNeko(sock, msg) {
  await sendRandomImage(sock, msg, APIS.neko, '🐱 *Neko*');
}

async function cmdShinobu(sock, msg) {
  await sendRandomImage(sock, msg, APIS.shinobu, '🦋 *Shinobu*');
}

async function cmdMegumin(sock, msg) {
  await sendRandomImage(sock, msg, APIS.megumin, '💥 *Megumin*');
}

async function cmdLoli(sock, msg) {
  await sendPinterestImage(sock, msg, 'anime loli cute', '🎀 *Loli*');
}

async function cmdHusbu(sock, msg) {
  await sendRandomImage(sock, msg, APIS.husbu, '💙 *Husbando*', true);
}

async function cmdWallpaperAnime(sock, msg) {
  await sendPinterestImage(sock, msg, 'anime wallpaper hd', '🎌 *Anime Wallpaper*');
}

async function cmdCosplay(sock, msg) {
  await sendPinterestImage(sock, msg, 'anime cosplay', '🎭 *Cosplay*');
}

// Random Image Commands
async function cmdKucing(sock, msg) {
  await sendRandomImage(sock, msg, APIS.cat, '🐱 *Random Cat*');
}

async function cmdAnjing(sock, msg) {
  await sendRandomImage(sock, msg, APIS.dog, '🐕 *Random Dog*');
}

async function cmdAesthetic(sock, msg) {
  await sendPinterestImage(sock, msg, 'aesthetic wallpaper', '🌸 *Aesthetic*');
}

async function cmdWallpaper(sock, msg) {
  await sendPinterestImage(sock, msg, 'hd wallpaper phone', '🖼️ *Wallpaper*');
}

async function cmdCouple(sock, msg) {
  await sendPinterestImage(sock, msg, 'couple anime matching', '💕 *Couple*');
}

async function cmdPPCouple(sock, msg) {
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengambil PP Couple...' });
    
    const response = await axios.get('https://api.siputzx.my.id/api/s/pinterest?query=pp+couple+anime+matching', { timeout: 15000 });
    const images = response.data?.data;
    
    if (!images || images.length < 2) throw new Error('Not enough images');
    
    const idx = Math.floor(Math.random() * (images.length - 1));
    const img1 = images[idx].image_url || images[idx];
    const img2 = images[idx + 1].image_url || images[idx + 1];
    
    await sock.sendMessage(msg.key.remoteJid, { image: { url: img1 }, caption: '💙 *PP Couple - Cowo*' });
    await sock.sendMessage(msg.key.remoteJid, { image: { url: img2 }, caption: '💗 *PP Couple - Cewe*' });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengambil PP Couple' });
  }
}

async function cmdDarkWP(sock, msg) {
  await sendPinterestImage(sock, msg, 'dark aesthetic wallpaper', '🖤 *Dark Wallpaper*');
}

async function cmdNature(sock, msg) {
  await sendPinterestImage(sock, msg, 'nature wallpaper hd', '🌿 *Nature*');
}

async function cmdSpace(sock, msg) {
  await sendPinterestImage(sock, msg, 'space galaxy wallpaper', '🌌 *Space*');
}

async function cmdCar(sock, msg) {
  await sendPinterestImage(sock, msg, 'car wallpaper hd', '🚗 *Car*');
}

async function cmdMotor(sock, msg) {
  await sendPinterestImage(sock, msg, 'motorcycle wallpaper hd', '🏍️ *Motorcycle*');
}

async function cmdTeknologi(sock, msg) {
  await sendPinterestImage(sock, msg, 'technology wallpaper', '💻 *Technology*');
}

module.exports = {
  waifu: cmdWaifu,
  neko: cmdNeko,
  shinobu: cmdShinobu,
  megumin: cmdMegumin,
  loli: cmdLoli,
  husbu: cmdHusbu, husbando: cmdHusbu,
  wallpaperanime: cmdWallpaperAnime, wpanime: cmdWallpaperAnime,
  cosplay: cmdCosplay,
  kucing: cmdKucing, cat: cmdKucing,
  anjing: cmdAnjing, dog: cmdAnjing,
  aesthetic: cmdAesthetic,
  wallpaper: cmdWallpaper, wp: cmdWallpaper,
  couple: cmdCouple,
  ppcouple: cmdPPCouple, ppc: cmdPPCouple, pp: cmdPPCouple,
  darkwp: cmdDarkWP, darkwallpaper: cmdDarkWP,
  nature: cmdNature, alam: cmdNature,
  space: cmdSpace, galaxy: cmdSpace,
  car: cmdCar, mobil: cmdCar,
  motor: cmdMotor, motorcycle: cmdMotor,
  teknologi: cmdTeknologi, tech: cmdTeknologi
};
