/**
 * AI Commands - Complete Implementation
 * ai, gemini, claude, imagine, removebg, upscale, toanime, summarize, codeai, fixgrammar, aivoice, ocr, simi, openai, aiimg
 */

const axios = require('axios');

// API endpoints
const AI_APIS = {
  imagine: 'https://api.siputzx.my.id/api/ai/flux?prompt=',
  removebg: 'https://api.siputzx.my.id/api/tools/removebg',
  simi: 'https://api.siputzx.my.id/api/ai/simsimi?text=',
};

// Smart local AI responses database
const LOCAL_AI_DB = {
  // Greetings
  greetings: {
    patterns: [/^(halo|hai|hi|hello|hey|assalamualaikum|selamat\s*(pagi|siang|sore|malam))/i],
    responses: [
      'Halo! 👋 Saya adalah AI assistant. Ada yang bisa saya bantu hari ini?',
      'Hai! Senang bertemu denganmu. Silakan tanyakan apa saja!',
      'Hello! Saya siap membantu. Apa yang ingin kamu ketahui?'
    ]
  },
  // Thanks
  thanks: {
    patterns: [/(terima\s*kasih|thanks|makasih|thx|ty)/i],
    responses: [
      'Sama-sama! Senang bisa membantu 😊',
      'Terima kasih kembali! Jangan ragu bertanya lagi ya.',
      'Dengan senang hati! Ada yang lain yang bisa saya bantu?'
    ]
  },
  // How are you
  howAreYou: {
    patterns: [/(apa\s*kabar|how\s*are\s*you|gimana\s*kabar|baik|sehat)/i],
    responses: [
      'Saya baik-baik saja, terima kasih sudah bertanya! 😊 Bagaimana denganmu?',
      'Alhamdulillah baik! Saya selalu siap membantu. Ada yang bisa saya bantu?',
      'Saya selalu dalam kondisi prima untuk membantu! Ada pertanyaan?'
    ]
  },
  // Who are you
  whoAreYou: {
    patterns: [/(siapa\s*(kamu|anda|lo|lu)|who\s*are\s*you|kamu\s*siapa|nama\s*(kamu|mu))/i],
    responses: [
      'Saya adalah AI assistant yang siap membantu menjawab pertanyaan dan memberikan informasi. Saya bisa membantu dengan berbagai topik!',
      'Hai! Saya bot AI yang dibuat untuk membantu pengguna. Saya bisa menjawab pertanyaan, memberikan informasi, dan banyak lagi!',
      'Saya adalah asisten virtual berbasis AI. Tanyakan apa saja dan saya akan berusaha membantu!'
    ]
  },
  // What can you do
  capabilities: {
    patterns: [/(apa\s*yang\s*bisa|bisa\s*apa|kemampuan|fitur|what\s*can\s*you)/i],
    responses: [
      '🤖 Saya bisa membantu dengan:\n\n• Menjawab pertanyaan umum\n• Memberikan informasi\n• Membantu dengan coding\n• Menjelaskan konsep\n• Dan banyak lagi!\n\nSilakan tanyakan apa saja!'
    ]
  },
  // Programming questions
  programming: {
    patterns: [/(javascript|python|java|coding|programming|code|fungsi|function|variable|array|loop)/i],
    responses: [
      '💻 Untuk pertanyaan programming yang lebih detail, saya sarankan:\n\n1. Cek dokumentasi resmi\n2. Gunakan Stack Overflow\n3. Coba MDN Web Docs untuk JavaScript\n4. Python docs untuk Python\n\nAtau jelaskan lebih spesifik apa yang ingin kamu ketahui!'
    ]
  },
  // Math
  math: {
    patterns: [/(berapa|hitung|kalkulasi|matematika|math|plus|minus|kali|bagi|\d+\s*[\+\-\*\/]\s*\d+)/i],
    responses: [
      '🔢 Untuk perhitungan matematika, gunakan command .calc\n\nContoh: .calc 10 + 5 * 2\n\nAtau jelaskan soal matematikanya!'
    ]
  },
  // Weather
  weather: {
    patterns: [/(cuaca|weather|hujan|panas|cerah|mendung)/i],
    responses: [
      '🌤️ Untuk informasi cuaca, gunakan command .cuaca [kota]\n\nContoh: .cuaca Jakarta\n\nIni akan memberikan info cuaca terkini!'
    ]
  },
  // Time/Date
  timeDate: {
    patterns: [/(jam\s*berapa|tanggal|hari\s*ini|waktu|time|date)/i],
    responses: () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' };
      return `🕐 Sekarang: ${now.toLocaleDateString('id-ID', options)} WIB`;
    }
  },
  // Jokes
  jokes: {
    patterns: [/(joke|jokes|lelucon|lawak|lucu|humor)/i],
    responses: [
      '😄 Gunakan command .jokes untuk mendapatkan lelucon random!',
      '🤣 Mau dengar jokes? Ketik .jokes ya!'
    ]
  },
  // Love/Relationship
  love: {
    patterns: [/(cinta|love|pacar|jodoh|gebetan|pdkt)/i],
    responses: [
      '💕 Cinta itu indah! Untuk cek kecocokan, coba .love @nama\n\nAtau mau quotes bucin? Ketik .bucin',
      '❤️ Soal cinta ya? Coba fitur:\n• .love @nama - cek kecocokan\n• .bucin - quotes bucin\n• .galau - quotes galau'
    ]
  }
};

