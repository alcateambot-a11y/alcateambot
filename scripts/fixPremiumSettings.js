/**
 * Fix Premium Settings
 * Remove incorrect premium flags from commandSettings
 * Only keep premium flags that match master list
 */

const { Bot } = require('../models');
const { COMMANDS } = require('../services/bot/commandList');

async function fixPremiumSettings() {
  console.log('=== FIX PREMIUM SETTINGS ===\n');
  
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
    
    console.log('Total commands in settings:', Object.keys(commandSettings).length);
    console.log('');
    
    // Find commands with incorrect premium flags
    const incorrectPremium = [];
    
    for (const [cmdName, settings] of Object.entries(commandSettings)) {
      if (settings.premiumOnly === true) {
        // Check if this command is premium in master list
        const masterCmd = COMMANDS.find(c => c.name === cmdName);
        
        if (!masterCmd) {
          console.log(`⚠️  Command "${cmdName}" not found in master list`);
          incorrectPremium.push(cmdName);
        } else if (!masterCmd.premiumOnly) {
          console.log(`⚠️  Command "${cmdName}" is NOT premium in master list`);
          incorrectPremium.push(cmdName);
        }
      }
    }
    
    console.log('');
    console.log('=== INCORRECT PREMIUM FLAGS ===');
    console.log('Total:', incorrectPremium.length);
    
    if (incorrectPremium.length === 0) {
      console.log('✅ No incorrect premium flags found!');
      return;
    }
    
    incorrectPremium.forEach((cmd, i) => {
      console.log(`${i + 1}. ${cmd}`);
    });
    
    console.log('');
    console.log('=== FIX ===');
    console.log('Removing incorrect premium flags...');
    
    // Remove incorrect premium flags
    for (const cmdName of incorrectPremium) {
      if (commandSettings[cmdName]) {
        delete commandSettings[cmdName].premiumOnly;
        console.log(`✅ Removed premium flag from: ${cmdName}`);
      }
    }
    
    // Save back to database
    await bot.update({
      commandSettings: JSON.stringify(commandSettings)
    });
    
    console.log('');
    console.log('✅ Settings updated in database!');
    console.log('');
    console.log('Now bot will show only 22 premium commands (from master list)');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Run
fixPremiumSettings()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
