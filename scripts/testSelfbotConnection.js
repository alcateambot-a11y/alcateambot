/**
 * Test Selfbot Connection
 * Test connection and pairing code generation
 */

const { createSelfbotSession, getPairingCode } = require('../services/selfbotConnection');
const { Bot, User } = require('../models');

async function testConnection() {
  console.log('='.repeat(60));
  console.log('TEST SELFBOT CONNECTION');
  console.log('='.repeat(60));
  
  const testPhone = '628111222333'; // Test phone
  
  try {
    console.log('\n[STEP 1] Create test user...');
    let user = await User.findOne({ 
      where: { email: `test_conn_${testPhone}@temp.com` } 
    });
    
    if (!user) {
      user = await User.create({
        name: 'Test Connection User',
        phone: testPhone,
        email: `test_conn_${testPhone}@temp.com`,
        password: `test_${Date.now()}`,
        plan: 'free'
      });
      console.log('   ✅ User created:', user.id);
    } else {
      console.log('   ✅ User exists:', user.id);
    }
    
    console.log('\n[STEP 2] Create test selfbot...');
    let selfbot = await Bot.findOne({
      where: { 
        phone: testPhone,
        isSelfbot: true 
      }
    });
    
    if (selfbot) {
      console.log('   ⚠️  Selfbot exists, deleting...');
      await selfbot.destroy();
    }
    
    selfbot = await Bot.create({
      userId: user.id,
      name: `Test Selfbot ${testPhone}`,
      phone: testPhone,
      isSelfbot: true,
      selfbotEnabled: false,
      status: 'connecting',
      prefix: '.',
      prefixType: 'single'
    });
    console.log('   ✅ Selfbot created:', selfbot.id);
    
    console.log('\n[STEP 3] Test connection creation...');
    console.log('   Creating session...');
    
    try {
      // This will attempt to create connection
      await createSelfbotSession(selfbot.id, user.id, testPhone);
      console.log('   ✅ Session creation started');
      
      console.log('\n[STEP 4] Wait for pairing code...');
      let attempts = 0;
      let pairingCode = null;
      
      while (attempts < 30 && !pairingCode) {
        await new Promise(resolve => setTimeout(resolve, 500));
        pairingCode = getPairingCode(selfbot.id);
        attempts++;
        
        if (attempts % 5 === 0) {
          console.log(`   Waiting... (${attempts * 0.5}s)`);
        }
      }
      
      if (pairingCode) {
        console.log('   ✅ Pairing code received:', pairingCode);
        console.log('\n' + '='.repeat(60));
        console.log('SUCCESS!');
        console.log('='.repeat(60));
        console.log('\n✅ Connection test PASSED');
        console.log('   Pairing code:', pairingCode);
      } else {
        console.log('   ❌ Pairing code NOT received');
        console.log('\n' + '='.repeat(60));
        console.log('FAILED');
        console.log('='.repeat(60));
        console.log('\n❌ Connection test FAILED');
        console.log('   Timeout waiting for pairing code');
      }
      
    } catch (sessionErr) {
      console.log('   ❌ Session creation error:', sessionErr.message);
      console.log('\n' + '='.repeat(60));
      console.log('ERROR');
      console.log('='.repeat(60));
      console.log('\n❌ Connection test FAILED');
      console.log('   Error:', sessionErr.message);
      
      if (sessionErr.message.includes('Connection Closed')) {
        console.log('\n💡 Diagnosis:');
        console.log('   - Socket not ready when requesting pairing code');
        console.log('   - Need to wait for connection to be established');
        console.log('   - Timing issue in connection setup');
      }
    }
    
    console.log('\n[CLEANUP] Removing test data...');
    await selfbot.destroy();
    await user.destroy();
    console.log('   ✅ Cleanup complete');
    
  } catch (err) {
    console.error('\n❌ TEST ERROR:', err.message);
    console.error(err.stack);
  }
  
  process.exit(0);
}

testConnection();
