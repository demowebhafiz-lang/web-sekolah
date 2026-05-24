# Deployment Guide: GitHub, Vercel, dan Google Apps Script

## 1. Target Deployment

Frontend React akan dideploy ke Vercel.

Backend Google Apps Script akan dideploy sebagai Web App.

Google Sheets menjadi database.

## 2. Alur Koneksi

```txt
GitHub Repository
   |
   v
Vercel Deploy React
   |
   | ENV:
   | VITE_GAS_WEB_APP_URL
   | VITE_APP_API_TOKEN
   v
Google Apps Script Web App
   |
   | Script Properties:
   | APP_API_TOKEN
   | SPREADSHEET_ID
   v
Google Sheets
```

## 3. Setup GitHub Repository

Struktur disarankan:

```txt
nilai-hafalan-app/
  docs/
  frontend/
  apps-script/
  README.md
  .gitignore
```

Contoh `.gitignore`:

```gitignore
node_modules
dist
.env
.env.local
.env.production
.DS_Store
```

Jangan commit:

```txt
.env
.env.local
.env.production
token asli
Spreadsheet ID jika dianggap sensitif
```

## 4. Setup Google Sheets

1. Buat spreadsheet baru.
2. Buat sheet:
   - Users
   - Siswa
   - Kelas
   - Guru
   - Mapel
   - Nilai
   - Hafalan
   - TahunAjaran
   - Sessions
   - Logs
3. Isi header sesuai dokumen ERD.
4. Copy Spreadsheet ID dari URL.

Contoh URL:

```txt
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

## 5. Setup Google Apps Script

1. Buka spreadsheet.
2. Klik Extensions.
3. Pilih Apps Script.
4. Buat file:
   - Code.gs
   - Config.gs
   - Sheets.gs
   - Auth.gs
   - Siswa.gs
   - Nilai.gs
   - Hafalan.gs
   - Logs.gs
5. Isi kode backend.

## 6. Set Script Properties

Di Apps Script:

1. Project Settings.
2. Script Properties.
3. Tambahkan:

```txt
SPREADSHEET_ID = id_spreadsheet_database
APP_API_TOKEN = token_rahasia_yang_panjang
```

Token contoh format:

```txt
nhf_2026_prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Gunakan token panjang acak.

## 7. Deploy Apps Script sebagai Web App

1. Klik Deploy.
2. New deployment.
3. Pilih type: Web app.
4. Description: Production API.
5. Execute as: Me.
6. Who has access: Anyone.
7. Klik Deploy.
8. Copy Web App URL.

Format URL:

```txt
https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

## 8. Setup React Frontend

Di folder frontend:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
```

Buat `.env.example`:

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
VITE_APP_API_TOKEN=change_me
```

Buat `.env.local` untuk local development:

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
VITE_APP_API_TOKEN=token_sama_dengan_apps_script
```

## 9. API Client React

Buat file:

```txt
frontend/src/api/gasClient.js
```

Isi:

```javascript
const GAS_URL = import.meta.env.VITE_GAS_WEB_APP_URL;
const APP_TOKEN = import.meta.env.VITE_APP_API_TOKEN;

export async function gasRequest(action, payload = {}, token = '') {
  if (!GAS_URL) {
    throw new Error('VITE_GAS_WEB_APP_URL belum diatur');
  }

  if (!APP_TOKEN) {
    throw new Error('VITE_APP_API_TOKEN belum diatur');
  }

  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
      'x-app-token': APP_TOKEN
    },
    body: JSON.stringify({
      action,
      token,
      payload
    })
  });

  let result;

  try {
    result = await response.json();
  } catch (error) {
    throw new Error('Response backend bukan JSON valid');
  }

  if (!result.success) {
    throw new Error(result.message || 'Request gagal');
  }

  return result.data;
}
```

## 10. Deploy ke Vercel

1. Push project ke GitHub.
2. Buka Vercel.
3. Add New Project.
4. Import repository GitHub.
5. Set Root Directory ke:

```txt
frontend
```

6. Framework Preset: Vite.
7. Build Command:

```txt
npm run build
```

8. Output Directory:

```txt
dist
```

9. Tambahkan Environment Variables:

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
VITE_APP_API_TOKEN=token_sama_dengan_apps_script
```

10. Deploy.

## 11. Update Environment Variable Vercel

Jika Apps Script URL berubah:

1. Buka Project Vercel.
2. Settings.
3. Environment Variables.
4. Update `VITE_GAS_WEB_APP_URL`.
5. Redeploy project.

## 12. Test Production

Checklist:

1. Buka URL Vercel.
2. Login admin.
3. Coba ambil daftar siswa.
4. Tambah siswa.
5. Input nilai.
6. Input hafalan.
7. Cek data masuk ke Google Sheets.

## 13. Masalah Umum

### 13.1 Unauthorized app token

Penyebab:

- `VITE_APP_API_TOKEN` di Vercel berbeda dari `APP_API_TOKEN` di Apps Script.
- Apps Script belum membaca Script Properties.
- Header tidak terkirim.

Solusi:

- Samakan token.
- Redeploy Vercel setelah update env.
- Cek nama header `x-app-token`.

### 13.2 Response backend bukan JSON

Penyebab:

- Apps Script error fatal.
- Web App belum dideploy.
- URL salah.
- Akses Web App belum Anyone.

Solusi:

- Buka Apps Script executions/log.
- Pastikan response pakai `ContentService`.
- Deploy ulang.

### 13.3 CORS error

Solusi utama:

- Gunakan `Content-Type: text/plain;charset=utf-8`.
- Hindari custom header tambahan selain yang diperlukan.
- Jika header `x-app-token` memicu preflight di environment tertentu, pindahkan token aplikasi ke body request sebagai `appToken`.

Alternatif body token:

```json
{
  "appToken": "TOKEN",
  "action": "login",
  "payload": {}
}
```

### 13.4 Env Vercel tidak terbaca

Penyebab:

- Nama env tidak diawali `VITE_`.
- Belum redeploy setelah update env.

Solusi:

- Gunakan `VITE_GAS_WEB_APP_URL`.
- Gunakan `VITE_APP_API_TOKEN`.
- Redeploy.

## 14. Rekomendasi Branch

```txt
main        = production
develop     = development
feature/*   = fitur baru
fix/*       = perbaikan bug
```

## 15. Rekomendasi Release

1. Merge ke main.
2. Vercel auto deploy.
3. Apps Script deploy new version jika backend berubah.
4. Test smoke production.
5. Catat versi release di GitHub Releases.
