/**
 * Test Play/YouTube Audio Download - Convert to MP3 for iOS
 */

const axios = require('axios');
const ytdlp = require('yt-dlp-exec');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function testPlay() {
  const query = 'dewa 19 kangen';
  
  console.log('=== Testing Play Command with MP3 conversion ===\n');
  console.log('Query:', query);
  console.log('FFmpeg path:', ffmpegPath);
  
  // Search YouTube
  console.log('\n1. Searching YouTube...');
  const searchResponse = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
    timeout: 15000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  
  const videoIdMatch = searchResponse.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
  if (!videoIdMatch) {
    console.log('❌ Video not found');
    return;
  }
  
  const videoId = videoIdMatch[1];
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  console.log('✅ Found video:', videoId);
  console.log('URL:', videoUrl);
  
  // Get title
  let title = query;
  try {
    const infoMatch = searchResponse.data.match(/"title":\{"runs":\[\{"text":"([^"]+)"/);
    if (infoMatch) title = infoMatch[1];
  } catch (e) {}
  console.log('Title:', title);
  
  const tempDir = os.tmpdir();
  const timestamp = Date.now();
  const outputPath = path.join(tempDir, `play_${timestamp}.mp3`);
  
  // Try direct MP3 download
  console.log('\n2. Trying direct MP3 download with yt-dlp + ffmpeg...');
  try {
    await ytdlp(videoUrl, {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: '128K',
      output: outputPath,
      ffmpegLocation: ffmpegPath,
      noCheckCertificates: true,
      noWarnings: true
    });
    
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log('✅ Direct MP3 download successful!');
      console.log('File size:', stats.size, 'bytes');
      console.log('File size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
      
      // Clean up
      fs.unlinkSync(outputPath);
      console.log('\n🎉 MP3 conversion working! iOS should be able to play this.');
      return;
    }
  } catch (e) {
    console.log('Direct MP3 failed:', e.message);
  }
  
  // Fallback: download raw then convert
  console.log('\n3. Trying fallback: download raw + convert...');
  const rawPath = path.join(tempDir, `play_raw_${timestamp}`);
  
  try {
    await ytdlp(videoUrl, {
      format: 'bestaudio[ext=m4a]/bestaudio',
      output: rawPath + '.%(ext)s',
      noCheckCertificates: true,
      noWarnings: true
    });
    
    // Find downloaded file
    let rawFile = null;
    for (const ext of ['.m4a', '.webm', '.opus', '.mp4']) {
      if (fs.existsSync(rawPath + ext)) {
        rawFile = rawPath + ext;
        break;
      }
    }
    
    if (rawFile) {
      console.log('Downloaded raw file:', rawFile);
      
      // Convert to MP3
      console.log('\n4. Converting to MP3...');
      ffmpeg.setFfmpegPath(ffmpegPath);
      
      await new Promise((resolve, reject) => {
        ffmpeg(rawFile)
          .toFormat('mp3')
          .audioBitrate('128k')
          .on('end', () => {
            console.log('✅ Conversion complete!');
            resolve();
          })
          .on('error', (err) => {
            console.log('❌ Conversion error:', err.message);
            reject(err);
          })
          .save(outputPath);
      });
      
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log('MP3 file size:', stats.size, 'bytes');
        console.log('MP3 file size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
        
        // Clean up
        fs.unlinkSync(rawFile);
        fs.unlinkSync(outputPath);
        console.log('\n🎉 MP3 conversion working! iOS should be able to play this.');
      }
    }
  } catch (e) {
    console.log('Fallback failed:', e.message);
  }
}

testPlay().then(() => {
  console.log('\n=== Test Complete ===');
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
