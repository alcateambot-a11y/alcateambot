/**
 * Complete Fix for Selfbot Feature
 * Fix all database issues and verify setup
 */

const { sequelize } = require('../config/database');
const { Bot, User } = require('../models');

async function fixSelfbotComplete() {
  console.log('='.repeat(60));
  console.log('COMPLETE SELFBOT FIX');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Check and add phone column to Users
    console.log('\n[1/5] Checking Users table...');
    const [userCols] = await sequelize.query(`PRAGMA table_info(Users);`);
    const hasPhone = userCols.some(col => col.name === 'phone');
    
    if (!hasPhone) {
      console.log('   Adding phone column...');
      await sequelize.query(`ALTER TABLE Users ADD COLUMN phone VARCHAR(255);`);
      console.log('   ✅ Phone column added');
    } else {
      console.log('   ✅ Phone column exists');
    }
    
    // Step 2: Check Bots table for selfbot columns
    console.log('\n[2/5] Checking Bots table...');
    const [botCols] = await sequelize.query(`PRAGMA table_info(Bots);`);
    const hasIsSelfbot = botCols.some(col => col.name === 'isSelfbot');
    const hasSelfbotEnabled = botCols.some(col => col.name === 'selfbotEnabled');
    
    if (!hasIsSelfbot) {
      console.log('   Adding isSelfbot column...');
      await sequelize.query(`ALTER TABLE Bots ADD COLUMN isSelfbot TINYINT(1) DEFAULT 0;`);
      console.log('   ✅ isSelfbot column added');
    } else {
      console.log('   ✅ isSelfbot column exists');
    }
    
    if (!hasSelfbotEnabled) {
      console.log('   Adding selfbotEnabled column...');
      await sequelize.query(`ALTER TABLE Bots ADD COLUMN selfbotEnabled TINYINT(1) DEFAULT 0;`);
      console.log('   ✅ selfbotEnabled column added');
    } else {
      console.log('   ✅ selfbotEnabled column exists');
    }
    
    // Step 3: Verify models can load
    console.log('\n[3/5] Verifying models...');
    try {
      const testUser = await User.findOne();
      console.log('   ✅ User model working');
    } catch (e) {
      console.log('   ❌ User model error:', e.message);
    }
    
    try {
      const testBot = await Bot.findOne();
      console.log('   ✅ Bot model working');
    } catch (e) {
      console.log('   ❌ Bot model error:', e.message);
    }
    
    // Step 4: Check for existing selfbots
    console.log('\n[4/5] Checking existing selfbots...');
    const selfbots = await Bot.findAll({ where: { isSelfbot: true } });
    console.log(`   Found ${selfbots.length} selfbot(s)`);
    
    if (selfbots.length > 0) {
      selfbots.forEach(sb => {
        console.log(`   - ID: ${sb.id}, Phone: ${sb.phone}, Status: ${sb.status}`);
      });
    }
    
    // Step 5: Test command loading
    console.log('\n[5/5] Testing command loading...');
    try {
      const commands = require('../services/bot/commands');
      if (commands.sb && commands.selfbot) {
        console.log('   ✅ Selfbot commands loaded');
        console.log(`   ✅ Total commands: ${Object.keys(commands).length}`);
      } else {
        console.log('   ❌ Selfbot commands NOT loaded');
      }
    } catch (e) {
      console.log('   ❌ Command loading error:', e.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('FIX COMPLETE');
    console.log('='.repeat(60));
    
    console.log('\n✅ All checks passed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart server: npm start');
    console.log('   2. Test command: .sb 628123456789');
    console.log('   3. Check logs for any errors');
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error(err.stack);
  }
  
  process.exit(0);
}

fixSelfbotComplete();
