# Revisi Arsitektur: Frontend GitHub/Vercel dan Backend Google Apps Script

## 1. Koreksi Arsitektur

Pada project ini, backend **Google Apps Script tidak ikut disimpan ke GitHub**.

Alur yang dipakai:

```txt
GitHub
  -> menyimpan source code frontend React
  -> menyimpan dokumentasi project

Vercel
  -> deploy frontend React dari GitHub
  -> menyimpan environment variable frontend

Google Apps Script
  -> menyimpan file Code.gs dan file .gs lainnya di server Google
  -> dideploy sebagai Web App
  -> terhubung langsung dengan Google Sheets

Google Sheets
  -> menjadi database
```

## 2. Arsitektur Final

```txt
User Browser
   |
   v
Frontend React di Vercel
   |
   | HTTPS POST
   | URL dari Vercel ENV
   | Token dari Vercel ENV
   v
Google Apps Script Web App
   |
   | SpreadsheetApp.getActiveSpreadsheet()
   v
Google Sheets Database
```

## 3. Repository GitHub

Karena file `.gs` disimpan langsung di Google Apps Script, struktur GitHub cukup seperti ini:

```txt
nilai-hafalan-app/
  docs/
    01_PRD.md
    02_SRS.md
    03_ERD_Google_Sheets.md
    04_API_Specification.md
    05_UI_UX_Wireframe.md
    06_User_Flow.md
    07_Technical_Design_Document.md
    08_Backlog_Development.md
    09_Test_Case_QA_Checklist.md
    10_Deployment_Guide.md
    11_User_Manual.md
    12_Security_Env.md
    13_Backend_CodeGS_Flow.md
    14_Revisi_Arsitektur_Vercel_AppsScript.md

  src/
    api/
      gasClient.js
    components/
    features/
    App.jsx
    main.jsx

  public/
  package.json
  vite.config.js
  .env.example
  .gitignore
  README.md
```

Tidak perlu folder:

```txt
apps-script/
```

karena backend dikelola langsung di Google Apps Script editor.

## 4. Environment Variable Vercel

Di Vercel hanya perlu menyimpan:

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
VITE_APP_API_TOKEN=token_rahasia
```

Penjelasan:

| Env | Fungsi |
|---|---|
| VITE_GAS_WEB_APP_URL | URL Web App Google Apps Script |
| VITE_APP_API_TOKEN | Token sederhana agar Apps Script hanya menerima request dari aplikasi |

## 5. Script Properties Google Apps Script

Karena Apps Script dibuat langsung dari Google Sheets atau terhubung langsung dengan spreadsheet, maka **tidak wajib memakai `SPREADSHEET_ID`**.

Script Properties cukup:

```txt
APP_API_TOKEN=token_rahasia_yang_sama_dengan_vercel
SESSION_EXPIRED_HOURS=12
```

Tidak perlu:

```txt
SPREADSHEET_ID=id_spreadsheet
```

## 6. Cara Apps Script Mengakses Spreadsheet

Karena backend berada di Google Apps Script yang terikat langsung dengan Google Sheets, gunakan:

```javascript
function getSpreadsheet_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}
```

Bukan:

```javascript
function getSpreadsheet_() {
  const spreadsheetId = PropertiesService
    .getScriptProperties()
    .getProperty('SPREADSHEET_ID');

  return SpreadsheetApp.openById(spreadsheetId);
}
```

## 7. Sheets.gs Revisi

Gunakan versi ini:

```javascript
function getSpreadsheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new AppError_('Spreadsheet aktif tidak ditemukan', 500);
  }

  return spreadsheet;
}

function getSheet_(sheetName) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);

  if (!sheet) {
    throw new AppError_('Sheet tidak ditemukan: ' + sheetName, 500);
  }

  return sheet;
}

function getRows_(sheetName) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    return [];
  }

  const headers = values[0];

  return values.slice(1).map(function (row) {
    const item = {};
    headers.forEach(function (header, index) {
      item[header] = row[index];
    });
    return item;
  });
}

function appendRow_(sheetName, object) {
  const sheet = getSheet_(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const row = headers.map(function (header) {
    return object[header] !== undefined ? object[header] : '';
  });

  sheet.appendRow(row);
}

function updateRowById_(sheetName, idField, idValue, patch) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    throw new AppError_('Data kosong', 404);
  }

  const headers = values[0];
  const idIndex = headers.indexOf(idField);

  if (idIndex === -1) {
    throw new AppError_('Kolom ID tidak ditemukan: ' + idField, 500);
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(idValue)) {
      headers.forEach(function (header, colIndex) {
        if (patch[header] !== undefined) {
          sheet.getRange(i + 1, colIndex + 1).setValue(patch[header]);
        }
      });

      return true;
    }
  }

  throw new AppError_('Data tidak ditemukan: ' + idValue, 404);
}

function generateId_(prefix) {
  return prefix + '-' + Utilities.getUuid();
}
```

## 8. Code.gs Tetap Berada di Google Apps Script

File berikut dibuat langsung di editor Google Apps Script:

```txt
Code.gs
Config.gs
Response.gs
Request.gs
Router.gs
Auth.gs
Sheets.gs
Validators.gs
Logs.gs
Siswa.gs
Kelas.gs
Guru.gs
Mapel.gs
Nilai.gs
Hafalan.gs
Dashboard.gs
```

File-file tersebut **tidak perlu di-push ke GitHub**.

## 9. Alur Deploy Google Apps Script

1. Buat Google Sheets database.
2. Dari Google Sheets, buka:

```txt
Extensions > Apps Script
```

3. Buat file `.gs` di editor Apps Script.
4. Isi `APP_API_TOKEN` di Script Properties.
5. Deploy sebagai Web App.
6. Copy URL Web App.
7. Masukkan URL tersebut ke Vercel env:

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

8. Masukkan token yang sama ke Vercel env:

```env
VITE_APP_API_TOKEN=token_rahasia
```

## 10. Alur Deploy Vercel

1. Push frontend React ke GitHub.
2. Import repository ke Vercel.
3. Set framework: Vite.
4. Tambahkan environment variables:

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
VITE_APP_API_TOKEN=token_rahasia
```

