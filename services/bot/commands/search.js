/**
 * Search Commands - Complete Implementation
 * google, wiki, cuaca, kbbi, translate, github, ytsearch, image, lyrics, film, anime, manga
 * chord, resep, jadwalsholat, quran, hadist, kurs, crypto, news
 */

const axios = require('axios');

// Google Search
async function cmdGoogle(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan kata kunci!\n\nContoh: .google cara masak nasi' });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔍 Mencari...' });
    
    // Try SerpAPI alternative first
    let results = [];
    
    try {
      // Use Google Custom Search alternative
      const response = await axios.get(`https://www.googleapis.com/customsearch/v1?key=AIzaSyAa8yy0GdcGPHdtD083HiGGx_S0vMPScDM&cx=017576662512468239146:omuauf_lfve&q=${encodeURIComponent(query)}&num=5`, {
        timeout: 10000
      });
      
      if (response.data?.items) {
        results = response.data.items.map(item => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet
        }));
      }
    } catch (e) {
      // Fallback to DuckDuckGo HTML
      try {
        const response = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
          timeout: 15000,
          headers: { 'User-Agent': 'Mozilla/5.0' },
          httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        
        const resultPattern = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
        let match;
        while ((match = resultPattern.exec(response.data)) !== null && results.length < 5) {
          let url = match[1];
          if (url.includes('uddg=')) {
            const uddgMatch = url.match(/uddg=([^&]+)/);
            if (uddgMatch) url = decodeURIComponent(uddgMatch[1]);
          }
          results.push({ title: match[2].replace(/&amp;/g, '&'), link: url });
        }
      } catch (e2) {
        console.log('DuckDuckGo failed:', e2.message);
      }
    }
    
    let text = `🔍 *Hasil: ${query}*\n\n`;
    if (results.length > 0) {
      results.forEach((item, idx) => {
        text += `${idx + 1}. *${item.title}*\n`;
        if (item.snippet) text += `   ${item.snippet.substring(0, 100)}...\n`;
        text += `   🔗 ${item.link}\n\n`;
      });
    } else {
      text += `Cari langsung di:\n🔗 https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    
    await sock.sendMessage(msg.key.remoteJid, { text: text.trim() });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Cari di:\nhttps://www.google.com/search?q=${encodeURIComponent(query)}` });
  }
}

// Wikipedia
async function cmdWiki(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan kata kunci!\n\nContoh: .wiki Indonesia' });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '📚 Mencari di Wikipedia...' });
    
    let data;
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    };
    
    // Try Indonesian Wikipedia first
    try {
      const response = await axios.get(`https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, { 
        timeout: 15000,
        headers 
      });
      data = response.data;
    } catch (e) {
      // Try English Wikipedia
      try {
        const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, { 
          timeout: 15000,
          headers 
        });
        data = response.data;
      } catch (e2) {
        // Try Wikipedia search API as fallback
        const searchRes = await axios.get(`https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json`, {
          timeout: 15000,
          headers
        });
        const searchResult = searchRes.data?.query?.search?.[0];
        if (searchResult) {
          const pageRes = await axios.get(`https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchResult.title)}`, {
            timeout: 15000,
            headers
          });
          data = pageRes.data;
        }
      }
    }
    
    if (!data || !data.extract) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Tidak ditemukan' });
    }
    
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `📚 *${data.title}*\n\n${data.extract}\n\n🔗 ${data.content_urls?.desktop?.page || ''}` 
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Tidak ditemukan di Wikipedia' });
  }
}


// Weather/Cuaca
async function cmdCuaca(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan nama kota!\n\nContoh: .cuaca Jakarta' });
  }
  
  const city = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🌤️ Mengecek cuaca...' });
    
    const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=id`, { timeout: 10000 });
    
    if (!geoResponse.data.results?.length) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Kota tidak ditemukan' });
    }
    
    const { latitude, longitude, name, admin1, country } = geoResponse.data.results[0];
    
    const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`, { timeout: 10000 });
    
    const current = weatherResponse.data.current;
    const weatherCodes = { 0: 'Cerah ☀️', 1: 'Cerah Berawan 🌤️', 2: 'Berawan ⛅', 3: 'Mendung ☁️', 45: 'Berkabut 🌫️', 61: 'Hujan 🌧️', 95: 'Badai ⛈️' };
    
    const result = `🌤️ *Cuaca ${name}, ${country}*\n\n🌡️ Suhu: ${current.temperature_2m}°C\n🌡️ Terasa: ${current.apparent_temperature}°C\n💧 Kelembaban: ${current.relative_humidity_2m}%\n🌬️ Angin: ${current.wind_speed_10m} km/h\n☁️ ${weatherCodes[current.weather_code] || 'Unknown'}`;
    
    await sock.sendMessage(msg.key.remoteJid, { text: result });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengecek cuaca' });
  }
}

// KBBI
async function cmdKbbi(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan kata!\n\nContoh: .kbbi cinta' });
  }
  
  const word = args.join(' ').toLowerCase();
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '📖 Mencari di KBBI...' });
    
    const response = await axios.get(`https://kbbi-api-zhirrr.vercel.app/api/kbbi?text=${encodeURIComponent(word)}`, { timeout: 15000 });
    const data = response.data;
    
    if (!data?.lema) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Kata tidak ditemukan' });
    }
    
    let result = `📖 *KBBI: ${data.lema.trim()}*\n\n`;
    if (Array.isArray(data.arti)) {
      data.arti.forEach((arti, i) => { result += `${i + 1}. ${arti}\n`; });
    } else {
      result += data.arti;
    }
    
    await sock.sendMessage(msg.key.remoteJid, { text: result.trim() });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Kata tidak ditemukan' });
  }
}

