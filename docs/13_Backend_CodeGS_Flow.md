# Backend Google Apps Script: Alur Code.gs

## 1. Ringkasan

Backend menggunakan **Google Apps Script Web App** sebagai API untuk aplikasi React yang dideploy di Vercel.

Alur utama:

```txt
React di Vercel
  -> POST request ke Google Apps Script
  -> Apps Script validasi token
  -> Apps Script routing berdasarkan action
  -> Apps Script baca/tulis Google Sheets
  -> Response JSON dikirim ke React
```

## 2. Arsitektur

```txt
Browser User
   |
   v
React App / Vercel
   |
   | POST
   | Header/body token
   v
Google Apps Script Web App
   |
   v
Google Sheets
```

## 3. Environment dan Secret

### Vercel Environment Variables

Untuk koneksi langsung dari React ke Apps Script:

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
VITE_APP_API_TOKEN=isi_token_rahasia
```

Catatan: variable dengan prefix `VITE_` akan masuk ke bundle browser, jadi token ini bukan secret absolut.

### Google Apps Script Properties

Masukkan di:

```txt
Apps Script > Project Settings > Script Properties
```

```txt
SPREADSHEET_ID=id_google_spreadsheet
APP_API_TOKEN=isi_token_yang_sama_dengan_vercel
SESSION_EXPIRED_HOURS=12
```

## 4. Format Request dari React

```json
{
  "action": "bulkSaveNilai",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "kelasId": "KLS001",
    "mapelId": "MPL001",
    "jenisNilai": "harian",
    "items": []
  }
}
```

Disarankan menggunakan:

```txt
Content-Type: text/plain;charset=utf-8
```

agar lebih aman dari masalah CORS Apps Script.

## 5. Format Response Backend

### Sukses

```json
{
  "success": true,
  "message": "Berhasil",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": []
}
```

## 6. Struktur File Apps Script

```txt
apps-script/
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
  appsscript.json
```

## 7. Tanggung Jawab File

| File | Fungsi |
|---|---|
| Code.gs | Entry point `doPost(e)` dan `doGet(e)` |
| Config.gs | Konstanta sheet, role, status |
| Response.gs | Helper response JSON |
| Request.gs | Parse body dan ambil token |
| Router.gs | Routing action ke function |
| Auth.gs | Login, session, role |
| Sheets.gs | Helper Google Sheets |
| Validators.gs | Validasi payload |
| Logs.gs | Audit log |
| Siswa.gs | CRUD siswa |
| Kelas.gs | CRUD kelas |
| Guru.gs | CRUD guru |
| Mapel.gs | CRUD mapel |
| Nilai.gs | Input dan rekap nilai |
| Hafalan.gs | Input, riwayat, rekap hafalan |
| Dashboard.gs | Summary dashboard |

## 8. Alur doPost

```txt
doPost(e)
  -> validasi request tidak kosong
  -> ambil app token dari header/body
  -> cocokkan dengan APP_API_TOKEN di Script Properties
  -> parse JSON body
  -> ambil action, token, payload
  -> kirim ke routeAction
  -> routeAction cek public/protected route
  -> jika protected, validasi session user
  -> function action dijalankan
  -> return JSON
