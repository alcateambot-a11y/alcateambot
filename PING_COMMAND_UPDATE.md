# Update Command .ping

## Perubahan

Command `.ping` sekarang menampilkan response time dalam format **detik dengan monospace** seperti bot Wibusoft!

### Sebelum:
```
🏓 Pong!
📶 Latency: 150ms
```

### Sesudah (seperti Wibusoft):
```
`0.0007` second
```

Angka akan muncul dalam **kotak hitam** (monospace) di WhatsApp!

## Cara Kerja

1. Bot kirim pesan "🏓 Pong!" dulu
2. Hitung berapa lama waktu yang dibutuhkan
3. Edit pesan tersebut dengan response time dalam detik
4. Format: backtick (`) + angka + backtick = kotak hitam
5. Format: 4 digit desimal (0.0001 - 9.9999)

## Contoh Response Time

- **`0.0007` second** = 0.7ms (super cepat!)
- **`0.0150` second** = 15ms (cepat)
- **`0.1000` second** = 100ms (normal)
- **`0.5000` second** = 500ms (lambat)

## Kenapa Pakai Backtick?

Backtick (`) di WhatsApp membuat text jadi:
- ✅ Monospace font (seperti code)
- ✅ Background hitam/abu-abu (kotak)
- ✅ Lebih menonjol dan keren
- ✅ Format yang sama dengan Wibusoft

## Testing

Kirim ke bot:
```
.ping
```

Bot akan respon dengan format baru:
```
`0.0015` second
```

Angka akan muncul dalam kotak hitam yang keren!

## Alias

Command ini juga bisa dipanggil dengan:
- `.ping`
- `.speed`
- `.speedtest`

Semua akan menampilkan response time yang sama.

---

**Update:** 19 Januari 2026
**Status:** ✅ Active dengan Monospace Formatting
