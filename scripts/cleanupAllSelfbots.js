/**
 * Cleanup All Selfbots
 * Remove all selfbot data and sessions
 */

const { Bot } = require('../models');
const fs = require('fs');
const path = require('path');

async function cleanupAll() {
  console.log('='.repeat(60));
  console.log('CLEANUP ALL SELFBOTS');
  console.log('='.repeat(60));
  
  try {
    // Find all selfbots
    const selfbots = await Bot.findAll({ where: { isSelfbot: true } });
    
    console.log(`\nFound ${selfbots.length} selfbot(s)`);
    
    for (const selfbot of selfbots) {
      console.log(`\nCleaning selfbot ID: ${selfbot.id}`);
      console.log(`  Phone: ${selfbot.phone}`);
      console.log(`  Status: ${selfbot.status}`);
      
      // Delete session folder
      const sessionPath = path.join(__dirname, '../sessions', `selfbot_${selfbot.id}`);
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true });
        console.log(`  ✅ Session folder deleted`);
      } else {
        console.log(`  ⚠️  No session folder`);
      }
      
      // Delete from database
      await selfbot.destroy();
      console.log(`  ✅ Database record deleted`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('CLEANUP COMPLETE');
    console.log('='.repeat(60));
    console.log(`\n✅ Cleaned ${selfbots.length} selfbot(s)`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  process.exit(0);
}

cleanupAll();
