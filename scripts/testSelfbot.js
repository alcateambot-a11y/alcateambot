/**
 * Test Selfbot Feature
 * Test semua aspek dari fitur selfbot
 */

const { Bot, User } = require('../models');
const { createSelfbotSession, getPairingCode, getSelfbotSession } = require('../services/selfbotConnection');
const selfbotHandler = require('../services/selfbotHandler');

async function testSelfbot() {
  console.log('='.repeat(60));
  console.log('TESTING SELFBOT FEATURE');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Check if selfbot command is loaded
    console.log('\n[TEST 1] Checking if selfbot command is loaded...');
    const commands = require('../services/bot/commands');
    
    if (commands.selfbot && typeof commands.selfbot === 'function') {
      console.log('✅ selfbot command loaded');
    } else {
      console.log('❌ selfbot command NOT loaded');
    }
    
    if (commands.sb && typeof commands.sb === 'function') {
      console.log('✅ sb alias loaded');
    } else {
      console.log('❌ sb alias NOT loaded');
    }
    
    // Test 2: Check selfbot handler
    console.log('\n[TEST 2] Checking selfbot handler...');
    if (typeof selfbotHandler.handleSelfbotMessage === 'function') {
      console.log('✅ handleSelfbotMessage function exists');
    } else {
      console.log('❌ handleSelfbotMessage function NOT found');
    }
    
    console.log('Allowed commands:', selfbotHandler.ALLOWED_COMMANDS.length);
    console.log('Sample commands:', selfbotHandler.ALLOWED_COMMANDS.slice(0, 10).join(', '));
    
    // Test 3: Check database schema
    console.log('\n[TEST 3] Checking database schema...');
    const testBot = await Bot.findOne({ where: { isSelfbot: true } });
    
    if (testBot) {
      console.log('✅ Found selfbot in database');
      console.log('   - ID:', testBot.id);
      console.log('   - Phone:', testBot.phone);
      console.log('   - Status:', testBot.status);
      console.log('   - isSelfbot:', testBot.isSelfbot);
      console.log('   - selfbotEnabled:', testBot.selfbotEnabled);
    } else {
      console.log('⚠️  No selfbot found in database (this is OK if none created yet)');
    }
    
    // Test 4: Check if Bot model has selfbot fields
    console.log('\n[TEST 4] Checking Bot model fields...');
    const botAttributes = Object.keys(Bot.rawAttributes);
    
    if (botAttributes.includes('isSelfbot')) {
      console.log('✅ isSelfbot field exists');
    } else {
      console.log('❌ isSelfbot field NOT found');
    }
    
    if (botAttributes.includes('selfbotEnabled')) {
      console.log('✅ selfbotEnabled field exists');
    } else {
      console.log('❌ selfbotEnabled field NOT found');
    }
    
    // Test 5: Check selfbotConnection functions
    console.log('\n[TEST 5] Checking selfbotConnection functions...');
    
    if (typeof createSelfbotSession === 'function') {
      console.log('✅ createSelfbotSession function exists');
    } else {
      console.log('❌ createSelfbotSession function NOT found');
    }
    
    if (typeof getPairingCode === 'function') {
      console.log('✅ getPairingCode function exists');
    } else {
      console.log('❌ getPairingCode function NOT found');
    }
    
    if (typeof getSelfbotSession === 'function') {
      console.log('✅ getSelfbotSession function exists');
    } else {
      console.log('❌ getSelfbotSession function NOT found');
    }
    
    // Test 6: Check command metadata
    console.log('\n[TEST 6] Checking command metadata...');
    const { CMD_META } = require('../services/bot/constants');
    
    if (CMD_META.selfbot) {
      console.log('✅ selfbot metadata exists');
      console.log('   Metadata:', CMD_META.selfbot);
    } else {
      console.log('⚠️  selfbot metadata not found (using default)');
    }
    
    if (CMD_META.sb) {
      console.log('✅ sb metadata exists');
      console.log('   Metadata:', CMD_META.sb);
    } else {
      console.log('⚠️  sb metadata not found (using default)');
    }
    
    // Test 7: Simulate command parsing
    console.log('\n[TEST 7] Simulating command parsing...');
    const testMessages = [
      '.sb',
      '.sb 628123456789',
      '.selfbot',
      '.selfbot 628123456789'
    ];
    
    for (const text of testMessages) {
      const prefix = '.';
      if (text.startsWith(prefix)) {
        const withoutPrefix = text.slice(prefix.length).trim();
        const [cmdName, ...args] = withoutPrefix.split(/\s+/);
        const cmd = cmdName.toLowerCase();
        
        if (commands[cmd]) {
          console.log(`✅ "${text}" -> command: ${cmd}, args: [${args.join(', ')}]`);
        } else {
          console.log(`❌ "${text}" -> command NOT found: ${cmd}`);
        }
      }
    }
    
    // Test 8: Check if selfbot messages are handled
    console.log('\n[TEST 8] Checking selfbot message handling...');
    
    // Create mock message
    const mockMsg = {
      key: {
        remoteJid: '628123456789@s.whatsapp.net',
        fromMe: false,
        participant: null
      },
      message: {
        conversation: '.play test'
      },
      pushName: 'Test User'
    };
    
    const mockBot = {
      id: 999,
      prefix: '.',
      selfbotEnabled: true
    };
    
    console.log('Mock message:', mockMsg.message.conversation);
    console.log('Mock bot prefix:', mockBot.prefix);
    
    // Test if message would be processed
    const text = mockMsg.message.conversation;
    const prefix = mockBot.prefix;
    
    if (text.startsWith(prefix)) {
      const withoutPrefix = text.slice(prefix.length).trim();
      const [cmdName] = withoutPrefix.split(/\s+/);
      const cmd = cmdName.toLowerCase();
      
      if (selfbotHandler.ALLOWED_COMMANDS.includes(cmd)) {
        console.log(`✅ Command "${cmd}" is allowed for selfbot`);
      } else {
        console.log(`❌ Command "${cmd}" is NOT allowed for selfbot`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('TESTING COMPLETE');
    console.log('='.repeat(60));
    
  } catch (err) {
    console.error('❌ ERROR during testing:', err.message);
    console.error(err.stack);
  }
  
  process.exit(0);
}

testSelfbot();
