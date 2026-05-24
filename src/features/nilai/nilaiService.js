import { gasRequest } from '../../api/gasClient.js';
import { getSessionToken, getStoredUser } from '../auth/authService.js';

export function bulkSaveNilai(payload) {
  return gasRequest('bulkSaveNilai', normalizeNilaiPayload(payload), getSessionToken());
}

export function getRekapNilai(filters = {}) {
  return gasRequest('getRekapNilai', cleanObject(filters), getSessionToken());
}

function normalizeNilaiPayload(payload) {
  const user = getStoredUser();

  return {
    kelasId: clean(payload.kelasId),
    mapelId: clean(payload.mapelId),
    guruId: clean(payload.guruId || user?.guruId),
    semester: payload.semester,
    tahunAjaran: clean(payload.tahunAjaran),
    jenisNilai: payload.jenisNilai,
    items: payload.items.map((item) => ({
      siswaId: clean(item.siswaId),
      nilai: Number(item.nilai),
      catatan: clean(item.catatan)
    }))
  };
}

function clean(value) {
  return String(value ?? '').trim();
}

function cleanObject(object) {
  return Object.fromEntries(
    Object.entries(object)
      .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
      .filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );
}
