# Backend Google Apps Script Lengkap

Kode ini mengikuti arsitektur final:

- Tidak memakai `SPREADSHEET_ID`.
- Spreadsheet diakses dengan `SpreadsheetApp.getActiveSpreadsheet()`.
- `APP_API_TOKEN` dibaca dari Script Properties.
- `appToken` dikirim dari frontend melalui body request.
- File `.gs` dibuat langsung di editor Google Apps Script, bukan di repository GitHub.

## Code.gs

```javascript
function doPost(e) {
  try {
    validateRequestEvent_(e);

    const body = parseRequestBody_(e);
    validateAppToken_(getRequestAppToken_(body));

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

function doGet() {
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

## Config.gs

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
  NONAKTIF: 'nonaktif',
  LULUS: 'lulus',
  PINDAH: 'pindah'
};

const HAFALAN_STATUS_ = ['baru', 'lancar', 'perlu_perbaikan', 'murajaah', 'selesai'];
const NILAI_JENIS_ = ['harian', 'tugas', 'praktik', 'PTS', 'PAS'];

const DEFAULT_SESSION_EXPIRED_HOURS_ = 12;
```

## Response.gs

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

## Request.gs

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
  return body && body.appToken ? body.appToken : '';
}

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
  const number = Number(value);

  if (isNaN(number) || number < min || number > max) {
    throw new AppError_(field + ' harus antara ' + min + ' sampai ' + max, 400, [
      {
        field: field,
        message: field + ' tidak valid'
      }
    ]);
  }
}

function validateInList_(value, allowedValues, field) {
  if (allowedValues.indexOf(value) === -1) {
    throw new AppError_(field + ' tidak valid', 400, [
      {
        field: field,
        message: field + ' harus salah satu dari: ' + allowedValues.join(', ')
      }
    ]);
  }
}
```

## Router.gs

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

    bulkSaveNilai: bulkSaveNilai,
    getNilaiList: getNilaiList,
    getRekapNilai: getRekapNilai,

    createHafalan: createHafalan,
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

## Auth.gs

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
    return normalizeText_(item.email).toLowerCase() === normalizeText_(payload.email).toLowerCase();
  });

  if (!user) {
    throw new AppError_('Email atau password salah', 401);
  }

  if (user.status !== STATUS_.AKTIF) {
    throw new AppError_('Akun tidak aktif', 403);
  }

  if (!verifyPassword_(payload.password, user.passwordHash)) {
    appendLog_({
      userId: user.userId,
      action: 'login_failed',
      entity: 'Users',
      entityId: user.userId,
      detail: 'Password salah'
    });
    throw new AppError_('Email atau password salah', 401);
  }

  const sessionToken = createSession_(user.userId);
  updateRowById_(SHEETS_.USERS, 'userId', user.userId, {
    lastLoginAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

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
      user: toPublicUser_(user)
    }
  };
}

function verifyPassword_(password, passwordHash) {
  // MVP: bisa memakai plain text di sheet.
  // Production: simpan hash dan ubah fungsi ini.
  return String(password) === String(passwordHash);
}

function createSession_(userId) {
  const token = Utilities.getUuid();
  const now = new Date();
  const hours = Number(PropertiesService.getScriptProperties().getProperty('SESSION_EXPIRED_HOURS')) || DEFAULT_SESSION_EXPIRED_HOURS_;
  const expiredAt = new Date(now.getTime() + hours * 60 * 60 * 1000);

  appendRow_(SHEETS_.SESSIONS, {
    sessionId: generateId_('SES'),
    userId: userId,
    token: token,
    expiredAt: expiredAt.toISOString(),
    status: STATUS_.AKTIF,
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
    return item.token === token && item.status === STATUS_.AKTIF;
  });

  if (!session) {
    throw new AppError_('Session tidak valid', 401);
  }

  if (new Date(session.expiredAt).getTime() < new Date().getTime()) {
    updateRowById_(SHEETS_.SESSIONS, 'sessionId', session.sessionId, {
      status: 'expired',
      updatedAt: new Date().toISOString()
    });
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
  if (allowedRoles.indexOf(user.role) === -1) {
    throw new AppError_('Anda tidak memiliki akses', 403);
  }
}

function getProfile(payload, user) {
  return {
    message: 'Profil berhasil diambil',
    data: toPublicUser_(user)
  };
}

function logout(payload, user) {
  const token = payload && payload.token ? payload.token : '';

  if (token) {
    const sessions = getRows_(SHEETS_.SESSIONS);
    const session = sessions.find(function (item) {
      return item.token === token;
    });

    if (session) {
      updateRowById_(SHEETS_.SESSIONS, 'sessionId', session.sessionId, {
        status: STATUS_.NONAKTIF,
        updatedAt: new Date().toISOString()
      });
    }
  }

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

function toPublicUser_(user) {
  return {
    userId: user.userId,
    nama: user.nama,
    email: user.email,
    role: user.role,
    guruId: user.guruId || '',
    siswaId: user.siswaId || ''
  };
}
```

