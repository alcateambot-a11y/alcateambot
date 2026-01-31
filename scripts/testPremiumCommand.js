/**
 * Test Premium Command Output
 * Simulate what the bot will show when user types .premium
 */

const { Bot } = require('../models');
const { COMMANDS } = require('../services/bot/commandList');

async function testPremiumCommand() {
  console.log('=== TEST .PREMIUM COMMAND OUTPUT ===\n');
  
  try {
    // Get bot
    const bot = await Bot.findByPk(2);
    if (!bot) {
      console.log('❌ Bot not found');
      return;
    }
    
    // Parse commandSettings
    let commandSettings = {};
    try {
      commandSettings = JSON.parse(bot.commandSettings || '{}');
    } catch (e) {
      commandSettings = {};
    }
    
    // EXACT SAME LOGIC AS cmdPremium
    const premiumByCategory = {};
    
    for (const masterCmd of COMMANDS) {
      // Check saved settings by name OR aliases
      let savedSettings = commandSettings[masterCmd.name];
      
      // If not found by name, try aliases
      if (!savedSettings && masterCmd.aliases) {
        for (const alias of masterCmd.aliases) {
          if (commandSettings[alias]) {
            savedSettings = commandSettings[alias];
            console.log(`Found settings for "${masterCmd.name}" via alias "${alias}"`);
            break;
          }
        }
      }
      
      const isPremium = savedSettings?.premiumOnly ?? masterCmd.premiumOnly ?? false;
      const isActive = savedSettings?.enabled ?? true;
      
      if (isPremium && isActive) {
        const category = masterCmd.category || 'other';
        
        if (!premiumByCategory[category]) {
          premiumByCategory[category] = [];
        }
        
        premiumByCategory[category].push({
          name: masterCmd.name,
          description: savedSettings?.description || masterCmd.description || ''
        });
      }
    }
    
    // Count total
    let totalPremium = 0;
    for (const category in premiumByCategory) {
      totalPremium += premiumByCategory[category].length;
    }
    
    console.log('✅ Total premium commands:', totalPremium);
    console.log('');
    
    // Show by category
    const categoryOrder = ['ai', 'downloader', 'tools', 'games', 'fun', 'search', 'anime', 'maker', 'group', 'trading', 'other'];
    const sortedCategories = Object.keys(premiumByCategory).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.toLowerCase());
      const bIndex = categoryOrder.indexOf(b.toLowerCase());
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    
    for (const category of sortedCategories) {
      const cmds = premiumByCategory[category];
      console.log(`\n*• ✦ ${category.toUpperCase()} ✦ •*`);
      for (const cmd of cmds) {
        console.log(`┃ 👑 .${cmd.name}`);
      }
    }
    
    console.log('');
    console.log('=== SUMMARY ===');
    console.log('Total:', totalPremium, 'premium commands');
    console.log('Expected: 22 premium commands');
    console.log('Match:', totalPremium === 22 ? '✅ YES' : '❌ NO');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Run
testPremiumCommand()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