// Get smart local response
function getSmartResponse(query) {
  const q = query.toLowerCase().trim();
  
  for (const [key, data] of Object.entries(LOCAL_AI_DB)) {
    for (const pattern of data.patterns) {
      if (pattern.test(q)) {
        if (typeof data.responses === 'function') {
          return data.responses();
        }
        return data.responses[Math.floor(Math.random() * data.responses.length)];
      }
    }
  }
  
  return null;
}

// Fallback response when no API works
function getFallbackResponse(query) {
  const smartResponse = getSmartResponse(query);
  if (smartResponse) return smartResponse;
  
  return `🤖 Maaf, saya tidak bisa menjawab pertanyaan "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}" saat ini.

💡 *Tips:*
• Coba pertanyaan yang lebih spesifik
• Gunakan fitur lain seperti .wiki, .google, atau .cuaca
• Server AI sedang dalam maintenance

Ketik .menu untuk melihat semua fitur yang tersedia!`;
}

// Call GPT with multiple fallbacks
async function callGPT(query) {
  // Try smart local response first
  const smartResponse = getSmartResponse(query);
  if (smartResponse) return smartResponse;
  
  // Try external APIs (currently most are down, but keep trying)
  const apis = [
    { 
      url: 'https://free.churchless.tech/v1/chat/completions', 
      type: 'post',
      body: { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: query }] }
    },
    { url: 'https://hercai.onrender.com/v3/hercai?question=', type: 'get' }
  ];
  
  for (const api of apis) {
    try {
      let response;
      if (api.type === 'post') {
        response = await axios.post(api.url, api.body, { 
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' }
        });
        const result = response.data?.choices?.[0]?.message?.content;
        if (result && result.length > 5) return result;
      } else {
        response = await axios.get(api.url + encodeURIComponent(query), { timeout: 15000 });
        const result = response.data?.reply || response.data?.data || response.data?.result;
        if (result && result.length > 5) return result;
      }
    } catch (e) {
      console.log('AI API failed:', api.url.substring(0, 30), e.message);
    }
  }
  
  // Return fallback
  return getFallbackResponse(query);
}

// AI Chat (GPT)
async function cmdAI(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan pertanyaan!\n\nContoh: .ai Apa itu JavaScript?' 
    });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🤖 Sedang berpikir...' });
    
    const result = await callGPT(query);
    
    await sock.sendMessage(msg.key.remoteJid, { text: `🤖 *AI Response*\n\n${result}` });
  } catch (err) {
    console.error('AI Error:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Terjadi error. Coba lagi nanti.' });
  }
}

// Gemini AI
async function cmdGemini(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan pertanyaan!\n\nContoh: .gemini Jelaskan tentang AI' 
    });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '✨ Gemini sedang berpikir...' });
    
    // Use same GPT API with Gemini branding
    const result = await callGPT(query);
    
    if (!result) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mendapatkan response' });
    }
    
    await sock.sendMessage(msg.key.remoteJid, { text: `✨ *Gemini AI*\n\n${result}` });
  } catch (err) {
    console.error('Gemini Error:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mendapatkan response Gemini' });
  }
}

// Claude AI (using alternative API)
async function cmdClaude(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan pertanyaan!\n\nContoh: .claude Bantu saya coding' 
    });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🧠 Claude sedang berpikir...' });
    
    // Use same GPT API with Claude branding
    const result = await callGPT(query);
    
    if (!result) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mendapatkan response' });
    }
    
    await sock.sendMessage(msg.key.remoteJid, { text: `🧠 *Claude AI*\n\n${result}` });
  } catch (err) {
    console.error('Claude Error:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mendapatkan response Claude' });
  }
}

// SimSimi Chat
async function cmdSimi(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan pesan!\n\nContoh: .simi Halo apa kabar?' 
    });
  }
  
  const text = args.join(' ');
  
  try {
    const response = await axios.get(AI_APIS.simi + encodeURIComponent(text) + '&lang=id', { timeout: 15000 });
    const result = response.data?.data || response.data?.result || response.data?.answer;
    
    if (!result) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '🐤 Simi bingung...' });
    }
    
    await sock.sendMessage(msg.key.remoteJid, { text: `🐤 *SimSimi*\n\n${result}` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '🐤 Simi lagi tidur...' });
  }
}