## Sheets.gs

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

  for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
    if (String(values[rowIndex][idIndex]) === String(idValue)) {
      headers.forEach(function (header, colIndex) {
        if (patch[header] !== undefined) {
          sheet.getRange(rowIndex + 1, colIndex + 1).setValue(patch[header]);
        }
      });
      return true;
    }
  }

  throw new AppError_('Data tidak ditemukan: ' + idValue, 404);
}

function findRowIndexById_(sheetName, idField, idValue) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    return -1;
  }

  const headers = values[0];
  const idIndex = headers.indexOf(idField);

  if (idIndex === -1) {
    throw new AppError_('Kolom ID tidak ditemukan: ' + idField, 500);
  }

  for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
    if (String(values[rowIndex][idIndex]) === String(idValue)) {
      return rowIndex + 1;
    }
  }

  return -1;
}

function setRowByHeaders_(sheetName, rowIndex, object) {
  const sheet = getSheet_(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(function (header) {
    return object[header] !== undefined ? object[header] : '';
  });

  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
}

function generateId_(prefix) {
  return prefix + '-' + Utilities.getUuid();
}

function normalizeText_(value) {
  return String(value === undefined || value === null ? '' : value).trim();
}

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
    console.error('Gagal menulis log: ' + error.message);
  }
}
```

## Siswa.gs

```javascript
function getSiswaList(payload, user) {
  requireRole_(user, [
    ROLES_.SUPER_ADMIN,
    ROLES_.ADMIN,
    ROLES_.GURU_MAPEL,
    ROLES_.GURU_TAHFIDZ,
    ROLES_.WALI_KELAS,
    ROLES_.KEPALA_SEKOLAH,
    ROLES_.ORANG_TUA
  ]);

  let items = getRows_(SHEETS_.SISWA);

  if (payload.kelasId) {
    items = items.filter(function (item) {
      return String(item.kelasId) === String(payload.kelasId);
    });
  }

  if (payload.status) {
    items = items.filter(function (item) {
      return String(item.status) === String(payload.status);
    });
  }

  if (payload.keyword) {
    const keyword = normalizeText_(payload.keyword).toLowerCase();
    items = items.filter(function (item) {
      return normalizeText_(item.namaLengkap).toLowerCase().indexOf(keyword) !== -1 ||
        normalizeText_(item.nis).toLowerCase().indexOf(keyword) !== -1;
    });
  }

  const page = Math.max(Number(payload.page) || 1, 1);
  const limit = Math.max(Number(payload.limit) || 50, 1);
  const total = items.length;
  const start = (page - 1) * limit;

  return {
    message: 'Data siswa berhasil diambil',
    data: {
      items: items.slice(start, start + limit),
      page: page,
      limit: limit,
      total: total
    }
  };
}

