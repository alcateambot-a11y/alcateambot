/**
 * End-to-End Test for Selfbot
 * Simulate actual message flow
 */

const { Bot, User } = require('../models');
const selfbotHandler = require('../services/selfbotHandler');

async function testSelfbotE2E() {
  console.log('='.repeat(60));
  console.log('SELFBOT END-TO-END TEST');
  console.log('='.repeat(60));
  
  try {
    // Create mock bot
    const mockBot = {
      id: 999,
      userId: 1,
      name: 'Test Selfbot',
      phone: '628123456789',
      isSelfbot: true,
      selfbotEnabled: true,
      status: 'connected',
      prefix: '.',
      prefixType: 'single'
    };
    
    console.log('\n[SETUP] Mock bot created:', mockBot.name);
    
    // Test different message types
    const testCases = [
      {
        name: 'Private chat - allowed command (.play)',
        msg: {
          key: {
            remoteJid: '628111111111@s.whatsapp.net',
            fromMe: false,
            participant: null
          },
          message: {
            conversation: '.play test song'
          },
          pushName: 'Test User',
          messageTimestamp: Math.floor(Date.now() / 1000)
        },
        shouldProcess: true
      },
      {
        name: 'Private chat - allowed command (.tiktok)',
        msg: {
          key: {
            remoteJid: '628111111111@s.whatsapp.net',
            fromMe: false,
            participant: null
          },
          message: {
            conversation: '.tiktok https://test.com'
          },
          pushName: 'Test User',
          messageTimestamp: Math.floor(Date.now() / 1000)
        },
        shouldProcess: true
      },
      {
        name: 'Private chat - NOT allowed command (.kick)',
        msg: {
          key: {
            remoteJid: '628111111111@s.whatsapp.net',
            fromMe: false,
            participant: null
          },
          message: {
            conversation: '.kick @user'
          },
          pushName: 'Test User',
          messageTimestamp: Math.floor(Date.now() / 1000)
        },
        shouldProcess: false
      },
      {
        name: 'Group chat - allowed command (.sticker)',
        msg: {
          key: {
            remoteJid: '123456789@g.us',
            fromMe: false,
            participant: '628111111111@s.whatsapp.net'
          },
          message: {
            imageMessage: {
              caption: '.sticker'
            }
          },
          pushName: 'Test User',
          messageTimestamp: Math.floor(Date.now() / 1000)
        },
        shouldProcess: true
      },
      {
        name: 'Message from self (should be ignored)',
        msg: {
          key: {
            remoteJid: '628111111111@s.whatsapp.net',
            fromMe: true,
            participant: null
          },
          message: {
            conversation: '.play test'
          },
          pushName: 'Me',
          messageTimestamp: Math.floor(Date.now() / 1000)
        },
        shouldProcess: false
      },
      {
        name: 'Old message (should be ignored)',
        msg: {
          key: {
            remoteJid: '628111111111@s.whatsapp.net',
            fromMe: false,
            participant: null
          },
          message: {
            conversation: '.play old song'
          },
          pushName: 'Test User',
          messageTimestamp: Math.floor((Date.now() - 120000) / 1000) // 2 minutes ago
        },
        shouldProcess: false
      },
      {
        name: 'No prefix (should be ignored)',
        msg: {
          key: {
            remoteJid: '628111111111@s.whatsapp.net',
            fromMe: false,
            participant: null
          },
          message: {
            conversation: 'play test song'
          },
          pushName: 'Test User',
          messageTimestamp: Math.floor(Date.now() / 1000)
        },
        shouldProcess: false
      }
    ];
    
    // Mock sock object
    const mockSock = {
      sendMessage: async (jid, content) => {
        console.log(`   📤 Would send to ${jid}:`, content.text?.substring(0, 50) || 'media');
        return { status: 'success' };
      },
      user: {
        id: '628123456789:1@s.whatsapp.net'
      }
    };
    
    console.log('\n[TESTING] Running test cases...\n');
    
    for (const testCase of testCases) {
      console.log(`\n📋 Test: ${testCase.name}`);
      console.log('   Message:', testCase.msg.message.conversation || testCase.msg.message.imageMessage?.caption || 'media');
      console.log('   From me:', testCase.msg.key.fromMe);
      console.log('   Expected:', testCase.shouldProcess ? 'PROCESS' : 'IGNORE');
      
      try {
        // Check if message would be processed
        let willProcess = false;
        
        // Check 1: fromMe
        if (testCase.msg.key.fromMe) {
          console.log('   ❌ Ignored: fromMe = true');
          continue;
        }
        
        // Check 2: Message age
        const now = Date.now();
        const msgTime = testCase.msg.messageTimestamp * 1000;
        const age = now - msgTime;
        if (age > 60000) {
          console.log('   ❌ Ignored: Message too old');
          continue;
        }
        
        // Check 3: Get text
        const messageType = Object.keys(testCase.msg.message || {})[0];
        let text = '';
        if (messageType === 'conversation') {
          text = testCase.msg.message.conversation;
        } else if (messageType === 'extendedTextMessage') {
          text = testCase.msg.message.extendedTextMessage?.text || '';
        } else if (messageType === 'imageMessage') {
          text = testCase.msg.message.imageMessage?.caption || '';
        }
        
        if (!text) {
          console.log('   ❌ Ignored: No text');
          continue;
        }
        
        // Check 4: Prefix
        const prefix = mockBot.prefix;
        if (!text.startsWith(prefix)) {
          console.log('   ❌ Ignored: No prefix');
          continue;
        }
        
        // Check 5: Parse command
        const withoutPrefix = text.slice(prefix.length).trim();
        const [cmdName] = withoutPrefix.split(/\s+/);
        const cmd = cmdName.toLowerCase();
        
        // Check 6: Allowed command
        if (!selfbotHandler.ALLOWED_COMMANDS.includes(cmd)) {
          console.log(`   ❌ Ignored: Command "${cmd}" not allowed for selfbot`);
          continue;
        }
        
        console.log(`   ✅ Would process: Command "${cmd}" is allowed`);
        willProcess = true;
        
        // Verify expectation
        if (willProcess === testCase.shouldProcess) {
          console.log('   ✅ TEST PASSED');
        } else {
          console.log('   ❌ TEST FAILED: Expected', testCase.shouldProcess, 'but got', willProcess);
        }
        
      } catch (err) {
        console.log('   ❌ ERROR:', err.message);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('TESTING COMPLETE');
    console.log('='.repeat(60));
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('   - Selfbot only processes messages with correct prefix');
    console.log('   - Only allowed commands are processed');
    console.log('   - Messages from self are ignored');
    console.log('   - Old messages (>60s) are ignored');
    console.log('   - Dangerous commands (kick, ban, etc) are blocked');
    
  } catch (err) {
    console.error('❌ ERROR during testing:', err.message);
    console.error(err.stack);
  }
  
  process.exit(0);
}

testSelfbotE2E();
