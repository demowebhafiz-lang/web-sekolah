# Technical Design Document

## 1. Arsitektur

```txt
React/Vite Frontend
  |
  | fetch POST
  | x-app-token
  v
Google Apps Script Web App
  |
  | SpreadsheetApp
  v
Google Sheets
```

## 2. Repository Structure

```txt
nilai-hafalan-app/
  docs/
  frontend/
    src/
      api/
        gasClient.js
      components/
        Layout.jsx
        Sidebar.jsx
        Header.jsx
        ProtectedRoute.jsx
        DataTable.jsx
        FormInput.jsx
        SelectInput.jsx
        Loading.jsx
        EmptyState.jsx
      features/
        auth/
          LoginPage.jsx
          authService.js
        dashboard/
          DashboardPage.jsx
        siswa/
          SiswaListPage.jsx
          SiswaFormPage.jsx
          siswaService.js
        kelas/
          KelasListPage.jsx
          KelasFormPage.jsx
          kelasService.js
        guru/
          GuruListPage.jsx
          GuruFormPage.jsx
          guruService.js
        mapel/
          MapelListPage.jsx
          MapelFormPage.jsx
          mapelService.js
        nilai/
          NilaiInputPage.jsx
          NilaiRekapPage.jsx
          nilaiService.js
        hafalan/
          HafalanInputPage.jsx
          HafalanRiwayatPage.jsx
          HafalanRekapPage.jsx
          hafalanService.js
        laporan/
          LaporanNilaiPage.jsx
          LaporanHafalanPage.jsx
      hooks/
        useAuth.js
        useFetch.js
      utils/
        validators.js
        calculateAverage.js
        formatDate.js
      App.jsx
      main.jsx
    .env.example
    package.json
  apps-script/
    Code.gs
    Config.gs
    Auth.gs
    Sheets.gs
    Users.gs
    Siswa.gs
    Kelas.gs
    Guru.gs
    Mapel.gs
    Nilai.gs
    Hafalan.gs
    Dashboard.gs
    Logs.gs
    appsscript.json
```

## 3. Frontend Tech Stack

1. React JS.
2. Vite.
3. React Router DOM.
4. Tailwind CSS.
5. Fetch API.
6. React Hook Form.
7. Zod/Yup opsional.
8. Recharts untuk dashboard.
9. html2pdf.js opsional untuk export PDF.

## 4. Backend Tech Stack

1. Google Apps Script.
2. Google Sheets.
3. Script Properties.
4. LockService.
5. CacheService opsional.

## 5. Environment Variables

Frontend Vercel:

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
VITE_APP_API_TOKEN=isi_token_rahasia
```

Apps Script Properties:

```txt
APP_API_TOKEN=isi_token_rahasia
SPREADSHEET_ID=id_spreadsheet
```

## 6. Catatan Penting tentang Vite Env

Vite hanya membaca env yang diawali `VITE_`.

Benar:

```env
VITE_GAS_WEB_APP_URL=...
VITE_APP_API_TOKEN=...
```

Salah:

```env
GAS_WEB_APP_URL=...
APP_API_TOKEN=...
```

## 7. API Client Frontend

```javascript
const GAS_URL = import.meta.env.VITE_GAS_WEB_APP_URL;
const APP_TOKEN = import.meta.env.VITE_APP_API_TOKEN;

export async function gasRequest(action, payload = {}, options = {}) {
  const userToken = localStorage.getItem('userToken') || '';

  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
      'x-app-token': APP_TOKEN
    },
    body: JSON.stringify({
      action,
      token: options.token || userToken,
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

## 8. Auth Strategy MVP

### App Token

`VITE_APP_API_TOKEN` digunakan untuk membatasi request hanya dari aplikasi yang tahu token.

Catatan: token di frontend tetap bisa dilihat oleh user teknis karena masuk ke bundle browser. Jadi ini bukan security absolut. Untuk MVP cukup sebagai penghalang dasar.

### User Session Token

Setelah login, backend mengembalikan `USER_SESSION_TOKEN`.

Frontend simpan:

```txt
localStorage.userToken
localStorage.userProfile
```

Backend cek token untuk action selain login.

## 9. Role-Based Access

Frontend:

- Menyembunyikan menu sesuai role.
- ProtectedRoute untuk halaman tertentu.

Backend:

- Wajib validasi role lagi.
- Jangan mengandalkan frontend saja.

Contoh:

```javascript
requireRole_(token, ['admin', 'super_admin']);
```

## 10. Apps Script Entry Point

```javascript
function doPost(e) {
  try {
    validateAppToken_(getHeader_(e, 'x-app-token'));

    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action;
    const payload = body.payload || {};
    const token = body.token || '';

    const routes = {
      login,
      getSiswaList,
      createSiswa,
      updateSiswa,
      deleteSiswa,
      bulkSaveNilai,
      createHafalan,
      getRekapNilai,
      getRekapHafalan,
      getDashboardSummary
    };

    if (!routes[action]) {
      throw new Error('Action tidak dikenal');
    }

    const result = routes[action](payload, token);
    return jsonResponse_(result);
  } catch (error) {
    return jsonResponse_({
      success: false,
      message: error.message,
      errors: []
    });
  }
}
```

## 11. Sheet Helper

```javascript
function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  return SpreadsheetApp.openById(id);
}

function getSheet_(name) {
  const sheet = getSpreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error('Sheet tidak ditemukan: ' + name);
  return sheet;
}

function getRows_(sheetName) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();

  return values.map(row => {
    const obj = {};
    headers.forEach((key, i) => obj[key] = row[i]);
    return obj;
  });
}
```

## 12. Batch Write Nilai

Gunakan LockService agar tidak bentrok:

```javascript
function bulkSaveNilai(payload, token) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    // validate token, role, payload
    // read existing Nilai
    // update if unique key exists
    // append if not exists
    return {
      success: true,
      message: 'Nilai berhasil disimpan',
      data: {}
    };
  } finally {
    lock.releaseLock();
  }
}
```

## 13. Error Handling Frontend

Frontend harus menangani:

1. Backend unreachable.
2. Response bukan JSON.
3. Token salah.
4. Session expired.
5. Validasi gagal.
6. Data kosong.

## 14. Logging

Setiap mutasi data mencatat log:

```javascript
appendLog_({
  userId,
  action: 'bulkSaveNilai',
  entity: 'Nilai',
  entityId: '',
  detail: JSON.stringify(payload)
});
```

## 15. CORS Strategy

Dengan Apps Script Web App, gunakan:

```javascript
Content-Type: text/plain;charset=utf-8
```

Tujuannya untuk menghindari preflight yang sering menyebabkan masalah pada Apps Script.

## 16. Deployment Strategy

1. Frontend deploy ke Vercel.
2. Backend deploy sebagai Apps Script Web App.
3. URL Apps Script disimpan di Vercel env.
4. Token sama disimpan di Vercel env dan Apps Script Properties.
5. Google Sheets hanya diakses oleh Apps Script.

## 17. Scaling Notes

Jika data sudah besar:

1. Batasi request dengan pagination.
2. Gunakan filter di backend sebelum response.
3. Gunakan CacheService untuk data master.
4. Pertimbangkan migrasi ke Firebase/Supabase/PostgreSQL bila Apps Script lambat.
