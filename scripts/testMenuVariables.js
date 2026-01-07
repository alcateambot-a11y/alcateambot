/**
 * Test Menu Variables
 * Script untuk test apakah variabel di menu terganti dengan benar
 */

const { DEFAULT_MENU } = require('../services/bot/constants');
const { formatMsg, getMenuVariables } = require('../services/bot/utils');

// Simulate bot data
const mockBot = {
  botName: 'TestBot',
  prefix: '.',
  footerText: 'Alcateambot'
};

// Get base variables
const vars = getMenuVariables(mockBot, '6281234567890@s.whatsapp.net', 'TestUser', '.');

// Add additional variables like cmdMenu does
const now = new Date();
const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
vars.tanggal = now.toLocaleDateString('id-ID');
vars.hari = days[now.getDay()];
vars.footer = mockBot.footerText || mockBot.botName || 'Alcateambot';

console.log('=== Variables ===');
console.log(vars);
console.log('\n=== Formatted Menu (first 2000 chars) ===');

const formattedMenu = formatMsg(DEFAULT_MENU, vars);
console.log(formattedMenu.substring(0, 2000));

// Check if any variables are NOT replaced
const unreplacedVars = formattedMenu.match(/\{[a-zA-Z]+\}/g);
if (unreplacedVars && unreplacedVars.length > 0) {
  console.log('\n⚠️ WARNING: Unreplaced variables found:');
  console.log([...new Set(unreplacedVars)]);
} else {
  console.log('\n✅ All variables replaced successfully!');
}

// Count total commands in menu
const commandCount = (formattedMenu.match(/┃ ◈/g) || []).length;
console.log(`\n📊 Total commands in menu: ${commandCount}`);
