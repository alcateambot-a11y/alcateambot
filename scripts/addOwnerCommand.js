const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'services', 'botHandler.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find the info command and add owner after it
const infoCommand = `  info: async (sock, msg, args, bot) => { 
    const uptime = Date.now() - startTime; 
    const h = Math.floor(uptime / 3600000), m = Math.floor((uptime % 3600000) / 60000), s = Math.floor((uptime % 60000) / 1000); 
    const usedPrefix = bot.usedPrefix || bot.prefix || '!';
    await sock.sendMessage(msg.key.remoteJid, { text: \`*BOT INFO*\\n\\nBot: \${bot.botName || 'Bot'}\\nPrefix: \${usedPrefix}\\nRuntime: \${h}h \${m}m \${s}s\` }); 
  },`;

const newInfoAndOwner = `  info: async (sock, msg, args, bot) => { 
    const uptime = Date.now() - startTime; 
    const h = Math.floor(uptime / 3600000), m = Math.floor((uptime % 3600000) / 60000), s = Math.floor((uptime % 60000) / 1000); 
    const usedPrefix = bot.usedPrefix || bot.prefix || '!';
    await sock.sendMessage(msg.key.remoteJid, { text: \`*BOT INFO*\\n\\nBot: \${bot.botName || 'Bot'}\\nPrefix: \${usedPrefix}\\nRuntime: \${h}h \${m}m \${s}s\` }); 
  },
  owner: async (sock, msg, args, bot) => {
    try {
      const owners = JSON.parse(bot.owners || '[]');
      if (!owners.length) {
        return sock.sendMessage(msg.key.remoteJid, { text: '❌ Owner belum diset' });
      }
      const contacts = owners.map(owner => {
        const number = (owner.number || '').replace(/\\D/g, '');
        const name = owner.name || 'Owner';
        return {
          vcard: \`BEGIN:VCARD\\nVERSION:3.0\\nFN:\${name}\\nTEL;type=CELL;type=VOICE;waid=\${number}:+\${number}\\nEND:VCARD\`
        };
      });
      await sock.sendMessage(msg.key.remoteJid, { 
        contacts: { 
          displayName: owners.length > 1 ? \`\${owners.length} Owner\` : owners[0].name || 'Owner',
          contacts 
        } 
      });
    } catch (err) {
      console.error('Owner command error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengirim kontak owner' });
    }
  },`;

if (content.includes(infoCommand)) {
  content = content.replace(infoCommand, newInfoAndOwner);
  fs.writeFileSync(filePath, content);
  console.log('Owner command added successfully!');
} else {
  console.log('Info command not found, trying alternative...');
  
  // Try to find slot command and add owner before it
  const slotStart = content.indexOf('  slot: async');
  if (slotStart > 0) {
    const ownerCmd = `  owner: async (sock, msg, args, bot) => {
    try {
      const owners = JSON.parse(bot.owners || '[]');
      if (!owners.length) {
        return sock.sendMessage(msg.key.remoteJid, { text: '❌ Owner belum diset' });
      }
      const contacts = owners.map(owner => {
        const number = (owner.number || '').replace(/\\D/g, '');
        const name = owner.name || 'Owner';
        return {
          vcard: \`BEGIN:VCARD\\nVERSION:3.0\\nFN:\${name}\\nTEL;type=CELL;type=VOICE;waid=\${number}:+\${number}\\nEND:VCARD\`
        };
      });
      await sock.sendMessage(msg.key.remoteJid, { 
        contacts: { 
          displayName: owners.length > 1 ? \`\${owners.length} Owner\` : owners[0].name || 'Owner',
          contacts 
        } 
      });
    } catch (err) {
      console.error('Owner command error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengirim kontak owner' });
    }
  },
`;
    content = content.slice(0, slotStart) + ownerCmd + content.slice(slotStart);
    fs.writeFileSync(filePath, content);
    console.log('Owner command added before slot!');
  } else {
    console.log('Could not find insertion point');
  }
}

// Verify
const verify = fs.readFileSync(filePath, 'utf8');
console.log('Has owner command:', verify.includes('owner: async'));
