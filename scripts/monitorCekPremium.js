/**
 * Monitor Cek Premium
 * Monitor console log untuk debug .cekpremium
 */

const { Bot, PremiumUser } = require('../models');

async function monitorCekPremium() {
  console.log('=== MONITOR CEK PREMIUM ===\n');
  console.log('Script ini akan menampilkan semua premium users di database.');
  console.log('Gunakan untuk compare dengan nomor yang muncul di .cekpremium\n');
  
  try {
    // Get all bots
    const bots = await Bot.findAll();
    
    for (const bot of bots) {
      const premUsers = await PremiumUser.findAll({
        where: { botId: bot.id }
      });
      
      if (premUsers.length > 0) {
        console.log(`📱 Bot ID: ${bot.id} - ${bot.botName}`);
        console.log(`   Phone: ${bot.phone || 'N/A'}`);
        console.log(`   Premium users: ${premUsers.length}`);
        console.log('');
        
        premUsers.forEach((u, i) => {
          const expDate = new Date(u.expiredAt);
          const now = new Date();
          const isExpired = expDate < now;
          const daysLeft = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
          
          console.log(`   ${i + 1}. Number: ${u.number}`);
          console.log(`      Expired: ${expDate.toLocaleDateString('id-ID')}`);
          console.log(`      Status: ${isExpired ? '❌ Expired' : `✅ Active (${daysLeft} days left)`}`);
          console.log('');
        });
      }
    }
    
    console.log('=== CARA DEBUG ===\n');
    console.log('1. Ketik .cekpremium di WhatsApp');
    console.log('2. Lihat nomor yang muncul di response');
    console.log('3. Compare dengan nomor di atas');
    console.log('');
    console.log('Jika nomor berbeda:');
    console.log('- Nomor di WA: 133882938687653 ← LID (salah!)');
    console.log('- Nomor di DB: 628997990103 ← Phone (benar!)');
    console.log('');
    console.log('Berarti masalah ada di extract nomor dari sender.');
    console.log('');
    console.log('Solusi:');
    console.log('1. Run: node scripts/fixPremiumDirect.js');
    console.log('2. Masukkan nomor yang BENAR (628997990103)');
    console.log('3. Test lagi: .cekpremium');
    console.log('');
    console.log('Atau:');
    console.log('1. Di group: .listprem (untuk lihat bot ID)');
    console.log('2. Pastikan bot ID sama dengan yang di atas');
    console.log('3. Jika berbeda, gunakan bot yang benar');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Run
monitorCekPremium()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
