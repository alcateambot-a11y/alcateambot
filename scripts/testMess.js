/**
 * Test Mess Integration
 * Verifikasi bahwa pesan dari Mess.jsx sudah sinkron dengan botHandler.js
 */

const { formatMsg } = require('../services/bot/utils');
const { CMD_META } = require('../services/bot/constants');

// Simulasi bot settings dari database
const mockBot = {
  id: 1,
  prefix: '.',
  waitMessage: '*_Loading ..._*',
  errorMessage: 'Terjadi error: {error}',
  cooldownMessage: 'Tunggu {detik} detik lagi',
  timeoutMessage: '*Timeout, silahkan coba lagi*',
  onlyGroupMessage: 'Perintah ini hanya bisa digunakan di group',
  onlyPMMessage: 'Perintah ini hanya bisa digunakan di private chat',
  groupAdminMessage: 'Perintah ini hanya untuk Admin Grup',
  botAdminMessage: 'Bot harus menjadi admin',
  onlyOwnerMessage: 'Perintah ini hanya untuk owner bot',
  welcomeTextMessage: 'Welcome @{user} to {group}!',
  leftTextMessage: 'Goodbye @{user} 👋',
  promoteTextMessage: '@{sender} telah menjadi admin oleh @{author}',
  demoteTextMessage: '@{sender} telah di-unadmin oleh @{author}'
};

console.log('=== Testing Mess Integration ===\n');

// Test 1: formatMsg function
console.log('1. Testing formatMsg function...');
const tests = [
  { template: mockBot.cooldownMessage, vars: { detik: 5 }, expected: 'Tunggu 5 detik lagi' },
  { template: mockBot.errorMessage, vars: { error: 'Network error' }, expected: 'Terjadi error: Network error' },
  { template: mockBot.welcomeTextMessage, vars: { user: '628123456789', group: 'Test Group' }, expected: 'Welcome @628123456789 to Test Group!' },
  { template: mockBot.leftTextMessage, vars: { user: '628123456789' }, expected: 'Goodbye @628123456789 👋' },
  { template: mockBot.promoteTextMessage, vars: { sender: '628111', author: '628222' }, expected: '@628111 telah menjadi admin oleh @628222' }
];

let passed = 0;
tests.forEach((test, i) => {
  const result = formatMsg(test.template, test.vars);
  const ok = result === test.expected;
  console.log(`   ${ok ? '✅' : '❌'} Test ${i+1}: ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) console.log(`      Expected: ${test.expected}\n      Got: ${result}`);
  if (ok) passed++;
});
console.log(`   Result: ${passed}/${tests.length} passed\n`);

// Test 2: CMD_META permission flags
console.log('2. Testing CMD_META permission flags...');
const permissionTests = [
  { cmd: 'kick', flags: ['groupOnly', 'adminOnly', 'botAdminRequired'] },
  { cmd: 'add', flags: ['groupOnly', 'adminOnly', 'botAdminRequired'] },
  { cmd: 'hidetag', flags: ['groupOnly', 'adminOnly'] },
  { cmd: 'broadcast', flags: ['ownerOnly'] },
  { cmd: 'setprefix', flags: ['ownerOnly'] }
];

let permPassed = 0;
permissionTests.forEach(test => {
  const meta = CMD_META[test.cmd];
  if (!meta) {
    console.log(`   ❌ ${test.cmd}: Command not found in CMD_META`);
    return;
  }
  
  const hasAllFlags = test.flags.every(flag => meta[flag] === true);
  console.log(`   ${hasAllFlags ? '✅' : '❌'} ${test.cmd}: ${hasAllFlags ? 'PASS' : 'FAIL'} (${test.flags.join(', ')})`);
  if (hasAllFlags) permPassed++;
});
console.log(`   Result: ${permPassed}/${permissionTests.length} passed\n`);

// Test 3: All Mess fields exist in mock
console.log('3. Testing Mess fields...');
const messFields = [
  'waitMessage', 'errorMessage', 'cooldownMessage', 'timeoutMessage',
  'onlyGroupMessage', 'onlyPMMessage', 'groupAdminMessage', 'botAdminMessage',
  'onlyOwnerMessage', 'welcomeTextMessage', 'leftTextMessage',
  'promoteTextMessage', 'demoteTextMessage'
];

let fieldsPassed = 0;
messFields.forEach(field => {
  const exists = mockBot[field] !== undefined;
  console.log(`   ${exists ? '✅' : '❌'} ${field}: ${exists ? 'EXISTS' : 'MISSING'}`);
  if (exists) fieldsPassed++;
});
console.log(`   Result: ${fieldsPassed}/${messFields.length} fields exist\n`);

// Summary
console.log('=== Summary ===');
const totalTests = tests.length + permissionTests.length + messFields.length;
const totalPassed = passed + permPassed + fieldsPassed;
console.log(`Total: ${totalPassed}/${totalTests} tests passed`);
console.log(totalPassed === totalTests ? '✅ All tests PASSED!' : '❌ Some tests FAILED');

process.exit(totalPassed === totalTests ? 0 : 1);
