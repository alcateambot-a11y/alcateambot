// Test script to simulate menu command
const { Bot } = require('../models');

async function test() {
  const bot = await Bot.findByPk(1);
  if (!bot) {
    console.log('Bot not found');
    process.exit(1);
  }
  
  console.log('=== TESTING THUMBNAIL MENU ===');
  console.log('menuType:', bot.menuType);
  console.log('menuUrl:', bot.menuUrl);
  console.log('showAd:', bot.showAd);
  console.log('adUrl:', bot.adUrl);
  console.log('menuTitle:', bot.menuTitle);
  console.log('menuBody:', bot.menuBody);
  console.log('menuLarge:', bot.menuLarge);
  
  // Simulate what the bot would send
  const clickUrl = (bot.showAd && bot.adUrl) ? bot.adUrl : bot.menuUrl;
  
  console.log('\n=== MESSAGE STRUCTURE ===');
  const messagePayload = {
    image: { url: bot.menuUrl },
    caption: '[MENU TEXT HERE]',
    contextInfo: {
      externalAdReply: {
        title: bot.menuTitle || bot.botName || 'Menu',
        body: bot.menuBody || 'Click to open',
        thumbnailUrl: bot.menuUrl,
        sourceUrl: clickUrl,
        mediaType: 1,
        renderLargerThumbnail: bot.menuLarge !== false,
        showAdAttribution: bot.showAd || false
      }
    }
  };
  
  console.log(JSON.stringify(messagePayload, null, 2));
  
  console.log('\n=== EXPECTED BEHAVIOR ===');
  console.log('1. Image will be shown from:', bot.menuUrl);
  console.log('2. Thumbnail will have title:', bot.menuTitle);
  console.log('3. Thumbnail will have body:', bot.menuBody);
  console.log('4. When clicked, will redirect to:', clickUrl);
  console.log('5. Show ad attribution:', bot.showAd);
  
  process.exit(0);
}

test();
