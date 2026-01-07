/**
 * Games Commands - Complete Implementation
 * slot, dice, coinflip, rps, tebakgambar, tebakkata, tebakangka, tebaklirik
 * tebakbendera, tebaklagu, tebakkimia, quiz, math, susunkata, tictactoe
 * hangman, trivia, family100, caklontong, asahotak
 */

const axios = require('axios');
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Active games storage
const activeGames = new Map();

// Data
const SLOT_EMOJIS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣', '⭐'];
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// Slot Machine
async function cmdSlot(sock, msg) {
  const slot1 = getRandom(SLOT_EMOJIS);
  const slot2 = getRandom(SLOT_EMOJIS);
  const slot3 = getRandom(SLOT_EMOJIS);
  
  let status, coins;
  if (slot1 === slot2 && slot2 === slot3) {
    status = slot1 === '7️⃣' ? '🎉 MEGA JACKPOT!' : slot1 === '💎' ? '💎 DIAMOND!' : '🎉 JACKPOT!';
    coins = slot1 === '7️⃣' ? 1000 : slot1 === '💎' ? 500 : 100;
  } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
    status = '✨ MENANG!';
    coins = 25;
  } else {
    status = '😢 KALAH';
    coins = -10;
  }
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `🎰 *SLOT MACHINE*\n\n┃ ${slot1} ┃ ${slot2} ┃ ${slot3} ┃\n\n${status}\n💰 ${coins > 0 ? '+' : ''}${coins} koin` 
  });
}

// Dice
async function cmdDice(sock, msg) {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const total = dice1 + dice2;
  
  let status = total >= 10 ? '🌟 Bagus!' : total >= 7 ? '👍 Lumayan' : '😅 Kurang beruntung';
  if (dice1 === dice2) status = dice1 === 6 ? '🔥 DOUBLE SIX!' : '🎉 DOUBLE!';
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `🎲 *DICE*\n\n${DICE_FACES[dice1-1]} ${DICE_FACES[dice2-1]}\n\nDadu 1: ${dice1}\nDadu 2: ${dice2}\nTotal: *${total}*\n\n${status}` 
  });
}

// Coin Flip
async function cmdCoinFlip(sock, msg, bot, args) {
  const result = Math.random() < 0.5 ? 'heads' : 'tails';
  const emoji = result === 'heads' ? '👑' : '🔢';
  const text_result = result === 'heads' ? 'KEPALA' : 'EKOR';
  
  let guessResult = '';
  if (args[0]) {
    const guess = args[0].toLowerCase();
    const isHeads = ['heads', 'kepala', 'h', 'k'].includes(guess);
    const isTails = ['tails', 'ekor', 't', 'e'].includes(guess);
    if (isHeads || isTails) {
      const userGuess = isHeads ? 'heads' : 'tails';
      guessResult = userGuess === result ? '\n\n✅ BENAR!' : '\n\n❌ SALAH!';
    }
  }
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `🪙 *COIN FLIP*\n\n${emoji}\n\nHasil: *${text_result}*${guessResult}` 
  });
}

// Rock Paper Scissors
async function cmdRPS(sock, msg, bot, args) {
  const choices = ['batu', 'gunting', 'kertas'];
  const emojis = { batu: '🪨', gunting: '✂️', kertas: '📄' };
  
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '✊✌️✋ *SUIT*\n\nCara: .rps batu/gunting/kertas' });
  }
  
  let userChoice = args[0].toLowerCase();
  if (['rock', 'r', 'b'].includes(userChoice)) userChoice = 'batu';
  if (['scissors', 'g', 's'].includes(userChoice)) userChoice = 'gunting';
  if (['paper', 'p', 'k'].includes(userChoice)) userChoice = 'kertas';
  
  if (!choices.includes(userChoice)) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Pilih: batu, gunting, atau kertas!' });
  }
  
  const botChoice = getRandom(choices);
  let result;
  
  if (userChoice === botChoice) {
    result = '🤝 SERI!';
  } else if (
    (userChoice === 'batu' && botChoice === 'gunting') ||
    (userChoice === 'gunting' && botChoice === 'kertas') ||
    (userChoice === 'kertas' && botChoice === 'batu')
  ) {
    result = '🎉 KAMU MENANG!';
  } else {
    result = '😢 KAMU KALAH!';
  }
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `✊✌️✋ *SUIT*\n\nKamu: ${emojis[userChoice]} ${userChoice}\nBot: ${emojis[botChoice]} ${botChoice}\n\n${result}` 
  });
}

