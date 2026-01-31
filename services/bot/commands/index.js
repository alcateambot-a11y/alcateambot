/**
 * Commands Index
 * Export semua commands dari satu tempat
 * Auto-generate alias mapping dari commandList.js
 */

const { COMMANDS } = require('../commandList');

const infoCommands = require('./info');
const aiCommands = require('./ai');
const searchCommands = require('./search');
const downloaderCommands = require('./downloader');
const toolsCommands = require('./tools');
const gamesCommands = require('./games');
const funCommands = require('./fun');
const animeCommands = require('./anime');
const groupCommands = require('./group');
const ownerCommands = require('./owner');
const makerCommands = require('./maker');
const tradingCommands = require('./trading');
const selfbotCommands = require('./selfbot');

// Gabungkan semua commands
const baseCommands = {
  ...infoCommands,
  ...aiCommands,
  ...searchCommands,
  ...downloaderCommands,
  ...toolsCommands,
  ...gamesCommands,
  ...funCommands,
  ...animeCommands,
  ...groupCommands,
  ...ownerCommands,
  ...makerCommands,
  ...tradingCommands,
  ...selfbotCommands
};

// Auto-generate alias mapping dari commandList.js
// Ini memastikan alias di website dan bot selalu sinkron
const commands = { ...baseCommands };

COMMANDS.forEach(cmd => {
  // Jika command utama ada di baseCommands
  if (baseCommands[cmd.name]) {
    // Map semua alias ke function yang sama
    if (cmd.aliases && cmd.aliases.length > 0) {
      cmd.aliases.forEach(alias => {
        // Hanya tambahkan jika belum ada (hindari override)
        if (!commands[alias]) {
          commands[alias] = baseCommands[cmd.name];
        }
      });
    }
  }
});

// Log untuk debugging
console.log(`Commands loaded: ${Object.keys(baseCommands).length} base, ${Object.keys(commands).length} total (with aliases)`);

module.exports = commands;
