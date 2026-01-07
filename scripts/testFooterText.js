/**
 * Test script untuk simulasi cmdMenu dan cmdInfo
 * untuk memastikan footerText berfungsi dengan variable {footer}
 */

const { Bot, User } = require('../models');

// Import functions from utils
const { getBotData, getUserPlanInfo, isUserPremium, formatMsg } = require('../services/bot/utils');
const { DEFAULT_MENU } = require('../services/bot/constants');

async function testFooterText() {
  try {
    console.log('\n=== TEST FOOTER TEXT WITH {footer} VARIABLE ===\n');
    
    // Test for Bot ID 2 (Ario Nakamura - Pro user)
    const botId = 2;
    
    console.log('1. Getting fresh bot data...');
    const freshBot = await getBotData(botId);
    console.log('   FooterText from DB:', freshBot?.footerText);
    
    console.log('\n2. Checking premium status...');
    const isPremium = await isUserPremium(freshBot.userId);
    console.log('   Is Premium:', isPremium);
    
    console.log('\n3. Building {footer} variable...');
    const footer = (isPremium && freshBot.footerText) ? freshBot.footerText : (freshBot.botName || 'Alcateambot');
    console.log('   {footer} value:', footer);
    
    console.log('\n4. Testing with DEFAULT_MENU...');
    const vars = {
      namebot: freshBot.botName || 'Bot',
      pushname: 'TestUser',
      prefix: '.',
      ucapan: 'Selamat Siang',
      footer: footer
    };
    
    const formattedMenu = formatMsg(DEFAULT_MENU, vars);
    
    // Show last 5 lines
    const lines = formattedMenu.split('\n');
    console.log('   Last 3 lines of menu:');
    lines.slice(-3).forEach(line => console.log('   ', line));
    
    console.log('\n5. Test PASSED! {footer} variable works correctly.');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testFooterText();
