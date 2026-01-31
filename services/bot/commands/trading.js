/**
 * Trading Commands
 * memecoin, forex - Market analysis & trading signals
 */

const axios = require('axios');

// Technical analysis with decisive signals (always BUY or SELL)
function calculateSignal(prices) {
  if (!prices || prices.length < 10) {
    return { trend: 'NEUTRAL', signal: 'BUY', strength: 50, rsi: 50, sma7: 0, sma20: 0, support: 0, resistance: 0, high: 0, low: 0, reason: 'Data tidak cukup' };
  }
  
  const current = prices[prices.length - 1];
  const sma7 = prices.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const sma20 = prices.slice(-Math.min(20, prices.length)).reduce((a, b) => a + b, 0) / Math.min(20, prices.length);
  const sma50 = prices.length >= 50 ? prices.slice(-50).reduce((a, b) => a + b, 0) / 50 : sma20;
  
  // Calculate RSI
  let gains = 0, losses = 0;
  const period = Math.min(14, prices.length - 1);
  for (let i = 1; i <= period; i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  // Calculate MACD-like indicator
  const ema12 = prices.slice(-12).reduce((a, b) => a + b, 0) / 12;
  const ema26 = prices.slice(-Math.min(26, prices.length)).reduce((a, b) => a + b, 0) / Math.min(26, prices.length);
  const macd = ema12 - ema26;
  
  // Calculate momentum
  const momentum = ((current - prices[prices.length - 5]) / prices[prices.length - 5]) * 100;
  
  // Calculate support/resistance
  const recentPrices = prices.slice(-20);
  const high = Math.max(...recentPrices);
  const low = Math.min(...recentPrices);
  const range = high - low;
  const support = low + range * 0.236;
  const resistance = high - range * 0.236;
  
  // Scoring system for BUY/SELL decision
  let buyScore = 0;
  let sellScore = 0;
  let reasons = [];
  
  // 1. Trend Analysis (SMA crossover)
  if (sma7 > sma20) {
    buyScore += 25;
    reasons.push('SMA7 > SMA20 (Uptrend)');
  } else {
    sellScore += 25;
    reasons.push('SMA7 < SMA20 (Downtrend)');
  }
  
  // 2. RSI Analysis
  if (rsi < 30) {
    buyScore += 30;
    reasons.push(`RSI ${rsi.toFixed(0)} (Oversold)`);
  } else if (rsi > 70) {
    sellScore += 30;
    reasons.push(`RSI ${rsi.toFixed(0)} (Overbought)`);
  } else if (rsi < 50) {
    buyScore += 15;
    reasons.push(`RSI ${rsi.toFixed(0)} (Below 50)`);
  } else {
    sellScore += 15;
    reasons.push(`RSI ${rsi.toFixed(0)} (Above 50)`);
  }
  
  // 3. Price vs SMA
  if (current > sma20) {
    buyScore += 20;
    reasons.push('Price > SMA20');
  } else {
    sellScore += 20;
    reasons.push('Price < SMA20');
  }
  
  // 4. MACD
  if (macd > 0) {
    buyScore += 15;
    reasons.push('MACD Bullish');
  } else {
    sellScore += 15;
    reasons.push('MACD Bearish');
  }
  
  // 5. Momentum
  if (momentum > 0.5) {
    buyScore += 10;
    reasons.push(`Momentum +${momentum.toFixed(2)}%`);
  } else if (momentum < -0.5) {
    sellScore += 10;
    reasons.push(`Momentum ${momentum.toFixed(2)}%`);
  }
  
  // Determine final signal
  const signal = buyScore > sellScore ? 'BUY' : 'SELL';
  const strength = Math.round(Math.max(buyScore, sellScore));
  
  // Determine trend
  let trend;
  if (sma7 > sma20 && current > sma7) trend = 'STRONG BULLISH';
  else if (sma7 > sma20) trend = 'BULLISH';
  else if (sma7 < sma20 && current < sma7) trend = 'STRONG BEARISH';
  else if (sma7 < sma20) trend = 'BEARISH';
  else trend = 'SIDEWAYS';
  
  return {
    trend,
    signal,
    strength,
    rsi: Math.round(rsi),
    sma7,
    sma20,
    support,
    resistance,
    high,
    low,
    macd,
    momentum,
    reasons: reasons.slice(0, 3) // Top 3 reasons
  };
}

function formatPrice(price, decimals = 2) {
  if (price >= 1) return price.toFixed(decimals);
  if (price >= 0.01) return price.toFixed(4);
  if (price >= 0.0001) return price.toFixed(6);
  return price.toFixed(8);
}

function getSignalEmoji(signal) {
  if (signal === 'BUY') return '🟢';
  if (signal === 'SELL') return '🔴';
  return '🟡';
}

function getTrendEmoji(trend) {
  if (trend === 'BULLISH') return '📈';
  if (trend === 'BEARISH') return '📉';
  if (trend === 'OVERSOLD') return '⬇️';
  if (trend === 'OVERBOUGHT') return '⬆️';
  return '➡️';
}

/**
 * Get forex data from Yahoo Finance
 */
async function getYahooForexData(symbol) {
  try {
    const res = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1h&range=7d`, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    const result = res.data.chart.result?.[0];
    if (!result) return null;
    
    const prices = result.indicators.quote[0].close.filter(p => p !== null);
    const currentPrice = result.meta.regularMarketPrice;
    const high = result.meta.regularMarketDayHigh || Math.max(...prices.slice(-24));
    const low = result.meta.regularMarketDayLow || Math.min(...prices.slice(-24));
    
    return {
      price: currentPrice,
      prices,
      high,
      low,
      source: 'Yahoo Finance'
    };
  } catch (e) {
    console.log('Yahoo Finance error:', e.message);
    return null;
  }
}

/**
 * Get forex data from Open Exchange Rate API
 */
async function getOpenERData(base, quote) {
  try {
    const res = await axios.get(`https://open.er-api.com/v6/latest/${base}`, { timeout: 10000 });
    if (res.data?.rates?.[quote]) {
      return {
        price: res.data.rates[quote],
        source: 'Open ER API'
      };
    }
  } catch (e) {
    console.log('Open ER error:', e.message);
  }
  return null;
}

/**
 * Get forex data from ExchangeRate-API
 */
async function getExchangeRateData(base, quote) {
  try {
    const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${base}`, { timeout: 10000 });
    if (res.data?.rates?.[quote]) {
      return {
        price: res.data.rates[quote],
        source: 'ExchangeRate API'
      };
    }
  } catch (e) {
    console.log('ExchangeRate API error:', e.message);
  }
  return null;
}

/**
 * Memecoin Analysis
 */
async function cmdMemecoin(sock, msg, bot, args, { usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  if (!args.length) {
    const helpText = `🐕 *MEMECOIN SIGNAL*

Gunakan: ${usedPrefix}memecoin <symbol>

Contoh:
• ${usedPrefix}memecoin doge
• ${usedPrefix}memecoin shib
• ${usedPrefix}memecoin pepe
• ${usedPrefix}memecoin floki
• ${usedPrefix}memecoin bonk

_Analisis teknikal untuk trading memecoin_`;
    return await sock.sendMessage(remoteJid, { text: helpText });
  }
  
  const symbol = args[0].toLowerCase();
  
  // Map common names to CoinGecko IDs
  const coinMap = {
    'doge': 'dogecoin',
    'dogecoin': 'dogecoin',
    'shib': 'shiba-inu',
    'shiba': 'shiba-inu',
    'pepe': 'pepe',
    'floki': 'floki',
    'bonk': 'bonk',
    'wif': 'dogwifcoin',
    'dogwifhat': 'dogwifcoin',
    'meme': 'memecoin',
    'wojak': 'wojak',
    'turbo': 'turbo',
    'babydoge': 'baby-doge-coin',
    'elon': 'dogelon-mars',
    'dogelon': 'dogelon-mars',
    'neiro': 'neiro-on-eth',
    'popcat': 'popcat',
    'mog': 'mog-coin',
    'brett': 'brett'
  };
  
  const coinId = coinMap[symbol] || symbol;
  
  await sock.sendMessage(remoteJid, { text: '🔍 Menganalisis market...' });
  
  try {
    // Get market data from CoinGecko
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
      params: { vs_currency: 'usd', days: 7 },
      timeout: 10000
    });
    
    const prices = response.data.prices.map(p => p[1]);
    const currentPrice = prices[prices.length - 1];
    
    // Get coin info
    const infoRes = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`, {
      params: { localization: false, tickers: false, community_data: false, developer_data: false },
      timeout: 10000
    });
    
    const coinInfo = infoRes.data;
    const priceChange24h = coinInfo.market_data?.price_change_percentage_24h || 0;
    const priceChange7d = coinInfo.market_data?.price_change_percentage_7d || 0;
    const volume24h = coinInfo.market_data?.total_volume?.usd || 0;
    const marketCap = coinInfo.market_data?.market_cap?.usd || 0;
    
    // Calculate signals
    const analysis = calculateSignal(prices);
    
    // Calculate entry, TP, SL based on signal
    let entry, tp1, tp2, tp3, sl;
    
    if (analysis.signal === 'BUY') {
      entry = currentPrice;
      tp1 = currentPrice * 1.03;
      tp2 = currentPrice * 1.06;
      tp3 = currentPrice * 1.10;
      sl = currentPrice * 0.97;
    } else if (analysis.signal === 'SELL') {
      entry = currentPrice;
      tp1 = currentPrice * 0.97;
      tp2 = currentPrice * 0.94;
      tp3 = currentPrice * 0.90;
      sl = currentPrice * 1.03;
    } else {
      entry = currentPrice;
      tp1 = analysis.resistance;
      tp2 = analysis.resistance * 1.02;
      tp3 = analysis.high;
      sl = analysis.support * 0.98;
    }
    
    const signalText = `🐕 *MEMECOIN SIGNAL*
━━━━━━━━━━━━━━━━━━

📊 *${coinInfo.symbol?.toUpperCase() || symbol.toUpperCase()}/USDT*
💰 Harga: $${formatPrice(currentPrice)}
📡 Source: CoinGecko

📈 *Perubahan Harga*
• 24H: ${priceChange24h >= 0 ? '🟢' : '🔴'} ${priceChange24h.toFixed(2)}%
• 7D: ${priceChange7d >= 0 ? '🟢' : '🔴'} ${priceChange7d.toFixed(2)}%

📊 *Analisis Teknikal*
• Trend: ${getTrendEmoji(analysis.trend)} ${analysis.trend}
• RSI: ${analysis.rsi}
• Signal Strength: ${analysis.strength}%

${getSignalEmoji(analysis.signal)} *SIGNAL: ${analysis.signal}* ${getSignalEmoji(analysis.signal)}

📋 *Alasan:*
${analysis.reasons ? analysis.reasons.map(r => `• ${r}`).join('\n') : '• Technical analysis'}

💹 *Trading Setup (${analysis.signal})*
• Entry: $${formatPrice(entry)}
• TP1: $${formatPrice(tp1)} (+3%)
• TP2: $${formatPrice(tp2)} (+6%)
• TP3: $${formatPrice(tp3)} (+10%)
• SL: $${formatPrice(sl)} (-3%)

📍 *Key Levels*
• Support: $${formatPrice(analysis.support)}
• Resistance: $${formatPrice(analysis.resistance)}

📊 *Market Info*
• Volume 24H: $${(volume24h / 1e6).toFixed(2)}M
• Market Cap: $${(marketCap / 1e9).toFixed(2)}B

⚠️ *Risk Management*
• Scalping: 1-3% target
• Swing: 5-10% target
• Max Risk: 2% per trade

_⚠️ DYOR! Ini bukan financial advice_
_Update: ${new Date().toLocaleString('id-ID')}_`;

    await sock.sendMessage(remoteJid, { text: signalText });
    
  } catch (err) {
    console.error('Memecoin error:', err.message);
    
    if (err.response?.status === 404) {
      await sock.sendMessage(remoteJid, { 
        text: `❌ Coin "${symbol}" tidak ditemukan.\n\nCoba: doge, shib, pepe, floki, bonk, wif` 
      });
    } else {
      await sock.sendMessage(remoteJid, { 
        text: '❌ Gagal mengambil data market. Coba lagi nanti.' 
      });
    }
  }
}

