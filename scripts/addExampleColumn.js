const { sequelize } = require('../config/database');

async function addExampleColumn() {
  try {
    console.log('Adding example column to Commands table...');
    
    // Check if column exists
    const [results] = await sequelize.query(`PRAGMA table_info(Commands)`);
    const hasExample = results.some(col => col.name === 'example');
    
    if (hasExample) {
      console.log('Column "example" already exists');
    } else {
      await sequelize.query(`ALTER TABLE Commands ADD COLUMN example TEXT`);
      console.log('Column "example" added successfully');
    }
    
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

addExampleColumn();
