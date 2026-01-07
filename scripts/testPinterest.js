/**
 * Test Pinterest Search & Download
 */

const axios = require('axios');

async function testPinterest() {
  console.log('=== Testing Pinterest ===\n');
  
  // Test 1: Search
  const query = 'anime wallpaper';
  console.log('1. Testing search:', query);
  
  let images = [];
  
  // API 1: siputzx
  try {
    const response = await axios.get(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(query)}`, { 
      timeout: 15000 
    });
    console.log('API 1 response:', JSON.stringify(response.data).substring(0, 500));
    
    if (response.data?.data && Array.isArray(response.data.data)) {
      images = response.data.data
        .map(item => item.image_url || item.images_url || item.image || item.url || item)
        .filter(url => typeof url === 'string' && url.startsWith('http'));
      console.log('✅ API 1 found', images.length, 'images');
      if (images.length > 0) {
        console.log('First image:', images[0]);
      }
    }
  } catch (e) {
    console.log('❌ API 1 failed:', e.message);
  }
  
  // Test download if we have images
  if (images.length > 0) {
    console.log('\n2. Testing download...');
    try {
      const testImg = images[0];
      const response = await axios.get(testImg, { 
        timeout: 10000,
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.pinterest.com/'
        }
      });
      console.log('✅ Download test passed!');
      console.log('Size:', response.data.length, 'bytes');
    } catch (e) {
      console.log('❌ Download test failed:', e.message);
    }
  }
  
  // Test 2: Download from URL
  console.log('\n\n3. Testing URL download...');
  
  try {
    const pinUrl = 'https://id.pinterest.com/pin/1055601206490570270/';
    console.log('Testing URL:', pinUrl);
    
    const response = await axios.get(pinUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      maxRedirects: 5
    });
    
    const html = response.data;
    
    // Try to find image URL
    const patterns = [
      /property="og:image"\s*content="([^"]+)"/i,
      /content="([^"]+)"\s*property="og:image"/i,
      /"image_url"\s*:\s*"([^"]+)"/,
      /"url"\s*:\s*"(https:\/\/i\.pinimg\.com\/[^"]+)"/,
      /src="(https:\/\/i\.pinimg\.com\/originals\/[^"]+)"/,
      /src="(https:\/\/i\.pinimg\.com\/736x\/[^"]+)"/,
      /(https:\/\/i\.pinimg\.com\/originals\/[^"'\s]+)/
    ];
    
    let imageUrl = null;
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        imageUrl = match[1].replace(/\\u002F/g, '/').replace(/&amp;/g, '&');
        console.log('Pattern matched:', pattern.toString().substring(0, 50));
        break;
      }
    }
    
    if (imageUrl) {
      console.log('✅ Found image URL:', imageUrl.substring(0, 100));
      
      // Test download
      const imgResponse = await axios.get(imageUrl, {
        timeout: 10000,
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      console.log('✅ Image downloaded! Size:', imgResponse.data.length, 'bytes');
    } else {
      console.log('❌ No image URL found');
      // Show some HTML for debugging
      console.log('HTML sample:', html.substring(0, 500));
    }
  } catch (e) {
    console.log('URL test error:', e.message);
  }
}

testPinterest().then(() => {
  console.log('\n=== Test Complete ===');
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
