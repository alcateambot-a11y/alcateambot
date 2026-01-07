const { sequelize } = require('../config/database');

async function fixDb() {
  try {
    // Add missing columns to Bots table
    await sequelize.query('ALTER TABLE Bots ADD COLUMN menuLatitude REAL').catch(() => console.log('menuLatitude exists'));
    await sequelize.query('ALTER TABLE Bots ADD COLUMN menuLongitude REAL').catch(() => console.log('menuLongitude exists'));
    await sequelize.query('ALTER TABLE Bots ADD COLUMN menuImagePath TEXT').catch(() => console.log('menuImagePath exists'));
    await sequelize.query('ALTER TABLE Bots ADD COLUMN adUrl TEXT').catch(() => console.log('adUrl exists'));
    console.log('Database fixed');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixDb();
