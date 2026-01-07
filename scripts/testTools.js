/**
 * Test Tools Commands
 */

const axios = require('axios');

async function testTools() {
  console.log('=== Testing Tools Commands ===\n');
  
  // Test 1: QR Code
  console.log('1. Testing QR Code...');
  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('https://google.com')}`;
    const response = await axios.head(qrUrl, { timeout: 10000 });
    console.log('✅ QR Code API working! Content-Type:', response.headers['content-type']);
  } catch (e) {
    console.log('❌ QR Code failed:', e.message);
  }
  
  // Test 2: Calculator (local, no API needed)
  console.log('\n2. Testing Calculator...');
  try {
    const expression = '2+2*3';
    const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
    const result = Function('"use strict"; return (' + sanitized + ')')();
    console.log('✅ Calculator working! 2+2*3 =', result);
  } catch (e) {
    console.log('❌ Calculator failed:', e.message);
  }
  
  // Test 3: TTS (Text to Speech)
  console.log('\n3. Testing TTS...');
  try {
    const text = 'Halo dunia';
    const lang = 'id';
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    
    const response = await axios.get(ttsUrl, {
      timeout: 10000,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://translate.google.com/'
      }
    });
    console.log('✅ TTS working! Size:', response.data.length, 'bytes');
  } catch (e) {
    console.log('❌ TTS failed:', e.message);
    
    // Try alternative
    console.log('   Trying alternative TTS API...');
    try {
      const text = 'Hello world';
      const altUrl = `https://api.voicerss.org/?key=demo&hl=en-us&src=${encodeURIComponent(text)}`;
      const response = await axios.head(altUrl, { timeout: 10000 });
      console.log('   ✅ Alternative TTS available');
    } catch (e2) {
      console.log('   ❌ Alternative also failed:', e2.message);
    }
  }
  
  // Test 4: Short URL
  console.log('\n4. Testing Short URL...');
  try {
    const longUrl = 'https://www.google.com/search?q=test+query+very+long+url';
    
    // Try tinyurl
    const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`, {
      timeout: 10000
    });
    console.log('✅ Short URL working! Result:', response.data);
  } catch (e) {
    console.log('❌ Short URL failed:', e.message);
  }
  
  // Test 5: Screenshot Website
  console.log('\n5. Testing Screenshot Website...');
  try {
    const url = 'https://google.com';
    
    // Try different screenshot APIs
    const apis = [
      `https://api.apiflash.com/v1/urltoimage?access_key=demo&url=${encodeURIComponent(url)}`,
      `https://shot.screenshotapi.net/screenshot?token=demo&url=${encodeURIComponent(url)}`,
      `https://image.thum.io/get/width/1280/crop/720/${url}`
    ];
    
    let working = false;
    for (const apiUrl of apis) {
      try {
        const response = await axios.head(apiUrl, { timeout: 10000 });
        if (response.status === 200) {
          console.log('✅ Screenshot API working:', apiUrl.split('?')[0]);
          working = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!working) {
      console.log('❌ All screenshot APIs failed');
    }
  } catch (e) {
    console.log('❌ Screenshot failed:', e.message);
  }
}

testTools().then(() => {
  console.log('\n=== Test Complete ===');
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
