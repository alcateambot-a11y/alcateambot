/**
 * Sync All Tables - Sync Bot and Group tables
 */

const { sequelize } = require('../config/database');
const Bot = require('../models/Bot');
const Group = require('../models/Group');

async function syncAllTables() {
  try {
    console.log('Syncing all tables...\n');
    
    // Sync Bot table
    console.log('1. Syncing Bot table...');
    await Bot.sync({ alter: true });
    console.log('   ✅ Bot table synced!\n');
    
    // Sync Group table
    console.log('2. Syncing Group table...');
    await Group.sync({ alter: true });
    console.log('   ✅ Group table synced!\n');
    
    // Show Bot columns
    const [botColumns] = await sequelize.query(`PRAGMA table_info(Bots);`);
    console.log('Bot table columns:', botColumns.length);
    
    // Show Group columns
    const [groupColumns] = await sequelize.query(`PRAGMA table_info(Groups);`);
    console.log('Group table columns:', groupColumns.length);
    
    console.log('\n✅ All tables synced successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

syncAllTables();
