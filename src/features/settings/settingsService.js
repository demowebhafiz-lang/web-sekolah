import { gasRequest } from '../../api/gasClient.js';
import { getSessionToken } from '../auth/authService.js';

const SETTINGS_KEY = 'schoolSettings';

export function getStoredSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

export async function getAppSettings() {
  let settings;

  try {
    settings = await gasRequest('getAppSettings');
  } catch (error) {
    settings = await gasRequest('getPublicSettings');
  }

  storeSettings(settings || {});
  return settings || {};
}

export const getPublicSettings = getAppSettings;

export async function uploadSchoolLogo(logo) {
  const settings = await gasRequest('uploadSchoolLogo', { logo }, getSessionToken());
  storeSettings(settings || {});
  window.dispatchEvent(new CustomEvent('school-settings-updated', { detail: settings || {} }));
  return settings || {};
}

function storeSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings || {}));
}
