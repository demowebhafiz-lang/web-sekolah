export const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp';
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function validateImageFile(file, maxBytes = IMAGE_MAX_BYTES) {
  if (!file) {
    return 'File gambar wajib dipilih.';
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Format gambar harus jpg, jpeg, png, atau webp.';
  }

  if (file.size > maxBytes) {
    return `Ukuran gambar maksimal ${formatBytes(maxBytes)}.`;
  }

  return '';
}

export function fileToBase64Payload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve({
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        base64
      });
    };

    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}

export function getInitials(name = '') {
  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return 'S';
  }

  return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase();
}

function formatBytes(bytes) {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}