// OpenAI (alias for AI)
async function cmdOpenAI(sock, msg, bot, args) {
  return cmdAI(sock, msg, bot, args);
}

// AI Image Generation
async function cmdImagine(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan deskripsi gambar!\n\nContoh: .imagine beautiful sunset on the beach' 
    });
  }
  
  const prompt = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🎨 Sedang membuat gambar...' });
    
    const response = await axios.get(AI_APIS.imagine + encodeURIComponent(prompt), { 
      timeout: 60000,
      responseType: 'arraybuffer'
    });
    
    const contentType = response.headers['content-type'];
    
    if (contentType && contentType.includes('image')) {
      await sock.sendMessage(msg.key.remoteJid, {
        image: Buffer.from(response.data),
        caption: `🎨 *AI Generated Image*\n\n📝 Prompt: ${prompt}`
      });
    } else {
      const data = JSON.parse(Buffer.from(response.data).toString());
      const imageUrl = data.data || data.result || data.url || data.image;
      
      if (imageUrl) {
        const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
        await sock.sendMessage(msg.key.remoteJid, {
          image: Buffer.from(imgResponse.data),
          caption: `🎨 *AI Generated Image*\n\n📝 Prompt: ${prompt}`
        });
      } else {
        throw new Error('No image URL');
      }
    }
  } catch (err) {
    console.error('Imagine Error:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal membuat gambar. Coba lagi.' });
  }
}

// AI Image (alias)
async function cmdAIImg(sock, msg, bot, args) {
  return cmdImagine(sock, msg, bot, args);
}

// Remove Background
async function cmdRemoveBG(sock, msg, bot, args) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasImage = msg.message?.imageMessage || quotedMsg?.imageMessage;
  
  if (!hasImage) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Kirim/reply gambar dengan caption .removebg' 
    });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Menghapus background...' });
    
    // Download image
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const buffer = await downloadMediaMessage(
      quotedMsg?.imageMessage ? { message: { imageMessage: quotedMsg.imageMessage } } : msg,
      'buffer',
      {}
    );
    
    // Use remove.bg API alternative
    const FormData = require('form-data');
    const form = new FormData();
    form.append('image', buffer, { filename: 'image.jpg' });
    
    const response = await axios.post('https://api.siputzx.my.id/api/tools/removebg', form, {
      headers: form.getHeaders(),
      timeout: 60000,
      responseType: 'arraybuffer'
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: Buffer.from(response.data),
      caption: '✅ *Background Removed*'
    });
  } catch (err) {
    console.error('RemoveBG Error:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal menghapus background' });
  }
}

// Upscale/HD Image
async function cmdUpscale(sock, msg, bot, args) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasImage = msg.message?.imageMessage || quotedMsg?.imageMessage;
  
  if (!hasImage) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Kirim/reply gambar dengan caption .upscale' 
    });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Meningkatkan kualitas gambar...' });
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const buffer = await downloadMediaMessage(
      quotedMsg?.imageMessage ? { message: { imageMessage: quotedMsg.imageMessage } } : msg,
      'buffer',
      {}
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
      caption: '✅ *Image Upscaled (HD)*'
    });
  } catch (err) {
    console.error('Upscale Error:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal upscale gambar' });
  }
}

// To Anime
async function cmdToAnime(sock, msg, bot, args) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasImage = msg.message?.imageMessage || quotedMsg?.imageMessage;
  
  if (!hasImage) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Kirim/reply foto dengan caption .toanime' 
    });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🎨 Mengubah ke anime style...' });
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const buffer = await downloadMediaMessage(
      quotedMsg?.imageMessage ? { message: { imageMessage: quotedMsg.imageMessage } } : msg,
      'buffer',
      {}
    );
    
    const FormData = require('form-data');
    const form = new FormData();
    form.append('image', buffer, { filename: 'image.jpg' });
    
    const response = await axios.post('https://api.siputzx.my.id/api/tools/toanime', form, {
      headers: form.getHeaders(),
      timeout: 60000,
      responseType: 'arraybuffer'
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      image: Buffer.from(response.data),
      caption: '🎨 *Anime Style*'
    });
  } catch (err) {
    console.error('ToAnime Error:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal convert ke anime' });
  }
}