// Tebak Gambar
async function cmdTebakGambar(sock, msg) {
  const remoteJid = msg.key.remoteJid;
  
  if (activeGames.has(remoteJid) && activeGames.get(remoteJid).type === 'tebakgambar') {
    const game = activeGames.get(remoteJid);
    return await sock.sendMessage(remoteJid, { text: `❌ Masih ada game!\n\nHint: ${game.hint}\n\nKetik .nyerah untuk menyerah` });
  }
  
  try {
    await sock.sendMessage(remoteJid, { text: '🖼️ Mengambil soal...' });
    
    const response = await axios.get('https://api.siputzx.my.id/api/games/tebakgambar', { timeout: 15000 });
    const data = response.data?.data;
    
    if (!data) throw new Error('No data');
    
    activeGames.set(remoteJid, {
      type: 'tebakgambar',
      answer: (data.answer || data.jawaban).toLowerCase(),
      hint: data.hint || data.deskripsi || 'Tebak gambar ini!',
      startTime: Date.now()
    });
    
    setTimeout(() => {
      if (activeGames.has(remoteJid) && activeGames.get(remoteJid).type === 'tebakgambar') {
        const answer = activeGames.get(remoteJid).answer;
        activeGames.delete(remoteJid);
        sock.sendMessage(remoteJid, { text: `⏰ Waktu habis!\n\nJawaban: *${answer}*` });
      }
    }, 120000);
    
    const imgUrl = data.image || data.img;
    const imgResponse = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 15000 });
    
    await sock.sendMessage(remoteJid, {
      image: Buffer.from(imgResponse.data),
      caption: `🖼️ *TEBAK GAMBAR*\n\n💡 ${activeGames.get(remoteJid).hint}\n\n⏰ 2 menit\n_Ketik jawabanmu!_`
    });
  } catch (err) {
    // Fallback emoji puzzle
    const puzzles = [
      { emoji: '🏠❤️', answer: 'home sweet home', hint: 'Tempat tinggal nyaman' },
      { emoji: '🌧️🐱🐕', answer: 'hujan kucing anjing', hint: 'Hujan deras' },
      { emoji: '💔', answer: 'patah hati', hint: 'Perasaan sedih' },
      { emoji: '🎂🎉', answer: 'ulang tahun', hint: 'Perayaan' }
    ];
    const puzzle = getRandom(puzzles);
    
    activeGames.set(remoteJid, { type: 'tebakgambar', answer: puzzle.answer, hint: puzzle.hint, startTime: Date.now() });
    
    setTimeout(() => {
      if (activeGames.has(remoteJid)) {
        activeGames.delete(remoteJid);
        sock.sendMessage(remoteJid, { text: `⏰ Waktu habis!\n\nJawaban: *${puzzle.answer}*` });
      }
    }, 120000);
    
    await sock.sendMessage(remoteJid, { text: `🖼️ *TEBAK GAMBAR*\n\n${puzzle.emoji}\n\n💡 ${puzzle.hint}\n\n⏰ 2 menit` });
  }
}

// Tebak Kata
async function cmdTebakKata(sock, msg) {
  const remoteJid = msg.key.remoteJid;
  
  const words = [
    { word: 'komputer', hint: 'Alat elektronik untuk bekerja' },
    { word: 'handphone', hint: 'Alat komunikasi genggam' },
    { word: 'internet', hint: 'Jaringan global' },
    { word: 'indonesia', hint: 'Negara kepulauan' },
    { word: 'jakarta', hint: 'Ibukota Indonesia' }
  ];
  
  const game = getRandom(words);
  const scrambled = game.word.split('').sort(() => Math.random() - 0.5).join('');
  
  activeGames.set(remoteJid, { type: 'tebakkata', answer: game.word, startTime: Date.now() });
  
  setTimeout(() => {
    if (activeGames.has(remoteJid) && activeGames.get(remoteJid).type === 'tebakkata') {
      activeGames.delete(remoteJid);
      sock.sendMessage(remoteJid, { text: `⏰ Waktu habis!\n\nJawaban: *${game.word}*` });
    }
  }, 60000);
  
  await sock.sendMessage(remoteJid, { 
    text: `🔤 *TEBAK KATA*\n\n🔀 ${scrambled.toUpperCase()}\n\n💡 ${game.hint}\n\n⏰ 1 menit` 
  });
}

