/**
 * Reset Menu to Default
 * Script untuk reset menuText ke null sehingga menggunakan DEFAULT_MENU
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false
});

async function resetMenu() {
  try {
    console.log('Resetting all bot menus to default...\n');
    
    // Update all bots to use default menu (set menuText to null)
    const [results] = await sequelize.query(`
      UPDATE Bots SET menuText = NULL WHERE menuText IS NOT NULL
    `);
    
    console.log('✅ All bot menus have been reset to default!');
    console.log('Bot akan menggunakan DEFAULT_MENU yang berisi 220+ commands.\n');
    
    // Show sample of new menu
    const { DEFAULT_MENU } = require('../services/bot/constants');
    console.log('Preview menu baru (first 1000 chars):');
    console.log('─'.repeat(50));
    console.log(DEFAULT_MENU.substring(0, 1000) + '...');
    console.log('─'.repeat(50));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

resetMenu();
