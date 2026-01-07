/**
 * Test multiple AI API alternatives
 */

const axios = require('axios');

const AI_APIS = [
  {
    name: 'Churchless GPT',
    test: async () => {
      const res = await axios.post('https://free.churchless.tech/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }]
      }, { timeout: 15000, headers: { 'Content-Type': 'application/json' } });
      return res.data?.choices?.[0]?.message?.content;
    }
  },
  {
    name: 'Hercai',
    test: async () => {
      const res = await axios.get('https://hercai.onrender.com/v3/hercai?question=Hi', { timeout: 15000 });
      return res.data?.reply;
    }
  },
  {
    name: 'Siputzx GPT4o',
    test: async () => {
      const res = await axios.get('https://api.siputzx.my.id/api/ai/gpt4o?content=Hi', { timeout: 15000 });
      return res.data?.data || res.data?.result;
    }
  },
  {
    name: 'Siputzx Gemini',
    test: async () => {
      const res = await axios.get('https://api.siputzx.my.id/api/ai/gemini-pro?content=Hi', { timeout: 15000 });
      return res.data?.data || res.data?.result;
    }
  },
  {
    name: 'GPT4Free API',
    test: async () => {
      const res = await axios.post('https://api.gpt4free.io/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }]
      }, { timeout: 15000, headers: { 'Content-Type': 'application/json' } });
      return res.data?.choices?.[0]?.message?.content;
    }
  },
  {
    name: 'DeepAI Text',
    test: async () => {
      const res = await axios.post('https://api.deepai.org/api/text-generator', 
        'text=Hi how are you',
        { timeout: 15000, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return res.data?.output;
    }
  },
  {
    name: 'Blackbox AI',
    test: async () => {
      const res = await axios.post('https://www.blackbox.ai/api/chat', {
        messages: [{ role: 'user', content: 'Hi' }],
        model: 'gpt-4o-mini'
      }, { timeout: 15000, headers: { 'Content-Type': 'application/json' } });
      return res.data;
    }
  },
  {
    name: 'You.com API',
    test: async () => {
      const res = await axios.get('https://api.ydc-index.io/search?query=hello', { timeout: 15000 });
      return res.data?.hits?.[0]?.description;
    }
  }
];

async function testAllAPIs() {
  console.log('🤖 Testing AI API Alternatives...\n');
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
      console.log(`❌ FAILED: ${e.message}`);
      results.push({ name: api.name, success: false, error: e.message });
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 SUMMARY:\n');
  
  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log('✅ Working APIs:');
  working.forEach(r => console.log(`   - ${r.name}`));
  
  console.log('\n❌ Failed APIs:');
  failed.forEach(r => console.log(`   - ${r.name}: ${r.error}`));
  
  console.log(`\n📈 ${working.length}/${results.length} APIs working`);
}

testAllAPIs().catch(console.error);
