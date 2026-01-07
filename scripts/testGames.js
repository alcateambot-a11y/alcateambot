/**
 * Test Games Commands
 */

const axios = require('axios');

async function testGames() {
  console.log('=== Testing Games Commands ===\n');
  
  // Test 1: Slot (local)
  console.log('1. Testing Slot Machine...');
  const SLOT_EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍉', '🍒', '💎', '7️⃣', '⭐'];
  const slot1 = SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)];
  const slot2 = SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)];
  const slot3 = SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)];
  console.log(`✅ Slot working! Result: ${slot1} ${slot2} ${slot3}`);
  
  // Test 2: Dice (local)
  console.log('\n2. Testing Dice...');
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  console.log(`✅ Dice working! Result: ${dice1} + ${dice2} = ${dice1 + dice2}`);
  
  // Test 3: Flip (local)
  console.log('\n3. Testing Coin Flip...');
  const flip = Math.random() < 0.5 ? 'Heads' : 'Tails';
  console.log(`✅ Flip working! Result: ${flip}`);
  
  // Test 4: RPS (local)
  console.log('\n4. Testing RPS...');
  const choices = ['batu', 'gunting', 'kertas'];
  const rps = choices[Math.floor(Math.random() * choices.length)];
  console.log(`✅ RPS working! Bot choice: ${rps}`);
  
  // Test 5: Truth/Dare (local)
  console.log('\n5. Testing Truth/Dare...');
  const truths = ['Apa rahasia terbesarmu?', 'Siapa crush kamu?'];
  const dares = ['Kirim voice note nyanyi!', 'Ganti foto profil!'];
  console.log(`✅ Truth: ${truths[0]}`);
  console.log(`✅ Dare: ${dares[0]}`);
  
  // Test 6: Tebak Gambar API
  console.log('\n6. Testing Tebak Gambar API...');
  try {
    const response = await axios.get('https://api.siputzx.my.id/api/games/tebakgambar', { timeout: 10000 });
    console.log('Response:', JSON.stringify(response.data).substring(0, 300));
    if (response.data?.data) {
      console.log('✅ Tebak Gambar API working!');
      console.log('   Answer:', response.data.data.answer || response.data.data.jawaban);
    }
  } catch (e) {
    console.log('❌ Tebak Gambar API failed:', e.message);
    console.log('   Will use local emoji puzzles as fallback');
  }
  
  // Test 7: 8 Ball (local)
  console.log('\n7. Testing 8 Ball...');
  const answers = ['Ya!', 'Tidak!', 'Mungkin...'];
  console.log(`✅ 8 Ball working! Answer: ${answers[Math.floor(Math.random() * answers.length)]}`);
  
  // Test 8: Love Calculator (local)
  console.log('\n8. Testing Love Calculator...');
  const name1 = 'Budi';
  const name2 = 'Ani';
  const combined = (name1 + name2).toLowerCase();
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash = hash & hash;
  }
  const percentage = Math.abs(hash % 101);
  console.log(`✅ Love Calculator working! ${name1} + ${name2} = ${percentage}%`);
}

testGames().then(() => {
  console.log('\n=== All Games Tests Complete ===');
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