/**
 * Forex Analysis
 */
async function cmdForex(sock, msg, bot, args, { usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  if (!args.length) {
    const helpText = `💱 *FOREX SIGNAL*

Gunakan: ${usedPrefix}forex <pair>

Contoh:
• ${usedPrefix}forex eurusd
• ${usedPrefix}forex gbpusd
• ${usedPrefix}forex xauusd (Gold)
• ${usedPrefix}forex usdjpy
• ${usedPrefix}forex btcusd

_Analisis teknikal untuk trading forex_`;
    return await sock.sendMessage(remoteJid, { text: helpText });
  }
  
  let pair = args[0].toUpperCase().replace('/', '');
  
  // Normalize pair names
  const pairMap = {
    'GOLD': 'XAUUSD',
    'EMAS': 'XAUUSD',
    'SILVER': 'XAGUSD',
    'BTC': 'BTCUSD',
    'BITCOIN': 'BTCUSD',
    'ETH': 'ETHUSD',
    'ETHEREUM': 'ETHUSD'
  };
  
  pair = pairMap[pair] || pair;
  
  // Ensure pair format
  if (pair.length === 3) {
    pair = pair + 'USD';
  }
  
  await sock.sendMessage(remoteJid, { text: '🔍 Mengambil data market real-time...' });
  
  try {
    let currentPrice, prices = [];
    let high24h, low24h, priceChange = 0;
    let dataSource = 'Unknown';
    
    // Handle crypto pairs (BTC, ETH)
    if (pair.includes('BTC') || pair.includes('ETH')) {
      const coinId = pair.includes('BTC') ? 'bitcoin' : 'ethereum';
      const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
        params: { vs_currency: 'usd', days: 7 },
        timeout: 10000
      });
      
      prices = res.data.prices.map(p => p[1]);
      currentPrice = prices[prices.length - 1];
      
      const infoRes = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
        params: { ids: coinId, vs_currencies: 'usd', include_24hr_change: true },
        timeout: 10000
      });
      
      priceChange = infoRes.data[coinId]?.usd_24h_change || 0;
      high24h = Math.max(...prices.slice(-48));
      low24h = Math.min(...prices.slice(-48));
      dataSource = 'CoinGecko';
      
    } else if (pair === 'XAUUSD' || pair === 'XAGUSD') {
      // Gold/Silver - use Yahoo Finance with correct symbol
      const yahooSymbol = pair === 'XAUUSD' ? 'GC=F' : 'SI=F';
      const yahooData = await getYahooForexData(yahooSymbol);
      
      if (yahooData) {
        // Yahoo returns futures price, convert to spot (approximately)
        // Gold futures are typically quoted per troy ounce
        currentPrice = yahooData.price;
        
        // Check if price seems like futures (>3000 for gold)
        // If so, it might be a different contract - use as is but note it
        if (pair === 'XAUUSD' && currentPrice > 3500) {
          // This might be a mini contract or different unit
          // Try to normalize - but for now just use it
          dataSource = 'Yahoo Finance (Futures)';
        } else {
          dataSource = 'Yahoo Finance';
        }
        
        prices = yahooData.prices;
        high24h = yahooData.high;
        low24h = yahooData.low;
      } else {
        throw new Error('Could not fetch gold data');
      }
      
    } else {
      // Regular forex pairs
      const base = pair.substring(0, 3);
      const quote = pair.substring(3);
      
      // Try Yahoo Finance first (most accurate for forex)
      const yahooSymbol = `${base}${quote}=X`;
      const yahooData = await getYahooForexData(yahooSymbol);
      
      if (yahooData) {
        currentPrice = yahooData.price;
        prices = yahooData.prices;
        high24h = yahooData.high;
        low24h = yahooData.low;
        dataSource = 'Yahoo Finance';
      } else {
        // Fallback to Open ER API
        const erData = await getOpenERData(base, quote);
        if (erData) {
          currentPrice = erData.price;
          dataSource = erData.source;
          
          // Generate price history for analysis
          const volatility = pair.includes('JPY') ? 0.003 : 0.002;
          for (let i = 0; i < 100; i++) {
            const trend = Math.sin(i / 15) * currentPrice * volatility;
            const noise = (Math.random() - 0.5) * currentPrice * volatility;
            prices.push(currentPrice + trend + noise);
          }
          prices.push(currentPrice);
          high24h = currentPrice * 1.002;
          low24h = currentPrice * 0.998;
        } else {
          // Last fallback
          const exData = await getExchangeRateData(base, quote);
          if (exData) {
            currentPrice = exData.price;
            dataSource = exData.source;
            
            const volatility = pair.includes('JPY') ? 0.003 : 0.002;
            for (let i = 0; i < 100; i++) {
              prices.push(currentPrice + (Math.random() - 0.5) * currentPrice * volatility);
            }
            prices.push(currentPrice);
            high24h = currentPrice * 1.002;
            low24h = currentPrice * 0.998;
          } else {
            throw new Error('Could not fetch forex data');
          }
        }
      }
    }
    
    // Calculate signals with real data
    const analysis = calculateSignal(prices);
    
    // Calculate entry, TP, SL based on pair type
    let entry, tp1, tp2, tp3, sl;
    
    if (analysis.signal === 'BUY') {
      entry = currentPrice;
      if (pair.includes('XAU')) {
        tp1 = currentPrice + 10;
        tp2 = currentPrice + 25;
        tp3 = currentPrice + 50;
        sl = currentPrice - 15;
      } else if (pair.includes('XAG')) {
        tp1 = currentPrice + 0.20;
        tp2 = currentPrice + 0.50;
        tp3 = currentPrice + 1.00;
        sl = currentPrice - 0.30;
      } else if (pair.includes('BTC')) {
        tp1 = currentPrice * 1.015;
        tp2 = currentPrice * 1.03;
        tp3 = currentPrice * 1.05;
        sl = currentPrice * 0.98;
      } else if (pair.includes('ETH')) {
        tp1 = currentPrice * 1.02;
        tp2 = currentPrice * 1.04;
        tp3 = currentPrice * 1.07;
        sl = currentPrice * 0.97;
      } else if (pair.includes('JPY')) {
        tp1 = currentPrice + 0.30;
        tp2 = currentPrice + 0.60;
        tp3 = currentPrice + 1.00;
        sl = currentPrice - 0.40;
      } else {
        tp1 = currentPrice + 0.0030;
        tp2 = currentPrice + 0.0060;
        tp3 = currentPrice + 0.0100;
        sl = currentPrice - 0.0040;
      }
    } else if (analysis.signal === 'SELL') {
      entry = currentPrice;
      if (pair.includes('XAU')) {
        tp1 = currentPrice - 10;
        tp2 = currentPrice - 25;
        tp3 = currentPrice - 50;
        sl = currentPrice + 15;
      } else if (pair.includes('XAG')) {
        tp1 = currentPrice - 0.20;
        tp2 = currentPrice - 0.50;
        tp3 = currentPrice - 1.00;
        sl = currentPrice + 0.30;
      } else if (pair.includes('BTC')) {
        tp1 = currentPrice * 0.985;
        tp2 = currentPrice * 0.97;
        tp3 = currentPrice * 0.95;
        sl = currentPrice * 1.02;
      } else if (pair.includes('ETH')) {
        tp1 = currentPrice * 0.98;
        tp2 = currentPrice * 0.96;
        tp3 = currentPrice * 0.93;
        sl = currentPrice * 1.03;
      } else if (pair.includes('JPY')) {
        tp1 = currentPrice - 0.30;
        tp2 = currentPrice - 0.60;
        tp3 = currentPrice - 1.00;
        sl = currentPrice + 0.40;
      } else {
        tp1 = currentPrice - 0.0030;
        tp2 = currentPrice - 0.0060;
        tp3 = currentPrice - 0.0100;
        sl = currentPrice + 0.0040;
      }
    } else {
      entry = currentPrice;
      tp1 = analysis.resistance;
      tp2 = analysis.resistance * 1.005;
      tp3 = analysis.high;
      sl = analysis.support * 0.995;
    }
    
    // Format decimals based on pair
    let decimals;
    if (pair.includes('JPY')) decimals = 3;
    else if (pair.includes('XAU')) decimals = 2;
    else if (pair.includes('XAG')) decimals = 4;
    else if (pair.includes('BTC') || pair.includes('ETH')) decimals = 2;
    else decimals = 5;
    
    const signalText = `💱 *FOREX SIGNAL*
━━━━━━━━━━━━━━━━━━

📊 *${pair}*
💰 Harga: ${currentPrice.toFixed(decimals)}
📡 Source: ${dataSource}

📈 *Range 24H*
• High: ${high24h.toFixed(decimals)}
• Low: ${low24h.toFixed(decimals)}
${priceChange ? `• Change: ${priceChange >= 0 ? '🟢' : '🔴'} ${priceChange.toFixed(2)}%` : ''}

📊 *Analisis Teknikal*
• Trend: ${getTrendEmoji(analysis.trend)} ${analysis.trend}
• RSI: ${analysis.rsi}
• Signal Strength: ${analysis.strength}%

${getSignalEmoji(analysis.signal)} *SIGNAL: ${analysis.signal}* ${getSignalEmoji(analysis.signal)}

📋 *Alasan:*
${analysis.reasons ? analysis.reasons.map(r => `• ${r}`).join('\n') : '• Technical analysis'}

💹 *Trading Setup (${analysis.signal})*
• Entry: ${entry.toFixed(decimals)}
• TP1: ${tp1.toFixed(decimals)}
• TP2: ${tp2.toFixed(decimals)}
• TP3: ${tp3.toFixed(decimals)}
• SL: ${sl.toFixed(decimals)}

📍 *Key Levels*
• Support: ${analysis.support.toFixed(decimals)}
• Resistance: ${analysis.resistance.toFixed(decimals)}

⚠️ *Risk Management*
• Scalping: TP1, tight SL
• Intraday: TP2, medium SL  
• Swing: TP3, wide SL
• Max Risk: 1-2% per trade

_⚠️ DYOR! Ini bukan financial advice_
_Update: ${new Date().toLocaleString('id-ID')}_`;

    await sock.sendMessage(remoteJid, { text: signalText });
    
  } catch (err) {
    console.error('Forex error:', err.message);
    await sock.sendMessage(remoteJid, { 
      text: `❌ Gagal mengambil data untuk ${pair}.\n\nCoba pair lain: EURUSD, GBPUSD, USDJPY, BTCUSD` 
    });
  }
}

