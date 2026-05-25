function createHafalan(payload, user) {
  requireRole_(user, [ROLES_.SUPER_ADMIN, ROLES_.ADMIN, ROLES_.GURU_TAHFIDZ]);
  validateRequired_(payload, ['siswaId', 'kelasId', 'juz', 'surah', 'nomorSurah', 'ayatAwal', 'ayatAkhir', 'tanggalSetor', 'statusHafalan', 'nilaiKelancaran', 'nilaiTajwid', 'nilaiMakhraj', 'nilaiAdab']);
  validateEntityExists_(SHEETS_.SISWA, 'siswaId', payload.siswaId, 'Siswa');
  validateEntityExists_(SHEETS_.KELAS, 'kelasId', payload.kelasId, 'Kelas');

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

  const rataRata = (Number(payload.nilaiKelancaran) + Number(payload.nilaiTajwid) + Number(payload.nilaiMakhraj) + Number(payload.nilaiAdab)) / 4;
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

  appendLog_({ userId: user.userId, action: 'createHafalan', entity: 'Hafalan', entityId: hafalanId, detail: JSON.stringify(payload) });

  return {
    message: 'Hafalan berhasil disimpan',
    data: { hafalanId: hafalanId, rataRata: rataRata }
  };
}

function getRiwayatHafalanSiswa(payload, user) {
  requireRole_(user, [ROLES_.SUPER_ADMIN, ROLES_.ADMIN, ROLES_.GURU_TAHFIDZ, ROLES_.WALI_KELAS, ROLES_.KEPALA_SEKOLAH, ROLES_.ORANG_TUA]);
  validateRequired_(payload, ['siswaId']);

  if (user.role === ROLES_.ORANG_TUA) {
    if (!user.siswaId) {
      throw new AppError_('Akun orang tua tidak terhubung dengan siswa', 403);
    }
    if (String(payload.siswaId) !== String(user.siswaId)) {
      throw new AppError_('Anda hanya dapat melihat data anak Anda sendiri', 403);
    }
  }

  const items = getRows_(SHEETS_.HAFALAN)
    .filter(function (item) {
      return String(item.siswaId) === String(payload.siswaId);
    })
    .sort(function (a, b) {
      return new Date(b.tanggalSetor).getTime() - new Date(a.tanggalSetor).getTime();
    });

  return {
    message: 'Riwayat hafalan berhasil diambil',
    data: { items: items, total: items.length }
  };
}

function updateHafalan(payload, user) {
  requireRole_(user, [ROLES_.SUPER_ADMIN, ROLES_.ADMIN, ROLES_.GURU_TAHFIDZ]);
  validateRequired_(payload, ['hafalanId', 'siswaId', 'kelasId', 'juz', 'surah', 'nomorSurah', 'ayatAwal', 'ayatAkhir', 'tanggalSetor', 'statusHafalan', 'nilaiKelancaran', 'nilaiTajwid', 'nilaiMakhraj', 'nilaiAdab']);
  validateEntityExists_(SHEETS_.SISWA, 'siswaId', payload.siswaId, 'Siswa');
  validateEntityExists_(SHEETS_.KELAS, 'kelasId', payload.kelasId, 'Kelas');

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

  const rows = getRows_(SHEETS_.HAFALAN);
  const existing = findRowById_(rows, 'hafalanId', payload.hafalanId);

  if (!existing) {
    throw new AppError_('Hafalan tidak ditemukan', 404);
  }

  const rataRata = (Number(payload.nilaiKelancaran) + Number(payload.nilaiTajwid) + Number(payload.nilaiMakhraj) + Number(payload.nilaiAdab)) / 4;
  const patch = {
    siswaId: payload.siswaId,
    kelasId: payload.kelasId,
    guruTahfidzId: payload.guruTahfidzId || user.guruId || existing.guruTahfidzId || '',
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
    updatedAt: new Date().toISOString()
  };

  updateRowById_(SHEETS_.HAFALAN, 'hafalanId', payload.hafalanId, patch);
  appendLog_({
    userId: user.userId,
    action: 'updateHafalan',
    entity: 'Hafalan',
    entityId: payload.hafalanId,
    detail: JSON.stringify({
      surahSebelum: existing.surah,
      surahSesudah: patch.surah,
      rataRataSebelum: existing.rataRata,
      rataRataSesudah: rataRata
    })
  });

  return {
    message: 'Hafalan berhasil diperbarui',
    data: Object.assign({}, existing, patch, { hafalanId: payload.hafalanId })
  };
}

function getRekapHafalan(payload, user) {
  requireRole_(user, [ROLES_.SUPER_ADMIN, ROLES_.ADMIN, ROLES_.GURU_TAHFIDZ, ROLES_.WALI_KELAS, ROLES_.KEPALA_SEKOLAH, ROLES_.ORANG_TUA]);
  
  if (user.role === ROLES_.ORANG_TUA) {
    if (!user.siswaId) {
      throw new AppError_('Akun orang tua tidak terhubung dengan siswa', 403);
    }
    if (payload.siswaId && String(payload.siswaId) !== String(user.siswaId)) {
      throw new AppError_('Anda hanya dapat melihat data anak Anda sendiri', 403);
    }
    payload.siswaId = user.siswaId;
  }
  
  let items = getRows_(SHEETS_.HAFALAN);

  if (payload.kelasId) items = items.filter(function (item) { return String(item.kelasId) === String(payload.kelasId); });
  if (payload.siswaId) items = items.filter(function (item) { return String(item.siswaId) === String(payload.siswaId); });
  if (payload.juz) items = items.filter(function (item) { return Number(item.juz) === Number(payload.juz); });
  if (payload.statusHafalan) items = items.filter(function (item) { return String(item.statusHafalan) === String(payload.statusHafalan); });

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