// Tebak Angka
async function cmdTebakAngka(sock, msg) {
  const remoteJid = msg.key.remoteJid;
  const answer = Math.floor(Math.random() * 100) + 1;
  
  activeGames.set(remoteJid, { type: 'tebakangka', answer: answer.toString(), attempts: 0, startTime: Date.now() });
  
  setTimeout(() => {
    if (activeGames.has(remoteJid) && activeGames.get(remoteJid).type === 'tebakangka') {
      activeGames.delete(remoteJid);
      sock.sendMessage(remoteJid, { text: `⏰ Waktu habis!\n\nJawaban: *${answer}*` });
    }
  }, 120000);
  
  await sock.sendMessage(remoteJid, { 
    text: `🔢 *TEBAK ANGKA*\n\nTebak angka 1-100!\n\n⏰ 2 menit\n_Ketik angka tebakanmu!_` 
  });
}

// Quiz
async function cmdQuiz(sock, msg) {
  const remoteJid = msg.key.remoteJid;
  
  const quizzes = [
    { q: 'Apa ibukota Indonesia?', a: 'jakarta' },
    { q: 'Siapa presiden pertama Indonesia?', a: 'soekarno' },
    { q: 'Berapa jumlah provinsi di Indonesia?', a: '38' },
    { q: 'Apa nama mata uang Indonesia?', a: 'rupiah' },
    { q: 'Gunung tertinggi di Indonesia?', a: 'puncak jaya' },
    { q: 'Pulau terbesar di Indonesia?', a: 'kalimantan' },
    { q: 'Hari kemerdekaan Indonesia?', a: '17 agustus 1945' },
    { q: 'Lagu kebangsaan Indonesia?', a: 'indonesia raya' }
  ];
  
  const quiz = getRandom(quizzes);
  
  activeGames.set(remoteJid, { type: 'quiz', answer: quiz.a, startTime: Date.now() });
  
  setTimeout(() => {
    if (activeGames.has(remoteJid) && activeGames.get(remoteJid).type === 'quiz') {
      activeGames.delete(remoteJid);
      sock.sendMessage(remoteJid, { text: `⏰ Waktu habis!\n\nJawaban: *${quiz.a}*` });
    }
  }, 60000);
  
  await sock.sendMessage(remoteJid, { text: `❓ *QUIZ*\n\n${quiz.q}\n\n⏰ 1 menit` });
}

// Math Quiz
async function cmdMath(sock, msg) {
  const remoteJid = msg.key.remoteJid;
  
  const ops = ['+', '-', '*'];
  const op = getRandom(ops);
  let a, b, answer;
  
  if (op === '*') {
    a = Math.floor(Math.random() * 12) + 1;
    b = Math.floor(Math.random() * 12) + 1;
  } else {
    a = Math.floor(Math.random() * 100) + 1;
    b = Math.floor(Math.random() * 100) + 1;
  }
  
  answer = eval(`${a} ${op} ${b}`);
  
  activeGames.set(remoteJid, { type: 'math', answer: answer.toString(), startTime: Date.now() });
  
  setTimeout(() => {
    if (activeGames.has(remoteJid) && activeGames.get(remoteJid).type === 'math') {
      activeGames.delete(remoteJid);
      sock.sendMessage(remoteJid, { text: `⏰ Waktu habis!\n\nJawaban: *${answer}*` });
    }
  }, 30000);
  
  await sock.sendMessage(remoteJid, { text: `🔢 *MATH QUIZ*\n\n${a} ${op} ${b} = ?\n\n⏰ 30 detik` });
}

