/**
 * Bot Module Index
 * Export semua dari folder bot
 */

const commands = require('./commands');
const utils = require('./utils');
const constants = require('./constants');
const data = require('./data');

module.exports = {
  commands,
  ...utils,
  ...constants,
  ...data
};