```

## 9. Code.gs

```javascript
function doPost(e) {
  try {
    validateRequestEvent_(e);

    const appToken = getRequestAppToken_(e);
    validateAppToken_(appToken);

    const body = parseRequestBody_(e);
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

## 10. Config.gs

```javascript
const SHEETS_ = {
  USERS: 'Users',
  SISWA: 'Siswa',
  KELAS: 'Kelas',
  GURU: 'Guru',
  MAPEL: 'Mapel',
  NILAI: 'Nilai',
  HAFALAN: 'Hafalan',
  TAHUN_AJARAN: 'TahunAjaran',
  SESSIONS: 'Sessions',
  LOGS: 'Logs'
};

const ROLES_ = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  GURU_MAPEL: 'guru_mapel',
  GURU_TAHFIDZ: 'guru_tahfidz',
  WALI_KELAS: 'wali_kelas',
  KEPALA_SEKOLAH: 'kepala_sekolah',
  ORANG_TUA: 'orang_tua'
};

const STATUS_ = {
  AKTIF: 'aktif',
  NONAKTIF: 'nonaktif'
};
```

## 11. Response.gs

```javascript
function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse_(error) {
  return jsonResponse_({
    success: false,
    message: error && error.message ? error.message : 'Terjadi kesalahan server',
    errors: error && error.errors ? error.errors : []
  });
}

function AppError_(message, statusCode, errors) {
  this.name = 'AppError';
  this.message = message;
  this.statusCode = statusCode || 400;
  this.errors = errors || [];
}
```

## 12. Request.gs

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

function getRequestAppToken_(e) {
  if (e && e.headers) {
    return e.headers['x-app-token'] || e.headers['X-App-Token'] || '';
  }

  const body = parseRequestBody_(e);
  return body.appToken || '';
}
```

Catatan: jika header `x-app-token` tidak terbaca di Apps Script, kirim token melalui body:

```json
{
  "appToken": "APP_API_TOKEN",
  "action": "login",
  "payload": {}
}
```

## 13. Router.gs

```javascript
function routeAction_(action, payload, token) {
  const publicRoutes = {
    login: login
  };

  const protectedRoutes = {
    getProfile: getProfile,
    logout: logout,

    getSiswaList: getSiswaList,
    createSiswa: createSiswa,
    updateSiswa: updateSiswa,
    deleteSiswa: deleteSiswa,

    getKelasList: getKelasList,
    createKelas: createKelas,
    updateKelas: updateKelas,
    deleteKelas: deleteKelas,

    getGuruList: getGuruList,
    createGuru: createGuru,
    updateGuru: updateGuru,
    deleteGuru: deleteGuru,

    getMapelList: getMapelList,
    createMapel: createMapel,
    updateMapel: updateMapel,
    deleteMapel: deleteMapel,

    getNilaiList: getNilaiList,
    bulkSaveNilai: bulkSaveNilai,
    getRekapNilai: getRekapNilai,

    getHafalanList: getHafalanList,
    createHafalan: createHafalan,
    updateHafalan: updateHafalan,
    deleteHafalan: deleteHafalan,
    getRiwayatHafalanSiswa: getRiwayatHafalanSiswa,
    getRekapHafalan: getRekapHafalan,

    getDashboardSummary: getDashboardSummary
  };

  if (publicRoutes[action]) {
    return publicRoutes[action](payload);
  }

  if (!protectedRoutes[action]) {
    throw new AppError_('Action tidak dikenal: ' + action, 404);
  }

  const user = requireSession_(token);
  return protectedRoutes[action](payload, user);
}
```

## 14. Auth.gs

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

function login(payload) {
  validateRequired_(payload, ['email', 'password']);

  const users = getRows_(SHEETS_.USERS);
  const user = users.find(function (item) {
    return String(item.email).toLowerCase() === String(payload.email).toLowerCase();
  });

  if (!user) {
    throw new AppError_('Email atau password salah', 401);
  }

  if (user.status !== STATUS_.AKTIF) {
    throw new AppError_('Akun tidak aktif', 403);
  }

  if (!verifyPassword_(payload.password, user.passwordHash)) {
    throw new AppError_('Email atau password salah', 401);
  }

  const sessionToken = createSession_(user.userId);

  appendLog_({
    userId: user.userId,
    action: 'login',
    entity: 'Users',
    entityId: user.userId,
    detail: 'Login berhasil'
  });

  return {
    message: 'Login berhasil',
    data: {
      token: sessionToken,
      user: {
        userId: user.userId,
        nama: user.nama,
        email: user.email,
        role: user.role,
        guruId: user.guruId || '',
        siswaId: user.siswaId || ''
      }
    }
  };
}

function verifyPassword_(password, passwordHash) {
  // MVP: sementara bisa plain text.
  // Production: ganti dengan hash.
  return String(password) === String(passwordHash);
}

function createSession_(userId) {
  const token = Utilities.getUuid();
  const now = new Date();
  const expiredAt = new Date(now.getTime() + 12 * 60 * 60 * 1000);

  appendRow_(SHEETS_.SESSIONS, {
    sessionId: Utilities.getUuid(),
    userId: userId,
    token: token,
    expiredAt: expiredAt.toISOString(),
    status: 'aktif',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  });

  return token;
}

function requireSession_(token) {
  if (!token) {
    throw new AppError_('Session token wajib diisi', 401);
  }

  const sessions = getRows_(SHEETS_.SESSIONS);
  const session = sessions.find(function (item) {
    return item.token === token && item.status === 'aktif';
  });

  if (!session) {
    throw new AppError_('Session tidak valid', 401);
  }

  if (new Date(session.expiredAt).getTime() < new Date().getTime()) {
    throw new AppError_('Session sudah expired', 401);
  }

  const users = getRows_(SHEETS_.USERS);
  const user = users.find(function (item) {
    return item.userId === session.userId;
  });

  if (!user || user.status !== STATUS_.AKTIF) {
    throw new AppError_('User tidak aktif atau tidak ditemukan', 401);
  }

  return user;
}

function requireRole_(user, allowedRoles) {
  if (!allowedRoles.includes(user.role)) {
    throw new AppError_('Anda tidak memiliki akses', 403);
  }
}

function getProfile(payload, user) {
  return {
    message: 'Profil berhasil diambil',
    data: {
      userId: user.userId,
      nama: user.nama,
      email: user.email,
      role: user.role,
      guruId: user.guruId || '',
      siswaId: user.siswaId || ''
    }
  };
}

function logout(payload, user) {
  appendLog_({
    userId: user.userId,
    action: 'logout',
    entity: 'Users',
    entityId: user.userId,
    detail: 'Logout'
  });

  return {
    message: 'Logout berhasil',
    data: {}
  };
}
```

## 15. Sheets.gs

```javascript
function getSpreadsheet_() {
  const spreadsheetId = PropertiesService
    .getScriptProperties()
    .getProperty('SPREADSHEET_ID');

  if (!spreadsheetId) {
    throw new AppError_('SPREADSHEET_ID belum dikonfigurasi', 500);
  }

  return SpreadsheetApp.getActiveSpreadsheet();
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

## 16. Validators.gs

```javascript
function validateRequired_(payload, fields) {
  const errors = [];

  fields.forEach(function (field) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      errors.push({
        field: field,
        message: field + ' wajib diisi'
      });
    }
  });

  if (errors.length > 0) {
    throw new AppError_('Validasi gagal', 400, errors);
  }
}

