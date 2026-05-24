# Security dan Environment Variables

## 1. Tujuan

Dokumen ini menjelaskan cara menghubungkan React di Vercel dengan Google Apps Script secara aman untuk level MVP.

## 2. Jenis Token

Ada dua jenis token yang direkomendasikan.

### 2.1 App API Token

Token ini dipakai agar backend Apps Script hanya memproses request dari aplikasi yang mengetahui token.

Frontend Vercel:

```env
VITE_APP_API_TOKEN=token_rahasia
```

Apps Script Properties:

```txt
APP_API_TOKEN=token_rahasia
```

### 2.2 User Session Token

Token ini dibuat setelah user login.

Disimpan di browser:

```txt
localStorage.userToken
```

Dipakai pada request:

```json
{
  "action": "getSiswaList",
  "token": "USER_SESSION_TOKEN",
  "payload": {}
}
```

## 3. Penting: Token Frontend Tidak 100% Rahasia

Karena React berjalan di browser, semua `VITE_` env akan masuk ke bundle frontend dan bisa dilihat oleh user teknis.

Artinya:

- `VITE_APP_API_TOKEN` bukan rahasia absolut.
- Tetap perlu role-based access di backend.
- Jangan hanya mengandalkan token frontend untuk keamanan data user.

Untuk MVP, token ini berguna sebagai lapisan dasar. Untuk production serius, pertimbangkan backend proxy/serverless function yang menyimpan secret di server, bukan browser.

## 4. Opsi Arsitektur MVP

```txt
React Browser
  -> langsung request ke Google Apps Script
  -> membawa app token
  -> membawa user session token
```

Kelebihan:

- Cepat dibuat.
- Murah.
- Tidak perlu server tambahan.

Kekurangan:

- Token app bisa terlihat di browser.
- Apps Script Web App harus dapat diakses publik.
- Keamanan bergantung pada validasi backend dan session user.

## 5. Opsi Arsitektur Lebih Aman

```txt
React Browser
  -> Vercel Serverless API /api/gas-proxy
  -> Google Apps Script
```

Pada opsi ini:

- Secret Apps Script disimpan di Vercel serverless env tanpa prefix `VITE_`.
- Browser tidak melihat token backend.
- Lebih aman.

Contoh env Vercel untuk serverless:

```env
GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
GAS_APP_API_TOKEN=token_rahasia
```

Frontend request ke:

```txt
/api/gas-proxy
```

Proxy kemudian meneruskan ke Apps Script.

Rekomendasi:

- MVP cepat: langsung dari React ke Apps Script.
- Production lebih aman: gunakan Vercel serverless proxy.

## 6. Env untuk MVP Langsung React ke Apps Script

Vercel Environment Variables:

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
VITE_APP_API_TOKEN=token_rahasia
```

Apps Script Properties:

```txt
APP_API_TOKEN=token_rahasia
SPREADSHEET_ID=id_spreadsheet
```

## 7. Env untuk Opsi Proxy Vercel

Vercel Environment Variables:

```env
GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
GAS_APP_API_TOKEN=token_rahasia
```

Frontend tidak perlu menyimpan token Apps Script.

Frontend cukup request ke:

```txt
/api/gas-proxy
```

## 8. Contoh Vercel Serverless Proxy

File:

```txt
frontend/api/gas-proxy.js
```

Isi:

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const gasUrl = process.env.GAS_WEB_APP_URL;
    const appToken = process.env.GAS_APP_API_TOKEN;

    if (!gasUrl || !appToken) {
      return res.status(500).json({
        success: false,
        message: 'Server env belum dikonfigurasi'
      });
    }

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'x-app-token': appToken
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(text);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
```

Frontend client jika menggunakan proxy:

```javascript
export async function apiRequest(action, payload = {}, token = '') {
  const response = await fetch('/api/gas-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action,
      token,
      payload
    })
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Request gagal');
  }

  return result.data;
}
```

## 9. Rekomendasi untuk Project Ini

Karena rencana Anda adalah GitHub + Vercel + Apps Script, rekomendasi terbaik:

### Untuk tahap awal

Gunakan langsung:

```txt
React -> Apps Script
```

Dengan env:

```env
VITE_GAS_WEB_APP_URL
VITE_APP_API_TOKEN
```

### Setelah fitur utama stabil

Naikkan keamanan ke:

```txt
React -> Vercel Serverless Proxy -> Apps Script
```

Dengan env tanpa prefix `VITE_`:

```env
GAS_WEB_APP_URL
GAS_APP_API_TOKEN
```

## 10. Checklist Security

- [ ] Jangan commit `.env`.
- [ ] Jangan commit token asli.
- [ ] Jangan commit password plain text.
- [ ] Gunakan Script Properties untuk `APP_API_TOKEN`.
- [ ] Gunakan Script Properties untuk `SPREADSHEET_ID`.
- [ ] Validasi role di Apps Script.
- [ ] Validasi payload di Apps Script.
- [ ] Gunakan HTTPS endpoint.
- [ ] Log mutasi data penting.
- [ ] Batasi menu frontend sesuai role.
- [ ] Tetap cek role di backend.
- [ ] Rotate token jika sudah terlanjur bocor.
- [ ] Jangan tampilkan stack trace error ke user.
