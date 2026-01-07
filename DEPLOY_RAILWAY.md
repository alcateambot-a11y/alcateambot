# Deploy ke Railway

## Langkah-langkah:

### 1. Persiapan
- Pastikan project sudah di-push ke GitHub
- Buat akun di [railway.app](https://railway.app) (bisa login pakai GitHub)

### 2. Deploy di Railway

1. **Login ke Railway** → Klik "New Project"

2. **Pilih "Deploy from GitHub repo"** → Pilih repository ini

3. **Set Environment Variables** di Railway Dashboard:
   ```
   PORT=3000
   NODE_ENV=production
   JWT_SECRET=random-string-32-karakter-atau-lebih
   SESSION_SECRET=random-string-lain-32-karakter
   FRONTEND_URL=https://nama-app-kamu.up.railway.app
   ```

4. **Generate Domain**:
   - Klik project → Settings → Networking
   - Klik "Generate Domain"
   - Copy URL-nya (contoh: `https://nama-app.up.railway.app`)
   - Update `FRONTEND_URL` dengan URL tersebut

5. **Deploy** akan otomatis berjalan

### 3. Setelah Deploy

1. Buka URL Railway kamu
2. Register akun admin pertama
3. Login dan scan QR untuk connect WhatsApp bot

## Environment Variables

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `PORT` | Port server | `3000` |
| `NODE_ENV` | Environment | `production` |
| `JWT_SECRET` | Secret untuk JWT | `abc123xyz789...` |
| `SESSION_SECRET` | Secret untuk session | `def456uvw012...` |
| `FRONTEND_URL` | URL frontend | `https://app.up.railway.app` |

## Tips

- **Free Tier**: 500 jam/bulan (~20 hari jika 24/7)
- **Persistent Storage**: Session WhatsApp akan tersimpan
- **Auto Deploy**: Setiap push ke GitHub akan auto deploy

## Troubleshooting

### Bot disconnect setelah deploy?
- Cek logs di Railway Dashboard
- Pastikan session folder tidak di-gitignore (sudah dihandle)

### Build error?
- Cek apakah semua dependencies terinstall
- Lihat build logs di Railway

### QR tidak muncul?
- Pastikan WebSocket berjalan
- Cek browser console untuk error
