/**
 * Script untuk cek footerText di database
 */

const { Bot, User } = require('../models');

async function checkFooterText() {
  try {
    // Get all bots
    const bots = await Bot.findAll({
      attributes: ['id', 'userId', 'botName', 'footerText', 'plan']
    });
    
    console.log('\n=== BOT DATA ===');
    for (const bot of bots) {
      const user = await User.findByPk(bot.userId, {
        attributes: ['id', 'name', 'email', 'plan', 'planExpiredAt']
      });
      
      console.log(`\nBot ID: ${bot.id}`);
      console.log(`  Bot Name: ${bot.botName}`);
      console.log(`  FooterText: "${bot.footerText || '(empty)'}"`);
      console.log(`  Bot Plan: ${bot.plan}`);
      console.log(`  User ID: ${bot.userId}`);
      if (user) {
        console.log(`  User Name: ${user.name}`);
        console.log(`  User Email: ${user.email}`);
        console.log(`  User Plan: ${user.plan}`);
        console.log(`  User PlanExpiredAt: ${user.planExpiredAt}`);
        
        // Check if premium
        const isPremium = user.plan === 'premium' || user.plan === 'pro';
        const isExpired = user.planExpiredAt && new Date(user.planExpiredAt) < new Date();
        console.log(`  Is Premium: ${isPremium}`);
        console.log(`  Is Expired: ${isExpired}`);
        console.log(`  Should Show FooterText: ${isPremium && !isExpired && bot.footerText}`);
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkFooterText();
