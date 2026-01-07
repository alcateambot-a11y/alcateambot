/**
 * Werewolf Game - Game Mafia/Werewolf untuk WhatsApp Bot
 * 
 * Commands:
 * - .ww / .werewolf - Buat room game baru
 * - .joinww - Join ke room game
 * - .startww - Mulai game (host only)
 * - .vote @user - Vote untuk eksekusi (siang hari)
 * - .skill @user - Gunakan skill (malam hari, via PM)
 * - .leaveww - Keluar dari game
 * - .endww - Akhiri game (host only)
 * - .infoww - Info game & pemain
 * 
 * Roles:
 * - 🐺 Werewolf - Membunuh 1 orang setiap malam
 * - 👁️ Seer - Melihat role 1 orang setiap malam
 * - 💉 Doctor - Melindungi 1 orang setiap malam
 * - 🏹 Hunter - Jika mati, bisa membunuh 1 orang
 * - 💑 Cupid - Di awal game, memilih 2 orang jadi lovers
 * - 👻 Medium - Bisa berkomunikasi dengan pemain mati
 * - 🧙 Witch - Punya 1 ramuan hidup & 1 ramuan mati
 * - 👤 Villager - Warga biasa
 */

// Store active games per group
const activeGames = new Map();

// Role definitions
const ROLES = {
  WEREWOLF: { name: 'Werewolf', emoji: '🐺', team: 'wolf', description: 'Membunuh 1 warga setiap malam' },
  SEER: { name: 'Seer', emoji: '👁️', team: 'village', description: 'Melihat role 1 orang setiap malam' },
  DOCTOR: { name: 'Doctor', emoji: '💉', team: 'village', description: 'Melindungi 1 orang setiap malam' },
  HUNTER: { name: 'Hunter', emoji: '🏹', team: 'village', description: 'Jika mati, bisa membunuh 1 orang' },
  CUPID: { name: 'Cupid', emoji: '💑', team: 'village', description: 'Memilih 2 orang jadi lovers di awal' },
  WITCH: { name: 'Witch', emoji: '🧙', team: 'village', description: 'Punya 1 ramuan hidup & 1 ramuan mati' },
  VILLAGER: { name: 'Villager', emoji: '👤', team: 'village', description: 'Warga biasa tanpa kemampuan khusus' }
};

// Game phases
const PHASE = {
  LOBBY: 'lobby',
  NIGHT: 'night',
  DAY: 'day',
  VOTING: 'voting',
  ENDED: 'ended'
};

// Role distribution based on player count
function getRoleDistribution(playerCount) {
  if (playerCount < 4) return null;
  
  const distributions = {
    4: ['WEREWOLF', 'SEER', 'VILLAGER', 'VILLAGER'],
    5: ['WEREWOLF', 'SEER', 'DOCTOR', 'VILLAGER', 'VILLAGER'],
    6: ['WEREWOLF', 'WEREWOLF', 'SEER', 'DOCTOR', 'VILLAGER', 'VILLAGER'],
    7: ['WEREWOLF', 'WEREWOLF', 'SEER', 'DOCTOR', 'HUNTER', 'VILLAGER', 'VILLAGER'],
    8: ['WEREWOLF', 'WEREWOLF', 'SEER', 'DOCTOR', 'HUNTER', 'WITCH', 'VILLAGER', 'VILLAGER'],
    9: ['WEREWOLF', 'WEREWOLF', 'SEER', 'DOCTOR', 'HUNTER', 'WITCH', 'CUPID', 'VILLAGER', 'VILLAGER'],
    10: ['WEREWOLF', 'WEREWOLF', 'WEREWOLF', 'SEER', 'DOCTOR', 'HUNTER', 'WITCH', 'CUPID', 'VILLAGER', 'VILLAGER'],
    11: ['WEREWOLF', 'WEREWOLF', 'WEREWOLF', 'SEER', 'DOCTOR', 'HUNTER', 'WITCH', 'CUPID', 'VILLAGER', 'VILLAGER', 'VILLAGER'],
    12: ['WEREWOLF', 'WEREWOLF', 'WEREWOLF', 'SEER', 'DOCTOR', 'HUNTER', 'WITCH', 'CUPID', 'VILLAGER', 'VILLAGER', 'VILLAGER', 'VILLAGER']
  };
  
  return distributions[Math.min(playerCount, 12)] || distributions[12];
}

