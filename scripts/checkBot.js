const { Bot } = require('../models');

async function check() {
  const bots = await Bot.findAll();
  console.log('=== ALL BOTS ===');
  for (const bot of bots) {
    console.log({
      id: bot.id,
      userId: bot.userId,
      status: bot.status,
      hasMenuText: !!bot.menuText,
      menuTextLength: bot.menuText ? bot.menuText.length : 0,
      menuTextPreview: bot.menuText ? bot.menuText.substring(0, 100) : 'NULL'
    });
  }
  process.exit(0);
}

check();
