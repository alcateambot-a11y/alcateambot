/**
 * Test more AI API alternatives
 */

const axios = require('axios');

const AI_APIS = [
  {
    name: 'OpenRouter Free',
    test: async () => {
      const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [{ role: 'user', content: 'Hi' }]
      }, { timeout: 20000, headers: { 'Content-Type': 'application/json' } });
      return res.data?.choices?.[0]?.message?.content;
    }
  },
  {
    name: 'Groq Free',
    test: async () => {
      const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: 'Hi' }]
      }, { timeout: 20000, headers: { 'Content-Type': 'application/json' } });
      return res.data?.choices?.[0]?.message?.content;
    }
  },
  {
    name: 'Pawan.krd API',
    test: async () => {
      const res = await axios.post('https://api.pawan.krd/v1/chat/completions', {
        model: 'pai-001',
        messages: [{ role: 'user', content: 'Hi' }]
      }, { timeout: 20000, headers: { 'Content-Type': 'application/json' } });
      return res.data?.choices?.[0]?.message?.content;
    }
  },
  {
    name: 'Naga AI',
    test: async () => {
      const res = await axios.post('https://api.naga.ac/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }]
      }, { timeout: 20000, headers: { 'Content-Type': 'application/json' } });
      return res.data?.choices?.[0]?.message?.content;
    }
  },
  {
    name: 'Zuki API',
    test: async () => {
      const res = await axios.post('https://zukijourney.xyzbot.net/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }]
      }, { timeout: 20000, headers: { 'Content-Type': 'application/json' } });
      return res.data?.choices?.[0]?.message?.content;
    }
  },
  {
    name: 'Skailar API',
    test: async () => {
      const res = await axios.post('https://api.skailar.net/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }]
      }, { timeout: 20000, headers: { 'Content-Type': 'application/json' } });
      return res.data?.choices?.[0]?.message?.content;
    }
  },
  {
    name: 'Aryahcr API',
    test: async () => {
      const res = await axios.get('https://api.aryahcr.cc/api/chatgpt?text=Hi', { timeout: 15000 });
      return res.data?.result || res.data?.data;
    }
  },
  {
    name: 'Ryzendesu API',
    test: async () => {
      const res = await axios.get('https://api.ryzendesu.vip/api/ai/chatgpt?text=Hi', { timeout: 15000 });
      return res.data?.result || res.data?.data;
    }
  },
  {
    name: 'Lolhuman API',
    test: async () => {
      const res = await axios.get('https://api.lolhuman.xyz/api/openai?apikey=free&text=Hi', { timeout: 15000 });
      return res.data?.result;
    }
  },
  {
    name: 'Neoxr API',
    test: async () => {
      const res = await axios.get('https://api.neoxr.eu/api/openai?q=Hi', { timeout: 15000 });
      return res.data?.data?.response;
    }
  }
];

async function testAllAPIs() {
  console.log('🤖 Testing More AI API Alternatives...\n');
  console.log('='.repeat(50));
  
  const results = [];
  
  for (const api of AI_APIS) {
    console.log(`\n🔍 Testing ${api.name}...`);
    try {
      const result = await api.test();
      if (result && String(result).length > 0) {
        console.log(`✅ SUCCESS: ${String(result).substring(0, 80)}...`);
        results.push({ name: api.name, success: true, response: result });
      } else {
        console.log(`❌ FAILED: Empty response`);
        results.push({ name: api.name, success: false, error: 'Empty response' });
      }
    } catch (e) {
      const errMsg = e.response?.data?.error?.message || e.message;
      console.log(`❌ FAILED: ${errMsg.substring(0, 60)}`);
      results.push({ name: api.name, success: false, error: errMsg });
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 SUMMARY:\n');
  
  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (working.length > 0) {
    console.log('✅ Working APIs:');
    working.forEach(r => console.log(`   - ${r.name}`));
  }
  
  console.log('\n❌ Failed APIs:');
  failed.forEach(r => console.log(`   - ${r.name}`));
  
  console.log(`\n📈 ${working.length}/${results.length} APIs working`);
}

testAllAPIs().catch(console.error);
