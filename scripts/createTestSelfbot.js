/**
 * Create Test Selfbot
 * Create a dummy selfbot for testing purposes
 */

const { Bot, User } = require('../models');

async function createTestSelfbot() {
  console.log('='.repeat(60));
  console.log('CREATE TEST SELFBOT');
  console.log('='.repeat(60));
  
  try {
    // Check if test user exists
    let testUser = await User.findOne({ where: { email: 'test_selfbot@test.com' } });
    
    if (!testUser) {
      console.log('\n[1/3] Creating test user...');
      testUser = await User.create({
        name: 'Test Selfbot User',
        email: 'test_selfbot@test.com',
        password: 'test123456', // Dummy password
        phone: '628999999999',
        plan: 'free'
      });
      console.log('✅ Test user created:', testUser.id);
    } else {
      console.log('\n[1/3] Test user already exists:', testUser.id);
    }
    
    // Check if test selfbot exists
    let testSelfbot = await Bot.findOne({
      where: { 
        userId: testUser.id,
        isSelfbot: true 
      }
    });
    
    if (testSelfbot) {
      console.log('\n[2/3] Test selfbot already exists:', testSelfbot.id);
      console.log('   Deleting old test selfbot...');
      await testSelfbot.destroy();
    }
    
    console.log('\n[2/3] Creating test selfbot...');
    testSelfbot = await Bot.create({
      userId: testUser.id,
      name: 'Test Selfbot',
      phone: '628888888888',
      isSelfbot: true,
      selfbotEnabled: true,
      status: 'disconnected',
      prefix: '.',
      prefixType: 'single'
    });
    console.log('✅ Test selfbot created:', testSelfbot.id);
    
    console.log('\n[3/3] Verifying...');
    const verified = await Bot.findByPk(testSelfbot.id);
    
    if (verified) {
      console.log('✅ Verification successful!');
      console.log('\n📋 Test Selfbot Details:');
      console.log('   ID:', verified.id);
      console.log('   Name:', verified.name);
      console.log('   Phone:', verified.phone);
      console.log('   User ID:', verified.userId);
      console.log('   isSelfbot:', verified.isSelfbot);
      console.log('   selfbotEnabled:', verified.selfbotEnabled);
      console.log('   Status:', verified.status);
      console.log('   Prefix:', verified.prefix);
    } else {
      console.log('❌ Verification failed!');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('TEST SELFBOT CREATED SUCCESSFULLY');
    console.log('='.repeat(60));
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Run: node scripts/debugSelfbot.js');
    console.log('   2. Check if test selfbot appears');
    console.log('   3. To delete: node scripts/deleteTestSelfbot.js');
    
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    console.error(err.stack);
  }
  
  process.exit(0);
}

createTestSelfbot();
