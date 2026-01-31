/**
 * Add afkUsers column to Groups table
 */

const { sequelize } = require('../config/database');

async function addAfkColumn() {
  try {
    console.log('Adding afkUsers column to Groups table...');
    
    await sequelize.query(`
      ALTER TABLE Groups ADD COLUMN afkUsers TEXT DEFAULT '[]'
    `);
    
    console.log('✅ Column afkUsers added successfully!');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('⚠️ Column afkUsers already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await sequelize.close();
  }
}

addAfkColumn();
