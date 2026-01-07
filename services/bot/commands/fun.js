/**
 * Fun Commands - Complete Implementation
 * fakta, quote, quoteanime, jokes, meme, darkjoke, pantun, puisi, cerpen
 * truth, dare, bucin, galau, gombal, motivasi, renungan, dilan, bijak
 * randomnama, ship, rate, zodiak, primbon, artinama, cekjodoh
 */

const axios = require('axios');

// Helper function
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Data
const FAKTA = [
  'Madu tidak pernah basi. Madu yang ditemukan di makam Mesir kuno masih bisa dimakan.',
  'Gurita memiliki 3 jantung dan darah berwarna biru.',
  'Sidik jari koala sangat mirip dengan manusia.',
  'Lebah bisa mengenali wajah manusia.',
  'Pisang secara teknis adalah buah berry, tapi stroberi bukan.',
  'Jantung udang terletak di kepalanya.',
  'Kecoak bisa hidup berminggu-minggu tanpa kepala.',
  'Lumba-lumba tidur dengan satu mata terbuka.',
  'Gajah adalah satu-satunya hewan yang tidak bisa melompat.',
  'Kucing tidak bisa merasakan rasa manis.'
];

const JOKES = [
  'Kenapa ayam menyeberang jalan? Karena mau ke seberang!',
  'Apa bedanya kucing sama kucingmu? Kalau kucing bisa meong, kalau kucingmu bisa bikin kangen.',
  'Kenapa matematika sedih? Karena punya banyak masalah.',
  'Apa yang hijau dan kalau dipencet bunyi? Kodok pakai bel.',
  'Kenapa semut tidak pernah sakit? Karena punya anti-body.',
  'Apa bedanya tukang bakso sama tukang sate? Kalau tukang bakso mangkal, kalau tukang sate nyate.',
  'Kenapa Superman bajunya ketat? Karena ukurannya S.',
  'Apa yang lebih berat, 1 kg besi atau 1 kg kapas? Sama aja, 1 kg!',
  'Kenapa kucing suka main game? Karena ada mouse-nya.',
  'Apa bedanya kamu sama wifi? Wifi bikin aku connect, kamu bikin aku disconnect dari dunia.'
];

const MOTIVASI = [
  'Kesuksesan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan.',
  'Jangan takut gagal. Takutlah untuk tidak mencoba.',
  'Setiap hari adalah kesempatan baru untuk menjadi lebih baik.',
  'Mimpi tidak akan terwujud dengan sendirinya. Kamu harus bangun dan bekerja keras.',
  'Kegagalan adalah guru terbaik, asalkan kamu mau belajar darinya.',
  'Jangan bandingkan dirimu dengan orang lain. Bandingkan dengan dirimu kemarin.',
  'Sukses bukan tentang tidak pernah jatuh, tapi tentang bangkit setiap kali jatuh.',
  'Waktu terbaik untuk menanam pohon adalah 20 tahun lalu. Waktu terbaik kedua adalah sekarang.',
  'Kamu lebih kuat dari yang kamu pikirkan.',
  'Perjalanan seribu mil dimulai dari satu langkah.'
];

const PANTUN = [
  'Pergi ke pasar membeli ubi\nJangan lupa beli ketela\nKalau kamu mau dicari\nCari aku di dalam hatimu saja',
  'Buah mangga buah kedondong\nDimakan enak rasanya\nKalau kamu merasa suntuk\nIngat aku yang selalu ada',
  'Jalan-jalan ke kota Medan\nJangan lupa beli oleh-oleh\nKalau hidup terasa beban\nIngat masih ada yang sayang padamu',
  'Pergi ke sawah menanam padi\nPulangnya bawa ikan lele\nJangan sedih jangan murung hati\nSemua masalah pasti berlalu',
  'Buah durian buah rambutan\nDimakan enak di sore hari\nJangan lupa jaga kesehatan\nKarena sehat itu mahal sekali'
];

