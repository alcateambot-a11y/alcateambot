/**
 * Script untuk menambahkan kolom whitelist dan blacklist ke tabel Groups
 */

const { sequelize } = require('../config/database');

async function addWhitelistColumns() {
  console.log('Adding whitelist/blacklist columns to Groups table...');
  
  try {
    // Check if columns exist
    const [columns] = await sequelize.query(`PRAGMA table_info(Groups)`);
    const columnNames = columns.map(c => c.name);
    
    // Add whitelistEnabled column
    if (!columnNames.includes('whitelistEnabled')) {
      await sequelize.query(`ALTER TABLE Groups ADD COLUMN whitelistEnabled INTEGER DEFAULT 0`);
      console.log('✅ Added whitelistEnabled column');
    } else {
      console.log('⏭️ whitelistEnabled column already exists');
    }
    
    // Add whitelist column
    if (!columnNames.includes('whitelist')) {
      await sequelize.query(`ALTER TABLE Groups ADD COLUMN whitelist TEXT DEFAULT '[]'`);
      console.log('✅ Added whitelist column');
    } else {
      console.log('⏭️ whitelist column already exists');
    }
    
    // Add blacklist column
    if (!columnNames.includes('blacklist')) {
      await sequelize.query(`ALTER TABLE Groups ADD COLUMN blacklist TEXT DEFAULT '[]'`);
      console.log('✅ Added blacklist column');
    } else {
      console.log('⏭️ blacklist column already exists');
    }
    
    console.log('\n✅ Done! Whitelist/blacklist columns added successfully.');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  process.exit(0);
}

addWhitelistColumns();
