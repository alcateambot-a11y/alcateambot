/**
 * Delete Test Selfbot
 * Clean up test selfbot and user
 */

const { Bot, User } = require('../models');

async function deleteTestSelfbot() {
  console.log('='.repeat(60));
  console.log('DELETE TEST SELFBOT');
  console.log('='.repeat(60));
  
  try {
    // Find test user
    const testUser = await User.findOne({ where: { email: 'test_selfbot@test.com' } });
    
    if (!testUser) {
      console.log('\n⚠️  No test user found');
      return;
    }
    
    console.log('\n[1/2] Found test user:', testUser.id);
    
    // Find and delete test selfbot
    const testSelfbot = await Bot.findOne({
      where: { 
        userId: testUser.id,
        isSelfbot: true 
      }
    });
    
    if (testSelfbot) {
      console.log('[2/2] Deleting test selfbot:', testSelfbot.id);
      await testSelfbot.destroy();
      console.log('✅ Test selfbot deleted');
    } else {
      console.log('[2/2] No test selfbot found');
    }
    
    // Delete test user
    console.log('Deleting test user...');
    await testUser.destroy();
    console.log('✅ Test user deleted');
    
    console.log('\n' + '='.repeat(60));
    console.log('CLEANUP COMPLETE');
    console.log('='.repeat(60));
    
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    console.error(err.stack);
  }
  
  process.exit(0);
}

deleteTestSelfbot();