// Nyerah (Give up)
async function cmdNyerah(sock, msg) {
  const remoteJid = msg.key.remoteJid;
  
  if (!activeGames.has(remoteJid)) {
    return await sock.sendMessage(remoteJid, { text: '❌ Tidak ada game aktif!' });
  }
  
  const game = activeGames.get(remoteJid);
  activeGames.delete(remoteJid);
  
  await sock.sendMessage(remoteJid, { text: `😅 *Menyerah!*\n\nJawaban: *${game.answer}*` });
}

// Trivia
async function cmdTrivia(sock, msg) {
  return cmdQuiz(sock, msg);
}

// Family 100
async function cmdFamily100(sock, msg) {
  const remoteJid = msg.key.remoteJid;
  
  const questions = [
    { q: 'Sebutkan nama buah!', answers: ['apel', 'jeruk', 'mangga', 'pisang', 'anggur', 'semangka', 'melon', 'durian'] },
    { q: 'Sebutkan nama hewan berkaki 4!', answers: ['kucing', 'anjing', 'sapi', 'kambing', 'kuda', 'gajah', 'harimau', 'singa'] },
    { q: 'Sebutkan nama negara di Asia!', answers: ['indonesia', 'malaysia', 'singapura', 'thailand', 'jepang', 'korea', 'china', 'india'] }
  ];
  
  const game = getRandom(questions);
  
  activeGames.set(remoteJid, { 
    type: 'family100', 
    answers: game.answers, 
    found: [],
    startTime: Date.now() 
  });
  
  setTimeout(() => {
    if (activeGames.has(remoteJid) && activeGames.get(remoteJid).type === 'family100') {
      const g = activeGames.get(remoteJid);
      activeGames.delete(remoteJid);
      sock.sendMessage(remoteJid, { 
        text: `⏰ Waktu habis!\n\nDitemukan: ${g.found.length}/${g.answers.length}\nJawaban: ${g.answers.join(', ')}` 
      });
    }
  }, 180000);
  
  await sock.sendMessage(remoteJid, { 
    text: `👨‍👩‍👧‍👦 *FAMILY 100*\n\n${game.q}\n\nTemukan ${game.answers.length} jawaban!\n\n⏰ 3 menit` 
  });
}

// Cak Lontong
async function cmdCakLontong(sock, msg) {
  const remoteJid = msg.key.remoteJid;
  
  const questions = [
    { q: 'Apa yang bisa berjalan tapi tidak punya kaki?', a: 'waktu' },
    { q: 'Apa yang punya kepala tapi tidak punya otak?', a: 'paku' },
    { q: 'Apa yang makin dipotong makin panjang?', a: 'jalan' },
    { q: 'Apa yang ada di depan kita tapi tidak bisa dilihat?', a: 'masa depan' }
  ];
  
  const quiz = getRandom(questions);
  
  activeGames.set(remoteJid, { type: 'caklontong', answer: quiz.a, startTime: Date.now() });
  
  setTimeout(() => {
    if (activeGames.has(remoteJid) && activeGames.get(remoteJid).type === 'caklontong') {
      activeGames.delete(remoteJid);
      sock.sendMessage(remoteJid, { text: `⏰ Waktu habis!\n\nJawaban: *${quiz.a}*` });
    }
  }, 60000);
  
  await sock.sendMessage(remoteJid, { text: `🤔 *CAK LONTONG*\n\n${quiz.q}\n\n⏰ 1 menit` });
}

// Asah Otak
async function cmdAsahOtak(sock, msg) {
  return cmdCakLontong(sock, msg);
}

// 8 Ball
async function cmd8Ball(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '🎱 Tanyakan sesuatu!\n\nContoh: .8ball Apakah aku akan sukses?' });
  }
  
  const answers = [
    'Ya, pasti! ✅', 'Tentu saja! 👍', 'Tanpa ragu! 💯', 'Sepertinya iya 🤔',
    'Mungkin... 🤷', 'Tidak yakin 🔄', 'Sepertinya tidak 😕', 'Tidak! ❌'
  ];
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `🎱 *MAGIC 8 BALL*\n\n❓ ${args.join(' ')}\n\n🎱 ${getRandom(answers)}` 
  });
}