const BUCIN = [
  'Kamu tahu nggak bedanya kamu sama matahari? Kalau matahari bikin silau, kamu bikin aku jatuh cinta.',
  'Aku nggak butuh google, karena kamu adalah jawaban dari semua pencarianku.',
  'Kamu adalah alasan kenapa aku senyum tanpa sebab.',
  'Kalau kamu jadi air, aku mau jadi ikan. Biar aku nggak bisa hidup tanpamu.',
  'Aku nggak percaya cinta pada pandangan pertama, sampai aku melihatmu.',
  'Kamu bukan pilihan, kamu adalah keputusan terbaik dalam hidupku.',
  'Setiap hari aku bersyukur karena kamu ada di hidupku.',
  'Kamu adalah rumah bagiku, tempat aku selalu ingin pulang.',
  'Aku nggak butuh bintang, karena matamu sudah cukup menerangi malamku.',
  'Kalau cinta itu salah, aku nggak mau benar.'
];

const GALAU = [
  'Kadang yang paling menyakitkan bukan perpisahan, tapi kenangan yang tertinggal.',
  'Aku baik-baik saja, hanya sedang belajar melepaskan.',
  'Ternyata move on itu bukan tentang melupakan, tapi tentang menerima.',
  'Yang paling berat bukan melupakanmu, tapi berpura-pura tidak merindukanmu.',
  'Aku tidak marah, hanya kecewa. Dan kecewa itu lebih menyakitkan.',
  'Kadang kita harus merelakan yang kita cintai agar mereka bahagia.',
  'Tidak semua yang kita inginkan bisa kita miliki.',
  'Aku lelah berpura-pura baik-baik saja.',
  'Yang paling sulit adalah tersenyum saat hati sedang menangis.',
  'Mungkin kita memang tidak ditakdirkan bersama.'
];

const GOMBAL = [
  'Kamu punya peta nggak? Soalnya aku tersesat di matamu.',
  'Kamu pasti capek ya? Soalnya kamu lari-lari terus di pikiranku.',
  'Kamu tahu nggak bedanya kamu sama bintang? Kalau bintang di langit, kamu di hatiku.',
  'Ayahmu pencuri ya? Soalnya dia mencuri bintang dan menaruhnya di matamu.',
  'Kamu magnet ya? Soalnya aku selalu tertarik padamu.',
  'Kamu wifi ya? Soalnya aku merasa connected denganmu.',
  'Kamu obat ya? Soalnya kamu menyembuhkan hatiku yang sakit.',
  'Kamu kamus ya? Soalnya kamu memberikan arti dalam hidupku.',
  'Kamu alarm ya? Soalnya kamu selalu membangunkan perasaanku.',
  'Kamu Google ya? Soalnya kamu punya semua yang aku cari.'
];

const TRUTH = [
  'Siapa orang yang paling kamu sayang di grup ini?',
  'Apa rahasia terbesarmu yang belum pernah kamu ceritakan?',
  'Siapa mantan yang masih kamu stalking?',
  'Apa hal paling memalukan yang pernah kamu lakukan?',
  'Siapa crush pertamamu?',
  'Pernahkah kamu berbohong kepada orang tuamu? Tentang apa?',
  'Apa ketakutan terbesarmu?',
  'Siapa orang yang paling ingin kamu temui saat ini?',
  'Apa hal yang paling kamu sesali dalam hidupmu?',
  'Pernahkah kamu jatuh cinta pada sahabatmu sendiri?'
];

const DARE = [
  'Kirim chat "Aku kangen kamu" ke kontak terakhir yang kamu chat!',
  'Post story dengan caption "Jomblo itu indah"!',
  'Telepon orang yang kamu suka dan bilang "Hai, lagi apa?"',
  'Kirim voice note nyanyi lagu favoritmu!',
  'Ganti foto profil dengan foto terjelekmu selama 1 jam!',
  'Kirim chat "I love you" ke 3 orang berbeda!',
  'Buat status galau dan tag mantanmu!',
  'Telepon orang random dan bilang "Selamat, kamu menang undian!"',
  'Kirim foto selfie tanpa filter ke grup!',
  'Bilang "Aku suka kamu" ke orang di sebelahmu!'
];

// Commands
async function cmdFakta(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: `💡 *Fakta Unik*\n\n${getRandom(FAKTA)}` });
}

