/**
 * Set ppcouple as premium (for testing)
 */

const { Bot } = require('../models');

async function setPpcouplePremium() {
  console.log('=== SET PPCOUPLE PREMIUM ===\n');
  
  try {
    // Get bot
    const bot = await Bot.findByPk(2);
    if (!bot) {
      console.log('❌ Bot not found');
      return;
    }
    
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
    
    console.log('Before:');
    console.log('ppcouple settings:', JSON.stringify(commandSettings.ppcouple, null, 2));
    console.log('');
    
    // Set ppcouple as premium
    if (!commandSettings.ppcouple) {
      commandSettings.ppcouple = {};
    }
    
    commandSettings.ppcouple.premiumOnly = true;
    commandSettings.ppcouple.enabled = true;
    
    console.log('After:');
    console.log('ppcouple settings:', JSON.stringify(commandSettings.ppcouple, null, 2));
    console.log('');
    
    // Save to database
    await bot.update({
      commandSettings: JSON.stringify(commandSettings)
    });
    
    console.log('✅ Saved to database!');
    console.log('');
    console.log('Now ppcouple should appear in .premium command');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Run
setPpcouplePremium()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
