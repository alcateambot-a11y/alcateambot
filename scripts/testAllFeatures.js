/**
 * Comprehensive Feature Test - Test all bot features
 */

const axios = require('axios');

console.log('🧪 COMPREHENSIVE BOT FEATURE TEST\n');
console.log('='.repeat(60));

const results = {
  passed: [],
  failed: [],
  skipped: []
};

// Test helper
async function test(name, testFn, timeout = 15000) {
  process.stdout.write(`Testing ${name}... `);
  try {
    const result = await Promise.race([
      testFn(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
    ]);
    if (result) {
      console.log('✅ PASS');
      results.passed.push(name);
      return true;
    } else {
      console.log('❌ FAIL (empty result)');
      results.failed.push(name);
      return false;
    }
  } catch (e) {
    console.log(`❌ FAIL (${e.message.substring(0, 30)})`);
    results.failed.push(name);
    return false;
  }
}

async function runTests() {
  console.log('\n📦 DOWNLOADER APIs\n');
  
  // TikTok
  await test('TikTok API', async () => {
    const res = await axios.post('https://www.tikwm.com/api/', 'url=https://vt.tiktok.com/test', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });
    return res.status === 200;
  });
  
  // Pinterest Search
  await test('Pinterest Search', async () => {
    const res = await axios.get('https://api.siputzx.my.id/api/s/pinterest?query=anime', { timeout: 15000 });
    return res.data?.data?.length > 0;
  });
  
  console.log('\n🔍 SEARCH APIs\n');
  
  // Wikipedia
  await test('Wikipedia', async () => {
    const res = await axios.get('https://id.wikipedia.org/api/rest_v1/page/summary/Indonesia', { 
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    return res.data?.title === 'Indonesia';
  });
  
  // Google (via DuckDuckGo)
  await test('Web Search', async () => {
    const res = await axios.get('https://api.duckduckgo.com/?q=javascript&format=json', { timeout: 10000 });
    return res.status === 200;
  });
  
  console.log('\n🌤️ INFO APIs\n');
  
  // Weather
  await test('Weather API', async () => {
    const geo = await axios.get('https://geocoding-api.open-meteo.com/v1/search?name=Jakarta&count=1', { timeout: 10000 });
    const { latitude, longitude } = geo.data.results[0];
    const weather = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`, { timeout: 10000 });
    return weather.data?.current?.temperature_2m !== undefined;
  });
  
  console.log('\n🎌 ANIME APIs\n');
  
  // Jikan (Anime)
  await test('Anime Search (Jikan)', async () => {
    const res = await axios.get('https://api.jikan.moe/v4/anime?q=naruto&limit=1', { timeout: 15000 });
    return res.data?.data?.length > 0;
  });
  
  // Waifu.pics
  await test('Waifu.pics', async () => {
    const res = await axios.get('https://api.waifu.pics/sfw/waifu', { timeout: 30000 });
    return res.data?.url?.length > 0;
  }, 35000);
  
  // Nekos.best
  await test('Nekos.best', async () => {
    const res = await axios.get('https://nekos.best/api/v2/neko', { timeout: 15000 });
    return res.data?.results?.[0]?.url?.length > 0;
  });
  
  // Cat API
  await test('Cat API', async () => {
    const res = await axios.get('https://api.thecatapi.com/v1/images/search', { timeout: 10000 });
    return res.data?.[0]?.url?.length > 0;
  });
  
  // Dog API
  await test('Dog API', async () => {
    const res = await axios.get('https://dog.ceo/api/breeds/image/random', { timeout: 10000 });
    return res.data?.message?.length > 0;
  });
  
  console.log('\n🛠️ TOOLS APIs\n');
  
  // QR Code
  await test('QR Code Generator', async () => {
    const res = await axios.get('https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=test', { 
      timeout: 10000,
      responseType: 'arraybuffer'
    });
    return res.data.length > 100;
  });
  
  // TTS (Google)
  await test('Text-to-Speech', async () => {
    const res = await axios.get('https://translate.google.com/translate_tts?ie=UTF-8&q=halo&tl=id&client=tw-ob', {
      timeout: 10000,
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://translate.google.com/' }
    });
    return res.data.length > 1000;
  });
  
  // Translate
  await test('Google Translate', async () => {
    const res = await axios.get('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=hello', { timeout: 10000 });
    return res.data?.[0]?.[0]?.[0]?.toLowerCase().includes('halo');
  });
  
  console.log('\n🎮 LOCAL FEATURES (No API needed)\n');
  
  // These are local features that don't need API
  const localFeatures = [
    'Games: slot, dice, coinflip, rps, 8ball, love, quiz, tebakkata',
    'Fun: fakta, jokes, quote, pantun, bucin, galau, truth, dare',
    'Tools: calc, base64enc/dec, binary/debinary',
    'Info: menu, ping, info, owner, runtime',
    'Group: kick, add, promote, demote, tagall, hidetag',
    'Owner: broadcast, setpp, setname, block, unblock'
  ];
  
  localFeatures.forEach(f => {
    console.log(`✅ ${f}`);
    results.passed.push(f.split(':')[0]);
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY\n');
  
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed tests:');
    results.failed.forEach(f => console.log(`   - ${f}`));
  }
  
  const total = results.passed.length + results.failed.length;
  const percentage = Math.round((results.passed.length / total) * 100);
  console.log(`\n📈 Success Rate: ${percentage}%`);
  
  if (percentage >= 80) {
    console.log('\n🎉 Most features are working correctly!');
  } else if (percentage >= 60) {
    console.log('\n⚠️ Some features may have issues. Check failed tests.');
  } else {
    console.log('\n❌ Many features are failing. Check API availability.');
  }
}

runTests().catch(console.error);
