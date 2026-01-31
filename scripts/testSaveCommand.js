/**
 * Test Save Command - Simulate saving a command with premium flag
 */

const { Bot } = require('../models');

async function testSaveCommand() {
  console.log('=== TEST SAVE COMMAND ===\n');
  
  try {
    // Get bot
    const bot = await Bot.findByPk(2);
    if (!bot) {
      console.log('❌ Bot not found');
      return;
    }
    
    console.log('✅ Bot found:', bot.botName);
    console.log('');
    
    // Parse current commandSettings
    let commandSettings = {};
    try {
      commandSettings = JSON.parse(bot.commandSettings || '{}');
    } catch (e) {
      commandSettings = {};
    }
    
    console.log('Current commandSettings keys:', Object.keys(commandSettings).length);
    console.log('');
    
    // Simulate saving couple command with premium ON
    const testCommand = {
      name: 'couple',
      enabled: true,
      description: 'Random couple PP',
      example: '.couple',
      category: 'random',
      limit: 0,
      level: 0,
      cooldown: 5,
      groupOnly: false,
      privateOnly: false,
      premiumOnly: true,  // ← SET TO TRUE
      ownerOnly: false,
      adminOnly: false,
      sewaOnly: false
    };
    
    console.log('Saving command:', testCommand.name);
    console.log('Premium:', testCommand.premiumOnly);
    console.log('');
    
    // Update commandSettings
    if (!commandSettings[testCommand.name]) {
      commandSettings[testCommand.name] = {};
    }
    
    commandSettings[testCommand.name] = {
      ...commandSettings[testCommand.name],
      enabled: testCommand.enabled,
      description: testCommand.description || '',
      example: testCommand.example || '',
      category: testCommand.category || '',
      limit: testCommand.limit || 0,
      level: testCommand.level || 0,
      cooldown: testCommand.cooldown || 5,
      groupOnly: testCommand.groupOnly || false,
      privateOnly: testCommand.privateOnly || false,
      premiumOnly: testCommand.premiumOnly || false,
      ownerOnly: testCommand.ownerOnly || false,
      adminOnly: testCommand.adminOnly || false,
      sewaOnly: testCommand.sewaOnly || false
    };
    
    console.log('Updated settings for couple:', JSON.stringify(commandSettings.couple, null, 2));
    console.log('');
    
    // Save to database
    await bot.update({
      commandSettings: JSON.stringify(commandSettings)
    });
    
    console.log('✅ Saved to database!');
    console.log('');
    
    // Verify by reading back
    await bot.reload();
    const verifySettings = JSON.parse(bot.commandSettings || '{}');
    
    console.log('=== VERIFICATION ===');
    console.log('couple settings after reload:', JSON.stringify(verifySettings.couple, null, 2));
    console.log('Premium:', verifySettings.couple?.premiumOnly ? 'YES' : 'NO');
    
    if (verifySettings.couple?.premiumOnly === true) {
      console.log('');
      console.log('✅ SUCCESS! Data saved correctly!');
    } else {
      console.log('');
      console.log('❌ FAILED! Data not saved correctly!');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  }
}

// Run
testSaveCommand()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