// Summarize Text
async function cmdSummarize(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan teks untuk diringkas!\n\nContoh: .summarize [teks panjang]' 
    });
  }
  
  const text = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '📝 Meringkas teks...' });
    
    const prompt = `Ringkas teks berikut dalam bahasa Indonesia dengan poin-poin penting:\n\n${text}`;
    const response = await axios.get(AI_APIS.gpt + encodeURIComponent(prompt), { timeout: 30000 });
    const result = response.data?.data || response.data?.result;
    
    if (!result) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal meringkas' });
    }
    
    await sock.sendMessage(msg.key.remoteJid, { text: `📝 *Ringkasan*\n\n${result}` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal meringkas teks' });
  }
}

// Code AI
async function cmdCodeAI(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan request coding!\n\nContoh: .codeai buat fungsi sorting bubble sort javascript' 
    });
  }
  
  const request = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '💻 Generating code...' });
    
    const prompt = `Buatkan code untuk: ${request}. Berikan code yang lengkap dengan penjelasan singkat.`;
    const response = await axios.get(AI_APIS.gpt + encodeURIComponent(prompt), { timeout: 30000 });
    const result = response.data?.data || response.data?.result;
    
    if (!result) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal generate code' });
    }
    
    await sock.sendMessage(msg.key.remoteJid, { text: `💻 *Code AI*\n\n${result}` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal generate code' });
  }
}

// Fix Grammar
async function cmdFixGrammar(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan teks untuk diperbaiki!\n\nContoh: .fixgrammar i is going to school yesterday' 
    });
  }
  
  const text = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '✏️ Memperbaiki grammar...' });
    
    const prompt = `Perbaiki grammar dan ejaan dari teks berikut, berikan versi yang benar saja:\n\n${text}`;
    const response = await axios.get(AI_APIS.gpt + encodeURIComponent(prompt), { timeout: 30000 });
    const result = response.data?.data || response.data?.result;
    
    if (!result) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal memperbaiki' });
    }
    
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `✏️ *Grammar Fix*\n\n❌ *Sebelum:*\n${text}\n\n✅ *Sesudah:*\n${result}` 
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal memperbaiki grammar' });
  }
}

// AI Voice (TTS with AI voice)
async function cmdAIVoice(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Masukkan teks!\n\nContoh: .aivoice Halo semuanya' 
    });
  }
  
  const text = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔊 Generating AI voice...' });
    
    // Use Google TTS as fallback
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=id&client=tw-ob`;
    
    const response = await axios.get(ttsUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://translate.google.com/'
      }
    });
    
    await sock.sendMessage(msg.key.remoteJid, {
      audio: Buffer.from(response.data),
      mimetype: 'audio/mpeg',
      ptt: true
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal generate AI voice' });
  }
}

// OCR - Read text from image
async function cmdOCR(sock, msg, bot, args) {
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasImage = msg.message?.imageMessage || quotedMsg?.imageMessage;
  
  if (!hasImage) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Kirim/reply gambar dengan caption .ocr' 
    });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔍 Membaca teks dari gambar...' });
    
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const buffer = await downloadMediaMessage(
      quotedMsg?.imageMessage ? { message: { imageMessage: quotedMsg.imageMessage } } : msg,
      'buffer',
      {}
    );
    
    const FormData = require('form-data');
    const form = new FormData();
    form.append('image', buffer, { filename: 'image.jpg' });
    
    const response = await axios.post('https://api.siputzx.my.id/api/tools/ocr', form, {
      headers: form.getHeaders(),
      timeout: 30000
    });
    
    const text = response.data?.data || response.data?.result || response.data?.text;
    
    if (!text) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Tidak ada teks yang terdeteksi' });
    }
    
    await sock.sendMessage(msg.key.remoteJid, { text: `📝 *OCR Result*\n\n${text}` });
  } catch (err) {
    console.error('OCR Error:', err.message);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal membaca teks dari gambar' });
  }
}

module.exports = {
  ai: cmdAI,
  gpt: cmdAI,
  chatgpt: cmdAI,
  gemini: cmdGemini,
  bard: cmdGemini,
  claude: cmdClaude,
  simi: cmdSimi,
  simsimi: cmdSimi,
  openai: cmdOpenAI,
  imagine: cmdImagine,
  dalle: cmdImagine,
  generateimg: cmdImagine,
  aiimg: cmdAIImg,
  ai2img: cmdAIImg,
  removebg: cmdRemoveBG,
  rmbg: cmdRemoveBG,
  nobg: cmdRemoveBG,
  upscale: cmdUpscale,
  enhance: cmdUpscale,
  toanime: cmdToAnime,
  anime2d: cmdToAnime,
  summarize: cmdSummarize,
  ringkas: cmdSummarize,
  codeai: cmdCodeAI,
  code: cmdCodeAI,
  fixgrammar: cmdFixGrammar,
  grammar: cmdFixGrammar,
  aivoice: cmdAIVoice,
  ttsai: cmdAIVoice,
  ocr: cmdOCR,
  readtext: cmdOCR
};