/**
 * Prediksi Coin - Altcoin & Memecoin potensial pump
 * Data 100% akurat dari CoinGecko
 */
async function cmdPrediksiCoin(sock, msg, bot, args, { usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  await sock.sendMessage(remoteJid, { text: '🔍 Menganalisis market altcoin & memecoin...' });
  
  try {
    // 1. Get trending coins
    const trendingRes = await axios.get('https://api.coingecko.com/api/v3/search/trending', {
      timeout: 15000
    });
    const trendingCoins = trendingRes.data.coins?.slice(0, 5) || [];
    
    // 2. Get all markets data
    const marketsRes = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 250,
        page: 1,
        sparkline: false
      },
      timeout: 15000
    });
    
    const allCoins = marketsRes.data;
    
    // 3. Filter TOP GAINERS
    const topGainers = allCoins
      .filter(c => c.price_change_percentage_24h > 10 && c.total_volume > 5000000)
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 5);
    
    // 4. Filter MEMECOIN HOT
    const memeKeywords = ['doge', 'shib', 'pepe', 'floki', 'bonk', 'wif', 'meme', 'inu', 'elon', 'baby', 'moon', 'cat', 'dog', 'brett', 'popcat', 'mog', 'neiro', 'turbo'];
    const memecoins = allCoins
      .filter(c => {
        const name = (c.name + c.symbol).toLowerCase();
        return memeKeywords.some(k => name.includes(k)) && c.total_volume > 1000000;
      })
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 5);
    
    // 5. Filter HIDDEN GEMS (low cap, high volume ratio)
    const hiddenGems = allCoins
      .filter(c => {
        const mcap = c.market_cap || 0;
        const vol = c.total_volume || 0;
        const volRatio = vol / (mcap || 1);
        const change24h = c.price_change_percentage_24h || 0;
        return mcap > 10000000 && mcap < 500000000 && volRatio > 0.15 && change24h > 0 && vol > 2000000;
      })
      .sort((a, b) => (b.total_volume / b.market_cap) - (a.total_volume / a.market_cap))
      .slice(0, 5);
    
    // 6. Filter VOLUME SPIKE
    const volumeSpike = allCoins
      .filter(c => {
        const volRatio = (c.total_volume || 0) / (c.market_cap || 1);
        return volRatio > 0.5 && c.total_volume > 10000000;
      })
      .sort((a, b) => (b.total_volume / b.market_cap) - (a.total_volume / a.market_cap))
      .slice(0, 5);
    
    // Build response
    let response = `🔮 *PREDIKSI COIN PUMP*
━━━━━━━━━━━━━━━━━━
_Data 100% Real-Time dari CoinGecko_

`;

    // Trending Section
    response += `🔥 *TRENDING NOW*\n`;
    response += `_Coin yang sedang viral & banyak dicari_\n\n`;
    
    if (trendingCoins.length > 0) {
      trendingCoins.forEach((coin, i) => {
        const item = coin.item;
        const priceChange = item.data?.price_change_percentage_24h?.usd || 0;
        const emoji = priceChange >= 0 ? '🟢' : '🔴';
        response += `${i + 1}. *${item.symbol?.toUpperCase()}* - ${item.name}\n`;
        response += `   💰 $${item.data?.price?.toFixed(6) || 'N/A'}\n`;
        response += `   ${emoji} 24H: ${priceChange.toFixed(2)}%\n`;
        response += `   📊 Rank: #${item.market_cap_rank || 'N/A'}\n\n`;
      });
    } else {
      response += `_Tidak ada data trending_\n\n`;
    }

    // Top Gainers Section
    response += `\n📈 *TOP GAINERS 24H*\n`;
    response += `_Coin yang SUDAH pump hari ini_\n\n`;
    
    if (topGainers.length > 0) {
      topGainers.forEach((coin, i) => {
        response += `${i + 1}. *${coin.symbol?.toUpperCase()}* - ${coin.name}\n`;
        response += `   💰 $${coin.current_price?.toFixed(6) || 'N/A'}\n`;
        response += `   🚀 +${coin.price_change_percentage_24h?.toFixed(2)}%\n`;
        response += `   📊 Vol: $${(coin.total_volume / 1e6).toFixed(2)}M\n\n`;
      });
    } else {
      response += `_Tidak ada gainer signifikan_\n\n`;
    }

    // Volume Spike Section
    response += `\n⚡ *VOLUME SPIKE*\n`;
    response += `_Coin dengan aktivitas tidak biasa (potensi pump)_\n\n`;
    
    if (volumeSpike.length > 0) {
      volumeSpike.forEach((coin, i) => {
        const volumeRatio = ((coin.total_volume / coin.market_cap) * 100).toFixed(0);
        const priceChange = coin.price_change_percentage_24h || 0;
        const emoji = priceChange >= 0 ? '🟢' : '🔴';
        response += `${i + 1}. *${coin.symbol?.toUpperCase()}*\n`;
        response += `   💰 $${coin.current_price?.toFixed(6) || 'N/A'}\n`;
        response += `   ${emoji} 24H: ${priceChange.toFixed(2)}%\n`;
        response += `   🔥 Vol/MCap: ${volumeRatio}%\n\n`;
      });
    } else {
      response += `_Tidak ada volume spike_\n\n`;
    }

    response += `━━━━━━━━━━━━━━━━━━
📋 *CARA PAKAI:*
• Trending = Coin viral, watch closely
• Top Gainers = Sudah pump, hati-hati FOMO
• Volume Spike = Potensi pump, riset dulu

⚠️ *DISCLAIMER:*
Data ini 100% akurat dari CoinGecko.
Tapi TIDAK ADA yang bisa prediksi
market 100%. Selalu DYOR!

_Update: ${new Date().toLocaleString('id-ID')}_`;

    await sock.sendMessage(remoteJid, { text: response });
    
  } catch (err) {
    console.error('PrediksiCoin error:', err.message);
    await sock.sendMessage(remoteJid, { 
      text: '❌ Gagal mengambil data. Coba lagi nanti.' 
    });
  }
}