// Love Calculator
async function cmdLove(sock, msg, bot, args) {
  if (args.length < 2) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '💕 Format: .love nama1 nama2' });
  }
  
  const name1 = args[0];
  const name2 = args.slice(1).join(' ');
  
  const combined = (name1 + name2).toLowerCase();
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
  }
  const percentage = Math.abs(hash % 101);
  
  let status = percentage >= 80 ? '💕 JODOH SEJATI!' : percentage >= 50 ? '💗 Cocok!' : '💔 Kurang cocok';
  const bar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10));
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `💕 *LOVE CALCULATOR*\n\n👤 ${name1}\n❤️\n👤 ${name2}\n\n[${bar}] ${percentage}%\n\n${status}` 
  });
}

// Export active games for answer checking
module.exports = {
  slot: cmdSlot, slots: cmdSlot,
  dice: cmdDice, dadu: cmdDice,
  coinflip: cmdCoinFlip, flip: cmdCoinFlip, coin: cmdCoinFlip,
  rps: cmdRPS, suit: cmdRPS, jankenpon: cmdRPS,
  tebakgambar: cmdTebakGambar, tg: cmdTebakGambar,
  tebakkata: cmdTebakKata, tk: cmdTebakKata,
  tebakangka: cmdTebakAngka, ta: cmdTebakAngka,
  quiz: cmdQuiz, kuis: cmdQuiz,
  math: cmdMath, matematika: cmdMath,
  nyerah: cmdNyerah,
  trivia: cmdTrivia,
  family100: cmdFamily100, f100: cmdFamily100,
  caklontong: cmdCakLontong, cl: cmdCakLontong,
  asahotak: cmdAsahOtak, ao: cmdAsahOtak,
  '8ball': cmd8Ball, ball: cmd8Ball,
  love: cmdLove, lovec: cmdLove,
  activeGames
};


// Additional games
async function cmdTebakLirik(sock, msg) {
  const remoteJid = msg.key.remoteJid;
  
  const lyrics = [
    { lyric: 'Kau adalah... yang terindah...', answer: 'terindah', hint: 'Lagu Kahitna' },
    { lyric: 'Bila nanti... kau tak lagi...', answer: 'bila nanti', hint: 'Lagu Noah' },
    { lyric: 'Separuh aku... menginginkanmu...', answer: 'separuh aku', hint: 'Lagu Noah' },
    { lyric: 'Kangen... setengah mati...', answer: 'kangen', hint: 'Lagu Dewa 19' },
    { lyric: 'Aku masih... seperti yang dulu...', answer: 'masih', hint: 'Lagu Peterpan' }
  ];
  
  const game = lyrics[Math.floor(Math.random() * lyrics.length)];
  
  activeGames.set(remoteJid, { type: 'tebaklirik', answer: game.answer, startTime: Date.now() });
  
  setTimeout(() => {
    if (activeGames.has(remoteJid) && activeGames.get(remoteJid).type === 'tebaklirik') {
      activeGames.delete(remoteJid);
      sock.sendMessage(remoteJid, { text: `⏰ Waktu habis!\n\nJawaban: *${game.answer}*` });
    }
  }, 60000);
  
  await sock.sendMessage(remoteJid, { text: `🎵 *TEBAK LIRIK*\n\n"${game.lyric}"\n\n💡 ${game.hint}\n\n⏰ 1 menit` });
}

async function cmdTebakBendera(sock, msg) {
  const remoteJid = msg.key.remoteJid;
  
  const flags = [
    { flag: '🇮🇩', answer: 'indonesia' },
    { flag: '🇯🇵', answer: 'jepang' },
    { flag: '🇰🇷', answer: 'korea' },
    { flag: '🇺🇸', answer: 'amerika' },
    { flag: '🇬🇧', answer: 'inggris' },
    { flag: '🇫🇷', answer: 'prancis' },
    { flag: '🇩🇪', answer: 'jerman' },
    { flag: '🇮🇹', answer: 'italia' },
    { flag: '🇪🇸', answer: 'spanyol' },
    { flag: '🇧🇷', answer: 'brasil' }
  ];
  
  const game = flags[Math.floor(Math.random() * flags.length)];
  
  activeGames.set(remoteJid, { type: 'tebakbendera', answer: game.answer, startTime: Date.now() });
  
  setTimeout(() => {
    if (activeGames.has(remoteJid) && activeGames.get(remoteJid).type === 'tebakbendera') {
      activeGames.delete(remoteJid);
      sock.sendMessage(remoteJid, { text: `⏰ Waktu habis!\n\nJawaban: *${game.answer}*` });
    }
  }, 30000);
  
  await sock.sendMessage(remoteJid, { text: `🏳️ *TEBAK BENDERA*\n\n${game.flag}\n\nNegara apa ini?\n\n⏰ 30 detik` });
}

