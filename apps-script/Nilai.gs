function getNilaiList(payload, user) {
  requireRole_(user, [ROLES_.SUPER_ADMIN, ROLES_.ADMIN, ROLES_.GURU_MAPEL, ROLES_.WALI_KELAS, ROLES_.KEPALA_SEKOLAH]);
  const items = filterNilai_(payload || {});

  return {
    message: 'Data nilai berhasil diambil',
    data: { items: items, total: items.length }
  };
}

function bulkSaveNilai(payload, user) {
  requireRole_(user, [ROLES_.SUPER_ADMIN, ROLES_.ADMIN, ROLES_.GURU_MAPEL]);
  validateRequired_(payload, ['kelasId', 'mapelId', 'semester', 'tahunAjaran', 'jenisNilai', 'items']);
  const jenisNilai = normalizeJenisNilai_(payload.jenisNilai);
  validateInList_(jenisNilai, NILAI_JENIS_, 'jenisNilai');
  validateEntityExists_(SHEETS_.KELAS, 'kelasId', payload.kelasId, 'Kelas');
  validateEntityExists_(SHEETS_.MAPEL, 'mapelId', payload.mapelId, 'Mapel');

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new AppError_('Items nilai wajib diisi', 400);
  }

  const cachedSiswa = getRows_(SHEETS_.SISWA);
  payload.items.forEach(function (item) {
    validateRequired_(item, ['siswaId', 'nilai']);
    validateNumberRange_(item.nilai, 0, 100, 'nilai');
    validateEntityExistsFromCache_(cachedSiswa, 'siswaId', item.siswaId, 'Siswa');
  });

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const now = new Date().toISOString();
    const sheet = getSheet_(SHEETS_.NILAI);
    const values = sheet.getDataRange().getValues();
    const headers = values.length ? values[0] : [];
    const existingMap = buildNilaiIndex_(values, headers);
    let totalSaved = 0;

    payload.items.forEach(function (item) {
      const uniqueKey = [item.siswaId, payload.mapelId, payload.semester, payload.tahunAjaran, jenisNilai].join('|');
      const existing = existingMap[uniqueKey];
      const rowObject = {
        nilaiId: existing ? existing.nilaiId : generateId_('NIL'),
        siswaId: item.siswaId,
        kelasId: payload.kelasId,
        mapelId: payload.mapelId,
        guruId: payload.guruId || user.guruId || '',
        semester: payload.semester,
        tahunAjaran: payload.tahunAjaran,
        jenisNilai: jenisNilai,
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

    appendLog_({ userId: user.userId, action: 'bulkSaveNilai', entity: 'Nilai', entityId: '', detail: 'Jumlah nilai: ' + totalSaved });

    return {
      message: 'Nilai berhasil disimpan',
      data: { totalSaved: totalSaved }
    };
  } finally {
    lock.releaseLock();
  }
}

function getRekapNilai(payload, user) {
  requireRole_(user, [ROLES_.SUPER_ADMIN, ROLES_.ADMIN, ROLES_.GURU_MAPEL, ROLES_.WALI_KELAS, ROLES_.KEPALA_SEKOLAH, ROLES_.ORANG_TUA]);
  
  if (user.role === ROLES_.ORANG_TUA) {
    if (!user.siswaId) {
      throw new AppError_('Akun orang tua tidak terhubung dengan siswa', 403);
    }
    if (payload.siswaId && String(payload.siswaId) !== String(user.siswaId)) {
      throw new AppError_('Anda hanya dapat melihat data anak Anda sendiri', 403);
    }
    payload.siswaId = user.siswaId;
  }
  
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

function updateNilai(payload, user) {
  requireRole_(user, [ROLES_.SUPER_ADMIN, ROLES_.ADMIN, ROLES_.GURU_MAPEL]);
  validateRequired_(payload, ['nilaiId', 'nilai']);
  validateNumberRange_(payload.nilai, 0, 100, 'nilai');

  const rows = getRows_(SHEETS_.NILAI);
  const existing = findRowById_(rows, 'nilaiId', payload.nilaiId);

  if (!existing) {
    throw new AppError_('Nilai tidak ditemukan', 404);
  }

  const now = new Date().toISOString();
  const patch = {
    nilai: Number(payload.nilai),
    predikat: getPredikatNilai_(Number(payload.nilai)),
    catatan: normalizeText_(payload.catatan),
    guruId: payload.guruId || user.guruId || existing.guruId || '',
    updatedAt: now
  };

  updateRowById_(SHEETS_.NILAI, 'nilaiId', payload.nilaiId, patch);
  appendLog_({
    userId: user.userId,
    action: 'updateNilai',
    entity: 'Nilai',
    entityId: payload.nilaiId,
    detail: JSON.stringify({
      nilaiSebelum: existing.nilai,
      nilaiSesudah: patch.nilai,
      catatan: patch.catatan
    })
  });

  return {
    message: 'Nilai berhasil diperbarui',
    data: Object.assign({}, existing, patch, { nilaiId: payload.nilaiId })
  };
}

function filterNilai_(payload) {
  let items = getRows_(SHEETS_.NILAI);
  const filters = Object.assign({}, payload);

  if (filters.jenisNilai) {
    filters.jenisNilai = normalizeJenisNilai_(filters.jenisNilai);
  }

  ['kelasId', 'siswaId', 'mapelId', 'semester', 'tahunAjaran', 'jenisNilai'].forEach(function (field) {
    if (filters[field]) {
      items = items.filter(function (item) {
        if (field === 'jenisNilai') {
          return normalizeJenisNilai_(item[field]) === String(filters[field]);
        }
        return String(item[field]) === String(filters[field]);
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

    const uniqueKey = [item.siswaId, item.mapelId, item.semester, item.tahunAjaran, item.jenisNilai].join('|');
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

function normalizeJenisNilai_(value) {
  return normalizeText_(value).toLowerCase();
}
