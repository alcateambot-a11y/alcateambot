/**
 * Script untuk sync plan dari User ke Bot
 * Jalankan: node scripts/syncUserPlan.js
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, Bot } = require('../models');

async function syncAllUserPlans() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Get all users
    const users = await User.findAll();
    console.log(`Found ${users.length} users`);

    const botPlanMap = {
      free: 'free',
      basic: 'basic', 
      premium: 'premium',
      pro: 'unlimited'
    };

    for (const user of users) {
      const botPlan = botPlanMap[user.plan] || 'free';
      
      // Update all bots for this user
      const [updated] = await Bot.update(
        { 
          plan: botPlan,
          expiredAt: user.plan === 'free' ? null : user.planExpiredAt
        },
        { where: { userId: user.id } }
      );

      if (updated > 0) {
        console.log(`User ${user.id} (${user.email}): ${user.plan} -> Bot plan: ${botPlan}, Expired: ${user.planExpiredAt || 'null'}`);
      }
    }

    console.log('\nSync completed!');
    
    // Show current state
    console.log('\n=== Current User Plans ===');
    for (const user of users) {
      const bots = await Bot.findAll({ where: { userId: user.id } });
      console.log(`User: ${user.email}`);
      console.log(`  - User Plan: ${user.plan}, Expired: ${user.planExpiredAt}`);
      for (const bot of bots) {
        console.log(`  - Bot ${bot.id} Plan: ${bot.plan}, Expired: ${bot.expiredAt}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

syncAllUserPlans();
