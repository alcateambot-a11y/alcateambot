const { sequelize } = require('../config/database');

async function migrate() {
  try {
    // Add new columns to Users table
    const columns = [
      "ALTER TABLE Users ADD COLUMN role TEXT DEFAULT 'user'",
      "ALTER TABLE Users ADD COLUMN planExpiredAt DATETIME",
      "ALTER TABLE Users ADD COLUMN isBanned INTEGER DEFAULT 0",
      "ALTER TABLE Users ADD COLUMN banReason TEXT"
    ];
    
    for (const sql of columns) {
      try {
        await sequelize.query(sql);
        console.log('Added column:', sql.split('ADD COLUMN ')[1].split(' ')[0]);
      } catch (e) {
        console.log('Column exists or error:', e.message);
      }
    }
    
    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
