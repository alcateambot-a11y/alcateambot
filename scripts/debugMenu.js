/**
 * Debug script - simulasi persis seperti cmdMenu
 */

const { Bot, User } = require('../models');

async function debugMenu() {
  try {
    console.log('\n=== DEBUG MENU COMMAND ===\n');
    
    const botId = 2;
    
    // 1. Get fresh bot data (sama seperti di cmdMenu)
    const bot = await Bot.findByPk(botId);
    const freshBot = bot.toJSON();
    
    console.log('1. Fresh Bot Data:');
    console.log('   footerText:', freshBot.footerText);
    console.log('   userId:', freshBot.userId);
    
    // 2. Get user plan info
    const user = await User.findByPk(freshBot.userId);
    console.log('\n2. User Data:');
    console.log('   plan:', user.plan);
    console.log('   planExpiredAt:', user.planExpiredAt);
    
    // 3. Check premium
    const isPremium = user.plan === 'premium' || user.plan === 'pro';
    const isExpired = user.planExpiredAt && new Date(user.planExpiredAt) < new Date();
    const isActuallyPremium = isPremium && !isExpired;
    
    console.log('\n3. Premium Check:');
    console.log('   isPremium:', isPremium);
    console.log('   isExpired:', isExpired);
    console.log('   isActuallyPremium:', isActuallyPremium);
    
    // 4. Build footer variable
    const footer = (isActuallyPremium && freshBot.footerText) ? freshBot.footerText : (freshBot.botName || 'Alcateambot');
    console.log('\n4. Footer Variable:');
    console.log('   footer value:', footer);
    
    // 5. Build vars object
    const vars = {
      pushname: 'TestUser',
      prefix: freshBot.prefix || '.',
      namebot: freshBot.botName || 'Bot',
      ucapan: 'Selamat Siang',
      tanggal: new Date().toLocaleDateString('id-ID'),
      hari: 'Rabu',
      wib: '12:00',
      sender: '628123456789',
      limit: '∞',
      balance: '0',
      plan: 'Pro',
      status: 'Pro',
      footer: footer  // <-- THIS IS THE KEY
    };
    
    console.log('\n5. Vars Object:');
    console.log('   vars.footer:', vars.footer);
    
    // 6. Get menuText
    const menuText = freshBot.menuText;
    console.log('\n6. MenuText from DB:');
    console.log('   Has {footer}:', menuText?.includes('{footer}'));
    console.log('   Last 50 chars:', menuText?.slice(-50));
    
    // 7. Format message (sama seperti formatMsg)
    let result = menuText || '';
    Object.keys(vars).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      const before = result;
      result = result.replace(regex, vars[key]);
      if (before !== result) {
        console.log(`   Replaced {${key}} with "${vars[key]}"`);
      }
    });
    
    console.log('\n7. After formatMsg:');
    console.log('   Has {footer}:', result.includes('{footer}'));
    console.log('   Last 50 chars:', result.slice(-50));
    
    console.log('\n=== FINAL OUTPUT (last 5 lines) ===');
    const lines = result.split('\n');
    lines.slice(-5).forEach(line => console.log(line));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

debugMenu();
