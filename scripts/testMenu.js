const { Bot, User } = require('../models');
const { sequelize } = require('../config/database');

async function test() {
  await sequelize.sync();
  
  // Create test user
  let user = await User.findOne({ where: { email: 'test@test.com' } });
  if (!user) {
    user = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'test123'
    });
    console.log('Created test user:', user.id);
  }
  
  // Create test bot
  let bot = await Bot.findOne({ where: { userId: user.id } });
  if (!bot) {
    bot = await Bot.create({
      userId: user.id,
      name: 'Test Bot',
      status: 'connected'
    });
    console.log('Created test bot:', bot.id);
  }
  
  console.log('\n=== BOT DATA ===');
  console.log('Bot ID:', bot.id);
  console.log('menuText:', bot.menuText ? `SET (${bot.menuText.length} chars)` : 'NULL');
  console.log('menuType:', bot.menuType);
  console.log('prefix:', bot.prefix);
  
  // Test the menu command logic
  const { handleMessage, commands } = require('../services/botHandler');
  
  console.log('\n=== TESTING MENU COMMAND ===');
  
  // Mock sock and msg
  const mockSock = {
    sendMessage: async (jid, content) => {
      console.log('\n=== BOT WOULD SEND ===');
      console.log('To:', jid);
      if (content.text) {
        console.log('Text preview (first 500 chars):');
        console.log(content.text.substring(0, 500));
        console.log('...');
        console.log('Total length:', content.text.length, 'chars');
      }
      if (content.image) {
        console.log('Image URL:', content.image.url);
      }
      if (content.caption) {
        console.log('Caption preview:', content.caption.substring(0, 200));
      }
    }
  };
  
  const mockMsg = {
    key: {
      remoteJid: '6281234567890@s.whatsapp.net',
      participant: null
    },
    pushName: 'Test User'
  };
  
  // Call menu command directly
  await commands.menu(mockSock, mockMsg, [], bot);
  
  console.log('\n=== TEST COMPLETE ===');
  process.exit(0);
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