async function cmdQuote(sock, msg) {
  try {
    const response = await axios.get('https://api.quotable.io/random', { timeout: 10000 });
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `💬 *Quote*\n\n"${response.data.content}"\n\n— ${response.data.author}` 
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: `💬 *Quote*\n\n"${getRandom(MOTIVASI)}"` });
  }
}

async function cmdQuoteAnime(sock, msg) {
  try {
    const response = await axios.get('https://animechan.xyz/api/random', { timeout: 10000 });
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🎌 *Anime Quote*\n\n"${response.data.quote}"\n\n— ${response.data.character} (${response.data.anime})` 
    });
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengambil quote anime' });
  }
}

async function cmdJokes(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: `😂 *Jokes*\n\n${getRandom(JOKES)}` });
}

async function cmdMeme(sock, msg) {
  try {
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Mengambil meme...' });
    const response = await axios.get('https://meme-api.com/gimme', { timeout: 15000 });
    
    if (response.data?.url) {
      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: response.data.url },
        caption: `😂 *${response.data.title || 'Meme'}*`
      });
    }
  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Gagal mengambil meme' });
  }
}

async function cmdDarkJoke(sock, msg) {
  const darkJokes = [
    'Kenapa mayat tidak bisa main hide and seek? Karena mereka selalu ditemukan.',
    'Apa persamaan antara dark humor dan makanan? Tidak semua orang mendapatkannya.',
    'Dokter: Kamu punya waktu 10 menit. Pasien: Untuk apa dok? Dokter: Untuk hidup.',
    'Kenapa aku suka dark humor? Karena seperti kaki, tidak semua orang punya.',
    'Apa bedanya aku dan kanker? Ayahku tidak meninggalkan kanker.'
  ];
  await sock.sendMessage(msg.key.remoteJid, { text: `🖤 *Dark Joke*\n\n${getRandom(darkJokes)}\n\n_⚠️ Ini hanya humor, jangan diambil serius_` });
}

async function cmdPantun(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: `📜 *Pantun*\n\n${getRandom(PANTUN)}` });
}

async function cmdPuisi(sock, msg) {
  const puisi = [
    'Di tepi senja yang merah\nAku menunggu bayangmu\nWalau hati sudah lelah\nCinta ini tetap untukmu',
    'Hujan turun membasahi bumi\nSeperti air mata yang jatuh\nMengenang kisah yang telah pergi\nMeninggalkan luka yang dalam',
    'Malam ini bintang bersinar\nMenerangi langit yang gelap\nSeperti cintamu yang tak pernah pudar\nMeski jarak memisahkan kita'
  ];
  await sock.sendMessage(msg.key.remoteJid, { text: `📝 *Puisi*\n\n${getRandom(puisi)}` });
}

async function cmdCerpen(sock, msg) {
  const cerpen = [
    'Dia duduk di bangku taman, menatap langit sore. Kenangan tentang mereka masih segar dalam ingatan. Senyum, tawa, dan janji yang tak pernah ditepati. Kini yang tersisa hanya angin yang berbisik, membawa pergi semua harapan yang pernah ada.',
    'Hujan turun deras malam itu. Dia berlari tanpa payung, membiarkan air membasahi seluruh tubuhnya. Mungkin dengan begitu, air mata yang mengalir tidak akan terlihat. Mungkin dengan begitu, rasa sakit ini bisa ikut terhanyut.',
    'Mereka bertemu di stasiun kereta. Hanya sebuah senyum dan anggukan kepala. Tapi entah mengapa, pertemuan singkat itu meninggalkan kesan yang dalam. Kadang, orang asing bisa memberikan kehangatan yang tidak bisa diberikan oleh orang terdekat.'
  ];
  await sock.sendMessage(msg.key.remoteJid, { text: `📖 *Cerpen*\n\n${getRandom(cerpen)}` });
}

async function cmdTruth(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: `🤔 *TRUTH*\n\n${getRandom(TRUTH)}\n\n_Jawab dengan jujur ya!_` });
}

async function cmdDare(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: `😈 *DARE*\n\n${getRandom(DARE)}\n\n_Berani nggak?_` });
}

async function cmdBucin(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: `💕 *Kata Bucin*\n\n${getRandom(BUCIN)}` });
}

async function cmdGalau(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: `😢 *Kata Galau*\n\n${getRandom(GALAU)}` });
}

async function cmdGombal(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: `😏 *Gombal*\n\n${getRandom(GOMBAL)}` });
}

async function cmdMotivasi(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: `🌟 *Motivasi*\n\n"${getRandom(MOTIVASI)}"\n\n_Tetap semangat! 💪_` });
}

async function cmdRenungan(sock, msg) {
  const renungan = [
    'Hidup ini singkat. Jangan habiskan waktumu untuk membenci orang lain.',
    'Setiap orang yang kamu temui sedang berjuang dalam pertempuran yang tidak kamu ketahui. Bersikaplah baik.',
    'Kamu tidak bisa mengubah masa lalu, tapi kamu bisa memulai hari ini untuk mengubah masa depan.',
    'Kebahagiaan bukan tentang mendapatkan apa yang kamu inginkan, tapi tentang mensyukuri apa yang kamu miliki.',
    'Orang yang paling kuat bukan yang tidak pernah menangis, tapi yang tetap tersenyum meski hatinya sedang terluka.'
  ];
  await sock.sendMessage(msg.key.remoteJid, { text: `🌙 *Renungan*\n\n${getRandom(renungan)}` });
}

async function cmdDilan(sock, msg) {
  const dilan = [
    'Jangan rindu. Berat. Kamu nggak akan kuat. Biar aku saja.',
    'Kamu nggak perlu cari aku. Karena aku yang akan selalu mencarimu.',
    'Aku ini bukan orang baik. Tapi aku akan jadi baik kalau sama kamu.',
    'Kamu tahu nggak bedanya kamu sama hujan? Kalau hujan bikin basah, kamu bikin aku jatuh cinta.',
    'Aku rindu kamu. Tapi aku nggak mau bilang. Karena aku takut kamu nggak rindu aku.'
  ];
  await sock.sendMessage(msg.key.remoteJid, { text: `🎬 *Quote Dilan*\n\n"${getRandom(dilan)}"` });
}

async function cmdBijak(sock, msg) {
  const bijak = [
    'Orang bijak berbicara karena mereka punya sesuatu untuk dikatakan. Orang bodoh berbicara karena mereka harus mengatakan sesuatu.',
    'Jangan menilai orang dari masa lalunya. Orang bisa berubah.',
    'Lebih baik diam dan dianggap bodoh daripada berbicara dan menghilangkan semua keraguan.',
    'Kesabaran adalah kunci keberhasilan.',
    'Ilmu tanpa amal bagaikan pohon tanpa buah.'
  ];
  await sock.sendMessage(msg.key.remoteJid, { text: `🧠 *Kata Bijak*\n\n"${getRandom(bijak)}"` });
}

async function cmdRandomNama(sock, msg) {
  const namaDepan = ['Budi', 'Andi', 'Siti', 'Dewi', 'Agus', 'Rina', 'Doni', 'Maya', 'Rudi', 'Lina'];
  const namaBelakang = ['Santoso', 'Wijaya', 'Kusuma', 'Pratama', 'Saputra', 'Lestari', 'Hidayat', 'Permana', 'Nugraha', 'Sari'];
  const nama = `${getRandom(namaDepan)} ${getRandom(namaBelakang)}`;
  await sock.sendMessage(msg.key.remoteJid, { text: `🎲 *Random Nama*\n\n👤 ${nama}` });
}

async function cmdShip(sock, msg, bot, args) {
  if (args.length < 2) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Format: .ship nama1 nama2' });
  }
  
  const name1 = args[0];
  const name2 = args.slice(1).join(' ');
  const percentage = Math.floor(Math.random() * 101);
  
  let status = percentage >= 80 ? '💕 JODOH!' : percentage >= 50 ? '💗 Cocok!' : percentage >= 30 ? '💔 Kurang cocok' : '😅 Cari yang lain';
  const bar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10));
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `💕 *SHIP*\n\n👤 ${name1}\n❤️\n👤 ${name2}\n\n[${bar}] ${percentage}%\n\n${status}` 
  });
}

async function cmdRate(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Format: .rate [sesuatu]' });
  }
  
  const thing = args.join(' ');
  const rating = Math.floor(Math.random() * 101);
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `⭐ *RATE*\n\n📝 ${thing}\n\n⭐ Rating: ${rating}/100\n${'⭐'.repeat(Math.floor(rating / 20))}` 
  });
}

async function cmdZodiak(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan zodiak!\n\nContoh: .zodiak aries' });
  }
  
  const zodiak = args[0].toLowerCase();
  const ramalan = [
    'Hari ini adalah hari yang baik untuk memulai sesuatu yang baru.',
    'Berhati-hatilah dalam mengambil keputusan hari ini.',
    'Keberuntungan akan datang dari arah yang tidak terduga.',
    'Fokus pada tujuanmu dan jangan terganggu oleh hal-hal kecil.',
    'Hari yang baik untuk bersosialisasi dan bertemu orang baru.'
  ];
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `♈ *Ramalan ${zodiak.charAt(0).toUpperCase() + zodiak.slice(1)}*\n\n${getRandom(ramalan)}\n\n🍀 Angka keberuntungan: ${Math.floor(Math.random() * 100)}\n💕 Kecocokan: ${['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo'][Math.floor(Math.random() * 6)]}` 
  });
}

async function cmdPrimbon(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan tanggal lahir!\n\nContoh: .primbon 01-01-2000' });
  }
  
  const watak = ['Pemberani', 'Bijaksana', 'Kreatif', 'Setia', 'Pekerja keras', 'Romantis'];
  const rezeki = ['Sangat baik', 'Baik', 'Cukup', 'Perlu usaha lebih'];
  const jodoh = ['Akan bertemu dalam waktu dekat', 'Sudah ada di sekitarmu', 'Perlu bersabar'];
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `🔮 *Primbon*\n📅 ${args[0]}\n\n👤 Watak: ${getRandom(watak)}\n💰 Rezeki: ${getRandom(rezeki)}\n💕 Jodoh: ${getRandom(jodoh)}\n🍀 Hari baik: ${['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'][Math.floor(Math.random() * 5)]}` 
  });
}

async function cmdArtiNama(sock, msg, bot, args) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Masukkan nama!\n\nContoh: .artinama budi' });
  }
  
  const nama = args.join(' ');
  const arti = ['Orang yang bijaksana', 'Pembawa kebahagiaan', 'Pejuang sejati', 'Hati yang mulia', 'Cahaya dalam kegelapan'];
  const sifat = ['Baik hati', 'Pekerja keras', 'Setia', 'Kreatif', 'Penyayang'];
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `📝 *Arti Nama: ${nama}*\n\n✨ Arti: ${getRandom(arti)}\n👤 Sifat: ${getRandom(sifat)}\n🍀 Keberuntungan: ${Math.floor(Math.random() * 100)}%` 
  });
}

async function cmdCekJodoh(sock, msg, bot, args) {
  if (args.length < 2) {
    return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Format: .cekjodoh nama1 nama2' });
  }
  
  return cmdShip(sock, msg, bot, args);
}

module.exports = {
  fakta: cmdFakta, fact: cmdFakta,
  quote: cmdQuote, quotes: cmdQuote,
  quoteanime: cmdQuoteAnime, animequote: cmdQuoteAnime,
  jokes: cmdJokes, joke: cmdJokes, lelucon: cmdJokes,
  meme: cmdMeme, memes: cmdMeme,
  darkjoke: cmdDarkJoke, dj: cmdDarkJoke,
  pantun: cmdPantun,
  puisi: cmdPuisi,
  cerpen: cmdCerpen,
  truth: cmdTruth,
  dare: cmdDare,
  bucin: cmdBucin,
  galau: cmdGalau,
  gombal: cmdGombal,
  motivasi: cmdMotivasi,
  renungan: cmdRenungan,
  dilan: cmdDilan,
  bijak: cmdBijak,
  randomnama: cmdRandomNama, randname: cmdRandomNama,
  ship: cmdShip, match: cmdShip,
  rate: cmdRate, nilai: cmdRate,
  zodiak: cmdZodiak, zodiac: cmdZodiak,
  primbon: cmdPrimbon,
  artinama: cmdArtiNama, nameart: cmdArtiNama,
  cekjodoh: cmdCekJodoh, jodoh: cmdCekJodoh
};
