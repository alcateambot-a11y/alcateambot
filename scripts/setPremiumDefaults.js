/**
 * Script untuk set default premium commands di database
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Bot } = require('../models');

// Commands yang harus premium by default
const PREMIUM_COMMANDS = [
  'ai', 'imagine',                    // AI
  'tiktok', 'instagram', 'play', 'pinterest',  // Downloader
  'ssweb',                            // Tools
  'tebakgambar',                      // Games
  'aesthetic', 'ppcouple'             // Random
];

async function setPremiumDefaults() {
  try {
    const bots = await Bot.findAll();
    console.log(`Found ${bots.length} bots`);
    
    for (const bot of bots) {
      let settings = {};
      try {
        settings = JSON.parse(bot.commandSettings || '{}');
      } catch (e) {
        settings = {};
      }
      
      // Set premiumOnly untuk commands yang ditentukan
      for (const cmd of PREMIUM_COMMANDS) {
        if (!settings[cmd]) {
          settings[cmd] = {};
        }
        settings[cmd].premiumOnly = true;
      }
      
      await bot.update({ commandSettings: JSON.stringify(settings) });
      console.log(`✅ Bot ${bot.id} (${bot.name}) - Premium defaults set for ${PREMIUM_COMMANDS.length} commands`);
    }
    
    console.log('\n✅ Done! Premium defaults have been set.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

setPremiumDefaults();
