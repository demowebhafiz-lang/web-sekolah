# Dokumentasi Project: Sistem Nilai Siswa & Hafalan Al-Qur’an

Dokumentasi ini disiapkan untuk project web berbasis:

- Frontend: React JS / Vite
- Backend: Google Apps Script Web App
- Database awal: Google Sheets
- Deployment frontend: Vercel
- Source code: GitHub
- Konfigurasi rahasia: Vercel Environment Variables

## Daftar Dokumen

1. [PRD](./01_PRD.md)
2. [SRS / Spesifikasi Kebutuhan Sistem](./02_SRS.md)
3. [ERD dan Struktur Google Sheets](./03_ERD_Google_Sheets.md)
4. [API Specification Google Apps Script](./04_API_Specification.md)
5. [UI UX Wireframe](./05_UI_UX_Wireframe.md)
6. [User Flow](./06_User_Flow.md)
7. [Technical Design Document](./07_Technical_Design_Document.md)
8. [Development Backlog](./08_Backlog_Development.md)
9. [Test Case dan QA Checklist](./09_Test_Case_QA_Checklist.md)
10. [Deployment Guide GitHub Vercel Apps Script](./10_Deployment_Guide.md)
11. [User Manual](./11_User_Manual.md)
12. [Security dan Environment Variables](./12_Security_Env.md)

## Target Arsitektur

```txt
User Browser
   |
   v
React App on Vercel
   |
   | HTTPS Request
   | Header: x-app-token
   | Body: { action, payload }
   v
Google Apps Script Web App
   |
   v
Google Sheets Database
```

## Catatan Penting

Jangan menyimpan URL Apps Script, token, Spreadsheet ID, atau secret lain langsung di source code public GitHub.

Gunakan environment variable Vercel:

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
VITE_APP_API_TOKEN=isi_token_rahasia
```

Pada Google Apps Script, simpan token yang sama di Script Properties:

```txt
APP_API_TOKEN=isi_token_rahasia
SPREADSHEET_ID=id_spreadsheet_database
```

## Rekomendasi Struktur Repository

```txt
nilai-hafalan-app/
  docs/
  frontend/
    src/
    .env.example
    package.json
  apps-script/
    Code.gs
    Auth.gs
    Sheets.gs
    Nilai.gs
    Hafalan.gs
    appsscript.json
  README.md
```
