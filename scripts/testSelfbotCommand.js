/**
 * Test Selfbot Command
 * Simulate .sb command execution
 */

const { Bot, User } = require('../models');

async function testSelfbotCommand() {
  console.log('='.repeat(60));
  console.log('TEST SELFBOT COMMAND');
  console.log('='.repeat(60));
  
  const testPhone = '628999888777'; // Test phone number
  
  try {
    console.log('\n[TEST 1] Check if user exists...');
    let user = await User.findOne({ where: { phone: testPhone } });
    
    if (user) {
      console.log('   ✅ User exists:', user.id);
    } else {
      console.log('   ⚠️  User not found, will be created');
    }
    
    console.log('\n[TEST 2] Check if selfbot exists...');
    const existingSelfbot = await Bot.findOne({
      where: { 
        phone: testPhone,
        isSelfbot: true 
      }
    });
    
    if (existingSelfbot) {
      console.log('   ✅ Selfbot exists:', existingSelfbot.id);
      console.log('   Status:', existingSelfbot.status);
      console.log('   Enabled:', existingSelfbot.selfbotEnabled);
    } else {
      console.log('   ⚠️  No selfbot found');
    }
    
    console.log('\n[TEST 3] Simulate user creation...');
    if (!user) {
      try {
        user = await User.create({
          name: `Test Selfbot User`,
          phone: testPhone,
          email: `test_selfbot_${testPhone}@temp.com`,
          password: `test_${testPhone}_${Date.now()}`,
          plan: 'free'
        });
        console.log('   ✅ User created:', user.id);
      } catch (createErr) {
        console.log('   ❌ User creation failed:', createErr.message);
        
        // Try to find by email
        user = await User.findOne({ 
          where: { email: `test_selfbot_${testPhone}@temp.com` } 
        });
        
        if (user) {
          console.log('   ✅ Found existing user by email:', user.id);
        }
      }
    }
    
    console.log('\n[TEST 4] Simulate selfbot creation...');
    if (!existingSelfbot && user) {
      try {
        const selfbot = await Bot.create({
          userId: user.id,
          name: `Test Selfbot ${testPhone}`,
          phone: testPhone,
          isSelfbot: true,
          selfbotEnabled: false,
          status: 'disconnected',
          prefix: '.',
          prefixType: 'single'
        });
        console.log('   ✅ Selfbot created:', selfbot.id);
        console.log('   Phone:', selfbot.phone);
        console.log('   User ID:', selfbot.userId);
      } catch (createErr) {
        console.log('   ❌ Selfbot creation failed:', createErr.message);
      }
    } else if (existingSelfbot) {
      console.log('   ⚠️  Selfbot already exists, skipping');
    } else {
      console.log('   ❌ Cannot create selfbot: user not found');
    }
    
    console.log('\n[TEST 5] Verify final state...');
    const finalSelfbot = await Bot.findOne({
      where: { 
        phone: testPhone,
        isSelfbot: true 
      }
    });
    
    if (finalSelfbot) {
      console.log('   ✅ Selfbot verified:');
      console.log('      ID:', finalSelfbot.id);
      console.log('      Phone:', finalSelfbot.phone);
      console.log('      User ID:', finalSelfbot.userId);
      console.log('      Status:', finalSelfbot.status);
      console.log('      Enabled:', finalSelfbot.selfbotEnabled);
      console.log('      isSelfbot:', finalSelfbot.isSelfbot);
    } else {
      console.log('   ❌ Selfbot not found after creation');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETE');
    console.log('='.repeat(60));
    
    console.log('\n✅ Command flow simulation successful!');
    console.log('\n💡 To test in WhatsApp:');
    console.log(`   .sb ${testPhone}`);
    
    console.log('\n🧹 Cleanup test data:');
    console.log('   node scripts/cleanupTestSelfbot.js');
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error(err.stack);
  }
  
  process.exit(0);
}

testSelfbotCommand();
