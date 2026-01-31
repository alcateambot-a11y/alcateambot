# Update Mention dengan PushName

## Perubahan

Semua mention `@{number}` sekarang menggunakan **pushName** (nama WA user) jika tersedia!

### Sebelum:
```
🚫 @6283174020347 dikick karena mengirim link!
⚠️ @6281340078956 jangan kirim link di grup ini!
✅ @6283174020347 sudah tidak AFK lagi!
```

### Sesudah:
```
🚫 @Argan dikick karena mengirim link!
⚠️ @Kaizer jangan kirim link di grup ini!
✅ @Argan sudah tidak AFK lagi!
```

## Cara Kerja

Bot sekarang menggunakan helper function `getMentionName()` yang:

1. **Cek pushName** dari group metadata
2. **Fallback ke nomor** jika pushName tidak ada atau kosong
3. **Handle LID format** (format baru WhatsApp)

## Fitur yang Sudah Diupdate

### Group Protection:
- ✅ Blacklist kick
- ✅ Antilink (warn & kick)
- ✅ Antiwame (warn & kick)
- ✅ Antilinkchannel
- ✅ Antibadword (warn & kick)
- ✅ Antisticker
- ✅ Antiviewonce
- ✅ Antispam

### AFK System:
- ✅ AFK mode aktif
- ✅ AFK exit message

## Contoh

### User dengan Nama WA:
```
User: Argan (6283174020347)
Mention: @Argan ✅
```

### User tanpa Nama WA:
```
User: (6281234567890)
Mention: @6281234567890 ✅
```

## Keuntungan

1. **Lebih Personal** - Mention pakai nama, bukan nomor
2. **Lebih Friendly** - User merasa lebih dihargai
3. **Lebih Profesional** - Seperti bot premium lainnya
4. **Auto Fallback** - Tetap pakai nomor jika tidak ada nama

## Testing

### Test 1: Antilink
```
1. Kirim link di group
2. Bot akan mention dengan nama: "@Argan jangan kirim link"
```

### Test 2: AFK
```
1. Ketik: .afk istirahat
2. Bot respon: "@Argan sekarang AFK"
3. Kirim pesan lagi
4. Bot respon: "@Argan sudah tidak AFK lagi!"
```

### Test 3: Antibadword
```
1. Kirim kata kasar
2. Bot akan mention dengan nama: "@Argan jangan menggunakan kata kasar!"
```

## Technical Details

### Helper Function:
```javascript
getMentionName(groupMetadata, jid, fallbackNumber)
```

**Parameters:**
- `groupMetadata` - Group metadata dari `sock.groupMetadata()`
- `jid` - User JID (e.g., 6283174020347@s.whatsapp.net)
- `fallbackNumber` - Nomor fallback jika pushName tidak ada

**Returns:**
- PushName jika ada (e.g., "Argan")
- Nomor jika tidak ada pushName (e.g., "6283174020347")

### Matching Logic:
1. Direct ID match
2. LID match (format baru WA)
3. Phone number match
4. Fallback to number

## Files Modified

- `services/bot/utils.js` - Added `getMentionName()` helper
- `services/botHandler.js` - Updated all protection mentions
- `services/bot/commands/group.js` - Updated AFK command

---

**Update:** 19 Januari 2026
**Status:** ✅ Active - All mentions now use pushName!
