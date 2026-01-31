/**
 * Test LID Resolution
 * Simulate how LID is resolved in different scenarios
 */

console.log('=== TEST LID RESOLUTION ===\n');

// Simulate sender formats
const testCases = [
  {
    name: 'PC - Normal phone number',
    sender: '628997990103@s.whatsapp.net',
    isGroup: false,
    expected: '628997990103'
  },
  {
    name: 'PC - LID (should fallback to remoteJid)',
    sender: '133882938687653@lid',
    remoteJid: '628997990103@s.whatsapp.net',
    isGroup: false,
    expected: '628997990103'
  },
  {
    name: 'Group - Normal phone number',
    sender: '628997990103@s.whatsapp.net',
    isGroup: true,
    expected: '628997990103'
  },
  {
    name: 'Group - LID (should resolve from metadata)',
    sender: '133882938687653@lid',
    isGroup: true,
    groupMetadata: {
      participants: [
        { id: '133882938687653@lid', phoneNumber: '628997990103@s.whatsapp.net' }
      ]
    },
    expected: '628997990103'
  }
];

testCases.forEach((test, i) => {
  console.log(`Test ${i + 1}: ${test.name}`);
  console.log('Sender:', test.sender);
  console.log('Is Group:', test.isGroup);
  
  let senderPhone = test.sender;
  
  // Simulate botHandler logic
  if (test.sender.endsWith('@lid')) {
    if (test.isGroup && test.groupMetadata) {
      // In group: resolve from groupMetadata
      const participant = test.groupMetadata.participants.find(p => p.id === test.sender);
      if (participant && participant.phoneNumber) {
        senderPhone = participant.phoneNumber;
        console.log('✅ Resolved LID to phone in group:', senderPhone);
      } else {
        console.log('❌ Cannot resolve LID in group');
      }
    } else {
      // In PC: use remoteJid instead
      console.log('⚠️  LID detected in PC, using remoteJid instead');
      senderPhone = test.remoteJid || test.sender;
    }
  }
  
  // Extract number
  const extractedNumber = senderPhone.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
  console.log('Extracted number:', extractedNumber);
  
  // Validate
  const isValid = extractedNumber.length >= 10 && extractedNumber.length <= 15;
  console.log('Is valid:', isValid ? '✅' : '❌');
  
  // Check if matches expected
  const matches = extractedNumber === test.expected;
  console.log('Matches expected:', matches ? '✅' : '❌');
  
  if (!matches) {
    console.log('Expected:', test.expected);
    console.log('Got:', extractedNumber);
  }
  
  console.log('');
});

console.log('=== KESIMPULAN ===');
console.log('');
console.log('Fix yang dilakukan:');
console.log('1. ✅ Di botHandler: Detect LID di PC dan fallback ke remoteJid');
console.log('2. ✅ Di botHandler: Resolve LID di group dari groupMetadata');
console.log('3. ✅ Di cmdCekPremium: Validate nomor (reject jika >15 atau <10 digit)');
console.log('4. ✅ Di cmdCekPremium: Reject jika nomor tidak valid (LID)');
console.log('');
console.log('Sekarang coba test di WhatsApp:');
console.log('1. Di PC: .cekpremium');
console.log('2. Harusnya nomor yang benar muncul (bukan LID)');
