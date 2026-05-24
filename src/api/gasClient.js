const GAS_URL = import.meta.env.VITE_GAS_WEB_APP_URL;
const APP_TOKEN = import.meta.env.VITE_APP_API_TOKEN;

export async function gasRequest(action, payload = {}, token = '') {
  if (!GAS_URL) {
    throw new Error('VITE_GAS_WEB_APP_URL belum diatur');
  }

  if (!APP_TOKEN) {
    throw new Error('VITE_APP_API_TOKEN belum diatur');
  }

  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      appToken: APP_TOKEN,
      action,
      token,
      payload
    })
  });

  let result;

  try {
    result = await response.json();
  } catch (error) {
    throw new Error('Response backend bukan JSON valid');
  }

  if (!result.success) {
    throw new Error(result.message || 'Request gagal');
  }

  return result.data;
}
