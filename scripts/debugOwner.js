/**
 * Debug owner check
 */

const Bot = require('../models/Bot');

async function debug() {
  try {
    const bot = await Bot.findByPk(1);
    
    console.log('=== Bot Owners ===');
    console.log('Raw owners:', bot.owners);
    
    let owners = [];
    try {
      owners = JSON.parse(bot.owners || '[]');
    } catch (e) {
      console.log('Parse error:', e.message);
    }
    
    console.log('Parsed owners:', owners);
    
    // Simulasi check
    const testNumbers = ['6281234567890', '628123456789', '81234567890'];
    
    for (const testNum of testNumbers) {
      const isOwner = owners.some(o => {
        const ownerNumber = (o.number || '').replace(/[^0-9]/g, '');
        console.log(`  Comparing: "${ownerNumber}" === "${testNum}" ?`, ownerNumber === testNum);
        return ownerNumber === testNum;
      });
      console.log(`Test ${testNum}: isOwner = ${isOwner}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

debug();
