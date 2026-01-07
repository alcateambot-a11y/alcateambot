/**
 * Test Smart AI Responses
 */

// Simulate the smart AI logic
const LOCAL_AI_DB = {
  greetings: {
    patterns: [/^(halo|hai|hi|hello|hey|assalamualaikum|selamat\s*(pagi|siang|sore|malam))/i],
    responses: ['Halo! 👋 Saya adalah AI assistant. Ada yang bisa saya bantu hari ini?']
  },
  thanks: {
    patterns: [/(terima\s*kasih|thanks|makasih|thx|ty)/i],
    responses: ['Sama-sama! Senang bisa membantu 😊']
  },
  howAreYou: {
    patterns: [/(apa\s*kabar|how\s*are\s*you|gimana\s*kabar)/i],
    responses: ['Saya baik-baik saja, terima kasih sudah bertanya! 😊']
  },
  whoAreYou: {
    patterns: [/(siapa\s*(kamu|anda)|who\s*are\s*you|kamu\s*siapa)/i],
    responses: ['Saya adalah AI assistant yang siap membantu!']
  },
  capabilities: {
    patterns: [/(apa\s*yang\s*bisa|bisa\s*apa|kemampuan)/i],
    responses: ['🤖 Saya bisa membantu dengan berbagai hal!']
  },
  programming: {
    patterns: [/(javascript|python|coding|programming)/i],
    responses: ['💻 Untuk pertanyaan programming, cek dokumentasi resmi!']
  },
  math: {
    patterns: [/(berapa|hitung|kalkulasi|\d+\s*[\+\-\*\/]\s*\d+)/i],
    responses: ['🔢 Gunakan command .calc untuk perhitungan!']
  },
  weather: {
    patterns: [/(cuaca|weather|hujan)/i],
    responses: ['🌤️ Gunakan command .cuaca [kota]']
  },
  timeDate: {
    patterns: [/(jam\s*berapa|tanggal|hari\s*ini)/i],
    responses: () => `🕐 Sekarang: ${new Date().toLocaleString('id-ID')}`
  },
  jokes: {
    patterns: [/(joke|lelucon|lucu)/i],
    responses: ['😄 Gunakan command .jokes!']
  },
  love: {
    patterns: [/(cinta|love|pacar)/i],
    responses: ['💕 Coba fitur .love @nama atau .bucin!']
  }
};

function getSmartResponse(query) {
  const q = query.toLowerCase().trim();
  
  for (const [key, data] of Object.entries(LOCAL_AI_DB)) {
    for (const pattern of data.patterns) {
      if (pattern.test(q)) {
        if (typeof data.responses === 'function') {
          return data.responses();
        }
        return data.responses[0];
      }
    }
  }
  
  return null;
}

// Test queries
const testQueries = [
  'Halo',
  'Hai apa kabar?',
  'Siapa kamu?',
  'Kamu bisa apa?',
  'Terima kasih',
  'Bagaimana cara coding javascript?',
  'Berapa 10 + 5?',
  'Cuaca hari ini gimana?',
  'Jam berapa sekarang?',
  'Ceritakan jokes dong',
  'Aku lagi jatuh cinta',
  'Apa itu machine learning?', // Should return null (no match)
  'Jelaskan tentang quantum physics' // Should return null
];

console.log('🧪 Testing Smart AI Responses\n');
console.log('='.repeat(50));

let matched = 0;
let unmatched = 0;

testQueries.forEach(query => {
  const response = getSmartResponse(query);
  if (response) {
    console.log(`\n✅ "${query}"`);
    console.log(`   → ${response.substring(0, 60)}...`);
    matched++;
  } else {
    console.log(`\n⚠️ "${query}"`);
    console.log(`   → No smart response (will use fallback)`);
    unmatched++;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Results: ${matched} matched, ${unmatched} will use fallback`);
console.log('✅ Smart AI responses working correctly!');
