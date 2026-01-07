/**
 * Fix Group Columns - Force recreate table with new columns
 */

const { sequelize } = require('../config/database');

async function fixGroupColumns() {
  try {
    console.log('Fixing Group table columns...');
    
    // Check if old columns exist and rename/add new ones
    const [columns] = await sequelize.query(`PRAGMA table_info(Groups);`);
    const columnNames = columns.map(c => c.name);
    
    console.log('Current columns:', columnNames);
    
    // Add missing columns with default values
    const newColumns = [
      { name: 'antiDelete', type: 'BOOLEAN', default: 0 },
      { name: 'antiLink', type: 'BOOLEAN', default: 0 },
      { name: 'antiLinkNoKick', type: 'BOOLEAN', default: 0 },
      { name: 'antiBadword', type: 'BOOLEAN', default: 0 },
      { name: 'antiBadwordNoKick', type: 'BOOLEAN', default: 0 },
      { name: 'antiBot', type: 'BOOLEAN', default: 0 },
      { name: 'antiWame', type: 'BOOLEAN', default: 0 },
      { name: 'antiWameNoKick', type: 'BOOLEAN', default: 0 },
      { name: 'antiLuar', type: 'BOOLEAN', default: 0 },
      { name: 'antiViewOnce', type: 'BOOLEAN', default: 0 },
      { name: 'antiMentionSW', type: 'BOOLEAN', default: 0 },
      { name: 'antiLinkChannel', type: 'BOOLEAN', default: 0 },
      { name: 'antiSticker', type: 'BOOLEAN', default: 0 },
      { name: 'antiSpam', type: 'BOOLEAN', default: 0 },
      { name: 'antiNsfw', type: 'BOOLEAN', default: 0 },
      { name: 'demoteDetector', type: 'BOOLEAN', default: 0 },
      { name: 'promoteDetector', type: 'BOOLEAN', default: 1 },
      { name: 'muteEnabled', type: 'BOOLEAN', default: 0 },
      { name: 'selfMode', type: 'BOOLEAN', default: 0 },
      { name: 'premiumOnly', type: 'BOOLEAN', default: 0 },
      { name: 'limitType', type: 'VARCHAR(255)', default: "'default'" },
      { name: 'limitAmount', type: 'INTEGER', default: 30 },
      { name: 'rules', type: 'TEXT', default: 'NULL' }
    ];
    
    for (const col of newColumns) {
      if (!columnNames.includes(col.name)) {
        console.log(`Adding column: ${col.name}`);
        try {
          await sequelize.query(`ALTER TABLE Groups ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default};`);
        } catch (e) {
          console.log(`  Column ${col.name} might already exist:`, e.message);
        }
      }
    }
    
    // Remove old columns if they exist (SQLite doesn't support DROP COLUMN easily, so we skip)
    const oldColumns = ['antiLinkEnabled', 'antiSpamEnabled', 'antiBadwordEnabled', 'antiNsfwEnabled'];
    for (const col of oldColumns) {
      if (columnNames.includes(col)) {
        console.log(`Old column found: ${col} (SQLite doesn't support DROP, will be ignored)`);
      }
    }
    
    console.log('✅ Group table fixed!');
    
    // Show final columns
    const [finalColumns] = await sequelize.query(`PRAGMA table_info(Groups);`);
    console.log('\nFinal columns:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.name} (${col.type}) default: ${col.dflt_value}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixGroupColumns();