function validateNumberRange_(value, min, max, field) {
  const num = Number(value);

  if (isNaN(num) || num < min || num > max) {
    throw new AppError_(field + ' harus antara ' + min + ' sampai ' + max, 400, [
      {
        field: field,
        message: field + ' tidak valid'
      }
    ]);
  }
}
```

## 17. Logs.gs

```javascript
function appendLog_(log) {
  try {
    appendRow_(SHEETS_.LOGS, {
      logId: generateId_('LOG'),
      userId: log.userId || '',
      action: log.action || '',
      entity: log.entity || '',
      entityId: log.entityId || '',
      detail: log.detail || '',
      ipAddress: '',
      userAgent: '',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gagal menulis log:', error.message);
  }
}
```

## 18. Siswa.gs

```javascript
function getSiswaList(payload, user) {
  let items = getRows_(SHEETS_.SISWA);

  if (payload.kelasId) {
    items = items.filter(item => item.kelasId === payload.kelasId);
  }

  if (payload.status) {
    items = items.filter(item => item.status === payload.status);
  }

  if (payload.keyword) {
    const keyword = String(payload.keyword).toLowerCase();
    items = items.filter(item =>
      String(item.namaLengkap).toLowerCase().includes(keyword) ||
      String(item.nis).toLowerCase().includes(keyword)
    );
  }

  return {
    message: 'Data siswa berhasil diambil',
    data: {
      items,
      total: items.length
    }
  };
}

function createSiswa(payload, user) {
  requireRole_(user, [ROLES_.ADMIN, ROLES_.SUPER_ADMIN]);
  validateRequired_(payload, ['nis', 'namaLengkap', 'jenisKelamin', 'kelasId']);

  const rows = getRows_(SHEETS_.SISWA);
  const duplicate = rows.find(item => String(item.nis) === String(payload.nis));

  if (duplicate) {
    throw new AppError_('NIS sudah digunakan', 400);
  }

  const now = new Date().toISOString();
  const siswaId = generateId_('SIS');

  appendRow_(SHEETS_.SISWA, {
    siswaId,
    nis: payload.nis,
    nisn: payload.nisn || '',
    namaLengkap: payload.namaLengkap,
    jenisKelamin: payload.jenisKelamin,
    tempatLahir: payload.tempatLahir || '',
    tanggalLahir: payload.tanggalLahir || '',
    kelasId: payload.kelasId,
    namaOrangTua: payload.namaOrangTua || '',
    noHpOrangTua: payload.noHpOrangTua || '',
    alamat: payload.alamat || '',
    status: payload.status || STATUS_.AKTIF,
    createdAt: now,
    updatedAt: now
  });

  appendLog_({
    userId: user.userId,
    action: 'createSiswa',
    entity: 'Siswa',
    entityId: siswaId,
    detail: JSON.stringify(payload)
  });

  return {
    message: 'Siswa berhasil ditambahkan',
    data: { siswaId }
  };
}

function updateSiswa(payload, user) {
  requireRole_(user, [ROLES_.ADMIN, ROLES_.SUPER_ADMIN]);
  validateRequired_(payload, ['siswaId']);

  updateRowById_(SHEETS_.SISWA, 'siswaId', payload.siswaId, {
    ...payload,
    updatedAt: new Date().toISOString()
  });

  return {
    message: 'Siswa berhasil diperbarui',
    data: {}
  };
}

function deleteSiswa(payload, user) {
  requireRole_(user, [ROLES_.ADMIN, ROLES_.SUPER_ADMIN]);
  validateRequired_(payload, ['siswaId']);

  updateRowById_(SHEETS_.SISWA, 'siswaId', payload.siswaId, {
    status: STATUS_.NONAKTIF,
    updatedAt: new Date().toISOString()
  });

  return {
    message: 'Siswa berhasil dinonaktifkan',
    data: {}
  };
}
```

## 19. Nilai.gs

```javascript
function bulkSaveNilai(payload, user) {
  requireRole_(user, [ROLES_.ADMIN, ROLES_.SUPER_ADMIN, ROLES_.GURU_MAPEL]);

  validateRequired_(payload, [
    'kelasId',
    'mapelId',
    'semester',
    'tahunAjaran',
    'jenisNilai',
    'items'
  ]);

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new AppError_('Items nilai wajib diisi', 400);
  }

  payload.items.forEach(function (item) {
    validateRequired_(item, ['siswaId', 'nilai']);
    validateNumberRange_(item.nilai, 0, 100, 'nilai');
  });

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const now = new Date().toISOString();

    payload.items.forEach(function (item) {
      appendRow_(SHEETS_.NILAI, {
        nilaiId: generateId_('NIL'),
        siswaId: item.siswaId,
        kelasId: payload.kelasId,
        mapelId: payload.mapelId,
        guruId: payload.guruId || user.guruId || '',
        semester: payload.semester,
        tahunAjaran: payload.tahunAjaran,
        jenisNilai: payload.jenisNilai,
        nilai: Number(item.nilai),
        predikat: getPredikatNilai_(Number(item.nilai)),
        catatan: item.catatan || '',
        tanggalInput: payload.tanggalInput || new Date().toISOString().slice(0, 10),
        createdAt: now,
        updatedAt: now
      });
    });

    appendLog_({
      userId: user.userId,
      action: 'bulkSaveNilai',
      entity: 'Nilai',
      entityId: '',
      detail: 'Jumlah nilai: ' + payload.items.length
    });

    return {
      message: 'Nilai berhasil disimpan',
      data: {
        totalSaved: payload.items.length
      }
    };
  } finally {
    lock.releaseLock();
  }
}

