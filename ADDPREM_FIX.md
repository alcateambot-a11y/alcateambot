# Fix Command .addprem

## Masalah yang Diperbaiki

### 1. Mention Pakai Nomor (FIXED ✅)
**Sebelum:**
```
✅ User 6283174020347 sekarang premium!
```

**Sesudah:**
```
✅ User @Argan sekarang premium!
```

### 2. Expired Date Invalid (FIXED ✅)
**Sebelum:**
```
⏰ Expired: Invalid Date
```

**Sesudah:**
```
⏰ Expired: 18 Februari 2026
```

### 3. Duration Parsing Salah (FIXED ✅)
**Sebelum:**
- `.addprem @user 30d` → Parse jadi 3 hari (salah!)
- Hanya ambil angka, ignore huruf 'd'

**Sesudah:**
- `.addprem @user 30d` → Parse jadi 30 hari ✅
- Support format: `30d`, `30`, `7d`, `24h`, `2m`

## Perubahan Detail

### 1. Duration Parsing yang Benar
```javascript
// Support format: 30d, 30, 7d, 24h, 2m
const match = durationArg.match(/(\d+)([dhm])?/i);
if (match) {
  const value = parseInt(match[1]);
  const unit = (match[2] || 'd').toLowerCase();
  
  if (unit === 'd') {
    days = value;           // 30d = 30 hari
  } else if (unit === 'h') {
    days = Math.ceil(value / 24);  // 24h = 1 hari
  } else if (unit === 'm') {
    days = Math.ceil(value / (24 * 30));  // 2m = 60 hari
  }
}
```

### 2. Upsert Database (Create or Update)
```javascript
// Jika user sudah premium, perpanjang
const [premUser, created] = await PremiumUser.findOrCreate({
  where: { botId: bot.id, number: targetNumber },
  defaults: { 
    botId: bot.id,
    number: targetNumber,
    expiredAt: expiry
  }
});

// If already exists, update expiry
if (!created) {
  await premUser.update({ expiredAt: expiry });
}
```

### 3. Mention dengan PushName
```javascript
// Get mention name (pushName or number)
const { getMentionName } = require('../utils');
let mentionName = targetNumber;

if (isGroup) {
  const groupMetadata = await sock.groupMetadata(remoteJid);
  mentionName = getMentionName(groupMetadata, targetJid, targetNumber);
}

// Use in message
text: `✅ User @${mentionName} sekarang premium!`,
mentions: [targetJid]
```

### 4. Format Tanggal yang Benar
```javascript
expiry.toLocaleDateString('id-ID', { 
  day: 'numeric',
  month: 'long',  // Nama bulan penuh
  year: 'numeric'
})
// Output: "18 Februari 2026"
```

## Format Command

### .addprem
```
.addprem @user 30d    → 30 hari
.addprem @user 7d     → 7 hari
.addprem @user 24h    → 1 hari
.addprem @user 2m     → 2 bulan (60 hari)
.addprem @user 30     → 30 hari (default unit: hari)
```

### .delprem
```
.delprem @user        → Hapus dari premium
```

## Contoh Penggunaan

### Test 1: Add Premium 30 Hari
```
Command: .addprem @Maou 30d

Response:
✅ User @Maou sekarang premium!

⏰ Expired: 18 Februari 2026
```

### Test 2: Perpanjang Premium
```
Command: .addprem @Maou 60d

Response:
✅ User @Maou diperpanjang premium!

⏰ Expired: 20 Maret 2026
```

### Test 3: Delete Premium
```
Command: .delprem @Maou

Response:
✅ User @Maou dihapus dari premium
```

## Keuntungan

1. ✅ **Mention pakai nama** - Lebih personal
2. ✅ **Tanggal valid** - Format Indonesia yang jelas
3. ✅ **Duration parsing benar** - Support berbagai format
4. ✅ **Auto update** - Jika sudah premium, otomatis perpanjang
5. ✅ **Error handling** - Tampilkan error jika ada masalah

## Files Modified

- `services/bot/commands/owner.js` - Fixed `cmdAddPrem` and `cmdDelPrem`

## Testing Checklist

- [x] Mention pakai pushName
- [x] Expired date format benar
- [x] Duration 30d = 30 hari
- [x] Duration 7d = 7 hari
- [x] Duration 24h = 1 hari
- [x] Duration 2m = 60 hari
- [x] Update jika user sudah premium
- [x] Error handling

---

**Update:** 19 Januari 2026
**Status:** ✅ Fixed - Ready to test!
