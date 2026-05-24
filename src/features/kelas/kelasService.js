import { gasRequest } from '../../api/gasClient.js';
import { getSessionToken } from '../auth/authService.js';

export function getKelasList(filters = {}) {
  return gasRequest('getKelasList', cleanObject(filters), getSessionToken());
}

export function createKelas(payload) {
  return gasRequest('createKelas', normalizeKelas(payload), getSessionToken());
}

export function updateKelas(payload) {
  return gasRequest('updateKelas', normalizeKelas(payload), getSessionToken());
}

export function deleteKelas(kelasId) {
  return gasRequest('deleteKelas', { kelasId }, getSessionToken());
}

function normalizeKelas(payload) {
  return {
    kelasId: clean(payload.kelasId) || undefined,
    namaKelas: clean(payload.namaKelas),
    tingkat: clean(payload.tingkat),
    waliKelasId: clean(payload.waliKelasId),
    tahunAjaran: clean(payload.tahunAjaran),
    status: payload.status || 'aktif'
  };
}

function cleanObject(object) {
  return Object.fromEntries(
    Object.entries(object)
      .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
      .filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );
}

function clean(value) {
  return String(value ?? '').trim();
}