function getPredikatNilai_(nilai) {
  if (nilai >= 90) return 'A';
  if (nilai >= 80) return 'B';
  if (nilai >= 70) return 'C';
  return 'D';
}

function getRekapNilai(payload, user) {
  let items = getRows_(SHEETS_.NILAI);

  if (payload.kelasId) items = items.filter(item => item.kelasId === payload.kelasId);
  if (payload.siswaId) items = items.filter(item => item.siswaId === payload.siswaId);
  if (payload.mapelId) items = items.filter(item => item.mapelId === payload.mapelId);
  if (payload.semester) items = items.filter(item => item.semester === payload.semester);
  if (payload.tahunAjaran) items = items.filter(item => item.tahunAjaran === payload.tahunAjaran);

  const totalNilai = items.reduce((sum, item) => sum + Number(item.nilai || 0), 0);
  const rataRata = items.length ? totalNilai / items.length : 0;

  return {
    message: 'Rekap nilai berhasil diambil',
    data: {
      items,
      total: items.length,
      rataRata
    }
  };
}
```

## 20. Hafalan.gs

```javascript
function createHafalan(payload, user) {
  requireRole_(user, [ROLES_.ADMIN, ROLES_.SUPER_ADMIN, ROLES_.GURU_TAHFIDZ]);

  validateRequired_(payload, [
    'siswaId',
    'kelasId',
    'juz',
    'surah',
    'nomorSurah',
    'ayatAwal',
    'ayatAkhir',
    'tanggalSetor',
    'statusHafalan',
    'nilaiKelancaran',
    'nilaiTajwid',
    'nilaiMakhraj',
    'nilaiAdab'
  ]);

  validateNumberRange_(payload.juz, 1, 30, 'juz');
  validateNumberRange_(payload.nomorSurah, 1, 114, 'nomorSurah');
  validateNumberRange_(payload.nilaiKelancaran, 1, 100, 'nilaiKelancaran');
  validateNumberRange_(payload.nilaiTajwid, 1, 100, 'nilaiTajwid');
  validateNumberRange_(payload.nilaiMakhraj, 1, 100, 'nilaiMakhraj');
  validateNumberRange_(payload.nilaiAdab, 1, 100, 'nilaiAdab');

  if (Number(payload.ayatAwal) > Number(payload.ayatAkhir)) {
    throw new AppError_('Ayat awal tidak boleh lebih besar dari ayat akhir', 400);
  }

  const rataRata = (
    Number(payload.nilaiKelancaran) +
    Number(payload.nilaiTajwid) +
    Number(payload.nilaiMakhraj) +
    Number(payload.nilaiAdab)
  ) / 4;

  const now = new Date().toISOString();
  const hafalanId = generateId_('HAF');

  appendRow_(SHEETS_.HAFALAN, {
    hafalanId,
    siswaId: payload.siswaId,
    kelasId: payload.kelasId,
    guruTahfidzId: payload.guruTahfidzId || user.guruId || '',
    juz: Number(payload.juz),
    surah: payload.surah,
    nomorSurah: Number(payload.nomorSurah),
    ayatAwal: Number(payload.ayatAwal),
    ayatAkhir: Number(payload.ayatAkhir),
    tanggalSetor: payload.tanggalSetor,
    statusHafalan: payload.statusHafalan,
    nilaiKelancaran: Number(payload.nilaiKelancaran),
    nilaiTajwid: Number(payload.nilaiTajwid),
    nilaiMakhraj: Number(payload.nilaiMakhraj),
    nilaiAdab: Number(payload.nilaiAdab),
    rataRata,
    catatan: payload.catatan || '',
    createdAt: now,
    updatedAt: now
  });

  appendLog_({
    userId: user.userId,
    action: 'createHafalan',
    entity: 'Hafalan',
    entityId: hafalanId,
    detail: JSON.stringify(payload)
  });

  return {
    message: 'Hafalan berhasil disimpan',
    data: {
      hafalanId,
      rataRata
    }
  };
}