function createSiswa(payload, user) {
  requireRole_(user, [ROLES_.SUPER_ADMIN, ROLES_.ADMIN]);
  validateRequired_(payload, ['nis', 'namaLengkap', 'jenisKelamin', 'kelasId']);
  validateInList_(payload.jenisKelamin, ['L', 'P'], 'jenisKelamin');
  validateInList_(payload.status || STATUS_.AKTIF, [STATUS_.AKTIF, STATUS_.LULUS, STATUS_.PINDAH, STATUS_.NONAKTIF], 'status');

  const rows = getRows_(SHEETS_.SISWA);
  const duplicate = rows.find(function (item) {
    return String(item.nis) === String(payload.nis);
  });

  if (duplicate) {
    throw new AppError_('NIS sudah digunakan', 400);
  }

  const now = new Date().toISOString();
  const siswaId = generateId_('SIS');

  appendRow_(SHEETS_.SISWA, {
    siswaId: siswaId,
    nis: normalizeText_(payload.nis),
    nisn: normalizeText_(payload.nisn),
    namaLengkap: normalizeText_(payload.namaLengkap),
    jenisKelamin: payload.jenisKelamin,
    tempatLahir: normalizeText_(payload.tempatLahir),
    tanggalLahir: normalizeText_(payload.tanggalLahir),
    kelasId: normalizeText_(payload.kelasId),
    namaOrangTua: normalizeText_(payload.namaOrangTua),
    noHpOrangTua: normalizeText_(payload.noHpOrangTua),
    alamat: normalizeText_(payload.alamat),
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
    data: { siswaId: siswaId }
  };
}

function updateSiswa(payload, user) {
  requireRole_(user, [ROLES_.SUPER_ADMIN, ROLES_.ADMIN]);
  validateRequired_(payload, ['siswaId']);

  if (payload.jenisKelamin) {
    validateInList_(payload.jenisKelamin, ['L', 'P'], 'jenisKelamin');
  }

  if (payload.status) {
    validateInList_(payload.status, [STATUS_.AKTIF, STATUS_.LULUS, STATUS_.PINDAH, STATUS_.NONAKTIF], 'status');
  }

  const patch = Object.assign({}, payload, {
    updatedAt: new Date().toISOString()
  });

  updateRowById_(SHEETS_.SISWA, 'siswaId', payload.siswaId, patch);

  appendLog_({
    userId: user.userId,
    action: 'updateSiswa',
    entity: 'Siswa',
    entityId: payload.siswaId,
    detail: JSON.stringify(payload)
  });

  return {
    message: 'Siswa berhasil diperbarui',
    data: {}
  };
}

function deleteSiswa(payload, user) {
  requireRole_(user, [ROLES_.SUPER_ADMIN, ROLES_.ADMIN]);
  validateRequired_(payload, ['siswaId']);

  updateRowById_(SHEETS_.SISWA, 'siswaId', payload.siswaId, {
    status: STATUS_.NONAKTIF,
    updatedAt: new Date().toISOString()
  });

  appendLog_({
    userId: user.userId,
    action: 'deleteSiswa',
    entity: 'Siswa',
    entityId: payload.siswaId,
    detail: 'Soft delete siswa'
  });

  return {
    message: 'Siswa berhasil dinonaktifkan',
    data: {}
  };
}
```

## Nilai.gs

```javascript
function getNilaiList(payload, user) {
  requireRole_(user, [
    ROLES_.SUPER_ADMIN,
    ROLES_.ADMIN,
    ROLES_.GURU_MAPEL,
    ROLES_.WALI_KELAS,
    ROLES_.KEPALA_SEKOLAH
  ]);

  let items = filterNilai_(payload || {});

  return {
    message: 'Data nilai berhasil diambil',
    data: {
      items: items,
      total: items.length
    }
  };
}

function bulkSaveNilai(payload, user) {
  requireRole_(user, [ROLES_.SUPER_ADMIN, ROLES_.ADMIN, ROLES_.GURU_MAPEL]);
  validateRequired_(payload, ['kelasId', 'mapelId', 'semester', 'tahunAjaran', 'jenisNilai', 'items']);
  validateInList_(payload.jenisNilai, NILAI_JENIS_, 'jenisNilai');

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
    const nilaiSheet = getSheet_(SHEETS_.NILAI);
    const values = nilaiSheet.getDataRange().getValues();
    const headers = values.length ? values[0] : [];
    const existingMap = buildNilaiIndex_(values, headers);
    let totalSaved = 0;

    payload.items.forEach(function (item) {
      const uniqueKey = [
        item.siswaId,
        payload.mapelId,
        payload.semester,
        payload.tahunAjaran,
        payload.jenisNilai
      ].join('|');

      const existing = existingMap[uniqueKey];
      const rowObject = {
        nilaiId: existing ? existing.nilaiId : generateId_('NIL'),
        siswaId: item.siswaId,
        kelasId: payload.kelasId,
        mapelId: payload.mapelId,
        guruId: payload.guruId || user.guruId || '',
        semester: payload.semester,
        tahunAjaran: payload.tahunAjaran,
        jenisNilai: payload.jenisNilai,
        nilai: Number(item.nilai),
        predikat: getPredikatNilai_(Number(item.nilai)),
        catatan: normalizeText_(item.catatan),
        tanggalInput: payload.tanggalInput || new Date().toISOString().slice(0, 10),
        createdAt: existing ? existing.createdAt : now,
        updatedAt: now
      };

      if (existing) {
        setRowByHeaders_(SHEETS_.NILAI, existing.rowIndex, rowObject);
      } else {
        appendRow_(SHEETS_.NILAI, rowObject);
      }

      totalSaved++;
    });

    appendLog_({
      userId: user.userId,
      action: 'bulkSaveNilai',
      entity: 'Nilai',
      entityId: '',
      detail: 'Jumlah nilai: ' + totalSaved
    });

    return {
      message: 'Nilai berhasil disimpan',
      data: { totalSaved: totalSaved }
    };
  } finally {
    lock.releaseLock();
  }
}

