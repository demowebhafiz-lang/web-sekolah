# Upload Logo Sekolah dan Foto Siswa

## 1. Tujuan

Dokumen ini menjelaskan fitur upload:

1. Logo sekolah.
2. Foto siswa.
3. Penyimpanan gambar ke Google Drive.
4. Penyimpanan `fileId` dan `fileUrl` ke Google Sheets.
5. Penampilan logo/foto di frontend React.

## 2. Prinsip Utama

Jangan menyimpan gambar langsung di Google Sheets.

Gunakan pola:

```txt
React pilih file
  -> validasi file
  -> convert ke base64
  -> kirim ke Google Apps Script
  -> Apps Script upload ke Google Drive
  -> Apps Script simpan fileId/fileUrl ke Google Sheets
  -> React tampilkan gambar dari fileUrl
```

Google Sheets hanya menyimpan:

```txt
fotoFileId
fotoUrl
schoolLogoFileId
schoolLogoUrl
```

## 3. Arsitektur

```txt
User Browser
  -> React di Vercel
  -> Google Apps Script Web App
  -> Google Drive untuk file gambar
  -> Google Sheets untuk data fileId/fileUrl
```

## 4. Google Drive

Buat folder Drive:

```txt
Nilai Hafalan Assets/
  logos/
  siswa/
```

Tambahkan Script Properties di Apps Script:

```txt
APP_API_TOKEN=token_rahasia
DRIVE_ASSETS_FOLDER_ID=id_folder_google_drive
```

Catatan:

- Tetap tidak perlu `SPREADSHEET_ID`.
- Apps Script tetap memakai `SpreadsheetApp.getActiveSpreadsheet()`.
- `DRIVE_ASSETS_FOLDER_ID` hanya untuk folder penyimpanan gambar.

## 5. Sheet Settings

Buat sheet:

```txt
Settings
```

Header:

```txt
settingKey | settingValue | updatedAt
```

Contoh data:

```txt
schoolName | SD Islam Al-Falah | 2026-05-24T10:00:00.000Z
schoolAddress | Jl. Pendidikan No. 1 | 2026-05-24T10:00:00.000Z
schoolLogoFileId | 1abcxyz | 2026-05-24T10:00:00.000Z
schoolLogoUrl | https://drive.google.com/uc?export=view&id=1abcxyz | 2026-05-24T10:00:00.000Z
```

## 6. Sheet Siswa

Tambahkan kolom:

```txt
fotoFileId | fotoUrl
```

Header lengkap rekomendasi:

```txt
siswaId | nis | nisn | namaLengkap | jenisKelamin | tempatLahir | tanggalLahir | kelasId | namaOrangTua | noHpOrangTua | alamat | fotoFileId | fotoUrl | status | createdAt | updatedAt
```

## 7. Role Permission

| Fitur | Role |
|---|---|
| Upload logo sekolah | admin, super_admin |
| Update nama/alamat sekolah | admin, super_admin |
| Upload foto siswa | admin, super_admin |
| Hapus foto siswa | admin, super_admin |
| Lihat logo/foto | user login sesuai akses |

## 8. Validasi File

Tipe file yang diizinkan:

```txt
image/jpeg
image/jpg
image/png
image/webp
```

Ukuran maksimal:

```txt
Logo sekolah: 1 MB
Foto siswa: 2 MB
```

Aturan:

1. File wajib gambar.
2. File tidak boleh melebihi batas.
3. Base64 tidak boleh disimpan di Google Sheets.
4. Jika foto kosong, tampilkan avatar inisial siswa.

## 9. Action API Tambahan

Tambahkan action:

```txt
getAppSettings
updateAppSettings
uploadSchoolLogo
uploadSiswaPhoto
deleteSiswaPhoto
```

## 10. Contoh Request API

### getAppSettings

```json
{
  "appToken": "APP_API_TOKEN",
  "action": "getAppSettings",
  "token": "USER_SESSION_TOKEN",
  "payload": {}
}
```

### updateAppSettings

```json
{
  "appToken": "APP_API_TOKEN",
  "action": "updateAppSettings",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "schoolName": "SD Islam Al-Falah",
    "schoolAddress": "Jl. Pendidikan No. 1"
  }
}
```

