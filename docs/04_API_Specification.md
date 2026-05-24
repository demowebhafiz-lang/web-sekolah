# API Specification Google Apps Script

## 1. Base URL

Base URL diambil dari environment variable frontend:

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
VITE_APP_API_TOKEN=isi_token_rahasia_yang_sama_dengan_apps_script
```

## 2. Authentication antar Vercel dan Apps Script

Setiap request dari React ke Apps Script mengirim token aplikasi.

Header:

```txt
Content-Type: text/plain;charset=utf-8
x-app-token: <VITE_APP_API_TOKEN>
```

Catatan penting untuk Google Apps Script:

- Kadang request `application/json` memicu CORS/preflight.
- Untuk mengurangi masalah CORS, frontend dapat mengirim body JSON sebagai `text/plain`.
- Apps Script tetap melakukan `JSON.parse(e.postData.contents)`.

## 3. Format Request Standar

```json
{
  "action": "namaAction",
  "token": "optional_user_session_token",
  "payload": {}
}
```

## 4. Format Response Standar

Sukses:

```json
{
  "success": true,
  "message": "Berhasil",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Terjadi kesalahan",
  "errors": []
}
```

## 5. Contoh Frontend Client

```javascript
const GAS_URL = import.meta.env.VITE_GAS_WEB_APP_URL;
const APP_TOKEN = import.meta.env.VITE_APP_API_TOKEN;

export async function gasRequest(action, payload = {}, userToken = '') {
  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
      'x-app-token': APP_TOKEN
    },
    body: JSON.stringify({
      action,
      token: userToken,
      payload
    })
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Request gagal');
  }

  return result.data;
}
```

## 6. Contoh Entry Point Apps Script

```javascript
function doPost(e) {
  try {
    const appToken = getHeader_(e, 'x-app-token');
    validateAppToken_(appToken);

    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action;
    const payload = body.payload || {};
    const token = body.token || '';

    switch (action) {
      case 'login':
        return jsonResponse_(login(payload));

      case 'getSiswaList':
        requireSession_(token);
        return jsonResponse_(getSiswaList(payload));

      case 'createSiswa':
        requireRole_(token, ['admin', 'super_admin']);
        return jsonResponse_(createSiswa(payload));

      default:
        return jsonResponse_({
          success: false,
          message: 'Action tidak dikenal'
        });
    }
  } catch (err) {
    return jsonResponse_({
      success: false,
      message: err.message,
      errors: []
    });
  }
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getHeader_(e, key) {
  const headers = e && e.headers ? e.headers : {};
  return headers[key] || headers[key.toLowerCase()] || '';
}

function validateAppToken_(token) {
  const expected = PropertiesService.getScriptProperties().getProperty('APP_API_TOKEN');
  if (!expected || token !== expected) {
    throw new Error('Unauthorized app token');
  }
}
```

## 7. Daftar Action

## 7.1 Auth

### login

Request:

```json
{
  "action": "login",
  "payload": {
    "email": "admin@example.com",
    "password": "password123"
  }
}
```

Response:

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "USER_SESSION_TOKEN",
    "user": {
      "userId": "USR001",
      "nama": "Admin Sekolah",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### getProfile

Request:

```json
{
  "action": "getProfile",
  "token": "USER_SESSION_TOKEN",
  "payload": {}
}
```

## 7.2 Siswa

### getSiswaList

Request:

```json
{
  "action": "getSiswaList",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "kelasId": "KLS001",
    "status": "aktif",
    "keyword": "Ahmad",
    "page": 1,
    "limit": 50
  }
}
```

Response:

```json
{
  "success": true,
  "message": "Data siswa berhasil diambil",
  "data": {
    "items": [],
    "page": 1,
    "limit": 50,
    "total": 0
  }
}
```

### createSiswa

Request:

```json
{
  "action": "createSiswa",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "nis": "2026001",
    "namaLengkap": "Ahmad Fauzi",
    "jenisKelamin": "L",
    "kelasId": "KLS001",
    "namaOrangTua": "Bapak Abdullah",
    "noHpOrangTua": "08123456789",
    "alamat": "Jakarta"
  }
}
```

### updateSiswa

```json
{
  "action": "updateSiswa",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "siswaId": "SIS001",
    "namaLengkap": "Ahmad Fauzi",
    "kelasId": "KLS001"
  }
}
```

### deleteSiswa

Soft delete/nonaktif:

```json
{
  "action": "deleteSiswa",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "siswaId": "SIS001"
  }
}
```

## 7.3 Kelas

Actions:

```txt
getKelasList
createKelas
updateKelas
deleteKelas
```

Contoh createKelas:

```json
{
  "action": "createKelas",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "namaKelas": "1A",
    "tingkat": "1",
    "waliKelasId": "GR001",
    "tahunAjaran": "2026/2027",
    "status": "aktif"
  }
}
```

## 7.4 Guru

Actions:

```txt
getGuruList
createGuru
updateGuru
deleteGuru
```

## 7.5 Mapel

Actions:

```txt
getMapelList
createMapel
updateMapel
deleteMapel
```

## 7.6 Nilai

### getNilaiList

```json
{
  "action": "getNilaiList",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "kelasId": "KLS001",
    "mapelId": "MPL001",
    "semester": "Ganjil",
    "tahunAjaran": "2026/2027"
  }
}
```

### bulkSaveNilai

```json
{
  "action": "bulkSaveNilai",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "kelasId": "KLS001",
    "mapelId": "MPL001",
    "guruId": "GR001",
    "semester": "Ganjil",
    "tahunAjaran": "2026/2027",
    "jenisNilai": "harian",
    "items": [
      {
        "siswaId": "SIS001",
        "nilai": 85,
        "catatan": "Baik"
      }
    ]
  }
}
```

### getRekapNilai

```json
{
  "action": "getRekapNilai",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "kelasId": "KLS001",
    "semester": "Ganjil",
    "tahunAjaran": "2026/2027"
  }
}
```

## 7.7 Hafalan

### createHafalan

```json
{
  "action": "createHafalan",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "siswaId": "SIS001",
    "kelasId": "KLS001",
    "guruTahfidzId": "GR001",
    "juz": 30,
    "surah": "An-Naba",
    "nomorSurah": 78,
    "ayatAwal": 1,
    "ayatAkhir": 10,
    "tanggalSetor": "2026-05-23",
    "statusHafalan": "lancar",
    "nilaiKelancaran": 90,
    "nilaiTajwid": 85,
    "nilaiMakhraj": 88,
    "nilaiAdab": 95,
    "catatan": "Lancar"
  }
}
```

### getRiwayatHafalanSiswa

```json
{
  "action": "getRiwayatHafalanSiswa",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "siswaId": "SIS001"
  }
}
```

### getRekapHafalan

```json
{
  "action": "getRekapHafalan",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "kelasId": "KLS001",
    "statusHafalan": "lancar"
  }
}
```

## 7.8 Dashboard

### getDashboardSummary

```json
{
  "action": "getDashboardSummary",
  "token": "USER_SESSION_TOKEN",
  "payload": {
    "tahunAjaran": "2026/2027",
    "semester": "Ganjil"
  }
}
```

## 8. Validasi Backend Wajib

1. Cek `x-app-token`.
2. Cek user session token untuk action selain login.
3. Cek role untuk action sensitif.
4. Validasi payload.
5. Cek data referensi, misalnya siswaId harus ada.
6. Gunakan response error standar.
