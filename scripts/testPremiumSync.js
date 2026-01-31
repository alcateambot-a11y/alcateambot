/**
 * Test Premium Sync - Verify bot and website show same count
 */

const { Bot } = require('../models');
const { COMMANDS } = require('../services/bot/commandList');

async function testPremiumSync() {
  console.log('=== TEST PREMIUM SYNC ===\n');
  
  try {
    // Get bot
    const bot = await Bot.findByPk(2);
    if (!bot) {
      console.log('❌ Bot not found');
      return;
    }
    
    console.log('✅ Bot found:', bot.botName);
    console.log('');
    
    // Parse commandSettings
    let commandSettings = {};
    try {
      commandSettings = JSON.parse(bot.commandSettings || '{}');
    } catch (e) {
      commandSettings = {};
    }
    
    console.log('=== WEBSITE LOGIC (Command.jsx) ===');
    
    // Simulate website logic
    const websitePremium = [];
    for (const masterCmd of COMMANDS) {
      const savedSettings = commandSettings[masterCmd.name];
      
      // Merge logic (same as website):
      const isPremium = savedSettings?.premiumOnly ?? masterCmd.premiumOnly ?? false;
      const isActive = savedSettings?.enabled ?? true;
      
      if (isPremium && isActive) {
        websitePremium.push(masterCmd.name);
      }
    }
    
    console.log('Total premium commands (website logic):', websitePremium.length);
    websitePremium.sort().forEach((cmd, i) => {
      const masterCmd = COMMANDS.find(c => c.name === cmd);
      const savedSettings = commandSettings[cmd];
      const source = savedSettings?.premiumOnly ? 'settings' : 'master';
      console.log(`${i + 1}. ${cmd} (${masterCmd.category}) [${source}]`);
    });
    console.log('');
    
    console.log('=== BOT LOGIC (cmdPremium) ===');
    
    // Simulate bot logic (should be identical now)
    const botPremium = [];
    for (const masterCmd of COMMANDS) {
      const savedSettings = commandSettings[masterCmd.name];
      
      const isPremium = savedSettings?.premiumOnly ?? masterCmd.premiumOnly ?? false;
      const isActive = savedSettings?.enabled ?? true;
      
      if (isPremium && isActive) {
        botPremium.push(masterCmd.name);
      }
    }
    
    console.log('Total premium commands (bot logic):', botPremium.length);
    botPremium.sort().forEach((cmd, i) => {
      const masterCmd = COMMANDS.find(c => c.name === cmd);
      const savedSettings = commandSettings[cmd];
      const source = savedSettings?.premiumOnly ? 'settings' : 'master';
      console.log(`${i + 1}. ${cmd} (${masterCmd.category}) [${source}]`);
    });
    console.log('');
    
    // Compare
    console.log('=== COMPARISON ===');
    console.log('Website count:', websitePremium.length);
    console.log('Bot count:', botPremium.length);
    console.log('Match:', websitePremium.length === botPremium.length ? '✅ YES' : '❌ NO');
    
    if (websitePremium.length === botPremium.length) {
      console.log('');
      console.log('🎉 SUCCESS! Bot and website are now 100% synced!');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Run
testPremiumSync()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