// Translate
async function cmdTranslate(sock, msg, bot, args) {
  if (args.length < 2) {
    return await sock.sendMessage(msg.key.remoteJid, { 
      text: '❌ Format: .tr [kode bahasa] [teks]\n\nContoh: .tr en halo apa kabar\n\nKode: id, en, ja, ko, zh, ar, fr, de, es' 
    });
  }
  
  const targetLang = args[0].toLowerCase();
  const text = args.slice(1).join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🌐 Menerjemahkan...' });
    
    const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`, { timeout: 10000 });
    
    let translated = '';
    for (const part of response.data[0]) {
      if (part[0]) translated += part[0];
    }
    
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🌐 *Terjemahan*\n\n📝 *Dari:* ${text}\n\n✨ *Ke (${targetLang}):* ${translated}` 
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal menerjemahkan' });
  }
}

// GitHub
async function cmdGithub(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan username!\n\nContoh: .github torvalds' });
  }
  
  const username = args[0].replace('@', '');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🐙 Mencari profil...' });
    
    const response = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`, { timeout: 15000 });
    const user = response.data;
    
    const result = `🐙 *GitHub: ${user.login}*\n\n👤 ${user.name || '-'}\n📝 ${user.bio || '-'}\n📍 ${user.location || '-'}\n\n📁 Repos: ${user.public_repos}\n👥 Followers: ${user.followers}\n👤 Following: ${user.following}\n\n🔗 ${user.html_url}`;
    
    await sock.sendMessage(msg.key.remoteJid, { text: result });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ User tidak ditemukan' });
  }
}

// Image Search
async function cmdImage(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan kata kunci!\n\nContoh: .image kucing lucu' });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🖼️ Mencari gambar...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(query)}`, { timeout: 15000 });
    const images = response.data?.data;
    
    if (!images?.length) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gambar tidak ditemukan' });
    }
    
    const randomImg = images[Math.floor(Math.random() * images.length)];
    const imgUrl = randomImg.image_url || randomImg;
    
    const imgResponse = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 30000 });
    await sock.sendMessage(msg.key.remoteJid, { image: Buffer.from(imgResponse.data), caption: `🖼️ *${query}*` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mencari gambar' });
  }
}