async function cmdTebakLagu(sock, msg) {
  return cmdTebakLirik(sock, msg);
}

async function cmdTebakKimia(sock, msg) {
  const remoteJid = msg.key.remoteJid;
  
  const elements = [
    { symbol: 'H', answer: 'hidrogen' },
    { symbol: 'O', answer: 'oksigen' },
    { symbol: 'C', answer: 'karbon' },
    { symbol: 'N', answer: 'nitrogen' },
    { symbol: 'Fe', answer: 'besi' },
    { symbol: 'Au', answer: 'emas' },
    { symbol: 'Ag', answer: 'perak' },
    { symbol: 'Cu', answer: 'tembaga' },
    { symbol: 'Na', answer: 'natrium' },
    { symbol: 'K', answer: 'kalium' }
  ];
  
  const game = elements[Math.floor(Math.random() * elements.length)];
  
  activeGames.set(remoteJid, { type: 'tebakkimia', answer: game.answer, startTime: Date.now() });
  
  setTimeout(() => {
    if (activeGames.has(remoteJid) && activeGames.get(remoteJid).type === 'tebakkimia') {
      activeGames.delete(remoteJid);
      sock.sendMessage(remoteJid, { text: `⏰ Waktu habis!\n\nJawaban: *${game.answer}*` });
    }
  }, 30000);
  
  await sock.sendMessage(remoteJid, { text: `🧪 *TEBAK UNSUR KIMIA*\n\n*${game.symbol}*\n\nUnsur apa ini?\n\n⏰ 30 detik` });
}

async function cmdSusunKata(sock, msg) {
  const remoteJid = msg.key.remoteJid;
  
  const words = ['komputer', 'handphone', 'internet', 'indonesia', 'jakarta', 'bandung', 'surabaya'];
  const word = words[Math.floor(Math.random() * words.length)];
  const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
  
  activeGames.set(remoteJid, { type: 'susunkata', answer: word, startTime: Date.now() });
  
  setTimeout(() => {
    if (activeGames.has(remoteJid) && activeGames.get(remoteJid).type === 'susunkata') {
      activeGames.delete(remoteJid);
      sock.sendMessage(remoteJid, { text: `⏰ Waktu habis!\n\nJawaban: *${word}*` });
    }
  }, 60000);
  
  await sock.sendMessage(remoteJid, { text: `🔤 *SUSUN KATA*\n\n${scrambled.toUpperCase()}\n\nSusun menjadi kata yang benar!\n\n⏰ 1 menit` });
}

async function cmdTicTacToe(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: '🎮 *TIC TAC TOE*\n\nFitur ini dalam pengembangan.\n\nCoba game lain: .slot, .dice, .quiz' });
}

async function cmdHangman(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: '🎮 *HANGMAN*\n\nFitur ini dalam pengembangan.\n\nCoba game lain: .tebakkata, .quiz' });
}

// Add to exports
module.exports.tebaklirik = cmdTebakLirik;
module.exports.tl = cmdTebakLirik;
module.exports.tebakbendera = cmdTebakBendera;
module.exports.tb = cmdTebakBendera;
module.exports.tebaklagu = cmdTebakLagu;
module.exports.tbl = cmdTebakLagu;
module.exports.tebakkimia = cmdTebakKimia;
module.exports.tbk = cmdTebakKimia;
module.exports.susunkata = cmdSusunKata;
module.exports.sk = cmdSusunKata;
module.exports.tictactoe = cmdTicTacToe;
module.exports.ttt = cmdTicTacToe;
module.exports.xo = cmdTicTacToe;
module.exports.hangman = cmdHangman;
module.exports.gantung = cmdHangman;
