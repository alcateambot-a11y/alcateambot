# Fitur AFK dan ToTag

## 📋 Ringkasan

Dua fitur baru telah ditambahkan ke bot:

### 1. Fitur AFK (Away From Keyboard)
Memungkinkan user untuk set status AFK sehingga bot tidak akan mention mereka di tagall/hidetag/totag, dan bot akan otomatis hapus mention manual dari user lain.

### 2. Fitur ToTag
Memungkinkan admin untuk reply pesan (text/gambar/video/dll) dengan caption `.totag` untuk mention semua member grup dengan pesan tersebut.

---

## 🎯 Fitur AFK

### Cara Penggunaan

#### Set Status AFK
```
.afk [alasan]
```

**Contoh:**
- `.afk` - Set AFK tanpa alasan
- `.afk makan dulu` - Set AFK dengan alasan
- `.afk meeting penting` - Set AFK dengan alasan

#### Keluar dari Mode AFK
User cukup mengirim pesan apapun di grup, bot akan otomatis mendeteksi dan mengeluarkan user dari mode AFK.

### Fitur AFK:

1. **Proteksi dari Mention**
   - User yang AFK tidak akan di-mention di command `.tagall`, `.hidetag`, atau `.totag`
   - Bot akan skip user AFK saat melakukan mass mention

2. **Auto Delete Mention Manual**
   - Jika ada user lain yang manual mention user yang sedang AFK
   - Bot akan otomatis hapus pesan tersebut
   - Bot akan kirim notifikasi bahwa user sedang AFK dengan info:
     - Alasan AFK
     - Durasi AFK (berapa jam/menit)

3. **Auto Exit AFK**
   - Ketika user AFK mengirim pesan apapun
   - Bot otomatis keluarkan dari mode AFK
   - Bot kirim notifikasi dengan durasi AFK

### Contoh Penggunaan:

```
User: .afk istirahat sebentar
Bot: 💤 AFK MODE AKTIF
     @6281234567890 sekarang AFK
     Alasan: istirahat sebentar
     
     ⚠️ Bot tidak akan mention kamu di tagall/hidetag/totag
     ⚠️ Mention manual dari user lain akan dihapus otomatis

[User lain mention user yang AFK]
Bot: [Hapus pesan mention]
     ⚠️ USER SEDANG AFK
     
     • @6281234567890
       Alasan: istirahat sebentar
       Sejak: 0j 15m yang lalu
     
     ❌ Mention otomatis dihapus!

[User AFK kirim pesan]
Bot: ✅ @6281234567890 sudah tidak AFK lagi!
     
     Durasi AFK: 0j 15m
     Alasan: istirahat sebentar
```

---

## 🏷️ Fitur ToTag

### Cara Penggunaan

Reply pesan yang ingin di-totag dengan caption `.totag`:

```
[Reply pesan] .totag
```

### Fitur ToTag:

1. **Support Semua Tipe Media**
   - Text
   - Gambar (dengan caption)
   - Video (dengan caption)
   - Sticker
   - Audio
   - Document

2. **Mention Semua Member**
   - Bot akan mention semua member grup (hidetag)
   - Kecuali member yang sedang AFK

3. **Auto Delete Command**
   - Pesan command `.totag` akan otomatis dihapus
   - Hanya pesan yang di-reply yang akan dikirim dengan mention

### Contoh Penggunaan:

```
[User kirim gambar dengan caption "Info penting"]
Admin: [Reply gambar tersebut] .totag

Bot: [Kirim ulang gambar dengan caption "Info penting" + mention semua member]
     [Hapus pesan command .totag]
```

### Perbedaan dengan TagAll dan HideTag:

| Command | Fungsi | Tampilan Mention |
|---------|--------|------------------|
| `.tagall` | Mention semua dengan list | Terlihat list @mention |
| `.hidetag` | Mention semua tersembunyi | Tidak terlihat mention |
| `.totag` | Reply pesan + mention semua | Tidak terlihat mention |

---

## 🔧 Implementasi Teknis

### Database Changes

Ditambahkan kolom baru di tabel `Groups`:
```sql
ALTER TABLE Groups ADD COLUMN afkUsers TEXT DEFAULT '[]'
```

Format data AFK:
```json
[
  {
    "number": "6281234567890",
    "jid": "6281234567890@s.whatsapp.net",
    "reason": "istirahat sebentar",
    "time": 1234567890000
  }
]
```

### File Changes

1. **models/Group.js**
   - Tambah field `afkUsers`

2. **services/bot/commands/group.js**
   - Tambah function `cmdAFK()` - Handle command .afk
   - Tambah function `cmdToTag()` - Handle command .totag
   - Update `cmdTagAll()` - Filter user AFK
   - Update `cmdHideTag()` - Filter user AFK

3. **services/botHandler.js**
   - Tambah logic deteksi user AFK kirim pesan (exit AFK)
   - Tambah logic deteksi mention user AFK (delete + notify)

4. **services/bot/commandList.js**
   - Tambah command `afk` ke list
   - Tambah command `totag` ke list
   - Update deskripsi `tagall` dan `hidetag`

5. **scripts/addAfkColumn.js**
   - Script untuk menambahkan kolom afkUsers ke database

---

## ✅ Testing

### Test AFK Feature:
1. ✅ Set AFK dengan alasan
2. ✅ Set AFK tanpa alasan
3. ✅ User AFK tidak di-mention di tagall
4. ✅ User AFK tidak di-mention di hidetag
5. ✅ User AFK tidak di-mention di totag
6. ✅ Mention manual user AFK dihapus
7. ✅ Notifikasi AFK muncul saat di-mention
8. ✅ Auto exit AFK saat user kirim pesan
9. ✅ Durasi AFK dihitung dengan benar

### Test ToTag Feature:
1. ✅ Reply text dengan .totag
2. ✅ Reply gambar dengan .totag
3. ✅ Reply video dengan .totag
4. ✅ Reply sticker dengan .totag
5. ✅ Reply audio dengan .totag
6. ✅ Reply document dengan .totag
7. ✅ User AFK tidak di-mention
8. ✅ Command message dihapus otomatis

---

## 📝 Notes

- Fitur AFK hanya bekerja di grup
- Fitur ToTag hanya bisa digunakan oleh admin grup
- Data AFK disimpan per grup (user bisa AFK di grup A tapi tidak di grup B)
- User AFK akan otomatis keluar dari mode AFK saat mengirim pesan apapun
- Mention manual user AFK akan dihapus untuk melindungi privasi user

---

## 🚀 Deployment

Untuk deploy fitur ini:

1. Run migration script:
```bash
node scripts/addAfkColumn.js
```

2. Restart bot:
```bash
npm restart
```

3. Test di grup:
```
.afk testing
.tagall test
.totag (reply pesan)
```

---

## 🎉 Selesai!

Kedua fitur sudah siap digunakan dan terintegrasi dengan sistem bot yang ada.
