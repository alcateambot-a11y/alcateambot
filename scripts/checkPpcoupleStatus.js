/**
 * Check ppcouple premium status
 */

const { Bot } = require('../models');
const { COMMANDS } = require('../services/bot/commandList');

async function checkPpcoupleStatus() {
  console.log('=== CHECK PPCOUPLE STATUS ===\n');
  
  try {
    // Get bot
    const bot = await Bot.findByPk(2);
    if (!bot) {
      console.log('❌ Bot not found');
      return;
    }
    
    // Reload to ensure fresh data
    await bot.reload();
    
    console.log('✅ Bot found:', bot.botName);
    console.log('');
    
    // Parse commandSettings
    let commandSettings = {};
    try {
      commandSettings = JSON.parse(bot.commandSettings || '{}');
    } catch (e) {
      commandSettings = {};
    }
    
    console.log('Total commands in settings:', Object.keys(commandSettings).length);
    console.log('');
    
    // Check ppcouple in master list
    const masterCmd = COMMANDS.find(c => c.name === 'ppcouple' || (c.aliases && c.aliases.includes('ppcouple')));
    
    console.log('=== PPCOUPLE IN MASTER LIST ===');
    if (masterCmd) {
      console.log('✅ Found in master list');
      console.log('Name:', masterCmd.name);
      console.log('Category:', masterCmd.category);
      console.log('Premium in master:', masterCmd.premiumOnly ? 'YES' : 'NO');
    } else {
      console.log('❌ NOT found in master list');
    }
    console.log('');
    
    // Check ppcouple in commandSettings
    console.log('=== PPCOUPLE IN COMMANDSETTINGS ===');
    const savedSettings = commandSettings['ppcouple'] || commandSettings['couple'];
    
    if (savedSettings) {
      console.log('✅ Found in commandSettings');
      console.log('Settings:', JSON.stringify(savedSettings, null, 2));
      console.log('Premium in settings:', savedSettings.premiumOnly ? 'YES' : 'NO');
      console.log('Enabled:', savedSettings.enabled !== false ? 'YES' : 'NO');
    } else {
      console.log('❌ NOT found in commandSettings');
    }
    console.log('');
    
    // Check final result (merge logic)
    console.log('=== FINAL RESULT (MERGE LOGIC) ===');
    const isPremium = savedSettings?.premiumOnly ?? masterCmd?.premiumOnly ?? false;
    const isActive = savedSettings?.enabled ?? true;
    
    console.log('Is Premium:', isPremium ? '✅ YES' : '❌ NO');
    console.log('Is Active:', isActive ? '✅ YES' : '❌ NO');
    console.log('Will show in .premium:', (isPremium && isActive) ? '✅ YES' : '❌ NO');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Run
checkPpcoupleStatus()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