function getRekapNilai(payload, user) {
  requireRole_(user, [
    ROLES_.SUPER_ADMIN,
    ROLES_.ADMIN,
    ROLES_.GURU_MAPEL,
    ROLES_.WALI_KELAS,
    ROLES_.KEPALA_SEKOLAH
  ]);

  const items = filterNilai_(payload || {});
  const totalNilai = items.reduce(function (sum, item) {
    return sum + Number(item.nilai || 0);
  }, 0);
  const nilaiNumbers = items.map(function (item) {
    return Number(item.nilai || 0);
  });

  return {
    message: 'Rekap nilai berhasil diambil',
    data: {
      items: items,
      total: items.length,
      rataRata: items.length ? totalNilai / items.length : 0,
      nilaiTertinggi: nilaiNumbers.length ? Math.max.apply(null, nilaiNumbers) : 0,
      nilaiTerendah: nilaiNumbers.length ? Math.min.apply(null, nilaiNumbers) : 0
    }
  };
}

function filterNilai_(payload) {
  let items = getRows_(SHEETS_.NILAI);

  ['kelasId', 'siswaId', 'mapelId', 'semester', 'tahunAjaran', 'jenisNilai'].forEach(function (field) {
    if (payload[field]) {
      items = items.filter(function (item) {
        return String(item[field]) === String(payload[field]);
      });
    }
  });

  return items;
}

function buildNilaiIndex_(values, headers) {
  const map = {};

  for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
    const row = values[rowIndex];
    const item = {};
    headers.forEach(function (header, colIndex) {
      item[header] = row[colIndex];
    });

    const uniqueKey = [
      item.siswaId,
      item.mapelId,
      item.semester,
      item.tahunAjaran,
      item.jenisNilai
    ].join('|');

    map[uniqueKey] = {
      rowIndex: rowIndex + 1,
      nilaiId: item.nilaiId,
      createdAt: item.createdAt
    };
  }

  return map;
}

function getPredikatNilai_(nilai) {
  if (nilai >= 90) return 'A';
  if (nilai >= 80) return 'B';
  if (nilai >= 70) return 'C';
  return 'D';
}
```

## Hafalan.gs

```javascript
function createHafalan(payload, user) {
  requireRole_(user, [ROLES_.SUPER_ADMIN, ROLES_.ADMIN, ROLES_.GURU_TAHFIDZ]);
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
  validateInList_(payload.statusHafalan, HAFALAN_STATUS_, 'statusHafalan');

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
    hafalanId: hafalanId,
    siswaId: payload.siswaId,
    kelasId: payload.kelasId,
    guruTahfidzId: payload.guruTahfidzId || user.guruId || '',
    juz: Number(payload.juz),
    surah: normalizeText_(payload.surah),
    nomorSurah: Number(payload.nomorSurah),
    ayatAwal: Number(payload.ayatAwal),
    ayatAkhir: Number(payload.ayatAkhir),
    tanggalSetor: payload.tanggalSetor,
    statusHafalan: payload.statusHafalan,
    nilaiKelancaran: Number(payload.nilaiKelancaran),
    nilaiTajwid: Number(payload.nilaiTajwid),
    nilaiMakhraj: Number(payload.nilaiMakhraj),
    nilaiAdab: Number(payload.nilaiAdab),
    rataRata: rataRata,
    catatan: normalizeText_(payload.catatan),
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
      hafalanId: hafalanId,
      rataRata: rataRata
    }
  };
}