function getRiwayatHafalanSiswa(payload, user) {
  validateRequired_(payload, ['siswaId']);

  const items = getRows_(SHEETS_.HAFALAN)
    .filter(item => item.siswaId === payload.siswaId)
    .sort((a, b) => new Date(b.tanggalSetor) - new Date(a.tanggalSetor));

  return {
    message: 'Riwayat hafalan berhasil diambil',
    data: {
      items,
      total: items.length
    }
  };
}

function getRekapHafalan(payload, user) {
  let items = getRows_(SHEETS_.HAFALAN);

  if (payload.kelasId) items = items.filter(item => item.kelasId === payload.kelasId);
  if (payload.siswaId) items = items.filter(item => item.siswaId === payload.siswaId);
  if (payload.juz) items = items.filter(item => Number(item.juz) === Number(payload.juz));
  if (payload.statusHafalan) items = items.filter(item => item.statusHafalan === payload.statusHafalan);

  const totalRata = items.reduce((sum, item) => sum + Number(item.rataRata || 0), 0);
  const rataRata = items.length ? totalRata / items.length : 0;

  return {
    message: 'Rekap hafalan berhasil diambil',
    data: {
      items,
      total: items.length,
      rataRata
    }
  };
}
```

## 21. Dashboard.gs

```javascript
function getDashboardSummary(payload, user) {
  const siswa = getRows_(SHEETS_.SISWA).filter(item => item.status === STATUS_.AKTIF);
  const kelas = getRows_(SHEETS_.KELAS).filter(item => item.status === STATUS_.AKTIF);
  const nilai = getRows_(SHEETS_.NILAI);
  const hafalan = getRows_(SHEETS_.HAFALAN);

  const totalNilai = nilai.reduce((sum, item) => sum + Number(item.nilai || 0), 0);
  const rataRataNilai = nilai.length ? totalNilai / nilai.length : 0;

  const hafalanLancar = hafalan.filter(item =>
    item.statusHafalan === 'lancar' || item.statusHafalan === 'selesai'
  ).length;

  const hafalanPerluPerbaikan = hafalan.filter(item =>
    item.statusHafalan === 'perlu_perbaikan'
  ).length;

  return {
    message: 'Dashboard berhasil diambil',
    data: {
      totalSiswaAktif: siswa.length,
      totalKelasAktif: kelas.length,
      rataRataNilai,
      totalHafalan: hafalan.length,
      hafalanLancar,
      hafalanPerluPerbaikan
    }
  };
}
```

## 22. Alur Input Nilai

```txt
React kirim action bulkSaveNilai
  -> Code.gs validasi APP_API_TOKEN
  -> Router validasi session
  -> Nilai.gs validasi role admin/guru_mapel
  -> Validasi payload
  -> Validasi nilai 0-100
  -> LockService aktif
  -> Append data ke sheet Nilai
  -> Tulis Logs
  -> Response totalSaved