// Shuffle array
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Create new game
async function cmdWerewolf(sock, msg, bot, args, { sender, pushName, isGroup, usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Game Werewolf hanya bisa dimainkan di grup!' });
  }
  
  if (activeGames.has(remoteJid)) {
    const game = activeGames.get(remoteJid);
    if (game.phase !== PHASE.ENDED) {
      return await sock.sendMessage(remoteJid, { 
        text: `❌ Sudah ada game yang sedang berjalan!\n\nKetik ${usedPrefix}infoww untuk melihat info game\nKetik ${usedPrefix}joinww untuk bergabung` 
      });
    }
  }
  
  // Create new game
  const game = {
    groupId: remoteJid,
    host: sender,
    hostName: pushName,
    players: new Map(),
    phase: PHASE.LOBBY,
    day: 0,
    votes: new Map(),
    nightActions: new Map(),
    deadPlayers: [],
    lovers: [],
    witchPotions: { heal: true, kill: true },
    hunterTarget: null,
    lastKilled: null,
    createdAt: Date.now()
  };
  
  // Add host as first player
  game.players.set(sender, {
    jid: sender,
    name: pushName,
    role: null,
    alive: true,
    protected: false
  });
  
  activeGames.set(remoteJid, game);

  const text = `🐺 *WEREWOLF GAME* 🐺

🎮 Room dibuat oleh @${sender.split('@')[0]}

📋 *Cara Bermain:*
• Ketik ${usedPrefix}joinww untuk bergabung
• Minimal 4 pemain, maksimal 12 pemain
• Host ketik ${usedPrefix}startww untuk mulai

👥 *Pemain (1/12):*
1. @${sender.split('@')[0]} 👑 (Host)

⏰ Room akan otomatis ditutup dalam 5 menit jika tidak dimulai`;

  await sock.sendMessage(remoteJid, { text, mentions: [sender] });
  
  // Auto close after 5 minutes if not started
  setTimeout(() => {
    const g = activeGames.get(remoteJid);
    if (g && g.phase === PHASE.LOBBY && g.createdAt === game.createdAt) {
      activeGames.delete(remoteJid);
      sock.sendMessage(remoteJid, { text: '⏰ Room Werewolf ditutup karena tidak dimulai dalam 5 menit.' });
    }
  }, 5 * 60 * 1000);
}

// Join game
async function cmdJoinWW(sock, msg, bot, args, { sender, pushName, isGroup, usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  if (!isGroup) {
    return await sock.sendMessage(remoteJid, { text: '❌ Game Werewolf hanya bisa dimainkan di grup!' });
  }
  
  const game = activeGames.get(remoteJid);
  if (!game || game.phase === PHASE.ENDED) {
    return await sock.sendMessage(remoteJid, { text: `❌ Tidak ada room game!\n\nKetik ${usedPrefix}ww untuk membuat room baru` });
  }
  
  if (game.phase !== PHASE.LOBBY) {
    return await sock.sendMessage(remoteJid, { text: '❌ Game sudah dimulai! Tunggu game selesai.' });
  }
  
  if (game.players.has(sender)) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu sudah bergabung!' });
  }
  
  if (game.players.size >= 12) {
    return await sock.sendMessage(remoteJid, { text: '❌ Room sudah penuh! (Maksimal 12 pemain)' });
  }
  
  game.players.set(sender, {
    jid: sender,
    name: pushName,
    role: null,
    alive: true,
    protected: false
  });
  
  const playerList = Array.from(game.players.values())
    .map((p, i) => `${i + 1}. @${p.jid.split('@')[0]}${p.jid === game.host ? ' 👑' : ''}`)
    .join('\n');
  
  const mentions = Array.from(game.players.keys());
  
  await sock.sendMessage(remoteJid, {
    text: `✅ @${sender.split('@')[0]} bergabung!\n\n👥 *Pemain (${game.players.size}/12):*\n${playerList}\n\n${game.players.size >= 4 ? `✅ Sudah cukup pemain! Host bisa ketik ${usedPrefix}startww` : `⏳ Butuh ${4 - game.players.size} pemain lagi`}`,
    mentions
  });
}

// Leave game
async function cmdLeaveWW(sock, msg, bot, args, { sender, isGroup, usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  if (!isGroup) return;
  
  const game = activeGames.get(remoteJid);
  if (!game || game.phase === PHASE.ENDED) {
    return await sock.sendMessage(remoteJid, { text: '❌ Tidak ada game yang sedang berjalan!' });
  }
  
  if (!game.players.has(sender)) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu tidak ada di dalam game!' });
  }
  
  if (game.phase !== PHASE.LOBBY) {
    // If game already started, mark as dead instead of removing
    const player = game.players.get(sender);
    player.alive = false;
    game.deadPlayers.push(sender);
    
    await sock.sendMessage(remoteJid, { 
      text: `💀 @${sender.split('@')[0]} keluar dari game dan dianggap mati!`,
      mentions: [sender]
    });
    
    // Check win condition
    await checkWinCondition(sock, remoteJid, game, usedPrefix);
    return;
  }
  
  // If host leaves in lobby, end the game
  if (sender === game.host) {
    activeGames.delete(remoteJid);
    return await sock.sendMessage(remoteJid, { text: '❌ Host keluar! Room game ditutup.' });
  }
  
  game.players.delete(sender);
  await sock.sendMessage(remoteJid, { 
    text: `👋 @${sender.split('@')[0]} keluar dari room.\n\n👥 Pemain tersisa: ${game.players.size}`,
    mentions: [sender]
  });
}

