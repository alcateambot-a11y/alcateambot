/**
 * Final Test - Test critical commands with real API calls
 */

const axios = require('axios');

// Test AI API
async function testAI() {
  console.log('\n🤖 Testing AI (GPT via Churchless)...');
  try {
    const response = await axios.post('https://free.churchless.tech/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Halo, siapa kamu?' }]
    }, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    const result = response.data?.choices?.[0]?.message?.content;
    console.log('✅ AI Response:', result?.substring(0, 100) + '...');
    return true;
  } catch (e) {
    console.log('❌ AI Failed:', e.message);
    return false;
  }
}

// Test Wikipedia
async function testWiki() {
  console.log('\n📚 Testing Wikipedia...');
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json'
    };
    const response = await axios.get('https://id.wikipedia.org/api/rest_v1/page/summary/Indonesia', { 
      timeout: 15000,
      headers 
    });
    console.log('✅ Wiki Response:', response.data?.title, '-', response.data?.extract?.substring(0, 80) + '...');
    return true;
  } catch (e) {
    console.log('❌ Wiki Failed:', e.message);
    return false;
  }
}

// Test TikTok
async function testTikTok() {
  console.log('\n📱 Testing TikTok API...');
  try {
    const response = await axios.post('https://www.tikwm.com/api/', 'url=https://vt.tiktok.com/test', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });
    console.log('✅ TikTok API accessible');
    return true;
  } catch (e) {
    console.log('❌ TikTok Failed:', e.message);
    return false;
  }
}

// Test Pinterest
async function testPinterest() {
  console.log('\n🖼️ Testing Pinterest...');
  try {
    const response = await axios.get('https://api.siputzx.my.id/api/s/pinterest?query=anime', { timeout: 15000 });
    const count = response.data?.data?.length || 0;
    console.log('✅ Pinterest Response:', count, 'images found');
    return count > 0;
  } catch (e) {
    console.log('❌ Pinterest Failed:', e.message);
    return false;
  }
}

// Test Weather
async function testWeather() {
  console.log('\n🌤️ Testing Weather API...');
  try {
    const geoRes = await axios.get('https://geocoding-api.open-meteo.com/v1/search?name=Jakarta&count=1', { timeout: 10000 });
    const { latitude, longitude } = geoRes.data.results[0];
    const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`, { timeout: 10000 });
    console.log('✅ Weather Response: Jakarta', weatherRes.data?.current?.temperature_2m + '°C');
    return true;
  } catch (e) {
    console.log('❌ Weather Failed:', e.message);
    return false;
  }
}

// Test Anime
async function testAnime() {
  console.log('\n🎌 Testing Anime API (Jikan)...');
  try {
    const response = await axios.get('https://api.jikan.moe/v4/anime?q=naruto&limit=1', { timeout: 15000 });
    const anime = response.data?.data?.[0];
    console.log('✅ Anime Response:', anime?.title, '- Score:', anime?.score);
    return true;
  } catch (e) {
    console.log('❌ Anime Failed:', e.message);
    return false;
  }
}

// Test Waifu
async function testWaifu() {
  console.log('\n👧 Testing Waifu API...');
  try {
    const response = await axios.get('https://api.waifu.pics/sfw/waifu', { timeout: 10000 });
    console.log('✅ Waifu Response:', response.data?.url?.substring(0, 50) + '...');
    return true;
  } catch (e) {
    console.log('❌ Waifu Failed:', e.message);
    return false;
  }
}

// Test QR
async function testQR() {
  console.log('\n📱 Testing QR Code API...');
  try {
    const response = await axios.get('https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=test', { 
      timeout: 10000,
      responseType: 'arraybuffer'
    });
    console.log('✅ QR Response:', response.data.length, 'bytes');
    return true;
  } catch (e) {
    console.log('❌ QR Failed:', e.message);
    return false;
  }
}

// Test TTS
async function testTTS() {
  console.log('\n🔊 Testing TTS (Google)...');
  try {
    const response = await axios.get('https://translate.google.com/translate_tts?ie=UTF-8&q=halo&tl=id&client=tw-ob', {
      timeout: 10000,
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://translate.google.com/' }
    });
    console.log('✅ TTS Response:', response.data.length, 'bytes audio');
    return true;
  } catch (e) {
    console.log('❌ TTS Failed:', e.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 FINAL API TESTS\n');
  console.log('='.repeat(50));
  
  const results = [];
  
  results.push({ name: 'AI (GPT)', pass: await testAI() });
  results.push({ name: 'Wikipedia', pass: await testWiki() });
  results.push({ name: 'TikTok', pass: await testTikTok() });
  results.push({ name: 'Pinterest', pass: await testPinterest() });
  results.push({ name: 'Weather', pass: await testWeather() });
  results.push({ name: 'Anime', pass: await testAnime() });
  results.push({ name: 'Waifu', pass: await testWaifu() });
  results.push({ name: 'QR Code', pass: await testQR() });
  results.push({ name: 'TTS', pass: await testTTS() });
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 FINAL RESULTS:\n');
  
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  
  results.forEach(r => {
    console.log(`${r.pass ? '✅' : '❌'} ${r.name}`);
  });
  
  console.log(`\n📈 ${passed}/${results.length} APIs working (${Math.round(passed/results.length*100)}%)`);
  
  if (failed > 0) {
    console.log(`\n⚠️ ${failed} APIs may be temporarily down`);
  }
}

runAllTests().catch(console.error);
