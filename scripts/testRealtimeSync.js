/**
 * Test Realtime Sync - Check if bot reads fresh data
 */

const { Bot } = require('../models');
const { COMMANDS } = require('../services/bot/commandList');

async function testRealtimeSync() {
  console.log('=== TEST REALTIME SYNC ===\n');
  
  try {
    console.log('Reading from database (attempt 1)...');
    let bot1 = await Bot.findByPk(2);
    await bot1.reload();
    let settings1 = JSON.parse(bot1.commandSettings || '{}');
    
    console.log('ppcouple premium:', settings1.ppcouple?.premiumOnly ? 'YES' : 'NO');
    console.log('');
    
    console.log('Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Reading from database (attempt 2)...');
    let bot2 = await Bot.findByPk(2, { 
      raw: false,
      nest: true,
      logging: console.log // Show SQL query
    });
    await bot2.reload();
    let settings2 = JSON.parse(bot2.commandSettings || '{}');
    
    console.log('ppcouple premium:', settings2.ppcouple?.premiumOnly ? 'YES' : 'NO');
    console.log('');
    
    // Count premium
    let count = 0;
    for (const masterCmd of COMMANDS) {
      let savedSettings = settings2[masterCmd.name];
      
      if (!savedSettings && masterCmd.aliases) {
        for (const alias of masterCmd.aliases) {
          if (settings2[alias]) {
            savedSettings = settings2[alias];
            break;
          }
        }
      }
      
      const isPremium = savedSettings?.premiumOnly ?? masterCmd.premiumOnly ?? false;
      const isActive = savedSettings?.enabled ?? true;
      
      if (isPremium && isActive) {
        count++;
      }
    }
    
    console.log('Total premium commands:', count);
    console.log('');
    console.log('If you changed ppcouple in dashboard, the count should reflect that change.');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Run
testRealtimeSync()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
