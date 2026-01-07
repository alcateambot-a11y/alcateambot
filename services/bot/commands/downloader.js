/**
 * Downloader Commands - Complete Implementation
 * play, playvid, ytmp3, ytmp4, tiktok, tiktokmp3, instagram, igreels, igstory
 * facebook, twitter, spotify, soundcloud, pinterest, mediafire, gdrive, threads, etc
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ytdl = require('@distube/ytdl-core');

// YouTube helper functions
async function searchYouTube(query) {
  try {
    const searchResponse = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const videoIdMatch = searchResponse.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch) {
      return { videoId: videoIdMatch[1], url: `https://www.youtube.com/watch?v=${videoIdMatch[1]}` };
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function downloadYouTubeAudio(url) {
  const agent = ytdl.createAgent();
  const info = await ytdl.getInfo(url, { agent });
  const title = info.videoDetails.title;
  const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]?.url;
  const duration = info.videoDetails.lengthSeconds;
  
  // Try audio-only first, fallback to video with audio
  return new Promise((resolve, reject) => {
    // Use lowest quality video+audio format for smaller file size
    const format = ytdl.chooseFormat(info.formats, { 
      quality: 'lowest',
      filter: format => format.hasVideo && format.hasAudio 
    });
    
    const stream = ytdl(url, { 
      format,
      agent 
    });
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve({ 
      buffer: Buffer.concat(chunks), 
      title, 
      thumbnail,
      duration,
      isVideo: true // Flag to indicate this is actually video
    }));
    stream.on('error', reject);
  });
}

async function downloadYouTubeVideo(url) {
  const agent = ytdl.createAgent();
  const info = await ytdl.getInfo(url, { agent });
  const title = info.videoDetails.title;
  const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]?.url;
  const duration = info.videoDetails.lengthSeconds;
  
  // Get format with both video and audio (360p for smaller size)
  const format = ytdl.chooseFormat(info.formats, { 
    quality: 'lowest',
    filter: format => format.hasVideo && format.hasAudio 
  });
  
  return new Promise((resolve, reject) => {
    const stream = ytdl(url, { 
      format,
      agent 
    });
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve({ 
      buffer: Buffer.concat(chunks), 
      title, 
      thumbnail,
      duration 
    }));
    stream.on('error', reject);
  });
}

// TikTok Downloader
async function cmdTiktok(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL TikTok!\n\nContoh: .tiktok https://vt.tiktok.com/xxx' 
    });
  }
  
  const url = args[0];
  if (!url.includes('tiktok.com')) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ URL TikTok tidak valid' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh video TikTok...' });
    
    const response = await axios.post('https://www.tikwm.com/api/', `url=${encodeURIComponent(url)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000
    });
    
    const data = response.data?.data;
    if (!data || !data.play) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh video' });
    }
    
    const videoResponse = await axios.get(data.play, { 
      responseType: 'arraybuffer',
      timeout: 60000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const caption = `📹 *TikTok Download*\n\n👤 ${data.author?.nickname || 'Unknown'}\n❤️ ${data.digg_count || 0} | 💬 ${data.comment_count || 0}\n\n📝 ${data.title || ''}`;

    await sock.sendMessage(msg.key.remoteJid, {
      video: Buffer.from(videoResponse.data),
      caption
    });
  } catch (err) {
    console.error('TikTok Error:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh TikTok' });
  }
}

// TikTok MP3
async function cmdTiktokMP3(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL TikTok!\n\nContoh: .tiktokmp3 https://vt.tiktok.com/xxx' 
    });
  }
  
  const url = args[0];
  if (!url.includes('tiktok.com')) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ URL TikTok tidak valid' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh audio TikTok...' });
    
    const response = await axios.post('https://www.tikwm.com/api/', `url=${encodeURIComponent(url)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000
    });
    
    const data = response.data?.data;
    if (!data || !data.music) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh audio' });
    }
    
    const audioResponse = await axios.get(data.music, { 
      responseType: 'arraybuffer',
      timeout: 60000
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      audio: Buffer.from(audioResponse.data),
      mimetype: 'audio/mpeg',
      ptt: false
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh audio TikTok' });
  }
}

// Instagram Downloader
async function cmdInstagram(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL Instagram!\n\nContoh: .ig https://instagram.com/reel/xxx' 
    });
  }
  
  const url = args[0];
  if (!url.includes('instagram.com')) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ URL Instagram tidak valid' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh media Instagram...' });
    
    let mediaUrls = [];
    
    // Try instagram-url-direct library
    try {
      const { instagramGetUrl } = require('instagram-url-direct');
      const result = await instagramGetUrl(url);
      if (result?.url_list?.length > 0) {
        mediaUrls = result.url_list;
      }
    } catch (e) {
      console.log('IG Library failed:', e.message);
    }
    
    // Fallback API
    if (mediaUrls.length === 0) {
      try {
        const response = await axios.get(`https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(url)}`, { timeout: 15000 });
        if (response.data?.data) {
          mediaUrls = Array.isArray(response.data.data) ? response.data.data.map(m => m.url || m) : [response.data.data];
        }
      } catch (e) {
        console.log('IG API failed:', e.message);
      }
    }
    
    if (mediaUrls.length === 0) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh. Post mungkin private.' });
    }
    
    for (const mediaUrl of mediaUrls.slice(0, 5)) {
      try {
        const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('video');
        const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 60000 });
        
        if (isVideo) {
          await sock.sendMessage(msg.key.remoteJid, { video: Buffer.from(mediaResponse.data), caption: '📹 *Instagram*' });
        } else {
          await sock.sendMessage(msg.key.remoteJid, { image: Buffer.from(mediaResponse.data), caption: '🖼️ *Instagram*' });
        }
      } catch (e) {}
    }
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh Instagram' });
  }
}

// Instagram Reels
async function cmdIGReels(sock, msg, bot, args) {
  return cmdInstagram(sock, msg, bot, args);
}

// Instagram Story
async function cmdIGStory(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan username Instagram!\n\nContoh: .igstory username' 
    });
  }
  
  const username = args[0].replace('@', '');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh story...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/d/igstory?username=${encodeURIComponent(username)}`, { timeout: 20000 });
    const stories = response.data?.data;
    
    if (!stories || stories.length === 0) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Tidak ada story atau akun private' });
    }
    
    for (const story of stories.slice(0, 5)) {
      try {
        const mediaUrl = story.url || story;
        const isVideo = mediaUrl.includes('.mp4') || story.type === 'video';
        const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 30000 });
        
        if (isVideo) {
          await sock.sendMessage(msg.key.remoteJid, { video: Buffer.from(mediaResponse.data) });
        } else {
          await sock.sendMessage(msg.key.remoteJid, { image: Buffer.from(mediaResponse.data) });
        }
      } catch (e) {}
    }
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh story' });
  }
}

// Facebook Downloader
async function cmdFacebook(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL Facebook!\n\nContoh: .fb https://facebook.com/watch?v=xxx' 
    });
  }
  
  const url = args[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh video Facebook...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(url)}`, { timeout: 30000 });
    const data = response.data?.data;
    
    if (!data || !data.hd && !data.sd) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh video' });
    }
    
    const videoUrl = data.hd || data.sd;
    const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 });
    
    await sock.sendMessage(msg.key.remoteJid, {
      video: Buffer.from(videoResponse.data),
      caption: '📹 *Facebook Video*'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh Facebook' });
  }
}

// Twitter/X Downloader
async function cmdTwitter(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL Twitter/X!\n\nContoh: .twitter https://twitter.com/user/status/xxx' 
    });
  }
  
  const url = args[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh media Twitter...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/d/twitter?url=${encodeURIComponent(url)}`, { timeout: 30000 });
    const data = response.data?.data;
    
    if (!data) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh media' });
    }
    
    const mediaUrl = data.url || data.video || data;
    const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 60000 });
    
    await sock.sendMessage(msg.key.remoteJid, {
      video: Buffer.from(mediaResponse.data),
      caption: '📹 *Twitter/X Video*'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh Twitter' });
  }
}

// Spotify Downloader
async function cmdSpotify(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL Spotify!\n\nContoh: .spotify https://open.spotify.com/track/xxx' 
    });
  }
  
  const url = args[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh dari Spotify...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(url)}`, { timeout: 30000 });
    const data = response.data?.data;
    
    if (!data || !data.url) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh' });
    }
    
    const audioResponse = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 60000 });
    
    await sock.sendMessage(msg.key.remoteJid, {
      audio: Buffer.from(audioResponse.data),
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: `${data.title || 'spotify'}.mp3`
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh Spotify' });
  }
}

// SoundCloud Downloader
async function cmdSoundCloud(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL SoundCloud!\n\nContoh: .soundcloud https://soundcloud.com/xxx' 
    });
  }
  
  const url = args[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh dari SoundCloud...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/d/soundcloud?url=${encodeURIComponent(url)}`, { timeout: 30000 });
    const data = response.data?.data;
    
    if (!data || !data.url) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh' });
    }
    
    const audioResponse = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 60000 });
    
    await sock.sendMessage(msg.key.remoteJid, {
      audio: Buffer.from(audioResponse.data),
      mimetype: 'audio/mpeg',
      ptt: false
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh SoundCloud' });
  }
}

// Pinterest
async function cmdPinterest(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan kata kunci atau link Pinterest!\n\nContoh: .pinterest anime wallpaper' 
    });
  }
  
  const input = args.join(' ');
  const isPinUrl = input.includes('pinterest.com') || input.includes('pin.it');
  
  try {
    if (isPinUrl) {
      await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh dari Pinterest...' });
      
      const response = await axios.get(`https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(input)}`, { timeout: 15000 });
      const imageUrl = response.data?.data?.image || response.data?.data;
      
      if (!imageUrl) {
        return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh' });
      }
      
      const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
      await sock.sendMessage(msg.key.remoteJid, { image: Buffer.from(imgResponse.data), caption: '🖼️ *Pinterest*' });
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: '🔍 Mencari di Pinterest...' });
      
      const response = await axios.get(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(input)}`, { timeout: 15000 });
      const images = response.data?.data;
      
      if (!images || images.length === 0) {
        return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Tidak ditemukan' });
      }
      
      const randomImg = images[Math.floor(Math.random() * images.length)];
      const imgUrl = randomImg.image_url || randomImg;
      
      const imgResponse = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 30000 });
      await sock.sendMessage(msg.key.remoteJid, { 
        image: Buffer.from(imgResponse.data), 
        caption: `🖼️ *Pinterest*\n🔍 ${input}` 
      });
    }
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh Pinterest' });
  }
}

// Pinterest Search
async function cmdPinterestSearch(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan kata kunci!\n\nContoh: .pins aesthetic wallpaper' 
    });
  }
  
  return cmdPinterest(sock, msg, bot, args);
}

// Mediafire Downloader
async function cmdMediafire(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL Mediafire!\n\nContoh: .mediafire https://mediafire.com/file/xxx' 
    });
  }
  
  const url = args[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh dari Mediafire...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/d/mediafire?url=${encodeURIComponent(url)}`, { timeout: 30000 });
    const data = response.data?.data;
    
    if (!data || !data.url) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh' });
    }
    
    const fileResponse = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 120000 });
    
    await sock.sendMessage(msg.key.remoteJid, {
      document: Buffer.from(fileResponse.data),
      mimetype: 'application/octet-stream',
      fileName: data.filename || 'file'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh Mediafire' });
  }
}

// Google Drive Downloader
async function cmdGDrive(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL Google Drive!\n\nContoh: .gdrive https://drive.google.com/file/d/xxx' 
    });
  }
  
  const url = args[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh dari Google Drive...' });
    
    // Extract file ID
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!match) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ URL tidak valid' });
    }
    
    const fileId = match[1];
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    const response = await axios.get(downloadUrl, { 
      responseType: 'arraybuffer', 
      timeout: 120000,
      maxRedirects: 5
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      document: Buffer.from(response.data),
      mimetype: 'application/octet-stream',
      fileName: 'gdrive_file'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh. File mungkin private.' });
  }
}

// Threads Downloader
async function cmdThreads(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL Threads!\n\nContoh: .threads https://threads.net/xxx' 
    });
  }
  
  const url = args[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh dari Threads...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/d/threads?url=${encodeURIComponent(url)}`, { timeout: 30000 });
    const data = response.data?.data;
    
    if (!data) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh' });
    }
    
    const mediaUrl = data.url || data.video || data.image;
    const isVideo = mediaUrl.includes('.mp4') || data.type === 'video';
    
    const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 60000 });
    
    if (isVideo) {
      await sock.sendMessage(msg.key.remoteJid, { video: Buffer.from(mediaResponse.data), caption: '📹 *Threads*' });
    } else {
      await sock.sendMessage(msg.key.remoteJid, { image: Buffer.from(mediaResponse.data), caption: '🖼️ *Threads*' });
    }
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh Threads' });
  }
}


// YouTube Play (Audio)
async function cmdPlay(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan judul lagu!\n\nContoh: .play dewa 19 kangen' 
    });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🎵 Mencari lagu...' });
    
    // Search YouTube
    const searchResult = await searchYouTube(query);
    if (!searchResult) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Lagu tidak ditemukan' });
    }
    
    const { videoId, url: videoUrl } = searchResult;
    const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    
    // Send thumbnail first
    try {
      const thumbResponse = await axios.get(thumbnail, { responseType: 'arraybuffer', timeout: 5000 });
      await sock.sendMessage(msg.key.remoteJid, {
        image: Buffer.from(thumbResponse.data),
        caption: `🎵 *YouTube Audio*\n\n🔗 ${videoUrl}\n\n_Sedang mengunduh..._`
      });
    } catch (e) {
      await sock.sendMessage(msg.key.remoteJid, { text: `🎵 *YouTube Audio*\n\n🔗 ${videoUrl}\n\n_Sedang mengunduh..._` });
    }
    
    // Download using ytdl-core
    const result = await downloadYouTubeAudio(videoUrl);
    
    // Send as video since audio-only is blocked by YouTube
    await sock.sendMessage(msg.key.remoteJid, {
      video: result.buffer,
      mimetype: 'video/mp4',
      caption: `🎵 *${result.title || query}*`
    });
  } catch (err) {
    console.error('Play Error:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh lagu. Coba lagi nanti.' });
  }
}

// YouTube Play Video
async function cmdPlayVid(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan judul video!\n\nContoh: .playvid tutorial javascript' 
    });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🎬 Mencari video...' });
    
    const searchResult = await searchYouTube(query);
    if (!searchResult) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Video tidak ditemukan' });
    }
    
    const { url: videoUrl } = searchResult;
    
    await sock.sendMessage(msg.key.remoteJid, { text: `🎬 Mengunduh video...\n\n🔗 ${videoUrl}` });
    
    const result = await downloadYouTubeVideo(videoUrl);
    
    await sock.sendMessage(msg.key.remoteJid, {
      video: result.buffer,
      caption: `🎬 *${result.title || query}*`
    });
  } catch (err) {
    console.error('PlayVid Error:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh video. Coba lagi nanti.' });
  }
}

// YouTube MP3 (by URL)
async function cmdYTMP3(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL YouTube!\n\nContoh: .ytmp3 https://youtube.com/watch?v=xxx' 
    });
  }
  
  const url = args[0];
  
  // Validate YouTube URL
  if (!ytdl.validateURL(url)) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ URL YouTube tidak valid' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🎵 Mengunduh audio...' });
    
    const result = await downloadYouTubeAudio(url);
    
    // Send as video since audio-only is blocked by YouTube
    await sock.sendMessage(msg.key.remoteJid, {
      video: result.buffer,
      mimetype: 'video/mp4',
      caption: `🎵 *${result.title || 'YouTube Audio'}*`
    });
  } catch (err) {
    console.error('YTMP3 Error:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh audio. Coba lagi nanti.' });
  }
}

// YouTube MP4 (by URL)
async function cmdYTMP4(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL YouTube!\n\nContoh: .ytmp4 https://youtube.com/watch?v=xxx' 
    });
  }
  
  const url = args[0];
  
  // Validate YouTube URL
  if (!ytdl.validateURL(url)) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ URL YouTube tidak valid' });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🎬 Mengunduh video...' });
    
    const result = await downloadYouTubeVideo(url);
    
    await sock.sendMessage(msg.key.remoteJid, {
      video: result.buffer,
      caption: `🎬 *${result.title || 'YouTube Video'}*`
    });
  } catch (err) {
    console.error('YTMP4 Error:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh video. Coba lagi nanti.' });
  }
}

// YouTube Search
async function cmdYTSearch(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan kata kunci!\n\nContoh: .ytsearch tutorial javascript' 
    });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔍 Mencari di YouTube...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/s/youtube?query=${encodeURIComponent(query)}`, { timeout: 15000 });
    const results = response.data?.data;
    
    if (!results || results.length === 0) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Tidak ditemukan' });
    }
    
    let text = `🔍 *YouTube Search: ${query}*\n\n`;
    results.slice(0, 5).forEach((v, i) => {
      text += `${i + 1}. *${v.title}*\n`;
      text += `   👤 ${v.channel || 'Unknown'}\n`;
      text += `   ⏱️ ${v.duration || '-'}\n`;
      text += `   🔗 ${v.url}\n\n`;
    });
    
    await sock.sendMessage(msg.key.remoteJid, { text });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mencari' });
  }
}

// Snack Video
async function cmdSnackVideo(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL Snack Video!\n\nContoh: .snackvideo https://snackvideo.com/xxx' 
    });
  }
  
  const url = args[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh Snack Video...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/d/snackvideo?url=${encodeURIComponent(url)}`, { timeout: 30000 });
    const data = response.data?.data;
    
    if (!data || !data.url) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh' });
    }
    
    const videoResponse = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 60000 });
    
    await sock.sendMessage(msg.key.remoteJid, {
      video: Buffer.from(videoResponse.data),
      caption: '📹 *Snack Video*'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh Snack Video' });
  }
}

// Likee
async function cmdLikee(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL Likee!\n\nContoh: .likee https://likee.video/xxx' 
    });
  }
  
  const url = args[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh Likee...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/d/likee?url=${encodeURIComponent(url)}`, { timeout: 30000 });
    const data = response.data?.data;
    
    if (!data || !data.url) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh' });
    }
    
    const videoResponse = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 60000 });
    
    await sock.sendMessage(msg.key.remoteJid, {
      video: Buffer.from(videoResponse.data),
      caption: '📹 *Likee Video*'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh Likee' });
  }
}

// CapCut Template
async function cmdCapCut(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL CapCut!\n\nContoh: .capcut https://capcut.com/template/xxx' 
    });
  }
  
  const url = args[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh template CapCut...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/d/capcut?url=${encodeURIComponent(url)}`, { timeout: 30000 });
    const data = response.data?.data;
    
    if (!data || !data.url) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh' });
    }
    
    const videoResponse = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 60000 });
    
    await sock.sendMessage(msg.key.remoteJid, {
      video: Buffer.from(videoResponse.data),
      caption: `🎬 *CapCut Template*\n\n📝 ${data.title || ''}`
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh CapCut' });
  }
}

// Terabox
async function cmdTerabox(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL Terabox!\n\nContoh: .terabox https://terabox.com/s/xxx' 
    });
  }
  
  const url = args[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh dari Terabox...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/d/terabox?url=${encodeURIComponent(url)}`, { timeout: 60000 });
    const data = response.data?.data;
    
    if (!data || !data.url) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh' });
    }
    
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `📦 *Terabox Download*\n\n📁 ${data.filename || 'File'}\n📊 ${data.size || '-'}\n\n🔗 ${data.url}` 
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh Terabox' });
  }
}

// Bilibili
async function cmdBilibili(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL Bilibili!\n\nContoh: .bilibili https://bilibili.com/video/xxx' 
    });
  }
  
  const url = args[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh dari Bilibili...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/d/bilibili?url=${encodeURIComponent(url)}`, { timeout: 60000 });
    const data = response.data?.data;
    
    if (!data || !data.url) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh' });
    }
    
    const videoResponse = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 120000 });
    
    await sock.sendMessage(msg.key.remoteJid, {
      video: Buffer.from(videoResponse.data),
      caption: `📹 *Bilibili*\n\n📝 ${data.title || ''}`
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh Bilibili' });
  }
}

// Sfile.mobi
async function cmdSfile(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan URL Sfile!\n\nContoh: .sfile https://sfile.mobi/xxx' 
    });
  }
  
  const url = args[0];
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengunduh dari Sfile...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/d/sfile?url=${encodeURIComponent(url)}`, { timeout: 30000 });
    const data = response.data?.data;
    
    if (!data || !data.url) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh' });
    }
    
    const fileResponse = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 120000 });
    
    await sock.sendMessage(msg.key.remoteJid, {
      document: Buffer.from(fileResponse.data),
      mimetype: 'application/octet-stream',
      fileName: data.filename || 'file'
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengunduh Sfile' });
  }
}

// APK Download
async function cmdAPK(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan nama aplikasi!\n\nContoh: .apk whatsapp' 
    });
  }
  
  const appName = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔍 Mencari APK...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/d/apk?query=${encodeURIComponent(appName)}`, { timeout: 30000 });
    const data = response.data?.data;
    
    if (!data) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ APK tidak ditemukan' });
    }
    
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `📱 *APK Download*\n\n📦 ${data.name || appName}\n📊 ${data.size || '-'}\n⭐ ${data.rating || '-'}\n\n🔗 ${data.url || 'Link tidak tersedia'}` 
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mencari APK' });
  }
}

module.exports = {
  tiktok: cmdTiktok,
  tt: cmdTiktok,
  ttdl: cmdTiktok,
  tiktokmp3: cmdTiktokMP3,
  ttmp3: cmdTiktokMP3,
  tta: cmdTiktokMP3,
  instagram: cmdInstagram,
  ig: cmdInstagram,
  igdl: cmdInstagram,
  igreels: cmdIGReels,
  reels: cmdIGReels,
  igstory: cmdIGStory,
  igs: cmdIGStory,
  facebook: cmdFacebook,
  fb: cmdFacebook,
  fbdl: cmdFacebook,
  twitter: cmdTwitter,
  tw: cmdTwitter,
  twdl: cmdTwitter,
  x: cmdTwitter,
  spotify: cmdSpotify,
  sp: cmdSpotify,
  soundcloud: cmdSoundCloud,
  sc: cmdSoundCloud,
  pinterest: cmdPinterest,
  pin: cmdPinterest,
  pinterestsearch: cmdPinterestSearch,
  pins: cmdPinterestSearch,
  mediafire: cmdMediafire,
  mf: cmdMediafire,
  gdrive: cmdGDrive,
  drive: cmdGDrive,
  threads: cmdThreads,
  threadsdl: cmdThreads,
  play: cmdPlay,
  p: cmdPlay,
  playvid: cmdPlayVid,
  pv: cmdPlayVid,
  video: cmdPlayVid,
  ytmp3: cmdYTMP3,
  yta: cmdYTMP3,
  ytmp4: cmdYTMP4,
  ytv: cmdYTMP4,
  ytsearch: cmdYTSearch,
  yts: cmdYTSearch,
  snackvideo: cmdSnackVideo,
  snack: cmdSnackVideo,
  likee: cmdLikee,
  likeevid: cmdLikee,
  capcut: cmdCapCut,
  capcutdl: cmdCapCut,
  terabox: cmdTerabox,
  tera: cmdTerabox,
  bilibili: cmdBilibili,
  bili: cmdBilibili,
  sfile: cmdSfile,
  sfilemobi: cmdSfile,
  apk: cmdAPK,
  playstore: cmdAPK
};
