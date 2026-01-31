/**
 * Debug Premium Sync
 * Compare premium commands between website and bot
 */

const { Bot } = require('../models');
const { COMMANDS } = require('../services/bot/commandList');

async function debugPremiumSync() {
  console.log('=== DEBUG PREMIUM SYNC ===\n');
  
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
    
    // Find premium commands in commandSettings
    const premiumInSettings = [];
    for (const [cmdName, settings] of Object.entries(commandSettings)) {
      if (settings.premiumOnly === true && settings.enabled !== false) {
        premiumInSettings.push(cmdName);
      }
    }
    
    console.log('=== PREMIUM IN COMMANDSETTINGS (BOT) ===');
    console.log('Total:', premiumInSettings.length);
    premiumInSettings.sort().forEach((cmd, i) => {
      console.log(`${i + 1}. ${cmd}`);
    });
    console.log('');
    
    // Find premium commands in master COMMANDS list
    const premiumInMaster = [];
    for (const cmd of COMMANDS) {
      if (cmd.premiumOnly) {
        premiumInMaster.push(cmd.name);
      }
    }
    
    console.log('=== PREMIUM IN MASTER LIST (CODE) ===');
    console.log('Total:', premiumInMaster.length);
    premiumInMaster.sort().forEach((cmd, i) => {
      console.log(`${i + 1}. ${cmd}`);
    });
    console.log('');
    
    // Find commands in master but not in settings
    const missingInSettings = premiumInMaster.filter(cmd => !premiumInSettings.includes(cmd));
    
    if (missingInSettings.length > 0) {
      console.log('=== MISSING IN COMMANDSETTINGS ===');
      console.log('Total:', missingInSettings.length);
      console.log('These commands are premium in master list but not in commandSettings:');
      missingInSettings.forEach((cmd, i) => {
        console.log(`${i + 1}. ${cmd}`);
      });
      console.log('');
    }
    
    // Find commands in settings but not in master
    const extraInSettings = premiumInSettings.filter(cmd => !premiumInMaster.includes(cmd));
    
    if (extraInSettings.length > 0) {
      console.log('=== EXTRA IN COMMANDSETTINGS ===');
      console.log('Total:', extraInSettings.length);
      console.log('These commands are premium in commandSettings but not in master list:');
      extraInSettings.forEach((cmd, i) => {
        console.log(`${i + 1}. ${cmd}`);
      });
      console.log('');
    }
    
    // Check website display
    console.log('=== WEBSITE DISPLAY ===');
    console.log('Website shows: 22 premium commands');
    console.log('Bot shows:', premiumInSettings.length, 'premium commands');
    console.log('Difference:', 22 - premiumInSettings.length);
    console.log('');
    
    if (missingInSettings.length > 0) {
      console.log('=== SOLUTION ===');
      console.log('Website might be showing commands from master list (hardcoded)');
      console.log('But bot only shows commands from commandSettings (database)');
      console.log('');
      console.log('To sync:');
      console.log('1. Website should ONLY show commands from commandSettings');
      console.log('2. Or bot should show commands from BOTH sources');
      console.log('');
      console.log('Recommended: Update website to match bot (commandSettings only)');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Run
debugPremiumSync()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
