/**
 * Fix selfMode and mute issues - disable for all groups
 */

const { sequelize } = require('../config/database');

async function fixSelfMode() {
  try {
    console.log('Disabling selfMode and mute for all groups...\n');
    
    // Disable selfMode and mute for all groups
    const [result] = await sequelize.query(`
      UPDATE Groups 
      SET selfMode = 0, muteEnabled = 0, updatedAt = datetime('now')
      WHERE selfMode = 1 OR muteEnabled = 1
    `);
    
    console.log(`✅ Updated groups successfully`);
    
    // Verify
    const [groups] = await sequelize.query(`
      SELECT id, botId, groupId, name, selfMode, muteEnabled 
      FROM Groups 
      WHERE selfMode = 1 OR muteEnabled = 1
    `);
    
    if (groups.length === 0) {
      console.log('✅ All groups are now in normal mode (not muted, not self)');
    } else {
      console.log(`⚠️ Still ${groups.length} groups with restrictions`);
    }
    
    console.log('\n✨ Done! Bot should now respond to all users in groups.');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixSelfMode();
