require('dotenv').config();
const { sequelize } = require('../config/database');
const { User } = require('../models');

async function createPremiumUser() {
  try {
    await sequelize.sync();
    
    // Check if user exists
    let user = await User.findOne({ where: { email: 'arionakamura1310@gmail.com' } });
    
    if (user) {
      // Update existing user to premium
      await user.update({ 
        plan: 'enterprise',
        quota: 999999,
        emailVerified: true
      });
      console.log('✅ User updated to Premium Permanent!');
    } else {
      // Create new user
      user = await User.create({
        name: 'Arion Akamura',
        email: 'arionakamura1310@gmail.com',
        password: 'admin123', // Change this!
        plan: 'enterprise',
        quota: 999999,
        emailVerified: true
      });
      console.log('✅ Premium user created!');
    }
    
    console.log('📧 Email:', user.email);
    console.log('🔑 API Key:', user.apiKey);
    console.log('👑 Plan:', user.plan);
    console.log('');
    console.log('Login dengan Google atau gunakan password: admin123');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createPremiumUser();
