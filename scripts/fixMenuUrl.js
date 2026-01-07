const { Bot } = require('../models');

async function fix() {
  // Update settings - use waifu.pics URL that works
  await Bot.update({
    menuUrl: 'https://i.waifu.pics/tE7-FfJ.jpg',
    menuTitle: 'PAIMON BOT',
    menuBody: 'Follow ig owner dengan tap gambar',
    showAd: true,
    adUrl: 'https://instagram.com/alcateambot_',
    menuLarge: true
  }, { where: { id: 1 } });
  
  const bot = await Bot.findByPk(1);
  console.log('=== UPDATED MENU SETTINGS ===');
  console.log('menuUrl:', bot.menuUrl);
  console.log('menuTitle:', bot.menuTitle);
  console.log('menuBody:', bot.menuBody);
  console.log('showAd:', bot.showAd);
  console.log('adUrl:', bot.adUrl);
  console.log('menuLarge:', bot.menuLarge);
  
  process.exit(0);
}

fix();
