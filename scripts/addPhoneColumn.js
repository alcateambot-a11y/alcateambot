/**
 * Add phone column to Users table
 * Fix for selfbot feature
 */

const { sequelize } = require('../config/database');

async function addPhoneColumn() {
  try {
    console.log('Adding phone column to Users table...');
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      PRAGMA table_info(Users);
    `);
    
    const hasPhone = results.some(col => col.name === 'phone');
    
    if (hasPhone) {
      console.log('✅ Phone column already exists');
      return;
    }
    
    // Add phone column (without UNIQUE constraint first)
    await sequelize.query(`
      ALTER TABLE Users ADD COLUMN phone VARCHAR(255);
    `);
    
    console.log('✅ Phone column added successfully');
    
    // Verify
    const [verify] = await sequelize.query(`
      PRAGMA table_info(Users);
    `);
    
    console.log('\nUsers table columns:');
    verify.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  process.exit(0);
}

addPhoneColumn();