```

## 23. Alur Input Hafalan

```txt
React kirim action createHafalan
  -> Code.gs validasi APP_API_TOKEN
  -> Router validasi session
  -> Hafalan.gs validasi role admin/guru_tahfidz
  -> Validasi juz 1-30
  -> Validasi surah 1-114
  -> Validasi ayatAwal <= ayatAkhir
  -> Validasi nilai aspek 1-100
  -> Hitung rata-rata
  -> Append data ke sheet Hafalan
  -> Tulis Logs
  -> Response hafalanId dan rataRata
```

## 24. Frontend gasClient.js

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

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Request gagal');
  }

  return result.data;
}
```

## 25. Checklist Backend

- [ ] `Code.gs` punya `doPost(e)`.
- [ ] `doGet(e)` mengembalikan status API aktif.
- [ ] `APP_API_TOKEN` dicek.
- [ ] `SPREADSHEET_ID` dibaca dari Script Properties.
- [ ] Login berjalan.
- [ ] Session token dibuat.
- [ ] Role dicek di backend.
- [ ] CRUD siswa berjalan.
- [ ] CRUD kelas berjalan.
- [ ] CRUD guru berjalan.
- [ ] CRUD mapel berjalan.
- [ ] Input nilai massal berjalan.
- [ ] Input hafalan berjalan.
- [ ] Rekap nilai berjalan.
- [ ] Rekap hafalan berjalan.
- [ ] Dashboard summary berjalan.
- [ ] Audit log tercatat.
- [ ] Apps Script dideploy sebagai Web App.
- [ ] URL Apps Script dimasukkan ke Vercel env.
- [ ] Token Vercel sama dengan Script Properties.

## 26. Catatan Keamanan

Untuk MVP, koneksi langsung React ke Apps Script boleh digunakan:

```txt
React -> Apps Script
```

Namun untuk production lebih aman, gunakan:

```txt
React -> Vercel Serverless Proxy -> Apps Script
```

Dengan proxy, token Apps Script tidak masuk ke bundle browser.
