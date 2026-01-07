/**
 * Test AI with updated Churchless API
 */

const axios = require('axios');

async function testChurchlessAI() {
  console.log('🤖 Testing Churchless AI API...\n');
  
  const queries = [
    'Halo, siapa kamu?',
    'Apa itu JavaScript?',
    'Berikan 3 tips coding'
  ];
  
  for (const query of queries) {
    console.log(`📝 Query: "${query}"`);
    try {
      const response = await axios.post('https://free.churchless.tech/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: query }]
      }, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = response.data?.choices?.[0]?.message?.content;
      if (result) {
        console.log(`✅ Response: ${result.substring(0, 150)}...`);
      } else {
        console.log('❌ No response content');
      }
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
    }
    console.log('');
  }
}

async function testWaifuWithTimeout() {
  console.log('👧 Testing Waifu API with 30s timeout...');
  try {
    const response = await axios.get('https://api.waifu.pics/sfw/waifu', { timeout: 30000 });
    console.log('✅ Waifu URL:', response.data?.url?.substring(0, 60) + '...');
  } catch (e) {
    console.log('❌ Waifu Failed:', e.message);
    console.log('   Fallback: Will use Pinterest search');
  }
}

async function testNekosBest() {
  console.log('\n🐱 Testing Nekos.best API...');
  try {
    const response = await axios.get('https://nekos.best/api/v2/neko', { timeout: 15000 });
    console.log('✅ Neko URL:', response.data?.results?.[0]?.url?.substring(0, 60) + '...');
  } catch (e) {
    console.log('❌ Nekos Failed:', e.message);
  }
}

async function runTests() {
  await testChurchlessAI();
  await testWaifuWithTimeout();
  await testNekosBest();
  
  console.log('\n✅ Tests completed!');
}

runTests().catch(console.error);
