/**
 * Check and fix selfMode issues
 */

const { sequelize } = require('../config/database');

async function checkSelfMode() {
  try {
    console.log('Checking groups with selfMode enabled...\n');
    
    const [groups] = await sequelize.query(`
      SELECT id, botId, groupId, name, selfMode, muteEnabled 
      FROM Groups 
      WHERE selfMode = 1 OR muteEnabled = 1
    `);
    
    if (groups.length === 0) {
      console.log('✅ No groups with selfMode or mute enabled');
    } else {
      console.log(`Found ${groups.length} groups with restrictions:\n`);
      groups.forEach(g => {
        console.log(`ID: ${g.id}`);
        console.log(`Bot ID: ${g.botId}`);
        console.log(`Group ID: ${g.groupId}`);
        console.log(`Name: ${g.name || 'N/A'}`);
        console.log(`Self Mode: ${g.selfMode ? '✅ ON' : '❌ OFF'}`);
        console.log(`Mute: ${g.muteEnabled ? '✅ ON' : '❌ OFF'}`);
        console.log('---');
      });
      
      console.log('\n🔧 To disable selfMode for all groups, run:');
      console.log('node scripts/fixSelfMode.js');
    }
    
    // Check bot settings
    console.log('\n\nChecking bot settings...\n');
    const [bots] = await sequelize.query(`
      SELECT id, name, phone, status 
      FROM Bots 
      WHERE status = 'connected'
    `);
    
    console.log(`Connected bots: ${bots.length}`);
    bots.forEach(b => {
      console.log(`- Bot ${b.id}: ${b.name} (${b.phone})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkSelfMode();
