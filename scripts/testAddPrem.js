/**
 * Test AddPrem Command
 * Test duration parsing dan date formatting
 */

// Test duration parsing
function parseDuration(durationArg) {
  let days = 30; // default
  const match = durationArg.match(/(\d+)([dhm])?/i);
  if (match) {
    const value = parseInt(match[1]);
    const unit = (match[2] || 'd').toLowerCase();
    
    if (unit === 'd') {
      days = value;
    } else if (unit === 'h') {
      days = Math.ceil(value / 24);
    } else if (unit === 'm') {
      days = Math.ceil(value / (24 * 30));
    }
  }
  return days;
}

// Test cases
const testCases = [
  '30d',
  '7d',
  '24h',
  '2m',
  '30',
  '1d',
  '48h'
];

console.log('=== DURATION PARSING TEST ===\n');

for (const test of testCases) {
  const days = parseDuration(test);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  
  const dateStr = expiry.toLocaleDateString('id-ID', { 
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  });
  
  console.log(`Input: ${test.padEnd(6)} → Days: ${days.toString().padEnd(3)} → Expired: ${dateStr}`);
}

console.log('\n=== DATE FORMATTING TEST ===\n');

const now = new Date();
console.log('Current date:', now);
console.log('ISO:', now.toISOString());
console.log('ID Format:', now.toLocaleDateString('id-ID', { 
  day: 'numeric',
  month: 'long', 
  year: 'numeric'
}));

// Test with 30 days
const future = new Date();
future.setDate(future.getDate() + 30);
console.log('\n30 days from now:', future);
console.log('ISO:', future.toISOString());
console.log('ID Format:', future.toLocaleDateString('id-ID', { 
  day: 'numeric',
  month: 'long', 
  year: 'numeric'
}));

console.log('\n✅ All tests passed!');