### uploadSchoolLogo

```json
{
  "appToken": "APP_API_TOKEN",
  "action": "uploadSchoolLogo",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "fileName": "logo.png",
    "mimeType": "image/png",
    "base64": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```

### uploadSiswaPhoto

```json
{
  "appToken": "APP_API_TOKEN",
  "action": "uploadSiswaPhoto",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "siswaId": "SIS001",
    "fileName": "foto-ahmad.png",
    "mimeType": "image/png",
    "base64": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```

### deleteSiswaPhoto

```json
{
  "appToken": "APP_API_TOKEN",
  "action": "deleteSiswaPhoto",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "siswaId": "SIS001"
  }
}
```

## 11. UI Pengaturan Sekolah

Tambahkan halaman:

```txt
Pengaturan Sekolah
```

Isi:

```txt
Nama Sekolah
[________________________]

Alamat Sekolah
[________________________]

Logo Sekolah
[Preview Logo]
[Upload Logo]
[Hapus/Ganti Logo]

[Simpan Pengaturan]
```

Logo tampil di:

1. Login Page.
2. Sidebar.
3. Topbar.
4. Laporan cetak.

Jika logo belum ada, tampilkan fallback icon `BookOpen`, `GraduationCap`, atau `School`.

## 12. UI Foto Siswa

Di form tambah/edit siswa, tambahkan:

```txt
Foto Siswa
[Preview Foto]
[Upload Foto]
[Hapus Foto]
```

Foto siswa tampil di:

1. Detail siswa.
2. Form edit siswa.
3. Profil siswa.
4. Laporan siswa.
5. Daftar siswa opsional.

Jika foto kosong, tampil avatar inisial:

```txt
Ahmad Fauzi -> AF
Siti Aisyah -> SA
```

## 13. Frontend Helper File ke Base64

Buat:

```txt
src/utils/fileToBase64.js
```

```javascript
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('File tidak ditemukan'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file'));
    };

    reader.readAsDataURL(file);
  });
}
```

## 14. Frontend Helper Validasi Gambar

Buat:

```txt
src/utils/validateImageFile.js
```

```javascript
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function validateImageFile(file, maxSizeMb = 2) {
  if (!file) {
    throw new Error('File wajib dipilih');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File harus berupa JPG, PNG, atau WEBP');
  }

  const maxSize = maxSizeMb * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error(`Ukuran file maksimal ${maxSizeMb} MB`);
  }

  return true;
}
```

## 15. Frontend Service Settings

Buat:

```txt
src/features/settings/settingsService.js
```

```javascript
import { gasRequest } from '../../api/gasClient';

export function getAppSettings() {
  return gasRequest('getAppSettings');
}

export function updateAppSettings(payload) {
  return gasRequest('updateAppSettings', payload);
}

export function uploadSchoolLogo(payload) {
  return gasRequest('uploadSchoolLogo', payload);
}
```

Tambahkan di:

```txt
src/features/siswa/siswaService.js
```

```javascript
export function uploadSiswaPhoto(payload) {
  return gasRequest('uploadSiswaPhoto', payload);
}

export function deleteSiswaPhoto(siswaId) {
  return gasRequest('deleteSiswaPhoto', { siswaId });
}
```

## 16. Backend Apps Script: DriveUpload.gs

Tambahkan file di Google Apps Script editor:

```txt
DriveUpload.gs
```

```javascript
function getAssetsFolder_() {
  const folderId = PropertiesService
    .getScriptProperties()
    .getProperty('DRIVE_ASSETS_FOLDER_ID');

  if (!folderId) {
    throw new AppError_('DRIVE_ASSETS_FOLDER_ID belum dikonfigurasi', 500);
  }

  return DriveApp.getFolderById(folderId);
}

function createDriveFileFromBase64_(payload, subFolderName) {
  validateRequired_(payload, ['fileName', 'mimeType', 'base64']);
  validateImageMimeType_(payload.mimeType);

  const base64Data = String(payload.base64).split(',').pop();
  const bytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(bytes, payload.mimeType, payload.fileName);

  const parentFolder = getAssetsFolder_();
  const folder = getOrCreateSubFolder_(parentFolder, subFolderName);

  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    fileId: file.getId(),
    fileUrl: 'https://drive.google.com/uc?export=view&id=' + file.getId()
  };
}

function getOrCreateSubFolder_(parentFolder, name) {
  const folders = parentFolder.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parentFolder.createFolder(name);
}

function validateImageMimeType_(mimeType) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowed.includes(mimeType)) {
    throw new AppError_('File harus berupa JPG, PNG, atau WEBP', 400);
  }
}
```

