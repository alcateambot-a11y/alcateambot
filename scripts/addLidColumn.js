/**
 * Add LID column to PremiumUser table
 * Untuk support cek premium di PC dengan LID
 */

const { sequelize } = require('../config/database');

async function addLidColumn() {
  console.log('=== ADD LID COLUMN ===\n');
  
  try {
    // Check if column exists
    const [results] = await sequelize.query(`
      PRAGMA table_info(PremiumUsers)
    `);
    
    const hasLid = results.some(r => r.name === 'lid');
    
    if (hasLid) {
      console.log('✅ Column "lid" already exists');
      return;
    }
    
    // Add column
    await sequelize.query(`
      ALTER TABLE PremiumUsers ADD COLUMN lid TEXT
    `);
    
    console.log('✅ Column "lid" added successfully!');
    console.log('');
    console.log('Sekarang .addprem akan simpan LID juga,');
    console.log('dan .cekpremium di PC bisa detect otomatis!');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Run
addLidColumn()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
