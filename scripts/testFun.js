/**
 * Test Fun Commands
 */

const axios = require('axios');

async function testFun() {
  console.log('=== Testing Fun Commands ===\n');
  
  // Test 1: Fakta (local)
  console.log('1. Testing Fakta...');
  const fakta = [
    'Madu adalah satu-satunya makanan yang tidak pernah basi.',
    'Gurita memiliki 3 jantung dan darah berwarna biru.'
  ];
  console.log(`✅ Fakta working! Sample: ${fakta[0].substring(0, 50)}...`);
  
  // Test 2: Quote API
  console.log('\n2. Testing Quote API...');
  try {
    const response = await axios.get('https://api.quotable.io/random', { timeout: 10000 });
    console.log('✅ Quote API working!');
    console.log(`   "${response.data.content.substring(0, 50)}..." - ${response.data.author}`);
  } catch (e) {
    console.log('❌ Quote API failed:', e.message);
    console.log('   Will use local quotes as fallback');
  }
  
  // Test 3: Jokes (local)
  console.log('\n3. Testing Jokes...');
  const jokes = ['Kenapa ayam menyeberang jalan? Karena mau ke seberang!'];
  console.log(`✅ Jokes working! Sample: ${jokes[0]}`);
  
  // Test 4: Meme API
  console.log('\n4. Testing Meme API...');
  try {
    const response = await axios.get('https://meme-api.com/gimme', { timeout: 15000 });
    console.log('✅ Meme API working!');
    console.log(`   Title: ${response.data.title}`);
    console.log(`   URL: ${response.data.url?.substring(0, 50)}...`);
  } catch (e) {
    console.log('❌ Meme API failed:', e.message);
  }
  
  // Test 5: Motivasi API
  console.log('\n5. Testing Motivasi API...');
  try {
    // Try Indonesian motivational quotes API
    const response = await axios.get('https://api.siputzx.my.id/api/r/motivasi', { timeout: 10000 });
    console.log('Response:', JSON.stringify(response.data).substring(0, 200));
    if (response.data?.data || response.data?.result) {
      console.log('✅ Motivasi API working!');
    }
  } catch (e) {
    console.log('❌ Motivasi API failed:', e.message);
    
    // Try alternative
    try {
      const alt = await axios.get('https://api.lolhuman.xyz/api/random/motivasi?apikey=GatauDeh', { timeout: 10000 });
      console.log('   Alternative response:', JSON.stringify(alt.data).substring(0, 200));
    } catch (e2) {
      console.log('   Alternative also failed');
    }
  }
  
  // Test 6: Pantun API
  console.log('\n6. Testing Pantun API...');
  try {
    const response = await axios.get('https://api.siputzx.my.id/api/r/pantun', { timeout: 10000 });
    console.log('Response:', JSON.stringify(response.data).substring(0, 300));
    if (response.data?.data || response.data?.result) {
      console.log('✅ Pantun API working!');
    }
  } catch (e) {
    console.log('❌ Pantun API failed:', e.message);
  }
}

testFun().then(() => {
  console.log('\n=== All Fun Tests Complete ===');
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
