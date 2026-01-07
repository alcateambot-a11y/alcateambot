/**
 * Check Feature Status - Summary of all features
 */

const { COMMANDS, getCategories } = require('../services/bot/commandList');
const commands = require('../services/bot/commands');

console.log('📊 STATUS FITUR BOT\n');
console.log('='.repeat(60));

// Check handlers
const categories = getCategories();
let totalCommands = 0;
let totalHandlers = 0;
let missingHandlers = [];

categories.forEach(cat => {
  const cmds = COMMANDS.filter(c => c.category === cat);
  let catHandlers = 0;
  
  cmds.forEach(cmd => {
    totalCommands++;
    if (commands[cmd.name]) {
      catHandlers++;
      totalHandlers++;
    } else {
      missingHandlers.push(cmd.name);
    }
  });
  
  const status = catHandlers === cmds.length ? '✅' : '⚠️';
  console.log(`${status} ${cat.toUpperCase().padEnd(12)} : ${catHandlers}/${cmds.length} commands`);
});

console.log('\n' + '='.repeat(60));
console.log(`\n📈 TOTAL: ${totalHandlers}/${totalCommands} commands have handlers`);

if (missingHandlers.length > 0) {
  console.log(`\n❌ Missing handlers: ${missingHandlers.join(', ')}`);
} else {
  console.log('\n✅ All commands have handlers!');
}

// Feature categories summary
console.log('\n\n📋 RINGKASAN FITUR:\n');

const featureSummary = {
  'Fitur Lokal (Selalu Berfungsi)': [
    'Fun: fakta, jokes, quote, pantun, bucin, galau, truth, dare, motivasi, dll',
    'Games: slot, dice, coinflip, rps, 8ball, love, quiz, tebakkata, dll',
    'Tools: calc, base64, binary, qr (lokal), dll',
    'Info: menu, ping, info, owner, runtime, dll'
  ],
  'Fitur API (Tergantung Ketersediaan)': [
    'AI: ai, gemini, claude - menggunakan fallback jika API down',
    'Search: wiki, cuaca, anime, manga, kurs, crypto',
    'Downloader: tiktok, instagram, youtube, spotify, pinterest',
    'Random Images: waifu, neko, kucing, anjing, wallpaper'
  ],
  'Fitur Grup': [
    'Admin: kick, add, promote, demote, tagall, hidetag',
    'Settings: setname, setdesc, open, close, linkgc'
  ],
  'Fitur Owner': [
    'Management: broadcast, ban, unban, addprem, delprem',
    'Bot Settings: setprefix, setbotname, restart'
  ]
};

Object.entries(featureSummary).forEach(([category, features]) => {
  console.log(`\n🔹 ${category}:`);
  features.forEach(f => console.log(`   • ${f}`));
});

console.log('\n\n⚠️ CATATAN:');
console.log('   • Fitur yang menggunakan API eksternal mungkin tidak berfungsi jika API down');
console.log('   • AI commands memiliki fallback response jika semua API gagal');
console.log('   • Fitur lokal (games, fun, tools dasar) selalu berfungsi');
console.log('   • Total 220 commands dengan 422 handlers (termasuk aliases)');
