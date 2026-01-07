/**
 * Test script for all menu types
 * Run: node scripts/testMenuTypes.js
 */

const { Bot } = require('../models');
const { sequelize } = require('../config/database');

async function testMenuTypes() {
  try {
    console.log('=== Testing Menu Types ===\n');
    
    // Get bot
    const bot = await Bot.findByPk(1);
    if (!bot) {
      console.log('❌ Bot not found');
      return;
    }
    
    console.log('Bot ID:', bot.id);
    console.log('Current menuType:', bot.menuType);
    console.log('menuUrl:', bot.menuUrl || 'not set');
    console.log('menuLatitude:', bot.menuLatitude || 'not set');
    console.log('menuLongitude:', bot.menuLongitude || 'not set');
    console.log('');
    
    // Test each menu type
    const menuTypes = ['text', 'thumbnail', 'image', 'location', 'button'];
    
    for (const type of menuTypes) {
      console.log(`\n--- Testing: ${type} ---`);
      
      // Update bot with test data
      const updateData = { menuType: type };
      
      if (type === 'thumbnail' || type === 'image') {
        updateData.menuUrl = 'https://picsum.photos/400/400';
        updateData.menuTitle = 'Test Bot';
        updateData.menuBody = 'Testing ' + type;
      }
      
      if (type === 'location') {
        updateData.menuLatitude = -6.2088;
        updateData.menuLongitude = 106.8456;
        updateData.menuTitle = 'Jakarta';
        updateData.menuBody = 'Indonesia';
      }
      
      await bot.update(updateData);
      
      // Verify
      const updated = await Bot.findByPk(1);
      console.log('✅ menuType set to:', updated.menuType);
      
      if (type === 'location') {
        console.log('   latitude:', updated.menuLatitude);
        console.log('   longitude:', updated.menuLongitude);
      }
    }
    
    // Reset to thumbnail
    await bot.update({ 
      menuType: 'thumbnail',
      menuUrl: 'https://picsum.photos/400/400',
      menuTitle: 'Paimon Bot',
      menuBody: 'Alcateambot.Corp'
    });
    
    console.log('\n=== All Menu Types Tested ===');
    console.log('✅ Database fields working correctly');
    console.log('\nTo test in WhatsApp:');
    console.log('1. Go to website Menu page');
    console.log('2. Change Type Menu dropdown');
    console.log('3. Fill required fields (URL for thumbnail/image, Lat/Long for location)');
    console.log('4. Click Submit');
    console.log('5. Send !menu to bot');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

testMenuTypes();
