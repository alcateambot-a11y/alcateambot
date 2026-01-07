/**
 * Sync Group Table - Add new columns for group settings
 */

const { sequelize } = require('../config/database');
const Group = require('../models/Group');

async function syncGroupTable() {
  try {
    console.log('Syncing Group table...');
    
    // Sync with alter: true to add new columns without dropping data
    await Group.sync({ alter: true });
    
    console.log('✅ Group table synced successfully!');
    
    // Show current columns
    const [results] = await sequelize.query(`PRAGMA table_info(Groups);`);
    console.log('\nCurrent columns:');
    results.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error syncing Group table:', err.message);
    process.exit(1);
  }
}

syncGroupTable();
