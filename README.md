# Sistem Nilai Siswa dan Hafalan Al-Qur'an

Project web untuk mencatat nilai siswa/siswi dan progres hafalan Al-Qur'an.

## Stack

- React JS / Vite
- Google Apps Script
- Google Sheets
- Vercel
- GitHub

## Struktur

Source frontend berada langsung di root repository:

```txt
src/
  api/gasClient.js
  components/
  features/
public/
package.json
vite.config.js
```

Backend Google Apps Script dikelola langsung di editor Google Apps Script dan tidak disimpan di repository.

## Environment

Frontend Vercel:

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
VITE_APP_API_TOKEN=change_me
```

Apps Script Properties:

```txt
APP_API_TOKEN=change_me
```

Token frontend dikirim ke Apps Script melalui body request sebagai `appToken`, sesuai `docs/14_Revisi_Arsitektur_Vercel_AppsScript.md`.

## Dokumentasi

Lihat folder `docs/`.

## Deployment

1. Push ke GitHub.
2. Deploy frontend ke Vercel.
3. Deploy Apps Script sebagai Web App dari editor Google Apps Script.
4. Isi env Vercel dan `APP_API_TOKEN` di Script Properties.
5. Test login, input nilai, dan input hafalan.