// Start game
async function cmdStartWW(sock, msg, bot, args, { sender, isGroup, usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  if (!isGroup) return;
  
  const game = activeGames.get(remoteJid);
  if (!game || game.phase === PHASE.ENDED) {
    return await sock.sendMessage(remoteJid, { text: `❌ Tidak ada room game!\n\nKetik ${usedPrefix}ww untuk membuat room baru` });
  }
  
  if (sender !== game.host) {
    return await sock.sendMessage(remoteJid, { text: '❌ Hanya host yang bisa memulai game!' });
  }
  
  if (game.phase !== PHASE.LOBBY) {
    return await sock.sendMessage(remoteJid, { text: '❌ Game sudah dimulai!' });
  }
  
  if (game.players.size < 4) {
    return await sock.sendMessage(remoteJid, { text: `❌ Minimal 4 pemain untuk memulai!\n\nPemain saat ini: ${game.players.size}` });
  }
  
  // Assign roles
  const roles = getRoleDistribution(game.players.size);
  const shuffledRoles = shuffle(roles);
  const playerArray = Array.from(game.players.values());
  
  playerArray.forEach((player, index) => {
    player.role = shuffledRoles[index];
  });
  
  game.phase = PHASE.NIGHT;
  game.day = 1;
  
  // Send role to each player via DM
  for (const player of playerArray) {
    const role = ROLES[player.role];
    try {
      await sock.sendMessage(player.jid, {
        text: `🎭 *ROLE KAMU*\n\n${role.emoji} *${role.name}*\n📝 ${role.description}\n\n${role.team === 'wolf' ? '🐺 Kamu adalah Werewolf! Bunuh semua warga!' : '🏘️ Kamu adalah tim Village! Temukan dan bunuh semua Werewolf!'}`
      });
    } catch (e) {
      console.log('Could not send DM to', player.jid);
    }
  }

  // Count roles
  const roleCount = {};
  playerArray.forEach(p => {
    const roleName = ROLES[p.role].name;
    roleCount[roleName] = (roleCount[roleName] || 0) + 1;
  });
  
  const roleList = Object.entries(roleCount)
    .map(([name, count]) => `• ${count}x ${name}`)
    .join('\n');
  
  const mentions = Array.from(game.players.keys());
  
  await sock.sendMessage(remoteJid, {
    text: `🐺 *GAME DIMULAI!* 🐺

📋 *Role yang ada:*
${roleList}

📩 Cek DM untuk melihat role kamu!

🌙 *MALAM HARI KE-1*
Semua pemain tidur...

⏰ Werewolf dan role khusus, gunakan skill kalian!
Ketik ${usedPrefix}skill @target di DM bot untuk menggunakan skill.

⏳ Fase malam berakhir dalam 60 detik...`,
    mentions
  });
  
  // Night phase timer
  setTimeout(async () => {
    const g = activeGames.get(remoteJid);
    if (g && g.phase === PHASE.NIGHT && g.day === game.day) {
      await processNightActions(sock, remoteJid, g, usedPrefix);
    }
  }, 60 * 1000);
}

// Process night actions
async function processNightActions(sock, remoteJid, game, usedPrefix) {
  game.phase = PHASE.DAY;
  
  let nightReport = `☀️ *PAGI HARI KE-${game.day}*\n\nMatahari terbit, warga bangun...\n\n`;
  
  // Get werewolf target
  const wolfVotes = new Map();
  for (const [actorJid, action] of game.nightActions) {
    const actor = game.players.get(actorJid);
    if (actor && actor.role === 'WEREWOLF' && action.type === 'kill') {
      const count = wolfVotes.get(action.target) || 0;
      wolfVotes.set(action.target, count + 1);
    }
  }
  
  // Find most voted target by wolves
  let wolfTarget = null;
  let maxVotes = 0;
  for (const [target, votes] of wolfVotes) {
    if (votes > maxVotes) {
      maxVotes = votes;
      wolfTarget = target;
    }
  }
  
  // Check if doctor protected
  let doctorTarget = null;
  for (const [actorJid, action] of game.nightActions) {
    const actor = game.players.get(actorJid);
    if (actor && actor.role === 'DOCTOR' && action.type === 'protect') {
      doctorTarget = action.target;
    }
  }
  
  // Check witch heal
  let witchHealTarget = null;
  let witchKillTarget = null;
  for (const [actorJid, action] of game.nightActions) {
    const actor = game.players.get(actorJid);
    if (actor && actor.role === 'WITCH') {
      if (action.type === 'heal') witchHealTarget = action.target;
      if (action.type === 'kill') witchKillTarget = action.target;
    }
  }

  const deaths = [];
  
  // Process wolf kill
  if (wolfTarget) {
    const victim = game.players.get(wolfTarget);
    if (victim && victim.alive) {
      const isProtected = doctorTarget === wolfTarget || witchHealTarget === wolfTarget;
      if (!isProtected) {
        victim.alive = false;
        game.deadPlayers.push(wolfTarget);
        game.lastKilled = wolfTarget;
        deaths.push({ jid: wolfTarget, name: victim.name, role: victim.role, cause: 'werewolf' });
      }
    }
  }
  
  // Process witch kill
  if (witchKillTarget) {
    const victim = game.players.get(witchKillTarget);
    if (victim && victim.alive) {
      victim.alive = false;
      game.deadPlayers.push(witchKillTarget);
      deaths.push({ jid: witchKillTarget, name: victim.name, role: victim.role, cause: 'witch' });
    }
  }
  
  // Check lovers death
  if (game.lovers.length === 2) {
    for (const death of [...deaths]) {
      if (game.lovers.includes(death.jid)) {
        const otherLover = game.lovers.find(l => l !== death.jid);
        const lover = game.players.get(otherLover);
        if (lover && lover.alive) {
          lover.alive = false;
          game.deadPlayers.push(otherLover);
          deaths.push({ jid: otherLover, name: lover.name, role: lover.role, cause: 'heartbreak' });
        }
      }
    }
  }
  
  // Process seer vision
  for (const [actorJid, action] of game.nightActions) {
    const actor = game.players.get(actorJid);
    if (actor && actor.role === 'SEER' && action.type === 'see') {
      const target = game.players.get(action.target);
      if (target) {
        const role = ROLES[target.role];
        try {
          await sock.sendMessage(actorJid, {
            text: `👁️ *HASIL PENGLIHATAN*\n\n@${action.target.split('@')[0]} adalah ${role.emoji} *${role.name}* (${role.team === 'wolf' ? '🐺 Werewolf!' : '🏘️ Village'})`,
            mentions: [action.target]
          });
        } catch (e) {}
      }
    }
  }
  
  // Clear night actions
  game.nightActions.clear();
  
  // Build death report
  if (deaths.length === 0) {
    nightReport += `🎉 *Tidak ada korban semalam!*\n\nSemua warga selamat.`;
  } else {
    nightReport += `💀 *Korban semalam:*\n`;
    for (const death of deaths) {
      const role = ROLES[death.role];
      let cause = '';
      if (death.cause === 'werewolf') cause = 'dibunuh Werewolf';
      else if (death.cause === 'witch') cause = 'diracun Witch';
      else if (death.cause === 'heartbreak') cause = 'mati karena patah hati (Lover)';
      
      nightReport += `• @${death.jid.split('@')[0]} - ${role.emoji} ${role.name} (${cause})\n`;
    }
  }
  
  // Check hunter revenge
  for (const death of deaths) {
    if (death.role === 'HUNTER') {
      game.hunterTarget = death.jid;
      nightReport += `\n🏹 *Hunter mati!* Hunter bisa memilih 1 orang untuk dibunuh.\nHunter ketik ${usedPrefix}skill @target`;
    }
  }

  const mentions = deaths.map(d => d.jid);
  await sock.sendMessage(remoteJid, { text: nightReport, mentions });
  
  // Check win condition
  const gameEnded = await checkWinCondition(sock, remoteJid, game, usedPrefix);
  if (gameEnded) return;
  
  // Start day phase voting
  game.phase = PHASE.VOTING;
  game.votes.clear();
  
  const alivePlayers = Array.from(game.players.values()).filter(p => p.alive);
  const aliveList = alivePlayers.map((p, i) => `${i + 1}. @${p.jid.split('@')[0]}`).join('\n');
  const aliveMentions = alivePlayers.map(p => p.jid);
  
  await sock.sendMessage(remoteJid, {
    text: `🗳️ *WAKTU VOTING*

Warga berkumpul untuk memilih siapa yang akan dieksekusi...

👥 *Pemain hidup:*
${aliveList}

📝 Ketik ${usedPrefix}vote @target untuk memilih
⏳ Voting berakhir dalam 90 detik...`,
    mentions: aliveMentions
  });
  
  // Voting timer
  setTimeout(async () => {
    const g = activeGames.get(remoteJid);
    if (g && g.phase === PHASE.VOTING && g.day === game.day) {
      await processVoting(sock, remoteJid, g, usedPrefix);
    }
  }, 90 * 1000);
}

// Vote command
async function cmdVote(sock, msg, bot, args, { sender, isGroup, usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  if (!isGroup) return;
  
  const game = activeGames.get(remoteJid);
  if (!game || game.phase !== PHASE.VOTING) {
    return await sock.sendMessage(remoteJid, { text: '❌ Tidak sedang dalam fase voting!' });
  }
  
  const player = game.players.get(sender);
  if (!player || !player.alive) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu tidak bisa vote (mati/tidak dalam game)!' });
  }
  
  // Get target from mention
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mentioned) {
    return await sock.sendMessage(remoteJid, { text: `❌ Tag pemain yang ingin di-vote!\n\nContoh: ${usedPrefix}vote @user` });
  }
  
  const target = game.players.get(mentioned);
  if (!target || !target.alive) {
    return await sock.sendMessage(remoteJid, { text: '❌ Target tidak valid atau sudah mati!' });
  }
  
  game.votes.set(sender, mentioned);
  
  // Count votes
  const voteCount = new Map();
  for (const [voter, target] of game.votes) {
    const count = voteCount.get(target) || 0;
    voteCount.set(target, count + 1);
  }
  
  let voteStatus = '📊 *Status Vote:*\n';
  for (const [target, count] of voteCount) {
    voteStatus += `• @${target.split('@')[0]}: ${count} vote\n`;
  }
  
  const alivePlayers = Array.from(game.players.values()).filter(p => p.alive);
  const votedCount = game.votes.size;
  
  await sock.sendMessage(remoteJid, {
    text: `✅ @${sender.split('@')[0]} memilih @${mentioned.split('@')[0]}\n\n${voteStatus}\n📝 ${votedCount}/${alivePlayers.length} sudah vote`,
    mentions: [sender, mentioned, ...Array.from(voteCount.keys())]
  });
  
  // If all alive players voted, process immediately
  if (votedCount >= alivePlayers.length) {
    await processVoting(sock, remoteJid, game, usedPrefix);
  }
}

