import { gasRequest } from '../../api/gasClient.js';
import { getSessionToken } from '../auth/authService.js';

const SETTINGS_KEY = 'schoolSettings';

export function getStoredSettings() {
  try {
    return normalizeSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'));
  } catch {
    return {};
  }
}

export async function getAppSettings() {
  let settings;

  try {
    settings = await gasRequest('getAppSettings', {}, getSessionToken());
  } catch (error) {
    settings = await gasRequest('getPublicSettings');
  }

  return setStoredSettings(settings || {});
}

export const getPublicSettings = getAppSettings;

export async function updateAppSettings(payload) {
  const currentSettings = getStoredSettings();
  const result = await gasRequest('updateAppSettings', cleanSettingsPayload(payload), getSessionToken());
  return setStoredSettings({
    ...currentSettings,
    ...cleanSettingsPayload(payload),
    ...(result || {})
  });
}

export async function uploadSchoolLogo(payload) {
  const currentSettings = getStoredSettings();
  const result = await gasRequest('uploadSchoolLogo', payload, getSessionToken());
  return setStoredSettings({
    ...currentSettings,
    schoolLogoFileId: result?.schoolLogoFileId || result?.fileId || currentSettings.schoolLogoFileId,
    schoolLogoUrl: result?.schoolLogoUrl || result?.fileUrl || result?.logoUrl || currentSettings.schoolLogoUrl,
    ...(result || {})
  });
}

export function setStoredSettings(settings) {
  const normalized = normalizeSettings(settings || {});
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent('school-settings-updated', { detail: normalized }));
  return normalized;
}

export async function refreshSchoolSettings() {
  return getAppSettings();
}

function normalizeSettings(settings) {
  return {
    ...settings,
    schoolName: settings.schoolName || settings.namaSekolah || '',
    schoolAddress: settings.schoolAddress || settings.alamatSekolah || '',
    schoolLogoFileId: settings.schoolLogoFileId || settings.logoFileId || '',
    schoolLogoUrl: settings.schoolLogoUrl || settings.logoUrl || settings.fileUrl || ''
  };
}

function cleanSettingsPayload(payload) {
  return {
    schoolName: String(payload.schoolName || '').trim(),
    schoolAddress: String(payload.schoolAddress || '').trim()
  };
}
