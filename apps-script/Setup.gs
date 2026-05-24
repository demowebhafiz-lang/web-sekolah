const SHEET_HEADERS_ = {
  Users: ['userId', 'nama', 'email', 'passwordHash', 'role', 'guruId', 'siswaId', 'status', 'lastLoginAt', 'createdAt', 'updatedAt'],
  Siswa: ['siswaId', 'nis', 'nisn', 'namaLengkap', 'jenisKelamin', 'tempatLahir', 'tanggalLahir', 'kelasId', 'namaOrangTua', 'noHpOrangTua', 'alamat', 'fotoFileId', 'fotoUrl', 'status', 'createdAt', 'updatedAt'],
  Kelas: ['kelasId', 'namaKelas', 'tingkat', 'waliKelasId', 'tahunAjaran', 'status', 'createdAt', 'updatedAt'],
  Guru: ['guruId', 'userId', 'namaGuru', 'email', 'noHp', 'roleGuru', 'status', 'createdAt', 'updatedAt'],
  Mapel: ['mapelId', 'namaMapel', 'kelompok', 'guruId', 'status', 'createdAt', 'updatedAt'],
  Nilai: ['nilaiId', 'siswaId', 'kelasId', 'mapelId', 'guruId', 'semester', 'tahunAjaran', 'jenisNilai', 'nilai', 'predikat', 'catatan', 'tanggalInput', 'createdAt', 'updatedAt'],
  Hafalan: ['hafalanId', 'siswaId', 'kelasId', 'guruTahfidzId', 'juz', 'surah', 'nomorSurah', 'ayatAwal', 'ayatAkhir', 'tanggalSetor', 'statusHafalan', 'nilaiKelancaran', 'nilaiTajwid', 'nilaiMakhraj', 'nilaiAdab', 'rataRata', 'catatan', 'createdAt', 'updatedAt'],
  TahunAjaran: ['tahunAjaranId', 'namaTahunAjaran', 'semesterAktif', 'status', 'createdAt', 'updatedAt'],
  Settings: ['settingKey', 'settingValue', 'updatedAt'],
  Sessions: ['sessionId', 'userId', 'token', 'expiredAt', 'status', 'createdAt', 'updatedAt'],
  Logs: ['logId', 'userId', 'action', 'entity', 'entityId', 'detail', 'ipAddress', 'userAgent', 'createdAt']
};

function setupSpreadsheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error('Spreadsheet aktif tidak ditemukan. Buka Apps Script dari Google Sheets: Extensions > Apps Script.');
  }

  Object.keys(SHEET_HEADERS_).forEach(function (sheetName) {
    setupSheet_(spreadsheet, sheetName, SHEET_HEADERS_[sheetName]);
  });

  seedInitialData_();

  return {
    success: true,
    message: 'Setup spreadsheet selesai',
    sheets: Object.keys(SHEET_HEADERS_)
  };
}

function setupSheet_(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeader = firstRow.some(function (value) {
    return String(value || '').trim() !== '';
  });

  if (!hasHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    ensureMissingHeaders_(sheet, headers);
  }

  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold');
  sheet.autoResizeColumns(1, headers.length);
}

function ensureMissingHeaders_(sheet, requiredHeaders) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function (value) {
    return String(value || '').trim();
  });

  const missingHeaders = requiredHeaders.filter(function (header) {
    return currentHeaders.indexOf(header) === -1;
  });

  if (!missingHeaders.length) {
    return;
  }

  const startColumn = currentHeaders.filter(String).length + 1;
  sheet.getRange(1, startColumn, 1, missingHeaders.length).setValues([missingHeaders]);
}

function seedInitialData_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const now = new Date().toISOString();
  const usersSheet = spreadsheet.getSheetByName('Users');
  const userRows = Math.max(usersSheet.getLastRow() - 1, 0);

  if (userRows === 0) {
    usersSheet.appendRow([
      'USR001',
      'Admin Sekolah',
      'admin@example.com',
      'admin123',
      'admin',
      '',
      '',
      'aktif',
      '',
      now,
      now
    ]);
  }

  const tahunAjaranSheet = spreadsheet.getSheetByName('TahunAjaran');
  const tahunAjaranRows = Math.max(tahunAjaranSheet.getLastRow() - 1, 0);

  if (tahunAjaranRows === 0) {
    tahunAjaranSheet.appendRow(['TA001', '2026/2027', 'Ganjil', 'aktif', now, now]);
  }

  const settingsSheet = spreadsheet.getSheetByName('Settings');
  const settingsRows = Math.max(settingsSheet.getLastRow() - 1, 0);

  if (settingsRows === 0) {
    settingsSheet.appendRow(['schoolName', 'Nama Sekolah', now]);
    settingsSheet.appendRow(['schoolAddress', '', now]);
    settingsSheet.appendRow(['schoolLogoFileId', '', now]);
    settingsSheet.appendRow(['schoolLogoUrl', '', now]);
  }
}
