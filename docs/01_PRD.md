# PRD: Sistem Pencatatan Nilai Siswa/Siswi dan Hafalan Al-Qur’an

## 1. Ringkasan Produk

Aplikasi web ini digunakan oleh sekolah, madrasah, TPQ, atau rumah tahfidz untuk mencatat nilai akademik siswa/siswi dan progres hafalan Al-Qur’an.

Frontend menggunakan React JS. Backend menggunakan Google Apps Script. Database awal menggunakan Google Sheets.

## 2. Tujuan Produk

1. Memudahkan guru mencatat nilai siswa/siswi.
2. Memudahkan guru tahfidz mencatat progres hafalan Al-Qur’an.
3. Menyediakan rekap nilai dan hafalan.
4. Mengurangi pencatatan manual di banyak spreadsheet.
5. Menyediakan laporan siswa yang dapat dicetak.
6. Menyediakan sistem hemat biaya dan mudah dideploy.

## 3. Target Pengguna

| Pengguna | Kebutuhan |
|---|---|
| Admin | Mengelola data master |
| Guru Mapel | Input dan melihat nilai |
| Guru Tahfidz | Input dan melihat hafalan |
| Wali Kelas | Melihat rekap kelas |
| Kepala Sekolah | Melihat dashboard dan laporan |
| Orang Tua | Melihat laporan anak, opsional fase lanjut |

## 4. Masalah yang Diselesaikan

1. Data nilai dan hafalan tercecer.
2. Rekap manual memakan waktu.
3. Progres hafalan sulit dilacak.
4. Format pencatatan guru tidak seragam.
5. Laporan perkembangan siswa sulit dibuat cepat.

## 5. Ruang Lingkup MVP

1. Login sederhana.
2. Role-based access.
3. CRUD siswa.
4. CRUD kelas.
5. CRUD guru.
6. CRUD mata pelajaran.
7. Input nilai massal.
8. Rekap nilai.
9. Input hafalan.
10. Riwayat dan rekap hafalan.
11. Dashboard sederhana.
12. Cetak laporan.

## 6. Fitur di Luar MVP

1. Pembayaran SPP.
2. Absensi lengkap.
3. Mobile app native.
4. Notifikasi WhatsApp otomatis.
5. Integrasi e-Rapor.
6. Multi-cabang kompleks.

## 7. Modul Utama

### 7.1 Auth

User login dengan email dan password. Setelah login, frontend menyimpan session token atau data user di localStorage.

### 7.2 Data Siswa

Admin dapat menambah, mengedit, menonaktifkan, mencari, dan memfilter siswa.

### 7.3 Data Kelas

Admin dapat membuat kelas dan menetapkan wali kelas.

### 7.4 Data Guru

Admin dapat mengelola guru mapel, guru tahfidz, wali kelas, dan kepala sekolah.

### 7.5 Data Mata Pelajaran

Admin mengelola mata pelajaran dan guru pengampu.

### 7.6 Nilai Akademik

Guru dapat input nilai berdasarkan kelas, mapel, semester, tahun ajaran, dan jenis nilai.

Jenis nilai:

- Harian
- Tugas
- Praktik
- PTS
- PAS

### 7.7 Hafalan Al-Qur’an

Guru tahfidz mencatat:

- Juz
- Surah
- Ayat awal
- Ayat akhir
- Tanggal setor
- Status hafalan
- Nilai kelancaran
- Nilai tajwid
- Nilai makhraj
- Nilai adab
- Catatan

### 7.8 Laporan

Laporan dapat difilter berdasarkan kelas, siswa, semester, tahun ajaran, mapel, juz, atau status hafalan.

## 8. Success Metrics

1. Guru dapat input nilai dalam satu halaman tabel.
2. Guru tahfidz dapat melihat riwayat hafalan siswa.
3. Admin dapat mengelola data master tanpa menyentuh sheet langsung.
4. Wali kelas dapat mencetak laporan.
5. Data tersimpan di Google Sheets dengan format konsisten.

## 9. Roadmap

### Fase 1

- Setup React
- Setup Apps Script
- Setup Google Sheets
- Login
- Data master
- Input nilai
- Input hafalan

### Fase 2

- Dashboard
- Rekap lanjutan
- Cetak laporan
- Export PDF

### Fase 3

- Portal orang tua
- Notifikasi
- Absensi
- Statistik lanjutan
