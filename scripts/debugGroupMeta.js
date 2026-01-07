/**
 * Debug group metadata structure
 */

const { createSession, getSession } = require('../services/whatsapp');

async function debug() {
  try {
    // Get existing session for bot 2
    const sock = getSession(2);
    
    if (!sock) {
      console.log('Bot 2 not connected');
      process.exit(1);
    }
    
    // Get a group metadata
    const groupId = '120363044394558328@g.us'; // From log
    
    console.log('Fetching group metadata for:', groupId);
    const meta = await sock.groupMetadata(groupId);
    
    console.log('\n=== Group Info ===');
    console.log('Subject:', meta.subject);
    console.log('Participants count:', meta.participants.length);
    
    console.log('\n=== First 3 Participants ===');
    meta.participants.slice(0, 3).forEach((p, i) => {
      console.log(`\nParticipant ${i + 1}:`);
      console.log(JSON.stringify(p, null, 2));
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

debug();
