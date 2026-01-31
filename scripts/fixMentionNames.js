/**
 * Fix Mention Names Script
 * Mengubah semua @{number} menjadi @{pushName} di seluruh codebase
 * 
 * BEFORE: @6283174020347
 * AFTER: @Argan (atau @6283174020347 jika tidak ada pushName)
 */

const fs = require('fs');
const path = require('path');

console.log('=== FIX MENTION NAMES ===\n');

// Files to fix
const filesToFix = [
  'services/botHandler.js',
  'services/bot/commands/group.js'
];

// Pattern to find and instructions
const fixes = [
  {
    file: 'services/botHandler.js',
    changes: [
      {
        description: 'Import getMentionName',
        find: `const { Filter, PremiumUser, Sewa } = require('../models');
const { CMD_META } = require('./bot/constants');
const { sequelize } = require('../config/database');`,
        replace: `const { Filter, PremiumUser, Sewa } = require('../models');
const { CMD_META } = require('./bot/constants');
const { sequelize } = require('../config/database');
const { getMentionName } = require('./bot/utils');`
      },
      {
        description: 'Fix blacklist kick mention',
        find: `          await sock.sendMessage(remoteJid, {
            text: \`🚫 @\${senderClean} telah di-kick karena masuk daftar blacklist!\`,
            mentions: [senderJid]
          });`,
        replace: `          const mentionName = getMentionName(groupMetadata, senderJid, senderClean);
          await sock.sendMessage(remoteJid, {
            text: \`🚫 @\${mentionName} telah di-kick karena masuk daftar blacklist!\`,
            mentions: [senderJid]
          });`
      },
      {
        description: 'Fix antilink warn mention',
        find: `        await sock.sendMessage(remoteJid, {
          text: \`⚠️ @\${senderNumber} jangan kirim link di grup ini!\`,
          mentions: [senderJid]
        });`,
        replace: `        const mentionName = getMentionName(groupMetadata, senderJid, senderNumber);
        await sock.sendMessage(remoteJid, {
          text: \`⚠️ @\${mentionName} jangan kirim link di grup ini!\`,
          mentions: [senderJid]
        });`
      },
      {
        description: 'Fix antilink kick mention',
        find: `          await sock.sendMessage(remoteJid, {
            text: \`🚫 @\${senderNumber} dikick karena mengirim link!\`,
            mentions: [senderJid]
          });`,
        replace: `          const mentionName = getMentionName(groupMetadata, senderJid, senderNumber);
          await sock.sendMessage(remoteJid, {
            text: \`🚫 @\${mentionName} dikick karena mengirim link!\`,
            mentions: [senderJid]
          });`
      },
      {
        description: 'Fix antiwame warn mention',
        find: `        await sock.sendMessage(remoteJid, {
          text: \`⚠️ @\${senderNumber} jangan kirim link wa.me di grup ini!\`,
          mentions: [senderJid]
        });`,
        replace: `        const mentionName = getMentionName(groupMetadata, senderJid, senderNumber);
        await sock.sendMessage(remoteJid, {
          text: \`⚠️ @\${mentionName} jangan kirim link wa.me di grup ini!\`,
          mentions: [senderJid]
        });`
      },
      {
        description: 'Fix antiwame kick mention',
        find: `          await sock.sendMessage(remoteJid, {
            text: \`🚫 @\${senderNumber} dikick karena mengirim link wa.me!\`,
            mentions: [senderJid]
          });`,
        replace: `          const mentionName = getMentionName(groupMetadata, senderJid, senderNumber);
          await sock.sendMessage(remoteJid, {
            text: \`🚫 @\${mentionName} dikick karena mengirim link wa.me!\`,
            mentions: [senderJid]
          });`
      },
      {
        description: 'Fix antilinkchannel mention',
        find: `      await sock.sendMessage(remoteJid, {
        text: \`⚠️ @\${senderNumber} jangan kirim link channel di grup ini!\`,
        mentions: [senderJid]
      });`,
        replace: `      const mentionName = getMentionName(groupMetadata, senderJid, senderNumber);
      await sock.sendMessage(remoteJid, {
        text: \`⚠️ @\${mentionName} jangan kirim link channel di grup ini!\`,
        mentions: [senderJid]
      });`
      },
      {
        description: 'Fix antibadword warn mention',
        find: `        await sock.sendMessage(remoteJid, {
          text: \`⚠️ @\${senderNumber} jangan menggunakan kata kasar!\`,
          mentions: [senderJid]
        });`,
        replace: `        const mentionName = getMentionName(groupMetadata, senderJid, senderNumber);
        await sock.sendMessage(remoteJid, {
          text: \`⚠️ @\${mentionName} jangan menggunakan kata kasar!\`,
          mentions: [senderJid]
        });`
      },
      {
        description: 'Fix antibadword kick mention',
        find: `          await sock.sendMessage(remoteJid, {
            text: \`🚫 @\${senderNumber} dikick karena kata kasar!\`,
            mentions: [senderJid]
          });`,
        replace: `          const mentionName = getMentionName(groupMetadata, senderJid, senderNumber);
          await sock.sendMessage(remoteJid, {
            text: \`🚫 @\${mentionName} dikick karena kata kasar!\`,
            mentions: [senderJid]
          });`
      },
      {
        description: 'Fix antisticker mention',
        find: `    await sock.sendMessage(remoteJid, {
      text: \`⚠️ @\${senderNumber} sticker tidak diperbolehkan di grup ini!\`,
      mentions: [senderJid]
    });`,
        replace: `    const mentionName = getMentionName(groupMetadata, senderJid, senderNumber);
    await sock.sendMessage(remoteJid, {
      text: \`⚠️ @\${mentionName} sticker tidak diperbolehkan di grup ini!\`,
      mentions: [senderJid]
    });`
      },
      {
        description: 'Fix antiviewonce mention',
        find: `      await sock.sendMessage(remoteJid, {
        text: \`⚠️ @\${senderNumber} view once message tidak diperbolehkan di grup ini!\`,
        mentions: [senderJid]
      });`,
        replace: `      const mentionName = getMentionName(groupMetadata, senderJid, senderNumber);
      await sock.sendMessage(remoteJid, {
        text: \`⚠️ @\${mentionName} view once message tidak diperbolehkan di grup ini!\`,
        mentions: [senderJid]
      });`
      },
      {
        description: 'Fix antispam mention',
        find: `    await sock.sendMessage(remoteJid, {
      text: \`⚠️ @\${senderNumber} terdeteksi spam! Harap jangan spam.\`,
      mentions: [senderJid]
    });`,
        replace: `    const mentionName = getMentionName(groupMetadata, senderJid, senderNumber);
    await sock.sendMessage(remoteJid, {
      text: \`⚠️ @\${mentionName} terdeteksi spam! Harap jangan spam.\`,
      mentions: [senderJid]
    });`
      },
      {
        description: 'Fix AFK exit mention',
        find: `          await sock.sendMessage(remoteJid, {
            text: \`✅ @\${senderNumber} sudah tidak AFK lagi!\\n\\nDurasi AFK: \${hours}j \${minutes}m\\nAlasan: \${afkData.reason}\`,
            mentions: [sender]
          });`,
        replace: `          const mentionName = getMentionName(groupMetadata, sender, senderNumber);
          await sock.sendMessage(remoteJid, {
            text: \`✅ @\${mentionName} sudah tidak AFK lagi!\\n\\nDurasi AFK: \${hours}j \${minutes}m\\nAlasan: \${afkData.reason}\`,
            mentions: [sender]
          });`
      }
    ]
  },
  {
    file: 'services/bot/commands/group.js',
    changes: [
      {
        description: 'Fix AFK command mention',
        find: `    await sock.sendMessage(remoteJid, { 
      text: \`💤 *AFK MODE AKTIF*\\n\\n@\${senderNumber} sekarang AFK\\nAlasan: \${reason}\\n\\n⚠️ Bot tidak akan mention kamu di tagall/hidetag/totag\\n⚠️ Mention manual dari user lain akan dihapus otomatis\`,
      mentions: [sender]
    });`,
        replace: `    const { getMentionName } = require('../utils');
    const groupMetadata = await sock.groupMetadata(remoteJid);
    const mentionName = getMentionName(groupMetadata, sender, senderNumber);
    
    await sock.sendMessage(remoteJid, { 
      text: \`💤 *AFK MODE AKTIF*\\n\\n@\${mentionName} sekarang AFK\\nAlasan: \${reason}\\n\\n⚠️ Bot tidak akan mention kamu di tagall/hidetag/totag\\n⚠️ Mention manual dari user lain akan dihapus otomatis\`,
      mentions: [sender]
    });`
      }
    ]
  }
];

console.log('This script will show you what needs to be fixed.');
console.log('Due to complexity, manual fixes are recommended.\n');

for (const fix of fixes) {
  console.log(`\n📁 File: ${fix.file}`);
  console.log('─'.repeat(60));
  
  for (let i = 0; i < fix.changes.length; i++) {
    const change = fix.changes[i];
    console.log(`\n${i + 1}. ${change.description}`);
    console.log('\n   FIND:');
    console.log('   ' + change.find.split('\n').join('\n   '));
    console.log('\n   REPLACE WITH:');
    console.log('   ' + change.replace.split('\n').join('\n   '));
  }
}

console.log('\n\n=== SUMMARY ===');
console.log('Total files to fix: ' + fixes.length);
console.log('Total changes: ' + fixes.reduce((sum, f) => sum + f.changes.length, 0));
console.log('\n✅ Review complete!');
console.log('\n💡 TIP: Use strReplace tool to apply these changes one by one.');
