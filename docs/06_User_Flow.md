# User Flow

## 1. Flow Login

```txt
Buka aplikasi
  -> Input email dan password
  -> Klik Masuk
  -> Frontend kirim action login ke Apps Script
  -> Apps Script validasi user
  -> Jika berhasil, response token dan profil
  -> Frontend simpan session
  -> Redirect ke dashboard sesuai role
```

Error:

```txt
Password salah -> tampilkan pesan error
User nonaktif -> tampilkan pesan hubungi admin
Backend gagal -> tampilkan pesan koneksi gagal
```

## 2. Flow Tambah Siswa

```txt
Admin login
  -> Menu Data Master
  -> Siswa
  -> Klik Tambah
  -> Isi form
  -> Klik Simpan
  -> Frontend validasi dasar
  -> Apps Script validasi final
  -> Simpan ke sheet Siswa
  -> Tampilkan notifikasi berhasil
  -> Kembali ke daftar siswa
```

## 3. Flow Input Nilai

```txt
Guru mapel login
  -> Menu Nilai
  -> Input Nilai
  -> Pilih kelas
  -> Pilih mapel
  -> Pilih semester
  -> Pilih tahun ajaran
  -> Pilih jenis nilai
  -> Klik Tampilkan Siswa
  -> Sistem mengambil siswa aktif di kelas tersebut
  -> Guru input nilai dan catatan
  -> Klik Simpan Semua Nilai
  -> Sistem validasi nilai 0-100
  -> Apps Script menjalankan batchSaveNilai
  -> Data disimpan/update di sheet Nilai
  -> Log aktivitas dicatat
  -> Notifikasi berhasil
```

## 4. Flow Rekap Nilai

```txt
User berwenang login
  -> Menu Nilai
  -> Rekap Nilai
  -> Pilih filter
  -> Klik Tampilkan
  -> Sistem ambil data nilai
  -> Sistem hitung rata-rata
  -> Tampilkan tabel
  -> User dapat klik Cetak
```

## 5. Flow Input Hafalan

```txt
Guru tahfidz login
  -> Menu Hafalan
  -> Input Hafalan
  -> Pilih kelas
  -> Pilih siswa
  -> Isi juz, surah, ayat awal, ayat akhir
  -> Isi tanggal setor dan status
  -> Isi nilai kelancaran, tajwid, makhraj, adab
  -> Sistem hitung rata-rata otomatis
  -> Isi catatan
  -> Klik Simpan
  -> Apps Script validasi data
  -> Data disimpan ke sheet Hafalan
  -> Riwayat hafalan siswa diperbarui
  -> Notifikasi berhasil
```

## 6. Flow Riwayat Hafalan

```txt
Guru/Wali kelas login
  -> Menu Hafalan
  -> Riwayat Hafalan
  -> Pilih kelas dan siswa
  -> Sistem ambil data hafalan siswa
  -> Tampilkan urutan tanggal setor terbaru
```

## 7. Flow Laporan Siswa

```txt
Wali kelas/Admin login
  -> Menu Laporan
  -> Pilih siswa
  -> Pilih tahun ajaran dan semester
  -> Sistem ambil nilai dan hafalan
  -> Tampilkan laporan
  -> Klik Cetak
  -> Browser print / save as PDF
```

## 8. Flow Deploy Development

```txt
Developer push code ke GitHub
  -> Vercel auto deploy frontend
  -> Vercel membaca .env production
  -> Frontend request ke Apps Script Web App
  -> Apps Script cek APP_API_TOKEN dari Script Properties
  -> Apps Script baca/tulis Google Sheets
```

## 9. Flow Update Backend Apps Script

```txt
Developer edit Code.gs
  -> Deploy new version di Apps Script
  -> Pastikan URL deployment tetap atau update Vercel env jika berubah
  -> Test API login
  -> Test input nilai
  -> Test input hafalan
```