// Process voting results
async function processVoting(sock, remoteJid, game, usedPrefix) {
  // Count votes
  const voteCount = new Map();
  for (const [voter, target] of game.votes) {
    const count = voteCount.get(target) || 0;
    voteCount.set(target, count + 1);
  }
  
  // Find most voted
  let maxVotes = 0;
  let executed = null;
  let tie = false;
  
  for (const [target, count] of voteCount) {
    if (count > maxVotes) {
      maxVotes = count;
      executed = target;
      tie = false;
    } else if (count === maxVotes) {
      tie = true;
    }
  }
  
  let resultText = `⚖️ *HASIL VOTING*\n\n`;
  
  if (game.votes.size === 0) {
    resultText += `Tidak ada yang vote! Tidak ada eksekusi hari ini.`;
  } else if (tie || !executed) {
    resultText += `Hasil seri! Tidak ada eksekusi hari ini.`;
  } else {
    const victim = game.players.get(executed);
    victim.alive = false;
    game.deadPlayers.push(executed);
    
    const role = ROLES[victim.role];
    resultText += `🪓 @${executed.split('@')[0]} dieksekusi oleh warga!\n\nRole: ${role.emoji} *${role.name}*`;
    
    // Check if hunter
    if (victim.role === 'HUNTER') {
      game.hunterTarget = executed;
      resultText += `\n\n🏹 *Hunter mati!* Hunter bisa memilih 1 orang untuk dibunuh.\nHunter ketik ${usedPrefix}skill @target`;
    }
    
    // Check lovers
    if (game.lovers.includes(executed)) {
      const otherLover = game.lovers.find(l => l !== executed);
      const lover = game.players.get(otherLover);
      if (lover && lover.alive) {
        lover.alive = false;
        game.deadPlayers.push(otherLover);
        const loverRole = ROLES[lover.role];
        resultText += `\n\n💔 @${otherLover.split('@')[0]} (${loverRole.emoji} ${loverRole.name}) mati karena patah hati!`;
      }
    }
  }
  
  const mentions = executed ? [executed] : [];
  if (game.lovers.length === 2) {
    mentions.push(...game.lovers);
  }
  
  await sock.sendMessage(remoteJid, { text: resultText, mentions });
  
  // Check win condition
  const gameEnded = await checkWinCondition(sock, remoteJid, game, usedPrefix);
  if (gameEnded) return;
  
  // Start next night
  game.phase = PHASE.NIGHT;
  game.day++;
  game.votes.clear();
  
  const alivePlayers = Array.from(game.players.values()).filter(p => p.alive);
  const aliveList = alivePlayers.map((p, i) => `${i + 1}. @${p.jid.split('@')[0]}`).join('\n');
  const aliveMentions = alivePlayers.map(p => p.jid);
  
  await sock.sendMessage(remoteJid, {
    text: `🌙 *MALAM HARI KE-${game.day}*

Matahari terbenam, warga tidur...

👥 *Pemain hidup:*
${aliveList}

⏰ Werewolf dan role khusus, gunakan skill kalian!
Ketik ${usedPrefix}skill @target di DM bot.

⏳ Fase malam berakhir dalam 60 detik...`,
    mentions: aliveMentions
  });
  
  // Night timer
  setTimeout(async () => {
    const g = activeGames.get(remoteJid);
    if (g && g.phase === PHASE.NIGHT && g.day === game.day) {
      await processNightActions(sock, remoteJid, g, usedPrefix);
    }
  }, 60 * 1000);
}

