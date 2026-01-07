/**
 * Commands Index
 * Export semua commands dari satu tempat
 */

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

// Gabungkan semua commands
const commands = {
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
  ...makerCommands
};

module.exports = commands;
