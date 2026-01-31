/**
 * Toggle ppcouple premium OFF (for testing)
 */

const { Bot } = require('../models');

async function togglePpcouplePremium() {
  console.log('=== TOGGLE PPCOUPLE PREMIUM OFF ===\n');
  
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
    
    // Toggle ppcouple premium OFF
    if (commandSettings.ppcouple) {
      // Remove premiumOnly flag or set to false
      delete commandSettings.ppcouple.premiumOnly;
      // Or: commandSettings.ppcouple.premiumOnly = false;
    }
    
    console.log('After:');
    console.log('ppcouple settings:', JSON.stringify(commandSettings.ppcouple, null, 2));
    console.log('');
    
    // Save to database
    await bot.update({
      commandSettings: JSON.stringify(commandSettings)
    });
    
    console.log('✅ Saved to database!');
    console.log('');
    console.log('Now ppcouple should NOT appear in .premium command');
    console.log('Dashboard should show 22 premium commands');
    console.log('Bot should also show 22 premium commands');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Run
togglePpcouplePremium()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
