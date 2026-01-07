// Test sending menu directly
const { Bot } = require('../models');
const axios = require('axios');

async function test() {
  const bot = await Bot.findByPk(1);
  if (!bot) {
    console.log('Bot not found');
    process.exit(1);
  }
  
  console.log('=== TESTING MENU SEND ===');
  console.log('menuUrl:', bot.menuUrl);
  
  try {
    // Test downloading image
    console.log('Downloading image...');
    const imageResponse = await axios.get(bot.menuUrl, { 
      responseType: 'arraybuffer',
      timeout: 10000 
    });
    const imageBuffer = Buffer.from(imageResponse.data);
    console.log('Image downloaded! Size:', imageBuffer.length, 'bytes');
    
    const clickUrl = (bot.showAd && bot.adUrl) ? bot.adUrl : 'https://wa.me';
    
    // Show what will be sent
    console.log('\n=== MESSAGE STRUCTURE ===');
    console.log({
      text: '[MENU TEXT]',
      contextInfo: {
        externalAdReply: {
          title: bot.menuTitle || bot.botName || '𝗠𝗘𝗡𝗨 𝗕𝗢𝗧',
          body: bot.menuBody || '⚡ Tap untuk info lebih lanjut',
          thumbnail: `<Buffer ${imageBuffer.length} bytes>`,
          sourceUrl: clickUrl,
          mediaType: 1,
          renderLargerThumbnail: bot.menuLarge !== false,
          showAdAttribution: bot.showAd || false
        }
      }
    });
    
    console.log('\n✅ Image download successful!');
    console.log('✅ Using thumbnail as Buffer (no URL will show)');
    console.log('✅ Click URL:', clickUrl);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  process.exit(0);
}

test();