// Skill command (for night actions)
async function cmdSkill(sock, msg, bot, args, { sender, isGroup, usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  // Find which game this player is in
  let playerGame = null;
  let playerGroupId = null;
  
  for (const [groupId, game] of activeGames) {
    if (game.players.has(sender)) {
      playerGame = game;
      playerGroupId = groupId;
      break;
    }
  }
  
  if (!playerGame) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu tidak sedang dalam game Werewolf!' });
  }
  
  const player = playerGame.players.get(sender);
  if (!player || !player.alive) {
    return await sock.sendMessage(remoteJid, { text: '❌ Kamu sudah mati!' });
  }
  
  // Get target
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  let targetJid = mentioned;
  
  // If no mention, try to find from args (number)
  if (!targetJid && args.length > 0) {
    const targetNum = args[0].replace(/[^0-9]/g, '');
    if (targetNum) {
      targetJid = targetNum + '@s.whatsapp.net';
    }
  }
  
  if (!targetJid) {
    return await sock.sendMessage(remoteJid, { text: `❌ Tag target!\n\nContoh: ${usedPrefix}skill @user` });
  }
  
  const target = playerGame.players.get(targetJid);
  if (!target) {
    return await sock.sendMessage(remoteJid, { text: '❌ Target tidak ada dalam game!' });
  }
  
  const role = player.role;
  
  // Hunter revenge (can be used anytime after death)
  if (playerGame.hunterTarget === sender && role === 'HUNTER') {
    if (!target.alive) {
      return await sock.sendMessage(remoteJid, { text: '❌ Target sudah mati!' });
    }
    
    target.alive = false;
    playerGame.deadPlayers.push(targetJid);
    playerGame.hunterTarget = null;
    
    const targetRole = ROLES[target.role];
    await sock.sendMessage(playerGroupId, {
      text: `🏹 *HUNTER'S REVENGE*\n\n@${sender.split('@')[0]} (Hunter) membunuh @${targetJid.split('@')[0]} (${targetRole.emoji} ${targetRole.name}) sebelum mati!`,
      mentions: [sender, targetJid]
    });
    
    await checkWinCondition(sock, playerGroupId, playerGame, usedPrefix);
    return;
  }
  
  // Night phase skills
  if (playerGame.phase !== PHASE.NIGHT) {
    return await sock.sendMessage(remoteJid, { text: '❌ Skill hanya bisa digunakan saat malam!' });
  }
  
  // Process based on role
  switch (role) {
    case 'WEREWOLF':
      if (!target.alive) {
        return await sock.sendMessage(remoteJid, { text: '❌ Target sudah mati!' });
      }
      playerGame.nightActions.set(sender, { type: 'kill', target: targetJid });
      await sock.sendMessage(remoteJid, { text: `🐺 Kamu memilih untuk membunuh @${targetJid.split('@')[0]}`, mentions: [targetJid] });
      break;
      
    case 'SEER':
      playerGame.nightActions.set(sender, { type: 'see', target: targetJid });
      await sock.sendMessage(remoteJid, { text: `👁️ Kamu akan melihat role @${targetJid.split('@')[0]} saat pagi`, mentions: [targetJid] });
      break;
      
    case 'DOCTOR':
      playerGame.nightActions.set(sender, { type: 'protect', target: targetJid });
      await sock.sendMessage(remoteJid, { text: `💉 Kamu melindungi @${targetJid.split('@')[0]} malam ini`, mentions: [targetJid] });
      break;
      
    case 'WITCH':
      // Witch can heal or kill
      const action = args[0]?.toLowerCase();
      if (action === 'heal' || action === 'h') {
        if (!playerGame.witchPotions.heal) {
          return await sock.sendMessage(remoteJid, { text: '❌ Ramuan penyembuh sudah habis!' });
        }
        playerGame.nightActions.set(sender, { type: 'heal', target: targetJid });
        playerGame.witchPotions.heal = false;
        await sock.sendMessage(remoteJid, { text: `🧙 Kamu menggunakan ramuan penyembuh untuk @${targetJid.split('@')[0]}`, mentions: [targetJid] });
      } else if (action === 'kill' || action === 'k') {
        if (!playerGame.witchPotions.kill) {
          return await sock.sendMessage(remoteJid, { text: '❌ Ramuan racun sudah habis!' });
        }
        if (!target.alive) {
          return await sock.sendMessage(remoteJid, { text: '❌ Target sudah mati!' });
        }
        playerGame.nightActions.set(sender, { type: 'kill', target: targetJid });
        playerGame.witchPotions.kill = false;
        await sock.sendMessage(remoteJid, { text: `🧙 Kamu meracuni @${targetJid.split('@')[0]}`, mentions: [targetJid] });
      } else {
        await sock.sendMessage(remoteJid, { 
          text: `🧙 *WITCH SKILL*\n\n${usedPrefix}skill heal @user - Menyembuhkan (${playerGame.witchPotions.heal ? '✅ tersedia' : '❌ habis'})\n${usedPrefix}skill kill @user - Meracuni (${playerGame.witchPotions.kill ? '✅ tersedia' : '❌ habis'})` 
        });
      }
      break;
      
    case 'CUPID':
      // Cupid can only use skill on day 1 night
      if (playerGame.day !== 1) {
        return await sock.sendMessage(remoteJid, { text: '❌ Cupid hanya bisa memilih lovers di malam pertama!' });
      }
      if (playerGame.lovers.length >= 2) {
        return await sock.sendMessage(remoteJid, { text: '❌ Lovers sudah dipilih!' });
      }
      
      // Need 2 targets
      const mentioned2 = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned2 || mentioned2.length < 2) {
        return await sock.sendMessage(remoteJid, { text: `❌ Tag 2 orang untuk dijadikan lovers!\n\nContoh: ${usedPrefix}skill @user1 @user2` });
      }
      
      const lover1 = playerGame.players.get(mentioned2[0]);
      const lover2 = playerGame.players.get(mentioned2[1]);
      
      if (!lover1 || !lover2) {
        return await sock.sendMessage(remoteJid, { text: '❌ Salah satu target tidak ada dalam game!' });
      }
      
      playerGame.lovers = [mentioned2[0], mentioned2[1]];
      
      // Notify lovers
      try {
        await sock.sendMessage(mentioned2[0], { 
          text: `💑 Cupid telah memilihmu dan @${mentioned2[1].split('@')[0]} sebagai Lovers!\n\nJika salah satu mati, yang lain juga akan mati karena patah hati.`,
          mentions: [mentioned2[1]]
        });
        await sock.sendMessage(mentioned2[1], { 
          text: `💑 Cupid telah memilihmu dan @${mentioned2[0].split('@')[0]} sebagai Lovers!\n\nJika salah satu mati, yang lain juga akan mati karena patah hati.`,
          mentions: [mentioned2[0]]
        });
      } catch (e) {}
      
      await sock.sendMessage(remoteJid, { 
        text: `💑 Kamu memilih @${mentioned2[0].split('@')[0]} dan @${mentioned2[1].split('@')[0]} sebagai Lovers!`,
        mentions: mentioned2
      });
      break;
      
    default:
      await sock.sendMessage(remoteJid, { text: '❌ Role kamu tidak punya skill khusus!' });
  }
}

