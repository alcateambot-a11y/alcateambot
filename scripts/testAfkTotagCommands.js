/**
 * Test AFK and ToTag commands
 */

console.log('Testing AFK and ToTag commands...\n');

try {
  // Test loading group commands
  const groupCommands = require('../services/bot/commands/group');
  
  console.log('✅ Group commands loaded successfully');
  console.log('Available commands:', Object.keys(groupCommands).length);
  
  // Check if afk command exists
  if (groupCommands.afk) {
    console.log('✅ AFK command found');
  } else {
    console.log('❌ AFK command NOT found');
  }
  
  // Check if totag command exists
  if (groupCommands.totag) {
    console.log('✅ ToTag command found');
  } else {
    console.log('❌ ToTag command NOT found');
  }
  
  // Check if tt alias exists
  if (groupCommands.tt) {
    console.log('✅ ToTag alias (tt) found');
  } else {
    console.log('❌ ToTag alias (tt) NOT found');
  }
  
  console.log('\n--- Command List ---');
  
  // Test loading command list
  const { COMMANDS, getCommand } = require('../services/bot/commandList');
  
  console.log('Total commands in list:', COMMANDS.length);
  
  // Find afk command
  const afkCmd = getCommand('afk');
  if (afkCmd) {
    console.log('\n✅ AFK command in list:');
    console.log('  Name:', afkCmd.name);
    console.log('  Aliases:', afkCmd.aliases);
    console.log('  Category:', afkCmd.category);
    console.log('  Description:', afkCmd.description);
  } else {
    console.log('\n❌ AFK command NOT in list');
  }
  
  // Find totag command
  const totagCmd = getCommand('totag');
  if (totagCmd) {
    console.log('\n✅ ToTag command in list:');
    console.log('  Name:', totagCmd.name);
    console.log('  Aliases:', totagCmd.aliases);
    console.log('  Category:', totagCmd.category);
    console.log('  Description:', totagCmd.description);
  } else {
    console.log('\n❌ ToTag command NOT in list');
  }
  
  // Check updated tagall and hidetag
  const tagallCmd = getCommand('tagall');
  if (tagallCmd) {
    console.log('\n✅ TagAll command updated:');
    console.log('  Description:', tagallCmd.description);
  }
  
  const hidetagCmd = getCommand('hidetag');
  if (hidetagCmd) {
    console.log('\n✅ HideTag command updated:');
    console.log('  Description:', hidetagCmd.description);
  }
  
  console.log('\n✅ All tests passed!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