// Lyrics
async function cmdLyrics(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan judul lagu!\n\nContoh: .lyrics bohemian rhapsody' });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🎵 Mencari lirik...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/s/lyrics?query=${encodeURIComponent(query)}`, { timeout: 15000 });
    const data = response.data?.data;
    
    if (!data?.lyrics) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Lirik tidak ditemukan' });
    }
    
    const lyrics = data.lyrics.length > 3000 ? data.lyrics.substring(0, 3000) + '...' : data.lyrics;
    await sock.sendMessage(msg.key.remoteJid, { text: `🎵 *${data.title || query}*\n👤 ${data.artist || 'Unknown'}\n\n${lyrics}` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Lirik tidak ditemukan' });
  }
}

// Film/Movie Search
async function cmdFilm(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan judul film!\n\nContoh: .film avengers' });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🎬 Mencari film...' });
    
    const response = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=742b2ea1`, { timeout: 15000 });
    const data = response.data;
    
    if (data.Response === 'False') {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Film tidak ditemukan' });
    }
    
    const result = `🎬 *${data.Title}* (${data.Year})\n\n⭐ IMDB: ${data.imdbRating}/10\n🎭 Genre: ${data.Genre}\n⏱️ Duration: ${data.Runtime}\n🎬 Director: ${data.Director}\n👥 Actors: ${data.Actors}\n\n📝 ${data.Plot}`;
    
    if (data.Poster && data.Poster !== 'N/A') {
      const imgResponse = await axios.get(data.Poster, { responseType: 'arraybuffer', timeout: 10000 });
      await sock.sendMessage(msg.key.remoteJid, { image: Buffer.from(imgResponse.data), caption: result });
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: result });
    }
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mencari film' });
  }
}


// Anime Search
async function cmdAnime(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan judul anime!\n\nContoh: .anime naruto' });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🎌 Mencari anime...' });
    
    const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`, { timeout: 15000 });
    const anime = response.data?.data?.[0];
    
    if (!anime) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Anime tidak ditemukan' });
    }
    
    const result = `🎌 *${anime.title}*\n${anime.title_japanese || ''}\n\n⭐ Score: ${anime.score || '-'}/10\n📺 Episodes: ${anime.episodes || '?'}\n📅 Status: ${anime.status}\n🎭 Genre: ${anime.genres?.map(g => g.name).join(', ') || '-'}\n\n📝 ${(anime.synopsis || 'No synopsis').substring(0, 500)}...`;
    
    if (anime.images?.jpg?.image_url) {
      const imgResponse = await axios.get(anime.images.jpg.image_url, { responseType: 'arraybuffer', timeout: 10000 });
      await sock.sendMessage(msg.key.remoteJid, { image: Buffer.from(imgResponse.data), caption: result });
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: result });
    }
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mencari anime' });
  }
}

// Manga Search
async function cmdManga(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan judul manga!\n\nContoh: .manga one piece' });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '📚 Mencari manga...' });
    
    const response = await axios.get(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=1`, { timeout: 15000 });
    const manga = response.data?.data?.[0];
    
    if (!manga) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Manga tidak ditemukan' });
    }
    
    const result = `📚 *${manga.title}*\n\n⭐ Score: ${manga.score || '-'}/10\n📖 Chapters: ${manga.chapters || '?'}\n📅 Status: ${manga.status}\n🎭 Genre: ${manga.genres?.map(g => g.name).join(', ') || '-'}\n\n📝 ${(manga.synopsis || 'No synopsis').substring(0, 500)}...`;
    
    if (manga.images?.jpg?.image_url) {
      const imgResponse = await axios.get(manga.images.jpg.image_url, { responseType: 'arraybuffer', timeout: 10000 });
      await sock.sendMessage(msg.key.remoteJid, { image: Buffer.from(imgResponse.data), caption: result });
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: result });
    }
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mencari manga' });
  }
}

// Chord Gitar
async function cmdChord(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan judul lagu!\n\nContoh: .chord peterpan semua tentang kita' });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🎸 Mencari chord...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/s/chord?query=${encodeURIComponent(query)}`, { timeout: 15000 });
    const data = response.data?.data;
    
    if (!data?.chord) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Chord tidak ditemukan' });
    }
    
    const chord = data.chord.length > 3000 ? data.chord.substring(0, 3000) + '...' : data.chord;
    await sock.sendMessage(msg.key.remoteJid, { text: `🎸 *${data.title || query}*\n👤 ${data.artist || 'Unknown'}\n\n${chord}` });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Chord tidak ditemukan' });
  }
}

