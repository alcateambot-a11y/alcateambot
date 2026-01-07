const path = require('path');
const fs = require('fs');
const { Bot } = require('../models');

async function test() {
  const bot = await Bot.findByPk(1);
  console.log('Bot menuImagePath:', bot.menuImagePath);
  
  // Simulate what botHandler does
  const imagePath = path.join(__dirname, '../public', bot.menuImagePath);
  console.log('Full path:', imagePath);
  console.log('Exists:', fs.existsSync(imagePath));
  
  if (fs.existsSync(imagePath)) {
    const buffer = fs.readFileSync(imagePath);
    console.log('Buffer size:', buffer.length, 'bytes');
    console.log('SUCCESS - Image can be loaded!');
  } else {
    console.log('FAILED - Image not found!');
  }
  
  process.exit();
}

test();
