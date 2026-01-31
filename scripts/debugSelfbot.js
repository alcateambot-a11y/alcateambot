/**
 * Debug Selfbot Issues
 * Script untuk debugging masalah selfbot
 */

const { Bot, User } = require('../models');
const { getSelfbotSession } = require('../services/selfbotConnection');

async function debugSelfbot() {
  console.log('='.repeat(60));
  console.log('SELFBOT DEBUGGER');
  console.log('='.repeat(60));
  
  try {
    // Find all selfbots
    const selfbots = await Bot.findAll({
      where: { isSelfbot: true },
      include: [{ model: User }]
    });
    
    if (selfbots.length === 0) {
      console.log('\n⚠️  No selfbots found in database');
      console.log('\nTo create a selfbot:');
      console.log('1. Chat to your bot: .sb 628123456789');
      console.log('2. Follow the pairing code instructions');
      return;
    }
    
    console.log(`\n📱 Found ${selfbots.length} selfbot(s):\n`);
    
    for (const bot of selfbots) {
      console.log('─'.repeat(60));
      console.log(`\n🤖 Selfbot ID: ${bot.id}`);
      console.log(`   Name: ${bot.name}`);
      console.log(`   Phone: ${bot.phone}`);
      console.log(`   User: ${bot.User?.name || 'Unknown'} (ID: ${bot.userId})`);
      console.log(`   Status: ${bot.status}`);
      console.log(`   Enabled: ${bot.selfbotEnabled}`);
      console.log(`   Prefix: ${bot.prefix}`);
      console.log(`   Created: ${bot.createdAt}`);
      
      // Check session
      const session = getSelfbotSession(bot.id);
      if (session) {
        console.log(`   ✅ Session exists in memory`);
        console.log(`   Session user: ${session.user?.id || 'Not connected'}`);
      } else {
        console.log(`   ❌ No session in memory`);
      }
      
      // Check session folder
      const fs = require('fs');
      const path = require('path');
      const sessionPath = path.join(__dirname, '../sessions', `selfbot_${bot.id}`);
      
      if (fs.existsSync(sessionPath)) {
        const files = fs.readdirSync(sessionPath);
        console.log(`   ✅ Session folder exists (${files.length} files)`);
      } else {
        console.log(`   ❌ No session folder`);
      }
      
      // Recommendations
      console.log('\n   💡 Recommendations:');
      
      if (bot.status !== 'connected') {
        console.log('   - Status is not connected. Try reconnecting:');
        console.log(`     Chat to bot: .sb reconnect`);
      }
      
      if (!bot.selfbotEnabled) {
        console.log('   - Selfbot is not enabled. This might be intentional.');
      }
      
      if (!session && bot.status === 'connected') {
        console.log('   - Session missing but status is connected. Restart server.');
      }
      
      if (session && bot.status !== 'connected') {
        console.log('   - Session exists but status not connected. Check connection.');
      }
      
      console.log('\n   🔧 Troubleshooting:');
      console.log('   1. Check if WhatsApp is linked on your phone');
      console.log('   2. Make sure phone has internet connection');
      console.log('   3. Try disconnect and reconnect: .sb off then .sb <phone>');
      console.log('   4. Check server logs for errors');
    }
    
    console.log('\n' + '─'.repeat(60));
    
    // Test command availability
    console.log('\n📋 Testing command availability...\n');
    
    const commands = require('../services/bot/commands');
    const selfbotHandler = require('../services/selfbotHandler');
    
    console.log(`   Total commands loaded: ${Object.keys(commands).length}`);
    console.log(`   Selfbot allowed commands: ${selfbotHandler.ALLOWED_COMMANDS.length}`);
    
    // Check if selfbot command exists
    if (commands.sb && commands.selfbot) {
      console.log('   ✅ .sb and .selfbot commands are loaded');
    } else {
      console.log('   ❌ Selfbot commands NOT loaded');
    }
    
    // Sample allowed commands
    console.log('\n   📝 Sample allowed commands for selfbot:');
    const samples = selfbotHandler.ALLOWED_COMMANDS.slice(0, 15);
    samples.forEach(cmd => {
      console.log(`      - .${cmd}`);
    });
    console.log(`      ... and ${selfbotHandler.ALLOWED_COMMANDS.length - 15} more`);
    
    console.log('\n' + '='.repeat(60));
    console.log('DEBUG COMPLETE');
    console.log('='.repeat(60));
    
    console.log('\n💡 Quick Tips:');
    console.log('   - Selfbot uses your WhatsApp account as a bot');
    console.log('   - Only safe commands are allowed (no kick, ban, etc)');
    console.log('   - Messages from yourself are ignored to prevent loops');
    console.log('   - Use .sb to manage your selfbot');
    console.log('   - Check SELFBOT_FEATURE.md for full documentation');
    
  } catch (err) {
    console.error('❌ ERROR during debugging:', err.message);
    console.error(err.stack);
  }
  
  process.exit(0);
}

debugSelfbot();