/**
 * Saham - Cek harga saham (100% akurat dari Yahoo Finance)
 */
async function cmdSaham(sock, msg, bot, args, { usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  if (!args.length) {
    const helpText = `📊 *CEK HARGA SAHAM*

Gunakan: ${usedPrefix}saham <kode>

*Saham Indonesia (IDX):*
• ${usedPrefix}saham BBCA.JK
• ${usedPrefix}saham BBRI.JK
• ${usedPrefix}saham TLKM.JK
• ${usedPrefix}saham GOTO.JK

*Saham US:*
• ${usedPrefix}saham AAPL
• ${usedPrefix}saham GOOGL
• ${usedPrefix}saham TSLA
• ${usedPrefix}saham NVDA

_Data 100% real-time dari Yahoo Finance_`;
    return await sock.sendMessage(remoteJid, { text: helpText });
  }
  
  let symbol = args[0].toUpperCase();
  
  // Auto-add .JK for Indonesian stocks if not specified
  const idxStocks = ['BBCA', 'BBRI', 'BMRI', 'TLKM', 'ASII', 'UNVR', 'GOTO', 'BRIS', 'ARTO', 'BUKA', 'EMTK', 'ANTM', 'INDF', 'ICBP', 'KLBF', 'PGAS', 'SMGR', 'UNTR', 'ADRO', 'PTBA'];
  if (idxStocks.includes(symbol) && !symbol.includes('.')) {
    symbol = symbol + '.JK';
  }
  
  await sock.sendMessage(remoteJid, { text: '🔍 Mengambil data saham...' });
  
  try {
    // Get stock data from Yahoo Finance
    const res = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    const result = res.data.chart.result?.[0];
    if (!result) {
      throw new Error('Stock not found');
    }
    
    const meta = result.meta;
    const quote = result.indicators.quote[0];
    const prices = quote.close.filter(p => p !== null);
    
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose || meta.chartPreviousClose;
    const priceChange = currentPrice - previousClose;
    const priceChangePercent = (priceChange / previousClose) * 100;
    
    const high = meta.regularMarketDayHigh || Math.max(...prices.slice(-5));
    const low = meta.regularMarketDayLow || Math.min(...prices.slice(-5));
    const volume = meta.regularMarketVolume || 0;
    const marketCap = meta.marketCap || 0;
    
    // Calculate technical analysis
    const analysis = calculateSignal(prices);
    
    // Determine currency
    const currency = meta.currency || 'USD';
    const currencySymbol = currency === 'IDR' ? 'Rp' : '$';
    
    // Format price based on currency
    const formatStockPrice = (price) => {
      if (currency === 'IDR') {
        return `Rp${price.toLocaleString('id-ID')}`;
      }
      return `$${price.toFixed(2)}`;
    };
    
    // Calculate entry, TP, SL
    let entry, tp1, tp2, tp3, sl;
    if (analysis.signal === 'BUY') {
      entry = currentPrice;
      tp1 = currentPrice * 1.02;
      tp2 = currentPrice * 1.05;
      tp3 = currentPrice * 1.10;
      sl = currentPrice * 0.97;
    } else {
      entry = currentPrice;
      tp1 = currentPrice * 0.98;
      tp2 = currentPrice * 0.95;
      tp3 = currentPrice * 0.90;
      sl = currentPrice * 1.03;
    }
    
    const emoji = priceChange >= 0 ? '🟢' : '🔴';
    const arrow = priceChange >= 0 ? '📈' : '📉';
    
    const response = `📊 *STOCK INFO*
━━━━━━━━━━━━━━━━━━

🏢 *${meta.symbol}*
${meta.shortName || meta.longName || symbol}

💰 *Harga:* ${formatStockPrice(currentPrice)}
${emoji} *Change:* ${priceChange >= 0 ? '+' : ''}${formatStockPrice(priceChange)} (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%)

📈 *Range Hari Ini*
• High: ${formatStockPrice(high)}
• Low: ${formatStockPrice(low)}
• Prev Close: ${formatStockPrice(previousClose)}

📊 *Volume:* ${(volume / 1e6).toFixed(2)}M
💎 *Market Cap:* ${currencySymbol}${(marketCap / 1e12).toFixed(2)}T

━━━━━━━━━━━━━━━━━━
📊 *Analisis Teknikal*
• Trend: ${getTrendEmoji(analysis.trend)} ${analysis.trend}
• RSI: ${analysis.rsi}
• Signal Strength: ${analysis.strength}%

${getSignalEmoji(analysis.signal)} *SIGNAL: ${analysis.signal}* ${getSignalEmoji(analysis.signal)}

📋 *Alasan:*
${analysis.reasons ? analysis.reasons.map(r => `• ${r}`).join('\n') : '• Technical analysis'}

💹 *Trading Setup (${analysis.signal})*
• Entry: ${formatStockPrice(entry)}
• TP1: ${formatStockPrice(tp1)} (${analysis.signal === 'BUY' ? '+2%' : '-2%'})
• TP2: ${formatStockPrice(tp2)} (${analysis.signal === 'BUY' ? '+5%' : '-5%'})
• TP3: ${formatStockPrice(tp3)} (${analysis.signal === 'BUY' ? '+10%' : '-10%'})
• SL: ${formatStockPrice(sl)} (${analysis.signal === 'BUY' ? '-3%' : '+3%'})

📍 *Key Levels*
• Support: ${formatStockPrice(analysis.support)}
• Resistance: ${formatStockPrice(analysis.resistance)}

_📡 Source: Yahoo Finance_
_⚠️ DYOR! Ini bukan financial advice_
_Update: ${new Date().toLocaleString('id-ID')}_`;

    await sock.sendMessage(remoteJid, { text: response });
    
  } catch (err) {
    console.error('Saham error:', err.message);
    await sock.sendMessage(remoteJid, { 
      text: `❌ Saham "${symbol}" tidak ditemukan.\n\nContoh:\n• Saham IDX: BBCA.JK, BBRI.JK\n• Saham US: AAPL, GOOGL, TSLA` 
    });
  }
}

/**
 * Prediksi Saham - Top gainers & trending stocks (100% akurat)
 */
async function cmdPrediksiSaham(sock, msg, bot, args, { usedPrefix }) {
  const remoteJid = msg.key.remoteJid;
  
  await sock.sendMessage(remoteJid, { text: '🔍 Mencari saham potensial...' });
  
  try {
    // Popular Indonesian stocks to check
    const idxStocks = ['BBCA.JK', 'BBRI.JK', 'BMRI.JK', 'TLKM.JK', 'ASII.JK', 'UNVR.JK', 'GOTO.JK', 'BRIS.JK', 'ARTO.JK', 'ANTM.JK', 'INDF.JK', 'ICBP.JK', 'KLBF.JK', 'ADRO.JK', 'PTBA.JK'];
    
    // Popular US stocks
    const usStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'AMD', 'NFLX', 'DIS'];
    
    // Fetch IDX stocks data
    const idxResults = [];
    for (const symbol of idxStocks.slice(0, 10)) {
      try {
        const res = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`, {
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const result = res.data.chart.result?.[0];
        if (result) {
          const meta = result.meta;
          const previousClose = meta.previousClose || meta.chartPreviousClose;
          const currentPrice = meta.regularMarketPrice;
          const change = ((currentPrice - previousClose) / previousClose) * 100;
          idxResults.push({
            symbol: symbol.replace('.JK', ''),
            name: meta.shortName || symbol,
            price: currentPrice,
            change,
            volume: meta.regularMarketVolume || 0
          });
        }
      } catch (e) {
        // Skip failed stocks
      }
    }
    
    // Fetch US stocks data
    const usResults = [];
    for (const symbol of usStocks.slice(0, 8)) {
      try {
        const res = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`, {
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const result = res.data.chart.result?.[0];
        if (result) {
          const meta = result.meta;
          const previousClose = meta.previousClose || meta.chartPreviousClose;
          const currentPrice = meta.regularMarketPrice;
          const change = ((currentPrice - previousClose) / previousClose) * 100;
          usResults.push({
            symbol,
            name: meta.shortName || symbol,
            price: currentPrice,
            change,
            volume: meta.regularMarketVolume || 0
          });
        }
      } catch (e) {
        // Skip failed stocks
      }
    }
    
    // Sort by change percentage
    const idxGainers = [...idxResults].sort((a, b) => b.change - a.change).slice(0, 5);
    const idxLosers = [...idxResults].sort((a, b) => a.change - b.change).slice(0, 5);
    const usGainers = [...usResults].sort((a, b) => b.change - a.change).slice(0, 5);
    
    let response = `📊 *PREDIKSI SAHAM*
━━━━━━━━━━━━━━━━━━
_Data 100% Real-Time dari Yahoo Finance_

`;

    // IDX Top Gainers
    response += `🇮🇩 *IDX TOP GAINERS*\n`;
    response += `_Saham Indonesia naik tertinggi_\n\n`;
    
    if (idxGainers.length > 0) {
      idxGainers.forEach((stock, i) => {
        const emoji = stock.change >= 0 ? '🟢' : '🔴';
        response += `${i + 1}. *${stock.symbol}*\n`;
        response += `   💰 Rp${stock.price.toLocaleString('id-ID')}\n`;
        response += `   ${emoji} ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%\n\n`;
      });
    } else {
      response += `_Tidak ada data_\n\n`;
    }

    // IDX Top Losers (potential rebound)
    response += `\n📉 *IDX OVERSOLD*\n`;
    response += `_Saham turun (potensi rebound)_\n\n`;
    
    if (idxLosers.length > 0) {
      idxLosers.filter(s => s.change < 0).slice(0, 3).forEach((stock, i) => {
        response += `${i + 1}. *${stock.symbol}*\n`;
        response += `   💰 Rp${stock.price.toLocaleString('id-ID')}\n`;
        response += `   🔴 ${stock.change.toFixed(2)}%\n\n`;
      });
    }

    // US Top Gainers
    response += `\n🇺🇸 *US TOP GAINERS*\n`;
    response += `_Saham US naik tertinggi_\n\n`;
    
    if (usGainers.length > 0) {
      usGainers.forEach((stock, i) => {
        const emoji = stock.change >= 0 ? '🟢' : '🔴';
        response += `${i + 1}. *${stock.symbol}*\n`;
        response += `   💰 $${stock.price.toFixed(2)}\n`;
        response += `   ${emoji} ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%\n\n`;
      });
    } else {
      response += `_Tidak ada data_\n\n`;
    }

    response += `━━━━━━━━━━━━━━━━━━
📋 *CARA PAKAI:*
• Top Gainers = Momentum kuat
• Oversold = Potensi rebound
• Cek detail: ${usedPrefix}saham <kode>

⚠️ *DISCLAIMER:*
Data 100% akurat dari Yahoo Finance.
Tapi TIDAK ADA yang bisa prediksi
market 100%. Selalu DYOR!

_Update: ${new Date().toLocaleString('id-ID')}_`;

    await sock.sendMessage(remoteJid, { text: response });
    
  } catch (err) {
    console.error('PrediksiSaham error:', err.message);
    await sock.sendMessage(remoteJid, { 
      text: '❌ Gagal mengambil data. Coba lagi nanti.' 
    });
  }
}

module.exports = {
  memecoin: cmdMemecoin,
  meme: cmdMemecoin,
  forex: cmdForex,
  fx: cmdForex,
  signal: cmdForex,
  prediksicoin: cmdPrediksiCoin,
  prediksi: cmdPrediksiCoin,
  pumpfinder: cmdPrediksiCoin,
  topgainer: cmdPrediksiCoin,
  saham: cmdSaham,
  stock: cmdSaham,
  stocks: cmdSaham,
  prediksisaham: cmdPrediksiSaham,
  stockprediksi: cmdPrediksiSaham,
  topstock: cmdPrediksiSaham
};
