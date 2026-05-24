import { gasRequest } from '../../api/gasClient.js';
import { getSessionToken, getStoredUser } from '../auth/authService.js';

export function createHafalan(payload) {
  return gasRequest('createHafalan', normalizeHafalanPayload(payload), getSessionToken());
}

export function getRiwayatHafalanSiswa(payload) {
  return gasRequest('getRiwayatHafalanSiswa', { siswaId: clean(payload.siswaId) }, getSessionToken());
}

export function getRekapHafalan(filters = {}) {
  return gasRequest('getRekapHafalan', normalizeFilters(filters), getSessionToken());
}

function normalizeHafalanPayload(payload) {
  const user = getStoredUser();

  return {
    siswaId: clean(payload.siswaId),
    kelasId: clean(payload.kelasId),
    guruTahfidzId: clean(payload.guruTahfidzId || user?.guruId),
    juz: Number(payload.juz),
    surah: clean(payload.surah),
    nomorSurah: Number(payload.nomorSurah),
    ayatAwal: Number(payload.ayatAwal),
    ayatAkhir: Number(payload.ayatAkhir),
    tanggalSetor: payload.tanggalSetor,
    statusHafalan: payload.statusHafalan,
    nilaiKelancaran: Number(payload.nilaiKelancaran),
    nilaiTajwid: Number(payload.nilaiTajwid),
    nilaiMakhraj: Number(payload.nilaiMakhraj),
    nilaiAdab: Number(payload.nilaiAdab),
    catatan: clean(payload.catatan)
  };
}

function normalizeFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters)
      .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
      .filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );
}

function clean(value) {
  return String(value ?? '').trim();
}
