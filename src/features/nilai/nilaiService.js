import { gasRequest } from '../../api/gasClient.js';
import { getSessionToken, getStoredUser } from '../auth/authService.js';

export function bulkSaveNilai(payload) {
  return gasRequest('bulkSaveNilai', normalizeNilaiPayload(payload), getSessionToken());
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