5. Deploy.
6. Test koneksi dari frontend ke Apps Script.

## 11. Frontend gasClient.js

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
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      appToken: APP_TOKEN,
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

Catatan penting:

Token dikirim di body sebagai `appToken`, bukan header `x-app-token`.

Ini lebih aman untuk menghindari masalah CORS/preflight di Google Apps Script.

## 12. Request.gs Revisi

Karena token dikirim di body, `Request.gs` bisa dibuat seperti ini:

```javascript
function validateRequestEvent_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new AppError_('Request body kosong', 400);
  }
}

function parseRequestBody_(e) {
  try {
    return JSON.parse(e.postData.contents || '{}');
  } catch (error) {
    throw new AppError_('Request body bukan JSON valid', 400);
  }
}

function getRequestAppToken_(body) {
  return body.appToken || '';
}
```

## 13. Code.gs Revisi

```javascript
function doPost(e) {
  try {
    validateRequestEvent_(e);

    const body = parseRequestBody_(e);
    const appToken = getRequestAppToken_(body);

    validateAppToken_(appToken);

    const action = body.action;
    const token = body.token || '';
    const payload = body.payload || {};

    if (!action) {
      throw new AppError_('Action wajib diisi', 400);
    }

    const result = routeAction_(action, payload, token);

    return jsonResponse_({
      success: true,
      message: result.message || 'Berhasil',
      data: result.data || {}
    });
  } catch (error) {
    return errorResponse_(error);
  }
}

function doGet(e) {
  return jsonResponse_({
    success: true,
    message: 'Backend Google Apps Script aktif',
    data: {
      service: 'nilai-hafalan-api',
      version: '1.0.0'
    }
  });
}
```

## 14. Auth.gs Revisi Token

```javascript
function validateAppToken_(token) {
  const expected = PropertiesService
    .getScriptProperties()
    .getProperty('APP_API_TOKEN');

  if (!expected) {
    throw new AppError_('APP_API_TOKEN belum dikonfigurasi', 500);
  }

  if (token !== expected) {
    throw new AppError_('Unauthorized app token', 401);
  }
}
```

## 15. Dokumentasi yang Perlu Direvisi

Bagian berikut di dokumen lama harus direvisi:

### Hapus dari struktur GitHub

```txt
apps-script/
```

### Hapus dari `.env`

```env
SPREADSHEET_ID=...
```

### Hapus dari Script Properties

```txt
SPREADSHEET_ID=...
```

### Ganti helper spreadsheet

Dari:

```javascript
SpreadsheetApp.openById(spreadsheetId)
```

Menjadi:

```javascript
SpreadsheetApp.getActiveSpreadsheet()
```

### Ganti token request

Dari header:

```txt
x-app-token: APP_API_TOKEN
```

Menjadi body:

```json
{
  "appToken": "APP_API_TOKEN",
  "action": "login",
  "payload": {}
}
```

## 16. Catatan Penting

### 16.1 Backend tidak ikut GitHub

Ini valid dan sederhana untuk tahap awal.

Kelebihan:

1. Tidak ada file backend bocor di repository.
2. Apps Script langsung dekat dengan Google Sheets.
3. Deploy backend cukup dari editor Google.
4. Frontend GitHub tetap bersih.

Kekurangan:

1. Version control backend lebih terbatas.
2. Perubahan Code.gs tidak tercatat di GitHub.
3. Kolaborasi backend lebih sulit.
4. Backup manual perlu dilakukan berkala.

### 16.2 Backup Code.gs

Walaupun tidak ikut GitHub, sebaiknya sesekali backup manual kode Apps Script ke file lokal/private.

Rekomendasi:

```txt
backup-apps-script/
  Code.gs
  Auth.gs
  Sheets.gs
  Nilai.gs
  Hafalan.gs
```

Folder backup ini tidak perlu masuk repository public.

## 17. Arsitektur yang Dipakai

Arsitektur final project:

```txt
Frontend:
  GitHub -> Vercel

Backend:
  Google Apps Script server Google

Database:
  Google Sheets

Koneksi:
  Vercel ENV menyimpan URL Apps Script dan token
  Apps Script Properties menyimpan APP_API_TOKEN
  Apps Script membaca Google Sheets aktif dengan getActiveSpreadsheet()
```

## 18. Checklist Final

- [ ] File `.gs` tidak disimpan di GitHub.
- [ ] GitHub hanya berisi frontend dan docs.
- [ ] Vercel menyimpan `VITE_GAS_WEB_APP_URL`.
- [ ] Vercel menyimpan `VITE_APP_API_TOKEN`.
- [ ] Apps Script menyimpan `APP_API_TOKEN`.
- [ ] Tidak ada `SPREADSHEET_ID`.
- [ ] Apps Script menggunakan `SpreadsheetApp.getActiveSpreadsheet()`.
- [ ] Token dikirim lewat body sebagai `appToken`.
- [ ] Apps Script dideploy sebagai Web App.
- [ ] URL Apps Script dimasukkan ke Vercel.
