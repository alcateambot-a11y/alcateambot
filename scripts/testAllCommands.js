/**
 * Test All Commands - Verify all command handlers work without errors
 */

const commands = require('../services/bot/commands');

// Mock sock object
const mockSock = {
  sendMessage: async (jid, content) => {
    console.log(`  📤 Would send to ${jid}:`, content.text?.substring(0, 50) || content.image ? '[IMAGE]' : content.audio ? '[AUDIO]' : content.video ? '[VIDEO]' : JSON.stringify(content).substring(0, 50));
    return { key: { id: 'test' } };
  },
  user: { id: '628123456789@s.whatsapp.net' },
  groupMetadata: async () => ({ participants: [{ id: '628111@s.whatsapp.net', admin: 'admin' }] }),
  groupFetchAllParticipating: async () => ({})
};

// Mock message
const mockMsg = {
  key: { remoteJid: '628123456789@s.whatsapp.net', participant: '628111@s.whatsapp.net' },
  message: { conversation: 'test' }
};

// Mock bot
const mockBot = {
  id: 1,
  userId: 1,
  botName: 'TestBot',
  prefix: '.',
  owners: '[]'
};

// Test categories
const testCases = [
  // INFO
  { cmd: 'ping', args: [], desc: 'Ping command' },
  { cmd: 'info', args: [], desc: 'Bot info' },
  
  // FUN - Local data, should always work
  { cmd: 'fakta', args: [], desc: 'Random fakta' },
  { cmd: 'jokes', args: [], desc: 'Random jokes' },
  { cmd: 'quote', args: [], desc: 'Random quote' },
  { cmd: 'pantun', args: [], desc: 'Random pantun' },
  { cmd: 'bucin', args: [], desc: 'Kata bucin' },
  { cmd: 'galau', args: [], desc: 'Kata galau' },
  { cmd: 'truth', args: [], desc: 'Truth question' },
  { cmd: 'dare', args: [], desc: 'Dare challenge' },
  { cmd: 'motivasi', args: [], desc: 'Motivasi' },
  
  // GAMES - Local logic
  { cmd: 'slot', args: [], desc: 'Slot machine' },
  { cmd: 'dice', args: [], desc: 'Dice roll' },
  { cmd: 'coinflip', args: [], desc: 'Coin flip' },
  { cmd: 'rps', args: ['batu'], desc: 'Rock paper scissors' },
  { cmd: '8ball', args: ['apakah', 'aku', 'ganteng'], desc: '8 Ball' },
  { cmd: 'love', args: ['Budi', 'Ani'], desc: 'Love calculator' },
  
  // TOOLS - Local processing
  { cmd: 'calc', args: ['2+2*3'], desc: 'Calculator' },
  { cmd: 'base64enc', args: ['hello'], desc: 'Base64 encode' },
  { cmd: 'base64dec', args: ['aGVsbG8='], desc: 'Base64 decode' },
  { cmd: 'binary', args: ['hi'], desc: 'Binary encode' },
  
  // SEARCH - Need API (may fail if API down)
  { cmd: 'wiki', args: ['Indonesia'], desc: 'Wikipedia search' },
  
  // AI - Need API
  { cmd: 'ai', args: ['halo'], desc: 'AI chat' },
];

async function runTests() {
  console.log('🧪 TESTING BOT COMMANDS\n');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;
  let errors = [];
  
  for (const test of testCases) {
    const handler = commands[test.cmd];
    
    if (!handler) {
      console.log(`❌ ${test.cmd}: Handler not found!`);
      failed++;
      errors.push({ cmd: test.cmd, error: 'Handler not found' });
      continue;
    }
    
    try {
      console.log(`\n🔄 Testing: ${test.cmd} - ${test.desc}`);
      await handler(mockSock, mockMsg, mockBot, test.args);
      console.log(`✅ ${test.cmd}: PASSED`);
      passed++;
    } catch (err) {
      console.log(`❌ ${test.cmd}: FAILED - ${err.message}`);
      failed++;
      errors.push({ cmd: test.cmd, error: err.message });
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(e => console.log(`  - ${e.cmd}: ${e.error}`));
  }
  
  // Test that all handlers are callable functions
  console.log('\n\n🔍 CHECKING ALL HANDLERS ARE FUNCTIONS...');
  const allHandlers = Object.keys(commands);
  let notFunctions = [];
  
  for (const name of allHandlers) {
    if (name === 'activeGames') continue; // This is a Map, not a function
    if (typeof commands[name] !== 'function') {
      notFunctions.push(name);
    }
  }
  
  if (notFunctions.length > 0) {
    console.log(`❌ Not functions: ${notFunctions.join(', ')}`);
  } else {
    console.log(`✅ All ${allHandlers.length - 1} handlers are valid functions`);
  }
}

runTests().catch(console.error);
