/**
 * Update Existing Premium Users with LID
 * Update LID untuk premium users yang sudah ada
 */

const { PremiumUser } = require('../models');

async function updateExistingPremiumLID() {
  console.log('=== UPDATE EXISTING PREMIUM LID ===\n');
  
  try {
    // Get all premium users without LID
    const users = await PremiumUser.findAll({
      where: { lid: null }
    });
    
    console.log(`Found ${users.length} premium users without LID\n`);
    
    if (users.length === 0) {
      console.log('✅ All premium users already have LID!');
      return;
    }
    
    console.log('⚠️  Untuk update LID, kamu perlu re-add premium di group:');
    console.log('');
    
    users.forEach((u, i) => {
      console.log(`${i + 1}. Number: ${u.number}`);
      console.log(`   Bot ID: ${u.botId}`);
      console.log(`   Expired: ${new Date(u.expiredAt).toLocaleDateString('id-ID')}`);
      console.log(`   Command: .delprem ${u.number}`);
      console.log(`            .addprem @user 30d`);
      console.log('');
    });
    
    console.log('Atau, jika kamu tahu LID user, bisa update manual:');
    console.log('');
    console.log('const { PremiumUser } = require(\'./models\');');
    console.log('await PremiumUser.update(');
    console.log('  { lid: \'133882938687653\' },');
    console.log('  { where: { botId: 2, number: \'628997990103\' } }');
    console.log(');');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Run
updateExistingPremiumLID()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
