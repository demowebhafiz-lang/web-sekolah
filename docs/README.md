# Catatan Sistem Aplikasi

File ini dipertahankan sebagai README ringkas. File dokumen detail tidak disimpan di repository public.

## Stack

- Frontend: React JS / Vite
- Backend: Google Apps Script Web App
- Database: Google Sheets
- Deploy frontend: Vercel
- Source code: GitHub

## Alur Sistem

```txt
User Browser
React App on Vercel
Google Apps Script Web App
Google Sheets Database
```

## Tampilan Yang Dicek

- Login
- Dashboard
- Siswa
- Kelas
- Guru
- Mapel
- Input Nilai
- Rekap Nilai
- Input Hafalan
- Riwayat Hafalan
- Rekap Hafalan
- Laporan
- Pengaturan

## Catatan Penting

- Jangan simpan token asli di source code.
- Simpan env frontend di Vercel.
- Simpan token backend di Apps Script Properties.
- Jalankan `setupSpreadsheet()` setelah membuat Apps Script baru.