// Resep Masakan
async function cmdResep(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan nama masakan!\n\nContoh: .resep nasi goreng' });
  }
  
  const query = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🍳 Mencari resep...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/s/resep?query=${encodeURIComponent(query)}`, { timeout: 15000 });
    const data = response.data?.data;
    
    if (!data) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Resep tidak ditemukan' });
    }
    
    let result = `🍳 *${data.title || query}*\n\n`;
    if (data.ingredients) result += `📝 *Bahan:*\n${data.ingredients}\n\n`;
    if (data.steps) result += `👨‍🍳 *Cara Masak:*\n${data.steps}`;
    
    await sock.sendMessage(msg.key.remoteJid, { text: result.substring(0, 4000) });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Resep tidak ditemukan' });
  }
}

// Jadwal Sholat
async function cmdJadwalSholat(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan nama kota!\n\nContoh: .jadwalsholat jakarta' });
  }
  
  const city = args.join(' ');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '🕌 Mengambil jadwal sholat...' });
    
    const response = await axios.get(`https://api.siputzx.my.id/api/tools/jadwalsholat?kota=${encodeURIComponent(city)}`, { timeout: 15000 });
    const data = response.data?.data;
    
    if (!data) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Kota tidak ditemukan' });
    }
    
    const result = `🕌 *Jadwal Sholat ${city}*\n📅 ${data.tanggal || new Date().toLocaleDateString('id-ID')}\n\n🌅 Subuh: ${data.subuh || '-'}\n🌄 Terbit: ${data.terbit || '-'}\n☀️ Dzuhur: ${data.dzuhur || '-'}\n🌤️ Ashar: ${data.ashar || '-'}\n🌅 Maghrib: ${data.maghrib || '-'}\n🌙 Isya: ${data.isya || '-'}`;
    
    await sock.sendMessage(msg.key.remoteJid, { text: result });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengambil jadwal sholat' });
  }
}

// Al-Quran
async function cmdQuran(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan surah:ayat!\n\nContoh: .quran 1:1' });
  }
  
  const [surah, ayat] = args[0].split(':');
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '📖 Mengambil ayat...' });
    
    const response = await axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayat || 1}/editions/quran-uthmani,id.indonesian`, { timeout: 15000 });
    const data = response.data?.data;
    
    if (!data || data.length < 2) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Ayat tidak ditemukan' });
    }
    
    const arabic = data[0];
    const indo = data[1];
    
    const result = `📖 *QS. ${arabic.surah.englishName} : ${arabic.numberInSurah}*\n\n${arabic.text}\n\n📝 *Terjemahan:*\n${indo.text}`;
    
    await sock.sendMessage(msg.key.remoteJid, { text: result });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Ayat tidak ditemukan' });
  }
}

// Hadist
async function cmdHadist(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan kitab dan nomor!\n\nContoh: .hadist bukhari 1' });
  }
  
  const kitab = args[0].toLowerCase();
  const nomor = args[1] || '1';
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '📚 Mengambil hadist...' });
    
    const response = await axios.get(`https://api.hadith.gading.dev/books/${kitab}/${nomor}`, { timeout: 15000 });
    const data = response.data?.data;
    
    if (!data) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Hadist tidak ditemukan' });
    }
    
    const result = `📚 *Hadist ${kitab.charAt(0).toUpperCase() + kitab.slice(1)} No. ${nomor}*\n\n${data.arab || ''}\n\n📝 *Terjemahan:*\n${data.id || data.contents?.id || 'Tidak tersedia'}`;
    
    await sock.sendMessage(msg.key.remoteJid, { text: result });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Hadist tidak ditemukan. Kitab: bukhari, muslim, tirmidzi, nasai, abu-daud, ibnu-majah, malik, ahmad' });
  }
}

