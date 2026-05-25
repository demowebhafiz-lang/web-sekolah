import { gasRequest } from '../../api/gasClient.js';

const TOKEN_KEY = 'userToken';
const PROFILE_KEY = 'userProfile';

export async function login(email, password) {
  const data = await gasRequest('login', {
    email: email.trim(),
    password
  });

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data.user));

  return data.user;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

export function getSessionToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function getStoredUser() {
  const value = localStorage.getItem(PROFILE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    logout();
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getSessionToken() && getStoredUser());
}

export function getCurrentUser() {
  return getStoredUser();
}
