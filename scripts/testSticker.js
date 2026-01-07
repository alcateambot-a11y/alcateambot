/**
 * Test Sticker EXIF Metadata
 * Verifies that packname and author are properly embedded in sticker
 */

const { Image } = require('node-webpmux');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create EXIF buffer for WhatsApp sticker
function createExifBuffer(packname, author) {
  const json = {
    'sticker-pack-id': 'com.alcateambot.sticker',
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    'emojis': ['😀']
  };
  
  const jsonStr = JSON.stringify(json);
  const jsonBuffer = Buffer.from(jsonStr, 'utf8');
  
  // EXIF header for WebP
  const exifHeader = Buffer.from([
    0x49, 0x49, 0x2A, 0x00, // TIFF header (little endian)
    0x08, 0x00, 0x00, 0x00, // Offset to first IFD
    0x01, 0x00,             // Number of directory entries
    0x41, 0x57,             // Tag 0x5741 (custom for sticker)
    0x07, 0x00,             // Type: undefined
    0x00, 0x00, 0x00, 0x00, // Count (will be set)
    0x16, 0x00, 0x00, 0x00  // Offset to data
  ]);
  
  // Set the JSON length in the header
  exifHeader.writeUInt32LE(jsonBuffer.length, 14);
  
  return Buffer.concat([exifHeader, jsonBuffer]);
}

async function addExifToWebp(webpBuffer, packname, author) {
  try {
    const img = new Image();
    await img.load(webpBuffer);
    
    // Create EXIF data
    const exifBuffer = createExifBuffer(packname, author);
    
    // Set EXIF using the property setter
    img.exif = exifBuffer;
    
    // Save with EXIF
    return await img.save(null);
  } catch (err) {
    console.error('EXIF error:', err.message);
    return webpBuffer;
  }
}

async function testExif() {
  console.log('=== Testing Sticker EXIF Metadata ===\n');
  
  // Create a simple test image
  const testImage = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 100, g: 150, b: 200, alpha: 1 }
    }
  })
  .webp({ quality: 80 })
  .toBuffer();
  
  console.log('1. Created test WebP image:', testImage.length, 'bytes');
  
  // Add EXIF metadata
  const packname = 'AlcaTeamBot';
  const author = 'Gibran';
  
  console.log('2. Adding EXIF metadata...');
  console.log('   Packname:', packname);
  console.log('   Author:', author);
  
  const stickerWithExif = await addExifToWebp(testImage, packname, author);
  
  console.log('3. Sticker with EXIF:', stickerWithExif.length, 'bytes');
  
  // Verify EXIF was added
  const img = new Image();
  await img.load(stickerWithExif);
  
  if (img.exif) {
    console.log('\n✅ EXIF metadata successfully embedded!');
    
    // Try to read the EXIF data
    const exifData = img.exif.toString('utf8');
    console.log('4. EXIF contains packname:', exifData.includes(packname));
    console.log('5. EXIF contains author:', exifData.includes(author));
    
    // Save test sticker for manual verification
    const outputPath = path.join(__dirname, 'test_sticker_with_exif.webp');
    fs.writeFileSync(outputPath, stickerWithExif);
    console.log('\n📁 Test sticker saved to:', outputPath);
    console.log('   You can send this to WhatsApp to verify packname/author appears');
  } else {
    console.log('\n❌ EXIF metadata NOT found in sticker');
  }
}

testExif().catch(console.error);
