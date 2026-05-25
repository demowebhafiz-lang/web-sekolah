import { gasRequest } from '../../api/gasClient.js';
import { getSessionToken } from '../auth/authService.js';

export function getGuruList(filters = {}) {
  return gasRequest('getGuruList', cleanObject(filters), getSessionToken());
}

export function createGuru(payload) {
  return gasRequest('createGuru', normalizeGuru(payload), getSessionToken());
}

export function updateGuru(payload) {
  return gasRequest('updateGuru', normalizeGuru(payload), getSessionToken());
}

export function deleteGuru(guruId) {
  return gasRequest('deleteGuru', { guruId }, getSessionToken());
}

export function createGuruLoginAccount(payload) {
  return gasRequest('createGuruLoginAccount', payload, getSessionToken());
}

export function resetGuruPassword(guruId, newPassword) {
  return gasRequest('resetGuruPassword', { guruId, newPassword }, getSessionToken());
}

export function updateGuruLoginStatus(guruId, status) {
  return gasRequest('updateGuruLoginStatus', { guruId, status }, getSessionToken());
}

export function getGuruLoginInfo(guruId) {
  return gasRequest('getGuruLoginInfo', { guruId }, getSessionToken());
}

function normalizeGuru(payload) {
  const normalized = {
    guruId: clean(payload.guruId) || undefined,
    userId: clean(payload.userId) || undefined,
    nip: clean(payload.nip),
    namaGuru: clean(payload.namaGuru),
    email: clean(payload.email),
    noHp: clean(payload.noHp),
    jenisKelamin: clean(payload.jenisKelamin),
    jabatan: clean(payload.jabatan),
    roleGuru: clean(payload.roleGuru),
    status: payload.status || 'aktif'
  };

  if (payload.createLoginAccount && payload.loginAccount) {
    normalized.createLoginAccount = true;
    normalized.loginAccount = {
      email: clean(payload.loginAccount.email),
      password: clean(payload.loginAccount.password),
      role: clean(payload.loginAccount.role),
      status: payload.loginAccount.status || 'aktif'
    };
  }

  return normalized;
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
