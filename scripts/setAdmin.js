const { sequelize } = require('../config/database');

async function setAdmin() {
  try {
    await sequelize.query("UPDATE Users SET role = 'admin' WHERE id = 1");
    console.log('User ID 1 set as admin!');
    
    // Also set user 2 as admin if exists
    await sequelize.query("UPDATE Users SET role = 'admin' WHERE id = 2");
    console.log('User ID 2 set as admin!');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

setAdmin();