## 17. Backend Apps Script: Settings.gs

Tambahkan:

```txt
Settings.gs
```

```javascript
function getAppSettings(payload, user) {
  const rows = getRows_(SHEETS_.SETTINGS);
  const settings = {};

  rows.forEach(function (item) {
    settings[item.settingKey] = item.settingValue;
  });

  return {
    message: 'Pengaturan berhasil diambil',
    data: settings
  };
}

function updateAppSettings(payload, user) {
  requireRole_(user, [ROLES_.ADMIN, ROLES_.SUPER_ADMIN]);

  const allowedKeys = ['schoolName', 'schoolAddress'];

  allowedKeys.forEach(function (key) {
    if (payload[key] !== undefined) {
      upsertSetting_(key, payload[key]);
    }
  });

  return {
    message: 'Pengaturan berhasil disimpan',
    data: {}
  };
}

function uploadSchoolLogo(payload, user) {
  requireRole_(user, [ROLES_.ADMIN, ROLES_.SUPER_ADMIN]);

  const result = createDriveFileFromBase64_(payload, 'logos');

  upsertSetting_('schoolLogoFileId', result.fileId);
  upsertSetting_('schoolLogoUrl', result.fileUrl);

  return {
    message: 'Logo berhasil diupload',
    data: result
  };
}

function upsertSetting_(key, value) {
  const sheet = getSheet_(SHEETS_.SETTINGS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];

  const keyIndex = headers.indexOf('settingKey');
  const valueIndex = headers.indexOf('settingValue');
  const updatedAtIndex = headers.indexOf('updatedAt');

  for (let i = 1; i < values.length; i++) {
    if (values[i][keyIndex] === key) {
      sheet.getRange(i + 1, valueIndex + 1).setValue(value);
      sheet.getRange(i + 1, updatedAtIndex + 1).setValue(new Date().toISOString());
      return;
    }
  }

  appendRow_(SHEETS_.SETTINGS, {
    settingKey: key,
    settingValue: value,
    updatedAt: new Date().toISOString()
  });
}
```

## 18. Backend Apps Script: Upload Foto Siswa

Tambahkan ke `Siswa.gs`:

```javascript
function uploadSiswaPhoto(payload, user) {
  requireRole_(user, [ROLES_.ADMIN, ROLES_.SUPER_ADMIN]);
  validateRequired_(payload, ['siswaId', 'fileName', 'mimeType', 'base64']);

  const result = createDriveFileFromBase64_(payload, 'siswa');

  updateRowById_(SHEETS_.SISWA, 'siswaId', payload.siswaId, {
    fotoFileId: result.fileId,
    fotoUrl: result.fileUrl,
    updatedAt: new Date().toISOString()
  });

  return {
    message: 'Foto siswa berhasil diupload',
    data: {
      siswaId: payload.siswaId,
      fotoFileId: result.fileId,
      fotoUrl: result.fileUrl
    }
  };
}

function deleteSiswaPhoto(payload, user) {
  requireRole_(user, [ROLES_.ADMIN, ROLES_.SUPER_ADMIN]);
  validateRequired_(payload, ['siswaId']);

  updateRowById_(SHEETS_.SISWA, 'siswaId', payload.siswaId, {
    fotoFileId: '',
    fotoUrl: '',
    updatedAt: new Date().toISOString()
  });

  return {
    message: 'Foto siswa berhasil dihapus',
    data: {
      siswaId: payload.siswaId
    }
  };
}
```

## 19. Config.gs Revisi

Tambahkan `SETTINGS`:

