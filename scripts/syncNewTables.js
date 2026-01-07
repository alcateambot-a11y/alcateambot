/**
 * Script untuk sync tabel baru (PremiumUser dan Sewa)
 * Jalankan: node scripts/syncNewTables.js
 */

const { sequelize } = require('../config/database');
const PremiumUser = require('../models/PremiumUser');
const Sewa = require('../models/Sewa');

async function syncTables() {
  try {
    console.log('Syncing new tables...');
    
    // Sync hanya tabel baru
    await PremiumUser.sync();
    console.log('✅ PremiumUsers table created');
    
    await Sewa.sync();
    console.log('✅ Sewas table created');
    
    console.log('\n✅ All new tables synced successfully!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Sync error:', err);
    process.exit(1);
  }
}

syncTables();
