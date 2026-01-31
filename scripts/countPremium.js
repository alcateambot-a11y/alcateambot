const { COMMANDS } = require('../services/bot/commandList');

const premium = COMMANDS.filter(c => c.premiumOnly);

console.log('Total premium commands in master list:', premium.length);
console.log('');

premium.forEach((c, i) => {
  console.log(`${i+1}. ${c.name} (${c.category})`);
});
