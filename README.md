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

Token frontend dikirim ke Apps Script melalui body request sebagai `appToken`.

## Catatan Sistem Aplikasi

Gunakan catatan ini untuk mengecek semua tampilan sebelum deploy atau setelah ada perubahan fitur.

### Akun Test

Jika memakai setup awal Apps Script:

```txt
Email: admin@example.com
Password: admin123
Role: admin
```

### Tampilan Utama

| Halaman | URL | Yang Dicek |
|---|---|---|
| Login | `/login` | Form email/password, validasi kosong, login gagal, login berhasil |
| Dashboard | `/dashboard` | Ringkasan tampil, layout tidak pecah di desktop dan mobile |
| Siswa | `/siswa` | Tabel, filter, detail, tambah modal, edit modal, nonaktifkan |
| Kelas | `/kelas` | Tabel, filter, tambah modal, edit modal, nonaktifkan |
| Guru | `/guru` | Tabel, filter role, tambah modal, edit modal, nonaktifkan |
| Mapel | `/mapel` | Tabel, filter kelompok, tambah modal, edit modal, nonaktifkan |
| Input Nilai | `/nilai/input` | Filter kelas/mapel, tabel input nilai, validasi nilai 0-100, simpan |
| Rekap Nilai | `/nilai/rekap` | Placeholder tampil dan akses role sesuai |
| Input Hafalan | `/hafalan/input` | Form setoran, validasi nilai hafalan, simpan |
| Riwayat Hafalan | `/hafalan/riwayat` | Pencarian siswa ID dan tabel riwayat |
| Rekap Hafalan | `/hafalan/rekap` | Filter dan ringkasan hafalan |
| Laporan | `/laporan` | Tampilan laporan dan tombol cetak |
| Pengaturan | `/pengaturan` | Upload logo, preview logo, simpan ke Settings |

### Checklist UI

- Sidebar bisa dibuka dan ditutup di mobile.
- Semua tombol tambah membuka modal, bukan pindah halaman.
- Tombol edit membuka modal berisi data lama.
- Tombol batal dan tombol X menutup modal.
- Setelah simpan data, modal tertutup dan tabel reload.
- Toast sukses/error muncul sesuai aksi.
- State kosong tabel tampil rapi.
- Loading state tampil saat request berjalan.
- Error dari Apps Script tampil jelas.
- Form tidak melebar atau terpotong di layar mobile.

### Checklist Integrasi

- `VITE_GAS_WEB_APP_URL` di Vercel mengarah ke URL Apps Script `/exec`.
- `VITE_APP_API_TOKEN` di Vercel sama dengan `APP_API_TOKEN` di Script Properties.
- Apps Script sudah menjalankan `setupSpreadsheet()` minimal sekali.
- Sheet `Users`, `Siswa`, `Kelas`, `Guru`, `Mapel`, `Nilai`, `Hafalan`, `TahunAjaran`, `Settings`, `Sessions`, dan `Logs` sudah ada.
- Deploy Apps Script memakai akses Web App yang benar.
- Setelah mengubah env Vercel, lakukan redeploy.

## Deployment

1. Push ke GitHub.
2. Deploy frontend ke Vercel.
3. Deploy Apps Script sebagai Web App dari editor Google Apps Script.
4. Isi env Vercel dan `APP_API_TOKEN` di Script Properties.
5. Test login, input nilai, dan input hafalan.
