/**
 * Add selfbot columns to Bots table
 */

const { sequelize } = require('../config/database');

async function addSelfbotColumns() {
  try {
    console.log('Adding selfbot columns to Bots table...\n');
    
    // Check if columns exist
    const [columns] = await sequelize.query(`PRAGMA table_info(Bots)`);
    const columnNames = columns.map(c => c.name);
    
    const columnsToAdd = [
      { name: 'isSelfbot', type: 'BOOLEAN', default: 0 },
      { name: 'selfbotEnabled', type: 'BOOLEAN', default: 0 }
    ];
    
    for (const col of columnsToAdd) {
      if (!columnNames.includes(col.name)) {
        console.log(`Adding column: ${col.name}`);
        await sequelize.query(
          `ALTER TABLE Bots ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`
        );
        console.log(`✅ Added ${col.name}`);
      } else {
        console.log(`⏭️  Column ${col.name} already exists`);
      }
    }
    
    console.log('\n✅ Selfbot columns added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

addSelfbotColumns();
