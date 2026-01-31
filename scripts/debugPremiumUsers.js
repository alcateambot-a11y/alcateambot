/**
 * Debug Premium Users
 * Check all premium users in database
 */

const { PremiumUser, Bot } = require('../models');

async function debugPremiumUsers() {
  console.log('=== DEBUG PREMIUM USERS ===\n');
  
  try {
    // Get all bots
    const bots = await Bot.findAll();
    console.log(`Found ${bots.length} bot(s)\n`);
    
    for (const bot of bots) {
      console.log(`\n📱 Bot ID: ${bot.id} - ${bot.botName}`);
      console.log(`   Phone: ${bot.phone}`);
      
      // Get premium users for this bot
      const premUsers = await PremiumUser.findAll({ 
        where: { botId: bot.id },
        order: [['expiredAt', 'DESC']]
      });
      
      console.log(`   Premium users: ${premUsers.length}`);
      
      if (premUsers.length > 0) {
        console.log('\n   Users:');
        premUsers.forEach((u, i) => {
          const expiredAt = new Date(u.expiredAt);
          const now = new Date();
          const isExpired = expiredAt < now;
          const diffDays = Math.ceil((expiredAt - now) / (1000 * 60 * 60 * 24));
          
          console.log(`   ${i + 1}. Number: ${u.number}`);
          console.log(`      Expired: ${expiredAt.toLocaleDateString('id-ID')}`);
          console.log(`      Status: ${isExpired ? '❌ EXPIRED' : `✅ Active (${diffDays} days left)`}`);
          console.log(`      BotId: ${u.botId}`);
          console.log('');
        });
      }
    }
    
    // Get all premium users (any bot)
    const allPremUsers = await PremiumUser.findAll();
    console.log(`\n📊 Total premium users across all bots: ${allPremUsers.length}`);
    
    if (allPremUsers.length > 0) {
      console.log('\nAll premium users:');
      allPremUsers.forEach((u, i) => {
        console.log(`${i + 1}. BotId: ${u.botId}, Number: ${u.number}, Expired: ${new Date(u.expiredAt).toLocaleDateString('id-ID')}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
  
  console.log('\n✅ Debug complete');
  process.exit(0);
}

debugPremiumUsers();
