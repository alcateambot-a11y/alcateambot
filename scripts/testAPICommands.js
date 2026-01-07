/**
 * Test API-based Commands
 * Test commands that rely on external APIs
 */

const axios = require('axios');

async function testAPIs() {
  console.log('🌐 TESTING EXTERNAL APIs\n');
  console.log('='.repeat(50));
  
  const tests = [
    {
      name: 'TikTok API (tikwm)',
      test: async () => {
        const res = await axios.post('https://www.tikwm.com/api/', 'url=https://vt.tiktok.com/test', {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000
        });
        return res.status === 200;
      }
    },
    {
      name: 'Wikipedia API',
      test: async () => {
        const res = await axios.get('https://id.wikipedia.org/api/rest_v1/page/summary/Indonesia', { timeout: 10000 });
        return res.data?.title === 'Indonesia';
      }
    },
    {
      name: 'Weather API (Open-Meteo)',
      test: async () => {
        const res = await axios.get('https://geocoding-api.open-meteo.com/v1/search?name=Jakarta&count=1', { timeout: 10000 });
        return res.data?.results?.length > 0;
      }
    },
    {
      name: 'QR Code API',
      test: async () => {
        const res = await axios.get('https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=test', { 
          timeout: 10000,
          responseType: 'arraybuffer'
        });
        return res.status === 200 && res.data.length > 0;
      }
    },
    {
      name: 'Cat API',
      test: async () => {
        const res = await axios.get('https://api.thecatapi.com/v1/images/search', { timeout: 10000 });
        return res.data?.[0]?.url?.length > 0;
      }
    },
    {
      name: 'Dog API',
      test: async () => {
        const res = await axios.get('https://dog.ceo/api/breeds/image/random', { timeout: 10000 });
        return res.data?.message?.length > 0;
      }
    },
    {
      name: 'Waifu API',
      test: async () => {
        const res = await axios.get('https://api.waifu.pics/sfw/waifu', { timeout: 10000 });
        return res.data?.url?.length > 0;
      }
    },
    {
      name: 'Meme API',
      test: async () => {
        const res = await axios.get('https://meme-api.com/gimme', { timeout: 10000 });
        return res.data?.url?.length > 0;
      }
    },
    {
      name: 'Anime API (Jikan)',
      test: async () => {
        const res = await axios.get('https://api.jikan.moe/v4/anime?q=naruto&limit=1', { timeout: 15000 });
        return res.data?.data?.length > 0;
      }
    },
    {
      name: 'Currency API',
      test: async () => {
        const res = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', { timeout: 10000 });
        return res.data?.rates?.IDR > 0;
      }
    },
    {
      name: 'Google TTS',
      test: async () => {
        const res = await axios.get('https://translate.google.com/translate_tts?ie=UTF-8&q=test&tl=id&client=tw-ob', {
          timeout: 10000,
          responseType: 'arraybuffer',
          headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://translate.google.com/' }
        });
        return res.status === 200 && res.data.length > 0;
      }
    },
    {
      name: 'Siputzx API (Pinterest)',
      test: async () => {
        const res = await axios.get('https://api.siputzx.my.id/api/s/pinterest?query=anime', { timeout: 15000 });
        return res.data?.data?.length > 0;
      }
    },
    {
      name: 'Siputzx API (AI GPT)',
      test: async () => {
        const res = await axios.get('https://api.siputzx.my.id/api/ai/gpt4o?content=hi', { timeout: 30000 });
        return res.data?.data || res.data?.result;
      }
    },
    {
      name: 'Hercai API (AI)',
      test: async () => {
        const res = await axios.get('https://hercai.onrender.com/v3/hercai?question=hi', { timeout: 30000 });
        return res.data?.reply?.length > 0;
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const t of tests) {
    try {
      process.stdout.write(`Testing ${t.name}... `);
      const result = await t.test();
      if (result) {
        console.log('✅ OK');
        passed++;
      } else {
        console.log('❌ FAILED (bad response)');
        failed++;
      }
    } catch (err) {
      console.log(`❌ FAILED (${err.message})`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 API RESULTS: ${passed}/${tests.length} APIs working`);
  
  if (failed > 0) {
    console.log(`\n⚠️ ${failed} APIs are down/slow - some features may not work`);
    console.log('   This is normal - external APIs can be temporarily unavailable');
  }
}

testAPIs().catch(console.error);