// Check win condition
async function checkWinCondition(sock, remoteJid, game, usedPrefix) {
  const alivePlayers = Array.from(game.players.values()).filter(p => p.alive);
  const aliveWolves = alivePlayers.filter(p => p.role === 'WEREWOLF');
  const aliveVillagers = alivePlayers.filter(p => p.role !== 'WEREWOLF');
  
  let winner = null;
  let winText = '';
  
  // Check lovers win (if both alive and everyone else dead)
  if (game.lovers.length === 2) {
    const lover1Alive = game.players.get(game.lovers[0])?.alive;
    const lover2Alive = game.players.get(game.lovers[1])?.alive;
    
    if (lover1Alive && lover2Alive && alivePlayers.length === 2) {
      winner = 'lovers';
      winText = `💑 *LOVERS MENANG!*\n\n@${game.lovers[0].split('@')[0]} dan @${game.lovers[1].split('@')[0]} adalah pasangan terakhir yang bertahan!`;
    }
  }
  
  // Werewolf win
  if (!winner && aliveWolves.length >= aliveVillagers.length) {
    winner = 'werewolf';
    winText = `🐺 *WEREWOLF MENANG!*\n\nWerewolf berhasil membunuh semua warga!`;
  }
  
  // Village win
  if (!winner && aliveWolves.length === 0) {
    winner = 'village';
    winText = `🏘️ *VILLAGE MENANG!*\n\nSemua Werewolf berhasil dieksekusi!`;
  }
  
  if (winner) {
    game.phase = PHASE.ENDED;
    
    // Build player list with roles
    const allPlayers = Array.from(game.players.values());
    const playerRoles = allPlayers.map(p => {
      const role = ROLES[p.role];
      const status = p.alive ? '✅' : '💀';
      return `${status} @${p.jid.split('@')[0]} - ${role.emoji} ${role.name}`;
    }).join('\n');
    
    const mentions = allPlayers.map(p => p.jid);
    
    await sock.sendMessage(remoteJid, {
      text: `🎮 *GAME BERAKHIR!*\n\n${winText}\n\n📋 *Daftar Pemain:*\n${playerRoles}\n\n🎮 Ketik ${usedPrefix}ww untuk main lagi!`,
      mentions
    });
    
    // Clean up
    activeGames.delete(remoteJid);
    return true;
  }
  
  return false;
}

