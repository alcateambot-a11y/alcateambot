/**
 * Script untuk update menuText di database dengan template baru yang include {footer}
 */

const { Bot } = require('../models');

const newMenuTemplate = `*⊱ ━━━━━━━━ ⊰*
*• ✦ ABOUT ✦ •*
*>> Tanggal:* {tanggal} 📅
*>> Hari:* {hari} 🗓
*>> Waktu:* {ucapan} ⏰
*>> Bot Name:* {namebot} 🏷
*>> Prefix:* {prefix} 🔧

*⊱ ━━━━━━━━ ⊰*
*• ✦ INFO ✦ •*
┃ ◈ {prefix}menu
┃ ◈ {prefix}ping
┃ ◈ {prefix}info
┃ ◈ {prefix}owner

*⊱ ━━━━━━━━ ⊰*
*• ✦ GAMES ✦ •*
┃ ◈ {prefix}slot
┃ ◈ {prefix}dice
┃ ◈ {prefix}flip
┃ ◈ {prefix}rps
┃ ◈ {prefix}tebakgambar
┃ ◈ {prefix}truth
┃ ◈ {prefix}dare

*⊱ ━━━━━━━━ ⊰*
*• ✦ FUN ✦ •*
┃ ◈ {prefix}fakta
┃ ◈ {prefix}quote
┃ ◈ {prefix}motivasi
┃ ◈ {prefix}jokes
┃ ◈ {prefix}meme
┃ ◈ {prefix}pantun

*⊱ ━━━━━━━━ ⊰*
*• ✦ ANIME ✦ •*
┃ ◈ {prefix}waifu
┃ ◈ {prefix}neko
┃ ◈ {prefix}shinobu
┃ ◈ {prefix}husbu

*⊱ ━━━━━━━━ ⊰*
*• ✦ STICKER ✦ •*
┃ ◈ {prefix}sticker
┃ ◈ {prefix}scircle
┃ ◈ {prefix}srounded
┃ ◈ {prefix}toimg

*⊱ ━━━━━━━━ ⊰*
*• ✦ TOOLS ✦ •*
┃ ◈ {prefix}calc
┃ ◈ {prefix}qr
┃ ◈ {prefix}translate
┃ ◈ {prefix}tts

*⊱ ━━━━━━━━ ⊰*
*• ✦ DOWNLOADER ✦ •*
┃ ◈ {prefix}tiktok
┃ ◈ {prefix}instagram
┃ ◈ {prefix}play
┃ ◈ {prefix}pinterest

*⊱ ━━━━━━━━ ⊰*
*• ✦ GROUP ✦ •*
┃ ◈ {prefix}kick
┃ ◈ {prefix}add
┃ ◈ {prefix}promote
┃ ◈ {prefix}demote
┃ ◈ {prefix}hidetag
┃ ◈ {prefix}tagall
┃ ◈ {prefix}linkgrup
┃ ◈ {prefix}infogrup

*⊱ ━━━━━━━━ ⊰*
_{footer}_`;

async function fixMenuText() {
  try {
    console.log('\n=== CHECKING MENU TEXT IN DATABASE ===\n');
    
    const bots = await Bot.findAll();
    
    for (const bot of bots) {
      console.log(`Bot ID ${bot.id}:`);
      console.log(`  Current menuText has {footer}:`, bot.menuText?.includes('{footer}') || false);
      
      // Check if menuText contains {footer}
      if (!bot.menuText || !bot.menuText.includes('{footer}')) {
        console.log(`  -> Updating menuText to include {footer}...`);
        await bot.update({ menuText: newMenuTemplate });
        console.log(`  -> DONE!`);
      } else {
        console.log(`  -> Already has {footer}, skipping.`);
      }
    }
    
    console.log('\n=== VERIFICATION ===\n');
    const updatedBots = await Bot.findAll();
    for (const bot of updatedBots) {
      const lastLines = bot.menuText?.split('\n').slice(-3).join('\n');
      console.log(`Bot ID ${bot.id} - Last 3 lines:`);
      console.log(lastLines);
      console.log('---');
    }
    
    console.log('\nDone! Restart server and try .menu command.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixMenuText();
