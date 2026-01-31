/**
 * Test Cek Premium Fix
 * Test apakah .cekpremium bisa detect premium setelah .addprem di group
 */

const { PremiumUser, Bot } = require('../models');

async function testCekPremiumFix() {
  console.log('=== TEST CEK PREMIUM FIX ===\n');
  
  try {
    // Get bot
    const bot = await Bot.findByPk(2); // Bot ID 2 yang punya premium users
    if (!bot) {
      console.log('❌ Bot tidak ditemukan');
      return;
    }
    
    console.log('✅ Bot found:', bot.botName);
    console.log('Bot ID:', bot.id);
    console.log('');
    
    // Test number (ganti dengan nomor yang kamu test)
    const testNumber = '628997990103'; // Nomor yang kamu addprem di group
    
    console.log('Testing number:', testNumber);
    console.log('');
    
    // Check if premium exists in database
    const premUser = await PremiumUser.findOne({
      where: { botId: bot.id, number: testNumber }
    });
    
    if (!premUser) {
      console.log('❌ User tidak ditemukan di database premium');
      console.log('');
      console.log('Coba addprem dulu di group:');
      console.log('.addprem @user 30d');
      return;
    }
    
    console.log('✅ Premium user found in database!');
    console.log('Number:', premUser.number);
    console.log('Expired at:', premUser.expiredAt);
    console.log('');
    
    // Check if expired
    const now = new Date();
    const expiredAt = new Date(premUser.expiredAt);
    const isExpired = expiredAt < now;
    
    if (isExpired) {
      console.log('❌ Premium sudah expired');
      console.log('Expired:', expiredAt.toLocaleDateString('id-ID'));
    } else {
      console.log('✅ Premium masih aktif');
      const diffTime = expiredAt - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log('Sisa waktu:', diffDays, 'hari');
    }
    console.log('');
    
    // Test different number formats
    console.log('=== TEST DIFFERENT NUMBER FORMATS ===');
    console.log('');
    
    const formats = [
      testNumber,
      testNumber + '@s.whatsapp.net',
      testNumber + '@lid',
      testNumber.split('@')[0],
      testNumber.split('@')[0].split(':')[0],
      testNumber.replace(/[^0-9]/g, '')
    ];
    
    for (const format of formats) {
      const cleaned = format.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
      const found = await PremiumUser.findOne({
        where: { botId: bot.id, number: cleaned }
      });
      
      console.log(`Format: ${format}`);
      console.log(`Cleaned: ${cleaned}`);
      console.log(`Found: ${found ? '✅ YES' : '❌ NO'}`);
      console.log('');
    }
    
    console.log('=== KESIMPULAN ===');
    console.log('');
    console.log('Jika semua format di atas menunjukkan "✅ YES",');
    console.log('maka fix sudah berhasil!');
    console.log('');
    console.log('Sekarang coba test di WhatsApp:');
    console.log('1. Di group: .addprem @user 30d');
    console.log('2. Di PC: .cekpremium');
    console.log('');
    console.log('Harusnya status premium sudah muncul! ✅');
    
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  }
}

// Run test
testCekPremiumFix()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