function getRiwayatHafalanSiswa(payload, user) {
  requireRole_(user, [
    ROLES_.SUPER_ADMIN,
    ROLES_.ADMIN,
    ROLES_.GURU_TAHFIDZ,
    ROLES_.WALI_KELAS,
    ROLES_.KEPALA_SEKOLAH,
    ROLES_.ORANG_TUA
  ]);
  validateRequired_(payload, ['siswaId']);

  const items = getRows_(SHEETS_.HAFALAN)
    .filter(function (item) {
      return String(item.siswaId) === String(payload.siswaId);
    })
    .sort(function (a, b) {
      return new Date(b.tanggalSetor).getTime() - new Date(a.tanggalSetor).getTime();
    });

  return {
    message: 'Riwayat hafalan berhasil diambil',
    data: {
      items: items,
      total: items.length
    }
  };
}

function getRekapHafalan(payload, user) {
  requireRole_(user, [
    ROLES_.SUPER_ADMIN,
    ROLES_.ADMIN,
    ROLES_.GURU_TAHFIDZ,
    ROLES_.WALI_KELAS,
    ROLES_.KEPALA_SEKOLAH
  ]);

  let items = getRows_(SHEETS_.HAFALAN);

  if (payload.kelasId) {
    items = items.filter(function (item) {
      return String(item.kelasId) === String(payload.kelasId);
    });
  }

  if (payload.siswaId) {
    items = items.filter(function (item) {
      return String(item.siswaId) === String(payload.siswaId);
    });
  }

  if (payload.juz) {
    items = items.filter(function (item) {
      return Number(item.juz) === Number(payload.juz);
    });
  }

  if (payload.statusHafalan) {
    items = items.filter(function (item) {
      return String(item.statusHafalan) === String(payload.statusHafalan);
    });
  }

  const totalRata = items.reduce(function (sum, item) {
    return sum + Number(item.rataRata || 0);
  }, 0);

  return {
    message: 'Rekap hafalan berhasil diambil',
    data: {
      items: items,
      total: items.length,
      rataRata: items.length ? totalRata / items.length : 0
    }
  };
}
```

## Dashboard.gs

```javascript
function getDashboardSummary(payload, user) {
  requireRole_(user, [
    ROLES_.SUPER_ADMIN,
    ROLES_.ADMIN,
    ROLES_.GURU_MAPEL,
    ROLES_.GURU_TAHFIDZ,
    ROLES_.WALI_KELAS,
    ROLES_.KEPALA_SEKOLAH
  ]);

  const siswa = getRows_(SHEETS_.SISWA).filter(function (item) {
    return item.status === STATUS_.AKTIF;
  });
  const kelas = getRows_(SHEETS_.KELAS).filter(function (item) {
    return item.status === STATUS_.AKTIF;
  });
  const nilai = getRows_(SHEETS_.NILAI);
  const hafalan = getRows_(SHEETS_.HAFALAN);

  const totalNilai = nilai.reduce(function (sum, item) {
    return sum + Number(item.nilai || 0);
  }, 0);

  const hafalanLancar = hafalan.filter(function (item) {
    return item.statusHafalan === 'lancar' || item.statusHafalan === 'selesai';
  }).length;

  const hafalanPerluPerbaikan = hafalan.filter(function (item) {
    return item.statusHafalan === 'perlu_perbaikan';
  }).length;

  const siswaPerluPerhatian = getSiswaPerluPerhatian_(nilai, hafalan);

  return {
    message: 'Dashboard berhasil diambil',
    data: {
      totalSiswaAktif: siswa.length,
      totalKelasAktif: kelas.length,
      rataRataNilai: nilai.length ? totalNilai / nilai.length : 0,
      totalHafalan: hafalan.length,
      hafalanLancar: hafalanLancar,
      hafalanPerluPerbaikan: hafalanPerluPerbaikan,
      siswaPerluPerhatian: siswaPerluPerhatian
    }
  };
}

function getSiswaPerluPerhatian_(nilai, hafalan) {
  const map = {};

  nilai.forEach(function (item) {
    if (Number(item.nilai || 0) < 70) {
      map[item.siswaId] = {
        siswaId: item.siswaId,
        masalah: 'Nilai di bawah 70'
      };
    }
  });

  hafalan.forEach(function (item) {
    if (item.statusHafalan === 'perlu_perbaikan') {
      map[item.siswaId] = {
        siswaId: item.siswaId,
        masalah: 'Hafalan perlu perbaikan'
      };
    }
  });

  return Object.keys(map).map(function (key) {
    return map[key];
  });
}
```

