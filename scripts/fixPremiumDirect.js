/**
 * Fix Premium Direct
 * Add premium langsung dengan nomor yang benar
 */

const { PremiumUser, Bot } = require('../models');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function fixPremiumDirect() {
  console.log('=== FIX PREMIUM DIRECT ===\n');
  
  try {
    // Get bot
    const bots = await Bot.findAll();
    console.log('Available bots:');
    bots.forEach((b, i) => {
      console.log(`${i + 1}. Bot ID: ${b.id} - ${b.botName} (Phone: ${b.phone || 'N/A'})`);
    });
    console.log('');
    
    const botIdInput = await question('Pilih Bot ID (default: 2): ');
    const botId = parseInt(botIdInput) || 2;
    
    const bot = await Bot.findByPk(botId);
    if (!bot) {
      console.log('❌ Bot tidak ditemukan');
      rl.close();
      return;
    }
    
    console.log('✅ Bot selected:', bot.botName);
    console.log('');
    
    // Ask for phone number
    console.log('Masukkan nomor telepon yang mau di-add premium.');
    console.log('Format: 628997990103 (tanpa +, tanpa -, tanpa spasi)');
    console.log('');
    
    const phoneInput = await question('Nomor telepon: ');
    const phoneNumber = phoneInput.replace(/[^0-9]/g, '');
    
    if (phoneNumber.length < 10 || phoneNumber.length > 15) {
      console.log('❌ Nomor tidak valid (harus 10-15 digit)');
      rl.close();
      return;
    }
    
    console.log('Nomor yang akan di-add:', phoneNumber);
    console.log('');
    
    // Ask for duration
    const durationInput = await question('Durasi (hari, default: 30): ');
    const days = parseInt(durationInput) || 30;
    
    // Calculate expiry
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    
    console.log('');
    console.log('=== KONFIRMASI ===');
    console.log('Bot ID:', botId);
    console.log('Bot Name:', bot.botName);
    console.log('Nomor:', phoneNumber);
    console.log('Durasi:', days, 'hari');
    console.log('Expired:', expiry.toLocaleDateString('id-ID'));
    console.log('');
    
    const confirm = await question('Lanjutkan? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('Dibatalkan');
      rl.close();
      return;
    }
    
    // Check if already exists
    const existing = await PremiumUser.findOne({
      where: { botId: botId, number: phoneNumber }
    });
    
    if (existing) {
      console.log('');
      console.log('⚠️  User sudah premium!');
      console.log('Expired saat ini:', new Date(existing.expiredAt).toLocaleDateString('id-ID'));
      console.log('');
      
      const update = await question('Update expired date? (y/n): ');
      if (update.toLowerCase() !== 'y') {
        console.log('Dibatalkan');
        rl.close();
        return;
      }
      
      await existing.update({ expiredAt: expiry });
      console.log('');
      console.log('✅ Premium updated!');
      console.log('Nomor:', phoneNumber);
      console.log('Expired baru:', expiry.toLocaleDateString('id-ID'));
    } else {
      // Create new
      await PremiumUser.create({
        botId: botId,
        number: phoneNumber,
        expiredAt: expiry
      });
      
      console.log('');
      console.log('✅ Premium added!');
      console.log('Nomor:', phoneNumber);
      console.log('Expired:', expiry.toLocaleDateString('id-ID'));
    }
    
    console.log('');
    console.log('=== SELESAI ===');
    console.log('');
    console.log('Sekarang test di WhatsApp:');
    console.log('1. Di PC: .cekpremium');
    console.log('2. Harusnya status premium sudah muncul!');
    console.log('');
    console.log('Jika masih BUKAN PREMIUM, berarti masalah ada di:');
    console.log('- Bot ID berbeda (cek dengan .listprem di group)');
    console.log('- Nomor berbeda (cek console log saat .cekpremium)');
    
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  }
  
  rl.close();
}

// Run
fixPremiumDirect()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
