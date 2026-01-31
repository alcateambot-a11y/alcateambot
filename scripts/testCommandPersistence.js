/**
 * Test Command Persistence - Full E2E test
 * Tests: Save → Reload → Verify
 */

const { Bot } = require('../models');

async function testCommandPersistence() {
  console.log('=== TEST COMMAND PERSISTENCE ===\n');
  
  try {
    // Get bot
    const bot = await Bot.findByPk(2);
    if (!bot) {
      console.log('❌ Bot not found');
      return;
    }
    
    console.log('✅ Bot found:', bot.botName);
    console.log('Bot ID:', bot.id);
    console.log('');
    
    // Test 1: Save couple as premium
    console.log('TEST 1: Save couple as PREMIUM');
    console.log('─'.repeat(50));
    
    let commandSettings = JSON.parse(bot.commandSettings || '{}');
    
    commandSettings.couple = {
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
    
    await bot.update({ commandSettings: JSON.stringify(commandSettings) });
    console.log('✅ Saved couple as premium');
    
    // Reload and verify
    await bot.reload();
    let verify1 = JSON.parse(bot.commandSettings || '{}');
    console.log('Verification: couple.premiumOnly =', verify1.couple?.premiumOnly);
    
    if (verify1.couple?.premiumOnly === true) {
      console.log('✅ TEST 1 PASSED\n');
    } else {
      console.log('❌ TEST 1 FAILED\n');
      return;
    }
    
    // Test 2: Save couple as NON-premium
    console.log('TEST 2: Save couple as NON-PREMIUM');
    console.log('─'.repeat(50));
    
    commandSettings = JSON.parse(bot.commandSettings || '{}');
    
    commandSettings.couple = {
      ...commandSettings.couple,
      premiumOnly: false  // ← SET TO FALSE
    };
    
    await bot.update({ commandSettings: JSON.stringify(commandSettings) });
    console.log('✅ Saved couple as non-premium');
    
    // Reload and verify
    await bot.reload();
    let verify2 = JSON.parse(bot.commandSettings || '{}');
    console.log('Verification: couple.premiumOnly =', verify2.couple?.premiumOnly);
    
    if (verify2.couple?.premiumOnly === false) {
      console.log('✅ TEST 2 PASSED\n');
    } else {
      console.log('❌ TEST 2 FAILED\n');
      return;
    }
    
    // Test 3: Multiple commands
    console.log('TEST 3: Save multiple commands');
    console.log('─'.repeat(50));
    
    commandSettings = JSON.parse(bot.commandSettings || '{}');
    
    // Set ai to premium, couple to non-premium
    commandSettings.ai = {
      enabled: true,
      description: 'AI Chat',
      example: '.ai hello',
      category: 'ai',
      limit: 0,
      level: 0,
      cooldown: 5,
      groupOnly: false,
      privateOnly: false,
      premiumOnly: true,  // ← AI is premium
      ownerOnly: false,
      adminOnly: false,
      sewaOnly: false
    };
    
    commandSettings.couple = {
      ...commandSettings.couple,
      premiumOnly: false  // ← couple is NOT premium
    };
    
    await bot.update({ commandSettings: JSON.stringify(commandSettings) });
    console.log('✅ Saved ai=premium, couple=non-premium');
    
    // Reload and verify
    await bot.reload();
    let verify3 = JSON.parse(bot.commandSettings || '{}');
    console.log('Verification:');
    console.log('  ai.premiumOnly =', verify3.ai?.premiumOnly);
    console.log('  couple.premiumOnly =', verify3.couple?.premiumOnly);
    
    if (verify3.ai?.premiumOnly === true && verify3.couple?.premiumOnly === false) {
      console.log('✅ TEST 3 PASSED\n');
    } else {
      console.log('❌ TEST 3 FAILED\n');
      return;
    }
    
    // Test 4: Simulate website save (exact same logic as API)
    console.log('TEST 4: Simulate website save');
    console.log('─'.repeat(50));
    
    const commands = [
      { name: 'couple', premiumOnly: true, enabled: true },
      { name: 'ai', premiumOnly: false, enabled: true }
    ];
    
    commandSettings = JSON.parse(bot.commandSettings || '{}');
    
    for (const cmd of commands) {
      if (!commandSettings[cmd.name]) {
        commandSettings[cmd.name] = {};
      }
      
      commandSettings[cmd.name] = {
        enabled: cmd.enabled === true,
        description: commandSettings[cmd.name].description || '',
        example: commandSettings[cmd.name].example || '',
        category: commandSettings[cmd.name].category || '',
        limit: typeof cmd.limit === 'number' ? cmd.limit : 0,
        level: typeof cmd.level === 'number' ? cmd.level : 0,
        cooldown: typeof cmd.cooldown === 'number' ? cmd.cooldown : 5,
        groupOnly: cmd.groupOnly === true,
        privateOnly: cmd.privateOnly === true,
        premiumOnly: cmd.premiumOnly === true,  // ← EXPLICIT boolean check
        ownerOnly: cmd.ownerOnly === true,
        adminOnly: cmd.adminOnly === true,
        sewaOnly: cmd.sewaOnly === true
      };
    }
    
    await bot.update({ commandSettings: JSON.stringify(commandSettings) });
    console.log('✅ Saved using website logic');
    
    // Reload and verify
    await bot.reload();
    let verify4 = JSON.parse(bot.commandSettings || '{}');
    console.log('Verification:');
    console.log('  couple.premiumOnly =', verify4.couple?.premiumOnly, '(expected: true)');
    console.log('  ai.premiumOnly =', verify4.ai?.premiumOnly, '(expected: false)');
    
    if (verify4.couple?.premiumOnly === true && verify4.ai?.premiumOnly === false) {
      console.log('✅ TEST 4 PASSED\n');
    } else {
      console.log('❌ TEST 4 FAILED\n');
      return;
    }
    
    console.log('='.repeat(50));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(50));
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  }
}

// Run
testCommandPersistence()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