// Info command
async function cmdInfoWW(sock, msg, bot, args, { sender, isGroup, usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  if (!isGroup) return;
  
  const game = activeGames.get(remoteJid);
  if (!game) {
    return await sock.sendMessage(remoteJid, { text: `❌ Tidak ada game yang sedang berjalan!\n\nKetik ${usedPrefix}ww untuk membuat room baru` });
  }
  
  const alivePlayers = Array.from(game.players.values()).filter(p => p.alive);
  const deadPlayers = Array.from(game.players.values()).filter(p => !p.alive);
  
  const aliveList = alivePlayers.map((p, i) => `${i + 1}. @${p.jid.split('@')[0]}`).join('\n');
  const deadList = deadPlayers.length > 0 
    ? deadPlayers.map(p => `💀 @${p.jid.split('@')[0]}`).join('\n')
    : 'Belum ada';
  
  const phaseText = {
    [PHASE.LOBBY]: '🎮 Menunggu pemain',
    [PHASE.NIGHT]: '🌙 Malam hari',
    [PHASE.DAY]: '☀️ Siang hari',
    [PHASE.VOTING]: '🗳️ Voting',
    [PHASE.ENDED]: '🏁 Selesai'
  };
  
  const mentions = Array.from(game.players.keys());
  
  await sock.sendMessage(remoteJid, {
    text: `🐺 *INFO GAME WEREWOLF*

📊 *Status:* ${phaseText[game.phase]}
📅 *Hari ke:* ${game.day || '-'}
👑 *Host:* @${game.host.split('@')[0]}

👥 *Pemain Hidup (${alivePlayers.length}):*
${aliveList}

💀 *Pemain Mati (${deadPlayers.length}):*
${deadList}`,
    mentions
  });
}

// End game command (host only)
async function cmdEndWW(sock, msg, bot, args, { sender, isGroup, usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  if (!isGroup) return;
  
  const game = activeGames.get(remoteJid);
  if (!game) {
    return await sock.sendMessage(remoteJid, { text: '❌ Tidak ada game yang sedang berjalan!' });
  }
  
  if (sender !== game.host) {
    return await sock.sendMessage(remoteJid, { text: '❌ Hanya host yang bisa mengakhiri game!' });
  }
  
  activeGames.delete(remoteJid);
  
  await sock.sendMessage(remoteJid, { 
    text: `🛑 *GAME DIHENTIKAN*\n\nGame Werewolf dihentikan oleh host.\n\n🎮 Ketik ${usedPrefix}ww untuk main lagi!` 
  });
}

// Role list command
async function cmdRoleWW(sock, msg, bot, args, { usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  let roleList = `🐺 *DAFTAR ROLE WEREWOLF*\n\n`;
  
  roleList += `*🔴 TIM WEREWOLF:*\n`;
  roleList += `${ROLES.WEREWOLF.emoji} *${ROLES.WEREWOLF.name}*\n${ROLES.WEREWOLF.description}\n\n`;
  
  roleList += `*🟢 TIM VILLAGE:*\n`;
  for (const [key, role] of Object.entries(ROLES)) {
    if (role.team === 'village') {
      roleList += `${role.emoji} *${role.name}*\n${role.description}\n\n`;
    }
  }
  
  roleList += `📋 *CARA MAIN:*\n`;
  roleList += `• ${usedPrefix}ww - Buat room\n`;
  roleList += `• ${usedPrefix}joinww - Gabung room\n`;
  roleList += `• ${usedPrefix}startww - Mulai game\n`;
  roleList += `• ${usedPrefix}vote @user - Vote eksekusi\n`;
  roleList += `• ${usedPrefix}skill @user - Gunakan skill\n`;
  roleList += `• ${usedPrefix}infoww - Info game\n`;
  roleList += `• ${usedPrefix}endww - Akhiri game`;
  
  await sock.sendMessage(remoteJid, { text: roleList });
}

module.exports = {
  // Main commands
  ww: cmdWerewolf,
  werewolf: cmdWerewolf,
  
  // Game commands
  joinww: cmdJoinWW,
  startww: cmdStartWW,
  leaveww: cmdLeaveWW,
  endww: cmdEndWW,
  
  // Action commands
  vote: cmdVote,
  skill: cmdSkill,
  
  // Info commands
  infoww: cmdInfoWW,
  roleww: cmdRoleWW,
  
  // Export for external access
  activeGames
};
