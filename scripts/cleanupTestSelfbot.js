/**
 * Cleanup Test Selfbot Data
 */

const { Bot, User } = require('../models');

async function cleanup() {
  console.log('Cleaning up test selfbot data...');
  
  try {
    // Delete test selfbot
    const deleted = await Bot.destroy({
      where: { 
        phone: '628999888777',
        isSelfbot: true 
      }
    });
    
    if (deleted > 0) {
      console.log('✅ Test selfbot deleted');
    }
    
    // Delete test user
    const userDeleted = await User.destroy({
      where: { 
        email: 'test_selfbot_628999888777@temp.com'
      }
    });
    
    if (userDeleted > 0) {
      console.log('✅ Test user deleted');
    }
    
    console.log('✅ Cleanup complete');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  process.exit(0);
}

cleanup();
