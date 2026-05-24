import { gasRequest } from '../../api/gasClient.js';
import { getSessionToken } from '../auth/authService.js';

export function getSiswaList(filters = {}) {
  return gasRequest('getSiswaList', normalizeFilters(filters), getSessionToken());
}

export function createSiswa(payload) {
  return gasRequest('createSiswa', normalizeSiswaPayload(payload), getSessionToken());
}

export function updateSiswa(payload) {
  return gasRequest('updateSiswa', normalizeSiswaPayload(payload), getSessionToken());
}

export function deleteSiswa(siswaId) {
  return gasRequest('deleteSiswa', { siswaId }, getSessionToken());
}

export function uploadSiswaPhoto(payload) {
  return gasRequest('uploadSiswaPhoto', normalizePhotoPayload(payload), getSessionToken());
}

export function deleteSiswaPhoto(siswaId) {
  return gasRequest('deleteSiswaPhoto', { siswaId }, getSessionToken());
}

function normalizeFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters)
      .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
      .filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );
}

function normalizeSiswaPayload(payload) {
  return {
    siswaId: clean(payload.siswaId) || undefined,
    nis: clean(payload.nis),
    nisn: clean(payload.nisn),
    namaLengkap: clean(payload.namaLengkap),
    jenisKelamin: payload.jenisKelamin,
    tempatLahir: clean(payload.tempatLahir),
    tanggalLahir: payload.tanggalLahir,
    kelasId: clean(payload.kelasId),
    namaAyah: clean(payload.namaAyah),
    namaIbu: clean(payload.namaIbu),
    namaWali: clean(payload.namaWali),
    namaOrangTua: clean(payload.namaOrangTua),
    noHpOrangTua: clean(payload.noHpOrangTua),
    alamat: clean(payload.alamat),
    status: payload.status,
    fotoFileId: clean(payload.fotoFileId) || undefined,
    fotoUrl: clean(payload.fotoUrl) || undefined
  };
}

function normalizePhotoPayload(payload) {
  return {
    siswaId: clean(payload.siswaId),
    fileName: clean(payload.fileName),
    mimeType: clean(payload.mimeType),
    base64: payload.base64
  };
}

function clean(value) {
  return String(value ?? '').trim();
}
