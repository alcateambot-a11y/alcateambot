const { Bot } = require('../models');

async function check() {
  const bot = await Bot.findByPk(1);
  if (!bot) {
    console.log('Bot not found');
    process.exit(1);
  }
  
  console.log('=== MENU SETTINGS ===');
  console.log('menuType:', bot.menuType);
  console.log('menuUrl:', bot.menuUrl);
  console.log('showAd:', bot.showAd);
  console.log('adUrl:', bot.adUrl);
  console.log('menuTitle:', bot.menuTitle);
  console.log('menuBody:', bot.menuBody);
  console.log('menuLarge:', bot.menuLarge);
  
  process.exit(0);
}

check();
