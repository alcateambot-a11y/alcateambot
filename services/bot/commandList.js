/**
 * Command List - Master list of all bot commands
 * This is the single source of truth for commands
 * Frontend will fetch from API endpoint
 */

const COMMANDS = [
  // ==================== INFO (12) ====================
  { name: 'menu', aliases: ['help', 'listcmd', 'listcommand', 'allmenu', 'allcmd'], category: 'info', description: 'Menampilkan menu bot', example: '{prefix}menu', cooldown: 3 },
  { name: 'ping', aliases: ['speed', 'speedtest', 'p', 'test'], category: 'info', description: 'Cek response time bot', example: '{prefix}ping', cooldown: 2 },
  { name: 'info', aliases: ['botinfo', 'infobot', 'bot'], category: 'info', description: 'Info bot', example: '{prefix}info', cooldown: 3 },
  { name: 'owner', aliases: ['creator', 'dev', 'developer', 'pemilik'], category: 'info', description: 'Info owner bot', example: '{prefix}owner', cooldown: 3 },
  { name: 'runtime', aliases: ['uptime', 'runtimebot'], category: 'info', description: 'Melihat uptime bot', example: '{prefix}runtime', cooldown: 2 },
  { name: 'premium', aliases: ['prem', 'vip', 'premmenu'], category: 'info', description: 'Menampilkan menu fitur premium', example: '{prefix}premium', cooldown: 3 },
  { name: 'cekpremium', aliases: ['cekprem', 'checkpremium', 'cekvip', 'ispremium'], category: 'info', description: 'Cek status premium user', example: '{prefix}cekpremium @user', cooldown: 3 },
  { name: 'donate', aliases: ['donasi', 'support', 'dukung'], category: 'info', description: 'Info donasi', example: '{prefix}donate', cooldown: 3 },
  { name: 'report', aliases: ['lapor', 'bug', 'feedback'], category: 'info', description: 'Lapor bug ke owner', example: '{prefix}report bug di fitur x', cooldown: 10 },
  { name: 'request', aliases: ['req', 'saran', 'suggest'], category: 'info', description: 'Request fitur baru', example: '{prefix}request fitur baru', cooldown: 10 },
  { name: 'rules', aliases: ['aturan', 'rule', 'peraturan'], category: 'info', description: 'Aturan penggunaan bot', example: '{prefix}rules', cooldown: 3 },
  { name: 'about', aliases: ['tentang', 'dashboard', 'panel', 'web'], category: 'info', description: 'Tentang bot', example: '{prefix}about', cooldown: 3 },

  // ==================== AI (15) ====================
  { name: 'ai', aliases: ['gpt', 'chatgpt', 'openai', 'ask', 'tanya'], category: 'ai', description: 'Bertanya ke AI ChatGPT', example: '{prefix}ai apa itu javascript?', cooldown: 5, limit: 3, premiumOnly: true },
  { name: 'imagine', aliases: ['dalle', 'generateimg', 'aiimage', 'text2img'], category: 'ai', description: 'Generate gambar dengan AI DALL-E', example: '{prefix}imagine beautiful sunset', cooldown: 10, limit: 2, premiumOnly: true },
  { name: 'gemini', aliases: ['bard', 'google', 'googleai'], category: 'ai', description: 'Bertanya ke Google Gemini', example: '{prefix}gemini jelaskan quantum', cooldown: 5, limit: 3, premiumOnly: true },
  { name: 'claude', aliases: ['anthropic', 'claudeai'], category: 'ai', description: 'Bertanya ke Claude AI', example: '{prefix}claude bantu coding', cooldown: 5, limit: 3, premiumOnly: true },
  { name: 'simi', aliases: ['simsimi', 'chat', 'ngobrol'], category: 'ai', description: 'Chat dengan SimSimi', example: '{prefix}simi halo', cooldown: 3 },
  { name: 'aiimg', aliases: ['ai2img', 'txt2img', 'genimg'], category: 'ai', description: 'AI image generation', example: '{prefix}aiimg cat in space', cooldown: 10, limit: 2, premiumOnly: true },
  { name: 'removebg', aliases: ['rmbg', 'nobg', 'hapusbg', 'bgremove'], category: 'ai', description: 'Hapus background gambar dengan AI', example: '{prefix}removebg', cooldown: 10, limit: 2, premiumOnly: true },
  { name: 'upscale', aliases: ['enhance', 'hdr', 'tingkatkan'], category: 'ai', description: 'Upscale gambar dengan AI', example: '{prefix}upscale', cooldown: 10, limit: 2, premiumOnly: true },
  { name: 'toanime', aliases: ['anime2d', 'jadianime', 'animestyle'], category: 'ai', description: 'Convert foto ke anime', example: '{prefix}toanime', cooldown: 10, limit: 2, premiumOnly: true },
  { name: 'summarize', aliases: ['ringkas', 'summary', 'rangkum'], category: 'ai', description: 'Ringkas teks panjang', example: '{prefix}summarize [teks]', cooldown: 5, limit: 3, premiumOnly: true },
  { name: 'codeai', aliases: ['code', 'coding', 'generatecode'], category: 'ai', description: 'Generate code dengan AI', example: '{prefix}codeai buat fungsi sort', cooldown: 5, limit: 3, premiumOnly: true },
  { name: 'fixgrammar', aliases: ['grammar', 'fixtypo', 'koreksi'], category: 'ai', description: 'Perbaiki grammar dengan AI', example: '{prefix}fixgrammar i is good', cooldown: 3, limit: 5 },
  { name: 'aivoice', aliases: ['ttsai', 'voiceai', 'suaraai'], category: 'ai', description: 'Text to speech dengan AI voice', example: '{prefix}aivoice halo semua', cooldown: 5, limit: 2, premiumOnly: true },
  { name: 'ocr', aliases: ['readtext', 'bacateks', 'scantext'], category: 'ai', description: 'Baca teks dari gambar', example: '{prefix}ocr', cooldown: 5, limit: 3 },

  // ==================== SEARCH (20) ====================
  { name: 'google', aliases: ['g', 'cari', 'search'], category: 'search', description: 'Mencari di Google', example: '{prefix}google cara masak nasi', cooldown: 5, limit: 3 },
  { name: 'wiki', aliases: ['wikipedia', 'ensiklopedia'], category: 'search', description: 'Mencari di Wikipedia', example: '{prefix}wiki Indonesia', cooldown: 5, limit: 3 },
  { name: 'cuaca', aliases: ['weather', 'ramalan', 'prakiraan'], category: 'search', description: 'Melihat cuaca suatu kota', example: '{prefix}cuaca Jakarta', cooldown: 5, limit: 3 },
  { name: 'kbbi', aliases: ['kamus', 'artikata'], category: 'search', description: 'Mencari arti kata di KBBI', example: '{prefix}kbbi cinta', cooldown: 5, limit: 3 },
  { name: 'translate', aliases: ['tr', 'terjemah', 'trans'], category: 'search', description: 'Menerjemahkan teks', example: '{prefix}tr en halo apa kabar', cooldown: 3, limit: 5 },
  { name: 'github', aliases: ['gh', 'git'], category: 'search', description: 'Mencari profil GitHub', example: '{prefix}github torvalds', cooldown: 5, limit: 3 },
  { name: 'ytsearch', aliases: ['yts', 'youtubesearch', 'cariyoutube'], category: 'search', description: 'Cari video YouTube', example: '{prefix}ytsearch tutorial js', cooldown: 5, limit: 3 },
  { name: 'image', aliases: ['img', 'gambar', 'foto', 'picture'], category: 'search', description: 'Cari gambar di Google', example: '{prefix}image kucing lucu', cooldown: 5, limit: 3 },
  { name: 'lyrics', aliases: ['lirik', 'lagu'], category: 'search', description: 'Cari lirik lagu', example: '{prefix}lyrics bohemian rhapsody', cooldown: 5, limit: 3 },
  { name: 'film', aliases: ['movie', 'bioskop', 'sinopsis'], category: 'search', description: 'Cari info film', example: '{prefix}film avengers', cooldown: 5, limit: 3 },
  { name: 'anime', aliases: ['mal', 'myanimelist', 'infoanimee'], category: 'search', description: 'Cari info anime', example: '{prefix}anime naruto', cooldown: 5, limit: 3 },
  { name: 'manga', aliases: ['komik', 'infomanga'], category: 'search', description: 'Cari info manga', example: '{prefix}manga one piece', cooldown: 5, limit: 3 },
  { name: 'chord', aliases: ['kunci', 'gitar', 'chordgitar'], category: 'search', description: 'Cari chord gitar', example: '{prefix}chord peterpan', cooldown: 5, limit: 3 },
  { name: 'resep', aliases: ['recipe', 'masakan', 'caramasak'], category: 'search', description: 'Cari resep masakan', example: '{prefix}resep nasi goreng', cooldown: 5, limit: 3 },
  { name: 'jadwalsholat', aliases: ['sholat', 'prayer', 'waktusolat'], category: 'search', description: 'Jadwal sholat', example: '{prefix}jadwalsholat jakarta', cooldown: 5, limit: 3 },
  { name: 'quran', aliases: ['alquran', 'ayat', 'surah'], category: 'search', description: 'Cari ayat Al-Quran', example: '{prefix}quran 1:1', cooldown: 5, limit: 3 },
  { name: 'hadist', aliases: ['hadits', 'hadis'], category: 'search', description: 'Cari hadist', example: '{prefix}hadist bukhari 1', cooldown: 5, limit: 3 },
  { name: 'kurs', aliases: ['currency', 'exchange', 'matauang'], category: 'search', description: 'Cek kurs mata uang', example: '{prefix}kurs usd', cooldown: 5, limit: 3 },
  { name: 'crypto', aliases: ['btc', 'coin', 'bitcoin', 'eth'], category: 'search', description: 'Cek harga crypto', example: '{prefix}crypto bitcoin', cooldown: 5, limit: 3 },
  { name: 'news', aliases: ['berita', 'kabar', 'headline'], category: 'search', description: 'Berita terkini', example: '{prefix}news', cooldown: 5, limit: 3 },

  // ==================== DOWNLOADER (25) ====================
  { name: 'play', aliases: ['p', 'lagu', 'song', 'musik'], category: 'downloader', description: 'Download lagu dari YouTube', example: '{prefix}play dewa 19', cooldown: 10, limit: 5 },
  { name: 'playvid', aliases: ['pv', 'video', 'ytvideo', 'vid'], category: 'downloader', description: 'Download video dari YouTube', example: '{prefix}playvid tutorial', cooldown: 15, limit: 3 },
  { name: 'ytmp3', aliases: ['yta', 'youtubemp3', 'ytaudio'], category: 'downloader', description: 'Download audio YouTube via URL', example: '{prefix}ytmp3 url', cooldown: 10, limit: 5 },
  { name: 'ytmp4', aliases: ['ytv', 'youtubemp4', 'ytvideo'], category: 'downloader', description: 'Download video YouTube via URL', example: '{prefix}ytmp4 url', cooldown: 15, limit: 3 },
  { name: 'tiktok', aliases: ['tt', 'ttdl', 'tiktokdl', 'tiktokvideo'], category: 'downloader', description: 'Download video TikTok', example: '{prefix}tiktok url', cooldown: 10, limit: 5 },
  { name: 'tiktokmp3', aliases: ['ttmp3', 'tta', 'tiktokaudio', 'ttsound'], category: 'downloader', description: 'Download audio TikTok', example: '{prefix}tiktokmp3 url', cooldown: 10, limit: 5 },
  { name: 'instagram', aliases: ['ig', 'igdl', 'igdownload', 'instadl'], category: 'downloader', description: 'Download post Instagram', example: '{prefix}ig url', cooldown: 10, limit: 5 },
  { name: 'igreels', aliases: ['reels', 'igr', 'instareel'], category: 'downloader', description: 'Download Instagram Reels', example: '{prefix}igreels url', cooldown: 10, limit: 5 },
  { name: 'igstory', aliases: ['igs', 'instastory', 'story'], category: 'downloader', description: 'Download Instagram Story', example: '{prefix}igstory username', cooldown: 10, limit: 3, premiumOnly: true },
  { name: 'facebook', aliases: ['fb', 'fbdl', 'fbvideo', 'facebookdl'], category: 'downloader', description: 'Download video Facebook', example: '{prefix}fb url', cooldown: 10, limit: 5 },
  { name: 'twitter', aliases: ['tw', 'twdl', 'x', 'xdl', 'twitterdl'], category: 'downloader', description: 'Download video Twitter/X', example: '{prefix}twitter url', cooldown: 10, limit: 5 },
  { name: 'spotify', aliases: ['sp', 'spotifydl', 'spotifydownload'], category: 'downloader', description: 'Download lagu Spotify', example: '{prefix}spotify url', cooldown: 10, limit: 3, premiumOnly: true },
  { name: 'soundcloud', aliases: ['sc', 'scdl', 'soundclouddl'], category: 'downloader', description: 'Download lagu SoundCloud', example: '{prefix}soundcloud url', cooldown: 10, limit: 5 },
  { name: 'pinterest', aliases: ['pin', 'pindl', 'pinterestdl'], category: 'downloader', description: 'Download gambar Pinterest', example: '{prefix}pinterest url', cooldown: 5, limit: 5 },
  { name: 'pinterestsearch', aliases: ['pins', 'pinsearch', 'caripinterest'], category: 'downloader', description: 'Cari gambar Pinterest', example: '{prefix}pins aesthetic', cooldown: 5, limit: 5 },
  { name: 'mediafire', aliases: ['mf', 'mfdl', 'mediafiredl'], category: 'downloader', description: 'Download file Mediafire', example: '{prefix}mediafire url', cooldown: 10, limit: 3 },
  { name: 'gdrive', aliases: ['drive', 'googledrive', 'gdrivedl'], category: 'downloader', description: 'Download file Google Drive', example: '{prefix}gdrive url', cooldown: 10, limit: 3 },
  { name: 'sfile', aliases: ['sfilemobi', 'sfiledl'], category: 'downloader', description: 'Download file Sfile.mobi', example: '{prefix}sfile url', cooldown: 10, limit: 3 },
  { name: 'apk', aliases: ['playstore', 'apkdl', 'downloadapk'], category: 'downloader', description: 'Download APK dari Playstore', example: '{prefix}apk whatsapp', cooldown: 15, limit: 2, premiumOnly: true },
  { name: 'threads', aliases: ['threadsdl', 'threadsdownload'], category: 'downloader', description: 'Download post Threads', example: '{prefix}threads url', cooldown: 10, limit: 5 },
  { name: 'snackvideo', aliases: ['snack', 'snackdl', 'snackvideodl'], category: 'downloader', description: 'Download Snack Video', example: '{prefix}snackvideo url', cooldown: 10, limit: 5 },
  { name: 'likee', aliases: ['likeevid', 'likeedl', 'likeedownload'], category: 'downloader', description: 'Download video Likee', example: '{prefix}likee url', cooldown: 10, limit: 5 },
  { name: 'capcut', aliases: ['capcutdl', 'capcuttemplate'], category: 'downloader', description: 'Download template CapCut', example: '{prefix}capcut url', cooldown: 10, limit: 3 },
  { name: 'terabox', aliases: ['tera', 'teraboxdl', 'teradl'], category: 'downloader', description: 'Download file Terabox', example: '{prefix}terabox url', cooldown: 15, limit: 2, premiumOnly: true },
  { name: 'bilibili', aliases: ['bili', 'bilidl', 'bilibilidl'], category: 'downloader', description: 'Download video Bilibili', example: '{prefix}bilibili url', cooldown: 15, limit: 3 },

  // ==================== TOOLS (30) ====================
  { name: 'sticker', aliases: ['s', 'stiker', 'stickergambar', 'buatstiker'], category: 'tools', description: 'Buat sticker dari gambar/video', example: '{prefix}sticker', cooldown: 5, limit: 10 },
  { name: 'toimg', aliases: ['stickertoimg', 'stimg', 'stikerkeimg'], category: 'tools', description: 'Convert sticker ke gambar', example: '{prefix}toimg', cooldown: 5, limit: 10 },
  { name: 'tovid', aliases: ['stickertovid', 'stvid', 'stikerkevideo'], category: 'tools', description: 'Convert sticker ke video', example: '{prefix}tovid', cooldown: 5, limit: 5 },
  { name: 'togif', aliases: ['stickertogif', 'stgif', 'stikerkegif'], category: 'tools', description: 'Convert sticker ke GIF', example: '{prefix}togif', cooldown: 5, limit: 5 },
  { name: 'emojimix', aliases: ['emix', 'mixemoji', 'gabungemoji'], category: 'tools', description: 'Gabungkan 2 emoji', example: '{prefix}emojimix 😀+😎', cooldown: 5, limit: 5 },
  { name: 'qr', aliases: ['qrcode', 'buatqr', 'generateqr'], category: 'tools', description: 'Buat QR Code', example: '{prefix}qr https://google.com', cooldown: 5, limit: 5 },
  { name: 'readqr', aliases: ['scanqr', 'bacaqr', 'qrscan'], category: 'tools', description: 'Baca QR Code', example: '{prefix}readqr', cooldown: 5, limit: 5 },
  { name: 'tts', aliases: ['say', 'bicara', 'texttospeech'], category: 'tools', description: 'Text to speech', example: '{prefix}tts halo semua', cooldown: 5, limit: 5 },
  { name: 'toaudio', aliases: ['tomp3', 'vidtoaudio', 'extractaudio'], category: 'tools', description: 'Convert video ke audio', example: '{prefix}toaudio', cooldown: 10, limit: 5 },
  { name: 'tovn', aliases: ['ptt', 'voicenote', 'tovnote'], category: 'tools', description: 'Convert audio ke voice note', example: '{prefix}tovn', cooldown: 5, limit: 5 },
  { name: 'bass', aliases: ['bassbost', 'bassboost', 'tambahbass'], category: 'tools', description: 'Bass boost audio', example: '{prefix}bass', cooldown: 10, limit: 3, premiumOnly: true },
  { name: 'slow', aliases: ['slowmo', 'slowmotion', 'pelan'], category: 'tools', description: 'Slow motion audio', example: '{prefix}slow', cooldown: 10, limit: 3 },
  { name: 'fast', aliases: ['speedup', 'cepat', 'percepat'], category: 'tools', description: 'Speed up audio', example: '{prefix}fast', cooldown: 10, limit: 3 },
  { name: 'reverse', aliases: ['rev', 'balik', 'mundur'], category: 'tools', description: 'Reverse audio', example: '{prefix}reverse', cooldown: 10, limit: 3 },
  { name: 'compress', aliases: ['kompres', 'kecilkan', 'resize'], category: 'tools', description: 'Kompres gambar', example: '{prefix}compress', cooldown: 10, limit: 3 },
  { name: 'hd', aliases: ['remini', 'hdkan', 'jernih'], category: 'tools', description: 'HD-kan gambar', example: '{prefix}hd', cooldown: 15, limit: 2, premiumOnly: true },
  { name: 'wm', aliases: ['watermark', 'addwm', 'tambahwm'], category: 'tools', description: 'Tambah watermark', example: '{prefix}wm text', cooldown: 5, limit: 5 },
  { name: 'crop', aliases: ['potong', 'cropimg', 'potonggambar'], category: 'tools', description: 'Crop gambar', example: '{prefix}crop', cooldown: 5, limit: 5 },
  { name: 'flip', aliases: ['mirror', 'cermin', 'balikgambar'], category: 'tools', description: 'Flip gambar', example: '{prefix}flip', cooldown: 5, limit: 5 },
  { name: 'blur', aliases: ['blurimg', 'buramkan', 'buram'], category: 'tools', description: 'Blur gambar', example: '{prefix}blur', cooldown: 5, limit: 5 },
  { name: 'grayscale', aliases: ['bw', 'hitamputih', 'blackwhite'], category: 'tools', description: 'Grayscale gambar', example: '{prefix}grayscale', cooldown: 5, limit: 5 },
  { name: 'invert', aliases: ['negative', 'negatif', 'invertcolor'], category: 'tools', description: 'Invert warna gambar', example: '{prefix}invert', cooldown: 5, limit: 5 },
  { name: 'ssweb', aliases: ['ss', 'screenshot', 'webss', 'screenshotweb'], category: 'tools', description: 'Screenshot website', example: '{prefix}ssweb google.com', cooldown: 10, limit: 3 },
  { name: 'shorturl', aliases: ['short', 'tinyurl', 'pendekurl', 'bitly'], category: 'tools', description: 'Perpendek URL', example: '{prefix}shorturl url', cooldown: 5, limit: 5 },
  { name: 'calc', aliases: ['kalkulator', 'math', 'hitung', 'calculator'], category: 'tools', description: 'Kalkulator', example: '{prefix}calc 2+2', cooldown: 3, limit: 10 },
  { name: 'nulis', aliases: ['tulis', 'handwriting', 'tulisan'], category: 'tools', description: 'Buat tulisan tangan', example: '{prefix}nulis halo', cooldown: 10, limit: 3 },
  { name: 'base64enc', aliases: ['b64e', 'encodebase64', 'base64encode'], category: 'tools', description: 'Encode Base64', example: '{prefix}base64enc text', cooldown: 3, limit: 10 },
  { name: 'base64dec', aliases: ['b64d', 'decodebase64', 'base64decode'], category: 'tools', description: 'Decode Base64', example: '{prefix}base64dec encoded', cooldown: 3, limit: 10 },
  { name: 'binary', aliases: ['bin', 'tobinary', 'texttobin'], category: 'tools', description: 'Convert text ke binary', example: '{prefix}binary hello', cooldown: 3, limit: 10 },
  { name: 'debinary', aliases: ['debin', 'frombinary', 'bintotext'], category: 'tools', description: 'Convert binary ke text', example: '{prefix}debinary 01001000', cooldown: 3, limit: 10 },

  // ==================== FUN (25) ====================
  { name: 'fakta', aliases: ['fact', 'faktaunik', 'randomfact'], category: 'fun', description: 'Fakta random', example: '{prefix}fakta', cooldown: 3, limit: 5 },
  { name: 'quote', aliases: ['quotes', 'kata', 'katakata'], category: 'fun', description: 'Quote motivasi', example: '{prefix}quote', cooldown: 3, limit: 5 },
  { name: 'quoteanime', aliases: ['animequote', 'quotesanime'], category: 'fun', description: 'Quote anime', example: '{prefix}quoteanime', cooldown: 3, limit: 5 },
  { name: 'jokes', aliases: ['joke', 'lelucon', 'lawak', 'humor'], category: 'fun', description: 'Jokes lucu', example: '{prefix}jokes', cooldown: 3, limit: 5 },
  { name: 'meme', aliases: ['memes', 'randommeme'], category: 'fun', description: 'Meme random', example: '{prefix}meme', cooldown: 5, limit: 5 },
  { name: 'darkjoke', aliases: ['dj', 'darkjokes', 'darkhumor'], category: 'fun', description: 'Dark jokes', example: '{prefix}darkjoke', cooldown: 5, limit: 3 },
  { name: 'pantun', aliases: ['randompantun', 'pantunrandom'], category: 'fun', description: 'Pantun random', example: '{prefix}pantun', cooldown: 3, limit: 5 },
  { name: 'puisi', aliases: ['poem', 'sajak', 'randompuisi'], category: 'fun', description: 'Puisi random', example: '{prefix}puisi', cooldown: 3, limit: 5 },
  { name: 'cerpen', aliases: ['ceritapendek', 'shortstory'], category: 'fun', description: 'Cerpen random', example: '{prefix}cerpen', cooldown: 5, limit: 3 },
  { name: 'truth', aliases: ['truthordare', 'tod'], category: 'fun', description: 'Truth or dare - truth', example: '{prefix}truth', cooldown: 3, limit: 5 },
  { name: 'dare', aliases: ['tantangan', 'challenge'], category: 'fun', description: 'Truth or dare - dare', example: '{prefix}dare', cooldown: 3, limit: 5 },
  { name: 'bucin', aliases: ['katabucin', 'bucinquote'], category: 'fun', description: 'Kata-kata bucin', example: '{prefix}bucin', cooldown: 3, limit: 5 },
  { name: 'galau', aliases: ['katagalau', 'sedih', 'sad'], category: 'fun', description: 'Kata-kata galau', example: '{prefix}galau', cooldown: 3, limit: 5 },
  { name: 'gombal', aliases: ['katagombal', 'rayu', 'pickup'], category: 'fun', description: 'Kata-kata gombal', example: '{prefix}gombal', cooldown: 3, limit: 5 },
  { name: 'motivasi', aliases: ['motivation', 'semangat', 'inspire'], category: 'fun', description: 'Kata motivasi', example: '{prefix}motivasi', cooldown: 3, limit: 5 },
  { name: 'renungan', aliases: ['reflection', 'muhasabah'], category: 'fun', description: 'Kata renungan', example: '{prefix}renungan', cooldown: 3, limit: 5 },
  { name: 'dilan', aliases: ['quotedilan', 'dilanquote'], category: 'fun', description: 'Quote Dilan', example: '{prefix}dilan', cooldown: 3, limit: 5 },
  { name: 'bijak', aliases: ['katabijak', 'wisdom', 'wise'], category: 'fun', description: 'Kata bijak', example: '{prefix}bijak', cooldown: 3, limit: 5 },
  { name: 'randomnama', aliases: ['randname', 'namarandom', 'generatename'], category: 'fun', description: 'Generate nama random', example: '{prefix}randomnama', cooldown: 3, limit: 5 },
  { name: 'ship', aliases: ['match', 'cocok', 'kecocokan', 'love'], category: 'fun', description: 'Cek kecocokan', example: '{prefix}ship @user1 @user2', cooldown: 5, limit: 5 },
  { name: 'rate', aliases: ['nilai', 'rating', 'skor'], category: 'fun', description: 'Rate sesuatu', example: '{prefix}rate @user', cooldown: 5, limit: 5 },
  { name: 'zodiak', aliases: ['zodiac', 'horoscope', 'ramalan'], category: 'fun', description: 'Ramalan zodiak', example: '{prefix}zodiak aries', cooldown: 5, limit: 3 },
  { name: 'primbon', aliases: ['primbonJawa', 'weton'], category: 'fun', description: 'Primbon Jawa', example: '{prefix}primbon 01-01-2000', cooldown: 5, limit: 3 },
  { name: 'artinama', aliases: ['nameart', 'meaningname', 'artinama'], category: 'fun', description: 'Arti nama', example: '{prefix}artinama budi', cooldown: 5, limit: 3 },
  { name: 'cekjodoh', aliases: ['jodoh', 'matchmaking', 'cintaku'], category: 'fun', description: 'Cek jodoh', example: '{prefix}cekjodoh nama1 nama2', cooldown: 5, limit: 5 },

  // ==================== GAMES (20) ====================
  { name: 'slot', aliases: ['slots', 'slotmachine', 'mesinslot'], category: 'game', description: 'Main slot machine', example: '{prefix}slot', cooldown: 5, limit: 10 },
  { name: 'dice', aliases: ['dadu', 'roll', 'rolldice'], category: 'game', description: 'Lempar dadu', example: '{prefix}dice', cooldown: 3, limit: 10 },
  { name: 'coinflip', aliases: ['flip', 'coin', 'koin', 'lemparkoin'], category: 'game', description: 'Lempar koin', example: '{prefix}coinflip', cooldown: 3, limit: 10 },
  { name: 'rps', aliases: ['suit', 'jankenpon', 'bgs', 'batugunting'], category: 'game', description: 'Batu gunting kertas', example: '{prefix}rps batu', cooldown: 3, limit: 10 },
  { name: 'tebakgambar', aliases: ['tg', 'guesspicture', 'tebakgmbr'], category: 'game', description: 'Tebak gambar', example: '{prefix}tebakgambar', cooldown: 10, limit: 5 },
  { name: 'tebakkata', aliases: ['tk', 'guessword', 'tebakkta'], category: 'game', description: 'Tebak kata', example: '{prefix}tebakkata', cooldown: 10, limit: 5 },
  { name: 'tebakangka', aliases: ['ta', 'guessnumber', 'tebaknum'], category: 'game', description: 'Tebak angka', example: '{prefix}tebakangka', cooldown: 10, limit: 5 },
  { name: 'tebaklirik', aliases: ['tl', 'guesslyrics', 'tebaklrik'], category: 'game', description: 'Tebak lirik lagu', example: '{prefix}tebaklirik', cooldown: 10, limit: 5 },
  { name: 'tebakbendera', aliases: ['tb', 'guessflag', 'tebakflag'], category: 'game', description: 'Tebak bendera negara', example: '{prefix}tebakbendera', cooldown: 10, limit: 5 },
  { name: 'tebaklagu', aliases: ['tbl', 'guesssong', 'tebaksong'], category: 'game', description: 'Tebak lagu', example: '{prefix}tebaklagu', cooldown: 10, limit: 5 },
  { name: 'tebakkimia', aliases: ['tbk', 'guesschemistry', 'tebakelement'], category: 'game', description: 'Tebak unsur kimia', example: '{prefix}tebakkimia', cooldown: 10, limit: 5 },
  { name: 'quiz', aliases: ['kuis', 'trivia', 'quiztime'], category: 'game', description: 'Quiz pengetahuan umum', example: '{prefix}quiz', cooldown: 10, limit: 5 },
  { name: 'mathgame', aliases: ['matematika', 'mathquiz', 'hitungan'], category: 'game', description: 'Quiz matematika', example: '{prefix}mathgame', cooldown: 10, limit: 5 },
  { name: 'susunkata', aliases: ['sk', 'wordscramble', 'acakkata'], category: 'game', description: 'Susun kata acak', example: '{prefix}susunkata', cooldown: 10, limit: 5 },
  { name: 'tictactoe', aliases: ['ttt', 'xo', 'silangbulat'], category: 'game', description: 'Main tic tac toe', example: '{prefix}tictactoe @user', cooldown: 10, limit: 3 },
  { name: 'hangman', aliases: ['gantung', 'tebakkatahangman'], category: 'game', description: 'Main hangman', example: '{prefix}hangman', cooldown: 10, limit: 5 },
  { name: 'family100', aliases: ['f100', 'survei', 'familyfeud'], category: 'game', description: 'Family 100 game', example: '{prefix}family100', cooldown: 15, limit: 3 },
  { name: 'caklontong', aliases: ['cl', 'caklontongquiz'], category: 'game', description: 'Cak Lontong quiz', example: '{prefix}caklontong', cooldown: 10, limit: 5 },
  { name: 'asahotak', aliases: ['ao', 'brainteaser', 'tebaktebakan'], category: 'game', description: 'Asah otak', example: '{prefix}asahotak', cooldown: 10, limit: 5 },

  // ==================== ANIME & RANDOM (20) ====================
  { name: 'waifu', aliases: ['waifupic', 'randomwaifu'], category: 'anime', description: 'Random waifu image', example: '{prefix}waifu', cooldown: 5, limit: 5 },
  { name: 'neko', aliases: ['nekopics', 'catgirl'], category: 'anime', description: 'Random neko image', example: '{prefix}neko', cooldown: 5, limit: 5 },
  { name: 'shinobu', aliases: ['shinobupic', 'kochoushinobu'], category: 'anime', description: 'Random shinobu image', example: '{prefix}shinobu', cooldown: 5, limit: 5 },
  { name: 'megumin', aliases: ['meguminpic', 'explosion'], category: 'anime', description: 'Random megumin image', example: '{prefix}megumin', cooldown: 5, limit: 5 },
  { name: 'loli', aliases: ['lolipic', 'kawaii'], category: 'anime', description: 'Random loli image', example: '{prefix}loli', cooldown: 5, limit: 5 },
  { name: 'husbu', aliases: ['husbando', 'husbandopic', 'ikemen'], category: 'anime', description: 'Random husbando image', example: '{prefix}husbu', cooldown: 5, limit: 5 },
  { name: 'wallpaperanime', aliases: ['wpanime', 'animewallpaper', 'animewp'], category: 'anime', description: 'Wallpaper anime', example: '{prefix}wallpaperanime', cooldown: 5, limit: 5 },
  { name: 'cosplay', aliases: ['cosplaypic', 'cosplayer'], category: 'anime', description: 'Random cosplay image', example: '{prefix}cosplay', cooldown: 5, limit: 5 },
  { name: 'kucing', aliases: ['cat', 'meong', 'catpic'], category: 'random', description: 'Random gambar kucing', example: '{prefix}kucing', cooldown: 5, limit: 5 },
  { name: 'anjing', aliases: ['dog', 'dogpic', 'gukguk'], category: 'random', description: 'Random gambar anjing', example: '{prefix}anjing', cooldown: 5, limit: 5 },
  { name: 'aesthetic', aliases: ['aestheticpic', 'estetik'], category: 'random', description: 'Random aesthetic image', example: '{prefix}aesthetic', cooldown: 5, limit: 5 },
  { name: 'wallpaper', aliases: ['wp', 'randomwp', 'wallpapers'], category: 'random', description: 'Random wallpaper', example: '{prefix}wallpaper', cooldown: 5, limit: 5 },
  { name: 'couple', aliases: ['pp', 'ppcouple', 'couplepic'], category: 'random', description: 'Random couple PP', example: '{prefix}couple', cooldown: 5, limit: 5 },
  { name: 'darkwp', aliases: ['darkwallpaper', 'dark', 'gelap'], category: 'random', description: 'Dark wallpaper', example: '{prefix}darkwp', cooldown: 5, limit: 5 },
  { name: 'nature', aliases: ['alam', 'naturepic', 'pemandangan'], category: 'random', description: 'Nature wallpaper', example: '{prefix}nature', cooldown: 5, limit: 5 },
  { name: 'space', aliases: ['galaxy', 'luar angkasa', 'spacepic'], category: 'random', description: 'Space wallpaper', example: '{prefix}space', cooldown: 5, limit: 5 },
  { name: 'car', aliases: ['mobil', 'carpic', 'otomotif'], category: 'random', description: 'Car wallpaper', example: '{prefix}car', cooldown: 5, limit: 5 },
  { name: 'motor', aliases: ['motorcycle', 'motorpic', 'bike'], category: 'random', description: 'Motorcycle wallpaper', example: '{prefix}motor', cooldown: 5, limit: 5 },
  { name: 'teknologi', aliases: ['tech', 'technology', 'techpic'], category: 'random', description: 'Technology wallpaper', example: '{prefix}teknologi', cooldown: 5, limit: 5 },

  // ==================== GROUP (35) ====================
  { name: 'kick', aliases: ['tendang', 'keluarkan', 'remove'], category: 'group', description: 'Kick member dari grup', example: '{prefix}kick @user', cooldown: 5, groupOnly: true, adminOnly: true, botAdminRequired: true },
  { name: 'add', aliases: ['tambah', 'invite', 'masukkan'], category: 'group', description: 'Tambah member ke grup', example: '{prefix}add 628xxx', cooldown: 5, groupOnly: true, adminOnly: true, botAdminRequired: true },
  { name: 'promote', aliases: ['jadiadmin', 'up', 'naikkan'], category: 'group', description: 'Jadikan admin', example: '{prefix}promote @user', cooldown: 5, groupOnly: true, adminOnly: true, botAdminRequired: true },
  { name: 'demote', aliases: ['hapusadmin', 'down', 'turunkan'], category: 'group', description: 'Hapus admin', example: '{prefix}demote @user', cooldown: 5, groupOnly: true, adminOnly: true, botAdminRequired: true },
  { name: 'setname', aliases: ['setnamegc', 'gantinama', 'ubahnamagc'], category: 'group', description: 'Ubah nama grup', example: '{prefix}setname nama baru', cooldown: 10, groupOnly: true, adminOnly: true, botAdminRequired: true },
  { name: 'setdesc', aliases: ['setdescgc', 'setdeskripsi', 'ubahdesc'], category: 'group', description: 'Ubah deskripsi grup', example: '{prefix}setdesc deskripsi', cooldown: 10, groupOnly: true, adminOnly: true, botAdminRequired: true },
  { name: 'setppgc', aliases: ['setfotogc', 'setppgrup', 'ubahfotogc'], category: 'group', description: 'Ubah foto grup', example: '{prefix}setppgc', cooldown: 10, groupOnly: true, adminOnly: true, botAdminRequired: true },
  { name: 'linkgc', aliases: ['linkgrup', 'getlink', 'gruplink'], category: 'group', description: 'Dapatkan link grup', example: '{prefix}linkgc', cooldown: 5, groupOnly: true, botAdminRequired: true },
  { name: 'revoke', aliases: ['resetlink', 'newlink', 'linkbaru'], category: 'group', description: 'Reset link grup', example: '{prefix}revoke', cooldown: 10, groupOnly: true, adminOnly: true, botAdminRequired: true },
  { name: 'tagall', aliases: ['mentionall', 'everyone', 'all'], category: 'group', description: 'Tag semua member', example: '{prefix}tagall pesan', cooldown: 30, groupOnly: true, adminOnly: true },
  { name: 'hidetag', aliases: ['ht', 'hiddentag', 'tagsilent'], category: 'group', description: 'Hidden tag semua member', example: '{prefix}hidetag pesan', cooldown: 30, groupOnly: true, adminOnly: true },
  { name: 'listadmin', aliases: ['admins', 'adminlist', 'daftaradmin'], category: 'group', description: 'List admin grup', example: '{prefix}listadmin', cooldown: 5, groupOnly: true },
  { name: 'infogc', aliases: ['gcinfo', 'grupinfo', 'infogrup', 'infogroup'], category: 'group', description: 'Info lengkap grup (Wibusoft style)', example: '{prefix}infogc', cooldown: 5, groupOnly: true },
  { name: 'open', aliases: ['buka', 'opengc', 'bukagrup'], category: 'group', description: 'Buka grup (semua bisa chat)', example: '{prefix}open', cooldown: 5, groupOnly: true, adminOnly: true, botAdminRequired: true },
  { name: 'close', aliases: ['tutup', 'closegc', 'tutupgrup'], category: 'group', description: 'Tutup grup (admin only chat)', example: '{prefix}close', cooldown: 5, groupOnly: true, adminOnly: true, botAdminRequired: true },
  { name: 'welcome', aliases: ['setwelcome', 'welcomemsg', 'pesanwelcome'], category: 'group', description: 'Set pesan welcome on/off/set', example: '{prefix}welcome on/off/set <pesan>', cooldown: 5, groupOnly: true, adminOnly: true },
  { name: 'goodbye', aliases: ['setgoodbye', 'goodbyemsg', 'pesangoodbye', 'left'], category: 'group', description: 'Set pesan goodbye on/off/set', example: '{prefix}goodbye on/off/set <pesan>', cooldown: 5, groupOnly: true, adminOnly: true },
  { name: 'antilink', aliases: ['nolink', 'blocklink'], category: 'group', description: 'Anti link grup lain', example: '{prefix}antilink on/off/warn', cooldown: 5, groupOnly: true, adminOnly: true },
  { name: 'antispam', aliases: ['nospam', 'blockspam'], category: 'group', description: 'Anti spam message', example: '{prefix}antispam on/off', cooldown: 5, groupOnly: true, adminOnly: true },
  { name: 'mute', aliases: ['mutegc', 'silent', 'diam'], category: 'group', description: 'Mute bot di grup', example: '{prefix}mute on/off', cooldown: 5, groupOnly: true, adminOnly: true },
  { name: 'setrules', aliases: ['rules', 'setaturan', 'aturan'], category: 'group', description: 'Set rules grup', example: '{prefix}setrules <aturan>', cooldown: 5, groupOnly: true, adminOnly: true },
  { name: 'antidelete', aliases: ['antidel', 'nodelete'], category: 'group', description: 'Anti delete message', example: '{prefix}antidelete on/off', cooldown: 5, groupOnly: true, adminOnly: true },
  { name: 'antibot', aliases: ['nobot', 'blockbot'], category: 'group', description: 'Anti bot lain', example: '{prefix}antibot on/off', cooldown: 5, groupOnly: true, adminOnly: true },
  { name: 'antiwame', aliases: ['nowame', 'blockwame'], category: 'group', description: 'Anti wa.me links', example: '{prefix}antiwame on/off', cooldown: 5, groupOnly: true, adminOnly: true },
  { name: 'antiluar', aliases: ['noluar', 'blockluar'], category: 'group', description: 'Anti nomor luar negeri', example: '{prefix}antiluar on/off', cooldown: 5, groupOnly: true, adminOnly: true },
  { name: 'antiviewonce', aliases: ['noviewonce', 'blockviewonce'], category: 'group', description: 'Anti view once message', example: '{prefix}antiviewonce on/off', cooldown: 5, groupOnly: true, adminOnly: true },
  { name: 'antibadword', aliases: ['nobadword', 'blockkata'], category: 'group', description: 'Anti kata kasar', example: '{prefix}antibadword on/off', cooldown: 5, groupOnly: true, adminOnly: true },
  { name: 'antisticker', aliases: ['nosticker', 'blocksticker'], category: 'group', description: 'Anti sticker', example: '{prefix}antisticker on/off', cooldown: 5, groupOnly: true, adminOnly: true },
  { name: 'antilinkchannel', aliases: ['nochannel', 'blockchannel'], category: 'group', description: 'Anti link channel', example: '{prefix}antilinkchannel on/off', cooldown: 5, groupOnly: true, adminOnly: true },
  { name: 'game', aliases: ['gamegc', 'togglegame'], category: 'group', description: 'Toggle game di grup', example: '{prefix}game on/off', cooldown: 5, groupOnly: true, adminOnly: true },

  // ==================== OWNER (15) ====================
  { name: 'broadcast', aliases: ['bc', 'announce', 'pengumuman'], category: 'owner', description: 'Broadcast pesan ke semua chat', example: '{prefix}broadcast pesan', cooldown: 60, ownerOnly: true },
  { name: 'ban', aliases: ['banned', 'block', 'blokir'], category: 'owner', description: 'Ban user dari bot', example: '{prefix}ban @user', cooldown: 5, ownerOnly: true },
  { name: 'unban', aliases: ['unbanned', 'unblock', 'bukablokir'], category: 'owner', description: 'Unban user', example: '{prefix}unban @user', cooldown: 5, ownerOnly: true },
  { name: 'addprem', aliases: ['addpremium', 'tambahprem', 'setpremium'], category: 'owner', description: 'Tambah user premium', example: '{prefix}addprem @user 30d', cooldown: 5, ownerOnly: true },
  { name: 'delprem', aliases: ['delpremium', 'hapusprem', 'removepremium'], category: 'owner', description: 'Hapus user premium', example: '{prefix}delprem @user', cooldown: 5, ownerOnly: true },
  { name: 'listprem', aliases: ['listpremium', 'premlist', 'daftarpremium'], category: 'owner', description: 'List user premium', example: '{prefix}listprem', cooldown: 5, ownerOnly: true },
  { name: 'setprefix', aliases: ['prefix', 'changeprefix', 'ubahprefix'], category: 'owner', description: 'Ubah prefix bot', example: '{prefix}setprefix !', cooldown: 5, ownerOnly: true },
  { name: 'setbotname', aliases: ['botname', 'namabot', 'ubahnamabot'], category: 'owner', description: 'Ubah nama bot', example: '{prefix}setbotname nama', cooldown: 10, ownerOnly: true },
  { name: 'setbotbio', aliases: ['botbio', 'biobot', 'ubahbiobot'], category: 'owner', description: 'Ubah bio bot', example: '{prefix}setbotbio bio', cooldown: 10, ownerOnly: true },
  { name: 'setppbot', aliases: ['ppbot', 'fotobot', 'ubahppbot'], category: 'owner', description: 'Ubah foto profil bot', example: '{prefix}setppbot', cooldown: 10, ownerOnly: true },
  { name: 'join', aliases: ['joingc', 'joingrup', 'masukgrup'], category: 'owner', description: 'Join grup via link', example: '{prefix}join link', cooldown: 10, ownerOnly: true },
  { name: 'leave', aliases: ['leavegc', 'keluar', 'keluargrup'], category: 'owner', description: 'Leave dari grup', example: '{prefix}leave', cooldown: 5, ownerOnly: true },
  { name: 'listgc', aliases: ['listgrup', 'gruplist', 'daftargrup'], category: 'owner', description: 'List semua grup', example: '{prefix}listgc', cooldown: 5, ownerOnly: true },
  { name: 'restart', aliases: ['reboot', 'restartbot', 'reloadbot'], category: 'owner', description: 'Restart bot', example: '{prefix}restart', cooldown: 60, ownerOnly: true },
  { name: 'eval', aliases: ['ev', 'evaluate', 'run'], category: 'owner', description: 'Evaluate code', example: '{prefix}eval code', cooldown: 5, ownerOnly: true },

  // ==================== MAKER (15) ====================
  { name: 'logo', aliases: ['textlogo', 'buatlogo', 'logotext'], category: 'maker', description: 'Buat logo text', example: '{prefix}logo text', cooldown: 10, limit: 3 },
  { name: 'attp', aliases: ['animatedttp', 'giftext', 'textgif'], category: 'maker', description: 'Animated text to picture', example: '{prefix}attp text', cooldown: 10, limit: 3 },
  { name: 'ttp', aliases: ['texttopic', 'textpic', 'textimage'], category: 'maker', description: 'Text to picture', example: '{prefix}ttp text', cooldown: 10, limit: 5 },
  { name: 'welcome1', aliases: ['welcomeimg1', 'buatwelcome1'], category: 'maker', description: 'Buat gambar welcome 1', example: '{prefix}welcome1 @user', cooldown: 10, limit: 3 },
  { name: 'welcome2', aliases: ['welcomeimg2', 'buatwelcome2'], category: 'maker', description: 'Buat gambar welcome 2', example: '{prefix}welcome2 @user', cooldown: 10, limit: 3 },
  { name: 'goodbye1', aliases: ['goodbyeimg1', 'buatgoodbye1'], category: 'maker', description: 'Buat gambar goodbye 1', example: '{prefix}goodbye1 @user', cooldown: 10, limit: 3 },
  { name: 'goodbye2', aliases: ['goodbyeimg2', 'buatgoodbye2'], category: 'maker', description: 'Buat gambar goodbye 2', example: '{prefix}goodbye2 @user', cooldown: 10, limit: 3 },
  { name: 'carbon', aliases: ['carboncode', 'codeimg', 'codepic'], category: 'maker', description: 'Buat carbon code', example: '{prefix}carbon code', cooldown: 10, limit: 3 },
  { name: 'certificate', aliases: ['sertifikat', 'cert', 'buatsertifikat'], category: 'maker', description: 'Buat sertifikat', example: '{prefix}certificate nama', cooldown: 10, limit: 3 },
  { name: 'lovemsg', aliases: ['lovemessage', 'pesancinta', 'lovetext'], category: 'maker', description: 'Buat love message', example: '{prefix}lovemsg text', cooldown: 10, limit: 3 },
  { name: 'wanted', aliases: ['wantedposter', 'buatwanted'], category: 'maker', description: 'Buat poster wanted', example: '{prefix}wanted', cooldown: 10, limit: 3 },
  { name: 'jail', aliases: ['penjara', 'jaileffect', 'dipenjara'], category: 'maker', description: 'Buat efek jail', example: '{prefix}jail', cooldown: 10, limit: 3 },
  { name: 'triggered', aliases: ['triggeredeffect', 'marah'], category: 'maker', description: 'Buat efek triggered', example: '{prefix}triggered', cooldown: 10, limit: 3 },
  { name: 'wasted', aliases: ['wastedgta', 'gtawasted', 'mati'], category: 'maker', description: 'Buat efek wasted GTA', example: '{prefix}wasted', cooldown: 10, limit: 3 },
  { name: 'trash', aliases: ['sampah', 'trasheffect', 'buangsampah'], category: 'maker', description: 'Buat efek trash', example: '{prefix}trash', cooldown: 10, limit: 3 },
];

/**
 * Generate command metadata for API
 */
function generateCmdMeta() {
  const categories = {};
  const stats = { total: COMMANDS.length, premium: 0, active: 0, inactive: 0, byCategory: {} };
  COMMANDS.forEach(cmd => {
    if (!categories[cmd.category]) { categories[cmd.category] = []; stats.byCategory[cmd.category] = 0; }
    categories[cmd.category].push(cmd);
    stats.byCategory[cmd.category]++;
    if (cmd.premiumOnly) stats.premium++;
    stats.active++;
  });
  return { commands: COMMANDS, categories, stats };
}

function getCommand(name) {
  const lowerName = name.toLowerCase();
  return COMMANDS.find(cmd => cmd.name === lowerName || (cmd.aliases && cmd.aliases.includes(lowerName)));
}

function getCommandsByCategory(category) { return COMMANDS.filter(cmd => cmd.category === category); }
function getCategories() { return [...new Set(COMMANDS.map(cmd => cmd.category))]; }

module.exports = { COMMANDS, generateCmdMeta, getCommand, getCommandsByCategory, getCategories };