```javascript
const SHEETS_ = {
  USERS: 'Users',
  SISWA: 'Siswa',
  KELAS: 'Kelas',
  GURU: 'Guru',
  MAPEL: 'Mapel',
  NILAI: 'Nilai',
  HAFALAN: 'Hafalan',
  SETTINGS: 'Settings',
  TAHUN_AJARAN: 'TahunAjaran',
  SESSIONS: 'Sessions',
  LOGS: 'Logs'
};
```

## 20. Router.gs Revisi

Tambahkan routes:

```javascript
getAppSettings: getAppSettings,
updateAppSettings: updateAppSettings,
uploadSchoolLogo: uploadSchoolLogo,
uploadSiswaPhoto: uploadSiswaPhoto,
deleteSiswaPhoto: deleteSiswaPhoto,
```

## 21. Acceptance Criteria

- [ ] Admin bisa upload logo sekolah.
- [ ] Logo tersimpan ke Google Drive.
- [ ] `schoolLogoFileId` dan `schoolLogoUrl` tersimpan di sheet Settings.
- [ ] Logo tampil di Login Page, Sidebar, Topbar, dan Laporan.
- [ ] Admin bisa upload foto siswa.
- [ ] Foto siswa tersimpan ke Google Drive.
- [ ] `fotoFileId` dan `fotoUrl` tersimpan di sheet Siswa.
- [ ] Foto tampil di detail siswa, form edit siswa, dan laporan.
- [ ] Jika foto kosong, tampil avatar inisial.
- [ ] File selain gambar ditolak.
- [ ] File terlalu besar ditolak.
- [ ] Base64 tidak disimpan di Google Sheets.

## 22. Prompt untuk Codex / AI Coding

```txt
Baca semua file docs.

Tambahkan fitur upload logo sekolah dan foto siswa sesuai docs/16_Upload_Logo_Foto_Siswa.md.

Arsitektur final:
- Frontend React berada di GitHub dan deploy ke Vercel.
- Backend Google Apps Script tidak ikut GitHub.
- File .gs dibuat di luar repository atau hanya dalam bentuk kode untuk ditempel ke Apps Script editor.
- Jangan gunakan SPREADSHEET_ID.
- Gunakan SpreadsheetApp.getActiveSpreadsheet().
- APP_API_TOKEN dibaca dari Script Properties.
- DRIVE_ASSETS_FOLDER_ID dibaca dari Script Properties.
- appToken dikirim frontend lewat body request.
- Gambar disimpan ke Google Drive.
- Google Sheets hanya menyimpan fileId dan fileUrl.

Frontend:
1. Tambahkan halaman Pengaturan Sekolah.
2. Admin bisa edit nama sekolah dan alamat sekolah.
3. Admin bisa upload logo sekolah.
4. Logo tampil di Login Page, Sidebar, Topbar, dan Laporan.
5. Tambahkan upload foto siswa di form tambah/edit siswa.
6. Foto siswa tampil di detail siswa dan laporan.
7. Jika foto kosong, tampilkan avatar inisial.
8. Validasi file JPG, PNG, WEBP.
9. Batasi ukuran logo 1 MB dan foto siswa 2 MB.
10. Jangan simpan gambar di repository.

Backend Apps Script:
1. Tambahkan DriveUpload.gs.
2. Tambahkan Settings.gs.
3. Tambahkan action getAppSettings, updateAppSettings, uploadSchoolLogo.
4. Tambahkan action uploadSiswaPhoto dan deleteSiswaPhoto.
5. Tambahkan SETTINGS ke Config.gs.
6. Tambahkan routes baru ke Router.gs.
7. Tambahkan kolom fotoFileId dan fotoUrl ke sheet Siswa.
8. Tambahkan sheet Settings.
```

## 23. Step Implementasi

```txt
1. Tambahkan sheet Settings.
2. Tambahkan kolom fotoFileId dan fotoUrl di sheet Siswa.
3. Buat folder Google Drive untuk assets.
4. Simpan DRIVE_ASSETS_FOLDER_ID di Script Properties.
5. Tambahkan kode DriveUpload.gs di Apps Script.
6. Tambahkan kode Settings.gs.
7. Tambahkan action upload foto siswa.
8. Update Router.gs dan Config.gs.
9. Update frontend settings page.
10. Update form siswa.
11. Test upload logo.
12. Test upload foto siswa.
13. Test tampilan laporan.
```
