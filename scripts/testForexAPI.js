const axios = require('axios');

async function testAPIs() {
  console.log('Testing Forex/Gold APIs...\n');
  
  // 1. Test Frankfurter (Forex)
  console.log('1. Testing Frankfurter API (EUR/USD)...');
  try {
    const res = await axios.get('https://api.frankfurter.app/latest?from=EUR&to=USD', { timeout: 10000 });
    console.log('   ✅ Frankfurter:', res.data.rates.USD);
  } catch (e) {
    console.log('   ❌ Frankfurter failed:', e.message);
  }
  
  // 2. Test Open Exchange Rate
  console.log('\n2. Testing Open ER API (EUR/USD)...');
  try {
    const res = await axios.get('https://open.er-api.com/v6/latest/EUR', { timeout: 10000 });
    console.log('   ✅ Open ER:', res.data.rates?.USD);
  } catch (e) {
    console.log('   ❌ Open ER failed:', e.message);
  }
  
  // 3. Test ExchangeRate.host
  console.log('\n3. Testing ExchangeRate.host (EUR/USD)...');
  try {
    const res = await axios.get('https://api.exchangerate.host/latest?base=EUR&symbols=USD', { timeout: 10000 });
    console.log('   Response:', JSON.stringify(res.data).slice(0, 200));
  } catch (e) {
    console.log('   ❌ ExchangeRate.host failed:', e.message);
  }
  
  // 4. Test Free Forex API
  console.log('\n4. Testing Free Forex API...');
  try {
    const res = await axios.get('https://www.freeforexapi.com/api/live?pairs=EURUSD,XAUUSD', { timeout: 10000 });
    console.log('   ✅ FreeForexAPI:', JSON.stringify(res.data).slice(0, 300));
  } catch (e) {
    console.log('   ❌ FreeForexAPI failed:', e.message);
  }
  
  // 5. Test Metals.live for Gold
  console.log('\n5. Testing Metals.live (Gold)...');
  try {
    const res = await axios.get('https://api.metals.live/v1/spot', { timeout: 10000 });
    console.log('   ✅ Metals.live:', JSON.stringify(res.data).slice(0, 300));
  } catch (e) {
    console.log('   ❌ Metals.live failed:', e.message);
  }
  
  // 6. Test Gold-API alternative
  console.log('\n6. Testing Gold price from alternative...');
  try {
    const res = await axios.get('https://data-asg.goldprice.org/dbXRates/USD', { timeout: 10000 });
    console.log('   ✅ GoldPrice.org:', JSON.stringify(res.data).slice(0, 300));
  } catch (e) {
    console.log('   ❌ GoldPrice.org failed:', e.message);
  }
  
  // 7. Test CoinGecko for BTC
  console.log('\n7. Testing CoinGecko (BTC)...');
  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', { timeout: 10000 });
    console.log('   ✅ CoinGecko BTC:', res.data.bitcoin?.usd);
  } catch (e) {
    console.log('   ❌ CoinGecko failed:', e.message);
  }
  
  // 8. Test Twelve Data (free tier)
  console.log('\n8. Testing Twelve Data...');
  try {
    const res = await axios.get('https://api.twelvedata.com/price?symbol=XAU/USD&apikey=demo', { timeout: 10000 });
    console.log('   Response:', JSON.stringify(res.data));
  } catch (e) {
    console.log('   ❌ Twelve Data failed:', e.message);
  }
  
  // 9. Test Alpha Vantage
  console.log('\n9. Testing Alpha Vantage...');
  try {
    const res = await axios.get('https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=demo', { timeout: 10000 });
    console.log('   Response:', JSON.stringify(res.data).slice(0, 300));
  } catch (e) {
    console.log('   ❌ Alpha Vantage failed:', e.message);
  }
  
  console.log('\n✅ Test complete!');
}

testAPIs();
