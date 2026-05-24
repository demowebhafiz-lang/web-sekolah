import { gasRequest } from '../../api/gasClient.js';
import { getSessionToken } from '../auth/authService.js';

export function getMapelList(filters = {}) {
  return gasRequest('getMapelList', cleanObject(filters), getSessionToken());
}

export function createMapel(payload) {
  return gasRequest('createMapel', normalizeMapel(payload), getSessionToken());
}

export function updateMapel(payload) {
  return gasRequest('updateMapel', normalizeMapel(payload), getSessionToken());
}

export function deleteMapel(mapelId) {
  return gasRequest('deleteMapel', { mapelId }, getSessionToken());
}

function normalizeMapel(payload) {
  return {
    mapelId: clean(payload.mapelId) || undefined,
    namaMapel: clean(payload.namaMapel),
    kelompok: clean(payload.kelompok),
    guruId: clean(payload.guruId),
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