// Kurs Mata Uang
async function cmdKurs(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan kode mata uang!\n\nContoh: .kurs usd' });
  }
  
  const currency = args[0].toUpperCase();
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '💱 Mengecek kurs...' });
    
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${currency}`, { timeout: 15000 });
    const data = response.data;
    
    if (!data?.rates) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Mata uang tidak ditemukan' });
    }
    
    const idr = data.rates.IDR;
    const usd = data.rates.USD;
    const eur = data.rates.EUR;
    const sgd = data.rates.SGD;
    const myr = data.rates.MYR;
    
    const result = `💱 *Kurs ${currency}*\n\n🇮🇩 IDR: ${idr?.toLocaleString() || '-'}\n🇺🇸 USD: ${usd?.toFixed(4) || '-'}\n🇪🇺 EUR: ${eur?.toFixed(4) || '-'}\n🇸🇬 SGD: ${sgd?.toFixed(4) || '-'}\n🇲🇾 MYR: ${myr?.toFixed(4) || '-'}`;
    
    await sock.sendMessage(msg.key.remoteJid, { text: result });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengecek kurs' });
  }
}

// Crypto
async function cmdCrypto(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan nama crypto!\n\nContoh: .crypto bitcoin' });
  }
  
  const coin = args.join(' ').toLowerCase();
  
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '💰 Mengecek harga crypto...' });
    
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}`, { timeout: 15000 });
    const data = response.data;
    
    if (!data) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Crypto tidak ditemukan' });
    }
    
    const price = data.market_data?.current_price;
    const change = data.market_data?.price_change_percentage_24h;
    
    const result = `💰 *${data.name} (${data.symbol?.toUpperCase()})*\n\n💵 USD: $${price?.usd?.toLocaleString() || '-'}\n💵 IDR: Rp${price?.idr?.toLocaleString() || '-'}\n📈 24h: ${change?.toFixed(2) || '0'}%\n\n🏆 Rank: #${data.market_cap_rank || '-'}`;
    
    await sock.sendMessage(msg.key.remoteJid, { text: result });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Crypto tidak ditemukan. Gunakan nama lengkap (bitcoin, ethereum, dll)' });
  }
}

// News/Berita
async function cmdNews(sock, msg, bot, args) {
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '📰 Mengambil berita...' });
    
    const response = await axios.get('https://api.siputzx.my.id/api/s/cnbcnews', { timeout: 15000 });
    const news = response.data?.data;
    
    if (!news?.length) {
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengambil berita' });
    }
    
    let result = '📰 *Berita Terkini*\n\n';
    news.slice(0, 5).forEach((item, i) => {
      result += `${i + 1}. *${item.title}*\n   🔗 ${item.url || item.link}\n\n`;
    });
    
    await sock.sendMessage(msg.key.remoteJid, { text: result });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengambil berita' });
  }
}

module.exports = {
  google: cmdGoogle, g: cmdGoogle,
  wiki: cmdWiki, wikipedia: cmdWiki,
  cuaca: cmdCuaca, weather: cmdCuaca,
  kbbi: cmdKbbi,
  translate: cmdTranslate, tr: cmdTranslate,
  github: cmdGithub, gh: cmdGithub,
  image: cmdImage, img: cmdImage, gambar: cmdImage,
  lyrics: cmdLyrics, lirik: cmdLyrics,
  film: cmdFilm, movie: cmdFilm,
  anime: cmdAnime, mal: cmdAnime,
  manga: cmdManga,
  chord: cmdChord, kunci: cmdChord,
  resep: cmdResep, recipe: cmdResep,
  jadwalsholat: cmdJadwalSholat, sholat: cmdJadwalSholat, prayer: cmdJadwalSholat,
  quran: cmdQuran, alquran: cmdQuran,
  hadist: cmdHadist, hadits: cmdHadist,
  kurs: cmdKurs, currency: cmdKurs, exchange: cmdKurs,
  crypto: cmdCrypto, btc: cmdCrypto, coin: cmdCrypto,
  news: cmdNews, berita: cmdNews
};
